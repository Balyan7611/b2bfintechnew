import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { API } from '../../api/endpoints';
import styles from '../../pages/PrivacyPolicyPage.module.css';

const PrivacyPolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPolicies = async () => {
      try {
        const data = await API.privacyPolicy.getAll();
        setPolicies(data || []);
      } catch (err) {
        console.error("Failed to fetch privacy policies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1>Privacy Policy</h1>
        </div>
        <div className={styles.content}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#4E6080' }}>Loading privacy policy...</div>
          ) : policies.length > 0 ? (
            policies.map((p) => (
              <div key={p.id} className={styles.section}>
                <h2>{p.name}</h2>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#4A5568', fontSize: '1rem' }}>
                  {p.description}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No privacy policy content available.</div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
