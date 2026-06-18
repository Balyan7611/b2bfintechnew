import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMobileAlt, FaBolt, FaCreditCard, FaLock, 
  FaMoneyBillWave, FaUniversity, FaArrowRight,
  FaChevronLeft, FaChevronRight, FaExchangeAlt, FaFingerprint
} from 'react-icons/fa';
import { BrandContext } from '../../../context/BrandContext';
import styles from './ServicesSection.module.css';

const iconMap = {
  FaMobileAlt,
  FaBolt,
  FaCreditCard,
  FaLock,
  FaMoneyBillWave,
  FaUniversity,
  FaExchangeAlt,
  FaFingerprint
};

const ServicesSection = () => {
  const dynamicConfig = useContext(BrandContext);
  const services = dynamicConfig.services || [];
  
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
      const header = sectionRef.current.querySelector(`.${styles.sectionHeader}`);
      if (header) observer.observe(header);
    }

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
  };

  return (
    <section id="services" className={styles.servicesSection} ref={sectionRef}>
      <div className="container">
        <div className={`${styles.sectionHeader}`}>
          <span className="sectionLabel">Our Services</span>
          <h2 className="sectionTitle">We Offer The Best Service To Our Customer</h2>
        </div>

        <div className={styles.carouselContainer}>
          <button className={styles.carouselBtn} onClick={prevSlide} aria-label="Previous service">
            <FaChevronLeft />
          </button>

          <div className={styles.cardsWrapper}>
            {services.map((service, index) => {
              let positionClass = styles.cardHiddenRight;
              
              if (index === activeIndex) {
                positionClass = styles.cardCenter;
              } else if (index === activeIndex - 1 || (activeIndex === 0 && index === services.length - 1)) {
                positionClass = styles.cardLeft;
              } else if (index === activeIndex + 1 || (activeIndex === services.length - 1 && index === 0)) {
                positionClass = styles.cardRight;
              } else if (index < activeIndex) {
                positionClass = styles.cardHiddenLeft;
              }

              return (
                <div 
                  key={index} 
                  className={`${styles.serviceCard} ${positionClass}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <div 
                    className={styles.iconWrapper}
                    style={{ backgroundColor: `${service.color}15`, color: service.color }}
                  >
                    {iconMap[service.iconName] ? React.createElement(iconMap[service.iconName]) : <FaBolt />}
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <Link to="#" className={styles.readMoreLink}>
                    Read More <FaArrowRight />
                  </Link>
                </div>
              );
            })}
          </div>

          <button className={styles.carouselBtn} onClick={nextSlide} aria-label="Next service">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
