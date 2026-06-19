import React, { useState } from 'react';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiX, FiCheck
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaRegFileAlt } from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const SMSCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [];

  return (
    <div className={styles.container}>
      <div className={styles.cardFullMobile} style={{ padding: '20px' }}>
        
        {/* HEADER: No Icon, No Subtext, One Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 5px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>SMS Categories</h3>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)} style={{ height: '36px', padding: '0 15px', fontSize: '0.8rem', borderRadius: '8px', background: '#1756AA', fontWeight: 700, minWidth: 'auto' }}>
            <FiPlus /> <span>New</span>
          </button>
        </div>

        {/* TOOLBAR: Stacked Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          
          {/* Row 1: Entries */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4E6080', fontSize: '0.85rem', fontWeight: 600 }}>
             Show 
             <select className={styles.selectEntries} style={{ margin: '0', width: '65px', height: '34px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
             </select>
             entries
          </div>

          {/* Row 2: 5 Icons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="global-export-btn btn-copy" style={{ width: '38px', height: '38px', borderRadius: '8px' }}><FaCopy /></button>
            <button className="global-export-btn btn-excel" style={{ width: '38px', height: '38px', borderRadius: '8px' }}><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" style={{ width: '38px', height: '38px', borderRadius: '8px' }}><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" style={{ width: '38px', height: '38px', borderRadius: '8px' }}><FaFileCsv /></button>
            <button className="global-export-btn btn-print" style={{ width: '38px', height: '38px', borderRadius: '8px' }}><FaPrint /></button>
          </div>

          {/* Row 3: Search */}
          <div className="global-search-box" style={{ maxWidth: '100%', width: '100%', margin: '0' }}>
            <FiSearch style={{ left: '15px' }} />
            <input type="text" placeholder="Search categories..." style={{ borderRadius: '10px', height: '42px', paddingLeft: '45px', border: '1.5px solid #F1F5F9' }} />
          </div>
        </div>

        {/* TABLE: Scrollable */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1100px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '70px', paddingLeft: '20px' }}>S.NO</th>
                <th style={{ width: '110px', textAlign: 'center' }}>ACTION</th>
                <th style={{ paddingLeft: '15px' }}>CATEGORY NAME</th>
                <th style={{ width: '130px', textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'right', width: '220px', paddingRight: '20px' }}>DATE CREATED</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>No data available</td>
                </tr>
              ) : categories.map((cat, idx) => (
                <tr key={cat.id} className={styles.hoverRow}>
                  <td style={{ paddingLeft: '20px', fontWeight: 700, color: '#A0AEC0' }}>0{idx + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className={styles.editBtn} style={{ width: '30px', height: '30px' }}><FiEdit /></button>
                      <button className={styles.deleteBtn} style={{ background: 'rgba(229, 62, 62, 0.08)', color: '#E53E3E', border: 'none', width: '30px', height: '30px' }}><FiTrash2 /></button>
                    </div>
                  </td>
                  <td style={{ paddingLeft: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <FaRegFileAlt style={{ color: '#1756AA' }} />
                       <span style={{ color: '#1756AA', fontSize: '0.9rem', fontWeight: 800 }}>{cat.name}</span></div></td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#E6F4EA', color: '#1E7E34', padding: '5px 15px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 }}>
                      {cat.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#718096', fontSize: '0.8rem', paddingRight: '20px' }}>{cat.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION: Centered */}
        <div style={{ padding: '25px 0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
           <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Showing 1 of 1 records</div>
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="global-page-btn" style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fff', border: '1.5px solid #E2E8F0' }}><FiChevronLeft /></button>
              <div style={{ width: '38px', height: '38px', background: '#1756AA', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>1</div>
              <button className="global-page-btn" style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fff', border: '1.5px solid #E2E8F0' }}><FiChevronRight /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SMSCategory;
