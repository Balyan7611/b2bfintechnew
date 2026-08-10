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
import { clearSession, getSession, saveSession } from '../../../utils/authUtils';
import { resolveMemberId } from '../../../utils/memberIdentity';
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
  
  const [headerUserInfo, setHeaderUserInfo] = useState(() => {
    const s = getSession();
    const defaultName = s?.name || s?.fullName || 'Member';
    return {
      name: defaultName === 'Member' || defaultName === 'User' ? (s?.loginId || s?.username || 'Member') : defaultName,
      loginId: s?.loginId || s?.username || s?.userId || 'RT1001',
      role: s?.role === 1 ? 'Admin' : 'Retailer'
    };
  });

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
            API.userLoginHistory.closeActiveSession();
    clearSession();
    navigate('/member/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    dispatch(setProfileDropdown(false));
  };

  useEffect(() => {
    const syncMemberHeaderInfo = async () => {
      const session = getSession();
      if (!session) return;
      
      const targetMsrno = parseInt(session.msrno || session.userId || 0);
      const targetLoginId = String(session.loginId || session.username || '').trim();
      let memberData = null;

      if (targetMsrno > 0 && API.member?.getById) {
        try {
          const res = await API.member.getById(targetMsrno);
          memberData = res?.data?.data || res?.data || res;
        } catch (_) {}
      }

      if (!memberData && targetLoginId && API.member?.getAll) {
        try {
          const res = await API.member.getAll({ search: targetLoginId });
          const items = res?.data?.items || res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
          memberData = items.find(m => String(m.loginId || m.loginID || m.LoginID || '').toLowerCase() === targetLoginId.toLowerCase());
        } catch (_) {}
      }

      if (memberData && (memberData.name || memberData.Name || memberData.fullName)) {
        const realName = memberData.name || memberData.Name || memberData.fullName;
        const realLoginId = memberData.loginId || memberData.loginID || memberData.LoginID || targetLoginId;
        
        setHeaderUserInfo({
          name: realName,
          loginId: realLoginId,
          role: session.role === 1 ? 'Admin' : 'Retailer'
        });

        if (realName !== session.name || realName !== session.fullName) {
          saveSession({
            ...session,
            name: realName,
            fullName: realName,
            loginId: realLoginId
          });
        }
      }
    };

    syncMemberHeaderInfo();
  }, []);

  useEffect(() => {
        requestForToken();

        const unsubscribe = setupForegroundListener((payload) => {
            dispatch(addNotification({
        title: payload.notification?.title || 'New Push Broadcast',
        text: payload.notification?.body || 'You have a new message.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }));
    });

    const session = getSession();
    const myMsrno = String(session?.msrno || session?.userId || '').trim();
    const myLoginId = String(session?.loginId || session?.username || '').trim().toLowerCase();
    console.log('[MemberHeader] Session loaded → msrno:', myMsrno, '| loginId:', myLoginId);

    const isForMe = (n) => {
      const hasIdentity = (myMsrno && myMsrno !== '0' && myMsrno !== 'undefined') || myLoginId;
      console.log('[MemberHeader] isForMe check → myMsrno:', myMsrno, '| myLoginId:', myLoginId, '| targetAll:', n.targetAll, '| targetMsrnos:', n.targetMsrnos, '| targetLoginIds:', n.targetLoginIds);
      if (!n.isAdminBroadcast) return true;
      if (n.targetAll || !hasIdentity) return true;
      if (myMsrno && myMsrno !== '0' && (n.targetMsrnos || []).includes(myMsrno)) return true;
      if (myLoginId && (n.targetLoginIds || []).map(l => String(l).toLowerCase()).includes(myLoginId)) return true;
      console.warn('[MemberHeader] isForMe → BLOCKED. My IDs not in target lists.');
      return false;
    };

    const pushNotif = (n) => {
      console.log('[MemberHeader] pushNotif called →', n.title, n.text);
      dispatch(addNotification({
        title: n.title || 'Admin',
        text: n.text || 'New message',
        time: n.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        image: n.image || null,
        isPdf: n.isPdf || false,
        fileName: n.fileName || null,
        icon: n.icon || null,
      }));
    };

    // Per-user key check — most reliable targeting
    const checkPerUserKeys = () => {
      const keysToCheck = ['notif_for_all'];
      if (myLoginId) keysToCheck.push(`notif_for_${myLoginId}`);
      if (myMsrno && myMsrno !== '0' && myMsrno !== 'undefined') keysToCheck.push(`notif_for_msrno_${myMsrno}`);
      console.log('[MemberHeader] checkPerUserKeys → checking keys:', keysToCheck);
      keysToCheck.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          console.log('[MemberHeader] Found notif at key:', key);
          try { pushNotif(JSON.parse(stored)); } catch {}
          localStorage.removeItem(key);
        }
      });
    };

    // Check on mount for any pending notifications
    checkPerUserKeys();

    // BroadcastChannel — instant real-time notification from admin
    let bc;
    try {
      bc = new BroadcastChannel('admin_notifications');
      bc.onmessage = (e) => {
        console.log('[MemberHeader] BroadcastChannel received:', e.data);
        if (e.data && isForMe(e.data)) pushNotif(e.data);
      };
      console.log('[MemberHeader] BroadcastChannel listening on admin_notifications');
    } catch (err) {
      console.warn('[MemberHeader] BroadcastChannel not supported:', err);
    }

    // Storage event — fires in other tabs when localStorage changes
    const handleStorageChange = (e) => {
      if (!e.key) return;
      console.log('[MemberHeader] storage event → key:', e.key);
      if (e.key === 'local_notifications') {
        try {
          const notifs = JSON.parse(e.newValue || '[]');
          if (notifs[0] && isForMe(notifs[0])) pushNotif(notifs[0]);
        } catch {}
      } else if (e.key.startsWith('notif_for_')) {
        checkPerUserKeys();
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
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        dispatch(setProfileDropdown(false));
        dispatch(setMailOpen(false));
        dispatch(setNotifOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('storage', handleStorageChange);
      if (unsubscribe) unsubscribe();
      if (bc) { try { bc.close(); } catch {} }
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

      const [walletTypes, setWalletTypes] = useState([
    { code: 'MAIN', name: 'Main', isActive: true },
    { code: 'AEPS', name: 'AEPS', isActive: true },
    { code: 'COMMISSION', name: 'Commission', isActive: true }
  ]);
  const [walletBalances, setWalletBalances] = useState({ mainBalance: 0, aepsBalance: 0, commissionBalance: 0 });

  const fetchWalletHeaderData = async () => {
    try {
                  const memberId = await resolveMemberId();
      if (!memberId) {
        console.warn('MemberHeader: no member id resolved, showing zero balances');
        setWalletBalances({ mainBalance: 0, aepsBalance: 0, commissionBalance: 0 });
        return;
      }

      const [typesRes, balances] = await Promise.all([
        API.walletType.getActive({ pageNumber: 1, pageSize: 10000 }),
        API.userWalletBalance.getForMember(memberId)
      ]);

                  if (Array.isArray(typesRes) && typesRes.length > 0) {
        setWalletTypes(typesRes);
      }

      console.log('[MemberHeader] memberId:', memberId, 'balances:', balances);
      setWalletBalances(balances);
    } catch (err) {
      console.error('MemberHeader: Failed to fetch wallet header data:', err);
    }
  };

  useEffect(() => {
    fetchWalletHeaderData();
            const interval = setInterval(fetchWalletHeaderData, 30000);
    return () => clearInterval(interval);
  }, []);

      const WALLET_TYPE_CONFIG = [
    { match: 'AEPS', balanceKey: 'aepsBalance', color: '#10B981' },
    { match: 'MAIN', balanceKey: 'mainBalance', color: 'var(--color-primary)' },
    { match: 'COMMISSION', balanceKey: 'commissionBalance', color: '#F59E0B' }
  ];

      const walletData = walletTypes
    .filter(wt => wt.isActive)
    .map(wt => {
                        const cfg = WALLET_TYPE_CONFIG.find(c => (wt.code || '').toUpperCase().includes(c.match));
      return {
        name: `${wt.name || wt.code || ''} Wallet`,
        value: (walletBalances[cfg?.balanceKey] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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

      <div className={styles.center}>
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
          <button className={`${styles.iconBtn} ${styles.mobileHide}`} onClick={handleFullscreen} title="Fullscreen">
            <FaExpand />
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
            {(() => {
              const session = getSession();
              let currentName = headerUserInfo.name !== 'Member' ? headerUserInfo.name : (session?.name && session.name !== 'Member' ? session.name : (session?.fullName !== 'Member' && session?.fullName ? session.fullName : (user?.name !== 'Member' && user?.name ? user.name : (headerUserInfo.loginId || 'Member'))));
              const currentLoginId = headerUserInfo.loginId || session?.loginId || session?.username || session?.userId || 'RT1001';
              const currentRole = `${headerUserInfo.role} (${currentLoginId})`;

              return (
                <>
                  <div className={styles.avatarWrapper} onClick={() => dispatch(toggleProfileDropdown())}>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentName}`}
                      alt="Avatar"
                      className={styles.avatarImage}
                    />
                  </div>
                  {isProfileDropdownOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownAvatarWrapper}>
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentName}`}
                            alt="User"
                            className={styles.dropdownAvatar}
                          />
                        </div>
                        <div className={styles.dropdownUserInfo}>
                          <div className={styles.dropdownUserName}>{currentName}</div>
                          <div className={styles.dropdownUserRole}>{currentRole}</div>
                        </div>
                      </div>
                      <div className={styles.divider}></div>
                      <div className={styles.dropdownMenu}>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/profile')}>
                          <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaUser /></div>
                          <span>My Profile</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/profile')}>
                          <div className={`${styles.menuIcon} ${styles.iconChart}`}><FaEdit /></div>
                          <span>Edit Profile</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/logs/login-history')}>
                          <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaHistory /></div>
                          <span>Login History</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/logs/activity')}>
                          <div className={`${styles.menuIcon} ${styles.iconSupport}`}><FaHistory /></div>
                          <span>Activity Logs</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/logs/login-history')}>
                          <div className={`${styles.menuIcon} ${styles.iconNavy}`}><FaMobileAlt /></div>
                          <span>Mobile Logs</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/profile')}>
                          <div className={`${styles.menuIcon} ${styles.iconChart}`}><FaCog /></div>
                          <span>Account Setting</span>
                        </div>
                        <div className={styles.menuItem} onClick={() => handleNavigate('/member/dashboard/profile')}>
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
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </header>

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
