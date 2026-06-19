import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { API } from '../../api/endpoints';
import styles from '../../pages/TermsPage.module.css';

const TermsPage = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTerms = async () => {
      try {
        const data = await API.termsCondition.getAll();
        setTerms(data || []);
      } catch (err) {
        console.error("Failed to fetch terms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1>Terms and Conditions</h1>
        </div>
        <div className={styles.content}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#4E6080' }}>Loading terms and conditions...</div>
          ) : terms.length > 0 ? (
            terms.map((t) => (
              <div key={t.id} className={styles.section}>
                <h2>{t.name}</h2>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#4A5568', fontSize: '1rem' }}>
                  {t.description}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No terms and conditions content available.</div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsPage;
