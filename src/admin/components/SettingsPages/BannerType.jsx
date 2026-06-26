import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, 
  FaPrint, FaChevronLeft, FaChevronRight, FaCheck, FaCalendarAlt, FaTimes, FaFlag
} from 'react-icons/fa';
import { FiEdit, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const BannerType = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [editingType, setEditingType] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [status, setStatus] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [bannerTypes, setBannerTypes] = useState([]);
  
  // Custom Action Dropdown State (Matching ManageCompany approach)
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, typeObj: null, isUpward: false });

  const fetchBannerTypes = async () => {
    try {
      const response = await API.bannerType.getAll();
      if (response) {
        // If response.data is an array
        if (Array.isArray(response.data)) {
          setBannerTypes(response.data);
        }
        // If the array is inside response.data.data
        else if (response.data && Array.isArray(response.data.data)) {
          setBannerTypes(response.data.data);
        }
        // If backend returned { status: true, data: [...], ... }
        else if (Array.isArray(response.dataList)) {
          setBannerTypes(response.dataList);
        }
        // If the response root is an array
        else if (Array.isArray(response)) {
          setBannerTypes(response);
        }
        // If the backend has a custom wrapper response.data with a nested array or list
        else if (response.data && typeof response.data === 'object') {
          const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
          if (possibleArray) {
            setBannerTypes(possibleArray);
          } else {
            setBannerTypes([]);
          }
        } 
        // Fallback checks on top-level object keys
        else {
          const possibleArray = Object.values(response).find(val => Array.isArray(val));
          if (possibleArray) {
            setBannerTypes(possibleArray);
          } else {
            setBannerTypes([]);
          }
        }
      } else {
        setBannerTypes([]);
      }
    } catch (error) {
      console.error("Failed to fetch banner types:", error);
      setBannerTypes([]);
    }
  };

  useEffect(() => {
    fetchBannerTypes();
    
    // Close dropdown on click outside
    const handleOutsideClick = () => {
      setActiveActionRow({ id: null, x: 0, y: 0, typeObj: null, isUpward: false });
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: editingType ? editingType.id : 0,
      name: typeName,
      isActive: status === 'Active'
    };

    try {
      if (editingType) {
        await API.bannerType.update(payload);
      } else {
        await API.bannerType.create(payload);
      }
      fetchBannerTypes();
      resetForm();
    } catch (error) {
      console.error("Error saving banner type:", error);
      alert("Failed to save banner type. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await API.bannerType.delete(showConfirmModal.id);
      fetchBannerTypes();
      setShowConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error("Error deleting banner type:", error);
      alert("Failed to delete banner type.");
    }
  };

  const resetForm = () => {
    setTypeName('');
    setStatus('Active');
    setEditingType(null);
    setShowModal(false);
  };

  const handleEdit = (typeObj) => {
    setEditingType(typeObj);
    setTypeName(typeObj.name);
    setStatus(typeObj.isActive !== false ? 'Active' : 'Deactive');
    setShowModal(true);
  };

  // Filter local results based on Search Term
  const filteredTypes = bannerTypes.filter(item => 
    item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalRecords = filteredTypes.length;
  const totalPages = Math.ceil(totalRecords / entriesPerPage) || 1;
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = filteredTypes.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className={styles.container} style={{ padding: '10px 15px', maxWidth: '100%' }}>
      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>Banner Types</h2>
          <PrimaryButton onClick={() => setShowModal(true)}>
            <FaPlus /> <span>New Banner Type</span>
          </PrimaryButton>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '20px 25px', flexWrap: 'wrap', gap: '20px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
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
              placeholder="Search banner types..." 
              style={{ borderRadius: '10px' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '700px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.No</th>
                <th style={{ width: '130px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '280px' }}>BANNER TYPE NAME</th>
                <th style={{ width: '150px', textAlign: 'left' }}>STATUS</th>
                <th style={{ textAlign: 'left' }}>DATE CREATED</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                   <td colSpan="5" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.85rem' }}>No banner types configured yet</span></div></td>
                </tr>
              ) : (
                currentRecords.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{String(indexOfFirstRecord + idx + 1).padStart(2, '0')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          className="action-dropdown-wrapper"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeActionRow.id === item.id) {
                              setActiveActionRow({ id: null, x: 0, y: 0, typeObj: null, isUpward: false });
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownHeight = 90;
                              const isUpward = (window.innerHeight - rect.bottom) < dropdownHeight;
                              
                              setActiveActionRow({ 
                                id: item.id, 
                                x: rect.right + 12, 
                                y: isUpward ? rect.bottom : rect.top, 
                                isUpward,
                                typeObj: item 
                              });
                            }
                          }}
                          style={{ padding: '0 12px', height: '32px', borderRadius: '8px', background: activeActionRow.id === item.id ? '#D1FAE5' : '#10B981', color: activeActionRow.id === item.id ? '#059669' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s', boxShadow: activeActionRow.id === item.id ? 'none' : '0 2px 6px rgba(16,185,129,0.3)' }}
                          title="Actions"
                        >
                          Action <span style={{ fontSize: '1.1rem', marginTop: '-2px', fontWeight: 900 }}>⋮</span>
                        </button>
                      </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.9rem' }}>{item.name}</span></div></td>
                    <td style={{ textAlign: 'left' }}>
                       <span className={`${styles.badge} ${item.isActive !== false ? styles.badge_green : styles.badge_red}`} style={{ fontSize: '0.65rem', padding: '3px 10px' }}>
                         {item.isActive !== false ? 'Active' : 'Deactive'}
                       </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                       <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        <FaCalendarAlt style={{ marginRight: '6px', opacity: 0.5 }} /> {item.addDate || new Date().toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationRow} style={{ marginTop: '20px', paddingTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            Showing {totalRecords > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, totalRecords)} of {totalRecords} records
          </span>
          <div className={styles.pagination} style={{ display: 'flex', gap: '6px' }}>
            <button 
              className={styles.pageBtn} 
              style={{ width: '32px', height: '32px' }} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <FaChevronLeft />
            </button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`} style={{ width: '32px', height: '32px' }}>
              {currentPage}
            </button>
            <button 
              className={styles.pageBtn} 
              style={{ width: '32px', height: '32px' }} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTION DROPDOWN PORTAL (fixed position) ── */}
      {activeActionRow.id && (
        <>
          <style>{`
            @keyframes dropdownFadeInSideComp {
              from { opacity: 0; transform: translateX(-10px) ${activeActionRow.isUpward ? 'translateY(10px)' : 'translateY(-10px)'}; }
              to   { opacity: 1; transform: translateX(0) translateY(0); }
            }
          `}</style>
          <div
            className="action-dropdown-wrapper"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'fixed', 
              top: activeActionRow.isUpward ? 'auto' : activeActionRow.y, 
              bottom: activeActionRow.isUpward ? (window.innerHeight - activeActionRow.y) : 'auto',
              left: activeActionRow.x, 
              background: '#fff', 
              borderRadius: '12px', 
              boxShadow: '0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)', 
              border: '1px solid #E2E8F0', 
              zIndex: 9999, 
              minWidth: '168px', 
              overflow: 'hidden', 
              animation: 'dropdownFadeInSideComp 0.15s ease-out' 
            }}
          >
            <button
              onClick={() => { handleEdit(activeActionRow.typeObj); setActiveActionRow({ id: null, x: 0, y: 0, typeObj: null, isUpward: false }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiEdit size={12} /></span>
              Edit
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setConfirmModalOpenAndCloseAction(activeActionRow.typeObj.id); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#E53E3E', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiTrash2 size={12} /></span>
              Delete
            </button>
          </div>
        </>
      )}

      {/* ── CREATE/EDIT MODAL ── */}
      {showModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500 }}>
          <div className={styles.modalContainer} style={{ width: '420px', borderRadius: '16px' }}>
            <div className={styles.modalHeader} style={{ padding: '20px 25px 15px', borderBottom: '1px solid #F1F5F9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', background: 'rgba(23, 86, 170, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                     <FaFlag />
                  </div>
                  <div>
                    <h3 className={styles.modalTitle} style={{ margin: 0, fontSize: '1.1rem' }}>{editingType ? 'Edit Banner Type' : 'New Banner Type'}</h3>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#718096' }}>Configure banner type settings</p>
                  </div>
               </div>
               <button className={styles.closeBtn} onClick={resetForm}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody} style={{ padding: '20px 25px', overflow: 'visible' }}>
                 <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Banner Type Name</label>
                    <input 
                      type="text" 
                      placeholder="Type Banner Type Name..." 
                      className={styles.inputControl} 
                      style={{ height: '42px', fontSize: '0.85rem' }}
                      value={typeName} 
                      onChange={(e) => setTypeName(e.target.value)}
                      required
                    />
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
                    <FaCheck /> {editingType ? 'Update' : 'Save Banner Type'}
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
                <FiTrash2 style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Banner Type</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this Banner Type? This action cannot be undone.
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

  function setConfirmModalOpenAndCloseAction(id) {
    setShowConfirmModal({ isOpen: true, id });
    setActiveActionRow({ id: null, x: 0, y: 0, typeObj: null, isUpward: false });
  }
};

export default BannerType;
