import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, FaWallet, FaIdCard, FaLink, FaCog, FaNetworkWired, FaFileAlt,
  FaMoneyCheckAlt
} from 'react-icons/fa';
import { FiChevronRight, FiChevronLeft, FiX } from 'react-icons/fi';
import { toggleSidebar, setSidebarOpen } from '../../store/slices/memberPanelSlice';
import { SITE_CONFIG } from '../../config/siteConfig';
import styles from './ApiSidebar.module.css';

const ApiSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, isSidebarOpen, isMobile } = useSelector((state) => state.memberPanel);
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

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
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/api-panel/dashboard' },
    // Mirrors the member panel's "All Report" menu (same icon, same order, same
    // report components) so both panels show identical reporting.
    {
      name: 'All Report',
      icon: <FaFileAlt />,
      hasChildren: true,
      children: [
        { name: 'AEPS History', path: '/api-panel/dashboard/report/aeps' },
        { name: 'DMT History', path: '/api-panel/dashboard/report/dmt' },
        { name: 'Payout History', path: '/api-panel/dashboard/report/payout' },
        { name: 'MATM History', path: '/api-panel/dashboard/report/matm' },
        { name: 'Recharge History', path: '/api-panel/dashboard/report/recharge' },
        { name: 'BBPS History', path: '/api-panel/dashboard/report/bbps' },
        { name: 'Business Summary', path: '/api-panel/dashboard/report/business' }
      ]
    },
    {
      name: 'Wallet Report',
      icon: <FaWallet />,
      hasChildren: true,
      // Wallet to Wallet stays member-panel only; Fund Request is its own
      // top-level entry below instead of a report.
      children: [
        { name: 'Main Wallet', path: '/api-panel/dashboard/wallet/main' },
        { name: 'AEPS Wallet', path: '/api-panel/dashboard/wallet/aeps' },
      ]
    },
    // Same Fund Top-Up Request page the member panel uses.
    {
      name: 'Fund Request',
      icon: <FaMoneyCheckAlt />,
      path: '/api-panel/dashboard/wallet/fund-request'
    },
    // API panel only runs the onboarding flow — Upload KYC stays member-only.
    {
      name: 'KYC',
      icon: <FaIdCard />,
      path: '/api-panel/dashboard/kyc/onboarding'
    },
    {
      name: 'Security Settings',
      icon: <FaCog />,
      hasChildren: true,
      children: [
        { name: 'Webhook Settings', icon: <FaLink />, path: '/api-panel/dashboard/webhook' },
        { name: 'API Credentials & Whitelisting', icon: <FaNetworkWired />, path: '/api-panel/dashboard/whitelist' },
      ]
    },
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
        
        {/* Header with logo + toggle */}
        <div className={styles.sidebarHeader}>
          {isMobile ? (
            <div className={styles.mobileHeaderContent}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>Menu</span>
              <button 
                className={styles.closeSidebarBtn} 
                onClick={() => dispatch(setSidebarOpen(false))}
              >
                <FiX />
              </button>
            </div>
          ) : (
            <>
              {isSidebarOpen && (
                <img 
                  src="/images/browser_logo.jpeg" 
                  alt={SITE_CONFIG.shortName} 
                  className={styles.sidebarLogo} 
                />
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

        {/* Nav Menu */}
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

        {/* Floating Hover Popup for Collapsed Sidebar */}
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
      </aside>
    </>
  );
};

export default ApiSidebar;
