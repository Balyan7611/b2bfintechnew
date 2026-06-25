import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch } from 'react-redux';
import { 
  FiFileText, FiSearch, FiEdit2, FiTrash2, 
  FiPlus, FiChevronRight, FiChevronLeft, FiChevronDown, FiActivity, FiX, FiCheck
} from 'react-icons/fi';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { KycDocumentService } from '../../../services/kycDocument.service';
import { setNotification } from '../../../store/slices/uiSlice';
import styles from '../MemberPages/MemberPages.module.css';

const KYCDocuments = () => {
  const dispatch = useDispatch();
  
  // Data State
  const [documents, setDocuments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination & Filters State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState('All');
  
  // Add Form State
  const [form, setForm] = useState({
    name: '',
    side: '1',
    isActive: true
  });

  // Modals State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });

  // Fetch Documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await KycDocumentService.getKycdocumentsMaster({
        PageNumber: currentPage,
        PageSize: rowsPerPage
      });
      if (res && res.status) {
        setDocuments(res.data.items || []);
        setTotalItems(res.data.totalItems || 0);
      } else {
        setDocuments([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Failed to fetch KYC documents.' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      dispatch(setNotification({ type: 'error', message: 'Document name is required.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: 0,
        name: form.name.trim(),
        side: form.side === 'null' ? null : parseInt(form.side),
        isActive: form.isActive
      };
      const res = await KycDocumentService.create(payload);
      if (res && res.status) {
        dispatch(setNotification({ type: 'success', message: res.mess || res.message || 'Document added successfully!' }));
        setForm({ name: '', side: '1', isActive: true });
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.mess || res.message || 'Failed to create document.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error creating document.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.data.name.trim()) {
      dispatch(setNotification({ type: 'error', message: 'Document name is required.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: editModal.data.id,
        name: editModal.data.name.trim(),
        side: (editModal.data.side === 'null' || editModal.data.side === null || editModal.data.side === undefined) ? null : parseInt(editModal.data.side),
        isActive: editModal.data.isActive
      };
      const res = await KycDocumentService.update(payload);
      if (res && res.status) {
        dispatch(setNotification({ type: 'success', message: res.mess || res.message || 'Document updated successfully!' }));
        setEditModal({ isOpen: false, data: null });
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.mess || res.message || 'Failed to update document.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error updating document.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const payload = {
        id: item.id,
        name: item.name,
        side: item.side === null ? null : parseInt(item.side),
        isActive: !item.isActive
      };
      const res = await KycDocumentService.update(payload);
      if (res && res.status) {
        dispatch(setNotification({ 
          type: 'success', 
          message: res.mess || res.message || `Document status changed to ${!item.isActive ? 'Active' : 'Inactive'}` 
        }));
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.mess || res.message || 'Failed to update status.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error updating status.' }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await KycDocumentService.delete(deleteModal.id);
      if (res && res.status) {
        dispatch(setNotification({ type: 'success', message: res.mess || res.message || 'Document deleted successfully!' }));
        setDeleteModal({ isOpen: false, id: null });
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.mess || res.message || 'Failed to delete document.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error deleting document.' }));
    }
  };

  // Client side filtering for search & side format dropdown values
  const filteredData = documents.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSide = sideFilter === 'All' 
      ? true 
      : sideFilter === 'null' 
        ? item.side === null 
        : String(item.side) === sideFilter;
    return matchesSearch && matchesSide;
  });

  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

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
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Document Name</label>
            <input 
              type="text" 
              name="name"
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
              value={form.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '180px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Side Format</label>
            <div style={{ position: 'relative' }}>
              <select 
                name="side"
                value={form.side}
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
                <option value="null">None / Not Applicable</option>
              </select>
              <FiChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', paddingBottom: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#4E6080', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="isActive" 
                checked={form.isActive}
                onChange={handleInputChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Active
            </label>
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
                transition: 'all 0.2s'
              }}
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
              onChange={(e) => { setSideFilter(e.target.value); }}
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
              <option value="null">None</option>
            </select>
            <FiChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: sideFilter !== 'All' ? '#1E7E34' : '#1756AA', pointerEvents: 'none' }} />
          </div>

          <ExportButtons headers={['ID', 'DOCUMENT NAME', 'FORMAT', 'STATUS']} rows={filteredData.map(item => [item.id, item.name, item.side ? `${item.side} Side` : 'N/A', item.isActive ? 'Active' : 'Inactive'])} fileNamePrefix="kycdocuments_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
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
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                    <div className={styles.spinner} style={{ margin: '0 auto', width: '24px', height: '24px' }}></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', color: '#A0AEC0' }}>
                      <div style={{ fontSize: '0.85rem' }}>No documents configured</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', background: '#F0F4FF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', fontSize: '0.8rem' }}>
                          <FiFileText />
                        </div>
                        <span style={{ fontWeight: 600, color: '#0D1B3E', fontSize: '0.85rem' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={styles.roleTag} style={{ 
                        background: item.side === 1 ? '#E6F4EA' : item.side === 2 ? '#E8F0FE' : '#F1F5F9', 
                        color: item.side === 1 ? '#1E7E34' : item.side === 2 ? '#1A73E8' : '#475569', 
                        fontWeight: 800, 
                        fontSize: '0.65rem', 
                        padding: '3px 10px' 
                      }}>
                        {item.side === 1 ? '1 SIDE' : item.side === 2 ? '2 SIDES' : 'N/A'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: item.isActive ? '#E6F4EA' : '#FCE8E6',
                        color: item.isActive ? '#1E7E34' : '#C5221F',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Toggle Switch */}
                        <div 
                          onClick={() => handleToggleStatus(item)}
                          style={{
                            width: '36px',
                            height: '20px',
                            background: item.isActive ? '#27AE60' : '#CBD5E0',
                            borderRadius: '10px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease'
                          }}
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: item.isActive ? '18px' : '2px',
                            transition: 'left 0.3s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </div>
                        
                        <button 
                          onClick={() => setEditModal({ isOpen: true, data: { ...item, side: (item.side === null || item.side === undefined || String(item.side) === 'null') ? 'null' : String(item.side) } })} 
                          className={styles.editBtn} 
                          style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id })} 
                          className={styles.editBtn} 
                          style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
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
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><FiChevronLeft /></button>
            <span style={{ padding: '4px 12px', background: '#1756AA', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>{currentPage}</span>
            <button className="global-page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── CUSTOM EDIT MODAL ── */}
      {editModal.isOpen && editModal.data && (
        <div className={styles.modalOverlay} style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999 
        }}>
          <div className={styles.modalContainer} style={{ 
            width: '420px', 
            borderRadius: '20px', 
            padding: '24px', 
            background: '#fff', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setEditModal({ isOpen: false, data: null })}
              style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#64748B' }}
            >
              <FiX />
            </button>
            <h3 style={{ fontSize: '1.2rem', color: '#0D1B3E', marginBottom: '8px', fontWeight: 800 }}>
              Edit KYC Document
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '20px' }}>
              Update details for {editModal.data.name}
            </p>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Document Name</label>
                <input 
                  type="text" 
                  name="name"
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
                  }}
                  value={editModal.data.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Side Format</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    name="side"
                    value={editModal.data.side}
                    onChange={handleEditInputChange}
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
                    <option value="null">None / Not Applicable</option>
                  </select>
                  <FiChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#4E6080', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={editModal.data.isActive}
                    onChange={handleEditInputChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Active
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, data: null })}
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', color: '#4A5568', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1756AA 0%, #114084 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(23, 86, 170, 0.2)' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOM DELETE MODAL ── */}
      {deleteModal.isOpen && (
        <div className={styles.modalOverlay} style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999 
        }}>
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
