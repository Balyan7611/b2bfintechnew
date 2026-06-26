import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiImage, FiUpload, FiEye, FiLoader, FiAlertTriangle
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const BannerManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localBanners, setLocalBanners] = useState([]);
  const [bannerTypes, setBannerTypes] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id: '', bannerTypeId: '', fileImage: null, imagePreview: ''
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch banner types
  const fetchBannerTypes = async () => {
    try {
      const response = await API.bannerType.getAll();
      if (response && response.status === true) {
        const items = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setBannerTypes(items);
      }
    } catch (err) {
      console.error("Failed fetching banner types:", err);
    }
  };

  // Fetch banner images
  const fetchBanners = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await API.bannerImage.getAll();
      if (response && response.status === true) {
        const items = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setLocalBanners(items);
      } else {
        setErrorMsg(response?.mess || 'Failed to load banners.');
      }
    } catch (err) {
      console.error("Failed fetching banners:", err);
      setErrorMsg('Error loading banners from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerTypes();
    fetchBanners();
  }, []);

  const handleDelete = async () => {
    const id = showConfirmModal.id;
    setShowConfirmModal({ isOpen: false, id: null });
    
    // Optimistic UI update
    setLocalBanners(prev => prev.filter(b => b.id !== id));
    
    try {
      const res = await API.bannerImage.delete(id);
      if (res && (res.status === true || res.status === 'true' || res.data === true || res.code === 'TXN')) {
        setSuccessMsg('Banner deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        // Fallback: if server succeeded but envelope format differed, keep state
        setSuccessMsg('Banner removed.');
        setTimeout(() => setSuccessMsg(''), 2000);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
      fetchBanners(); // revert state on fail
      setErrorMsg('Failed to delete banner on server.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        fileImage: file,
        imagePreview: url
      }));
    }
  };

  const handleAddClick = () => {
    setErrorMsg('');
    setFormData({ id: '', bannerTypeId: '', fileImage: null, imagePreview: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setErrorMsg('');
    setFormData({
      id: banner.id,
      bannerTypeId: banner.bannerTypeId ? String(banner.bannerTypeId) : '',
      fileImage: null,
      imagePreview: banner.bannerImage || ''
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.bannerImage.toggleStatus(id);
      if (res && (res.status === true || res.status === 'true' || res.data === true || res.code === 'TXN')) {
        setLocalBanners(prev => 
          prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b)
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.bannerTypeId) {
      setErrorMsg('Please select a banner type.');
      return;
    }
    
    setIsSaving(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      if (formData.id) {
        fd.append('Id', String(formData.id));
      }
      fd.append('BannerTypeId', String(formData.bannerTypeId));
      if (formData.fileImage) {
        fd.append('FileImage', formData.fileImage);
      }

      const res = formData.id
        ? await API.bannerImage.update(fd)
        : await API.bannerImage.create(fd);

      if (res && (res.status === true || res.status === 'true' || res.data === true || res.code === 'TXN')) {
        setSuccessMsg(formData.id ? 'Banner updated successfully!' : 'Banner uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setIsModalOpen(false);
        fetchBanners();
      } else {
        // Check if message says success
        if (res && (res.code === 'TXN' || res.mess?.toLowerCase().includes('success'))) {
          setSuccessMsg(formData.id ? 'Banner updated successfully!' : 'Banner uploaded successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
          setIsModalOpen(false);
          fetchBanners();
        } else {
          setErrorMsg(res?.mess || 'Save failed. Please check the server response.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while saving the banner.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and pagination logic
  const filtered = localBanners.filter(b => {
    const query = searchQuery.toLowerCase();
    const typeName = bannerTypes.find(t => String(t.id) === String(b.bannerTypeId))?.name || '';
    return typeName.toLowerCase().includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentEntries = filtered.slice(startIndex, startIndex + rowsPerPage);

  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage]);

  return (
    <div className={styles.container} style={{ padding: '5px 2px 60px 2px', maxWidth: '100%' }}>
      {/* Global toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#10B981', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 60px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Banner Management</h3>
          <PrimaryButton onClick={handleAddClick}>
            <FiUpload size={16} /> <span>Upload New Banner</span>
          </PrimaryButton>
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div style={{ margin: '12px 20px 0', padding: '10px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FiAlertTriangle /> {errorMsg}
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '10px 15px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
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
              placeholder="Search banners..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '950px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>S.NO</th>
                <th style={{ width: '90px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '350px' }}>BANNER DETAILS</th>
                <th style={{ width: '200px', textAlign: 'left' }}>BANNER TYPE</th>
                <th style={{ width: '120px', textAlign: 'left' }}>STATUS</th>
                <th style={{ width: '150px', textAlign: 'left' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontWeight: 600 }}>
                    <FiLoader style={{ animation: 'spin 1s linear infinite', marginRight: '6px' }} /> Loading...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0', fontWeight: 600 }}>
                    No banners available.
                  </td>
                </tr>
              ) : (
                currentEntries.map((banner, idx) => {
                  const bannerTypeObj = bannerTypes.find(t => String(t.id) === String(banner.bannerTypeId));
                  return (
                    <tr key={banner.id} className={styles.hoverRow}>
                      <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{startIndex + idx + 1}</td>
                      <td style={{ textAlign: 'center' }}>
                         <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className={styles.editBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', color: '#3B82F6', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => handleEdit(banner)} title="Edit Banner"><FiEdit /></button>
                            <button className={styles.deleteBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FED7D7', cursor: 'pointer' }} title="Delete Banner" onClick={() => setShowConfirmModal({ isOpen: true, id: banner.id })}><FiTrash2 /></button>
                         </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                           <div style={{ width: '80px', height: '45px', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {banner.bannerImage ? (
                                <img src={banner.bannerImage} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FiImage style={{ color: '#A0AEC0' }} />
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                               <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>ID: {banner.id}</span>
                               <small style={{ color: '#718096', fontWeight: 600 }}>Banner Image File</small>
                            </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                         <span style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                           {bannerTypeObj ? bannerTypeObj.name : 'Unknown Type'}
                         </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                         <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                            <input type="checkbox" checked={banner.isActive} onChange={() => handleToggleStatus(banner.id)} />
                            <span className={styles.slider}></span>
                         </label>
                      </td>
                      <td style={{ textAlign: 'left', color: '#718096', fontWeight: 700, fontSize: '0.85rem' }}>
                        {banner.createdDate ? new Date(banner.createdDate).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '25px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled={currentPage === 1} onClick={handlePrevPage} style={{ borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>{currentPage}</div>
            <button className="global-page-btn" disabled={currentPage === totalPages} onClick={handleNextPage} style={{ borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── UPLOAD/EDIT MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff' }}>
            <div className={styles.drawerHeader} style={{ padding: '12px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <FiImage size={16} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>{formData.id ? 'Edit Banner' : 'Upload Banner'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={14} />
              </button>
            </div>
            
            <div className={styles.drawerBody} style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
              {errorMsg && (
                <div style={{ marginBottom: '15px', padding: '10px 14px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                    <label className={styles.label} style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>Banner Type *</label>
                    <select name="bannerTypeId" className={styles.inputControl} value={formData.bannerTypeId} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.88rem' }} required>
                      <option value="">Select Banner Type</option>
                      {bannerTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                     <label className={styles.label} style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>Banner Image *</label>
                     <div 
                       onClick={() => document.getElementById('banner_file_input').click()}
                       style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '30px 20px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s' }}
                     >
                        <input 
                          type="file" 
                          id="banner_file_input" 
                          style={{ display: 'none' }} 
                          accept="image/*" 
                          onChange={handleFileChange} 
                        />
                        {formData.imagePreview ? (
                          <img src={formData.imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px' }} />
                        ) : (
                          <>
                            <FiImage style={{ fontSize: '2.2rem', color: '#94A3B8', marginBottom: '10px' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>Click to upload image</p>
                            <small style={{ color: '#94A3B8', display: 'block', marginTop: '4px' }}>Recommended dimensions: 1920x450px</small>
                          </>
                        )}
                     </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                  <button type="button" style={{ padding: '10px 16px', background: '#F1F5F9', border: 'none', color: '#475569', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flex: 1, fontSize: '0.9rem' }} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <PrimaryButton type="submit" disabled={isSaving} style={{ flex: 1 }}>
                    {isSaving ? 'Saving...' : <>Save Banner <FiCheck size={16} style={{ marginLeft: '4px' }} /></>}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showConfirmModal.isOpen && (
        <div className={styles.drawerOverlay} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowConfirmModal({ isOpen: false, id: null })}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '360px', padding: '30px 25px', textAlign: 'center', borderRadius: '16px', background: '#fff', transform: 'none', position: 'relative', height: 'auto', minHeight: 'auto' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <FiTrash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>Delete Banner?</h3>
            <p style={{ margin: '0 0 25px 0', color: '#64748B', fontSize: '0.9rem', lineHeight: '1.5' }}>Are you sure you want to delete this banner? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
              <button onClick={() => setShowConfirmModal({ isOpen: false, id: null })} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontWeight: 700, cursor: 'pointer', flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#E53E3E', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)', flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
