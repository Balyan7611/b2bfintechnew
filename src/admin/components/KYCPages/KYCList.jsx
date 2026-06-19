import React, { useState, useEffect, useRef } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiFilter, FiX, FiCheck, FiChevronLeft, FiChevronRight, FiDatabase, FiEye, FiUser, FiCalendar, FiActivity, FiShield, FiAlertCircle, FiRefreshCw, FiChevronDown
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { approveKyc, rejectKyc, setSelectedKyc } from '../../../store/slices/kycSlice';
import styles from '../MemberPages/MemberPages.module.css';

const KYCList = () => {
  const dispatch = useDispatch();
  const { kycRequests, selectedKyc } = useSelector((s) => s.kyc);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, docIndex: null, label: '' });
  const [docStatus, setDocStatus] = useState({});
  const [docReasons, setDocReasons] = useState({});
  const [rejectReason, setRejectReason] = useState('');
  
  const isFiltered = statusFilter !== 'All';

  const resetFilters = () => {
    setStatusFilter('All');
    setSearchTerm('');
  };

  const filteredData = kycRequests.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (id) => {
    setConfirmModal({ isOpen: true, type: 'APPROVE', id, label: 'KYC Request' });
  };

  const handleReject = (id) => {
    setRejectReason('');
    setConfirmModal({ isOpen: true, type: 'REJECT', id, label: 'KYC Request' });
  };

  const handleApproveDoc = (idx, label) => {
    setConfirmModal({ isOpen: true, type: 'APPROVE_DOC', docIndex: idx, label });
  };

  const handleRejectDoc = (idx, label) => {
    setRejectReason('');
    setConfirmModal({ isOpen: true, type: 'REJECT_DOC', docIndex: idx, label });
  };

  const confirmAction = () => {
    if (confirmModal.type === 'APPROVE') {
      dispatch(approveKyc(confirmModal.id));
      dispatch(setSelectedKyc(null));
    } else if (confirmModal.type === 'REJECT') {
      dispatch(rejectKyc({ id: confirmModal.id, reason: rejectReason }));
      dispatch(setSelectedKyc(null));
    } else if (confirmModal.type === 'APPROVE_DOC') {
      setDocStatus(prev => ({ ...prev, [confirmModal.docIndex]: 'Approved' }));
    } else if (confirmModal.type === 'REJECT_DOC') {
      setDocStatus(prev => ({ ...prev, [confirmModal.docIndex]: 'Rejected' }));
      setDocReasons(prev => ({ ...prev, [confirmModal.docIndex]: rejectReason }));
    }
    setConfirmModal({ isOpen: false, type: '', id: null, docIndex: null, label: '' });
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.2rem', margin: 0, padding: '4px 0' }}>KYC List</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {isFiltered && (
              <button 
                onClick={resetFilters}
                style={{ background: '#FFF5F5', color: '#E53E3E', border: '1.5px solid #FED7D7', padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: 'none' }}
              >
                Clear
              </button>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  background: isFiltered ? 'rgba(23, 86, 170, 0.1)' : '#F8FAFF',
                  color: '#1756AA',
                  border: isFiltered ? '1.5px solid #1756AA' : '1.5px solid #E2E8F0',
                  padding: '8px 32px 8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <FiChevronDown style={{ position: 'absolute', right: '10px', color: '#1756AA', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* ── CONTROLS ── */}
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

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="kyclist_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search ID/Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>SR.</th>
                <th>MEMBER INFO</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th>DOCUMENT DETAILS</th>
                <th style={{ textAlign: 'center' }}>VIEW</th>
                <th style={{ textAlign: 'right' }}>TIMESTAMPS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#A0AEC0' }}>
                      
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No KYC requests found</div>
                      <small>Try adjusting your search or status filter</small>
                      {isFiltered && (
                         <button onClick={resetFilters} style={{ background: '#1756AA', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>Show All Records</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className={styles.fwBold} style={{ color: '#1756AA', fontSize: '0.9rem' }}>{item.name}</span>
                        <small style={{ color: '#718096', fontSize: '0.7rem' }}>ID: {item.memberId}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${styles.roleTag}`} style={{ 
                        background: item.status === 'Approved' ? '#E6F4EA' : item.status === 'Rejected' ? '#FFF5F5' : '#FFF9E6',
                        color: item.status === 'Approved' ? '#1E7E34' : item.status === 'Rejected' ? '#E53E3E' : '#D97706',
                        fontWeight: 800,
                        fontSize: '0.65rem'
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#4E6080', fontSize: '0.8rem' }}>{item.document}</span>
                        <small style={{ color: '#718096', fontSize: '0.7rem' }}>#{item.docNumber}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className={styles.editBtn} 
                        style={{ background: '#F8FAFF', color: '#1756AA', border: '1.5px solid #1756AA', width: 'auto', padding: '0 12px', height: '32px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }} 
                        onClick={() => dispatch(setSelectedKyc(item))} 
                        title="View Details"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                         <small style={{ fontSize: '0.7rem', color: '#718096' }}>Added: {item.addDate}</small>
                         <small style={{ fontSize: '0.7rem', color: '#27AE60', fontWeight: 600 }}>Action: {item.approveDate || '-'}</small>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing 1 to {filteredData.length} of {filteredData.length} entries
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">1</button>
            <button className="global-page-btn" disabled><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── DETAILS MODAL ── */}
      {selectedKyc && (
        <div className={styles.modalOverlay} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }}>
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
          }}>
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
                  <h3 className={styles.modalTitle} style={{ fontSize: '1.15rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>KYC Review: {selectedKyc.name}</h3>
                  <p className={styles.modalSubtitle} style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>Verifying Member ID: <span style={{ fontWeight: 600, color: '#1756AA' }}>{selectedKyc.memberId}</span></p>
                </div>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => { dispatch(setSelectedKyc(null)); setDocStatus({}); }} 
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
                 { type: selectedKyc.document, number: selectedKyc.docNumber, date: selectedKyc.addDate }
               ].map((doc, idx) => {
                 const status = docStatus[idx] || 'Pending';
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
                      {/* Action buttons with no color backgrounds */}
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
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Approved: {new Date().toLocaleDateString('en-GB')}</span>
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
 
               {selectedKyc.status === 'Rejected' && selectedKyc.reason && selectedKyc.reason !== '-' && (
                  <div style={{ marginTop: '20px', padding: '16px', background: '#FEF2F2', borderRadius: '16px', borderLeft: '4px solid #EF4444', display: 'flex', alignItems: 'center', gap: '14px' }}>
                     <FiAlertCircle style={{ color: '#EF4444' }} size={20} />
                     <div>
                        <small style={{ color: '#991B1B', fontWeight: 700, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</small>
                        <span style={{ fontSize: '0.9rem', color: '#7F1D1D', fontWeight: 500 }}>{selectedKyc.reason}</span>
                     </div>
                  </div>
               )}
            </div>
 
            <div className={styles.modalFooter} style={{ padding: '4px 20px', background: '#ffffff', borderTop: '1px solid #E2E8F0', flexShrink: 0, height: '4px', minHeight: 'auto' }}>
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

export default KYCList;
