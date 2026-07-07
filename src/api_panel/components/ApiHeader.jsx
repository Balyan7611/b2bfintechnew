import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  toggleDarkMode,
  toggleProfileDropdown,
  setProfileDropdown,
  toggleSidebar,
  toggleMailOpen,
  toggleNotifOpen,
  setMailOpen,
  setNotifOpen,
  markAllMailRead,
  markAllNotifRead,
  setUpgradePopup,
  clearAllNotifications,
  addNotification,
  syncNotifications
} from '../../store/slices/memberPanelSlice';
import {
  FaBars, FaMoon, FaSun, FaExpand,
  FaEnvelope, FaBell, FaChartBar, FaHeadset, FaPowerOff, FaWallet,
  FaUser, FaEdit, FaHistory, FaMobileAlt, FaCog, FaCertificate, FaBullhorn, FaCommentDots, FaPaperclip
} from 'react-icons/fa';
import { 
  FiX, FiChevronRight, FiChevronLeft, FiShoppingBag, FiUsers, FiCheckCircle, FiFileText, FiStar, FiSearch 
} from 'react-icons/fi';
import { MdAttachMoney } from 'react-icons/md';
import { SITE_CONFIG } from '../../config/siteConfig';
import { requestForToken, setupForegroundListener } from '../../firebase';
import styles from './ApiHeader.module.css';

const ApiHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mailRef = useRef(null);
  const notifRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const searchItems = [];
  const filteredSearchItems = [];

  const { 
    isDarkMode, user, isProfileDropdownOpen, isMobile, isSidebarOpen,
    isMailOpen, isNotifOpen, unreadMail, unreadNotif,
    mailList, notifList, apiWallets
  } = useSelector((state) => state.memberPanel);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    dispatch(setProfileDropdown(false));
  };

  const confirmLogout = () => {
    navigate('/api/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    dispatch(setProfileDropdown(false));
  };

  useEffect(() => {
    // 1. Request Firebase Push Notification Permission
    requestForToken();

    // 2. Listen for Real-Time Foreground Messages from Firebase
    const unsubscribe = setupForegroundListener((payload) => {
      // When a real message comes from FCM, push it to our local state so the bell rings!
      dispatch(addNotification({
        title: payload.notification?.title || 'New Push Broadcast',
        text: payload.notification?.body || 'You have a new message.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }));
    });

    // 3. Listen to LocalStorage across tabs for Live Prototype Sync
    const handleStorageChange = (e) => {
      if (e.key === 'local_notifications') {
        const newNotifs = JSON.parse(e.newValue || '[]');
        dispatch(syncNotifications(newNotifs));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(setProfileDropdown(false));
      }
      if (mailRef.current && !mailRef.current.contains(event.target)) {
        dispatch(setMailOpen(false));
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        dispatch(setNotifOpen(false));
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        dispatch(setProfileDropdown(false));
        dispatch(setMailOpen(false));
        dispatch(setNotifOpen(false));
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('storage', handleStorageChange);
      if (unsubscribe) unsubscribe(); // cleanup Firebase listener
    };
  }, [dispatch]);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'broadcast': return <FaCommentDots />;
      case 'order': return <FiShoppingBag />;
      case 'reg': return <FiUsers />;
      case 'approved': return <FiCheckCircle />;
      case 'files': return <FiFileText />;
      case 'review': return <FiStar />;
      default: return <FaBell />;
    }
  };

  const walletData = [
    { name: 'AEPS WALLET', value: '320242.53', color: '#10B981' },
    { name: 'MAIN WALLET', value: '111379.00', color: 'var(--color-primary)' },
    { name: 'PROFIT WALLET', value: '0.00', color: '#F59E0B' }
  ];

  return (
    <>
    <header className={`${styles.header} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.left}>
        {isMobile ? (
          <button className={styles.hamburgerBtn} onClick={() => dispatch(toggleSidebar())}>
            <FaBars />
          </button>
        ) : (
          <button 
            className={styles.desktopToggleBtn} 
            onClick={() => dispatch(toggleSidebar())}
          >
            {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        )}
        <img 
          src="/images/browser_logo.jpeg" 
          alt={SITE_CONFIG.shortName} 
          className={styles.headerLogo} 
        />
      </div>

      <div className={styles.center}>
        {!isMobile && (
          <div className={styles.searchBar} ref={searchRef}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for services, reports..." 
              className={styles.searchInput} 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
            />
            
            {showSearchResults && searchQuery && (
              <div className={styles.searchDropdown}>
                {filteredSearchItems.length > 0 ? (
                  filteredSearchItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={styles.searchResultItem}
                      onClick={() => {
                        navigate(item.path);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      <FiSearch style={{ color: '#A0AEC0', marginRight: '10px' }} />
                      <span style={{ fontSize: '0.85rem', color: '#0D1B3E', fontWeight: 500 }}>{item.name}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#718096', fontSize: '0.85rem' }}>
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.right}>
        {/* Main Wallet Card placed on Right Side */}
        {!isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#ffffff',
            border: '1px solid #dbeafe',
            padding: '4px 12px', borderRadius: '8px', marginRight: '16px',
            transition: 'all 0.2s ease', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(26, 35, 126, 0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'; }}
          onClick={() => handleNavigate('/api/dashboard/wallet/main')}
          >
            <FaWallet style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MAIN WALLET</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                {parseFloat(apiWallets?.main || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}
              </span>
            </div>
          </div>
        )}

        <div className={styles.verticalDivider}></div>

        <div className={styles.actionIcons}>
          <button className={`${styles.iconBtn} ${styles.mobileHide}`} onClick={handleFullscreen}>
            <FaExpand />
          </button>

          {!isMobile && (
            <div className={styles.dropdownWrap} ref={mailRef}>
              <button className={styles.iconBtn} onClick={() => dispatch(toggleMailOpen())}>
                <FaEnvelope />
                {unreadMail > 0 && <span className={styles.badge}>{unreadMail}</span>}
              </button>
              {isMailOpen && (
                <div className={styles.msgDropdown}>
                  <div className={styles.dropdownTopPointer}></div>
                  <div className={styles.msgHeader}>
                    <span className={styles.msgTitle}>{unreadMail} new Messages</span>
                    <button className={styles.markReadBtn} onClick={() => dispatch(markAllMailRead())}>
                      Mark All Read
                    </button>
                  </div>
                  <div className={styles.msgList}>
                    {mailList.map((mail) => (
                      <div key={mail.id} className={styles.msgItem}>
                        <div className={styles.msgAvatar} style={{ background: mail.color }}>
                          {mail.initial}
                          <span className={styles.onlineDot}></span>
                        </div>
                        <div className={styles.msgBody}>
                          <div className={styles.msgTop}>
                            <span className={styles.msgName}>{mail.name}</span>
                            <span className={styles.msgTime}>{mail.time}</span>
                          </div>
                          <p className={styles.msgPreview}>{mail.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.msgFooter}>
                    <span className={styles.viewAllText}>VIEW ALL</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button className={`${styles.iconBtn} ${styles.mobileHide}`} onClick={() => dispatch(toggleDarkMode())}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <div className={styles.dropdownWrap} ref={notifRef}>
            <button className={styles.iconBtn} onClick={() => {
              dispatch(toggleNotifOpen());
              if (!isNotifOpen && unreadNotif > 0) {
                dispatch(markAllNotifRead());
              }
            }}>
              <div className={`${styles.bellIconWrapper} ${unreadNotif > 0 ? styles.ringing : ''}`}>
                <FaBell />
              </div>
              {unreadNotif > 0 && <span className={styles.badge}>{unreadNotif}</span>}
            </button>
            {isNotifOpen && (
              <div className={styles.msgDropdown}>
                <div className={styles.dropdownTopPointer}></div>
                <div className={styles.msgHeader}>
                  <span className={styles.msgTitle}>{unreadNotif} new Notifications</span>
                  <button className={styles.markReadBtn} onClick={() => dispatch(clearAllNotifications())}>
                    Clear All
                  </button>
                </div>
                
                {notifList.length === 0 ? (
                  <div className={styles.emptyNotif}>
                    <FaBell className={styles.emptyBellIcon} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className={styles.notifList}>
                    {notifList.map((notif) => (
                      <div key={notif.id} className={styles.notifItem} style={{ alignItems: 'flex-start' }}>
                        {notif.icon ? (
                           <div style={{ alignSelf: 'flex-start', marginTop: '2px', marginRight: '12px', flexShrink: 0 }}>
                             <img src={notif.icon} alt="icon" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'contain' }} />
                           </div>
                        ) : (
                          <div className={styles.notifIconBox} style={{ background: `${notif.color}15`, color: notif.color, alignSelf: 'flex-start', marginTop: '2px' }}>
                            {getNotifIcon(notif.type)}
                          </div>
                        )}
                        <div className={styles.notifBody}>
                          <span className={styles.notifTitle}>{notif.title}</span>
                          {notif.text && <span className={styles.notifText}>{notif.text}</span>}
                          {notif.image && (
                            notif.isPdf ? (
                              <a href={notif.image} target="_blank" rel="noreferrer" className={styles.notifAttachment} onClick={(e) => e.stopPropagation()}>
                                <FaPaperclip /> {notif.fileName || 'View Attachment'}
                              </a>
                            ) : (
                              <img 
                                src={notif.image} 
                                alt="Attachment" 
                                className={styles.notifImage} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(notif.image, '_blank');
                                }}
                              />
                            )
                          )}
                          <span className={styles.notifTime}>{notif.time}</span>
                        </div>
                        <FiChevronRight className={styles.notifArrow} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.profileContainer} ref={dropdownRef}>
            <div className={styles.avatarWrapper} onClick={() => dispatch(toggleProfileDropdown())}>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sachin"
                alt="Avatar"
                className={styles.avatarImage}
              />
            </div>
            {isProfileDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatarWrapper}>
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sachin"
                      alt="User"
                      className={styles.dropdownAvatar}
                    />
                  </div>
                  <div className={styles.dropdownUserInfo}>
                    <div className={styles.dropdownUserName}>{user?.name}</div>
                    <div className={styles.dropdownUserRole}>{user?.role}</div>
                  </div>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.dropdownMenu}>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/api/dashboard/profile')}>
                    <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaUser /></div>
                    <span>My Profile</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/api/dashboard/settings')}>
                    <div className={`${styles.menuIcon} ${styles.iconChart}`}><FaCog /></div>
                    <span>Account Setting</span>
                  </div>
                  <div className={styles.divider}></div>
                  <div className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleLogout}>
                    <div className={`${styles.menuIcon} ${styles.iconRed}`}><FaPowerOff /></div>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
        <div className={styles.logoutModal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalIconBox}>
            <FaPowerOff />
          </div>
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to log out of your account?</p>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>
              Stay Logged In
            </button>
            <button className={styles.confirmBtn} onClick={confirmLogout}>
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default ApiHeader;
