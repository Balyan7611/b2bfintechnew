import { useContext, useState } from 'react';
import {
  FaChevronDown,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { BrandContext } from '../../../context/BrandContext';
import styles from './Footer.module.css';

const Footer = () => {
  const dynamicConfig = useContext(BrandContext);
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const handleLinkClick = (e, path) => {
    if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (path.startsWith('/#')) {
      const targetId = path.substring(2);
      
      if (location.pathname !== '/') {
        e.preventDefault();
        navigate(path);
      } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          const y = targetElement.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
          window.history.pushState(null, '', path);
        }
      }
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/#about' },
    { name: 'Our Services', path: '/#services' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Refund & Cancellation', path: '/refund' },
  ];

  const contactItems = [
    { icon: FaPhone, href: `tel:${SITE_CONFIG.phone}`, text: SITE_CONFIG.phone, isLink: true },
    { icon: FaEnvelope, href: `mailto:${SITE_CONFIG.email}`, text: SITE_CONFIG.email, isLink: true },
    { icon: FaMapMarkerAlt, href: null, text: SITE_CONFIG.address, isLink: false },
  ];

  const socialLinks = [
    { icon: FaFacebook,  url: SITE_CONFIG.faceBook  || '#', label: 'Facebook' },
    { icon: FaTwitter,   url: SITE_CONFIG.twiter     || '#', label: 'Twitter' },
    { icon: FaLinkedin,  url: '#',                          label: 'LinkedIn' },
    { icon: FaInstagram, url: SITE_CONFIG.instagram  || '#', label: 'Instagram' },
  ];

  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">

        {/* ========== DESKTOP LAYOUT ========== */}
        <div className={styles.desktopFooter}>
          {/* Brand Column */}
          <div className={styles.brandColumn}>
            <Link to="/" className={styles.footerLogo}>
              <img
                src={SITE_CONFIG.logo}
                alt={`${SITE_CONFIG.companyName} Logo`}
                className={styles.footerLogoImg}
              />
            </Link>
            <p className={styles.brandDescription}>
              {SITE_CONFIG.description}
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, i) => (
                <a key={i} href={social.url} className={styles.socialIcon} aria-label={social.label}>
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksColumn}>
            <h4 className={styles.columnTitle}>Quick Links</h4>
            <ul className={styles.linksList}>
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.path} 
                    className={styles.footerLink}
                    onClick={(e) => handleLinkClick(e, link.path)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.linksColumn}>
            <h4 className={styles.columnTitle}>Legal</h4>
            <ul className={styles.linksList}>
              {legalLinks.map((link, i) => (
                <li key={i}><Link to={link.path} className={styles.footerLink}>{link.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactColumn}>
            <h4 className={styles.columnTitle}>Contact</h4>
            <ul className={styles.contactList}>
              {contactItems.map((item, i) => (
                <li key={i}>
                  {item.isLink ? (
                    <a href={item.href} className={styles.contactLink}>
                      <item.icon className={styles.contactIcon} />
                      <span>{item.text}</span>
                    </a>
                  ) : (
                    <div className={styles.contactLink}>
                      <item.icon className={styles.contactIcon} />
                      <span>{item.text}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ========== MOBILE LAYOUT ========== */}
        <div className={styles.mobileFooter}>

          {/* 1. Brand Block */}
          <div className={styles.mobileBrand}>
            <Link to="/" className={styles.mobileLogoLink}>
              <img
                src={SITE_CONFIG.logo}
                alt={`${SITE_CONFIG.companyName} Logo`}
                className={styles.mobileLogoImg}
              />
            </Link>
            <p className={styles.mobileCompanyName}>{SITE_CONFIG.companyName}</p>
            <p className={styles.mobileDescription}>
              A trusted digital platform providing Recharge, BBPS, Bill Payment,
              Payment Gateway, Payout & MATM services.
            </p>
          </div>

          <div className={styles.mobileDivider} />

          {/* 2. Social Icons */}
          <div className={styles.mobileSocial}>
            {socialLinks.map((social, i) => (
              <a key={i} href={social.url} className={styles.mobileSocialBtn} aria-label={social.label}>
                <social.icon />
              </a>
            ))}
          </div>

          <div className={styles.mobileDivider} />

          {/* 3. Quick Links Accordion */}
          <div className={styles.mobileAccordion}>
            <button
              className={styles.accordionHeader}
              onClick={() => toggleSection('quick')}
              aria-expanded={openSection === 'quick'}
            >
              <span>Quick Links</span>
              <FaChevronDown
                className={`${styles.chevron} ${openSection === 'quick' ? styles.chevronOpen : ''}`}
              />
            </button>
            <div className={`${styles.accordionBody} ${openSection === 'quick' ? styles.accordionOpen : ''}`}>
              {quickLinks.map((link, i) => (
                <Link 
                  key={i} 
                  to={link.path} 
                  className={styles.accordionLink}
                  onClick={(e) => handleLinkClick(e, link.path)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.mobileDivider} />

          {/* 4. Legal Accordion */}
          <div className={styles.mobileAccordion}>
            <button
              className={styles.accordionHeader}
              onClick={() => toggleSection('legal')}
              aria-expanded={openSection === 'legal'}
            >
              <span>Legal</span>
              <FaChevronDown
                className={`${styles.chevron} ${openSection === 'legal' ? styles.chevronOpen : ''}`}
              />
            </button>
            <div className={`${styles.accordionBody} ${openSection === 'legal' ? styles.accordionOpen : ''}`}>
              {legalLinks.map((link, i) => (
                <Link key={i} to={link.path} className={styles.accordionLink}>{link.name}</Link>
              ))}
            </div>
          </div>

          <div className={styles.mobileDivider} />

          {/* 5. Contact Accordion */}
          <div className={styles.mobileAccordion}>
            <button
              className={styles.accordionHeader}
              onClick={() => toggleSection('contact')}
              aria-expanded={openSection === 'contact'}
            >
              <span>Contact</span>
              <FaChevronDown
                className={`${styles.chevron} ${openSection === 'contact' ? styles.chevronOpen : ''}`}
              />
            </button>
            <div className={`${styles.accordionBody} ${openSection === 'contact' ? styles.accordionOpen : ''}`}>
              {contactItems.map((item, i) => (
                item.isLink ? (
                  <a key={i} href={item.href} className={styles.accordionContactItem}>
                    <item.icon className={styles.accordionContactIcon} />
                    <span>{item.text}</span>
                  </a>
                ) : (
                  <div key={i} className={styles.accordionContactItem}>
                    <item.icon className={styles.accordionContactIcon} />
                    <span>{item.text}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className={styles.mobileDivider} />

          {/* 6. Bottom Bar */}
          <div className={styles.mobileBottomBar}>
            <p className={styles.mobileCopyright}>
              © {new Date().getFullYear()} {SITE_CONFIG.companyName}. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Desktop Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {SITE_CONFIG.companyName}. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

