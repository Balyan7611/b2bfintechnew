import React from 'react';
import styles from './ServiceTicker.module.css';
import { 
  FaMobileAlt, 
  FaTv, 
  FaLightbulb, 
  FaFingerprint, 
  FaMoneyBillWave, 
  FaCar, 
  FaIdCard, 
  FaServer, 
  FaUniversity 
} from 'react-icons/fa';

const services = [
  { name: 'Mobile Recharge', icon: <FaMobileAlt />, color: '#2563EB' },
  { name: 'DTH Recharge', icon: <FaTv />, color: '#10B981' },
  { name: 'AePS Services', icon: <FaFingerprint />, color: '#F59E0B' },
  { name: 'UPI Payout', icon: <FaUniversity />, color: '#8B5CF6' },
  { name: 'Money Transfer', icon: <FaMoneyBillWave />, color: '#EC4899' },
  { name: 'Electricity Bill', icon: <FaLightbulb />, color: '#FCD34D' },
  { name: 'Fastag Recharge', icon: <FaCar />, color: '#14B8A6' },
  { name: 'PAN Card API', icon: <FaIdCard />, color: '#3B82F6' },
  { name: 'BBPS API', icon: <FaServer />, color: '#06B6D4' },
];

const ServiceTicker = () => {
  return (
    <div className={styles.tickerContainer}>
      <div className={styles.tickerTrack}>
                {[...services, ...services, ...services].map((service, index) => (
          <div key={index} className={styles.tickerCard}>
            <div 
              className={styles.iconBox} 
              style={{ 
                color: service.color, 
                backgroundColor: `${service.color}1A`,                 border: `1px solid ${service.color}33`               }}
            >
              {service.icon}
            </div>
            <span className={styles.serviceName}>{service.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTicker;
