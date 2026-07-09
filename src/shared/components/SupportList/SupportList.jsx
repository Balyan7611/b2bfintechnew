import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTicketStatus, openChat } from '../../../store/slices/supportSlice';
import { FaSearch, FaImage, FaEye, FaCommentDots, FaTimes, FaFileAlt, FaCopy } from 'react-icons/fa';
import sharedStyles from '../common/SharedTable.module.css';
import styles from './SupportList.module.css';
import ChatPopup from './ChatPopup';

const SupportList = () => {
  const dispatch = useDispatch();
  const { complainList, isChatOpen } = useSelector((s) => s.support);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Image Viewer Modal State
  const [viewImage, setViewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Detail Viewer Modal State
  const [detailTicket, setDetailTicket] = useState(null);

  // Filter Data
  const filteredData = complainList.filter(item => {
    const matchSearch = item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.loginId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'All' || item.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateTicketStatus({ id, status: newStatus }));
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
                    <div style={{fontWeight: 'bold', color: '#1756AA'}}>{t.name}</div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '2px'}}>{t.loginId}</div>
                  </td>
                  <td>{t.contact || 'N/A'}</td>
                  <td>
                    <div className={styles.messageBox}>
                      {t.message}
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`${styles.statusSelect} ${getStatusClass(t.status)}`}
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
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
                <span>{detailTicket.name} <strong style={{color:'#64748b'}}>({detailTicket.loginId})</strong></span>
                <span className={styles.metaDot}>•</span>
                <span>{detailTicket.contact}</span>
                <span className={styles.metaDot}>•</span>
                <span>{detailTicket.service}</span>
                <span className={styles.metaDot}>•</span>
                <span>{detailTicket.date}</span>
              </div>
            </div>
            
            <div className={styles.detailBody}>
              <div className={styles.contentRow}>
                <div className={styles.messageSection}>
                  <label className={styles.sectionLabel}>User Message</label>
                  <div className={styles.cleanMessageBox}>
                    {detailTicket.message}
                  </div>
                </div>

                <div className={styles.attachmentSection}>
                  <label className={styles.sectionLabel}>Attachment</label>
                  <div className={styles.smallAttachCard}>
                    {detailTicket.attachment ? (
                      detailTicket.attachment.type === 'image' ? (
                        <img 
                          src={detailTicket.attachment.url} 
                          alt="Proof" 
                          className={styles.miniImg} 
                          onClick={() => setViewImage(detailTicket.attachment.url)} 
                        />
                      ) : (
                        <div className={styles.miniDoc}>
                          <FaFileAlt /> {detailTicket.attachment.name}
                        </div>
                      )
                    ) : (
                      <span className={styles.noAttachText}>None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.jsonRow}>
                <div className={styles.jsonBox}>
                  <div className={styles.apiBoxHeader}>
                    <label className={styles.sectionLabel}>API Request</label>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => navigator.clipboard.writeText(detailTicket.apiRequest)}
                    >
                      <FaCopy /> Copy
                    </button>
                  </div>
                  <pre className={styles.jsonBlock}>{detailTicket.apiRequest || 'No Request Payload'}</pre>
                </div>
                <div className={styles.jsonBox}>
                  <div className={styles.apiBoxHeader}>
                    <label className={styles.sectionLabel}>API Response</label>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => navigator.clipboard.writeText(detailTicket.apiResponse)}
                    >
                      <FaCopy /> Copy
                    </button>
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
      {isChatOpen && <ChatPopup isMember={false} />}
    </div>
  );
};

export default SupportList;
