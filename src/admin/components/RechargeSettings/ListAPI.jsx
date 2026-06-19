import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEdit, FiSettings, FiActivity, FiServer, FiX, FiCheck, FiChevronLeft, FiChevronRight, FiDatabase, FiPlus, FiCpu, FiTrendingUp, FiTrash2
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { toggleApiStatus } from '../../../store/slices/rechargeSlice';
import styles from '../MemberPages/MemberPages.module.css';

const ListAPI = () => {
  const dispatch = useDispatch();
  const { apiList: reduxApiList } = useSelector(state => state.recharge);
  const [localApiList, setLocalApiList] = useState(null);
  const apis = localApiList !== null ? localApiList : reduxApiList;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'api', 'operator', 'comm', 'add'
  const [selectedApi, setSelectedApi] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, api: null });

  const openModal = (type, api) => {
    setModalType(type);
    setSelectedApi(api);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (api) => {
    setShowConfirmModal({ isOpen: true, api });
  };

  const confirmDelete = () => {
    setLocalApiList(apis.filter(a => a.id !== showConfirmModal.api.id));
    setShowConfirmModal({ isOpen: false, api: null });
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>API Master List</h2>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }} onClick={() => openModal('add', null)}>
            <FiPlus /> <span>Integrate New API</span>
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
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
              placeholder="Search API gateways..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1300px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.NO</th>
                <th style={{ width: '250px' }}>API NAME</th>
                <th style={{ textAlign: 'center', width: '180px' }}>CREATED</th>
                <th style={{ textAlign: 'center', width: '180px' }}>LAST SYNC</th>
                <th style={{ textAlign: 'center', width: '100px' }}>EDIT API</th>
                <th style={{ textAlign: 'center', width: '100px' }}>EDIT OP</th>
                <th style={{ textAlign: 'center', width: '100px' }}>SET COMM.</th>
                <th style={{ textAlign: 'center', width: '100px' }}>STATUS</th>
                <th style={{ textAlign: 'center', width: '100px' }}>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {apis.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                    <div>No API Gateways configured</div>
                  </td>
                </tr>
              ) : (
                apis.map((api, idx) => (
                  <tr key={api.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(23, 86, 170, 0.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                           <FiCpu />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ color: '#1756AA', fontSize: '0.9rem', fontWeight: 800 }}>{api.name}</span>
                           <small style={{ color: '#718096', fontSize: '0.7rem', fontWeight: 600 }}>ID: #{api.apiId}</small>
                        </div></div></td>
                    <td style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>{api.createDate}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>{api.lastUpdate}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className={styles.editBtn} onClick={() => openModal('api', api)} style={{ background: 'transparent', border: 'none', color: '#1756AA', fontSize: '1.1rem', padding: 0 }} title="Edit API Details"><FiEdit /></button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className={styles.editBtn} onClick={() => openModal('operator', api)} style={{ background: 'transparent', border: 'none', color: '#1756AA', fontSize: '1.1rem', padding: 0 }} title="Manage Operators"><FiEdit /></button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className={styles.editBtn} onClick={() => openModal('comm', api)} style={{ background: 'transparent', border: 'none', color: '#1756AA', fontSize: '1.1rem', padding: 0 }} title="Set Commission"><FiEdit /></button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                        <input type="checkbox" checked={api.status} onChange={() => dispatch(toggleApiStatus(api.id))} />
                        <span className={styles.slider}></span>
                      </label>
                      {api.status && (
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#1E7E34', marginTop: '4px', textTransform: 'uppercase' }}>Online</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteClick(api)} style={{ background: 'transparent', border: 'none', color: '#E53E3E', fontSize: '1.1rem', padding: 0 }} title="Delete API">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {apis.length > 0 ? 1 : 0} to {apis.length} of {apis.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── CONFIG MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff' }}>
            <div className={styles.drawerHeader} style={{ padding: '15px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContext: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  {modalType === 'add' ? <FiPlus size={18} /> : <FiEdit size={18} />}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
                  {modalType === 'add' ? 'Integrate New API' : modalType === 'api' ? 'Edit API Integration' : modalType === 'operator' ? 'Operator Mapping' : 'Commission Structure'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={16} />
              </button>
            </div>
            
            <div className={styles.drawerBody} style={{ padding: '25px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gateway Name</label>
                  <input type="text" className={styles.inputControl} autoComplete="off" defaultValue={modalType === 'add' ? '' : selectedApi?.name} placeholder="Enter provider name" style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>API URL</label>
                  <input type="text" className={styles.inputControl} autoComplete="off" placeholder="Enter endpoint URL" style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Merchant Key</label>
                  <input type="password" className={styles.inputControl} autoComplete="new-password" placeholder="••••••••••••" style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Callback URL</label>
                  <input type="text" className={styles.inputControl} autoComplete="off" placeholder="https://yourdomain.com/callback" style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gateway Status</label>
                  <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1756AA' }}>ACTIVE</span>
                    <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                      <input type="checkbox" defaultChecked={selectedApi ? selectedApi.status : true} />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '35px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                <button 
                  type="button" 
                  style={{ 
                    padding: '12px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', 
                    borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }} 
                  onMouseOver={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  style={{ 
                    padding: '12px 20px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', border: 'none', 
                    color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', flex: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s'
                  }} 
                  onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'; }}
                  onClick={() => setIsModalOpen(false)}
                >
                  {modalType === 'add' ? 'Save Integration' : 'Update Gateway'} <FiChevronRight />
                </button>
              </div>
            </div>
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
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete API</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this API gateway? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => setShowConfirmModal({ isOpen: false, api: null })}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
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

export default ListAPI;
