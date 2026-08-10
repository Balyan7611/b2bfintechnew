import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiPackage, FiX } from 'react-icons/fi';
import styles from './ServiceGrid.module.css';
import ServiceQuickNav from './ServiceQuickNav';

const LPGGas = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');

  const providers = [
    { id: 'bpcl', name: 'Bharat Petroleum (BPCL)', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Bharat_Petroleum_Logo.svg/1200px-Bharat_Petroleum_Logo.svg.png' },
    { id: 'hpcl', name: 'Hindustan Petroleum (HPCL)', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Hindustan_Petroleum_Logo.svg/1200px-Hindustan_Petroleum_Logo.svg.png' },
    { id: 'indane', name: 'Indane Gas (Indian Oil)', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Indian_Oil_Logo.svg/1200px-Indian_Oil_Logo.svg.png' },
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>LPG Gas Booking</h1>
          <p className={styles.subtitle}>Book your LPG cylinder instantly</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div className={styles.searchSection}>
        <FiSearch className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search for LPG provider..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <FiPackage size={16} color="#e91e63" /> All Operators
      </h2>

      <div className={styles.grid}>
        {filteredProviders.map((provider) => (
          <div key={provider.id} className={styles.card} onClick={() => setSelectedProvider(provider)}>
            <div className={styles.logoWrapper}>
              <img 
                src={provider.logo} 
                alt="" 
                className={styles.logoImg}
              />
            </div>
            <div className={styles.info}>
              <span className={styles.providerName}>{provider.name}</span>
              <span className={styles.providerType}>Cylinder Booking</span>
            </div>
            <FiChevronRight className={styles.arrow} />
          </div>
        ))}
      </div>

            {selectedProvider && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProvider(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitles}>
                <p className={styles.modalPreTitle}>Lets Get Your</p>
                <h2 className={styles.modalTitle}>Gas Booking Bill Payment Done!</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedProvider(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.providerSelectionRow}>
                <div className={styles.providerInfo}>
                  <img src={selectedProvider.logo} alt="" className={styles.selectedLogo} />
                  <span className={styles.selectedName}>{selectedProvider.name}(BPL)</span>
                </div>
                <button className={styles.editBtn} onClick={() => setSelectedProvider(null)}>EDIT</button>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="Registered Contact Number :" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  <p className={styles.validationText}>Please Enter Valid Registered Contact Number :(Min. 10 to Max. 10)</p>
                </div>

                <button className={styles.nextBtn}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LPGGas;
