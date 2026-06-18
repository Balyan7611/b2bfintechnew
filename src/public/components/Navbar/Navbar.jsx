import { useContext, useEffect, useState } from 'react';
import { FaBars, FaConciergeBell, FaHome, FaInfoCircle, FaMoon, FaPhoneAlt, FaSignInAlt, FaSun, FaTimes, FaUserPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { BrandContext } from '../../../context/BrandContext';
import { setMobileMenuOpen, toggleDarkMode, toggleMobileMenu } from '../../../store/slices/uiSlice';
import styles from './Navbar.module.css';

const Navbar = () => {
  useContext(BrandContext);
  const dispatch = useDispatch();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname + location.hash);

  useEffect(() => {
    setActivePath(location.pathname + location.hash);
  }, [location.pathname, location.hash]);

  const { isNavScrolled, isMobileMenuOpen, isDarkMode } = useSelector((state) => state.ui);

  const navLinks = [
    { name: 'Home',         path: '/',          icon: FaHome },
    { name: 'About',        path: '/#about',    icon: FaInfoCircle },
    { name: 'Our Services', path: '/#services', icon: FaConciergeBell },
    { name: 'Contact',      path: '/contact',   icon: FaPhoneAlt },
  ];

  const handleLinkClick = (e, path) => {
    dispatch(setMobileMenuOpen(false));
    
    // Smooth scroll to top for Home link if already on homepage
    if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', path);
      setActivePath(path);
      return;
    }

    if (path.startsWith('/#')) {
      const targetId = path.substring(2);
      if (location.pathname === '/') {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const y = targetElement.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
          // Update URL without jumping
          window.history.pushState(null, '', path);
          setActivePath(path);
        }
      }
      // If not on homepage, let the Link naturally route to /#id, and HomePage's useEffect will handle the scroll.
    }
  };

  const closeMenu = () => {
    dispatch(setMobileMenuOpen(false));
  };

  return (
    <>
      <nav className={`${styles.navbar} ${isNavScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.navContent}>
            {/* Logo */}
            <Link to="/" className={styles.logo} onClick={(e) => handleLinkClick(e, '/')}>
              <div className={styles.logoIcon}>
                <img src={SITE_CONFIG.logo} alt={`${SITE_CONFIG.brandName} Logo`} className={styles.logoImg} />
              </div>

            </Link>

            {/* Desktop Navigation */}
            <div className={styles.desktopNav}>
              <ul className={styles.navLinks}>
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`${styles.navLink} ${activePath === link.path ? styles.active : ''}`}
                      onClick={(e) => handleLinkClick(e, link.path)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Dark Mode Toggle */}
              <button
                className={styles.themeToggle}
                onClick={() => dispatch(toggleDarkMode())}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <FaSun className={styles.sunIcon} /> : <FaMoon className={styles.moonIcon} />}
              </button>

              <div className={styles.authButtons}>
                <Link
                  to="/register"
                  className={styles.registerBtn}
                >
                  Register
                </Link>

                <Link to="/login" className={styles.loginBtn}>
                  Login
                </Link>
              </div>
            </div>

            {/* Mobile Right Controls */}
            <div className={styles.mobileControls}>
              <button
                className={styles.themeToggleMobile}
                onClick={() => dispatch(toggleDarkMode())}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FaSun className={styles.sunIcon} /> : <FaMoon className={styles.moonIcon} />}
              </button>
              <button
                className={styles.mobileMenuBtn}
                onClick={() => dispatch(toggleMobileMenu())}
                aria-label="Toggle menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== SIDE DRAWER OVERLAY ===== */}
      {/* Dark backdrop — tap to close */}
      <div
        className={`${styles.drawerOverlay} ${isMobileMenuOpen ? styles.overlayOpen : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <aside className={`${styles.drawer} ${isMobileMenuOpen ? styles.drawerOpen : ''}`}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderPlaceholder}></div>
          <button
            className={styles.drawerClose}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav Links */}
        <nav className={styles.drawerNav}>
          <ul className={styles.drawerLinks}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`${styles.drawerLink} ${activePath === link.path ? styles.drawerLinkActive : ''}`}
                  onClick={(e) => handleLinkClick(e, link.path)}
                >
                  <link.icon className={styles.drawerLinkIcon} />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer Footer — Action Buttons */}
        <div className={styles.drawerActions}>
          <Link
            to="/register"
            className={styles.drawerRegisterBtn}
            onClick={(e) => handleLinkClick(e, '/register')}
          >
            <FaUserPlus className={styles.drawerBtnIcon} />
            Register
          </Link>
          <Link
            to="/login"
            className={styles.drawerLoginBtn}
            onClick={(e) => handleLinkClick(e, '/login')}
          >
            <FaSignInAlt className={styles.drawerBtnIcon} />
            Login
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Navbar;