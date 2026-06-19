import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiShield, FiLock, FiMonitor, FiMapPin, FiRefreshCw
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const EmpLoginSecurity = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  const handleRemoveConfirm = () => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsRemoving(false);
      setShowDeleteModal(false);
    }, 1500);
  };

  const sampleSecurity = [];

  return (
    <div className={styles.container} style={{ padding: '20px 25px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ padding: '15px 25px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>Employee Login List</h3>
        </div>

        {/* ── FILTER SECTION ── */}
        <div style={{ padding: '20px 25px', display: 'flex', flexWrap: 'wrap', gap: '25px', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 250px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>IP Address</label>
              <input type="text" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }} />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 250px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>Employee</label>
              <select style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: '0.95rem', color: '#64748B' }}>
                 <option>-- Select Employee --</option>
                 <option>Admin</option>
              </select>
           </div>
           <div>
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                style={{ background: '#F43F5E', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800, cursor: isSearching ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSearching && <FiRefreshCw className={styles.spin} />}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
           </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '10px 15px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
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
              placeholder="Search employee..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '950px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ width: '60px', padding: '15px' }}>S.No</th>
                <th style={{ width: '300px', padding: '15px', textAlign: 'left' }}>Employee Name</th>
                <th style={{ width: '200px', padding: '15px', textAlign: 'left' }}>IP</th>
                <th style={{ width: '200px', padding: '15px', textAlign: 'left' }}>AddDate</th>
                <th style={{ width: '150px', padding: '15px', textAlign: 'left' }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {sampleSecurity.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                    No security logs found.
                  </td>
                </tr>
              ) : (
                sampleSecurity.map((item, idx) => (
                  <tr key={item.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#64748B', padding: '15px' }}>{idx + 1}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ color: '#1E293B', fontSize: '0.95rem', fontWeight: 800 }}>{item.empName}</span>
                         <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>{item.email}</span></div></td>
                    <td style={{ color: '#1E293B', fontWeight: 700, padding: '15px' }}>{item.ip}</td>
                    <td style={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem', padding: '15px' }}>{item.addDate}</td>
                    <td style={{ padding: '15px' }}>
                      <button 
                         onClick={() => setShowDeleteModal(true)}
                         style={{ background: '#F43F5E', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(244, 63, 94, 0.2)' }}>
                         Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '15px 25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {sampleSecurity.length > 0 ? 1 : 0} to {sampleSecurity.length} of {sampleSecurity.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION POPUP ── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
           <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '50px', height: '50px', background: '#FFE4E6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                 <FiTrash2 style={{ fontSize: '1.4rem', color: '#F43F5E' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>Remove Access?</h3>
              <p style={{ color: '#64748B', marginBottom: '25px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                 Are you sure you want to remove this IP restriction? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                 <button onClick={() => setShowDeleteModal(false)} disabled={isRemoving} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', flex: 1 }}>
                    Cancel
                 </button>
                 <button onClick={handleRemoveConfirm} disabled={isRemoving} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#F43F5E', color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: isRemoving ? 'not-allowed' : 'pointer', flex: 1, boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {isRemoving && <FiRefreshCw className={styles.spin} />}
                    {isRemoving ? 'Removing...' : 'Yes, Remove'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmpLoginSecurity;
