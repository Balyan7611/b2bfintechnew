import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSmartphone, FiPhone, FiRadio, FiZap, FiDroplet, FiPackage, FiShield,
  FiPhoneCall, FiCreditCard, FiMonitor, FiHome, FiChevronLeft, FiChevronRight,
  FiEye, FiEyeOff, FiList
} from 'react-icons/fi';
import { FaMoneyBillWave, FaUniversity, FaFingerprint, FaQrcode, FaIdCard } from 'react-icons/fa';
import styles from './ServiceQuickNav.module.css';

const services = [
  { name: 'RECHARGE', icon: <FiSmartphone />, color: '#1a5fb4', path: '/member/dashboard/service/mobile-recharge' },
  { name: 'POSTPAID', icon: <FiPhone />, color: '#6b21a8', path: '/member/dashboard/service/mobile-postpaid' },
  { name: 'DTH', icon: <FiRadio />, color: '#0d9488', path: '/member/dashboard/service/dth' },
  { name: 'ELECTRICITY', icon: <FiZap />, color: '#b45309', path: '/member/dashboard/service/electricity' },
  { name: 'WATER', icon: <FiDroplet />, color: '#1d4ed8', path: '/member/dashboard/service/water' },
  { name: 'GAS', icon: <FiPackage />, color: '#9a3412', path: '/member/dashboard/service/gas' },
  { name: 'LPG', icon: <FiPackage />, color: '#9d174d', path: '/member/dashboard/service/lpg' },
  { name: 'INSURANCE', icon: <FiShield />, color: '#15803d', path: '/member/dashboard/service/insurance' },
  { name: 'LANDLINE', icon: <FiPhoneCall />, color: '#1e40af', path: '/member/dashboard/service/landline' },
  { name: 'FASTAG', icon: <FiCreditCard />, color: '#0f172a', path: '/member/dashboard/service/fastag' },
  { name: 'CABLE TV', icon: <FiMonitor />, color: '#c2410c', path: '/member/dashboard/service/cable-tv' },
  { name: 'MUNICIPAL', icon: <FiHome />, color: '#0f766e', path: '/member/dashboard/service/municipal-tax' },
  { name: 'DMT', icon: <FaMoneyBillWave />, color: '#1756AA', path: '/member/dashboard/service/dmt' },
  { name: 'PAYOUT', icon: <FaUniversity />, color: '#e11d48', path: '/member/dashboard/service/payout' },
  { name: 'AEPS', icon: <FaFingerprint />, color: '#43A047', path: '/member/dashboard/service/aeps' },
  { name: 'AADHARPAY', icon: <FaFingerprint />, color: '#0d9488', path: '/member/dashboard/service/aadharpay' },
  { name: 'UPI CASHOUT', icon: <FaQrcode />, color: '#1A237E', path: '/member/dashboard/service/upicashout' },
  { name: 'PAN', icon: <FaIdCard />, color: '#b45309', path: '/member/dashboard/service/pan' },
];

const ServiceQuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const activeItemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
    if (isVisible && activeItemRef.current && scrollRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [location.pathname, isVisible]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 200;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className={`${styles.quickNavWrapper} ${!isVisible ? styles.hiddenWrapper : ''}`}>
      <button 
        className={`${styles.toggleBtn} ${!isVisible ? styles.toggleBtnHidden : ''}`} 
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? (
          <>
            <FiEyeOff size={16} />
            <span className={styles.hideText}>HIDE</span>
          </>
        ) : (
          <>
            <FiEye size={14} />
            <span className={styles.toggleText}>SERVICES</span>
          </>
        )}
      </button>

      {isVisible && (
        <div className={styles.navContainer}>
          <button onClick={() => scroll('left')} className={styles.scrollBtn}>
            <FiChevronLeft />
          </button>
          
          <div className={styles.scrollContainer} ref={scrollRef}>
            {services.map((service) => {
              const isActive = location.pathname === service.path;
              return (
                <div 
                  key={service.name} 
                  ref={isActive ? activeItemRef : null}
                  className={`${styles.serviceItem} ${isActive ? styles.active : ''}`}
                  onClick={() => navigate(service.path)}
                >
                  <div 
                    className={styles.iconBox} 
                    style={{ 
                      '--service-color': service.color,
                      color: isActive ? '#fff' : service.color,
                      backgroundColor: isActive ? service.color : `${service.color}12`
                    }}
                  >
                    {service.icon}
                  </div>
                  <span className={styles.serviceName}>{service.name}</span>
                </div>
              );
            })}
          </div>

          <button onClick={() => scroll('right')} className={styles.scrollBtn}>
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceQuickNav;
