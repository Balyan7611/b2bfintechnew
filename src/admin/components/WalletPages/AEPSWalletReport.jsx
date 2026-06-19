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

const AEPSWalletReport = () => {
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
          <FiSliders /> AEPS Wallet Report
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>From Date :</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>
            
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>To Date :</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>Member ID</label>
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
          <table className={styles.table} style={{ minWidth: '2600px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px', padding: '10px 12px', fontSize: '0.75rem' }}>S.NO</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>TRANSID</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>PARENT</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>USER</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>NUMBER</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>OPERATOR</th>
                <th style={{ width: '150px', padding: '10px 12px', fontSize: '0.75rem' }}>BENE ACCOUNT</th>
                <th style={{ textAlign: 'center', width: '110px', padding: '10px 12px', fontSize: '0.75rem' }}>AMOUNT</th>
                <th style={{ textAlign: 'center', width: '100px', padding: '10px 12px', fontSize: '0.75rem' }}>COST</th>
                <th style={{ textAlign: 'center', width: '110px', padding: '10px 12px', fontSize: '0.75rem' }}>COMM/CHARGE</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>OPERATOR ID</th>
                <th style={{ width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>API REF</th>
                <th style={{ textAlign: 'center', width: '130px', padding: '10px 12px', fontSize: '0.75rem' }}>REMAINING BAL</th>
                <th style={{ textAlign: 'center', width: '110px', padding: '10px 12px', fontSize: '0.75rem' }}>STATUS</th>
                <th style={{ textAlign: 'center', width: '100px', padding: '10px 12px', fontSize: '0.75rem' }}>MODE</th>
                <th style={{ width: '100px', padding: '10px 12px', fontSize: '0.75rem' }}>API</th>
                <th style={{ width: '140px', padding: '10px 12px', fontSize: '0.75rem' }}>REQ.DATE</th>
                <th style={{ width: '140px', padding: '10px 12px', fontSize: '0.75rem' }}>APPROVED DATE</th>
                <th style={{ width: '200px', padding: '10px 12px', fontSize: '0.75rem' }}>REASON</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="19" style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading records...</span></div></td>
                </tr>
              ) : sampleData.length === 0 ? (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan="19" style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span>
                    </td>
                  </tr>
                  {/* COMPACT EMPTY STATE */}
                  <tr style={{ height: '30px' }}><td colSpan="19" style={{ border: 'none' }}></td></tr>
                </>
              ) : (
                sampleData.map((item, index) => (
                  <tr key={index} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{index + 1}</td>
                    <td style={{ fontWeight: 800, color: '#1756AA' }}>{item.transId || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#4E6080' }}>{item.parent || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: '#0D1B3E' }}>{item.user || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#718096' }}>{item.number || 'N/A'}</td>
                    <td>
                      <span style={{ background: 'rgba(23, 86, 170, 0.05)', color: '#1756AA', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {item.operator || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#4E6080' }}>{item.beneAccount || 'N/A'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>₹{item.amount || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#E53E3E' }}>₹{item.cost || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#27AE60' }}>₹{item.commCharge || '0.00'}</td>
                    <td style={{ fontWeight: 600, color: '#718096' }}>{item.operatorId || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#718096' }}>{item.apiRef || 'N/A'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>₹{item.remainingBal || '0.00'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#E6F4EA', color: '#1E7E34', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {item.status || 'SUCCESS'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.mode || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#718096' }}>{item.api || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#4E6080', fontSize: '0.75rem' }}>{item.reqDate || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: '#4E6080', fontSize: '0.75rem' }}>{item.approvedDate || 'N/A'}</td>
                    <td><div style={{ maxWidth: '180px', whiteSpace: 'normal', fontSize: '0.75rem', color: '#718096', lineHeight: '1.4' }}>{item.reason || 'N/A'}</div></td>
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

export default AEPSWalletReport;
