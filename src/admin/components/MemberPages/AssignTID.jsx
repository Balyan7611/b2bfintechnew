import React, { useState } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaSearch, FaEdit, FaChevronLeft, FaChevronRight, FaTimes, FaCheck,
  FaMapMarkedAlt, FaExclamationCircle, FaPlus, FaUser, FaMobileAlt, FaKey, FaMapMarkerAlt, FaDatabase, FaTrash,
  FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv
} from 'react-icons/fa';
import { updateTidForm, toggleTidDrawer, setEditingTid, deleteTid } from '../../../store/slices/memberSlice';
import styles from './MemberPages.module.css';

const AssignTID = () => {
  const dispatch = useDispatch();
  const { tidState } = useSelector((s) => s.member);
  const { form, list, isDrawerOpen } = tidState;
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateTidForm({ [name]: value }));
  };

  const handleEdit = (item) => {
    dispatch(setEditingTid(item));
    dispatch(updateTidForm({
      member: item.member,
      aepsid: item.aepsid,
      mobile: item.mobile,
      status: item.status,
      pin: item.pin,
      lat: item.lat,
      lng: item.lng
    }));
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
  };

  // Filter & Pagination Logic
  const filteredList = list.filter(item => 
    item.member?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.aepsid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mobile?.includes(searchTerm) ||
    item.bank?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredList.slice(startIndex, startIndex + rowsPerPage);

  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* TITLED HEADER INSIDE CARD */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', padding: '10px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div className={styles.directoryTitleGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem', margin: 0 }}>Assign TID</h2>
            <span style={{ fontSize: '0.75rem', color: '#718096', paddingLeft: '12px', borderLeft: '1px solid #E2E8F0' }}>Manage AEPS terminals</span>
          </div>
          <button onClick={() => setShowAssignModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', width: 'auto' }}>
            <FaPlus /> Assign TID
          </button>
        </div>

        {/* TOOLBAR */}
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '10px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="assigntid_report" sheetName="Report" />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px' }}>
            <FaSearch />
            <input 
               type="text" 
               placeholder="Search terminals..." 
               style={{ fontSize: '0.85rem' }} 
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className={styles.tableContainer} style={{ paddingBottom: '10px' }}>
          <table className={styles.tableFull} style={{ minWidth: '1400px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.No</th>
                <th style={{ width: '120px', textAlign: 'center' }}>ACTION</th>
                <th>MEMBER DETAIL</th>
                <th>AEPSID</th>
                <th>BANK NAME</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th>MOBILE</th>
                <th style={{ textAlign: 'center' }}>PIN</th>
                <th>LAT / LNG</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{String(startIndex + i + 1).padStart(2, '0')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button className={styles.editBtn} style={{ width: '32px', height: '32px', background: '#1756AA', color: '#fff' }} onClick={() => handleEdit(item)} title="Edit Terminal">
                        <FaEdit />
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        style={{ width: '32px', height: '32px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FED7D7' }} 
                        title="Delete Terminal"
                        onClick={() => setConfirmDelete(item)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                  <td>
                     <div style={{ fontWeight: 700, color: '#1756AA' }}>{item.member}</div>
                  </td>
                  <td className={styles.fwBold} style={{ color: '#0D1B3E' }}>{item.aepsid}</td>
                  <td>{item.bank}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${item.status === 'Accepted' ? styles.badge_green : styles.badge_yellow}`} style={{ fontSize: '0.65rem' }}>
                      {item.status === 'Accepted' ? <FaCheck /> : <FaExclamationCircle />} {item.status}
                    </span>
                  </td>
                  <td style={{ color: '#4E6080', fontWeight: 700, fontSize: '0.85rem' }}>{item.mobile}</td>
                  <td style={{ fontWeight: 800, textAlign: 'center', color: '#1756AA', fontSize: '0.9rem' }}>{item.pin}</td>
                  <td style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 500 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span><b style={{ opacity: 0.5 }}>LAT:</b> {item.lat}</span>
                       <span><b style={{ opacity: 0.5 }}>LNG:</b> {item.lng}</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#A0AEC0' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px', opacity: 0.3 }}><FaDatabase /></div>
                      No terminal assignments found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {filteredList.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredList.length)} of {filteredList.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }} 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className={styles.pageActive} style={{ 
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', background: '#1756AA', color: '#fff', fontSize: '0.9rem', fontWeight: 600
            }}>{currentPage}</span>
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }} 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── ASSIGN TID MODAL ── */}
      {showAssignModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 4000 }}>
          <div className={styles.modalContainer} style={{ width: '600px', borderRadius: '24px' }}>
            <div className={styles.modalHeader} style={{ padding: '20px 30px', borderBottom: '1px solid #F1F5F9' }}>
               <div>
                  <h3 className={styles.modalTitle} style={{ fontSize: '1.2rem', margin: 0 }}>Assign Terminal ID</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#718096' }}>Configure new AEPS terminal assignment</p>
               </div>
               <button className={styles.closeBtn} onClick={closeAssignModal}>
                  <FaTimes />
               </button>
            </div>

            <div className={styles.modalBody} style={{ padding: '30px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className={styles.formGroup}>
                    <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px' }}>SELECT MEMBER</label>
                    <select name="member" className={styles.selectControl} style={{ height: '42px', paddingLeft: '15px' }} value={form.member} onChange={handleInputChange}>
                       <option value="">Select Member</option>
                       <option value=" सचिन बाल्यान">RT1236 सचिन बाल्यान</option>
                       <option value="vivek varshney">Pay99DT5001 vivek varshney</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className={styles.formGroup}>
                      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px' }}>AEPS ID</label>
                      <input type="text" name="aepsid" className={styles.inputControl} style={{ height: '40px' }} placeholder="Enter AEPSID" value={form.aepsid} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px' }}>MOBILE NUMBER</label>
                      <input type="number" name="mobile" className={styles.inputControl} style={{ height: '40px', paddingLeft: '15px' }} placeholder="Mobile number" value={form.mobile} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className={styles.formGroup}>
                      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px' }}>TERMINAL PIN</label>
                      <input type="number" name="pin" className={styles.inputControl} style={{ height: '40px', paddingLeft: '15px' }} placeholder="4-digit Pin" value={form.pin} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px' }}>STATUS</label>
                      <select name="status" className={styles.selectControl} style={{ height: '40px' }} value={form.status} onChange={handleInputChange}>
                        <option value="">Select Status</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px' }}>LOCATION (LAT / LNG)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <input type="number" name="lat" className={styles.inputControl} style={{ height: '40px', paddingLeft: '15px' }} placeholder="Lat" value={form.lat} onChange={handleInputChange} />
                      <input type="number" name="lng" className={styles.inputControl} style={{ height: '40px', paddingLeft: '15px' }} placeholder="Lng" value={form.lng} onChange={handleInputChange} />
                    </div>
                  </div>
               </div>
            </div>

            <div className={styles.modalFooter} style={{ padding: '20px 30px', borderTop: '1px solid #F1F5F9', background: '#FBFDFF' }}>
               <button type="button" className={styles.prevBtn} style={{ height: '40px', padding: '0 25px', fontSize: '0.85rem' }} onClick={closeAssignModal}>Cancel</button>
               <div style={{ flex: 1 }}></div>
               <button type="button" className={styles.publishBtn} style={{ height: '40px', padding: '0 30px', fontSize: '0.9rem' }} onClick={closeAssignModal}>
                  <FaCheck /> Assign New TID
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isDrawerOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 5000 }}>
          <div className={styles.modalContainer} style={{ width: '500px', borderRadius: '24px' }}>
            <div className={styles.modalHeader} style={{ padding: '18px 25px', borderBottom: '1px solid #F1F5F9' }}>
               <div>
                  <h3 className={styles.modalTitle} style={{ margin: 0, fontSize: '1.15rem' }}>Update TID Details</h3>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#718096' }}>Modify terminal parameters and status</p>
               </div>
               <button className={styles.closeBtn} onClick={() => dispatch(toggleTidDrawer(false))}><FaTimes /></button>
            </div>
            <div className={styles.modalBody} style={{ padding: '25px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                 <div className={styles.formGroup}>
                   <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '8px', display: 'block' }}>MEMBER NAME</label>
                   <input type="text" className={styles.inputControl} value={form.member} readOnly style={{ background: '#F8FAFF', height: '40px', color: '#1756AA', fontWeight: 600 }} />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                   <div className={styles.formGroup}>
                     <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '8px', display: 'block' }}>AEPSID</label>
                     <input type="text" name="aepsid" className={styles.inputControl} style={{ height: '40px' }} value={form.aepsid} onChange={handleInputChange} />
                   </div>
                   <div className={styles.formGroup}>
                     <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '8px', display: 'block' }}>STATUS</label>
                     <select name="status" className={styles.selectControl} style={{ height: '40px', fontSize: '0.85rem' }} value={form.status} onChange={handleInputChange}>
                       <option value="Accepted">Accepted</option>
                       <option value="Pending">Pending</option>
                     </select>
                   </div>
                 </div>
                 <div className={styles.formGroup}>
                   <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '8px', display: 'block' }}>MOBILE NUMBER</label>
                   <input type="number" name="mobile" className={styles.inputControl} style={{ height: '40px' }} value={form.mobile} onChange={handleInputChange} />
                 </div>
               </div>
            </div>
            <div className={styles.modalFooter} style={{ padding: '18px 25px', borderTop: '1px solid #F1F5F9', background: '#FBFDFF' }}>
               <button className={styles.prevBtn} style={{ height: '38px', padding: '0 20px' }} onClick={() => dispatch(toggleTidDrawer(false))}>Cancel</button>
               <div style={{ flex: 1 }}></div>
               <button className={styles.publishBtn} style={{ height: '38px', padding: '0 25px', background: '#27AE60' }} onClick={() => dispatch(toggleTidDrawer(false))}>
                  <FaCheck /> Update Terminal
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {confirmDelete && (
        <div className={styles.modalOverlay} style={{ zIndex: 6000 }}>
          <div className={styles.modalContainer} style={{ width: '360px', borderRadius: '20px', padding: '30px', textAlign: 'center', animation: 'premiumFadeIn 0.3s ease' }}>
             <div style={{ width: '64px', height: '64px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px', boxShadow: '0 4px 15px rgba(229, 62, 62, 0.15)' }}>
                <FaTrash />
             </div>
             <h3 style={{ margin: '0 0 12px', color: '#0D1B3E', fontSize: '1.2rem', fontWeight: 800 }}>Delete Terminal</h3>
             <p style={{ margin: '0 0 25px', color: '#4E6080', fontSize: '0.9rem', lineHeight: '1.5' }}>
               Are you sure you want to delete TID <strong style={{ color: '#E53E3E' }}>{confirmDelete.aepsid}</strong> for <strong>{confirmDelete.member}</strong>? This action cannot be undone.
             </p>
             <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => {
                    dispatch(deleteTid(confirmDelete.id));
                    setConfirmDelete(null);
                  }} 
                  style={{ padding: '12px', background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)', color: '#fff', border: 'none', borderRadius: '10px', flex: 1, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.25)' }}
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setConfirmDelete(null)} 
                  style={{ padding: '12px', background: '#F1F5F9', color: '#4E6080', border: 'none', borderRadius: '10px', flex: 1, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTID;
