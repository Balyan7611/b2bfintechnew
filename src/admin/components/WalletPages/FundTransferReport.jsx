import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiCalendar, FiUser, FiChevronLeft, FiChevronRight, FiSliders
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { 
  setEntriesToShow, setSearchTerm, setLoading 
} from '../../../store/slices/walletSlice';
import styles from '../MemberPages/MemberPages.module.css';

const FundTransferReport = () => {
  const dispatch = useDispatch();
  const { entriesToShow, searchTerm, isLoading } = useSelector(state => state.wallet);
  const sampleData = [];
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    memberId: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({ fromDate: '', toDate: '', memberId: '' });
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
          <FiSliders /> Manage Fund Transfer
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
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
                <option value="RT1236">RT1236</option>
                <option value="RT1237">RT1237</option>
                <option value="RT1238">RT1238</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isLoading} style={{ 
                height: '36px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', flex: 1, maxWidth: '150px',
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {isLoading ? <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></div> : <>Search</>}
              </button>
              
              {hasFilters && (
                <button type="button" onClick={handleClear} style={{ 
                  height: '36px', background: '#F1F5F9', width: '80px',
                  color: '#4E6080', border: '1px solid #E2E8F0', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
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
              placeholder="Search..." 
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
                <th style={{ width: '50px', padding: '10px 15px', fontSize: '0.75rem' }}>SR.NO</th>
                <th style={{ width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>USER ID</th>
                <th style={{ width: '160px', padding: '10px 15px', fontSize: '0.75rem' }}>USER NAME</th>
                <th style={{ width: '130px', padding: '10px 15px', fontSize: '0.75rem' }}>USER MOBILE</th>
                <th style={{ width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>SERVICE</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>AMOUNT CREDIT</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>AMOUNT DEBIT</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>OPENING AMOUNT</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>CLOSING BALANCE</th>
                <th style={{ width: '160px', padding: '10px 15px', fontSize: '0.75rem' }}>TRANSACTION ID</th>
                <th style={{ width: '200px', padding: '10px 15px', fontSize: '0.75rem' }}>NARRATION</th>
                <th style={{ width: '140px', padding: '10px 15px', fontSize: '0.75rem' }}>FROM</th>
                <th style={{ textAlign: 'right', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>TRANSFER DATE</th>
                <th style={{ textAlign: 'right', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>TRANSFER TIME</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="14" style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading records...</span></div></td>
                </tr>
              ) : sampleData.length === 0 ? (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan="14" style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span>
                    </td>
                  </tr>
                  {/* COMPACT EMPTY STATE TO AVOID LARGE HEIGHT */}
                  <tr style={{ height: '30px' }}><td colSpan="14" style={{ border: 'none' }}></td></tr>
                </>
              ) : (
                sampleData.map((item, index) => (
                  <tr key={index} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{index + 1}</td>
                    <td style={{ fontWeight: 800, color: '#1756AA' }}>{item.userId || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: '#4E6080' }}>{item.userName || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#718096' }}>{item.userMobile || 'N/A'}</td>
                    <td>
                      <span style={{ background: 'rgba(23, 86, 170, 0.05)', color: '#1756AA', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }}>
                        {item.service || 'N/A'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#27AE60' }}>+{item.amountCr || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#E53E3E' }}>-{item.amountDr || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.opening || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>₹{item.closing || '0.00'}</td>
                    <td><span style={{ fontWeight: 800, color: '#1756AA', fontSize: '0.85rem' }}>{item.txnId || 'N/A'}</span></td>
                    <td><div style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.75rem', color: '#718096', lineHeight: '1.4' }}>{item.narration || 'N/A'}</div></td>
                    <td style={{ fontWeight: 700, color: '#4E6080' }}>{item.from || 'N/A'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0D1B3E', fontSize: '0.8rem' }}>{item.transferDate || 'N/A'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#718096', fontSize: '0.8rem' }}>{item.transferTime || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Showing 0 to 0 of 0 entries</div>
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

export default FundTransferReport;
