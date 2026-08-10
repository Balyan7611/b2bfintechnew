import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiDroplet, FiX } from 'react-icons/fi';
import styles from './Water.module.css';
import ServiceQuickNav from './ServiceQuickNav';

const Water = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [consumerNumber, setConsumerNumber] = useState('');

  const providers = [
    { id: 'bwssb', name: 'Bangalore Water Supply (BWSSB)', logo: 'https://logo.clearbit.com/bwssb.gov.in' },
    { id: 'bhopal', name: 'Bhopal Municipal Corporation', logo: '' },
    { id: 'djb', name: 'Delhi Jal Board', logo: 'https://logo.clearbit.com/delhijalboard.nic.in' },
    { id: 'warangal', name: 'Greater Warangal Municipal Corporation', logo: '' },
    { id: 'gwalior', name: 'Gwalior Municipal Corporation', logo: '' },
    { id: 'hyderabad', name: 'Hyderabad Metro Water (HMWSSB)', logo: 'https://logo.clearbit.com/hyderabadwater.gov.in' },
    { id: 'indore', name: 'Indore Municipal Corporation', logo: '' },
    { id: 'jabalpur', name: 'Jabalpur Municipal Corporation', logo: '' },
    { id: 'mcgm', name: 'MCGM Water Department', logo: 'https://logo.clearbit.com/mcgm.gov.in' },
    { id: 'chandigarh', name: 'Municipal Corporation Chandigarh', logo: '' },
    { id: 'jalandhar', name: 'Municipal Corporation Jalandhar', logo: '' },
    { id: 'ludhiana', name: 'Municipal Corporation Ludhiana', logo: '' },
    { id: 'faridabad', name: 'Municipal Corporation of Faridabad', logo: '' },
    { id: 'gurugram', name: 'Municipal Corporation of Gurugram', logo: '' },
    { id: 'mysuru', name: 'Mysuru City Corporation', logo: '' },
    { id: 'ndmc', name: 'New Delhi Municipal Council (NDMC)', logo: 'https://logo.clearbit.com/ndmc.gov.in' },
    { id: 'pune', name: 'Pune Municipal Corporation Water', logo: 'https://logo.clearbit.com/pmc.gov.in' },
    { id: 'ranchi', name: 'Ranchi Municipal Corporation', logo: '' },
    { id: 'surat', name: 'Surat Municipal Corporation', logo: 'https://logo.clearbit.com/suratmunicipal.gov.in' },
    { id: 'bhiwadi', name: 'UIT Bhiwadi', logo: '' },
    { id: 'ujjain', name: 'Ujjain Nagar Nigam - PHED', logo: '' },
    { id: 'uttarakhand', name: 'Uttarakhand Jal Sansthan', logo: '' },
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Water Bill</h1>
          <p className={styles.subtitle}>Pay your water bills instantly across India</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div className={styles.searchSection}>
        <FiSearch className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search for your water board..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <FiDroplet size={16} color="#3498db" /> All Water Boards
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
              <span className={styles.providerType}>Water Supply Board</span>
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
                <h2 className={styles.modalTitle}>Water Bill Payment Done!</h2>
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
                  <span className={styles.selectedName}>{selectedProvider.name}(BWW)</span>
                </div>
                              </div>

              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="RR Number :" 
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                  />
                  <p className={styles.validationText}>Please Enter Valid RR Number :(Min. 1 to Max. 15)</p>
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

export default Water;
