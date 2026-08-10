import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiFileText, FiSearch, FiChevronRight, FiTrash2, FiPlus, FiX, FiChevronLeft
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { 
  updateSecurityForm, addSecurity, deleteSecurity, toggleSecurityExpansion, setIsSubmitting 
} from '../../../store/slices/legalSlice';
import styles from '../MemberPages/MemberPages.module.css';

const SecurityTips = () => {
  const dispatch = useDispatch();
  const { securityForm, securityList, securityExpandedRow, isSubmitting } = useSelector(state => state.legal);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateSecurityForm({ name, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!securityForm.newsName || !securityForm.description) return;
    
    dispatch(setIsSubmitting(true));
    setTimeout(() => {
      dispatch(addSecurity());
      dispatch(setIsSubmitting(false));
      setShowAddModal(false);
    }, 1000);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      dispatch(deleteSecurity(confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
            <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E' }}>Security Tips List</h3>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' 
          }} onClick={() => setShowAddModal(true)}>
            <FiPlus /> <span>Add New Tip</span>
          </button>
        </div>

                <div className="global-table-toolbar" style={{ padding: '12px 15px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '6px', border: '1px solid #E2E8F0', height: '30px', padding: '0 8px' }}>
              <option>10</option>
              <option>25</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" style={{ width: '30px', height: '30px' }} title="Copy Table"><FaCopy size={12} /></button>
            <button className="global-export-btn btn-excel" style={{ width: '30px', height: '30px' }} title="Download Excel"><FaFileExcel size={12} /></button>
            <button className="global-export-btn btn-pdf" style={{ width: '30px', height: '30px' }} title="Download PDF"><FaFilePdf size={12} /></button>
            <button className="global-export-btn btn-csv" style={{ width: '30px', height: '30px' }} title="Download CSV"><FaFileCsv size={12} /></button>
            <button className="global-export-btn btn-print" style={{ width: '30px', height: '30px' }} title="Print Table"><FaPrint size={12} /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '220px', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0 10px', height: '32px' }}>
            <FiSearch style={{ color: '#9CA3AF' }} />
            <input type="text" placeholder="Search tips..." style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', paddingLeft: '8px' }} />
          </div>
        </div>

                <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px', padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '200px', padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>TITLE / NAME</th>
                <th style={{ padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>DESCRIPTION / CONTENT</th>
                <th style={{ width: '100px', textAlign: 'center', padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {securityList.map((item, index) => (
                <tr key={item.id} style={{ verticalAlign: 'top' }} className={styles.hoverRow}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{index + 1}</td>
                  <td style={{ fontWeight: 800, color: '#0D1B3E', lineHeight: '1.4' }}>
                    {item.name}
                  </td>
                  <td style={{ borderLeft: '1px solid #F1F5F9', paddingLeft: '20px' }}>
                    <div style={{ 
                      maxHeight: securityExpandedRow === item.id ? 'none' : '4.5em', 
                      overflow: 'hidden',
                      position: 'relative',
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      color: '#4E6080',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {item.description}
                    </div>
                    <button 
                      onClick={() => dispatch(toggleSecurityExpansion(item.id))}
                      style={{ 
                        border: 'none', 
                        background: 'rgba(23, 86, 170, 0.05)', 
                        color: '#1756AA', 
                        fontWeight: 700, 
                        fontSize: '0.75rem', 
                        cursor: 'pointer',
                        marginTop: '10px',
                        padding: '4px 10px',
                        borderRadius: '4px'
                      }}
                    >
                      {securityExpandedRow === item.id ? 'Read Less' : 'Read More'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className={styles.actionBtn}
                      style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C', border: 'none', padding: '8px', borderRadius: '8px', margin: '0 auto' }}
                      onClick={() => setConfirmDeleteId(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

                <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Showing 1 to {securityList.length} entries</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronLeft size={14} /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#1756AA', color: 'white', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronRight size={14} /></button>
          </div>
        </div>
      </div>

            {showAddModal && (
        <div className={styles.drawerOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '480px', maxWidth: '95%' }}>
            <div className={styles.drawerHeader} style={{ padding: '15px 20px' }}>
              <div className={styles.directoryTitleGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiPlus />
                </div>
                <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem', margin: 0 }}>Add New Tip</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: '#4E6080' }}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className={styles.drawerBody} style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                  <label className={styles.label} style={{ fontSize: '0.75rem' }}>Tip Name / Title</label>
                  <div className={styles.inputWrap}>
                    <FiFileText className={styles.inputIcon} />
                    <input 
                      type="text" 
                      name="newsName"
                      className={styles.inputControl}
                      placeholder="Enter Title"
                      value={securityForm.newsName}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
                  <label className={styles.label} style={{ fontSize: '0.75rem' }}>Full Description</label>
                  <textarea 
                    className={styles.inputControl}
                    style={{ 
                      paddingLeft: '16px', 
                      minHeight: '200px', 
                      borderRadius: '12px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      lineHeight: '1.6'
                    }}
                    placeholder="Write details here..."
                    name="description"
                    value={securityForm.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

                            <div className={styles.drawerFooter} style={{ background: '#fff', borderTop: '1px solid #E2E8F0', padding: '12px 20px', paddingRight: '80px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className={styles.saveBtn} style={{ background: '#F1F5F9', color: '#4E6080', boxShadow: 'none' }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn} 
                  disabled={isSubmitting}
                  style={{ minWidth: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1756AA', boxShadow: 'none' }}
                >
                  {isSubmitting ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <>Save Record <FiChevronRight /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {confirmDeleteId && (
        <div className={styles.drawerOverlay} onClick={() => setConfirmDeleteId(null)} style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(13, 27, 62, 0.6)' }}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()} style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFF5F5', color: '#E74C3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>
              <FiTrash2 />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '10px' }}>Confirm Deletion</h2>
            <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '30px' }}>Are you sure you want to remove this tip? This action is permanent and cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className={styles.saveBtn} style={{ background: '#F1F5F9', color: '#4E6080', boxShadow: 'none' }} onClick={() => setConfirmDeleteId(null)}>
                No, Keep it
              </button>
              <button className={styles.saveBtn} style={{ background: '#E74C3C', boxShadow: 'none' }} onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityTips;
