import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaWallet, FaShieldAlt
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
    { 
      name: 'Security Settings', 
      icon: <FaShieldAlt />, 
      hasChildren: true,
      children: [
        { name: 'API Whitelisting', path: '/api-panel/dashboard/whitelist' },
      ]
    },
    { 
      name: 'Wallet Report', 
      icon: <FaWallet />, 
      hasChildren: true,
      children: [
        { name: 'Wallet to Wallet', path: '/api-panel/dashboard/wallet/w2w' },
        { name: 'Fund Request', path: '/api-panel/dashboard/wallet/fund-request' },
        { name: 'Main Wallet', path: '/api-panel/dashboard/wallet/main' },
        { name: 'AEPS Wallet', path: '/api-panel/dashboard/wallet/aeps' },
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
