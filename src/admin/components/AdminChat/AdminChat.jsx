import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCheckDouble, FaCheckSquare, FaCommentDots, FaEllipsisV, FaPaperclip, FaPaperPlane, FaRegSquare, FaSearch, FaTimes, FaTrash, FaUsers } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { addNotification } from '../../../store/slices/memberPanelSlice';
import styles from './AdminChat.module.css';

// Pre-defined quick templates for B2B portal admin
const QUICK_TEMPLATES = [
  { label: 'Select Template...', value: '' },
  { label: 'UPI Service Downtime', value: 'Dear Merchant, UPI Payment services are currently experiencing a temporary bank server downtime. We are working to resolve it shortly.' },
  { label: 'AEPS Active Announcement', value: 'Great News! AEPS withdrawal services are now 100% active with high success rates across all major banks.' },
  { label: 'Commission Hike Alert', value: 'Special Offer: Get an extra 0.2% commission on all mobile recharges done today. Happy earning!' },
  { label: 'Fund Request Approval', value: 'Your fund request has been successfully verified and credited to your wallet balance. Please check.' }
];

const INITIAL_BROADCAST_HISTORY = [];

const AdminChat = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState(INITIAL_BROADCAST_HISTORY);
  
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const menuRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  // Mouse Trail Animation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#F472B6', '#A78BFA', '#2DD4BF', '#A3E635', '#FDE047', '#38BDF8'];

    const createParticle = (x, y) => {
      particlesRef.current.push({
        x,
        y,
        size: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        life: 1
      });
    };

    const handleMouseMove = (e) => {
      for(let i=0; i<3; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.02; // Fade out speed
        p.size *= 0.96; // Shrink speed
      }
      particlesRef.current = particles.filter(p => p.life > 0 && p.size > 0.5);
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { manageMemberState } = useSelector((s) => s.member);
  const { notifList } = useSelector((state) => state.memberPanel);
  const memberList = useMemo(() => manageMemberState?.list || [], [manageMemberState?.list]);

  // Sync AdminChat history with Member Notifications so when Member clears, Admin history clears
  useEffect(() => {
    if (notifList && notifList.length === 0) {
      setBroadcastLogs([]);
    }
  }, [notifList]);

  const allMembers = useMemo(() => {
    const defaultMock = [
      { id: 'member-1', name: 'vishnu prajapat', memberId: 'RT705', role: 'Retailer', mobile: '6377749427', status: 'Approved', initials: 'VP' },
      { id: 'member-2', name: 'Rahul Sharma', memberId: 'RT992', role: 'Retailer', mobile: '9876543210', status: 'Approved', initials: 'RS' },
      { id: 'member-81', name: 'Sachin Balyan', memberId: 'RT1236', role: 'Retailer', mobile: '6377487868', status: 'Pending', initials: 'SB' },
      { id: 'member-3', name: 'Vivek Varshney', memberId: 'MDT8597', role: 'Master Distributor', mobile: '9355196019', status: 'Approved', initials: 'VV' },
      { id: 'member-4', name: 'Satish Kumar', memberId: 'DT4005', role: 'Distributor', mobile: '8700294647', status: 'Pending', initials: 'SK' },
      { id: 'member-5', name: 'Aabid Hussain', memberId: 'API4412', role: 'API User', mobile: '9716800202', status: 'Rejected', initials: 'AH' }
    ];

    const combined = [...defaultMock];
    memberList.forEach(m => {
      const exists = combined.some(c => c.mobile === m.mobile || c.name === m.name);
      if (!exists) {
        let roleName = 'Retailer';
        if (m.memberId?.includes('MDT')) roleName = 'Master Distributor';
        else if (m.memberId?.includes('DT')) roleName = 'Distributor';
        else if (m.memberId?.includes('API')) roleName = 'API User';

        combined.push({
          id: `redux-${m.id}`,
          name: m.name || 'Merchant Partner',
          memberId: m.memberId?.split(' ')[0] || 'MEM' + m.id,
          role: roleName,
          mobile: m.mobile || '',
          status: Math.random() > 0.3 ? 'Approved' : 'Pending',
          initials: (m.name || 'MP').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        });
      }
    });
    return combined;
  }, [memberList]);

  // Dynamically extract unique roles and statuses
  const uniqueRoles = useMemo(() => ['All', ...new Set(allMembers.map(m => m.role))], [allMembers]);
  const uniqueStatuses = useMemo(() => ['All', ...new Set(allMembers.map(m => m.status))], [allMembers]);

  const filteredMembers = useMemo(() => {
    return allMembers.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.mobile.includes(searchQuery);
      
      const matchesRole = roleFilter === 'All' || m.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allMembers, searchQuery, roleFilter, statusFilter]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [broadcastLogs]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
    }
  };

  const handleToggleMember = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || selectedIds.length === 0) return;

    let targetDescription = '';
    if (selectedIds.length === filteredMembers.length) {
       if (roleFilter !== 'All' && statusFilter !== 'All') {
          targetDescription = `All ${statusFilter} ${roleFilter}s`;
       } else if (roleFilter !== 'All') {
          targetDescription = `All ${roleFilter}s`;
       } else if (statusFilter !== 'All') {
          targetDescription = `All ${statusFilter} Users`;
       } else {
          targetDescription = 'All Users';
       }
    } else if (selectedIds.length <= 3) {
       targetDescription = allMembers.filter(m => selectedIds.includes(m.id)).map(m => m.name).join(', ');
    } else {
       targetDescription = `${selectedIds.length} users`;
    }

    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      text: newMessage,
      time: timeString,
      targetDescription,
      recipients: selectedIds.length,
      image: selectedImage ? selectedImage.previewUrl : null,
      isPdf: selectedImage?.isPdf,
      fileName: selectedImage?.name
    };

    // Add to bottom of chat
    setBroadcastLogs(prev => [...prev, userMsg]);
    
    // Send to global notification state for local testing
    dispatch(addNotification({
      title: SITE_CONFIG.brandName,
      text: newMessage || 'File Attachment',
      time: timeString,
      image: selectedImage ? selectedImage.previewUrl : null,
      isPdf: selectedImage?.isPdf,
      fileName: selectedImage?.name,
      icon: SITE_CONFIG.logo || '/images/header_logo.png'
    }));

    setNewMessage('');
    setSelectedTemplate('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTemplateSelect = (e) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    if (val) {
      setNewMessage(val);
    }
  };

  const handleClearHistory = () => {
    setBroadcastLogs([]);
    setShowMenu(false);
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage({ 
        file, 
        previewUrl: url,
        isPdf: file.type === 'application/pdf',
        name: file.name
      });
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isAllSelected = filteredMembers.length > 0 && selectedIds.length === filteredMembers.length;

  return (
    <>
      <div 
        className={`${styles.floatingContainer} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <button className={styles.chatbotBtn} title="Open Broadcast Portal">
          <FaCommentDots className={styles.botIcon} />
        </button>
      </div>

      {isOpen && (
        <div className={styles.chatOverlay} onClick={() => setIsOpen(false)}>
          {/* Animated Mouse Trail Canvas */}
          <canvas ref={canvasRef} className={styles.trailCanvas} />

          {/* Animated Background Bubbles */}
          <div className={styles.bubbles}>
            <div className={styles.bubble}></div>
            <div className={styles.bubble}></div>
            <div className={styles.bubble}></div>
            <div className={styles.bubble}></div>
            <div className={styles.bubble}></div>
            <div className={styles.bubble}></div>
          </div>
          
          <div className={styles.chatWindow} onClick={(e) => e.stopPropagation()}>
            
            {/* LEFT SIDEBAR */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <div className={styles.avatarAdmin} style={{ background: 'transparent', border: 'none', width: 'auto', padding: '0', display: 'flex', alignItems: 'center' }}>
                  <img src={SITE_CONFIG.logo || '/images/header_logo.png'} alt="Logo" className={styles.headerLogo} style={{ height: '35px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <h4>{SITE_CONFIG.brandName}</h4>
              </div>

              <div className={styles.filterSection}>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search merchant, ID, mobile..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className={styles.dropdownRow}>
                  <div className={styles.selectWrap}>
                    <select 
                      value={roleFilter} 
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.selectWrap}>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.selectAllRow} onClick={handleSelectAll}>
                  <div className={styles.checkboxWrapper}>
                    {isAllSelected ? <FaCheckSquare className={styles.checkedIcon} /> : <FaRegSquare className={styles.uncheckedIcon} />}
                  </div>
                  <span className={styles.selectAllText}>Select All ({filteredMembers.length})</span>
                </div>
              </div>

              <div className={styles.targetsList}>
                {filteredMembers.length === 0 ? (
                  <div className={styles.noResults}>
                    <FaUsers className={styles.noResultsIcon} />
                    <p>No active merchants found</p>
                  </div>
                ) : (
                  filteredMembers.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`${styles.targetCard} ${isSelected ? styles.activeCard : ''}`}
                        onClick={() => handleToggleMember(item.id)}
                      >
                        <div className={styles.checkboxWrapper}>
                          {isSelected ? <FaCheckSquare className={styles.checkedIcon} /> : <FaRegSquare className={styles.uncheckedIcon} />}
                        </div>
                        <div className={styles.avatar}>
                          {item.initials}
                        </div>
                        <div className={styles.targetInfo}>
                          <span className={styles.targetName}>{item.name}</span>
                          <span className={styles.targetIdRole}>
                            {item.memberId} • {item.role}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* RIGHT MAIN AREA (WhatsApp Style) */}
            <main className={styles.chatArea}>
              
              <header className={styles.chatHeader}>
                <div className={styles.activeHeaderInfo}>
                  <div>
                    <p className={styles.activeHeaderStatus} style={{ marginTop: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                      {selectedIds.length === 0 
                        ? 'Select users from the left panel to notify' 
                        : `Ready to notify ${selectedIds.length} selected user(s)`}
                    </p>
                  </div>
                </div>

                <div className={styles.headerActionBtns}>
                  <div className={styles.menuWrapper} ref={menuRef}>
                    <button 
                      className={styles.headerBtn} 
                      title="More Options"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <FaEllipsisV />
                    </button>
                    {showMenu && (
                      <div className={styles.dropdownMenu}>
                        <button onClick={handleClearHistory} className={styles.menuItem}>
                          <FaTrash className={styles.menuItemIcon} /> Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                  <button 
                    className={styles.closePanelBtn} 
                    onClick={() => setIsOpen(false)}
                    title="Close"
                  >
                    <FaTimes />
                  </button>
                </div>
              </header>

              {/* Message Thread (WhatsApp Doodle Background) */}
              <div className={styles.messageThread}>
                {broadcastLogs.map((msg) => (
                  <div key={msg.id} className={styles.messageBubbleWrap}>
                    <div className={styles.messageCol}>
                      {/* Recipients tag OUTSIDE the bubble, above it */}
                      <div className={styles.msgRecipientTag}>
                        <FaCommentDots style={{ fontSize: '0.65rem' }}/> Sent to: {msg.targetDescription}
                      </div>
                      
                      {/* WhatsApp style Bubble */}
                      <div className={styles.msgAdmin}>
                        {msg.image && (
                          msg.isPdf ? (
                             <a href={msg.image} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', textDecoration: 'none', color: 'inherit', marginBottom: '8px' }}>
                               <FaPaperclip /> {msg.fileName}
                             </a>
                          ) : (
                             <img src={msg.image} alt="Attachment" className={styles.sentImage} />
                          )
                        )}
                        {msg.text && <p className={styles.msgText}>{msg.text}</p>}
                        <div className={styles.msgMeta}>
                          <span className={styles.msgTime}>{msg.time}</span>
                          <FaCheckDouble className={styles.readCheck} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* WhatsApp Style Footer Input Bar */}
              <div className={styles.footerWrapper}>
                
                {/* FLOATING TEMPLATE SELECTOR & PIN BUTTON */}
                <div className={styles.floatingTemplateWrap} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select 
                    value={selectedTemplate} 
                    onChange={handleTemplateSelect}
                    className={styles.floatingTemplateDropdown}
                  >
                    {QUICK_TEMPLATES.map((t, idx) => (
                      <option key={idx} value={t.value}>{t.label || 'Select Template...'}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAttachmentClick}
                    className={styles.attachmentBtn}
                    style={{ background: '#fff', border: '1px solid #d1d5db', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    title="Attach Image or PDF"
                  >
                    <FaPaperclip style={{ fontSize: '1.1rem' }} />
                  </button>
                </div>

                {selectedImage && (
                  <div className={styles.imagePreviewContainer}>
                    <div className={styles.imagePreviewWrap}>
                      {selectedImage.isPdf ? (
                        <div style={{ width: '100px', height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                           <FaPaperclip style={{ fontSize: '2rem', color: 'var(--color-primary)' }} />
                           <span style={{ fontSize: '0.6rem', marginTop: '8px', wordBreak: 'break-all', color: '#333' }}>{selectedImage.name}</span>
                        </div>
                      ) : (
                        <img src={selectedImage.previewUrl} alt="Preview" className={styles.imagePreview} />
                      )}
                      <button onClick={handleRemoveImage} className={styles.removeImageBtn} title="Remove Image">
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                )}
                
                <footer className={styles.chatFooterInput}>
                  {/* Hidden File Input (Kept for future logic if needed) */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  
                  <textarea 
                    placeholder="Type broadcast message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className={styles.messageInput}
                    rows="2"
                  />

                  <button 
                    className={styles.sendBtn} 
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !selectedImage) || selectedIds.length === 0}
                    title="Send Broadcast"
                  >
                    <FaPaperPlane className={styles.sendIcon}/>
                  </button>
                </footer>
              </div>

            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminChat;