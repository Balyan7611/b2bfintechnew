import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './WhatsAppFloat.module.css';

const WhatsAppFloat = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
            if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/910000000000"       target="_blank"
      rel="noopener noreferrer"
      className={`${styles.whatsappFloat} ${isScrolled ? styles.scrolled : ''}`}
      aria-label="Chat with us on WhatsApp"
    >
      <FaWhatsapp className={styles.whatsappIcon} />
      <span className={styles.tooltip}>Need Help? Chat with us</span>
    </a>
  );
};

export default WhatsAppFloat;
