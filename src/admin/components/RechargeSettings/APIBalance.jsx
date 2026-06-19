import React from 'react';
import { useSelector } from 'react-redux';
import { FiDollarSign, FiSearch, FiDatabase, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';

const APIBalance = () => {
  const { apiBalances = [] } = useSelector(state => state.recharge);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>API Balance List</h3>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
              color: '#fff', border: 'none', borderRadius: '8px', 
              padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, 
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.8 : 1
            }}
          >
            <FiRefreshCw style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} /> 
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh All Balances'}</span>
          </button>
        </div>
        
        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', justifyContent: 'flex-end', borderBottom: 'none' }}>
          <div className="global-search-box" style={{ maxWidth: '300px', width: '100%' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search API gateway..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '120px' }}>API ID</th>
                <th style={{ width: '350px' }}>API NAME</th>
                <th style={{ textAlign: 'center' }}>AVAILABLE BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {apiBalances.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px 0', color: '#A0AEC0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0D1B3E', display: 'block', marginBottom: '4px' }}>No API balance data found</span>
                        <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>Check your API gateway connections</p>
                      </div></td>
                </tr>
              ) : (
                apiBalances.map((api) => (
                  <tr key={api.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 800, color: '#A0AEC0' }}>#{api.id}</td>
                    <td><span style={{ color: '#1756AA', fontWeight: 800 }}>{api.name}</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 900, color: api.balance?.includes('Invalid') ? '#E53E3E' : '#27AE60', fontSize: '1rem' }}>
                      {api.balance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER ── */}
        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {apiBalances.length > 0 ? 1 : 0} to {apiBalances.length} of {apiBalances.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIBalance;
