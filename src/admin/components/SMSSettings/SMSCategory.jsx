import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiX, FiCheck
} from 'react-icons/fi';
import { FaRegFileAlt } from 'react-icons/fa';
import { API } from '../../../api/endpoints';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';

const SMSCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This page used to be a static mockup — `categories` was a hardcoded
  // empty array, so it always showed "No data" no matter what, and the
  // pagination footer was just decorative text ("Showing 1 of 1 records"
  // was hardcoded too). SmsCategoryService.getAll() already exists and
  // works (used nowhere else), so wire it up for real.
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.smsCategory.getAll();
      const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
      setCategories(Array.isArray(list) ? list.map(c => ({
        id: c.id,
        name: c.categoryName || c.name || '',
        status: c.isActive === false ? 'Inactive' : 'Active',
        date: c.createdDate ? String(c.createdDate).slice(0, 10) : (c.addDate ? String(c.addDate).slice(0, 10) : '-')
      })) : []);
    } catch (err) {
      console.error('SMSCategory: failed to load categories', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageCategories = filteredCategories.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.cardFullMobile} style={{ padding: '20px' }}>
        
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 5px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>SMS Categories</h3>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)} style={{ height: '36px', padding: '0 15px', fontSize: '0.8rem', borderRadius: '8px', background: '#1756AA', fontWeight: 700, minWidth: 'auto' }}>
            <FiPlus /> <span>New</span>
          </button>
        </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4E6080', fontSize: '0.85rem', fontWeight: 600 }}>
             Show
             <select
               className={styles.selectEntries}
               style={{ margin: '0', width: '65px', height: '34px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
               value={rowsPerPage}
               onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
             </select>
             entries
          </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
            <ExportButtons
              headers={['S.No', 'Category Name', 'Status', 'Date Created']}
              rows={filteredCategories.map((c, i) => [i + 1, c.name, c.status, c.date])}
              fileNamePrefix="sms_category_report"
              sheetName="SMS Categories"
            />
          </div>

                    <div className="global-search-box" style={{ maxWidth: '100%', width: '100%', margin: '0' }}>
            <FiSearch style={{ left: '15px' }} />
            <input
              type="text"
              placeholder="Search categories..."
              style={{ borderRadius: '10px', height: '42px', paddingLeft: '45px', border: '1.5px solid #F1F5F9' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
              {loading ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>Loading categories...</td>
                </tr>
              ) : pageCategories.length === 0 ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>No data available</td>
                </tr>
              ) : pageCategories.map((cat, idx) => (
                <tr key={cat.id} className={styles.hoverRow}>
                  <td style={{ paddingLeft: '20px', fontWeight: 700, color: '#A0AEC0' }}>{startIndex + idx + 1}</td>
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

                {/* PAGINATION — same "global-page-btn" style/markup used on
            AEPS History and every other report page. */}
        {(() => {
          const tp = totalPages || 1;
          const delta = 2;
          const left = currentPage - delta;
          const right = currentPage + delta;
          const pages = [];
          let prev = null;
          for (let i = 1; i <= tp; i++) {
            if (i === 1 || i === tp || (i >= left && i <= right)) {
              if (prev !== null && i - prev > 1) pages.push('...');
              pages.push(i);
              prev = i;
            }
          }
          return (
            <div style={{ padding: '15px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
                Showing {filteredCategories.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredCategories.length)} of <strong>{filteredCategories.length}</strong> records &nbsp;|&nbsp; Page {currentPage} of {tp}
              </div>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="global-page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
                {pages.map((pg, i) =>
                  pg === '...'
                    ? <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '36px' }}>…</span>
                    : <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        style={{
                          minWidth: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                          borderColor: pg === currentPage ? '#1756AA' : '#e2e8f0',
                          background: pg === currentPage ? '#1756AA' : '#fff',
                          color: pg === currentPage ? '#fff' : '#475569',
                          fontWeight: pg === currentPage ? 800 : 500,
                          fontSize: '0.82rem', cursor: 'pointer',
                        }}
                      >{pg}</button>
                )}
                <button className="global-page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, tp))} disabled={currentPage >= tp}><FiChevronRight /></button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default SMSCategory;
