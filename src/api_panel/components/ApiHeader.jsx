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
  FaUser, FaEdit, FaHistory, FaMobileAlt, FaCog, FaBullhorn, FaCommentDots, FaPaperclip, FaKey
} from 'react-icons/fa';
import { 
  FiX, FiChevronRight, FiChevronLeft, FiShoppingBag, FiUsers, FiCheckCircle, FiFileText, FiStar, FiSearch 
} from 'react-icons/fi';
import { SITE_CONFIG } from '../../config/siteConfig';
import { requestForToken, setupForegroundListener } from '../../firebase';
import { clearSession, getSession } from '../../utils/authUtils';
import { API } from '../../api/endpoints';
import styles from './ApiHeader.module.css';

// Maps a WalletType DB record (Name: MAIN / AEPS / COMMISSION ...) to the matching
// balance field on UserWalletBalance and a display color.
const WALLET_TYPE_CONFIG = [
  { match: 'AEPS', balanceKey: 'aepsBalance', color: '#10B981' },
  { match: 'MAIN', balanceKey: 'mainBalance', color: '#1756AA' },
  { match: 'COMMISSION', balanceKey: 'commissionBalance', color: '#F59E0B' }
];

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
    clearSession();
    localStorage.removeItem('api_token');
    sessionStorage.removeItem('api_token');
    navigate('/api-panel/login');
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

  // Seed with all wallet types visible by default so nothing is hidden while the
  // first live fetch from WalletType (DB) is still in flight.
  const [walletTypes, setWalletTypes] = useState([
    { code: 'MAIN', name: 'Main', isActive: true },
    { code: 'AEPS', name: 'AEPS', isActive: true },
    { code: 'COMMISSION', name: 'Commission', isActive: true }
  ]);
  const [walletBalances, setWalletBalances] = useState({ mainBalance: 0, aepsBalance: 0, commissionBalance: 0 });

  const fetchWalletHeaderData = async () => {
    try {
      const session = getSession();
      const memberId = session?.msrno || session?.userId || '';
      const fromDate = new Date('2000-01-01').toISOString();
      const toDate = new Date().toISOString();

      const [typesRes, balancesRes] = await Promise.all([
        API.walletType.getActive({ pageNumber: 1, pageSize: 10000 }),
        memberId ? API.userWalletBalance.getAll({ pageNumber: 1, pageSize: 1, fromDate, toDate, memberId, silent: true }) : Promise.resolve(null)
      ]);

      // Only overwrite the list when the API actually returned wallet types.
      // If the request fails/returns empty (e.g. transient network issue), keep
      // whatever was last shown instead of hiding every wallet pill.
      if (Array.isArray(typesRes) && typesRes.length > 0) {
        setWalletTypes(typesRes);
      }

      const row = Array.isArray(balancesRes?.data) ? balancesRes.data[0] : null;
      if (row) {
        setWalletBalances({
          mainBalance: parseFloat(row.mainBalance) || 0,
          aepsBalance: parseFloat(row.aepsBalance) || 0,
          commissionBalance: parseFloat(row.commissionBalance) || 0
        });
      }
    } catch (err) {
      console.error('ApiHeader: Failed to fetch wallet header data:', err);
    }
  };

  useEffect(() => {
    fetchWalletHeaderData();
    const interval = setInterval(fetchWalletHeaderData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Only wallet types that are Active in the database (WalletType.IsActive) are shown here.
  // If a wallet type is deactivated from the DB, its pill disappears from this header automatically.
  const walletData = walletTypes
    .filter(wt => wt.isActive)
    .map(wt => {
      // `code` (MAIN/AEPS/COMMISSION) is only used internally to pick the right
      // balance field/color. The label shown on screen is always the DB `name`
      // exactly as typed - rename it in the DB and the pill updates to match.
      const cfg = WALLET_TYPE_CONFIG.find(c => (wt.code || '').toUpperCase().includes(c.match));
      return {
        name: `${wt.name || wt.code || ''} Wallet`,
        value: (walletBalances[cfg?.balanceKey] || 0).toFixed(2),
        color: cfg?.color || '#64748b'
      };
    });

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

      <div className={styles.center}></div>

      <div className={styles.right}>
        {/* All Wallet Cards placed on Right Side */}
        {!isMobile && walletData.map((wallet, index) => (
          <div key={index} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ffffff',
            border: `1px solid ${wallet.color}40`,
            padding: '4px 10px', borderRadius: '8px', marginRight: index === walletData.length - 1 ? '16px' : '4px',
            cursor: 'default',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
          >
            <FaWallet style={{ fontSize: '1.2rem', color: wallet.color }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{wallet.name}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                {parseFloat(wallet.value).toLocaleString('en-IN', {minimumFractionDigits:2})}
              </span>
            </div>
          </div>
        ))}

        <div className={styles.verticalDivider}></div>

        <div className={styles.actionIcons}>
          <button className={`${styles.iconBtn} ${styles.mobileHide}`} onClick={handleFullscreen}>
            <FaExpand />
          </button>

          {/* Dark Mode and Mail icons removed as per request */}

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
            {(() => {
              const session = getSession();
              const displayName = session?.name || session?.fullName || user?.name || 'API Partner';
              const displayId = session?.loginId || session?.username || 'API User';

              return (
                <>
                  <div className={styles.avatarWrapper} onClick={() => dispatch(toggleProfileDropdown())}>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                      alt="Avatar"
                      className={styles.avatarImage}
                    />
                  </div>
                  {isProfileDropdownOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownAvatarWrapper}>
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                            alt="User"
                            className={styles.dropdownAvatar}
                          />
                        </div>
                        <div className={styles.dropdownUserInfo}>
                          <div className={styles.dropdownUserName}>{displayName}</div>
                          <div className={styles.dropdownUserRole}>{displayId}</div>
                        </div>
                      </div>
                      <div className={styles.divider}></div>
                      <div className={styles.dropdownMenu}>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/api-panel/dashboard/profile')}>
                          <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaUser /></div>
                          <span>My Profile</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/api-panel/dashboard/whitelist')}>
                          <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaKey /></div>
                          <span>API Credentials</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleLogout}>
                          <div className={`${styles.menuIcon} ${styles.iconRed}`}><FaPowerOff /></div>
                          <span>Logout</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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

