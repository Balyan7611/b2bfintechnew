import { useEffect, useRef, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCertificate,
  FaCog,
  FaCommentDots,
  FaEdit,
  FaEnvelope,
  FaExpand,
  FaHistory, FaMobileAlt,
  FaPaperclip,
  FaPowerOff,
  FaUser,
  FaWallet
} from 'react-icons/fa';
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiSearch,
  FiShoppingBag,
  FiStar,
  FiUsers
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../../utils/authUtils';
import { API } from '../../../api/endpoints';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { requestForToken, setupForegroundListener } from '../../../firebase';
import {
  addNotification,
  clearAllNotifications,
  markAllMailRead,
  markAllNotifRead,
  setMailOpen,
  setNotifOpen,
  setProfileDropdown,
  syncNotifications,
  toggleMailOpen,
  toggleNotifOpen,
  toggleProfileDropdown,
  toggleSidebar
} from '../../../store/slices/memberPanelSlice';
import styles from './MemberHeader.module.css';

const MemberHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mailRef = useRef(null);
  const notifRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const searchItems = [
    { name: 'Dashboard', path: '/member/dashboard' },
    { name: 'Mobile Recharge', path: '/member/dashboard/recharge' },
    { name: 'DTH Recharge', path: '/member/dashboard/dth' },
    { name: 'AEPS Services', path: '/member/dashboard/aeps' },
    { name: 'BBPS (Bill Pay)', path: '/member/dashboard/bbps' },
    { name: 'Money Transfer (DMT)', path: '/member/dashboard/dmt' },
    { name: 'Reports', path: '/member/reports' },
    { name: 'Members & Users', path: '/member/users' },
    { name: 'KYC Management', path: '/member/kyc' },
    { name: 'Settings', path: '/member/settings' },
    { name: 'Wallet & Fund', path: '/member/wallet' },
    { name: 'My Profile', path: '/member/dashboard/profile' },
  ];

  const filteredSearchItems = searchItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { 
    isDarkMode, user, isProfileDropdownOpen, isMobile, isSidebarOpen,
    isMailOpen, isNotifOpen, unreadMail, unreadNotif,
    mailList, notifList
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
    // Best-effort: mark this session's login-history record as logged out.
    // Not awaited so it never delays the actual logout/navigation.
    API.userLoginHistory.closeActiveSession();
    clearSession();
    navigate('/member/login');
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
    { name: 'AEPS WALLET', value: '0.00', color: '#10B981' },
    { name: 'MAIN WALLET', value: '0.00', color: 'var(--color-primary)' },
    { name: 'PROFIT WALLET', value: '0.00', color: '#F59E0B' }
  ];

  return (
    <>
    <header className={`${styles.header} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.left}>
        {isMobile ? (
          <>
            <button className={styles.hamburgerBtn} onClick={() => dispatch(toggleSidebar())}>
              <FaBars />
            </button>
            <img 
              src="/images/browser_logo.jpeg" 
              alt={SITE_CONFIG.shortName} 
              className={styles.headerLogo} 
            />
          </>
        ) : (
          <img 
            src="/images/browser_logo.jpeg" 
            alt={SITE_CONFIG.shortName} 
            className={styles.headerLogo} 
          />
        )}
      </div>

      <div className={styles.center}>
        {!isMobile && (
          <div className={styles.searchBar} ref={searchRef}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              name="search_box"
              autoComplete="off"
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
        <div className={`${styles.walletSection} member-wallets-row`}>
          {walletData.map((wallet) => (
            <div key={wallet.name} className={styles.walletPill}>
              <div className={styles.walletIcon} style={{ color: wallet.color }}>
                <FaWallet />
              </div>
              <div className={styles.walletInfo}>
                <span className={styles.walletLabel}>{wallet.name}</span>
                <span className={styles.walletValue}>{wallet.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.verticalDivider}></div>

        <div className={styles.actionIcons}>
          <button className={`${styles.iconBtn} ${styles.mobileHide}`} onClick={handleFullscreen}>
            <FaExpand />
          </button>

          {/* 🔥 Dark/Light Toggle Button Removed */}

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
                  <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/profile')}>
                    <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaUser /></div>
                    <span>My Profile</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/member/profile/edit')}>
                    <div className={`${styles.menuIcon} ${styles.iconChart}`}><FaEdit /></div>
                    <span>Edit Profile</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/member/logs/activity')}>
                    <div className={`${styles.menuIcon} ${styles.iconSupport}`}><FaHistory /></div>
                    <span>Activity Logs</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/member/logs/mobile')}>
                    <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaMobileAlt /></div>
                    <span>Mobile Logs</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/member/settings')}>
                    <div className={`${styles.menuIcon} ${styles.iconChart}`}><FaCog /></div>
                    <span>Account Setting</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => handleNavigate('/member/certificate')}>
                    <div className={`${styles.menuIcon} ${styles.iconSupport}`}><FaCertificate /></div>
                    <span>Certificate</span>
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

export default MemberHeader;