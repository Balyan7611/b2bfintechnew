import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiPackage, FiX } from 'react-icons/fi';
import styles from './ServiceGrid.module.css';
import ServiceQuickNav from './ServiceQuickNav';

const Gas = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [consumerNumber, setConsumerNumber] = useState('');

  const providers = [
    { id: 'aavantika', name: 'Aavantika Gas Ltd', logo: 'https://logo.clearbit.com/aglonline.net' },
    { id: 'adani', name: 'Adani Gas', logo: 'https://logo.clearbit.com/adanigas.com' },
    { id: 'bhagyanagar', name: 'Bhagyanagar Gas Limited', logo: 'https://logo.clearbit.com/bglgas.com' },
    { id: 'centralup', name: 'Central U.P. Gas Limited', logo: 'https://logo.clearbit.com/cugl.co.in' },
    { id: 'charotar', name: 'Charotar Gas Sahakari Mandali', logo: '' },
    { id: 'gail', name: 'Gail Gas Limited', logo: 'https://logo.clearbit.com/gailgas.com' },
    { id: 'greengas', name: 'Green Gas Limited (GGL)', logo: 'https://logo.clearbit.com/gglonline.net' },
    { id: 'gujarat', name: 'Gujarat Gas', logo: 'https://logo.clearbit.com/gujaratgas.com' },
    { id: 'haryana', name: 'Haryana City Gas', logo: 'https://logo.clearbit.com/haryanacitygas.com' },
    { id: 'ig-adani', name: 'Indian Oil-Adani Gas', logo: 'https://logo.clearbit.com/ioagl.com' },
    { id: 'indraprastha', name: 'Indraprastha Gas', logo: 'https://logo.clearbit.com/iglonline.net' },
    { id: 'irm', name: 'IRM Energy Private Limited', logo: 'https://logo.clearbit.com/irmenergy.com' },
    { id: 'mahanagar', name: 'Mahanagar Gas', logo: 'https://logo.clearbit.com/mahanagargas.com' },
    { id: 'maharashtra', name: 'Maharashtra Natural Gas Limited', logo: 'https://logo.clearbit.com/mngl.in' },
    { id: 'sabarmati', name: 'Sabarmati Gas Limited (SGL)', logo: 'https://logo.clearbit.com/sabarmatigas.com' },
    { id: 'torrent', name: 'Torrent Gas', logo: 'https://logo.clearbit.com/torrentgas.com' },
    { id: 'tripura', name: 'Tripura Natural Gas', logo: '' },
    { id: 'vadodara', name: 'Vadodara Gas Limited', logo: 'https://logo.clearbit.com/vgl.co.in' },
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Piped Gas</h1>
          <p className={styles.subtitle}>Pay your piped gas bills instantly</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div className={styles.searchSection}>
        <FiSearch className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search for your gas provider..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <FiPackage size={16} color="#e67e22" /> All Providers
      </h2>

      <div className={styles.grid}>
        {filteredProviders.map((provider) => (
          <div key={provider.id} className={styles.card} onClick={() => setSelectedProvider(provider)}>
            <div className={styles.logoWrapper}>
              <img 
                src={provider.logo} 
                alt="" 
                className={styles.logoImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#1c3b72' }}>
                {provider.name[0]}
              </div>
            </div>
            <div className={styles.info}>
              <span className={styles.providerName}>{provider.name}</span>
              <span className={styles.providerType}>Gas Provider</span>
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
                <h2 className={styles.modalTitle}>GAS Bill Payment Done!</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedProvider(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.providerSelectionRow}>
                <div className={styles.providerInfo}>
                  <div className={styles.selectedLogo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#1c3b72' }}>
                    {selectedProvider.logo ? <img src={selectedProvider.logo} alt="" style={{ width: '100%' }} /> : selectedProvider.name[0]}
                  </div>
                  <span className={styles.selectedName}>{selectedProvider.name}(AGG)</span>
                </div>
                <button className={styles.editBtn} onClick={() => setSelectedProvider(null)}>EDIT</button>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="Customer No :" 
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                  />
                  <p className={styles.validationText}>Please Enter Valid Customer No :(Min. 10 to Max. 15)</p>
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

export default Gas;
