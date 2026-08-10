import { useEffect, useRef } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    quote: 'I have been using this platform for mobile recharge and bill payments. Transactions are fast, secure, and very reliable. It really helps in managing daily customer needs efficiently.',
    name: 'Harsh Vasuda',
    role: 'Retail Business Owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HarshVasuda&backgroundColor=b6e3f4',
  },
  {
    quote: 'BBPS and payout services are very smooth and easy to use. Payments are processed instantly without any issues. It has improved my business operations greatly.',
    name: 'Sachin Balyan',
    role: 'Digital Service Provider',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SachinBalyan&backgroundColor=ffd5dc',
  },
  {
    quote: 'The portal is user-friendly and offers multiple services in one place. Payment gateway works flawlessly and saves a lot of time for my business daily.',
    name: 'Rahul Sadnani',
    role: 'Franchise Partner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulSadnani&backgroundColor=c0aede',
  },
];

const TestimonialsSection = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll(`.${styles.animateOnScroll}`);
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.testimonialsSection} ref={sectionRef}>
            <div className={styles.bgDecor1}></div>
      <div className={styles.bgDecor2}></div>

      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateOnScroll}`}>
          <span className="sectionLabel">Testimonials</span>
          <h2 className="sectionTitle">Check How Happy Our Users Are!</h2>
          <p className={styles.subtitle}>Real stories from our valued partners across India</p>
        </div>

        <div className={styles.cardsGrid}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`${styles.card} ${styles.animateOnScroll}`}
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
                            <div className={styles.quoteWatermark}>
                <FaQuoteLeft />
              </div>

                            <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={styles.star} />
                ))}
              </div>

                            <p className={styles.quoteText}>{testimonial.quote}</p>

                            <div className={styles.author}>
                <div className={styles.avatarWrapper}>
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
