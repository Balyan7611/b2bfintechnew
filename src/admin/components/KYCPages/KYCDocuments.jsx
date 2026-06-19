import React, { useState, useEffect, useRef } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiFileText, FiLayers, FiSearch, FiEdit2, FiTrash2, 
  FiPlus, FiChevronRight, FiChevronLeft, FiChevronDown, FiCalendar, FiDatabase, FiSettings, FiActivity, FiUser, FiInfo, FiX
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaEdit, FaTrash 
} from 'react-icons/fa';
import { 
  updateKycForm, setOpenActionMenu, addKycDocument, 
  deleteKycDocument, setIsSubmitting 
} from '../../../store/slices/kycSlice';
import styles from '../MemberPages/MemberPages.module.css';

const KYCDocuments = () => {
  const dispatch = useDispatch();
  const { kycForm, kycList, isSubmitting } = useSelector(state => state.kyc);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sideFilter, setSideFilter] = useState('All');
  
  // Custom states for Edit and Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [activeDocs, setActiveDocs] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateKycForm({ name, value }));
  };

  const toggleDocStatus = (id) => {
    setActiveDocs(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      dispatch(deleteKycDocument(deleteModal.id));
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kycForm.documentName) return;
    
    dispatch(setIsSubmitting(true));
    setTimeout(() => {
      dispatch(addKycDocument());
      dispatch(setIsSubmitting(false));
    }, 1000);
  };

  const filteredData = kycList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSide = sideFilter === 'All' ? true : item.side === sideFilter;
    return matchesSearch && matchesSide;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── PREMIUM HEADER & FORM SECTION ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(23, 86, 170, 0.04)',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Title area */}
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, padding: 0, color: '#0D1B3E', fontWeight: 800 }}>KYC Document Master</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Configure identification document requirements</p>
        </div>

        {/* Form Grid Inline */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Document Name</label>
            <input 
              type="text" 
              name="documentName"
              placeholder="e.g. Aadhar Card"
              style={{ 
                height: '38px', 
                fontSize: '0.85rem',
                border: '1.5px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0 12px',
                outline: 'none',
                background: '#F8FAFF',
                color: '#1756AA',
                fontWeight: 600,
                width: '100%'
              }}
              value={kycForm.documentName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '180px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Side Format</label>
            <div style={{ position: 'relative' }}>
              <select 
                name="side"
                value={kycForm.side}
                onChange={handleInputChange}
                style={{ 
                  height: '38px', 
                  fontSize: '0.85rem',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '0 32px 0 12px',
                  outline: 'none',
                  background: '#F8FAFF',
                  color: '#0D1B3E',
                  fontWeight: 600,
                  width: '100%',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="1">1 (Single Side)</option>
                <option value="2">2 (Both Sides)</option>
              </select>
              <FiChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: '2px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px', 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '0 24px', 
                height: '38px', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                cursor: 'pointer', 
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
                transition: 'all 0.2s',
                marginTop: '18px'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {isSubmitting ? <div className={styles.spinner} style={{ width: '16px', height: '16px' }}></div> : <><FiPlus /> Save Config</>}
            </button>
          </div>
        </form>
      </div>

      {/* ── LISTING SECTION ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '20px' }}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiActivity style={{ color: '#1756AA' }} />
            <h3 className={styles.cardTitle} style={{ margin: 0, fontSize: '1rem', padding: '4px 0' }}>Active Documents</h3>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              value={sideFilter}
              onChange={(e) => { setSideFilter(e.target.value); setCurrentPage(1); }}
              style={{
                appearance: 'none',
                background: sideFilter !== 'All' ? '#E6F4EA' : '#F8FAFF',
                color: sideFilter !== 'All' ? '#1E7E34' : '#1756AA',
                border: '1.5px solid #E2E8F0',
                padding: '8px 32px 8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Formats</option>
              <option value="1">1 Side</option>
              <option value="2">2 Sides</option>
            </select>
            <FiChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: sideFilter !== 'All' ? '#1E7E34' : '#1756AA', pointerEvents: 'none' }} />
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="kycdocuments_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>#</th>
                <th>DOCUMENT NAME</th>
                <th style={{ textAlign: 'center' }}>FORMAT</th>
                <th style={{ textAlign: 'center' }}>ADDED</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', color: '#A0AEC0' }}>
                      
                      <div style={{ fontSize: '0.85rem' }}>No documents configured</div></div></td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', background: '#F0F4FF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', fontSize: '0.8rem' }}>
                          <FiFileText />
                        </div>
                        <span style={{ fontWeight: 600, color: '#0D1B3E', fontSize: '0.85rem' }}>{item.name}</span></div></td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={styles.roleTag} style={{ background: '#E6F4EA', color: '#1E7E34', fontWeight: 800, fontSize: '0.65rem', padding: '3px 10px' }}>
                        {item.side} {item.side === '1' ? 'SIDE' : 'SIDES'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{item.addDate}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Toggle Switch */}
                        <div 
                          onClick={() => toggleDocStatus(item.id)}
                          style={{
                            width: '36px',
                            height: '20px',
                            background: activeDocs[item.id] !== false ? '#27AE60' : '#CBD5E0',
                            borderRadius: '10px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease'
                          }}
                          title={activeDocs[item.id] !== false ? 'Active' : 'Inactive'}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: activeDocs[item.id] !== false ? '18px' : '2px',
                            transition: 'left 0.3s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </div>
                        
                        <button onClick={() => setDeleteModal({ isOpen: true, id: item.id })} className={styles.editBtn} style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }} title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><FiChevronLeft /></button>
            <span style={{ padding: '4px 12px', background: '#1756AA', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>{currentPage}</span>
            <button className="global-page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}><FiChevronRight /></button>
          </div>
        </div>
      </div>
      {/* ── CUSTOM DELETE MODAL ── */}
      {deleteModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
          <div className={styles.modalContainer} style={{ width: '360px', borderRadius: '20px', padding: '30px', textAlign: 'center', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px' }}>
              <FiTrash2 />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#0D1B3E', marginBottom: '12px', fontWeight: 800 }}>
              Delete Document?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.5' }}>
              Are you sure you want to delete this document from the master list?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', color: '#4A5568', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.2)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCDocuments;
