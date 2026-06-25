import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { 
  FiSearch, FiEye, FiUser, FiCalendar, FiCheckCircle, FiCheck, FiAlertCircle,
  FiX, FiDownload, FiInfo, FiLayers, FiActivity, FiDatabase, FiShield, FiChevronLeft, FiChevronRight, FiFilter, FiCopy
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaTimes, FaCheck
} from 'react-icons/fa';
import { setNotification } from '../../../store/slices/uiSlice';
import { MemberService } from '../../../services/member.service';
import styles from '../MemberPages/MemberPages.module.css';

const API_BASE_URL = 'https://api.sahayatamoney.in/api/MemberKYCDocuments';

const maskDocNumber = (docName, docNumber) => {
  if (!docNumber) return '—';
  const nameLower = (docName || '').toLowerCase();
  const cleanNum = docNumber.replace(/[\s-]/g, '');
  if (nameLower.includes('aadhar') || nameLower.includes('pan') || nameLower.includes('adhar')) {
    if (cleanNum.length > 4) {
      const last4 = cleanNum.slice(-4);
      const maskedLength = cleanNum.length - 4;
      return `${'X'.repeat(maskedLength)}${last4}`;
    }
  }
  return docNumber;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr || '—';
  }
};

const getUploadDate = (doc) => {
  return doc.entrydate || doc.entryDate || doc.createdDate || doc.createddate || doc.addedDate || doc.addeddate || null;
};

const getStatusDate = (doc) => {
  return doc.statusdate || doc.statusDate || doc.approvedDate || doc.approveddate || doc.updatedDate || doc.updateddate || null;
};

const KYCDetails = () => {
  const dispatch = useDispatch();
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', item: null, label: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [kycDetails, setKycDetails] = useState([]);

  const fetchMembers = async () => {
    try {
      console.log("KYCDetails: Fetching members via search...");
      const res = await MemberService.search("");
      console.log("KYCDetails: Member Search Response:", res);
      if (Array.isArray(res)) {
        setMemberList(res);
      } else {
        setMemberList([]);
      }
    } catch (err) {
      console.error("Error fetching member list:", err);
      setMemberList([]);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/get-all`, {
        params: {
          PageNumber: currentPage,
          PageSize: rowsPerPage
        }
      });
      if (res.data && res.data.status && res.data.data) {
        const rawItems = res.data.data.items || [];
        const mappedItems = rawItems.map(item => {
          const docs = (item.documents || []).filter(d => !d.isDelete);
          return {
            msrno: item.msrno,
            empid: item.empid,
            documents: docs,
            id: docs.length > 0 ? docs[0].id : null,
            status: docs.some(d => d.status === 'Pending') ? 'Pending' : (docs.some(d => d.status === 'Rejected') ? 'Rejected' : 'Approved'),
            isApproved: docs.length > 0 && docs.every(d => d.isApproved),
            reason: docs.map(d => `${d.docName}: ${d.reason || '-'}`).join(' | ')
          };
        }).filter(item => item.documents.length > 0);
        setKycDetails(mappedItems);
        setTotalItems(res.data.data.totalItems || 0);
      } else {
        setKycDetails([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching KYC details:', err);
      dispatch(setNotification({ 
        type: 'error', 
        message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Failed to fetch KYC records.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage]);

  const handleView = (item) => {
    setViewingItem(item);
    setShowModal(true);
  };

  const handleApproveDoc = (item) => {
    setConfirmModal({ isOpen: true, type: 'APPROVE_DOC', item, label: item.docName });
  };

  const handleRejectDoc = (item) => {
    setRejectReason('');
    setConfirmModal({ isOpen: true, type: 'REJECT_DOC', item, label: item.docName });
  };

  const handleToggleApproved = (item, currentVal) => {
    if (!currentVal) {
      setConfirmModal({ isOpen: true, type: 'APPROVE_DOC', item, label: item.docName });
    } else {
      setConfirmModal({ isOpen: true, type: 'PENDING_DOC', item, label: item.docName });
    }
  };

  const confirmAction = async () => {
    if (!confirmModal.item) return;
    setIsSubmitting(true);
    try {
      const isApprove = confirmModal.type === 'APPROVE_DOC';
      const isPending = confirmModal.type === 'PENDING_DOC';
      
      const formData = new FormData();
      formData.append('Id', confirmModal.item.id);
      formData.append('DocName', confirmModal.item.docName);
      formData.append('DocNumber', confirmModal.item.docNumber);
      formData.append('EMPID', confirmModal.item.empid || '0');
      
      if (isApprove) {
        formData.append('IsApproved', true);
        formData.append('Status', 'Approved');
        formData.append('Reason', 'Verified successfully');
      } else if (isPending) {
        formData.append('IsApproved', false);
        formData.append('Status', 'Pending');
        formData.append('Reason', 'Pending verification');
      } else {
        // REJECT_DOC
        formData.append('IsApproved', false);
        formData.append('Status', 'Rejected');
        formData.append('Reason', rejectReason || 'Invalid Document Proof');
      }

      const res = await axios.post(`${API_BASE_URL}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.status) {
        let successMsg = 'Operation completed successfully!';
        if (isApprove) successMsg = 'Document approved successfully!';
        else if (isPending) successMsg = 'Document set to pending successfully!';
        else successMsg = 'Document rejected successfully!';

        dispatch(setNotification({ 
          type: 'success', 
          message: res.data?.mess || res.data?.message || successMsg
        }));
        setConfirmModal({ isOpen: false, type: '', item: null, label: '' });
        setShowModal(false);
        fetchDocuments();
      } else {
        dispatch(setNotification({ 
          type: 'error', 
          message: res.data?.mess || res.data?.message || 'Failed to complete operation.' 
        }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ 
        type: 'error', 
        message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error during operation.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = kycDetails.filter(item => {
    const matchesMember = selectedMember ? (String(item.msrno) === selectedMember || String(item.empid) === selectedMember) : true;
    
    const docMatches = (item.documents || []).some(d => 
      (d.docName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.docNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const memberMatches = String(item.msrno || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return (docMatches || memberMatches) && matchesMember;
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', color: '#0D1B3E', fontWeight: 600, background: '#F8FAFF', minWidth: '200px' }}
            >
              <option value="">All Members</option>
              {memberList && memberList.map(m => (
                 <option key={m.id} value={m.id}>{m.memberId} - {m.name}</option>
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

            {/* SEARCH BOX */}
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              width: '240px',
              background: '#F8FAFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '8px',
              padding: '2px 10px 2px 34px'
            }}>
              <FiSearch style={{ position: 'absolute', left: '12px', color: '#A0AEC0', fontSize: '0.9rem' }} />
              <input 
                type="text" 
                placeholder="Search report..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  height: '32px',
                  fontSize: '0.85rem',
                  color: '#0D1B3E',
                  fontWeight: 500
                }}
              />
            </div>
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
                <th>CONTACT NUMBER</th>
                <th>DOCUMENT DETAILS</th>
                <th style={{ textAlign: 'center' }}>REASON / REMARK</th>
                <th style={{ textAlign: 'center', width: '90px' }}>STATUS / APPROVED</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan="7" style={{ padding: 0, background: '#fff' }}>
                     <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', color: '#A0AEC0' }}>
                       
                       <div style={{ fontSize: '0.85rem' }}>No records match selection</div></div></td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.msrno} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
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
                      {(() => {
                        const member = memberList.find(m => String(m.id) === String(item.msrno));
                        return member ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem' }}>{member.memberId}</span>
                            <small style={{ color: '#0D1B3E', fontWeight: 600, fontSize: '0.75rem' }}>{member.name}</small>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#A0AEC0', fontSize: '0.85rem' }}>Unknown Member</span>
                            <small style={{ color: '#A0AEC0', fontSize: '0.7rem' }}>MSR: {item.msrno}</small>
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const member = memberList.find(m => String(m.id) === String(item.msrno));
                        return (
                          <div style={{ fontSize: '0.8rem', color: '#0D1B3E', fontWeight: 600 }}>
                            {member ? member.mobile : '—'}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <div>
                        {item.documents.map((doc, idx) => (
                          <div key={idx} style={{ fontSize: '0.7rem', color: '#0D1B3E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                            <span>• {doc.docName} ({maskDocNumber(doc.docName, doc.docNumber)})</span>
                            <span style={{ 
                              fontSize: '0.62rem', 
                              padding: '1px 5px', 
                              borderRadius: '4px',
                              background: doc.status === 'Approved' ? '#ECFDF5' : doc.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                              color: doc.status === 'Approved' ? '#10B981' : doc.status === 'Rejected' ? '#EF4444' : '#D97706'
                            }}>{doc.status || 'Pending'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {item.documents.map((doc, idx) => (
                          <div key={idx}><strong>{doc.docName}</strong>: {doc.reason || '—'}</div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: item.status === 'Approved' ? '#E6F4EA' : item.status === 'Rejected' ? '#FDECEA' : '#FFF9E6',
                        color: item.status === 'Approved' ? '#1E7E34' : item.status === 'Rejected' ? '#D93025' : '#B7791F',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'inline-block'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {totalItems} records
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">{currentPage}</button>
            <button className="global-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * rowsPerPage >= totalItems}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── DETAILS MODAL ── */}
      {showModal && viewingItem && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} style={{ 
            width: '95%', 
            maxWidth: '900px', 
            height: '90vh', 
            maxHeight: '850px',
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            
            <div className={styles.modalHeader} style={{ 
              padding: '12px 24px', 
              background: '#ffffff', 
              borderBottom: '1px solid #E2E8F0', 
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'linear-gradient(135deg, rgba(23, 86, 170, 0.1) 0%, rgba(23, 86, 170, 0.2) 100%)', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#1756AA' 
                }}>
                  <FiUser size={18} />
                </div>
                {(() => {
                  const member = memberList.find(m => String(m.id) === String(viewingItem.msrno));
                  return (
                    <div>
                      <h3 className={styles.modalTitle} style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>
                        KYC Dossier: {member ? `${member.name} (${member.memberId})` : `MSRNO ${viewingItem.msrno}`}
                      </h3>
                      <p className={styles.modalSubtitle} style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, marginTop: '1px' }}>
                        Total Documents: <span style={{ fontWeight: 600, color: '#1756AA' }}>{viewingItem.documents?.length || 0}</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setShowModal(false)} 
                style={{ 
                  width: '28px', 
                  height: '28px', 
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
              >
                <FiX size={16} />
              </button>
            </div>

            <div className={styles.modalBody} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               {viewingItem.documents && viewingItem.documents.map((doc, idx) => {
                  const status = doc.status || 'Pending';
                  const bg = status === 'Approved' ? '#ECFDF5' : status === 'Rejected' ? '#FEF2F2' : '#ffffff';
                  const border = status === 'Approved' ? '1px solid #10B981' : status === 'Rejected' ? '1px solid #EF4444' : '1px solid #E2E8F0';
                  const shadow = status === 'Approved' ? '0 10px 15px -3px rgba(16, 185, 129, 0.05)' : status === 'Rejected' ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)';

                  const getImageUrl = (path) => {
                     if (!path) return null;
                     const normalizedPath = path.replace(/\\/g, '/');
                     if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;
                     
                     const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
                     if (cleanPath.startsWith('UploadedFiles/Kycdocuments')) {
                       return `https://api.sahayatamoney.in/${cleanPath}`;
                     }
                     return `https://api.sahayatamoney.in/UploadedFiles/Kycdocuments/${cleanPath}`;
                  };

                  const frontImgUrl = getImageUrl(doc.frontImage || doc.frontImageFile || doc.frontImagePath || doc.frontImageName || doc.frontDoc);
                  const backImgUrl = getImageUrl(doc.backImage || doc.backImageFile || doc.backImagePath || doc.backImageName || doc.backDoc);

                  return (
                    <div 
                      key={doc.id || idx}
                      style={{ 
                        background: bg, 
                        borderRadius: '16px', 
                        border: border, 
                        padding: '20px', 
                        boxShadow: shadow, 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', flex: 1 }}>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</small>
                                <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem' }}>{doc.docName}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Number</small>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>{maskDocNumber(doc.docName, doc.docNumber)}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uploaded Date</small>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.78rem' }}>{formatDate(getUploadDate(doc))}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Date</small>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.78rem' }}>{formatDate(getStatusDate(doc))}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee ID</small>
                                <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>{doc.empid || '0'}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</small>
                                <span style={{
                                  background: status === 'Approved' ? '#D1FAE5' : status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                                  color: status === 'Approved' ? '#065F46' : status === 'Rejected' ? '#991B1B' : '#92400E',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  display: 'inline-block'
                                }}>
                                  {status}
                                </span>
                              </div>
                           </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                           <div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                                <FiActivity size={12} style={{ color: '#1756AA' }} /> Document Front
                              </label>
                              <div style={{ 
                                height: '180px', 
                                background: '#F8FAFF', 
                                borderRadius: '12px', 
                                border: '1.5px dashed #CBD5E1', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                overflow: 'hidden'
                              }}>
                                {frontImgUrl ? (
                                  <img src={frontImgUrl} alt="Front Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>No Front Image</span>
                                )}
                              </div>
                              {frontImgUrl && (
                                <a href={frontImgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: '#1756AA', fontWeight: 700, textDecoration: 'underline' }}>
                                  Open Front Image ↗
                                </a>
                              )}
                           </div>
                           <div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                                <FiActivity size={12} style={{ color: '#1756AA' }} /> Document Back
                              </label>
                              <div style={{ 
                                height: '180px', 
                                background: '#F8FAFF', 
                                borderRadius: '12px', 
                                border: '1.5px dashed #CBD5E1', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                overflow: 'hidden'
                              }}>
                                {backImgUrl ? (
                                  <img src={backImgUrl} alt="Back Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>No Back Image</span>
                                )}
                              </div>
                              {backImgUrl && (
                                <a href={backImgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: '#1756AA', fontWeight: 700, textDecoration: 'underline' }}>
                                  Open Back Image ↗
                                </a>
                              )}
                           </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '12px', flexWrap: 'wrap' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {status === 'Rejected' && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}>
                                    <FiAlertCircle size={14} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Reason: {doc.reason || 'Invalid Document Proof'}</span>
                                 </div>
                              )}
                              {status === 'Approved' && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
                                    <FiCheck size={14} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Remarks: {doc.reason || 'Verified successfully'}</span>
                                 </div>
                              )}
                           </div>

                           <div style={{ display: 'flex', gap: '12px' }}>
                              <button 
                                type="button"
                                onClick={() => handleRejectDoc(doc)}
                                style={{ 
                                  background: '#FFF5F5', 
                                  color: '#EF4444', 
                                  border: '1.5px solid #EF4444', 
                                  width: 'auto', 
                                  padding: '0 12px', 
                                  height: '28px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiX size={14} /> Reject
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleApproveDoc(doc)}
                                style={{ 
                                  background: '#ECFDF5', 
                                  color: '#10B981', 
                                  border: '1.5px solid #10B981', 
                                  width: 'auto', 
                                  padding: '0 12px', 
                                  height: '28px', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiCheck size={14} /> Accept
                              </button>
                           </div>
                        </div>
                    </div>
                  );
               })}
            </div>
            <div className={styles.modalFooter} style={{ padding: '10px 24px', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFF', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <button className={styles.pageBtn} style={{ padding: '0 20px', width: 'auto', height: '36px' }} onClick={() => setShowModal(false)}>Close</button>
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
                onClick={() => setConfirmModal({ isOpen: false, type: '', item: null, label: '' })}
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
                disabled={isSubmitting}
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
                {isSubmitting ? 'Processing...' : `Yes, ${confirmModal.type.startsWith('APPROVE') ? 'Approve' : 'Reject'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCDetails;
