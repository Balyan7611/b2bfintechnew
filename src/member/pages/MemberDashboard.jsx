import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSession } from '../../utils/authUtils';
import { Outlet } from 'react-router-dom';
import MemberSidebar from '../components/MemberPanel/MemberSidebar';
import MemberHeader from '../components/MemberPanel/MemberHeader';
import MyServicesModal from '../components/MemberPanel/MyServices';
import { 
  setIsMobile, 
  setSidebarOpen,
  setSelectedDate,
  setSearchTerm,
  setUpgradePopup
} from '../../store/slices/memberPanelSlice';
import { 
  FaCalendarAlt, FaArrowUp, FaArrowDown, FaSearch, FaShieldAlt,
  FaMoneyBillWave, FaMobileAlt, FaFingerprint, FaWallet, FaQrcode,
  FaExchangeAlt, FaIdCard, FaAddressCard, FaUniversity, FaUserPlus, FaThLarge, FaTimes,
  FaPaperPlane, FaInbox, FaBell, FaPaperclip
} from 'react-icons/fa';
import { MdAccountBalanceWallet } from 'react-icons/md';
import UpgradePopup from '../components/MemberPanel/UpgradePopup';
import Skeleton from '../../shared/components/common/Skeleton';
import styles from '../../pages/MemberDashboard.module.css';

const CountUp = ({ end, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    const endValue = parseFloat(end.replace(/,/g, ''));
    if (isNaN(endValue)) { setCount(end); return; }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = progress * endValue;
      setCount(currentCount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}</span>;
};

const MemberDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dateInputRef = useRef(null);
  const { 
    isDarkMode, isSidebarOpen, isMobile, 
    selectedDate, searchTerm, notifList
  } = useSelector(state => state.memberPanel);
  
  const [user, setUser] = useState(null);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMyServicesFloatOpen, setIsMyServicesFloatOpen] = useState(false);
  const walletBtnRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);
  const [isLoading, setIsLoading] = useState(true);

  const [isSystemFrozen, setIsSystemFrozen] = useState(() => localStorage.getItem('bss_system_frozen') === 'true');
  const [freezeMessage, setFreezeMessage] = useState(() => localStorage.getItem('bss_system_freeze_message') || '⚠️ SYSTEM NOTICE: All transactions and wallet transfers are temporarily suspended by the Admin for security.');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsSystemFrozen(localStorage.getItem('bss_system_frozen') === 'true');
      setFreezeMessage(localStorage.getItem('bss_system_freeze_message') || '⚠️ SYSTEM NOTICE: All transactions and wallet transfers are temporarily suspended by the Admin for security.');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('system_freeze_updated', handleStorageChange); // Custom event for same-window updates
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('system_freeze_updated', handleStorageChange);
    };
  }, []);

  // Toast logic
  const [currentToast, setCurrentToast] = useState(null);
  const [isToastClosing, setIsToastClosing] = useState(false);
  const prevNotifCountRef = useRef(notifList ? notifList.length : 0);

  useEffect(() => {
    if (notifList && notifList.length > prevNotifCountRef.current) {
      setCurrentToast(notifList[0]);
      setIsToastClosing(false);
      
      const timer = setTimeout(() => {
        setIsToastClosing(true);
        setTimeout(() => setCurrentToast(null), 300);
      }, 5000);
      
      prevNotifCountRef.current = notifList.length;
      return () => clearTimeout(timer);
    } else if (notifList) {
      prevNotifCountRef.current = notifList.length;
    }
  }, [notifList]);

  const handleCloseToast = () => {
    setIsToastClosing(true);
    setTimeout(() => setCurrentToast(null), 300);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setIsDesktop(width > 1200);
      dispatch(setIsMobile(mobile));
      if (mobile) {
        dispatch(setSidebarOpen(false));
      } else {
        dispatch(setSidebarOpen(true));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    const session = getSession();
    if (!session) {
      setUser({ name: 'Sachin Balyan', role: 'Retailer (RT1236)' });
    } else {
      setUser(session);
    }
    dispatch(setSearchTerm(''));
    
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [isDarkMode, dispatch]);

  const handleDatePillClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const quickServices = [
    { name: 'DMT', icon: <FaMoneyBillWave />, color: '#8E24AA', path: '/member/dashboard/service/dmt' },
    { name: 'RECHARGE', icon: <FaMobileAlt />, color: '#1E88E5', path: '/member/dashboard/service/mobile-recharge' },
    { name: 'AEPS', icon: <FaFingerprint />, color: '#43A047', path: '/member/dashboard/service/aeps' },
    { name: 'PAYOUT', icon: <FaWallet />, color: '#E53935', path: '/member/dashboard/service/payout' },
    { name: 'UPI', icon: <FaQrcode />, color: '#1A237E', path: '/member/dashboard/service/upitransfer' },
    { name: 'W2W', icon: <FaExchangeAlt />, color: '#FB8C00', path: '/member/dashboard/wallet/w2w' },
    { name: 'AADHARPAY', icon: <FaIdCard />, color: '#00897B', path: '/member/dashboard/service/aadharpay' },
    { name: 'PAN', icon: <FaAddressCard />, color: '#D81B60', path: '/member/dashboard/service/pan' },
    { name: 'V-ACCOUNT', icon: <FaUniversity />, color: '#5E35B1', path: '/member/dashboard/wallet/main' },
    { name: 'FUND REQ', icon: <FaUserPlus />, color: '#F4511E', path: '/member/dashboard/wallet/fund-request' }
  ];

  const handleQuickServiceClick = (service) => {
    navigate(service.path);
  };

  const walletData = [
    { name: 'AEPS WALLET',   value: '0.00', color: '#10B981' },
    { name: 'MAIN WALLET',   value: '0.00', color: '#3B82F6' },
    { name: 'PROFIT WALLET', value: '0.00', color: '#F59E0B' },
  ];

  const handleServiceClick = (path) => {
    navigate(path);
    setIsServicesModalOpen(false);
  };

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.dark : ''}`}>
      <MemberHeader />
      <MemberSidebar />
      <div className={`${styles.mainWrapper} ${!isSidebarOpen && !isMobile ? styles.expanded : ''}`}>
          {isSystemFrozen && (
            <div style={{
              background: '#FEF2F2',
              color: '#991B1B',
              borderBottom: '1px solid #FCA5A5',
              padding: '12px 24px',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <FaShieldAlt style={{ color: '#EF4444' }} />
              <span>{freezeMessage}</span>
            </div>
          )}
          
          <div className={styles.newsTickerWrapper}>
            <div className={styles.newsTickerContent}>
              <p className={styles.newsTickerText}>
                🚀 <b>NEW UPDATE:</b> DMT-PPI now available with 50k monthly /Sender Transfer Limit. Send 25k in single txn. Agent Comm.- 0.4%*.
              </p>
            </div>
          </div>

          {/* Action Bar (The Blue InfoBar) */}
          <div className={styles.infoBar}>
            <div className={styles.actionItems}>
              
              {/* LEFT GROUP: Calendar + Buttons */}
              <div className={styles.leftActionGroup}>
                <div className={styles.compactDateBox} onClick={handleDatePillClick}>
                  <FaCalendarAlt className={styles.calIcon} />
                  <input
                    ref={dateInputRef}
                    type="date"
                    className={styles.hiddenDateInput}
                    value={selectedDate}
                    onChange={(e) => dispatch(setSelectedDate(e.target.value))}
                  />
                </div>

                {!isDesktop && (
                  <button 
                    className={styles.serviceTriggerBtn}
                    onClick={() => setIsServicesModalOpen(true)}
                    title="Quick Services"
                  >
                    <FaThLarge />
                  </button>
                )}

                <div className={styles.buttonGroup}>
                  <button className={`${styles.miniBtn} ${styles.greenMini}`}>
                    <FaPaperPlane /> <span>TRANSFER</span>
                  </button>
                  <button className={`${styles.miniBtn} ${styles.blueMini}`}>
                    <FaInbox /> <span>RECEIVED</span>
                  </button>
                  <button 
                    className={`${styles.miniBtn} ${styles.goldMini}`}
                    onClick={() => dispatch(setUpgradePopup(true))}
                  >
                    <FaShieldAlt /> <span>UPGRADE</span>
                  </button>
                </div>
              </div>

              {/* RIGHT GROUP: Search Bar + Wallet Icon */}
              <div className={styles.rightActionGroup}>
                {/* Wallet icon — mobile only (moved to front) */}
                {isMobile && (
                  <div className={styles.infoBarWalletWrap}>
                    <button
                      ref={walletBtnRef}
                      className={styles.infoBarWalletBtn}
                      onClick={() => setIsWalletOpen(true)}
                      title="View Balance"
                    >
                      <MdAccountBalanceWallet />
                    </button>

                    {/* Premium Mobile Wallet Modal */}
                    {isWalletOpen && (
                      <div className={styles.walletModalOverlay} onClick={() => setIsWalletOpen(false)}>
                        <div className={styles.walletModalCard} onClick={e => e.stopPropagation()}>
                          <div className={styles.walletModalHeader}>
                            <h3>My Wallets</h3>
                            <button className={styles.walletCloseBtn} onClick={() => setIsWalletOpen(false)}>
                              <FaTimes />
                            </button>
                          </div>
                          
                          <div className={styles.walletList}>
                            {walletData.map((w, idx) => (
                              <div key={w.name} className={styles.walletCard} style={{ '--accent': w.color }}>
                                <div className={styles.walletCardIcon}>
                                  <FaWallet />
                                </div>
                                <div className={styles.walletCardInfo}>
                                  <span className={styles.walletCardLabel}>{w.name}</span>
                                  <div className={styles.walletCardValue}>
                                    {isLoading ? (
                                      <Skeleton width="120px" height="28px" borderRadius="6px" />
                                    ) : (
                                      <>
                                        <span className={styles.currencySymbol}>₹</span>
                                        <CountUp end={w.value} />
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className={styles.walletCardBgIcon}>
                                  <FaWallet />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.compactSearch}>
                  <input
                    type="text"
                    placeholder="Search services..."
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  />
                  <button className={styles.miniSearchBtn}><FaSearch /></button>
                </div>
              </div>

            </div>
          </div>

          {/* QUICK SERVICES STRIP (PC ONLY) */}
          {isDesktop && (
            <div className={styles.quickServicesStrip}>
              {quickServices.map(service => (
                <div 
                  key={service.name} 
                  className={styles.quickItem} 
                  onClick={() => handleQuickServiceClick(service)}
                  style={{ '--service-color': service.color }}
                >
                  <span className={styles.quickIcon}>{service.icon}</span>
                  <span className={styles.quickName}>{service.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* SERVICES POPUP (TABLET & MOBILE) */}
          {!isDesktop && isServicesModalOpen && (
            <div className={styles.mobileServicesOverlay} onClick={() => setIsServicesModalOpen(false)}>
              <div className={styles.mobileServicesModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitleBox}>
                    <FaThLarge className={styles.modalTitleIcon} />
                    <h3>QUICK SERVICES</h3>
                  </div>
                  <button className={styles.modalCloseBtn} onClick={() => setIsServicesModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className={styles.modalGrid}>
                  {quickServices.map(service => (
                    <div 
                      key={service.name} 
                      className={styles.modalItem}
                      onClick={() => handleServiceClick(service.path)}
                      style={{ '--service-color': service.color }}
                    >
                      <div className={styles.modalIconWrap}>{service.icon}</div>
                      <span className={styles.modalName}>{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <main className={styles.content}>
            <Outlet />
          </main>

          {/* FLOATING MY SERVICE FAB (Mobile Only) */}
          {isMobile && (
            <button
              className={styles.fabMyService}
              onClick={() => setIsMyServicesFloatOpen(true)}
              title="My Services"
            >
              <FaThLarge className={styles.fabIcon} />
              <span className={styles.fabLabel}>MY SERVICE</span>
            </button>
          )}
        </div>

      {/* MyServices Float Modal */}
      {isMyServicesFloatOpen && (
        <MyServicesModal onClose={() => setIsMyServicesFloatOpen(false)} />
      )}

      {/* Global Toast Notification */}
      {currentToast && (
        <div className={`${styles.globalToast} ${isToastClosing ? styles.closing : ''}`}>
          <div className={styles.toastIconWrap} style={{ alignSelf: 'flex-start', marginTop: '2px' }}>
            <FaBell />
          </div>
          <div className={styles.toastContent}>
            <h4 className={styles.toastTitle}>{currentToast.title}</h4>
            <p className={styles.toastText}>{currentToast.text}</p>
            {currentToast.image && (
              currentToast.isPdf ? (
                <a href={currentToast.image} target="_blank" rel="noreferrer" className={styles.toastAttachment}>
                   <FaPaperclip /> {currentToast.fileName || 'View PDF Attachment'}
                </a>
              ) : (
                <img src={currentToast.image} alt="Attachment" className={styles.toastImage} />
              )
            )}
          </div>
          <button className={styles.toastClose} onClick={handleCloseToast} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
            <FaTimes />
          </button>
        </div>
      )}

      <UpgradePopup />
    </div>
  );
};

export default MemberDashboard;
