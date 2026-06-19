import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiX, FiCheck, FiBell, FiFileText, FiCalendar, FiGlobe, FiRefreshCw, FiBold, FiItalic, FiUnderline, FiLink, FiList
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import { sanitizeHTML } from '../../../utils/securityUtils';

const ManageNews = () => {
  const dispatch = useDispatch();
  const { news = [] } = useSelector(state => state.settings || {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  // Form States
  const [title, setTitle] = useState("");
  const [targetType, setTargetType] = useState("Global");
  const [expiryDate, setExpiryDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  // Custom Delete States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // List State
  const [newsList, setNewsList] = useState([]);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    const url = prompt("Enter URL:", "https://");
    if (!url) return;

    if (selectedText.length > 0) {
      executeCommand("createLink", url);
    } else {
      const anchorHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      executeCommand("insertHTML", anchorHtml);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle("");
    setTargetType("Global");
    setExpiryDate("");
    setContent("");
    setIsModalOpen(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }, 50);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setTargetType(item.type);
    setExpiryDate(item.expiryDate || "");
    setContent(item.content);
    setIsModalOpen(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = item.content;
      }
    }, 100);
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (id) => {
    setNewsList(prev => prev.map(item => 
      item.id === id ? { ...item, status: !item.status } : item
    ));
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill Title and Content fields.");
      return;
    }
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      
      if (editingId) {
        setNewsList(prev => prev.map(item => 
          item.id === editingId 
            ? { ...item, title, type: targetType, expiryDate, content }
            : item
        ));
        setSuccessMsg("News updated successfully!");
      } else {
        const newNews = {
          id: Date.now(),
          title,
          type: targetType,
          status: true,
          addDate: new Date().toLocaleDateString('en-GB'),
          expiryDate,
          content
        };
        setNewsList(prev => [newNews, ...prev]);
        setSuccessMsg("News published successfully!");
      }

      setTimeout(() => {
        setSuccessMsg("");
        setIsModalOpen(false);
        setEditingId(null);
        setTitle("");
        setTargetType("Global");
        setExpiryDate("");
        setContent("");
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
      }, 1500);
    }, 1500);
  };

  return (
    <div className={styles.container} style={{ padding: '15px 10px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>Manage Dashboard News</h3>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #1756AA 0%, #114080 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' 
          }} onClick={handleOpenNew}>
            <FiPlus /> <span>Publish New Update</span>
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '10px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
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
              placeholder="Search news title..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '1050px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>S.NO</th>
                <th style={{ width: '90px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '400px' }}>NEWS CONTENT</th>
                <th style={{ width: '150px', textAlign: 'left' }}>TARGET TYPE</th>
                <th style={{ width: '120px', textAlign: 'left' }}>STATUS</th>
                <th style={{ width: '150px', textAlign: 'left' }}>PUB. DATE</th>
              </tr>
            </thead>
            <tbody>
              {newsList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                    No news items available.
                  </td>
                </tr>
              ) : (
                newsList.map((item, idx) => (
                  <tr key={item.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button onClick={() => handleEdit(item)} className={styles.editBtn} style={{ background: 'transparent', border: 'none', color: '#1756AA', fontSize: '1.1rem', padding: 0, cursor: 'pointer' }} title="Edit News"><FiEdit /></button>
                          <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn} style={{ background: 'transparent', border: 'none', color: '#E53E3E', fontSize: '1.1rem', padding: 0, cursor: 'pointer' }} title="Remove News"><FiTrash2 /></button>
                       </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                         <div style={{ width: '36px', height: '36px', background: 'rgba(23, 86, 170, 0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', marginTop: '3px' }}>
                            <FiBell />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{item.title}</span>
                            <p 
                              style={{ color: '#718096', fontSize: '0.75rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}
                              dangerouslySetInnerHTML={{ __html: sanitizeHTML(item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content) }}
                            />
                         </div></div></td>
                    <td style={{ textAlign: 'left' }}>
                       <span style={{ background: '#F1F5F9', color: '#4E6080', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                         <FiGlobe style={{ fontSize: '0.8rem' }} /> {item.type}
                       </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                       <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                          <input type="checkbox" checked={item.status} onChange={() => handleToggleStatus(item.id)} />
                          <span className={styles.slider}></span>
                        </label>
                    </td>
                    <td style={{ textAlign: 'left', color: '#718096', fontWeight: 700, fontSize: '0.85rem' }}>{item.addDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '20px 25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {newsList.length > 0 ? 1 : 0} to {newsList.length} of {newsList.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── ADD MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '720px', maxWidth: '95%' }}>
            <div className={styles.drawerHeader}>
              <div className={styles.directoryTitleGroup}>
                <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '28px', 
                    height: '28px', 
                    background: '#1756AA', 
                    color: '#fff', 
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}>
                    <FiPlus />
                  </span>
                  {editingId ? 'Edit News Update' : 'Publish New Update'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: '#4E6080' }}>
                <FiX />
              </button>
            </div>
            
            <div className={styles.drawerBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>News Title / Headline *</label>
                  <input type="text" className={styles.inputControl} placeholder="e.g. Server Maintenance Notice" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div className={styles.formGroup}>
                      <label className={styles.label}>Target Role</label>
                      <select className={styles.inputControl} value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                        <option value="Global">Global (All Users)</option>
                        <option value="Retailer">Retailers Only</option>
                        <option value="Distributor">Distributors Only</option>
                      </select>
                   </div>
                   <div className={styles.formGroup}>
                      <label className={styles.label}><FiCalendar /> Expiry Date</label>
                      <input type="date" className={styles.inputControl} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                   </div>
                </div>

                <div className={styles.formGroup}>
                   <label className={styles.label}><FiFileText /> News Content / Description *</label>
                   
                   <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                     <div style={{ padding: '8px 12px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#475569', borderRadius: '4px' }} title="Bold"><FiBold /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#475569', borderRadius: '4px' }} title="Italic"><FiItalic /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#475569', borderRadius: '4px' }} title="Underline"><FiUnderline /></button>
                        <div style={{ width: '1px', background: '#CBD5E1', height: '20px', alignSelf: 'center', margin: '0 5px' }}></div>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleLink(); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#475569', borderRadius: '4px' }} title="Insert Link"><FiLink /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#475569', borderRadius: '4px' }} title="Bulleted List"><FiList /></button>
                     </div>
                     <div 
                       ref={editorRef}
                       contentEditable={true}
                       onInput={(e) => setContent(e.target.innerHTML)}
                       className="rich-editor"
                       style={{ 
                         padding: '15px', 
                         minHeight: '180px', 
                         maxHeight: '300px', 
                         overflowY: 'auto', 
                         outline: 'none', 
                         background: '#fff', 
                         fontSize: '0.95rem',
                         color: '#1E293B',
                         lineHeight: '1.5',
                         width: '100%',
                         boxSizing: 'border-box'
                       }}
                       placeholder="Write your update message here..."
                     />
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginTop: '40px' }}>
                {successMsg && (
                  <div style={{ color: '#16A34A', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px' }}>
                    <FiCheck style={{ fontSize: '1.2rem' }} /> {successMsg}
                  </div>
                )}
                <button 
                  type="button" 
                  disabled={isPublishing} 
                  style={{ background: '#fff', color: '#475569', border: '1px solid #CBD5E1', padding: '12px 25px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: isPublishing ? 'not-allowed' : 'pointer' }} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                   disabled={isPublishing} 
                   onClick={handlePublish}
                   style={{ 
                     background: isPublishing ? '#60A5FA' : '#1756AA', color: '#fff', border: 'none', 
                     padding: '12px 30px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800, 
                     cursor: isPublishing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                   }}
                >
                   {isPublishing && <FiRefreshCw className={styles.spin} />}
                   {isPublishing ? 'Publishing...' : (editingId ? 'Save Changes' : 'Publish Now')} {!isPublishing && <FiCheck />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM DELETE CONFIRMATION MODAL ── */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={() => setIsDeleteModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            width: '360px', maxWidth: '90%', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50px',
              background: '#FEE2E2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#EF4444', margin: '0 auto 16px auto',
              fontSize: '1.4rem'
            }}>
              <FiTrash2 />
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>Delete Update?</h4>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              Are you sure you want to remove this news update? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  background: '#fff', color: '#64748B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setNewsList(prev => prev.filter(item => item.id !== deleteTargetId));
                  setIsDeleteModalOpen(false);
                  setDeleteTargetId(null);
                }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNews;
