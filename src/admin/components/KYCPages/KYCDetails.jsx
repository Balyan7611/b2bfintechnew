import React, { useState } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEye, FiUser, FiCalendar, FiCheckCircle, FiCheck, FiAlertCircle,
  FiX, FiDownload, FiInfo, FiLayers, FiActivity, FiDatabase, FiShield, FiChevronLeft, FiChevronRight, FiFilter, FiCopy
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { approveKyc, rejectKyc } from '../../../store/slices/kycSlice';
import styles from '../MemberPages/MemberPages.module.css';

const KYCDetails = () => {
  const dispatch = useDispatch();
  const { list: memberList } = useSelector(state => state.member?.manageMemberState || { list: [] });
  const [selectedMember, setSelectedMember] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, docIndex: null, label: '' });
  const [docStatus, setDocStatus] = useState({});
  const [docReasons, setDocReasons] = useState({});
  const [rejectReason, setRejectReason] = useState('');

  const [kycDetails, setKycDetails] = useState([
    { id: 1, reqDate: '11/03/2025 19:38:25', personName: 'TSM1002 pawan 9354302228', parent: '100000 VIVEK VARSHNEY 9999999999', approveDate: '11/03/2025 19:44:54', approved: true, status: 'Approved' },
    { id: 2, reqDate: '06/03/2025 14:29:27', personName: '100000 VIVEK VARSHNEY 9999999999', parent: '100000 VIVEK VARSHNEY 9999999999', approveDate: '06/03/2025 14:29:27', approved: true, status: 'Approved' },
    { id: 3, reqDate: '07/05/2025 11:47:21', personName: 'Pay99RT4537 KHEM CHAND 8750725849', parent: '100000 VIVEK VARSHNEY 9999999999', approveDate: '07/05/2025 11:47:21', approved: true, status: 'Approved' },
    { id: 4, reqDate: '06/05/2025 08:47:42', personName: 'Pay99RT4527 NARESH KUMAR 8700095925', parent: '100000 VIVEK VARSHNEY 9999999999', approveDate: '06/05/2025 08:47:42', approved: true, status: 'Approved' },
    { id: 5, reqDate: '23/04/2025 17:16:11', personName: 'Pay99RT4417 Arun Dalal 8683806397', parent: '100000 VIVEK VARSHNEY 9999999999', approveDate: '24/04/2025 19:38:22', approved: true, status: 'Approved' },
  ]);

  const handleView = (item) => {
    setViewingItem(item);
    setDocStatus({});
    setDocReasons({});
    setShowModal(true);
  };

  const handleApproveDoc = (idx, label) => {
    setConfirmModal({ isOpen: true, type: 'APPROVE_DOC', docIndex: idx, label });
  };

  const handleRejectDoc = (idx, label) => {
    setRejectReason('');
    setConfirmModal({ isOpen: true, type: 'REJECT_DOC', docIndex: idx, label });
  };

  const handleToggleApproved = (id, currentVal) => {
    setConfirmModal({
      isOpen: true,
      type: currentVal ? 'TOGGLE_REJECT' : 'TOGGLE_APPROVE',
      id,
      label: 'Member Status'
    });
  };

  const confirmAction = () => {
    if (confirmModal.type === 'APPROVE_DOC') {
      setDocStatus(prev => ({ ...prev, [confirmModal.docIndex]: 'Approved' }));
    } else if (confirmModal.type === 'REJECT_DOC') {
      setDocStatus(prev => ({ ...prev, [confirmModal.docIndex]: 'Rejected' }));
      setDocReasons(prev => ({ ...prev, [confirmModal.docIndex]: rejectReason }));
    } else if (confirmModal.type === 'TOGGLE_APPROVE') {
      setKycDetails(prev => prev.map(item => item.id === confirmModal.id ? { ...item, approved: true, status: 'Approved', approveDate: new Date().toLocaleString('en-GB') } : item));
    } else if (confirmModal.type === 'TOGGLE_REJECT') {
      setKycDetails(prev => prev.map(item => item.id === confirmModal.id ? { ...item, approved: false, status: 'Pending', approveDate: '-' } : item));
    }
    setConfirmModal({ isOpen: false, type: '', id: null, docIndex: null, label: '' });
  };

  const filteredData = kycDetails.filter(item => {
    const matchesSearch = item.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.parent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMember = selectedMember ? item.personName.includes(selectedMember) : true;
    return matchesSearch && matchesMember;
  });

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── MAIN REPORT CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.2rem' }}>KYC Member Report</h2>
            <p className={styles.directorySubtitle} style={{ fontSize: '0.75rem' }}>Tracking history of identification verification</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', color: '#0D1B3E', fontWeight: 600, background: '#F8FAFF', minWidth: '200px' }}
            >
              <option value="">All Members</option>
              <option value="100000">100000 VIVEK VARSHNEY</option>
              <option value="TSM1002">TSM1002 pawan</option>
              <option value="Pay99RT4537">Pay99RT4537 KHEM CHAND</option>
              <option value="Pay99RT4527">Pay99RT4527 NARESH KUMAR</option>
              <option value="Pay99RT4417">Pay99RT4417 Arun Dalal</option>
              {memberList && memberList.map(m => (
                 <option key={m.id} value={m.memberId}>{m.memberId} - {m.name}</option>
              ))}
            </select>

            {selectedMember && (
              <button 
                onClick={() => setSelectedMember('')}
                style={{ background: '#FFF5F5', color: '#E53E3E', border: '1.5px solid #FED7D7', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(e.target.value)}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="kycdetails_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ textAlign: 'center', width: '60px' }}>VIEW</th>
                <th>MEMBER IDENTITY</th>
                <th>PARENT BRANCH</th>
                <th style={{ textAlign: 'center' }}>REQ. DATE</th>
                <th style={{ textAlign: 'center' }}>APP. DATE</th>
                <th style={{ textAlign: 'center', width: '90px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan="7" style={{ padding: 0, background: '#fff' }}>
                     <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', color: '#A0AEC0' }}>
                       <div style={{ fontSize: '1.5rem', opacity: 0.3 }}><FiDatabase /></div>
                       <div style={{ fontSize: '0.85rem' }}>No records match selection</div>
                     </div>
                   </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{index + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className={styles.editBtn} 
                        style={{ background: '#F8FAFF', color: '#1756AA', border: '1.5px solid #1756AA', width: 'auto', padding: '0 12px', height: '32px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }} 
                        onClick={() => handleView(item)} 
                        title="View Details"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                    <td>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.85rem' }}>{item.personName.split(' ').slice(1, 4).join(' ')}</span>
                          <small style={{ color: '#1756AA', fontWeight: 600, fontSize: '0.7rem' }}>ID: {item.personName.split(' ')[0]}</small>
                       </div>
                    </td>
                    <td>
                       <div style={{ fontSize: '0.8rem', color: '#4E6080' }}>{item.parent}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '0.75rem' }}>{item.reqDate}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '0.75rem', color: '#27AE60', fontWeight: 600 }}>{item.approveDate}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <label className={styles.switch} style={{ transform: 'scale(0.7)' }}>
                        <input type="checkbox" checked={item.approved} onChange={() => handleToggleApproved(item.id, item.approved)} />
                        <span className={styles.slider}></span>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>Showing {filteredData.length} records</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">1</button>
            <button className="global-page-btn" disabled><FiChevronRight /></button>
          </div>
        </div>
      </div>



      {/* ── DETAILS MODAL ── */}
      {showModal && viewingItem && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} style={{ 
            width: '95%', 
            maxWidth: '1000px', 
            height: '95vh', 
            maxHeight: '900px',
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            
            <div className={styles.modalHeader} style={{ 
              padding: '16px 24px', 
              background: '#ffffff', 
              borderBottom: '1px solid #E2E8F0', 
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(135deg, rgba(23, 86, 170, 0.1) 0%, rgba(23, 86, 170, 0.2) 100%)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#1756AA' 
                }}>
                  <FiUser size={20} />
                </div>
                <div>
                  <h3 className={styles.modalTitle} style={{ fontSize: '1.15rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>KYC Dossier: {viewingItem.personName.split(' ').slice(1, 3).join(' ')}</h3>
                  <p className={styles.modalSubtitle} style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>Verifying Member ID: <span style={{ fontWeight: 600, color: '#1756AA' }}>{viewingItem.personName.split(' ')[0]}</span></p>
                </div>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setShowModal(false)} 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#F1F5F9', 
                  border: 'none', 
                  color: '#64748B', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.modalBody} style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#F8FAFC' }}>
               {[
                 { type: 'Aadhar Card', number: 'XXXX-XXXX-1234', date: viewingItem.reqDate },
                 { type: 'PAN Card', number: 'XXXX-XX-5678', date: viewingItem.reqDate },
                 { type: 'Shop Registration Certificate', number: 'REG-8371625-M', date: viewingItem.reqDate }
               ].map((doc, idx) => {
                 const status = docStatus[idx] || (idx === 0 ? viewingItem.status : 'Pending');
                 const bg = status === 'Approved' ? '#ECFDF5' : status === 'Rejected' ? '#FEF2F2' : '#ffffff';
                 const border = status === 'Approved' ? '1px solid #10B981' : status === 'Rejected' ? '1px solid #EF4444' : '1px solid #E2E8F0';
                 const shadow = status === 'Approved' ? '0 10px 15px -3px rgba(16, 185, 129, 0.05)' : status === 'Rejected' ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)';

                 return (
                   <div 
                     key={idx} 
                     style={{ 
                       background: bg, 
                       borderRadius: '20px', 
                       border: border, 
                       padding: '24px', 
                       marginBottom: '20px', 
                       boxShadow: shadow, 
                       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                     }}
                   >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', flex: 1 }}>
                            <div>
                              <small style={{ color: '#64748B', display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</small>
                              <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.95rem' }}>{doc.type}</span>
                            </div>
                            <div>
                              <small style={{ color: '#64748B', display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Number</small>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{doc.number}</span>
                            </div>
                            <div>
                              <small style={{ color: '#64748B', display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Date</small>
                              <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>{doc.date}</span>
                            </div>
                         </div>
                         <div>
                            <span style={{
                              background: status === 'Approved' ? '#D1FAE5' : status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                              color: status === 'Approved' ? '#065F46' : status === 'Rejected' ? '#991B1B' : '#92400E',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                              {status}
                            </span>
                         </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                         <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                              <FiActivity size={14} style={{ color: '#1756AA' }} /> Document Front
                            </label>
                            <div style={{ 
                              height: '180px', 
                              background: '#F8FAFF', 
                              borderRadius: '16px', 
                              border: '2px dashed #CBD5E1', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              overflow: 'hidden',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1756AA'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                            >
                              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>[IMAGE PREVIEW]</span>
                            </div>
                         </div>
                         <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                              <FiActivity size={14} style={{ color: '#1756AA' }} /> Document Back
                            </label>
                            <div style={{ 
                              height: '180px', 
                              background: '#F8FAFF', 
                              borderRadius: '16px', 
                              border: '2px dashed #CBD5E1', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              overflow: 'hidden',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1756AA'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                            >
                              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>[IMAGE PREVIEW]</span>
                            </div>
                         </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '16px', flexWrap: 'wrap' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {status === 'Rejected' && docReasons[idx] && (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}>
                                  <FiAlertCircle size={16} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rejected: {docReasons[idx]}</span>
                               </div>
                            )}
                            {status === 'Approved' && (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
                                  <FiCheck size={16} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Approved: {viewingItem.approveDate || '-'}</span>
                               </div>
                            )}
                         </div>

                         <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                              type="button"
                              onClick={() => handleRejectDoc(idx, doc.type)}
                              style={{ 
                                background: '#FFF5F5', 
                                color: '#EF4444', 
                                border: '1.5px solid #EF4444', 
                                width: 'auto', 
                                padding: '0 16px', 
                                height: '32px', 
                                fontSize: '0.8rem', 
                                fontWeight: 700, 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF5F5'; }}
                            >
                              <FiX size={16} /> Reject
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleApproveDoc(idx, doc.type)}
                              style={{ 
                                background: '#ECFDF5', 
                                color: '#10B981', 
                                border: '1.5px solid #10B981', 
                                width: 'auto', 
                                padding: '0 16px', 
                                height: '32px', 
                                fontSize: '0.8rem', 
                                fontWeight: 700, 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#D1FAE5'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#ECFDF5'; }}
                            >
                              <FiCheck size={16} /> Accept
                            </button>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM CONFIRM MODAL ── */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div className={styles.modalContainer} style={{ width: '90%', maxWidth: '400px', borderRadius: '24px', padding: '32px', textAlign: 'center', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(0,0,0,0.05)', animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: confirmModal.type.startsWith('APPROVE') ? '#D1FAE5' : '#FEE2E2', 
              color: confirmModal.type.startsWith('APPROVE') ? '#10B981' : '#EF4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '36px', 
              margin: '0 auto 24px',
              boxShadow: confirmModal.type.startsWith('APPROVE') ? '0 10px 15px -3px rgba(16, 185, 129, 0.2)' : '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
            }}>
              {confirmModal.type.startsWith('APPROVE') ? <FiCheck /> : <FiAlertCircle />}
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '12px', fontWeight: 800 }}>
              {confirmModal.type.startsWith('APPROVE') ? 'Approve Document?' : 'Reject Document?'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6', fontWeight: 500 }}>
              Are you sure you want to {confirmModal.type.startsWith('APPROVE') ? 'approve' : 'reject'} <strong style={{ color: '#0F172A', fontWeight: 750 }}>{confirmModal.label}</strong>? This action will update the status immediately.
            </p>

            {confirmModal.type.startsWith('REJECT') && (
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</label>
                <textarea
                  placeholder="E.g., Document image is blurry, invalid details..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: '', id: null, docIndex: null, label: '' })}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '14px', 
                  border: '1.5px solid #E2E8F0', 
                  background: '#ffffff', 
                  color: '#475569', 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  cursor: 'pointer', 
                  transition: 'all 0.2s' 
                }}
                onMouseOver={(e) => e.target.style.background = '#F8FAFC'}
                onMouseOut={(e) => e.target.style.background = '#ffffff'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  background: confirmModal.type.startsWith('APPROVE') ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
                  color: '#ffffff', 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  cursor: 'pointer', 
                  boxShadow: confirmModal.type.startsWith('APPROVE') ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                Yes, {confirmModal.type.startsWith('APPROVE') ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCDetails;
