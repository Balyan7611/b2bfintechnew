import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiShield, FiX } from 'react-icons/fi';
import styles from './ServiceGrid.module.css';
import ServiceQuickNav from './ServiceQuickNav';

const Insurance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [policyNumber, setPolicyNumber] = useState('');

  const providers = [
    { id: 'aditya', name: 'Aditya Birla Health Insurance', logo: 'https://logo.clearbit.com/adityabirlainsurance.com' },
    { id: 'aegon', name: 'Aegon Life Insurance', logo: 'https://logo.clearbit.com/aegonlife.com' },
    { id: 'aviva', name: 'Aviva Life Insurance', logo: 'https://logo.clearbit.com/avivaindia.com' },
    { id: 'bajaj-gen', name: 'Bajaj Allianz General Insurance', logo: 'https://logo.clearbit.com/bajajallianz.com' },
    { id: 'bajaj-life', name: 'Bajaj Allianz Life Insurance', logo: 'https://logo.clearbit.com/bajajallianz.com' },
    { id: 'bharti', name: 'Bharti Axa Life Insurance', logo: 'https://logo.clearbit.com/bhartiaxa.com' },
    { id: 'birla', name: 'Birla Sun Life Insurance', logo: 'https://logo.clearbit.com/adityabirlacapital.com' },
    { id: 'canara', name: 'Canara HSBC Oriental Bank', logo: 'https://logo.clearbit.com/canarahsbclife.com' },
    { id: 'chola', name: 'Chola Insurance', logo: 'https://logo.clearbit.com/cholainsurance.com' },
    { id: 'dhfl', name: 'DHFL Pramerica Life Insurance', logo: 'https://logo.clearbit.com/pramericalife.in' },
    { id: 'edelweiss', name: 'Edelweiss Tokio Life Insurance', logo: 'https://logo.clearbit.com/edelweisstokio.in' },
    { id: 'exide', name: 'Exide Life Insurance', logo: 'https://logo.clearbit.com/exidelife.in' },
    { id: 'future', name: 'Future Generali India Life', logo: 'https://logo.clearbit.com/futuregenerali.in' },
    { id: 'digit', name: 'Go Digit Insurance', logo: 'https://logo.clearbit.com/godigit.com' },
    { id: 'hdfc', name: 'HDFC Life Insurance Co. Ltd', logo: 'https://logo.clearbit.com/hdfclife.com' },
    { id: 'icici-gen', name: 'ICICI Lombard General Insurance', logo: 'https://logo.clearbit.com/icicilombard.com' },
    { id: 'icici-life', name: 'ICICI Prudential Life Insurance', logo: 'https://logo.clearbit.com/iciciprulife.com' },
    { id: 'idbi', name: 'IDBI Federal Life Insurance', logo: 'https://logo.clearbit.com/ageasfederal.com' },
    { id: 'lic', name: 'Life Insurance Corporation (LIC)', logo: 'https://logo.clearbit.com/licindia.in' },
    { id: 'kotak', name: 'Kotak Life Insurance', logo: 'https://logo.clearbit.com/kotaklife.com' },
    { id: 'max', name: 'Max Life Insurance', logo: 'https://logo.clearbit.com/maxlifeinsurance.com' },
    { id: 'pnb', name: 'PNB Metlife', logo: 'https://logo.clearbit.com/pnbmetlife.com' },
    { id: 'sbi', name: 'SBI Life Insurance', logo: 'https://logo.clearbit.com/sbilife.co.in' },
    { id: 'tata-aia', name: 'Tata AIA Life Insurance', logo: 'https://logo.clearbit.com/tataaia.com' },
    { id: 'tata-aig', name: 'TATA AIG General Insurance', logo: 'https://logo.clearbit.com/tataaig.com' },
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Insurance Payment</h1>
          <p className={styles.subtitle}>Pay your insurance premiums easily</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div className={styles.searchSection}>
        <FiSearch className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search for insurance provider..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <FiShield size={16} color="#2ecc71" /> All Providers
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
              <span className={styles.providerType}>Insurance Provider</span>
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
                <h2 className={styles.modalTitle}>INSURANCE Bill Payment Done!</h2>
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
                  <span className={styles.selectedName}>{selectedProvider.name}(537)</span>
                </div>
                <button className={styles.editBtn} onClick={() => setSelectedProvider(null)}>EDIT</button>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <input type="text" className={styles.inputField} placeholder="POLICY NO" />
                  <p className={styles.validationText}>Please Enter Valid POLICY NO(Min. 0 to Max. 9)</p>
                </div>

                <div className={styles.formGroup}>
                  <input type="text" className={styles.inputField} placeholder="Date Of Birth/dd-mm-yyyy" />
                  <p className={styles.validationText}>Please Enter Valid Date Of Birth/dd-mm-yyyy(Min. 0 to Max. 10)</p>
                </div>

                <div className={styles.formGroup}>
                  <input type="text" className={styles.inputField} placeholder="Mobile Number" />
                  <p className={styles.validationText}>Please Enter Valid Mobile Number(Min. 0 to Max. 10)</p>
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

export default Insurance;
