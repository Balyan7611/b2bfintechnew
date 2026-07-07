import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiZap, FiX } from 'react-icons/fi';
import styles from './Electricity.module.css';
import ServiceQuickNav from './ServiceQuickNav';
import { useFetchServices } from '../../../../hooks/useFetchServices';

const Electricity = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [consumerNumber, setConsumerNumber] = useState('');
  
  const { services, loading: servicesLoading } = useFetchServices(2);

  const providers = [
    { id: 'adani', name: 'Adani Electricity Mumbai Limited', logo: 'https://logo.clearbit.com/adani.com' },
    { id: 'ajmer', name: 'Ajmer Vidyut Vitran Nigam - RAJASTHAN', logo: 'https://logo.clearbit.com/avvnl.com' },
    { id: 'apepdcl', name: 'Andhra Pradesh Eastern Power Distribution', logo: 'https://logo.clearbit.com/apeasternpower.com' },
    { id: 'bescom', name: 'BESCOM - BENGALURU', logo: 'https://logo.clearbit.com/bescom.org' },
    { id: 'besl', name: 'BESL - BHARATPUR', logo: 'https://logo.clearbit.com/cesc.co.in' },
    { id: 'best', name: 'BEST - MUMBAI', logo: 'https://logo.clearbit.com/bestundertaking.com' },
    { id: 'bkesl', name: 'Bikaner Electricity Supply Limited', logo: 'https://logo.clearbit.com/cesc.co.in' },
    { id: 'bsesr', name: 'BSES Rajdhani - DELHI', logo: 'https://logo.clearbit.com/bsesdelhi.com' },
    { id: 'bsesy', name: 'BSES Yamuna - DELHI', logo: 'https://logo.clearbit.com/bsesdelhi.com' },
    { id: 'cescwb', name: 'CESC - WEST BENGAL', logo: 'https://logo.clearbit.com/cesc.co.in' },
    { id: 'cesu', name: 'CESU Odhisa', logo: 'https://logo.clearbit.com/cesuodisha.com' },
    { id: 'cescom', name: 'Chamundeshwari Electricity Supply', logo: 'https://logo.clearbit.com/cescmysore.org' },
    { id: 'cspdcl', name: 'CSPDCL - CHHATTISGARH', logo: 'https://logo.clearbit.com/cspdcl.co.in' },
    { id: 'dvvnl', name: 'Dakshinanchal Vidyut Vitran Nigam', logo: 'https://logo.clearbit.com/dvvnl.org' },
    { id: 'dept-nagaland', name: 'Department of Power Nagaland', logo: '' },
    { id: 'dgvcl', name: 'DGVCL - GUJARAT', logo: 'https://logo.clearbit.com/dgvcl.com' },
    { id: 'dhbvn', name: 'DHBVN - HARYANA', logo: 'https://logo.clearbit.com/dhbvn.org.in' },
    { id: 'elec-chandi', name: 'Electricity Department Chandigarh', logo: '' },
    { id: 'goa-elec', name: 'Goa Electricity Department', logo: '' },
    { id: 'puducherry-elec', name: 'Government of Pudducherry', logo: '' },
    { id: 'gescom', name: 'Gulbarga Electricity Supply Company', logo: 'https://logo.clearbit.com/gescom.org' },
    { id: 'hp-elec', name: 'Himachal Pradesh Electricity', logo: 'https://logo.clearbit.com/hpseb.in' },
    { id: 'hescom', name: 'Hubli Electricity Supply Company', logo: 'https://logo.clearbit.com/hescom.co.in' },
    { id: 'jvvnl', name: 'Jaipur Vidyut Vitran Nigam', logo: 'https://logo.clearbit.com/energy.rajasthan.gov.in' },
    { id: 'jdvvnl', name: 'Jodhpur Vidyut Vitran Nigam', logo: 'https://logo.clearbit.com/energy.rajasthan.gov.in' },
    { id: 'kanpur-elec', name: 'Kanpur Electricity Supply Company', logo: 'https://logo.clearbit.com/kesco.co.in' },
    { id: 'kseb', name: 'Kerala State Electricity', logo: 'https://logo.clearbit.com/kseb.in' },
    { id: 'kedl', name: 'Kota Electricity Distribution Limited', logo: 'https://logo.clearbit.com/cesc.co.in' },
    { id: 'mp-madhya-rural', name: 'M.P. Madhya Kshetra Vidyut Vitran - RURAL', logo: 'https://logo.clearbit.com/mpcz.co.in' },
    { id: 'mp-madhya-urban', name: 'M.P. Madhya Kshetra Vidyut Vitran - URBAN', logo: 'https://logo.clearbit.com/mpcz.co.in' },
    { id: 'mp-poorv-rural', name: 'M.P. Poorv Kshetra Vidyut Vitran - RURAL', logo: 'https://logo.clearbit.com/mpez.co.in' },
    { id: 'mp-poorv-urban', name: 'M.P. Poorv Kshetra Vidyut Vitran - URBAN', logo: 'https://logo.clearbit.com/mpez.co.in' },
    { id: 'mescom', name: 'Mangalore Electricity (MESCOM)', logo: 'https://logo.clearbit.com/mescom.org.in' },
    { id: 'mseb', name: 'MSEB Mumbai', logo: 'https://logo.clearbit.com/mahadiscom.in' },
    { id: 'msedc', name: 'MSEDC - MAHARASHTRA', logo: 'https://logo.clearbit.com/mahadiscom.in' },
    { id: 'noida-power', name: 'Noida Power - NOIDA', logo: 'https://logo.clearbit.com/noidapower.com' },
    { id: 'north-bihar', name: 'North Bihar Power Distribution', logo: 'https://logo.clearbit.com/nbpdcl.co.in' },
    { id: 'odisha-discom', name: 'Odisha Discoms - ODISHA', logo: '' },
    { id: 'paschim-nigam', name: 'Paschimachal Vidyut Vitran Nigam', logo: 'https://logo.clearbit.com/pvvnl.org' },
    { id: 'pgvcl', name: 'PGVCL - GUJARAT', logo: 'https://logo.clearbit.com/pgvcl.com' },
    { id: 'pspcl', name: 'Punjab State Power Corporation', logo: 'https://logo.clearbit.com/pspcl.in' },
    { id: 'south-bihar', name: 'South Bihar Power Distribution', logo: 'https://logo.clearbit.com/sbpdcl.co.in' },
    { id: 'southco', name: 'SOUTHCO, Odisha', logo: '' },
    { id: 'tata-mumbai', name: 'Tata Power - Mumbai', logo: 'https://logo.clearbit.com/tatapower.com' },
    { id: 'tata-delhi', name: 'Tata Power (NDPL) - DELHI', logo: 'https://logo.clearbit.com/tatapower-ddl.com' },
    { id: 'torrent', name: 'Torrent Power', logo: 'https://logo.clearbit.com/torrentpower.com' },
    { id: 'ugvcl', name: 'UGVCL - GUJARAT', logo: 'https://logo.clearbit.com/ugvcl.com' },
    { id: 'uppcl-rural', name: 'Uttar Pradesh Power Corp Ltd - RURAL', logo: 'https://logo.clearbit.com/uppcl.org' },
    { id: 'uppcl-urban', name: 'Uttar Pradesh Power Corp Ltd - URBAN', logo: 'https://logo.clearbit.com/uppcl.org' },
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Electricity Bill</h1>
          <p className={styles.subtitle}>Pay your electricity bills instantly</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <select 
          className={styles.searchInput}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', appearance: 'auto' }}
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">{servicesLoading ? 'Loading services...' : 'Select Service'}</option>
          {services && services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className={styles.searchSection}>
        <FiSearch className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search for your electricity board..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <FiZap size={16} /> All Providers
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
              <span className={styles.providerType}>Electricity Board</span>
            </div>
            <FiChevronRight className={styles.arrow} />
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedProvider && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProvider(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitles}>
                <p className={styles.modalPreTitle}>Lets Get Your</p>
                <h2 className={styles.modalTitle}>Electricity Bill Payment Done!</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedProvider(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.providerSelectionRow}>
                <div className={styles.providerInfo}>
                  <img src={selectedProvider.logo} alt="" className={styles.selectedLogo} />
                  <span className={styles.selectedName}>{selectedProvider.name}(REE)</span>
                </div>
                <button className={styles.editBtn} onClick={() => setSelectedProvider(null)}>EDIT</button>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="Customer Number :" 
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                  />
                  <p className={styles.validationText}>Please Enter Valid Customer Number :(Min. 9 to Max. 9)</p>
                </div>

                <div className={styles.formGroup}>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="Cycle Number :" 
                  />
                  <p className={styles.validationText}>Please Enter Valid Cycle Number :(Min. 2 to Max. 2)</p>
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

export default Electricity;
