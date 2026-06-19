import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiCalendar, FiUser, FiArrowRight, FiActivity, FiFilter, FiX, FiCheck, FiChevronLeft, FiChevronRight, FiDatabase, FiSettings
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { 
  updateFilters, setEntriesToShow, setSearchTerm, setLoading 
} from '../../../store/slices/walletSlice';
import styles from '../MemberPages/MemberPages.module.css';

const GenericReportTable = ({ title, columns = [], data = [] }) => {
  const dispatch = useDispatch();
  const { filters, entriesToShow, searchTerm, isLoading } = useSelector(state => state.wallet);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFilters({ [name]: value }));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    dispatch(setLoading(true));
    setIsFilterModalOpen(false);
    setTimeout(() => dispatch(setLoading(false)), 800);
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>{title}</h3>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' 
          }} onClick={() => setIsFilterModalOpen(true)}>
            <FiFilter /> <span>Filter Report</span>
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} 
              value={entriesToShow}
              onChange={(e) => dispatch(setEntriesToShow(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table"><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search data..." 
              style={{ borderRadius: '10px' }}
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                {columns.map((col, idx) => (
                  <th key={idx} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <div className={styles.spinner} style={{ width: '35px', height: '35px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: 600 }}>Loading report data...</span></div></td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '0', background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, right: 0, width: '100%', minWidth: 'fit-content', margin: '0 auto', textAlign: 'center', padding: '20px 0', color: '#A0AEC0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                      
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', display: 'block', marginBottom: '5px' }}>No data available in this report</span>
                        <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>Try using different filter criteria to find information</p>
                      </div></td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr key={rIdx} className={styles.hoverRow}>
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx}>{val}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing 0 to 0 of 0 records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── FILTER MODAL (DRAWER STYLE) ── */}
      {isFilterModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsFilterModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '95%' }}>
            <div className={styles.drawerHeader}>
              <div className={styles.directoryTitleGroup}>
                <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem' }}><FiFilter /> Filter Report</h2>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: '#4E6080' }}>
                <FiX />
              </button>
            </div>
            
            <div className={styles.drawerBody}>
              <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem' }}><FiCalendar /> From Date</label>
                    <input 
                      type="date" 
                      name="fromDate" 
                      className={styles.inputControl} 
                      value={filters.fromDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem' }}><FiCalendar /> To Date</label>
                    <input 
                      type="date" 
                      name="toDate" 
                      className={styles.inputControl} 
                      value={filters.toDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem' }}><FiUser /> Member ID</label>
                    <select 
                      name="memberId" 
                      className={styles.inputControl} 
                      value={filters.memberId}
                      onChange={handleFilterChange}
                    >
                      <option value="">Select Member</option>
                      <option value="M001">Ram Prasad (M001)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                  <button type="button" className={styles.saveBtn} style={{ background: '#F1F5F9', color: '#4E6080' }} onClick={() => setIsFilterModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={isLoading} style={{ minWidth: '150px' }}>
                    {isLoading ? <div className={styles.spinner}></div> : <>Apply Filters <FiChevronRight /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericReportTable;
