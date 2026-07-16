import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openChat } from '../../../store/slices/supportSlice';
import { FaSearch, FaImage, FaEye, FaCommentDots, FaTimes, FaFileAlt, FaCopy, FaCheck } from 'react-icons/fa';
import sharedStyles from '../common/SharedTable.module.css';
import styles from './SupportList.module.css';
import ChatPopup from './ChatPopup';
import { API } from '../../../api/endpoints';

const SupportList = () => {
  const dispatch = useDispatch();
  const { isChatOpen } = useSelector((s) => s.support);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Image Viewer Modal State
  const [viewImage, setViewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [detailTicket, setDetailTicket] = useState(null);
  const [copiedField, setCopiedField] = useState(null); // 'request' | 'response'

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
    if (attachmentUrl) {
      attachment = {
        url: attachmentUrl,
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
      adminReply: t.adminReply || t.AdminReply || '',
      transactionId: t.transactionId || t.TransactionId || '',
      apiRequest: t.apiRequest || t.ApiRequestPayload || t.apiRequestPayload || '',
      apiResponse: t.apiResponse || t.ApiResponsePayload || t.apiResponsePayload || ''
    };
  };

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

      setTickets(rawData.map(normalizeTicket));
    } catch (err) {
      console.error("Failed to fetch support tickets in admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCopyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  // Filter Data
  const filteredData = tickets.filter(item => {
    const matchSearch = (item.ticketId || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.memberName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.memberId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'All' || item.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('Id', ticket.id);
      formData.append('TicketId', ticket.ticketId);
      formData.append('MemberId', ticket.memberId);
      formData.append('MemberName', ticket.memberName);
      formData.append('ContactNumber', ticket.contactNumber || '');
      formData.append('Category', ticket.service);
      if (ticket.transactionId) formData.append('TransactionId', ticket.transactionId);
      formData.append('Priority', ticket.priority);
      formData.append('UserMessage', ticket.message);
      if (ticket.apiRequest) formData.append('ApiRequestPayload', ticket.apiRequest);
      if (ticket.apiResponse) formData.append('ApiResponsePayload', ticket.apiResponse);
      formData.append('Status', newStatus);
      
      const currentReply = ticket.adminReply || ticket.AdminReply || ticket.reply;
      if (currentReply) formData.append('AdminReply', currentReply);
      
      formData.append('ModifiedBy', '1');
      
      await API.supportTicket.update(formData);
      fetchTickets();
      if (detailTicket && detailTicket.id === ticket.id) {
        setDetailTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update ticket status in database:", err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return sharedStyles.pending;
      case 'Under Process': return sharedStyles.inprogress;
      case 'Complete': return sharedStyles.success;
      case 'Closed': return sharedStyles.closed;
      default: return sharedStyles.pending;
    }
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev + 0.15, 4)); // Zoom in (max 4x)
    } else {
      setZoomLevel(prev => {
        const newZoom = Math.max(prev - 0.15, 0.3);
        if (newZoom <= 1) setPosition({ x: 0, y: 0 }); // reset position if zoomed out fully
        return newZoom;
      });
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const closeImageViewer = () => {
    setViewImage(null);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={styles.container}>
      
      {/* Filters Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Filter Tickets</h3>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Member ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select 
            className={styles.selectInput}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Support Tickets</h3>
        </div>
        
        <div className={sharedStyles.tableWrapper}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Action</th>
                <th>Member</th>
                <th>Contact</th>
                <th>Message</th>
                <th>Status / Update</th>
                <th>Reply</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <button 
                      className={styles.actionBtnGreen} 
                      onClick={() => setDetailTicket(t)}
                      title="View Complete Details"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                  <td>
                    <div style={{fontWeight: 'bold', color: '#1756AA'}}>{t.memberName}</div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '2px'}}>{t.memberId}</div>
                  </td>
                  <td>{t.contactNumber || 'N/A'}</td>
                  <td>
                    <div className={styles.messageBox}>
                      {t.userMessage}
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`${styles.statusSelect} ${getStatusClass(t.status)}`}
                      value={t.status}
                      onChange={(e) => handleStatusChange(t, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="Under Process">Under Process</option>
                      <option value="Complete">Complete</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <button className={styles.replyBtn} onClick={() => dispatch(openChat(t))} title="Reply to Member">
                      <FaCommentDots />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Detail Modal */}
      {detailTicket && (
        <div className={styles.modalOverlay} onClick={() => setDetailTicket(null)}>
          <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <div className={styles.headerTop}>
                <h4>Ticket {detailTicket.ticketId}</h4>
                <button className={styles.closeModalBtn} onClick={() => setDetailTicket(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className={styles.headerMeta}>
                <span>{detailTicket.memberName} <strong style={{color:'#64748b'}}>({detailTicket.memberId})</strong></span>
                <span className={styles.metaDot}>•</span>
                <span>{detailTicket.contactNumber}</span>
                <span className={styles.metaDot}>•</span>
                <span>{detailTicket.category}</span>
                <span className={styles.metaDot}>•</span>
                <span>{detailTicket.createdDate ? new Date(detailTicket.createdDate).toLocaleDateString() : ''}</span>
              </div>
            </div>
            
            <div className={styles.detailBody}>
              <div className={styles.contentRow}>
                <div className={styles.messageSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className={styles.sectionLabel} style={{ marginBottom: 0 }}>User Message</label>
                    <button 
                      className={styles.actionBtnGreen} 
                      onClick={() => dispatch(openChat(detailTicket))}
                    >
                      <FaCommentDots /> Reply
                    </button>
                  </div>
                  <div className={styles.cleanMessageBox}>
                    {detailTicket.userMessage}
                  </div>
                </div>

                <div className={styles.attachmentSection}>
                  <label className={styles.sectionLabel}>Attachment</label>
                  <div className={styles.smallAttachCard}>
                    {detailTicket.attachmentPath ? (() => {
                      const getImageUrl = (url) => {
                        if (!url) return '';
                        if (url.startsWith('http') || url.startsWith('data:')) return url;
                        if (url.startsWith('/')) return `https://api.sahayatamoney.in${url}`;
                        return `https://api.sahayatamoney.in/${url}`;
                      };
                      const imgSrc = getImageUrl(detailTicket.attachmentPath);
                      return (detailTicket.attachmentPath.toLowerCase().endsWith('.png') ||
                       detailTicket.attachmentPath.toLowerCase().endsWith('.jpg') ||
                       detailTicket.attachmentPath.toLowerCase().endsWith('.jpeg') ||
                       detailTicket.attachmentPath.toLowerCase().endsWith('.gif') ||
                       detailTicket.attachmentPath.toLowerCase().startsWith('data:image')) ? (
                        <img 
                          src={imgSrc} 
                          alt="Proof" 
                          className={styles.miniImg} 
                          onClick={() => setViewImage(imgSrc)}
                        />
                      ) : (
                        <div className={styles.fileIcon} onClick={() => window.open(imgSrc, '_blank')}>
                          <FaFileAlt />
                          <span>View Document</span>
                        </div>
                      );
                    })() : (
                      <span className={styles.noAttach}>No attachment provided</span>
                    )}
                  </div>
                </div>
              </div>



              <div className={styles.jsonRow}>
                <div className={styles.jsonBox}>
                  <div className={styles.apiBoxHeader}>
                    <label className={styles.sectionLabel}>API Request</label>
                  </div>
                  <pre className={styles.jsonBlock}>{detailTicket.apiRequest || 'No Request Payload'}</pre>
                </div>
                <div className={styles.jsonBox}>
                  <div className={styles.apiBoxHeader}>
                    <label className={styles.sectionLabel}>API Response</label>
                  </div>
                  <pre className={styles.jsonBlock}>{detailTicket.apiResponse || 'No Response Payload'}</pre>
                </div>
              </div>


            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className={styles.modalOverlay} onClick={closeImageViewer} style={{zIndex: 10000}}>
          <div 
            className={styles.imageModal} 
            onClick={e => e.stopPropagation()} 
            onWheel={handleWheelZoom}
          >
            <button className={styles.closeImgBtn} onClick={closeImageViewer}>
              <FaTimes />
            </button>
            <div className={styles.zoomHint}>Scroll to Zoom In/Out | Drag to Pan</div>
            <div 
              style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                src={viewImage} 
                alt="Attachment Full" 
                className={styles.modalImg} 
                draggable="false"
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Reply Chat Popup */}
      {/* ChatPopup for regular bottom chat */}
      {isChatOpen && <ChatPopup isMember={false} />}
    </div>
  );
};

export default SupportList;
