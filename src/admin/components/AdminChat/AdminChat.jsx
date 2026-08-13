import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCheckDouble, FaCheckSquare, FaCommentDots, FaEllipsisV, FaPaperclip, FaPaperPlane, FaRegSquare, FaSearch, FaTimes, FaTrash, FaUsers } from 'react-icons/fa';
import { FiActivity, FiFileText, FiUser, FiDollarSign, FiServer, FiCalendar, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { API } from '../../../api/endpoints';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { addNotification } from '../../../store/slices/memberPanelSlice';
import styles from './AdminChat.module.css';
import memberStyles from '../MemberPages/MemberPages.module.css';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';

const QUICK_TEMPLATES = [
  { label: 'Select Template...', value: '' },
  { label: 'UPI Service Downtime', value: 'Dear Merchant, UPI Payment services are currently experiencing a temporary bank server downtime. We are working to resolve it shortly.' },
  { label: 'AEPS Active Announcement', value: 'Great News! AEPS withdrawal services are now 100% active with high success rates across all major banks.' },
  { label: 'Commission Hike Alert', value: 'Special Offer: Get an extra 0.2% commission on all mobile recharges done today. Happy earning!' },
  { label: 'Fund Request Approval', value: 'Your fund request has been successfully verified and credited to your wallet balance. Please check.' }
];

const BROADCAST_STORAGE_KEY = 'admin_broadcast_logs';

const AdminChat = () => {
  const dispatch = useDispatch();
  const { popup, showPopup, closePopup } = usePopup();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedIds, setSelectedIds] = useState([]);
  const [activeChatMemberId, setActiveChatMemberId] = useState(null);

  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  // allLogs: { [memberId]: [{...msg}] } — per-user chat history
  const [allLogs, setAllLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BROADCAST_STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const [liveMembers, setLiveMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const menuRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTxnId, setSearchTxnId] = useState('');
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnResult, setTxnResult] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, actionTitle: "", actionColor: "", txnId: "", onConfirm: null });

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

    useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    };
    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutsideSearch);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, [isSearchExpanded]);

    useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleTxnSearchSubmit = async () => {
    const trimmedId = searchTxnId.trim();
    if (!trimmedId) return;
    
    try {
      const res = await API.transaction.search({
        searchTerm: trimmedId,
        pageNumber: 1,
        pageSize: 1
      });
      
      if (res && res.status !== false) {
        const payload = res.data || res;
        const item = payload.items && payload.items[0];
        if (item) {
          setTxnResult({
            txnId: item.orderId || item.id?.toString() || trimmedId,
            member: `${item.customerName || 'Customer'} (ID: ${item.msrno || ''})`,
            amount: `₹ ${(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            gateway: item.vendorId || item.refid || 'DMT GATEWAY',
            status: (item.status || 'PENDING').toUpperCase(),
            date: item.createdDate ? new Date(item.createdDate).toLocaleString('en-GB') : new Date().toLocaleString('en-GB')
          });
          setTxnModalOpen(true);
        } else {
          showPopup('warning', 'Not Found', 'No transaction found with this ID.');
        }
      } else {
        showPopup('warning', 'Not Found', 'No transaction found with this ID.');
      }
    } catch (err) {
      console.error('Floating Transaction Search error:', err);
      showPopup('error', 'Search Error', 'Error performing transaction search.');
    } finally {
      setIsSearchExpanded(false);
      setSearchTxnId('');
    }
  };

  const handleTxnActionClick = (actionName, color) => {
    setConfirmModal({
      isOpen: true,
      actionTitle: actionName,
      actionColor: color,
      txnId: txnResult.txnId,
      onConfirm: () => {
        setConfirmModal({ isOpen: false, actionTitle: "", actionColor: "", txnId: "", onConfirm: null });
        setTxnResult(prev => {
          if (!prev) return null;
          let newStatus = prev.status;
          if (actionName === 'Force Success') {
            newStatus = 'SUCCESS';
          } else if (actionName === 'Force Failed') {
            newStatus = 'FAILED';
          } else if (actionName === 'Re-hit' || actionName === 'Logs') {
            newStatus = 'PENDING';
          } else if (actionName === 'Check Status') {
            newStatus = 'SUCCESS';
          }
          return { ...prev, status: newStatus };
        });
      }
    });
  };

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
        p.life -= 0.02;         p.size *= 0.96;       }
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

    useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real members from API
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const res = await API.member.getAll({ pageSize: 500 });
        const items = Array.isArray(res?.data?.items) ? res.data.items
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res : [];
        const mapped = items
          .filter(m => {
            // Exclude admin users
            const role = String(m.roleName || m.role || m.RoleName || '').toLowerCase();
            const loginId = String(m.loginId || m.loginID || m.LoginID || '').toUpperCase();
            return !role.includes('admin') && !loginId.startsWith('AD');
          })
          .map((m, idx) => {
            const loginId = m.loginId || m.loginID || m.LoginID || m.memberId || String(m.id || m.msrno || idx);
            const roleName = m.roleName || m.role || m.RoleName || 'Retailer';
            const statusVal = m.isActive === true || String(m.status).toLowerCase() === 'active' || m.isKycApproved === true ? 'Approved' : 'Pending';
            // Guaranteed unique id — never "undefined"
            const uid = (m.id && m.id !== 0) ? String(m.id)
              : (m.msrno && m.msrno !== 0) ? `msrno_${m.msrno}`
              : `idx_${idx}_${loginId}`;
            return {
              id: uid,
              msrno: m.msrno || m.id,
              loginId,
              name: m.name || m.fullName || m.ownerName || loginId,
              memberId: loginId,
              role: roleName,
              mobile: m.mobile || m.phone || m.mobileNo || '',
              status: statusVal,
              initials: (m.name || m.fullName || loginId || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            };
          });
        setLiveMembers(mapped);
      } catch (e) {
        console.error('[AdminChat] member fetch failed', e);
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const allMembers = useMemo(() => liveMembers, [liveMembers]);

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

    useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allLogs, activeChatMemberId]);

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
    // Open that member's chat window
    setActiveChatMemberId(id);
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || selectedIds.length === 0) return;

    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const now = Date.now();
    const targetMembers = allMembers.filter(m => selectedIds.includes(m.id));
    const isAllUsers = selectedIds.length === allMembers.length;

    const msgBase = {
      text: newMessage,
      time: timeString,
      date: new Date().toLocaleDateString('en-IN'),
      image: selectedImage ? selectedImage.previewUrl : null,
      isPdf: selectedImage?.isPdf,
      fileName: selectedImage?.name,
    };

    // Save per-user chat history
    const newAllLogs = { ...allLogs };
    targetMembers.forEach(m => {
      const key = m.id;
      const prev = newAllLogs[key] || [];
      newAllLogs[key] = [...prev, { id: now + '_' + key, ...msgBase }];
    });
    setAllLogs(newAllLogs);
    try { localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(newAllLogs)); } catch {}

    // Send notification to each target member via localStorage
    // Member/API panel listens to 'local_notifications' storage event
    const targetMsrnos = targetMembers.map(m => String(m.msrno || m.id));
    const targetLoginIds = targetMembers.map(m => String(m.loginId || m.memberId || ''));

    const notifPayload = {
      id: now,
      title: `📢 ${SITE_CONFIG.brandName || 'Admin'}`,
      text: newMessage || 'File Attachment',
      time: timeString,
      date: new Date().toLocaleDateString('en-IN'),
      image: selectedImage ? selectedImage.previewUrl : null,
      isPdf: selectedImage?.isPdf,
      fileName: selectedImage?.name,
      icon: SITE_CONFIG.logo || '/images/header_logo.png',
      isAdminBroadcast: true,
      targetAll: isAllUsers,
      targetMsrnos,
      targetLoginIds,
    };

    try {
      // Save to localStorage (persistence)
      const existing = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const updated = [notifPayload, ...existing].slice(0, 100);
      localStorage.setItem('local_notifications', JSON.stringify(updated));

      // Per-user keys — most reliable targeting (member panel reads their own key)
      if (isAllUsers) {
        localStorage.setItem('notif_for_all', JSON.stringify(notifPayload));
      } else {
        targetMembers.forEach(m => {
          const lid = String(m.loginId || m.memberId || '').toLowerCase().trim();
          const msrno = String(m.msrno || '').trim();
          if (lid) localStorage.setItem(`notif_for_${lid}`, JSON.stringify(notifPayload));
          if (msrno && msrno !== '0') localStorage.setItem(`notif_for_msrno_${msrno}`, JSON.stringify(notifPayload));
        });
      }

      // BroadcastChannel — instant cross-tab delivery (same browser, same origin)
      const bc = new BroadcastChannel('admin_notifications');
      bc.postMessage(notifPayload);
      bc.close();
    } catch {}

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
    if (activeChatMemberId) {
      // Clear only active member's chat
      const updated = { ...allLogs };
      delete updated[activeChatMemberId];
      setAllLogs(updated);
      try { localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(updated)); } catch {}
    } else {
      setAllLogs({});
      try { localStorage.removeItem(BROADCAST_STORAGE_KEY); } catch {}
    }
    setShowMenu(false);
  };

  // Current chat messages = active member's history
  const activeMember = allMembers.find(m => m.id === activeChatMemberId);
  const currentChatLogs = activeChatMemberId ? (allLogs[activeChatMemberId] || []) : [];

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
        ref={searchContainerRef}
        className={`${styles.searchFloatingContainer} ${isSearchExpanded ? styles.expanded : ''} ${isOpen ? styles.hidden : ''}`}
        onClick={() => {
          if (!isSearchExpanded) {
            setIsSearchExpanded(true);
          }
        }}
      >
        <div className={styles.searchIconWrapper}>
          <FaSearch className={styles.searchIconLiquid} />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Enter TXN ID..."
          value={searchTxnId}
          onChange={(e) => setSearchTxnId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTxnSearchSubmit();
            } else if (e.key === 'Escape') {
              setIsSearchExpanded(false);
            }
          }}
          className={styles.searchBarInput}
          style={{
            opacity: isSearchExpanded ? 1 : 0,
            width: isSearchExpanded ? '200px' : '0px',
            transition: 'opacity 0.2s ease, width 0.3s ease',
            pointerEvents: isSearchExpanded ? 'auto' : 'none'
          }}
        />

        {isSearchExpanded && (
          <button 
            className={styles.searchCloseBtn} 
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchExpanded(false);
              setSearchTxnId('');
            }}
          >
            <FaTimes />
          </button>
        )}
      </div>

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
                {membersLoading ? (
                  <div className={styles.noResults}>
                    <FiRefreshCw className={styles.noResultsIcon} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Loading members...</p>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className={styles.noResults}>
                    <FaUsers className={styles.noResultsIcon} />
                    <p>No members found</p>
                  </div>
                ) : (
                  filteredMembers.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isActive = activeChatMemberId === item.id;
                    const msgCount = (allLogs[item.id] || []).length;
                    return (
                      <div
                        key={item.id}
                        className={`${styles.targetCard} ${isActive ? styles.activeCard : ''}`}
                        onClick={() => handleToggleMember(item.id)}
                      >
                        <div className={styles.checkboxWrapper} onClick={e => { e.stopPropagation(); setSelectedIds(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]); }}>
                          {isSelected ? <FaCheckSquare className={styles.checkedIcon} /> : <FaRegSquare className={styles.uncheckedIcon} />}
                        </div>
                        <div className={styles.avatar}>{item.initials}</div>
                        <div className={styles.targetInfo}>
                          <span className={styles.targetName}>{item.name}</span>
                          <span className={styles.targetIdRole}>{item.memberId} • {item.role}</span>
                          {msgCount > 0 && (
                            <span style={{ fontSize: '0.65rem', color: '#1756AA', fontWeight: 700 }}>
                              {msgCount} message{msgCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

                        <main className={styles.chatArea}>
              
              <header className={styles.chatHeader}>
                <div className={styles.activeHeaderInfo}>
                  <div>
                    {activeMember ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          {activeMember.initials}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{activeMember.name}</p>
                          <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.75 }}>{activeMember.memberId} • {activeMember.role}</p>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.activeHeaderStatus} style={{ marginTop: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                        {selectedIds.length === 0
                          ? 'Select a user from the left panel'
                          : `${selectedIds.length} user(s) selected — click to open chat`}
                      </p>
                    )}
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

                            <div className={styles.messageThread}>
                {!activeChatMemberId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                    <FaUsers size={36} />
                    <p style={{ marginTop: 12, fontSize: '0.85rem' }}>Click a member on the left to open chat</p>
                  </div>
                ) : currentChatLogs.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                    <FaCommentDots size={32} />
                    <p style={{ marginTop: 12, fontSize: '0.85rem' }}>No messages yet. Send the first message!</p>
                  </div>
                ) : currentChatLogs.map((msg) => (
                  <div key={msg.id} className={styles.messageBubbleWrap}>
                    <div className={styles.messageCol}>
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

                            <div className={styles.footerWrapper}>
                
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
                    disabled={(!newMessage.trim() && !selectedImage) || selectedIds.length === 0 || !activeChatMemberId}
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

            {txnModalOpen && txnResult && (
        <div className={styles.txnModalOverlay} onClick={() => setTxnModalOpen(false)}>
          <div className={styles.txnModalContent} style={{ width: '960px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.txnHeader} style={{ padding: '10px 20px' }}>
              <div className={styles.txnHeaderTitle}>
                <FiActivity style={{ marginRight: '6px' }} />
                <h3>Transaction Details</h3>
              </div>
              <button className={styles.txnCloseBtn} onClick={() => setTxnModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.txnBody} style={{ padding: '15px 20px 20px 20px' }}>
              <div className={memberStyles.tableWrapper} style={{ border: '1.5px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginTop: '0px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <table className={memberStyles.table} style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg,#0D1B5E,#1a2f8a)' }}>
                      <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px' }}>TRANSACTION ID</th>
                      <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px' }}>MEMBER DETAILS</th>
                      <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px' }}>AMOUNT</th>
                      <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px' }}>GATEWAY / SERVICE</th>
                      <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px' }}>STATUS</th>
                      <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px' }}>DATE & TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={memberStyles.hoverRow} style={{ background: '#fff' }}>
                      <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem', padding: '8px 12px' }}>{txnResult.txnId}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1D4ED8' }}>
                            {txnResult.member.split('(')[0].trim()}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.72rem', color: '#64748B' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <FiUser size={10} /> {txnResult.member.includes('(') ? txnResult.member.split('(')[1].replace(')', '') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#059669' }}>
                          {txnResult.amount}
                        </span>
                      </td>
                      <td style={{ color: '#64748B', fontWeight: 600, fontSize: '0.78rem', padding: '8px 12px' }}>
                        {txnResult.gateway}
                      </td>
                      <td style={{ textAlign: 'left', padding: '8px 12px' }}>
                        <span
                          style={{
                            background: txnResult.status === 'SUCCESS' ? '#ECFDF5' : txnResult.status === 'FAILED' ? '#FEF2F2' : '#FFF9E6',
                            color: txnResult.status === 'SUCCESS' ? '#059669' : txnResult.status === 'FAILED' ? '#EF4444' : '#B08D00',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: `1px solid ${txnResult.status === 'SUCCESS' ? '#6EE7B7' : txnResult.status === 'FAILED' ? '#FECACA' : '#FDE68A'}`
                          }}
                        >
                          ● {txnResult.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748B', fontWeight: 600, fontSize: '0.78rem', padding: '8px 12px' }}>
                        {txnResult.date}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

               {/* Action Buttons inside the Popup */}
               <div className={styles.txnActions} style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginTop: '10px', borderTop: 'none', paddingTop: '0' }}>
                 <button 
                   className={`${styles.txnActionBtn} ${styles.btnSuccess}`}
                   onClick={() => handleTxnActionClick('Force Success', '#10B981')}
                   style={{ flex: '0 1 140px', height: '38px', padding: '10px 16px', fontSize: '0.8rem' }}
                 >
                   <FiCheckCircle /> Success
                 </button>
                 <button 
                   className={`${styles.txnActionBtn} ${styles.btnFailed}`}
                   onClick={() => handleTxnActionClick('Force Failed', '#EF4444')}
                   style={{ flex: '0 1 140px', height: '38px', padding: '10px 16px', fontSize: '0.8rem' }}
                 >
                   <FiXCircle /> Failed
                 </button>
                 <button 
                   className={`${styles.txnActionBtn} ${styles.btnRehit}`}
                   onClick={() => handleTxnActionClick('Logs', '#3B82F6')}
                   style={{ flex: '0 1 140px', height: '38px', padding: '10px 16px', fontSize: '0.8rem' }}
                 >
                   <FiRefreshCw /> Logs
                 </button>
                 <button 
                   className={`${styles.txnActionBtn} ${styles.btnCheckStatus}`}
                   onClick={() => handleTxnActionClick('Check Status', '#0EA5E9')}
                   style={{ flex: '0 1 140px', height: '38px', padding: '10px 16px', fontSize: '0.8rem' }}
                 >
                   <FaSearch /> Check Status
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className={styles.confirmModalOverlay} style={{ zIndex: 10002 }}>
          <div className={styles.confirmModalContent}>
            <div 
              className={styles.confirmIconWrap} 
              style={{ background: `${confirmModal.actionColor}15`, color: confirmModal.actionColor }}
            >
              <FiActivity size={24} />
            </div>
            <h3 className={styles.confirmModalTitle}>Confirm Action</h3>
            <p className={styles.confirmModalText}>
              Are you sure you want to perform <strong style={{ color: confirmModal.actionColor }}>{confirmModal.actionTitle}</strong> on transaction <strong>{confirmModal.txnId}</strong>?
            </p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmBtnCancel} 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmBtnProceed} 
                style={{ background: confirmModal.actionColor }}
                onClick={confirmModal.onConfirm}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
      <PopupModal show={popup.show} type={popup.type} title={popup.title} message={popup.message} onClose={closePopup} />
    </>
  );
};

export default AdminChat;
