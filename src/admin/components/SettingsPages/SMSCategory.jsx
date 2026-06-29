import React, { useState, useRef, useEffect } from 'react';
import { 
  FaSms, FaPlus, FaSearch, FaEdit, FaTrash, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, 
  FaPrint, FaChevronLeft, FaChevronRight, FaLayerGroup, FaCheck, FaCalendarAlt, FaTimes, FaDatabase, FaChevronDown
} from 'react-icons/fa';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const SMSCategory = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [status, setStatus] = useState('Active');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const standardCategories = [
    'Admin Login OTP',
    'Admin Fund Add OTP',
    'Admin Deduct Fund OTP',
    'Member Registration OTP',
    'Password Reset OTP',
    'Transaction Success',
    'Transaction Failed',
    'Wallet Top-up Notification',
    'Service Maintenance Alert',
    'Promotional Blast'
  ];

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await API.smsCategory.getAll();
      let parsed = [];
      if (response) {
        if (Array.isArray(response)) {
          parsed = response;
        } else if (Array.isArray(response.data)) {
          parsed = response.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          parsed = response.data.items;
        } else if (Array.isArray(response.items)) {
          parsed = response.items;
        }
      }
      setCategories(parsed);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredSuggestions = standardCategories.filter(item => 
    item.toLowerCase().includes(categoryName.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: editingCategory ? editingCategory.id : 0,
      name: categoryName,
      isActive: status === 'Active'
    };

    try {
      if (editingCategory) {
        await API.smsCategory.update(payload);
      } else {
        await API.smsCategory.create(payload);
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await API.smsCategory.delete(showConfirmModal.id);
      fetchCategories();
      setShowConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setStatus('Active');
    setEditingCategory(null);
    setShowModal(false);
    setShowSuggestions(false);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setStatus(cat.isActive !== false && cat.status !== 'Deactive' ? 'Active' : 'Deactive');
    setShowModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container} style={{ padding: '10px 15px', maxWidth: '100%' }}>
      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>SMS Categories</h2>
          <PrimaryButton onClick={() => setShowModal(true)}>
            <FaPlus /> <span>New Category</span>
          </PrimaryButton>
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
              placeholder="Search categories..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '700px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.No</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '280px' }}>CATEGORY NAME</th>
                <th style={{ width: '150px', textAlign: 'left' }}>STATUS</th>
                <th style={{ textAlign: 'left' }}>DATE CREATED</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                   <td colSpan="5" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.85rem' }}>No categories configured yet</span></div></td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className={styles.editBtn} style={{ width: '32px', height: '32px', background: '#1756AA', color: '#fff' }} title="Edit" onClick={() => handleEdit(cat)}><FaEdit /></button>
                        <button className={styles.deleteBtn} style={{ width: '32px', height: '32px', background: '#FFF5F5', color: '#E53E3E', border: '1.5px solid #FED7D7' }} title="Delete" onClick={() => setShowConfirmModal({ isOpen: true, id: cat.id })}><FaTrash /></button>
                      </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.9rem' }}>{cat.name}</span></div></td>
                    <td style={{ textAlign: 'left' }}>
                       <span className={`${styles.badge} ${cat.isActive !== false ? styles.badge_green : styles.badge_red}`} style={{ fontSize: '0.65rem', padding: '3px 10px' }}>
                         {cat.isActive !== false ? 'Active' : 'Deactive'}
                       </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        <FaCalendarAlt style={{ marginRight: '6px', opacity: 0.5 }} /> {cat.addDate || new Date().toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationRow} style={{ marginTop: '20px', paddingTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>Showing {categories.length > 0 ? 1 : 0} to {categories.length} of {categories.length} records</span>
          <div className={styles.pagination} style={{ display: 'flex', gap: '6px' }}>
            <button className={styles.pageBtn} style={{ width: '32px', height: '32px' }} disabled><FaChevronLeft /></button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`} style={{ width: '32px', height: '32px' }}>1</button>
            <button className={styles.pageBtn} style={{ width: '32px', height: '32px' }} disabled><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── CREATE/EDIT MODAL ── */}
      {showModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500 }}>
          <div className={styles.modalContainer} style={{ width: '420px', borderRadius: '16px' }}>
            <div className={styles.modalHeader} style={{ padding: '20px 25px 15px', borderBottom: '1px solid #F1F5F9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', background: 'rgba(23, 86, 170, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                     <FaSms />
                  </div>
                  <div>
                    <h3 className={styles.modalTitle} style={{ margin: 0, fontSize: '1.1rem' }}>{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#718096' }}>Configure category identity</p>
                  </div>
               </div>
               <button className={styles.closeBtn} onClick={resetForm}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody} style={{ padding: '20px 25px', overflow: 'visible' }}>
                 <div className={styles.formGroup} style={{ marginBottom: '15px', position: 'relative' }} ref={suggestionsRef}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Category Name</label>
                    <div style={{ position: 'relative' }}>
                       <input 
                         type="text" 
                         placeholder="Select or type..." 
                         className={styles.inputControl} 
                         style={{ height: '42px', fontSize: '0.85rem', paddingRight: '35px' }}
                         value={categoryName} 
                         onFocus={() => setShowSuggestions(true)}
                         onChange={(e) => {
                            setCategoryName(e.target.value);
                            setShowSuggestions(true);
                         }}
                         required
                       />
                       <div 
                         onClick={() => setShowSuggestions(!showSuggestions)}
                         style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#718096' }}
                       >
                          <FaChevronDown style={{ fontSize: '0.8rem', transform: showSuggestions ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                       </div>
                    </div>

                    {/* FLOATING SUGGESTIONS - No stretching the modal! */}
                    {showSuggestions && (
                       <div style={{ 
                         position: 'absolute', 
                         top: '100%', 
                         left: 0, 
                         right: 0, 
                         background: '#fff', 
                         borderRadius: '10px', 
                         boxShadow: '0 10px 30px rgba(0,0,0,0.18)', 
                         border: '1px solid #E2E8F0', 
                         zIndex: 1000, 
                         maxHeight: '160px', 
                         overflowY: 'auto',
                         marginTop: '5px'
                       }}>
                          {filteredSuggestions.length > 0 ? (
                             filteredSuggestions.map((s, i) => (
                                <div 
                                  key={i}
                                  onClick={() => {
                                     setCategoryName(s);
                                     setShowSuggestions(false);
                                  }}
                                  style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontSize: '0.85rem', color: '#0D1B3E' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFF'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                   {s}
                                </div>
                             ))
                          ) : (
                             <div style={{ padding: '12px 15px', color: '#718096', fontSize: '0.8rem' }}>New Category...</div>
                          )}
                       </div>
                    )}
                 </div>

                 <div className={styles.formGroup} style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Status</label>
                    <select 
                      className={styles.selectControl} 
                      style={{ height: '40px', fontSize: '0.85rem' }}
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                 </div>
              </div>

              <div className={styles.modalFooter} style={{ padding: '15px 25px', background: '#FBFDFF', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                  <button type="button" className={styles.prevBtn} style={{ height: '38px', padding: '0 20px', fontSize: '0.8rem' }} onClick={resetForm}>Cancel</button>
                  <div style={{ flex: 1 }}></div>
                  <PrimaryButton type="submit" style={{ height: '38px', padding: '0 30px', fontSize: '0.85rem' }}>
                    <FaCheck /> {editingCategory ? 'Update' : 'Save Category'}
                  </PrimaryButton>
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
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Category</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this SMS category? This action cannot be undone.
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

export default SMSCategory;
