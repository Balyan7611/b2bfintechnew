import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiCalendar, FiUser, FiActivity, FiChevronLeft, FiChevronRight, FiDatabase, FiSliders
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { 
  setEntriesToShow, setSearchTerm, setLoading 
} from '../../../store/slices/walletSlice';
import styles from '../MemberPages/MemberPages.module.css';

const WalletSummary = () => {
  const dispatch = useDispatch();
  const { entriesToShow, searchTerm, isLoading, walletSummaryData = [] } = useSelector(state => state.wallet);
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    memberId: '',
    mode: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({ fromDate: '', toDate: '', memberId: '', mode: '' });
  };

  const hasFilters = Object.values(filters).some(val => val !== '');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    dispatch(setLoading(true));
    setTimeout(() => dispatch(setLoading(false)), 800);
  };

  return (
    <div className={styles.container} style={{ padding: '15px', maxWidth: '100%' }}>
      {/* ── INLINE FILTER CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, padding: '15px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSliders /> Wallet Summary
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiCalendar /> From Date</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>
            
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiCalendar /> To Date</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiUser /> Member ID</label>
              <select name="memberId" value={filters.memberId} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">Select Member</option>
                <option value="M001">M001 (Ram Prasad)</option>
                <option value="M002">M002 (Shyam Kumar)</option>
                <option value="M003">M003 (Amit Singh)</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiActivity /> Select Mode</label>
              <select name="mode" value={filters.mode} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">All Modes</option>
                <option value="dr">Dr (Debit)</option>
                <option value="cr">Cr (Credit)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isLoading} style={{ 
                height: '36px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', flex: 1,
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {isLoading ? <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <><FiSearch /> Search</>}
              </button>
              
              {hasFilters && (
                <button type="button" onClick={handleClear} style={{ 
                  height: '36px', background: '#F1F5F9', flex: 1,
                  color: '#4E6080', border: '1px solid #E2E8F0', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ── REPORT TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <div className="global-table-toolbar" style={{ padding: '12px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              style={{ borderRadius: '6px', border: '1px solid #E2E8F0', height: '30px', padding: '0 8px' }} 
              value={entriesToShow}
              onChange={(e) => dispatch(setEntriesToShow(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" style={{ width: '32px', height: '32px' }} title="Copy Table"><FaCopy size={12} /></button>
            <button className="global-export-btn btn-excel" style={{ width: '32px', height: '32px' }} title="Download Excel"><FaFileExcel size={12} /></button>
            <button className="global-export-btn btn-pdf" style={{ width: '32px', height: '32px' }} title="Download PDF"><FaFilePdf size={12} /></button>
            <button className="global-export-btn btn-csv" style={{ width: '32px', height: '32px' }} title="Download CSV"><FaFileCsv size={12} /></button>
            <button className="global-export-btn btn-print" style={{ width: '32px', height: '32px' }} title="Print Table"><FaPrint size={12} /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '250px', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0 10px', height: '32px' }}>
            <FiSearch style={{ color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', paddingLeft: '8px' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '40px', padding: '10px 15px', fontSize: '0.75rem' }}>SL</th>
                <th style={{ width: '180px', padding: '10px 15px', fontSize: '0.75rem' }}>USER NAME</th>
                <th style={{ width: '140px', padding: '10px 15px', fontSize: '0.75rem' }}>PACKAGE NAME</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>MAIN WALLET CR</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>MAIN WALLET DR</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>MAIN BALANCE</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>AEPS WALLET CR</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>AEPS WALLET DR</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>AEPS BALANCE</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>HOLD AMOUNT</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>TOTAL BALANCE</th>
                <th style={{ padding: '10px 15px', fontSize: '0.75rem', width: '150px' }}>PARENT NAME</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12" style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading summary data...</span></div></td>
                </tr>
              ) : walletSummaryData.length === 0 ? (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan="12" style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available. Apply filters to view records.</span>
                    </td>
                  </tr>
                  <tr style={{ height: '40px' }}><td colSpan="12" style={{ border: 'none' }}></td></tr>
                </>
              ) : (
                walletSummaryData.map((item, index) => (
                  <tr key={index} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#1756AA', fontSize: '0.85rem', fontWeight: 800 }}>{item.member || 'N/A'}</span>
                        <small style={{ color: '#718096', fontSize: '0.7rem', fontWeight: 600 }}>Code: {item.memberCode || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <div style={{ background: 'rgba(23, 86, 170, 0.05)', color: '#1756AA', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }}>
                        {item.package || 'Default'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#27AE60' }}>+{item.mainCr || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#E53E3E' }}>-{item.mainDr || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>₹{item.mainBal || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#27AE60' }}>+{item.aepsCr || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#E53E3E' }}>-{item.aepsDr || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>₹{item.aepsBal || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#D97706' }}>₹{item.holdAmount || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>₹{item.totalBal || '0.00'}</td>
                    <td>
                      <div style={{ color: '#4E6080', fontSize: '0.8rem', fontWeight: 600 }}>
                        {item.parentName || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Showing 0 to 0 of 0 records</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronLeft size={14} /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#1756AA', color: 'white', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSummary;
