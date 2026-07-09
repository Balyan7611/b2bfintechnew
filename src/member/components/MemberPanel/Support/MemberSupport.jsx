import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createTicket, sendChatMessage } from '../../../../store/slices/supportSlice';
import { 
  FaTicketAlt, FaPlus, FaCheck, FaPaperPlane, FaPaperclip, 
  FaSearch, FaChevronLeft, FaFileAlt, FaImage, FaCircle,
  FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { FiDatabase, FiUploadCloud } from 'react-icons/fi';
import styles from './MemberSupport.module.css';
import sharedStyles from '../../../../shared/components/common/SharedTable.module.css';

const MemberSupport = () => {
  const dispatch = useDispatch();
  const { complainList, chatMessages } = useSelector((s) => s.support);

  const [activeTab, setActiveTab] = useState('raise'); // 'raise', 'history', 'detail'
  
  // Raise Ticket State
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
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!category || !message) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    const newTicket = {
      loginId: 'MEM123',
      name: 'Ramesh Kumar',
      contact: '9876543210',
      service: category,
      message,
      txnId,
      priority,
      attachment: filePreview,
      apiRequest,
      apiResponse
    };
    
    dispatch(createTicket(newTicket));
    showToast('Ticket raised successfully!');
    setCategory('');
    setTxnId('');
    setPriority('Normal');
    setMessage('');
    setApiRequest('');
    setApiResponse('');
    setFilePreview(null);
    setActiveTab('history');
  };

  const activeTicket = complainList.find(t => t.id === activeTicketId);
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
  const myTickets = complainList.filter(t => t.loginId === 'MEM101');
  const filteredTickets = myTickets.filter(t => t.ticketId.toLowerCase().includes(search.toLowerCase()) || t.service.toLowerCase().includes(search.toLowerCase()));

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
              <FaPlus /> Raise Ticket
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
          <h3 className={styles.cardTitle}>Create New Ticket</h3>
          <form className={styles.form} onSubmit={handleSubmitTicket}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Category <span style={{color: 'red'}}>*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required className={styles.input}>
                  <option value="">Select Category</option>
                  <option value="DMT">Money Transfer (DMT)</option>
                  <option value="AEPS">AEPS Transaction</option>
                  <option value="Recharge">Mobile/DTH Recharge</option>
                  <option value="Wallet">Wallet Top-up</option>
                  <option value="General">General Query</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Transaction ID (Optional)</label>
                <input type="text" placeholder="e.g. TXN12345678" value={txnId} onChange={(e) => setTxnId(e.target.value)} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className={styles.input}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
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
                  onClick={() => formFileRef.current.click()}
                  style={{height: '100%'}}
                >
                  <FiUploadCloud className={styles.uploadIcon} />
                  <p>Click to upload image or document</p>
                  <input 
                    type="file" 
                    ref={formFileRef} 
                    style={{display: 'none'}} 
                    onChange={(e) => handleFileChange(e, setFilePreview)}
                    accept="image/*,.pdf,.txt"
                  />
                </div>
                {filePreview && (
                  <div className={styles.previewBox}>
                    {filePreview.type === 'image' ? (
                      <img src={filePreview.url} alt="preview" className={styles.imgPreview} />
                    ) : (
                      <div className={styles.docPreview}><FaFileAlt /> {filePreview.name}</div>
                    )}
                    <button type="button" className={styles.removeFileBtn} onClick={() => setFilePreview(null)}>Remove</button>
                  </div>
                )}
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
              Submit Ticket
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
                  <th>Ticket ID</th>
                  <th>Service</th>
                  <th>Priority</th>
                  <th>Message</th>
                  <th>Admin Reply</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? filteredTickets.map((t) => {
                  const activeMessages = chatMessages[t.id] || [];
                  const adminReplies = activeMessages.filter(m => m.sender === 'admin');
                  const lastAdminReply = adminReplies.length > 0 ? adminReplies[adminReplies.length - 1].text : '-';
                  
                  return (
                    <tr key={t.id}>
                      <td style={{fontWeight: 'bold', color: '#1756AA'}}>{t.ticketId}</td>
                      <td>{t.service}</td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge' + t.priority]}`}>{t.priority || 'Normal'}</span>
                      </td>
                      <td className={styles.msgCol}>
                        <div className={styles.messageBox}>
                          {t.message}
                        </div>
                      </td>
                      <td className={styles.msgCol}>
                        <div className={styles.messageBox} style={{ color: adminReplies.length > 0 ? '#1756AA' : '#94a3b8' }}>
                          {lastAdminReply}
                        </div>
                      </td>
                      <td>{t.date}</td>
                      <td>
                        <span className={`${sharedStyles.statusPill} ${sharedStyles[t.status.replace(' ', '').toLowerCase()] || sharedStyles.pending}`}>
                          {t.status === 'Resolved' || t.status === 'Closed' ? <FaCheckCircle style={{ fontSize: '10px' }} /> : null}
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
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
    </div>
  );
};

export default MemberSupport;
