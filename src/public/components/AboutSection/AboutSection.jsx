import { useContext, useEffect, useRef, useState } from 'react';
import { FaArrowRight, FaCogs, FaHeadset, FaServer, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { BrandContext } from '../../../context/BrandContext';
import styles from './AboutSection.module.css';

const AnimatedCounter = ({ end, duration = 2000, suffix = '', isFloat = false }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    let startTime;
    let observer;

    const startAnimation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min((progress / duration) * end, end);
      
      setCount(current);

      if (progress < duration) {
        requestAnimationFrame(startAnimation);
      } else {
        setCount(end);
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(startAnimation);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (nodeRef.current) observer.observe(nodeRef.current);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [end, duration]);

  return (
    <span ref={nodeRef}>
      {isFloat ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
};

const AboutSection = () => {
  const dynamicConfig = useContext(BrandContext);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll(`.${styles.animateOnScroll}`);
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: FaUsers, end: 500, suffix: '+', label: 'Retailers', color: 'var(--color-secondary)' },
    { icon: FaCogs, end: 6, suffix: '', label: 'Services', color: 'var(--color-accent)' },
    { icon: FaServer, end: 99.9, suffix: '%', label: 'Uptime', color: 'var(--color-success)', isFloat: true },
    { icon: FaHeadset, end: 24, suffix: '/7', label: 'Support', color: 'var(--color-primary)' },
  ];

  return (
    <section id="about" className={styles.aboutSection} ref={sectionRef}>
      <div className="container">
        <div className={styles.aboutContent}>
                    <div className={`${styles.leftContent} ${styles.animateOnScroll}`}>
            <span className="sectionLabel">About Us</span>
            <h2 className="sectionTitle">Welcome To {SITE_CONFIG.shortName}</h2>
            
            <h3 className={styles.subHeading}>Empowering Retailers with Next-Gen Digital Finance</h3>
            
            <p className={styles.paragraph}>
              We provide a complete B2B ecosystem for digital services. From seamless utility payments to ultra-fast payouts, we deliver highly secure and reliable solutions that help our partners scale effortlessly.
            </p>
            
            <div className={styles.statsInlineCard}>
              <div className={styles.smallStatsGrid}>
                {stats.map((stat, index) => (
                  <div key={index} className={styles.smallStatItem}>
                    <div className={styles.smallStatNumber}>
                      <AnimatedCounter end={stat.end} suffix={stat.suffix} isFloat={stat.isFloat} duration={1000} />
                    </div>
                    <div className={styles.smallStatLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="#services" className={styles.knowMoreBtn}>
              Know More <FaArrowRight />
            </Link>
          </div>

                    <div className={`${styles.rightContent} ${styles.animateOnScroll}`}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageBackdrop}></div>
              <img 
                src="/images/About_page.png" 
                alt={`About ${SITE_CONFIG.brandName}`} 
                className={styles.aboutImage} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
