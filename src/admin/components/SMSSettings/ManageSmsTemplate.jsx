import React, { useState } from 'react';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiFileText, FiMessageSquare, FiSliders
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint } from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const ManageSmsTemplate = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const managedTemplates = [];

  return (
    <div className={styles.container}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 25px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>SMS Mappings</h3>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)} style={{ height: '34px', padding: '0 12px', fontSize: '0.7rem', borderRadius: '8px', background: '#1756AA', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <FiPlus /> <span>New Mapping</span>
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '20px 25px', flexWrap: 'wrap', gap: '20px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 700 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0', height: '36px', width: '70px' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 700 }}>rows</span>
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
              placeholder="Search mapping rules..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1100px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '80px', paddingLeft: '25px' }}>S.NO</th>
                <th style={{ width: '120px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '300px' }}>TEMPLATE MAPPING</th>
                <th style={{ width: '200px', textAlign: 'center' }}>GATEWAY PROVIDER</th>
                <th style={{ width: '120px', textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'right', width: '200px', paddingRight: '25px' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {managedTemplates.length === 0 ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>No data available</td>
                </tr>
              ) : managedTemplates.map((item, idx) => (
                <tr key={item.id} className={styles.hoverRow}>
                  <td style={{ fontWeight: 800, color: '#A0AEC0', paddingLeft: '25px' }}>0{idx + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button className={styles.editBtn} title="Configure Rules" style={{ width: '32px', height: '32px' }}><FiEdit /></button>
                      <button className={styles.deleteBtn} style={{ background: 'rgba(229, 62, 62, 0.08)', color: '#E53E3E', border: 'none', width: '32px', height: '32px', borderRadius: '8px' }} title="Delete Mapping"><FiTrash2 /></button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '32px', height: '32px', background: 'rgba(23, 86, 170, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', fontSize: '0.9rem' }}>
                          <FiSliders />
                       </div>
                       <span style={{ color: '#1756AA', fontSize: '0.9rem', fontWeight: 800 }}>{item.name}</span></div></td>
                  <td style={{ textAlign: 'center' }}>
                     <span style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '6px 14px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                       {item.provider}
                     </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: item.status ? 'rgba(39, 174, 96, 0.1)' : 'rgba(229, 62, 62, 0.1)', color: item.status ? '#27AE60' : '#E53E3E', padding: '6px 16px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, border: item.status ? '1px solid rgba(39, 174, 96, 0.2)' : '1px solid rgba(229, 62, 62, 0.2)' }}>
                      {item.status ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#718096', fontSize: '0.8rem', paddingRight: '25px' }}>{item.addDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '20px 25px', borderTop: '1px solid #F1F5F9', background: '#F9FBFF' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>
            Showing 1 to 2 of 2 records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '10px', width: '36px', height: '36px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1756AA', color: 'white', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(23, 86, 170, 0.2)' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '10px', width: '36px', height: '36px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSmsTemplate;
