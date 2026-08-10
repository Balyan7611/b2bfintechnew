import { useEffect, useRef } from 'react';
import styles from './FeaturesSection.module.css';

const features = [
  {
    image: '/images/Features/fast_easy-removebg-preview.png',
    title: 'Fast & Easy Platform',
    description: 'Experience lightning-fast transactions with our highly optimized and user-friendly interface. Designed to minimize clicks and maximize your business efficiency.',
    color: '#00C2FF',
  },
  {
    image: '/images/Features/Access-removebg-preview.png',
    title: 'Access Anywhere, Anytime',
    description: 'Run your entire business from anywhere in the world. Our platform is 100% cloud-based and fully responsive across mobile, tablet, and desktop devices.',
    color: '#FF6B35',
  },
  {
    image: '/images/Features/secure_payment-removebg-preview.png',
    title: 'Bank-Grade Security',
    description: 'Security is our top priority. Every transaction is protected with end-to-end military-grade encryption, ensuring your data and funds are always safe.',
    color: '#10B981',
  },
  {
    image: '/images/Features/Support_team-removebg-preview.png',
    title: '24/7 Expert Support',
    description: 'Never face a business hurdle alone. Our dedicated support team is available round the clock via chat, email, and call to resolve any issues instantly.',
    color: '#A78BFA',
  },
];

const FeaturesSection = () => {
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

  return (
    <section id="features" className={styles.featuresSection} ref={sectionRef}>
            <div className={styles.bgOrb1}></div>
      <div className={styles.bgOrb2}></div>

      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateOnScroll} ${styles.slideInUp}`}>
          <span className="sectionLabel" style={{ color: 'var(--color-secondary)' }}>Our Features</span>
          <p className={styles.sectionSubtitle}>
            Everything you need to run a successful digital service business
          </p>
        </div>

        <div className={styles.featuresList}>
          {features.map((feature, index) => {
            const isReverse = index % 2 !== 0;
            return (
              <div
                key={index}
                className={`${styles.featureRow} ${isReverse ? styles.rowReverse : ''}`}
              >
                                <div className={`${styles.textSide} ${styles.animateOnScroll} ${isReverse ? styles.slideInRight : styles.slideInLeft}`}>
                  <div className={styles.featureBadge} style={{ color: feature.color, backgroundColor: `${feature.color}1A` }}>
                    Feature 0{index + 1}
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>

                                <div className={`${styles.imageSide} ${styles.animateOnScroll} ${isReverse ? styles.slideInLeft : styles.slideInRight}`}>
                  <div className={styles.imageWrapper}>
                    <img 
                      src={process.env.PUBLIC_URL + feature.image} 
                      alt={feature.title}
                      className={styles.featureImg}
                    />
                    {/* Subtle glow behind image */}
                    <div className={styles.imageGlow} style={{ backgroundColor: feature.color }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
