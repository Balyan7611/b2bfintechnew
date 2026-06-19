import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiImage, FiUpload, FiEye
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import styles from '../MemberPages/MemberPages.module.css';

const BannerManagement = () => {
  const dispatch = useDispatch();
  const { banners = [] } = useSelector(state => state.settings || {});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localBanners, setLocalBanners] = useState([]);

  const [formData, setFormData] = useState({
    id: '', title: '', type: '', status: true, image: ''
  });

  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });

  const handleDelete = () => {
    setLocalBanners(localBanners.filter(b => b.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddClick = () => {
    setFormData({ id: '', title: '', type: '', status: true, image: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setFormData({ ...formData, ...banner });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.id) {
      setLocalBanners(localBanners.map(b => b.id === formData.id ? { ...b, ...formData } : b));
    } else {
      const newBanner = { 
        ...formData, 
        id: Date.now(), 
        addDate: new Date().toLocaleDateString('en-GB') 
      };
      setLocalBanners([newBanner, ...localBanners]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 60px 2px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 60px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Banner Management</h3>
          <PrimaryButton onClick={handleAddClick}>
            <FiUpload size={16} /> <span>Upload New Banner</span>
          </PrimaryButton>
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
              placeholder="Search banners..." 
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
                <th style={{ width: '200px', textAlign: 'left' }}>TYPE</th>
                <th style={{ width: '120px', textAlign: 'left' }}>STATUS</th>
                <th style={{ width: '150px', textAlign: 'left' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {localBanners.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                    No banners available.
                  </td>
                </tr>
              ) : (
                localBanners.map((banner, idx) => (
                  <tr key={banner.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className={styles.editBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', color: '#3B82F6', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => handleEdit(banner)} title="Edit Banner"><FiEdit /></button>
                          <button className={styles.deleteBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FED7D7', cursor: 'pointer' }} title="Delete Banner" onClick={() => setShowConfirmModal({ isOpen: true, id: banner.id })}><FiTrash2 /></button>
                       </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <div style={{ width: '80px', height: '45px', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiImage style={{ color: '#A0AEC0' }} />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{banner.title}</span>
                            <small style={{ color: '#718096', fontWeight: 600 }}>Resolution: 1920x450</small>
                         </div></div></td>
                    <td style={{ textAlign: 'left' }}>
                       <span style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                         {banner.type}
                       </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                       <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                          <input type="checkbox" checked={banner.status} readOnly />
                          <span className={styles.slider}></span>
                       </label>
                    </td>
                    <td style={{ textAlign: 'left', color: '#718096', fontWeight: 700, fontSize: '0.85rem' }}>{banner.addDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {localBanners.length > 0 ? 1 : 0} to {localBanners.length} of {localBanners.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── UPLOAD/EDIT MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff' }}>
            <div className={styles.drawerHeader} style={{ padding: '20px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <FiImage size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>{formData.id ? 'Edit Banner' : 'Upload Banner'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={16} />
              </button>
            </div>
            
            <div className={styles.drawerBody} style={{ padding: '25px', overflowY: 'auto' }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Banner Title *</label>
                    <input type="text" name="title" className={styles.inputControl} value={formData.title} onChange={handleInputChange} placeholder="e.g. Diwali Dhamaka" style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Placement Type</label>
                    <select name="type" className={styles.inputControl} value={formData.type} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required>
                      <option value="">Select Placement</option>
                      <option value="Main Slider">Main Home Slider</option>
                      <option value="Side Promotion">Side Promotion</option>
                      <option value="Login Popup">Login Popup</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Status</label>
                    <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', height: '42px' }}>
                      <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                     <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Banner Image *</label>
                     <div style={{ border: '2px dashed #CBD5E1', borderRadius: '15px', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <FiImage style={{ fontSize: '2.5rem', color: '#94A3B8', marginBottom: '15px' }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>Click or Drag image to upload</p>
                        <small style={{ color: '#94A3B8', display: 'block', marginTop: '5px' }}>Recommended: 1920x450px (Max 2MB)</small>
                     </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                  <button type="button" style={{ padding: '12px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <PrimaryButton type="submit" style={{ flex: 1.5 }}>
                    Save Banner <FiCheck size={16} />
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
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
