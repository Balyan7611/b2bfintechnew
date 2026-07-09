import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSession } from '../../utils/authUtils';
import { Outlet } from 'react-router-dom';
import ApiSidebar from '../components/ApiSidebar';
import ApiHeader from '../components/ApiHeader';
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
import styles from '../../pages/MemberDashboard.module.css';


const ApiDashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dateInputRef = useRef(null);
  const { 
    isDarkMode, isSidebarOpen, isMobile, 
    selectedDate, searchTerm, notifList
  } = useSelector(state => state.memberPanel);
  
  const [user, setUser] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);
  const [isLoading, setIsLoading] = useState(true);

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



  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: isDarkMode ? '#0f172a' : '#f4f7fa',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(23, 86, 170, 0.1)',
          borderTop: '4px solid #1756AA',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }}></div>
        <div style={{ fontWeight: '700', fontSize: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', letterSpacing: '0.5px' }}>
          SECURE CONNECTION ESTABLISHED...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.dark : ''}`}>
      <ApiHeader />
      <ApiSidebar />
      <div className={`${styles.mainWrapper} ${!isSidebarOpen && !isMobile ? styles.expanded : ''}`}>
        
        <main className={styles.content} style={{ padding: '8px 8px 16px 8px' }}>
          <Outlet />
        </main>
      </div>

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

    </div>
  );
};

export default ApiDashboardLayout;
