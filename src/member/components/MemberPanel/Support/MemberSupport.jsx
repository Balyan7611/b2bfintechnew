import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createTicket, sendChatMessage, deleteTicket, updateTicket } from '../../../../store/slices/supportSlice';
import { showLoader, hideLoader } from '../../../../store/slices/uiSlice';
import { 
  FaTicketAlt, FaPlus, FaCheck, FaPaperPlane, FaPaperclip, 
  FaSearch, FaChevronLeft, FaFileAlt, FaImage, FaCircle,
  FaCheckCircle, FaExclamationCircle, FaTimes, FaEdit, FaTrash, FaEllipsisV,
  FaCommentDots
} from 'react-icons/fa';
import { FiDatabase, FiUploadCloud } from 'react-icons/fi';
import styles from './MemberSupport.module.css';
import sharedStyles from '../../../../shared/components/common/SharedTable.module.css';
import { API } from '../../../../api/endpoints';
import ChatPopup from '../../../../shared/components/SupportList/ChatPopup';

const MemberSupport = () => {
  const dispatch = useDispatch();
  const { chatMessages } = useSelector((s) => s.support);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('raise'); // 'raise', 'history', 'detail'
  const [zoomImage, setZoomImage] = useState(null);
  
  // Action menu & confirmation states
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingTicketId, setEditingTicketId] = useState(null);

  // Close action menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveActionMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Parse session dynamically and decode JWT token priorities
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    || localStorage.getItem('member_token') || sessionStorage.getItem('member_token');
  let currentLoginId = 'MEM-1001';
  let currentName = 'Member';
  let currentMobile = '9876543210';
  let currentNumericId = '1';

  // First try bss_current_session (most reliable, set during login)
  const sessionStr = localStorage.getItem('bss_current_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session?.memberId) currentLoginId = session.memberId;
      else if (session?.loginId) currentLoginId = session.loginId;
      else if (session?.username) currentLoginId = session.username;

      if (session?.userId) currentNumericId = String(session.userId);
      if (session?.name) currentName = session.name;
      else if (session?.fullName) currentName = session.fullName;
      if (session?.mobile) currentMobile = session.mobile;
    } catch (e) {}
  }

  // Fallback: decode JWT for remaining missing fields
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        if (!currentLoginId || currentLoginId === 'MEM-1001') {
          currentLoginId = decoded.LoginId || decoded.loginId || decoded.sub || currentLoginId;
        }
        if (!currentNumericId || currentNumericId === '1') {
          currentNumericId = decoded.sub || currentNumericId;
        }
        if (!currentName || currentName === 'Member') {
          currentName = decoded.unique_name || decoded.name || decoded.Name || currentName;
        }
        if (!currentMobile || currentMobile === '9876543210') {
          currentMobile = decoded.mobile || decoded.Mobile || decoded.phone || currentMobile;
        }
      }
    } catch (e) {
      console.warn("JWT token decoding failed:", e);
    }
  }


  const normalizeTicket = (t) => {
    if (!t) return null;
    const service = t.service || t.Category || t.category || '';
    const message = t.message || t.UserMessage || t.userMessage || '';
    const ticketId = t.ticketId || t.TicketId || '';
    const priority = t.priority || t.Priority || 'Normal';
    const status = t.status || t.Status || 'Open';
    
    const dateVal = t.CreatedOn || t.createdOn || t.CreatedDate || t.createdDate || t.date || '';
    const date = dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A';
    
    const memberId = t.memberId || t.MemberId || '';
    const memberName = t.memberName || t.MemberName || '';
    const contactNumber = t.contactNumber || t.ContactNumber || '';
    const id = t.id || t.Id;

    let attachment = null;
    const attachmentUrl = t.AttachmentUrl || t.attachmentUrl || t.attachmentPath || '';
    const attachmentType = t.AttachmentType || t.attachmentType || '';
    const getImageUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      if (url.startsWith('/')) return `https://api.sahayatamoney.in${url}`;
      return `https://api.sahayatamoney.in/${url}`;
    };

    if (attachmentUrl) {
      attachment = {
        url: getImageUrl(attachmentUrl),
        type: (attachmentType.toLowerCase().includes('png') || attachmentType.toLowerCase().includes('jpg') || attachmentType.toLowerCase().includes('jpeg') || attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i)) ? 'image' : 'file',
        name: attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1)
      };
    }

    return {
      ...t,
      id,
      ticketId,
      memberId,
      memberName,
      contactNumber,
      service,
      category: service,
      priority,
      message,
      userMessage: message,
      status,
      date,
      createdDate: dateVal,
      attachment,
      attachmentPath: attachmentUrl,
      adminReply: t.AdminReply || t.adminReply || t.reply || ''
    };
  };

  // Fetch tickets from database
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await API.supportTicket.getAll({ 
        pageNumber: 1,
        pageSize: 100 
      });
      
      let rawData = [];
      if (res && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (Array.isArray(res)) {
        rawData = res;
      } else if (res && Array.isArray(res.items)) {
        rawData = res.items;
      } else if (res && res.data && Array.isArray(res.data.items)) {
        rawData = res.data.items;
      }
      
      // Filter on frontend to bypass backend data type mismatch on MemberID query parameter
      const myTickets = rawData.filter(t => {
        if (!t) return false;
        const mId = t.memberId || t.MemberId || '';
        const cBy = t.createdBy || t.CreatedBy || '';
        return String(mId).toLowerCase() === String(currentLoginId).toLowerCase() ||
               String(cBy) === String(currentNumericId);
      });
      
      setTickets(myTickets.map(normalizeTicket));
    } catch (err) {
      console.error("Failed to fetch support tickets from database:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentLoginId]);

  // Raise/Edit Ticket State
  const [category, setCategory] = useState('');
  const [txnId, setTxnId] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [apiRequest, setApiRequest] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  
  const [filePreview, setFilePreview] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  // Ticket Detail State
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const chatFileRef = useRef(null);
  const formFileRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: reader.result,
          name: file.name,
          fileObject: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!category || !message) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    
    dispatch(showLoader());

    const generatedTicketId = editingTicketId ? editingTicketId : `TCK${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare Multipart FormData
    const formData = new FormData();
    formData.append('TicketId', generatedTicketId);
    formData.append('MemberId', currentLoginId);
    formData.append('MemberName', currentName);
    formData.append('ContactNumber', currentMobile);
    formData.append('Category', category);
    
    // Only append optional fields if they have value
    if (txnId) formData.append('TransactionId', txnId);
    formData.append('Priority', priority);
    formData.append('UserMessage', message);
    
    if (apiRequest) formData.append('ApiRequestPayload', apiRequest);
    if (apiResponse) formData.append('ApiResponsePayload', apiResponse);
    formData.append('Status', 'Open');

    if (filePreview && filePreview.fileObject) {
      formData.append('AttachmentFile', filePreview.fileObject);
    }

    try {
      if (editingTicketId) {
        formData.append('Id', editingTicketId);
        formData.append('ModifiedBy', currentNumericId);
        await API.supportTicket.update(formData);
        showToast('Ticket updated successfully!');
        setEditingTicketId(null);
      } else {
        formData.append('CreatedBy', currentNumericId);
        await API.supportTicket.create(formData);
        showToast('Ticket raised successfully!');
      }
      fetchTickets();
    } catch (err) {
      console.error("Backend database request failed:", err);
      const errMsg = err.response?.data?.mess || err.response?.data?.message || err.message || "Failed to save";
      showToast(`Database error: ${errMsg}`, 'error');
    } finally {
      setCategory('');
      setTxnId('');
      setPriority('Normal');
      setMessage('');
      setApiRequest('');
      setApiResponse('');
      setFilePreview(null);
      setActiveTab('history');
      dispatch(hideLoader());
    }
  };

  const handleEditTicket = (t) => {
    // Map backend response fields to form state
    setEditingTicketId(t.id);
    setCategory(t.service || t.category || '');
    setTxnId(t.txnId || t.transactionId || '');
    setPriority(t.priority || 'Normal');
    setMessage(t.message || t.userMessage || '');
    setApiRequest(t.apiRequest || t.apiRequestPayload || '');
    setApiResponse(t.apiResponse || t.apiResponsePayload || '');
    setFilePreview(t.attachment ? t.attachment : null);
    setActiveTab('raise');
  };

  const handleDeleteTicket = async () => {
    if (confirmDeleteId) {
      try {
        await API.supportTicket.delete(confirmDeleteId);
        showToast('Ticket deleted successfully!');
        fetchTickets();
      } catch (err) {
        console.error("Failed to delete ticket from database:", err);
        showToast('Failed to delete ticket.', 'error');
      }
      setConfirmDeleteId(null);
    }
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);
  const activeMessages = activeTicket ? (chatMessages[activeTicket.id] || []) : [];

  const handleSendReply = () => {
    const text = chatInput.trim();
    if (!text && !filePreview) return;
    dispatch(sendChatMessage({ 
      ticketId: activeTicket.id, 
      text, 
      sender: 'member',
      attachment: filePreview
    }));
    setChatInput('');
    setFilePreview(null);
  };

  const openTicketDetail = (id) => {
    setActiveTicketId(id);
    setActiveTab('detail');
  };

  // Filter member's tickets
  const myTickets = tickets.filter(t => (t.loginId || t.memberId) === currentLoginId);
  const filteredTickets = myTickets.filter(t => (t.ticketId || '').toLowerCase().includes(search.toLowerCase()) || (t.service || t.category || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          <FaCheck /> {toast.msg}
        </div>
      )}

      {/* Header section (Hide in detail view for immersive experience) */}
      {activeTab !== 'detail' && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}>
              <FaTicketAlt />
            </div>
            <div>
              <h2 className={styles.title}>Help & Support</h2>
              <p className={styles.subtitle}>Raise complaints and track your support tickets.</p>
            </div>
          </div>
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${activeTab === 'raise' ? styles.activeTab : ''}`} onClick={() => setActiveTab('raise')}>
              <FaPlus /> {editingTicketId ? 'Edit Ticket' : 'Raise Ticket'}
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`} onClick={() => setActiveTab('history')}>
              <FaTicketAlt /> My Tickets
            </button>
          </div>
        </div>
      )}

      {/* RAISE TICKET */}
      {activeTab === 'raise' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{editingTicketId ? 'Edit Ticket Details' : 'New Ticket Details'}</h3>
            {editingTicketId && (
              <button 
                onClick={() => {
                  setEditingTicketId(null);
                  setCategory('');
                  setTxnId('');
                  setPriority('Normal');
                  setMessage('');
                  setApiRequest('');
                  setApiResponse('');
                  setFilePreview(null);
                  setActiveTab('history');
                }} 
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleSubmitTicket} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Issue Category <span style={{color: 'red'}}>*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required className={styles.input}>
                  <option value="">Select Category...</option>
                  <option value="AEPS">AEPS Withdrawal / Enquiry</option>
                  <option value="DMT">Money Transfer (DMT)</option>
                  <option value="Recharge">Mobile / DTH Recharge</option>
                  <option value="BBPS">Electricity / Water Bill (BBPS)</option>
                  <option value="MATM">Micro ATM Transaction</option>
                  <option value="Wallet">Wallet Loading / Credit Limit</option>
                  <option value="Other">Other Query / Complaint</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., TXN92840281" 
                  value={txnId} 
                  onChange={(e) => setTxnId(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Priority <span style={{color: 'red'}}>*</span></label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} required className={styles.input}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className={styles.formGridTwoCol}>
              <div className={styles.formGroup}>
                <label>Message <span style={{color: 'red'}}>*</span></label>
                <textarea 
                  placeholder="Describe your issue in detail..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={styles.textarea}
                  rows="4"
                  style={{height: '100%'}}
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Attachment (Optional, Max 5MB)</label>
                <div 
                  className={styles.uploadBox} 
                  onClick={() => !filePreview && formFileRef.current.click()}
                  style={{height: '100%', position: 'relative'}}
                >
                  {filePreview ? (
                    <>
                      {filePreview.type === 'image' ? (
                        <img src={filePreview.url} alt="preview" className={styles.imgPreviewInside} />
                      ) : (
                        <div className={styles.docPreviewInside}><FaFileAlt /> {filePreview.name}</div>
                      )}
                      <button 
                        type="button" 
                        className={styles.removeFileBtnIcon} 
                        onClick={(e) => { e.stopPropagation(); setFilePreview(null); }}
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className={styles.uploadIcon} />
                      <p>Click to upload image or document</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={formFileRef} 
                    style={{display: 'none'}} 
                    onChange={(e) => handleFileChange(e, setFilePreview)}
                    accept="image/*,.pdf,.txt"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGridTwoCol}>
              <div className={styles.formGroup}>
                <label>API Request Payload (Optional)</label>
                <textarea 
                  placeholder="Paste request JSON here..." 
                  value={apiRequest} 
                  onChange={(e) => setApiRequest(e.target.value)}
                  className={`${styles.textarea} ${styles.codeTextarea}`}
                  rows="3"
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>API Response Payload (Optional)</label>
                <textarea 
                  placeholder="Paste response JSON here..." 
                  value={apiResponse} 
                  onChange={(e) => setApiResponse(e.target.value)}
                  className={`${styles.textarea} ${styles.codeTextarea}`}
                  rows="3"
                ></textarea>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              {editingTicketId ? 'Update Ticket' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      )}

      {/* TICKET HISTORY */}
      {activeTab === 'history' && (
        <div className={styles.card}>
          <div className={styles.historyHeader}>
            <h3 className={styles.cardTitle}>Ticket History</h3>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search Ticket ID or Service..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
            </div>
          </div>
          
          <div className={sharedStyles.tableWrapper}>
            <table className={sharedStyles.table}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                  <th>Ticket ID</th>
                  <th>Image</th>
                  <th>Service</th>
                  <th>Priority</th>
                  <th>Message</th>
                  <th>Admin Reply</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? filteredTickets.map((t, idx) => {
                  const lastAdminReply = t.adminReply || '-';
                  
                  return (
                    <tr key={t.id}>
                      <td>{idx + 1}</td>
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button 
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMenuId(activeActionMenuId === t.id ? null : t.id);
                          }}
                        >
                          <FaEllipsisV />
                        </button>
                        
                        {activeActionMenuId === t.id && (
                          <div 
                            style={{
                              position: 'absolute',
                              left: '40px',
                              top: '0px',
                              background: '#ffffff',
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              border: '1px solid #E2E8F0',
                              zIndex: 10,
                              width: '100px',
                              padding: '4px 0'
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.8rem',
                                color: '#1E293B',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onClick={() => {
                                handleEditTicket(t);
                                setActiveActionMenuId(null);
                              }}
                            >
                              <FaEdit style={{ color: '#3B82F6' }} /> Edit
                            </button>
                            {/* Chat button removed for member users */}
                            <button
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.8rem',
                                color: '#ef4444',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onClick={() => {
                                setConfirmDeleteId(t.id);
                                setActiveActionMenuId(null);
                              }}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{fontWeight: 'bold', color: '#1756AA'}}>{t.ticketId}</td>
                      <td style={{ textAlign: 'center', width: '60px' }}>
                        {t.attachment ? (
                          t.attachment.type === 'image' ? (
                            <img 
                              src={t.attachment.url} 
                              alt="thumb" 
                              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                              onClick={() => setZoomImage(t.attachment.url)}
                            />
                          ) : (
                            <span title={t.attachment.name} style={{ fontSize: '1.2rem', color: '#64748b' }}><FaFileAlt /></span>
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{t.service}</td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge' + t.priority]}`}>{t.priority || 'Normal'}</span>
                      </td>
                      <td className={styles.msgCol}>
                        <div className={styles.messageBox}>
                          {t.userMessage || t.message}
                        </div>
                      </td>
                      <td className={styles.msgCol}>
                        <div className={styles.messageBox} style={{ color: t.adminReply ? '#1756AA' : '#94a3b8' }}>
                          {lastAdminReply}
                        </div>
                      </td>
                      <td>{t.date}</td>
                      <td>
                        {(() => {
                          const displayStatus = t.status === 'Open' ? 'Pending' : t.status;
                          const isComplete = displayStatus === 'Resolved' || displayStatus === 'Closed' || displayStatus === 'Complete';
                          return (
                            <span 
                              className={sharedStyles.statusPill} 
                              style={{
                                background: isComplete ? '#27AE60' : (displayStatus === 'Pending' ? '#F59E0B' : '#EF4444'),
                                color: '#fff',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isComplete && <FaCheckCircle style={{ fontSize: '10px' }} />}
                              {displayStatus}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FiDatabase style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No tickets found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Image Zoom Modal */}
      {zoomImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            cursor: 'zoom-out'
          }}
          onClick={() => setZoomImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setZoomImage(null)} 
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: '#ffffff',
                color: '#0F172A',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontWeight: 'bold'
              }}
            >
              <FaTimes />
            </button>
            <img 
              src={zoomImage} 
              alt="Zoomed attachment" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={() => setConfirmDeleteId(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div 
              style={{
                background: '#fee2e2',
                color: '#ef4444',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '1.2rem'
              }}
            >
              <FaExclamationCircle />
            </div>
            <h4 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '1.1rem', fontWeight: 800 }}>Confirm Deletion</h4>
            <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this support ticket? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTicket}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ChatPopup isMember={true} />
    </div>
  );
};

export default MemberSupport;