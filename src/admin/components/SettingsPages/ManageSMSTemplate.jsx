import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaTrash, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, 
  FaPrint, FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle, FaCheck, FaTimes, FaEdit, FaChartBar, FaFileAlt, FaDatabase
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const ManageSMSTemplate = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [editingItem, setEditingItem] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    approved: true,
    usageCount: '0'
  });

  const [templates, setTemplates] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date().toLocaleDateString();
    if (editingItem) {
      setTemplates(templates.map(t => t.id === editingItem.id ? { ...t, ...formData, lastModified: now } : t));
      setSuccessToast('Template updated successfully!');
    } else {
      setTemplates([{ ...formData, id: Date.now(), lastModified: now }, ...templates]);
      setSuccessToast('New template added successfully!');
    }
    resetForm();
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', approved: true, usageCount: '0' });
    setEditingItem(null);
    setIsDrawerOpen(false);
  };

  const handleEdit = (tmp) => {
    setEditingItem(tmp);
    setFormData({
      name: tmp.name,
      approved: tmp.approved,
      usageCount: tmp.usageCount
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = () => {
    setTemplates(templates.filter(t => t.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
    setSuccessToast('Template deleted successfully.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className={styles.container} style={{ padding: '10px 15px', maxWidth: '100%', position: 'relative' }}>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .icon-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
      `}</style>

      {/* TOAST SUCCESS MESSAGE */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0F172A',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 4000,
          fontSize: '0.85rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCheck style={{ fontSize: '0.65rem', color: '#fff' }} />
          </div>
          {successToast}
        </div>
      )}

      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>Manage SMS Templates</h2>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, 
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' 
          }} onClick={() => setIsDrawerOpen(true)}>
            <FaPlus /> <span>Add Template</span>
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '20px 25px', flexWrap: 'wrap', gap: '20px', borderBottom: 'none' }}>
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
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search templates..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '800px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.No</th>
                <th style={{ width: '110px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '250px' }}>TEMPLATE NAME</th>
                <th style={{ width: '150px', textAlign: 'left' }}>APPROVAL STATUS</th>
                <th style={{ width: '120px', textAlign: 'left' }}>USAGE COUNT</th>
                <th style={{ textAlign: 'left' }}>LAST MODIFIED</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                   <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                     <div>No templates found</div>
                   </td>
                </tr>
              ) : (
                templates.map((tmp, idx) => (
                  <tr key={tmp.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 0' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', flexDirection: 'row', margin: '0 auto' }}>
                        <button 
                          onClick={() => handleEdit(tmp)}
                          className="icon-action-btn"
                          style={{
                            background: '#3B82F6',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
                          title="Edit Template"
                        >
                          <FaEdit style={{ fontSize: '0.85rem' }} />
                        </button>
                        <button 
                          onClick={() => setShowConfirmModal({ isOpen: true, id: tmp.id })}
                          className="icon-action-btn"
                          style={{
                            background: '#FFF5F5',
                            color: '#E53E3E',
                            border: '1px solid #FEE2E2',
                            boxShadow: '0 2px 4px rgba(229, 62, 62, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E53E3E';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = '#E53E3E';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFF5F5';
                            e.currentTarget.style.color = '#E53E3E';
                            e.currentTarget.style.borderColor = '#FEE2E2';
                          }}
                          title="Delete Template"
                        >
                          <FaTrash style={{ fontSize: '0.8rem' }} />
                        </button>
                      </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.9rem' }}>{tmp.name}</span></div></td>
                    <td style={{ textAlign: 'left' }}>
                      {tmp.approved ? (
                        <span className={`${styles.badge} ${styles.badge_green}`} style={{ padding: '4px 12px', fontSize: '0.65rem', fontWeight: 700 }}>
                           <FaCheckCircle style={{ marginRight: '5px' }} /> Approved
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badge_red}`} style={{ padding: '4px 12px', fontSize: '0.65rem', fontWeight: 700, background: '#FEE2E2', color: '#EF4444' }}>
                           <FaTimesCircle style={{ marginRight: '5px' }} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaChartBar style={{ color: '#1756AA', opacity: 0.5, fontSize: '0.8rem' }} />
                          <span style={{ fontWeight: 800, color: '#4E6080', fontSize: '0.9rem' }}>{tmp.usageCount}</span></div></td>
                    <td style={{ textAlign: 'left', fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>{tmp.lastModified}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ROW ── */}
        <div className={styles.paginationRow} style={{ 
          marginTop: '20px', 
          paddingTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid #F1F5F9',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '15px'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Showing {templates.length > 0 ? 1 : 0} to {templates.length} of {templates.length} entries</span>
          <div className={styles.pagination} style={{ display: 'flex', gap: '6px' }}>
            <button className={styles.pageBtn} style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              background: '#fff', 
              color: '#A0AEC0', 
              cursor: 'not-allowed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem'
            }} disabled><FaChevronLeft /></button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`} style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: 'none', 
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
              color: '#fff', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.85rem',
              boxShadow: '0 3px 8px rgba(30, 58, 138, 0.2)'
            }}>1</button>
            <button className={styles.pageBtn} style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              background: '#fff', 
              color: '#A0AEC0', 
              cursor: 'not-allowed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem'
            }} disabled><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── PREMIUM RIGHT-SIDE SLIDING DRAWER ── */}
      {isDrawerOpen && (
        <div 
          onClick={resetForm}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15, 23, 42, 0.3)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 3500,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'fixed', 
              top: 0, 
              right: 0, 
              bottom: 0, 
              width: '450px', 
              background: '#ffffff', 
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.08)', 
              zIndex: 3501, 
              display: 'flex', 
              flexDirection: 'column', 
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid #E2E8F0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#F8FAFC' 
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(30, 58, 138, 0.15)'
                  }}>
                     <FaFileAlt />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {editingItem ? 'Edit Template Info' : 'New Template Entry'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>Update template usage rules</p>
                  </div>
               </div>
               <button 
                 onClick={resetForm}
                 style={{
                   width: '28px',
                   height: '28px',
                   borderRadius: '50%',
                   border: '1px solid #E2E8F0',
                   background: '#FFFFFF',
                   color: '#64748B',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease',
                   padding: 0
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.background = '#EF4444';
                   e.currentTarget.style.color = '#ffffff';
                   e.currentTarget.style.borderColor = '#EF4444';
                   e.currentTarget.style.transform = 'rotate(90deg)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.background = '#FFFFFF';
                   e.currentTarget.style.color = '#64748B';
                   e.currentTarget.style.borderColor = '#E2E8F0';
                   e.currentTarget.style.transform = 'none';
                 }}
               >
                 <FaTimes style={{ fontSize: '0.75rem' }} />
               </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 
                 <div className={styles.formGroup}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Template Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className={styles.inputControl} 
                      style={{ height: '40px', fontSize: '0.85rem', width: '100%', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px' }} 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Transaction OTP"
                      required 
                    />
                 </div>

                 <div className={styles.formGroup}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Usage Count</label>
                    <input 
                      type="text" 
                      name="usageCount" 
                      className={styles.inputControl} 
                      style={{ height: '40px', fontSize: '0.85rem', width: '100%', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px' }} 
                      value={formData.usageCount} 
                      onChange={handleInputChange} 
                      placeholder="0"
                    />
                 </div>

                 <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E3A8A', display: 'block' }}>Approval Status</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Enable template for immediate use</span>
                       </div>
                       
                       {/* Custom Styled Switch Toggle for Approval */}
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div 
                            onClick={() => setFormData(prev => ({ ...prev, approved: !prev.approved }))}
                            style={{
                              width: '40px',
                              height: '18px',
                              borderRadius: '9px',
                              background: formData.approved ? '#22C55E' : '#EF4444',
                              padding: '2px',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              left: formData.approved ? '24px' : '2px',
                              top: '2px',
                              transition: 'left 0.2s'
                            }} />
                          </div>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 800, 
                            color: formData.approved ? '#22C55E' : '#EF4444',
                            background: formData.approved ? '#DCFCE7' : '#FEE2E2',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                          }}>
                            {formData.approved ? 'Active' : 'Pending'}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Drawer Footer */}
              <div style={{ 
                padding: '16px 24px', 
                background: '#F8FAFC', 
                borderTop: '1px solid #E2E8F0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    style={{ 
                      height: '38px', 
                      padding: '0 20px', 
                      fontSize: '0.85rem', 
                      background: '#FFFFFF', 
                      border: '1px solid #D1D5DB', 
                      borderRadius: '8px', 
                      color: '#4B5563', 
                      fontWeight: 600,
                      cursor: 'pointer' 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ 
                      height: '38px', 
                      padding: '0 25px', 
                      fontSize: '0.85rem', 
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' 
                    }}
                  >
                    Save Changes
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', marginBottom: '16px' }}>
                <FaTrash style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Template</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this SMS template? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  onClick={() => setShowConfirmModal({ isOpen: false, id: null })}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  style={{ flex: 1, padding: '10px', background: '#E53E3E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSMSTemplate;
