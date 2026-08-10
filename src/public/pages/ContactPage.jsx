import React, { useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../../shared/components/ScrollToTop/ScrollToTop';
import { SITE_CONFIG } from '../../config/siteConfig';
import styles from '../../pages/ContactPage.module.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
          <div className={`container ${styles.headerContent}`}>
            <h1 className={styles.pageTitle}>Get in Touch</h1>
            <p className={styles.pageSubtitle}>
              Have questions or need support? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>

        <div className="container">
                    <div className={styles.contactSplit}>
            
                        <div className={styles.leftSide}>
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.iconBox}><FaPhoneAlt /></div>
                  <div>
                    <h4>Call Us</h4>
                    <p>+91 {SITE_CONFIG.phone}</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.iconBox}><FaEnvelope /></div>
                  <div>
                    <h4>Email Us</h4>
                    <p>{SITE_CONFIG.email}</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.iconBox}><FaMapMarkerAlt /></div>
                  <div>
                    <h4>Visit Us</h4>
                    <p>{SITE_CONFIG.address}</p>
                  </div>
                </div>
              </div>
              <div className={styles.imageWrapper}>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                  alt="Contact Us Support Team" 
                  className={styles.contactImage} 
                />
              </div>
            </div>

                        <div className={styles.rightSide}>
              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Send a Message</h3>
                <form onSubmit={(e) => e.preventDefault()} className={styles.contactForm}>
                  <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input type="text" placeholder="e.g. John Doe" required />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input type="email" placeholder="e.g. john@example.com" required />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>Subject</label>
                    <input type="text" placeholder="How can we help you?" required />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>Message</label>
                    <textarea rows="5" placeholder="Write your message here..." required></textarea>
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    Send Message <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

                <div className="container">
          <div className={styles.mapCard}>
            <h2 className={styles.mapTitle}>Find Us on the Map</h2>
            <div className={styles.mapContainer}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15552.261971434913!2d77.58784860000001!3d12.96765365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%, Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title={`${SITE_CONFIG.brandName} Location`}
              ></iframe>
            </div>
          </div>
        </div>

      </div>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ContactPage;
