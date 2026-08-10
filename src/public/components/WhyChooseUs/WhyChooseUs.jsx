import { useContext, useEffect, useRef } from 'react';
import { FaArrowRight, FaBullseye, FaRocket } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { BrandContext } from '../../../context/BrandContext';
import styles from './WhyChooseUs.module.css';

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const dynamicConfig = useContext(BrandContext);

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

  return (
    <section className={styles.whyChooseSection} ref={sectionRef}>
      <div className="container">
        <div className={styles.whyChooseContent}>
                    <div className={`${styles.leftContent} ${styles.animateOnScroll}`}>
            <h2 className="sectionTitle">
              Grow Your Business With {SITE_CONFIG.companyName}
            </h2>
            <p className={styles.paragraph}>
              {SITE_CONFIG.companyName} provides a complete digital platform 
              for Recharge, BBPS, Credit Card Bill Payment, Payment Gateway, Payout, 
              and MATM services. Manage all your financial services easily from one 
              secure and reliable system.
            </p>
            <Link to="/register" className={styles.registerBtn}>
              Register Now <FaArrowRight />
            </Link>
          </div>

                    <div className={`${styles.rightContent} ${styles.animateOnScroll}`}>
            <div className={styles.cardsWrapper}>
              <div className={styles.visionCard}>
                <div className={styles.cardIcon} style={{ color: 'var(--color-secondary)' }}>
                  <FaBullseye />
                </div>
                <h3 className={styles.cardTitle}>Our Vision</h3>
                <p className={styles.cardText}>
                  To empower retailers and small businesses across India by providing 
                  easy access to digital financial services through a secure and 
                  user-friendly platform.
                </p>
              </div>

              <div className={styles.missionCard}>
                <div className={styles.cardIcon} style={{ color: 'var(--color-accent)' }}>
                  <FaRocket />
                </div>
                <h3 className={styles.cardTitle}>Our Mission</h3>
                <p className={styles.cardText}>
                  To deliver fast, secure, and reliable financial solutions that help 
                  our partners grow their business and serve customers efficiently with 
                  multiple services in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
