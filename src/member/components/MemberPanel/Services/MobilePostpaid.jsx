import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiSmartphone, FiX, FiAlertCircle } from 'react-icons/fi';
import styles from './MobilePostpaid.module.css';
import ServiceQuickNav from './ServiceQuickNav';

const MobilePostpaid = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');

  const providers = [
    {
      id: 'airtel',
      name: 'Airtel',
      type: 'Postpaid',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Airtel_logo.svg',
      fallback: 'A'
    },
    {
      id: 'jio',
      name: 'Jio',
      type: 'Postpaid',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Reliance_Jio_Logo.svg',
      fallback: 'J'
    },
    {
      id: 'vi',
      name: 'Vodafone Idea (Vi)',
      type: 'Postpaid',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Vi_logo.svg',
      fallback: 'Vi'
    },
    {
      id: 'bsnl',
      name: 'BSNL',
      type: 'Postpaid',
      logo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/BSNL_Logo.svg',
      fallback: 'B'
    },
    {
      id: 'mtnl',
      name: 'MTNL',
      type: 'Postpaid',
      logo: 'https://upload.wikimedia.org/wikipedia/en/2/2a/MTNL_Logo.svg',
      fallback: 'M'
    },
  ];

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    setMobileNumber('');
    setError('');
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
  };

  const handleNext = () => {
    if (mobileNumber.length !== 10) {
      setError('Please Enter Valid Mobile Number : (Min. 10 to Max. 10)');
    } else {
      setError('');
      alert(`Proceeding for ${selectedProvider.name} with number ${mobileNumber}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Mobile Postpaid</h1>
          <p className={styles.subtitle}>Pay your bills securely</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div className={styles.searchSection}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search operator..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <FiSmartphone size={16} /> All Providers
      </h2>

      <div className={styles.grid}>
        {filteredProviders.map((provider) => (
          <div 
            key={provider.id} 
            className={styles.card} 
            onClick={() => handleProviderClick(provider)}
            data-id={provider.id}
          >
            <div className={styles.logoWrapper}>
              <img
                src={provider.logo}
                alt={provider.name}
                className={styles.logoImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className={styles.fallbackLogo}>
                {provider.fallback}
              </div>
            </div>
            <div className={styles.info}>
              <span className={styles.providerName}>{provider.name}</span>
              <span className={styles.providerType}>{provider.type}</span>
            </div>
            <FiChevronRight className={styles.arrow} />
          </div>
        ))}
      </div>

            {selectedProvider && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTopHeader}>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <FiX size={20} />
              </button>
              <p className={styles.modalSubtitle}>Bill Payment</p>
              <h2 className={styles.modalTitle}>
                Mobile Postpaid
              </h2>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.providerStrip}>
                <img src={selectedProvider.logo} alt="" className={styles.selectedLogo} />
                <span className={styles.selectedName}>{selectedProvider.name}</span>
                <button className={styles.editLink} onClick={handleCloseModal}>
                  Change
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Mobile Number</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setMobileNumber(val);
                      if (val.length === 10) setError('');
                    }}
                  />
                </div>
                {error && (
                  <p className={styles.inputError}>
                    <FiAlertCircle size={16} /> {error}
                  </p>
                )}
              </div>

              <button className={styles.nextBtn} onClick={handleNext}>
                Proceed to Pay <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Bills</h2>
        <div className={styles.recentCard}>
          No recent bills found.
        </div>
      </div>
    </div>
  );
};

export default MobilePostpaid;
