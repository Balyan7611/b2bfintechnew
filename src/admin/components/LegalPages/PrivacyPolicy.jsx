import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiChevronRight, FiEdit2, FiTrash2, FiPlus, FiX, FiChevronLeft, FiImage, FiHash, FiUser
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const PrivacyPolicy = () => {
  const [privacyList, setPrivacyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formState, setFormState] = useState({
    id: 0,
    name: '',
    description: '',
    image: '',
    msrno: 1,
    companyMemberId: 1
  });

  const [expandedRows, setExpandedRows] = useState({});

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await API.privacyPolicy.getAll();
      setPrivacyList(data || []);
    } catch (error) {
      console.error('Failed to fetch privacy policies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormState({
      id: 0,
      name: '',
      description: '',
      image: '',
      msrno: 1,
      companyMemberId: 1
    });
    setIsEdit(false);
    setShowFormModal(true);
  };

  const handleOpenEdit = (item) => {
    setFormState({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image || '',
      msrno: item.msrno || 1,
      companyMemberId: item.companyMemberId || 1
    });
    setIsEdit(true);
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.description) return;

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await API.privacyPolicy.update(formState);
      } else {
        await API.privacyPolicy.create(formState);
      }
      setShowFormModal(false);
      fetchPolicies();
    } catch (error) {
      console.error('Failed to save policy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId) {
      try {
        await API.privacyPolicy.delete(confirmDeleteId);
        setConfirmDeleteId(null);
        fetchPolicies();
      } catch (error) {
        console.error('Failed to delete policy:', error);
      }
    }
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredList = privacyList.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E' }}>Privacy Policy List</h3>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' 
          }} onClick={handleOpenAdd}>
            <FiPlus /> <span>Add New Policy</span>
          </button>
        </div>

        {/* TOOLBAR */}
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
            <input 
              type="text" 
              placeholder="Search policies..." 
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', paddingLeft: '8px' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px', padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '200px', padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>TITLE / NAME</th>
                <th style={{ padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>DESCRIPTION / CONTENT</th>
                <th style={{ width: '120px', textAlign: 'center', padding: '10px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#4E6080', fontWeight: 600 }}>Loading policies...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#4E6080', fontWeight: 600 }}>No privacy policies found.</td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr key={item.id} style={{ verticalAlign: 'top' }} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{index + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0D1B3E', lineHeight: '1.4' }}>
                      {item.name}
                      {item.image && (
                        <div style={{ fontSize: '0.7rem', color: '#718096', marginTop: '5px', fontWeight: 500 }}>
                          Image: <span style={{ fontFamily: 'monospace' }}>{item.image}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#A0AEC0', marginTop: '5px', fontWeight: 500 }}>
                        MSR No: {item.msrno} | Member ID: {item.companyMemberId}
                      </div>
                    </td>
                    <td style={{ borderLeft: '1px solid #F1F5F9', paddingLeft: '20px' }}>
                      <div style={{ 
                        maxHeight: expandedRows[item.id] ? 'none' : '4.5em', 
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
                        onClick={() => toggleRowExpansion(item.id)}
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
                        {expandedRows[item.id] ? 'Read Less' : 'Read More'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          className={styles.actionBtn}
                          style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', border: 'none', padding: '8px', borderRadius: '8px' }}
                          onClick={() => handleOpenEdit(item)}
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className={styles.actionBtn}
                          style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C', border: 'none', padding: '8px', borderRadius: '8px' }}
                          onClick={() => setConfirmDeleteId(item.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Showing 1 to {filteredList.length} entries</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronLeft size={14} /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#1756AA', color: 'white', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      {showFormModal && (
        <div className={styles.drawerOverlay} onClick={() => setShowFormModal(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '480px', maxWidth: '95%' }}>
            <div className={styles.drawerHeader} style={{ padding: '15px 20px' }}>
              <div className={styles.directoryTitleGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isEdit ? <FiEdit2 /> : <FiPlus />}
                </div>
                <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem', margin: 0 }}>
                  {isEdit ? 'Edit Policy' : 'Add New Policy'}
                </h2>
              </div>
              <button onClick={() => setShowFormModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: '#4E6080' }}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className={styles.drawerBody} style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                  <label className={styles.label} style={{ fontSize: '0.75rem' }}>Policy Name / Title</label>
                  <div className={styles.inputWrap}>
                    <FiFileText className={styles.inputIcon} />
                    <input 
                      type="text" 
                      name="name"
                      className={styles.inputControl}
                      placeholder="Enter Title"
                      value={formState.name}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                  <label className={styles.label} style={{ fontSize: '0.75rem' }}>Image URL / Name (Optional)</label>
                  <div className={styles.inputWrap}>
                    <FiImage className={styles.inputIcon} />
                    <input 
                      type="text" 
                      name="image"
                      className={styles.inputControl}
                      placeholder="Enter Image link or name"
                      value={formState.image}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label} style={{ fontSize: '0.75rem' }}>MSR Serial No</label>
                    <div className={styles.inputWrap}>
                      <FiHash className={styles.inputIcon} />
                      <input 
                        type="number" 
                        name="msrno"
                        className={styles.inputControl}
                        placeholder="MSR No"
                        value={formState.msrno}
                        onChange={handleInputChange}
                        style={{ paddingLeft: '40px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label} style={{ fontSize: '0.75rem' }}>Company Member ID</label>
                    <div className={styles.inputWrap}>
                      <FiUser className={styles.inputIcon} />
                      <input 
                        type="number" 
                        name="companyMemberId"
                        className={styles.inputControl}
                        placeholder="Company Member ID"
                        value={formState.companyMemberId}
                        onChange={handleInputChange}
                        style={{ paddingLeft: '40px' }}
                        required
                      />
                    </div>
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
                    value={formState.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className={styles.drawerFooter} style={{ background: '#fff', borderTop: '1px solid #E2E8F0', padding: '12px 20px', paddingRight: '80px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className={styles.saveBtn} style={{ background: '#F1F5F9', color: '#4E6080', boxShadow: 'none' }} onClick={() => setShowFormModal(false)}>
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

      {/* ── DELETE CONFIRMATION ── */}
      {confirmDeleteId && (
        <div className={styles.drawerOverlay} onClick={() => setConfirmDeleteId(null)} style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(13, 27, 62, 0.6)' }}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()} style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFF5F5', color: '#E74C3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>
              <FiTrash2 />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '10px' }}>Confirm Deletion</h2>
            <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '30px' }}>Are you sure you want to remove this policy? This action is permanent and cannot be undone.</p>
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

export default PrivacyPolicy;
