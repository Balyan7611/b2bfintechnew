import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaCog, FaUserCheck, FaFileAlt, FaWallet, FaHeadset
} from 'react-icons/fa';
import { FiChevronRight, FiChevronLeft, FiGrid, FiX } from 'react-icons/fi';
import { toggleSidebar, setSidebarOpen } from '../../../store/slices/memberPanelSlice';
import MyServicesModal from './MyServices';
import styles from './MemberSidebar.module.css';
import { SITE_CONFIG } from '../../../config/siteConfig';

const MemberSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, isSidebarOpen, isMobile } = useSelector((state) => state.memberPanel);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [hoveredItem, setHoveredItem] = useState(null); // stores { name, top, item }
  const [isMyServicesOpen, setIsMyServicesOpen] = useState(false);

  const handleMouseEnter = (e, item) => {
    if (!isSidebarOpen && !isMobile && item.hasChildren) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItem({ name: item.name, top: rect.top, item: item });
    }
  };

  const handleMouseLeave = () => {
    if (!isSidebarOpen && !isMobile) {
      setHoveredItem(null);
    }
  };

  const toggleMenu = (menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/member/dashboard' },
    { 
      name: 'Commission Setup', 
      icon: <FaCog />, 
      hasChildren: true,
      children: [
        { name: 'Common Commission', path: '/member/dashboard/commission' }
      ]
    },
    { 
      name: 'KYC', 
      icon: <FaUserCheck />, 
      hasChildren: true,
      children: [
        { name: 'Onboarding Process', path: '/member/dashboard/kyc/onboarding' },
        { name: 'Upload KYC', path: '/member/dashboard/kyc/upload' }
      ]
    },
    { 
      name: 'All Report', 
      icon: <FaFileAlt />, 
      hasChildren: true,
      children: [
        { name: 'AEPS History', path: '/member/dashboard/report/aeps' },
        { name: 'DMT History', path: '/member/dashboard/report/dmt' },
        { name: 'Payout History', path: '/member/dashboard/report/payout' },
        { name: 'MATM History', path: '/member/dashboard/report/matm' },
        { name: 'Recharge History', path: '/member/dashboard/report/recharge' },
        { name: 'BBPS History', path: '/member/dashboard/report/bbps' },
        { name: 'Business Summary', path: '/member/dashboard/report/business' }
      ]
    },
    { 
      name: 'Wallet Report', 
      icon: <FaWallet />, 
      hasChildren: true,
      children: [
        { name: 'Wallet to Wallet', path: '/member/dashboard/wallet/w2w' },
        { name: 'Fund Request', path: '/member/dashboard/wallet/fund-request' },
        { name: 'Main Wallet', path: '/member/dashboard/wallet/main' },
        { name: 'AEPS Wallet', path: '/member/dashboard/wallet/aeps' }
      ]
    },
    {
      name: 'Help & Support',
      icon: <FaHeadset />,
      path: '/member/dashboard/support'
    }
  ];

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) dispatch(setSidebarOpen(false));
    }
    if (item.hasChildren) {
      toggleMenu(item.name);
    }
  };

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div className={styles.overlay} onClick={() => dispatch(setSidebarOpen(false))}></div>
      )}
      <aside className={`
        ${styles.sidebar} 
        ${isSidebarOpen ? styles.open : styles.collapsed} 
        ${isMobile && isSidebarOpen ? styles.mobileOpen : ''}
        ${isDarkMode ? styles.dark : ''}
      `}>
        
        <div className={styles.sidebarHeader}>
          {isMobile ? (
            <div className={styles.mobileHeaderContent} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>Menu</span>
              <button 
                className={styles.closeSidebarBtn} 
                onClick={() => dispatch(setSidebarOpen(false))}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.2rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <FiX />
              </button>
            </div>
          ) : (
            <>
              {isSidebarOpen && (
                <img src="/images/browser_logo.jpeg" alt={SITE_CONFIG.shortName} className={styles.sidebarLogo} />
              )}
              <button 
                className={styles.desktopToggleBtn} 
                onClick={() => dispatch(toggleSidebar())}
              >
                {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
              </button>
            </>
          )}
        </div>

        <nav className={styles.navMenu}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={styles.menuGroup}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className={`
                  ${styles.menuItem} 
                  ${(location.pathname === item.path || (item.hasChildren && item.children.some(child => location.pathname === child.path))) ? styles.active : ''}
                  ${!isSidebarOpen && !isMobile && hoveredItem?.name === item.name ? styles.collapsedHovered : ''}
                `}
                onClick={() => handleMenuClick(item)}
              >
                <div className={styles.menuLeft}>
                  <div className={styles.menuIcon}>{item.icon}</div>
                  {(isSidebarOpen || isMobile) && (
                    <>
                      <span className={styles.menuText}>{item.name}</span>
                      {item.hasChildren && (
                        <div className={`${styles.arrowIcon} ${activeMenu === item.name ? styles.rotate : ''}`}>
                          <FiChevronRight />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {item.hasChildren && (isSidebarOpen || isMobile) && item.children && (
                <div className={`${styles.subMenu} ${activeMenu === item.name ? styles.subMenuShow : ''}`}>
                  {item.children.map(child => (
                    <div 
                      key={child.name} 
                      className={`${styles.subMenuItem} ${location.pathname === child.path ? styles.subActive : ''}`}
                      onClick={() => {
                        navigate(child.path);
                        if (isMobile) dispatch(setSidebarOpen(false));
                      }}
                    >
                      <div className={styles.subDot}></div>
                      {child.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Floating Tooltip/Hover Popup for Collapsed Sidebar */}
        {!isSidebarOpen && !isMobile && hoveredItem && (
          <div 
            className={styles.hoverPopup} 
            style={{ top: `${hoveredItem.top}px` }}
            onMouseEnter={() => setHoveredItem(hoveredItem)}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.popupHeader}>{hoveredItem.item.name}</div>
            {hoveredItem.item.hasChildren && hoveredItem.item.children && (
              <div className={styles.popupSubMenu}>
                {hoveredItem.item.children.map(child => (
                  <div 
                    key={child.name} 
                    className={`${styles.popupSubItem} ${location.pathname === child.path ? styles.subActive : ''}`}
                    onClick={() => {
                      navigate(child.path);
                      setHoveredItem(null);
                    }}
                  >
                    <div className={styles.popupDot}></div>
                    {child.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.bottomSection}>
          <div className={styles.myServiceWrapper}>
            <button 
              className={`${styles.myServiceBtn} member-my-services-btn`}
              onClick={() => setIsMyServicesOpen(true)}
            >
              <FiGrid className={styles.btnIconMain} />
              {(isSidebarOpen || isMobile) && <span className={styles.btnTextMain}>MY SERVICE</span>}
            </button>
            {!isSidebarOpen && !isMobile && (
              <div className={styles.serviceTooltip}>My Service</div>
            )}
          </div>
        </div>
      </aside>

      {isMyServicesOpen && (
        <MyServicesModal onClose={() => setIsMyServicesOpen(false)} />
      )}
    </>
  );
};

export default MemberSidebar;
