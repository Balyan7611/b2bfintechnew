import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { 
  setEntriesToShow, setSearchTerm, setLoading 
} from '../../../store/slices/walletSlice';
import styles from '../MemberPages/MemberPages.module.css';

const DownLineBalance = () => {
  const dispatch = useDispatch();
  const { entriesToShow, searchTerm, isLoading } = useSelector(state => state.wallet);
  const sampleData = [];
  
  const [filters, setFilters] = useState({
    role: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    dispatch(setLoading(true));
    setTimeout(() => dispatch(setLoading(false)), 800);
  };

  return (
    <div className={styles.container} style={{ padding: '15px', maxWidth: '100%' }}>
      {/* ── INLINE FILTER CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, padding: '15px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E' }}>
          DownLine Balance
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className={styles.formGroup} style={{ margin: 0, width: '250px' }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>Role</label>
              <select name="role" value={filters.role} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">Select Role</option>
                <option value="retailer">Retailer</option>
                <option value="distributor">Distributor</option>
                <option value="super_distributor">Super Distributor</option>
              </select>
            </div>

            <button type="submit" disabled={isLoading} style={{ 
              height: '36px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', width: '120px',
              color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {isLoading ? <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></div> : <>Search</>}
            </button>
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
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>User ID</th>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>User</th>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>Parent</th>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>AEPS Balance</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>(Total: ₹0.00)</span>
                  </div>
                </th>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>Balance</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>(Total: ₹0.00)</span>
                  </div>
                </th>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>Hold Amount</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>(Total: ₹0.00)</span>
                  </div>
                </th>
                <th style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem', verticalAlign: 'middle' }}>Show DownLine</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading records...</span></div></td>
                </tr>
              ) : sampleData.length === 0 ? (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan="7" style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span>
                    </td>
                  </tr>
                  <tr style={{ height: '30px' }}><td colSpan="7" style={{ border: 'none' }}></td></tr>
                </>
              ) : (
                sampleData.map((item, index) => (
                  <tr key={index} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{item.userId}</td>
                    <td style={{ fontWeight: 800, color: '#0D1B3E' }}>{item.user}</td>
                    <td style={{ fontWeight: 600, color: '#4E6080' }}>{item.parent}</td>
                    <td style={{ fontWeight: 700, color: '#1756AA' }}>₹{item.aepsBal}</td>
                    <td style={{ fontWeight: 800, color: '#27AE60' }}>₹{item.bal}</td>
                    <td style={{ fontWeight: 700, color: '#E53E3E' }}>₹{item.hold}</td>
                    <td>-</td>
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

export default DownLineBalance;
