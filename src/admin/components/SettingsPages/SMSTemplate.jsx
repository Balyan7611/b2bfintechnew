import React, { useState } from 'react';
import { 
  FaSms, FaPlus, FaSearch, FaTrash, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, 
  FaPrint, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaEdit, FaFileAlt, FaDatabase
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const SMSTemplate = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [successToast, setSuccessToast] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [backupRow, setBackupRow] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    isSms: true,
    smsMessage: '',
    templateId: '',
    isMail: false,
    emailMessage: '',
    isWhatsapp: false,
    whatsappMessage: ''
  });

  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      category: 'Admin Login OTP', 
      isSms: true, 
      smsMessage: 'Dear Sir, your Admin Login OTP is {#var1#} JALDIPAY', 
      templateId: '1707178100631731567', 
      isMail: false, 
      emailMessage: '',
      isWhatsapp: false,
      whatsappMessage: '',
      addDate: '14/08/2024 14:59:03' 
    },
    { 
      id: 2, 
      category: 'Admin Fund Add OTP', 
      isSms: true, 
      smsMessage: 'Your {#var1#} OTP of Add Fund is do not share this OTP with anyone else. JALDIPAY', 
      templateId: '1707155979701254563', 
      isMail: false, 
      emailMessage: '',
      isWhatsapp: false,
      whatsappMessage: '',
      addDate: '14/08/2024 15:00:54' 
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const openEditDrawer = (row) => {
    setEditingRowId(row.id);
    setFormData({
      category: row.category || '',
      isSms: row.isSms || false,
      smsMessage: row.smsMessage || '',
      templateId: row.templateId || '',
      isMail: row.isMail || false,
      emailMessage: row.emailMessage || '',
      isWhatsapp: row.isWhatsapp || false,
      whatsappMessage: row.whatsappMessage || ''
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRowId) {
      setTemplates(templates.map(t => t.id === editingRowId ? { ...t, ...formData } : t));
      setSuccessToast(`Template updated successfully!`);
    } else {
      const newTemplate = {
        ...formData,
        id: Date.now(),
        addDate: new Date().toLocaleString()
      };
      setTemplates([newTemplate, ...templates]);
      setSuccessToast('New template configuration created!');
    }
    resetForm();
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDelete = () => {
    setTemplates(templates.filter(t => t.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
    setSuccessToast('Template deleted successfully.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      isSms: true,
      smsMessage: '',
      templateId: '',
      isMail: false,
      emailMessage: '',
      isWhatsapp: false,
      whatsappMessage: ''
    });
    setEditingRowId(null);
    setIsDrawerOpen(false);
  };

  return (
    <div className={styles.container} style={{ padding: '10px 15px', maxWidth: '100%', position: 'relative' }}>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-textarea:focus, .custom-input:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
          outline: none;
        }
        .icon-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
      `}</style>

      {/* TOAST SUCCESS MESSAGE */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0F172A',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 4000,
          fontSize: '0.85rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCheck style={{ fontSize: '0.65rem', color: '#fff' }} />
          </div>
          {successToast}
        </div>
      )}

      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>SMS & Notification Templates</h2>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, 
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' 
          }} onClick={() => setIsDrawerOpen(true)}>
            <FaPlus /> <span>New Template</span>
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '20px 25px', flexWrap: 'wrap', gap: '20px', borderBottom: 'none' }}>
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
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search templates..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── GRID TABLE VIEW ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '1550px', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ width: '110px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '150px' }}>Type</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Is SMS</th>
                <th style={{ width: '250px' }}>SMS Message</th>
                <th style={{ width: '150px' }}>Template ID</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Is Mail</th>
                <th style={{ width: '250px' }}>Email Message</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Is WhatsApp</th>
                <th style={{ width: '250px' }}>WhatsApp Message</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                   <td colSpan="10" style={{ textAlign: 'center', padding: '60px', color: '#A0AEC0' }}>
                      <FaDatabase style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '10px' }} />
                      <div>No templates defined</div>
                   </td>
                </tr>
              ) : (
                templates.map((tmp, idx) => {
                  return (
                    <tr key={tmp.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      {/* S.No */}
                      <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{idx + 1}</td>
                      
                      {/* Unified Action Column (Now 2nd Column) */}
                      <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 0' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', flexDirection: 'row', margin: '0 auto' }}>
                          <button 
                            onClick={() => openEditDrawer(tmp)}
                            className="icon-action-btn"
                            style={{
                              background: '#3B82F6',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
                            title="Edit Configuration"
                          >
                            <FaEdit style={{ fontSize: '0.85rem' }} />
                          </button>
                          <button 
                            onClick={() => setShowConfirmModal({ isOpen: true, id: tmp.id })}
                            className="icon-action-btn"
                            style={{
                              background: '#FFF5F5',
                              color: '#E53E3E',
                              border: '1px solid #FEE2E2',
                              boxShadow: '0 2px 4px rgba(229, 62, 62, 0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#E53E3E';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.borderColor = '#E53E3E';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#FFF5F5';
                              e.currentTarget.style.color = '#E53E3E';
                              e.currentTarget.style.borderColor = '#FEE2E2';
                            }}
                            title="Delete Mapping"
                          >
                            <FaTrash style={{ fontSize: '0.8rem' }} />
                          </button>
                        </div>
                      </td>

                      {/* Type / Category */}
                      <td>
                        <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>{tmp.category}</span>
                      </td>
                      
                      {/* Is SMS Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div 
                            style={{
                              width: '40px',
                              height: '18px',
                              borderRadius: '9px',
                              background: tmp.isSms ? '#22C55E' : '#EF4444',
                              padding: '2px',
                              position: 'relative',
                              opacity: 0.9
                            }}
                          >
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              left: tmp.isSms ? '24px' : '2px',
                              top: '2px'
                            }} />
                          </div>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 800, 
                            color: tmp.isSms ? '#22C55E' : '#EF4444',
                            background: tmp.isSms ? '#DCFCE7' : '#FEE2E2',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                          }}>
                            {tmp.isSms ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      
                      {/* SMS Message textarea */}
                      <td>
                        <div
                          style={{
                            width: '100%',
                            height: '70px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '0.75rem',
                            color: tmp.isSms ? '#334155' : '#94A3B8',
                            overflowY: 'auto',
                            lineHeight: '1.4',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}
                        >
                           {tmp.smsMessage || '-'}
                        </div>
                      </td>
                      
                      {/* Template ID Input */}
                      <td>
                        <div
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '0.8rem',
                            color: tmp.isSms ? '#0F172A' : '#94A3B8',
                            fontWeight: 600
                          }}
                        >
                           {tmp.templateId || '-'}
                        </div>
                      </td>
                      
                      {/* Is Mail Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div 
                            style={{
                              width: '40px',
                              height: '18px',
                              borderRadius: '9px',
                              background: tmp.isMail ? '#22C55E' : '#EF4444',
                              padding: '2px',
                              position: 'relative',
                              opacity: 0.9
                            }}
                          >
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              left: tmp.isMail ? '24px' : '2px',
                              top: '2px'
                            }} />
                          </div>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 800, 
                            color: tmp.isMail ? '#22C55E' : '#EF4444',
                            background: tmp.isMail ? '#DCFCE7' : '#FEE2E2',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                          }}>
                            {tmp.isMail ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Email Message textarea */}
                      <td>
                        <div
                          style={{
                            width: '100%',
                            height: '70px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '0.75rem',
                            color: tmp.isMail ? '#334155' : '#94A3B8',
                            overflowY: 'auto',
                            lineHeight: '1.4',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}
                        >
                           {tmp.emailMessage || '-'}
                        </div>
                      </td>
                      
                      {/* Is WhatsApp Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div 
                            style={{
                              width: '40px',
                              height: '18px',
                              borderRadius: '9px',
                              background: tmp.isWhatsapp ? '#22C55E' : '#EF4444',
                              padding: '2px',
                              position: 'relative',
                              opacity: 0.9
                            }}
                          >
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              left: tmp.isWhatsapp ? '24px' : '2px',
                              top: '2px'
                            }} />
                          </div>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 800, 
                            color: tmp.isWhatsapp ? '#22C55E' : '#EF4444',
                            background: tmp.isWhatsapp ? '#DCFCE7' : '#FEE2E2',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                          }}>
                            {tmp.isWhatsapp ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      
                      {/* WhatsApp Message textarea */}
                      <td>
                        <div
                          style={{
                            width: '100%',
                            height: '70px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '0.75rem',
                            color: tmp.isWhatsapp ? '#334155' : '#94A3B8',
                            overflowY: 'auto',
                            lineHeight: '1.4',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}
                        >
                           {tmp.whatsappMessage || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationRow} style={{ marginTop: '20px', paddingTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>Showing {templates.length} entries</span>
          <div className={styles.pagination} style={{ display: 'flex', gap: '6px' }}>
            <button className={styles.pageBtn} style={{ width: '32px', height: '32px' }} disabled><FaChevronLeft /></button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`} style={{ width: '32px', height: '32px' }}>1</button>
            <button className={styles.pageBtn} style={{ width: '32px', height: '32px' }} disabled><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── PREMIUM RIGHT-SIDE SLIDING DRAWER ── */}
      {isDrawerOpen && (
        <div 
          onClick={resetForm}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15, 23, 42, 0.3)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 3500,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'fixed', 
              top: 0, 
              right: 0, 
              bottom: 0, 
              width: '460px', 
              background: '#ffffff', 
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.08)', 
              zIndex: 3501, 
              display: 'flex', 
              flexDirection: 'column', 
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid #E2E8F0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#F8FAFC' 
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(30, 58, 138, 0.15)'
                  }}>
                     <FaFileAlt />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {editingRowId ? 'Edit Template Mapping' : 'New Template Mapping'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>Register SMS, Email & WhatsApp rules</p>
                  </div>
               </div>
               <button 
                 onClick={resetForm}
                 style={{
                   width: '28px',
                   height: '28px',
                   borderRadius: '50%',
                   border: '1px solid #E2E8F0',
                   background: '#FFFFFF',
                   color: '#64748B',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease',
                   padding: 0
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.background = '#EF4444';
                   e.currentTarget.style.color = '#ffffff';
                   e.currentTarget.style.borderColor = '#EF4444';
                   e.currentTarget.style.transform = 'rotate(90deg)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.background = '#FFFFFF';
                   e.currentTarget.style.color = '#64748B';
                   e.currentTarget.style.borderColor = '#E2E8F0';
                   e.currentTarget.style.transform = 'none';
                 }}
               >
                 <FaTimes style={{ fontSize: '0.75rem' }} />
               </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 
                 {/* Category */}
                 <div className={styles.formGroup}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Template Type / Name</label>
                    <select 
                      name="category" 
                      className={styles.selectControl} 
                      style={{ height: '40px', fontSize: '0.85rem', width: '100%', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px' }}
                      value={formData.category} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Admin Login OTP">Admin Login OTP</option>
                      <option value="Admin Fund Add OTP">Admin Fund Add OTP</option>
                      <option value="Member Reg OTP">Member Reg OTP</option>
                      <option value="Password Reset OTP">Password Reset OTP</option>
                      <option value="Fund Refund Alert">Fund Refund Alert</option>
                    </select>
                 </div>

                 <hr style={{ border: '0', borderTop: '1px solid #F1F5F9', margin: '5px 0' }} />

                 {/* SMS Settings */}
                 <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E3A8A' }}>SMS Channel Settings</span>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#4E6080' }}>
                         <input type="checkbox" name="isSms" checked={formData.isSms} onChange={handleInputChange} /> Enable
                       </label>
                    </div>
                    {formData.isSms && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '4px', display: 'block' }}>SMS Message Content</label>
                            <textarea 
                              name="smsMessage"
                              placeholder="Dear Sir, your OTP is {#var1#}"
                              style={{ width: '100%', height: '70px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem', resize: 'none' }}
                              value={formData.smsMessage}
                              onChange={handleInputChange}
                              required
                            />
                         </div>
                         <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '4px', display: 'block' }}>DLT Template ID</label>
                            <input 
                              type="text" 
                              name="templateId"
                              placeholder="e.g. 170717..."
                              style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem' }}
                              value={formData.templateId}
                              onChange={handleInputChange}
                              required
                            />
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Mail Settings */}
                 <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E3A8A' }}>Email Channel Settings</span>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#4E6080' }}>
                         <input type="checkbox" name="isMail" checked={formData.isMail} onChange={handleInputChange} /> Enable
                       </label>
                    </div>
                    {formData.isMail && (
                      <div>
                         <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '4px', display: 'block' }}>Email Body Content</label>
                         <textarea 
                           name="emailMessage"
                           placeholder="Enter email template markup or text..."
                           style={{ width: '100%', height: '70px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem', resize: 'none' }}
                           value={formData.emailMessage}
                           onChange={handleInputChange}
                           required
                         />
                      </div>
                    )}
                 </div>

                 {/* WhatsApp Settings */}
                 <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E3A8A' }}>WhatsApp Channel Settings</span>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#4E6080' }}>
                         <input type="checkbox" name="isWhatsapp" checked={formData.isWhatsapp} onChange={handleInputChange} /> Enable
                       </label>
                    </div>
                    {formData.isWhatsapp && (
                      <div>
                         <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '4px', display: 'block' }}>WhatsApp Message Body</label>
                         <textarea 
                           name="whatsappMessage"
                           placeholder="Enter WhatsApp template message..."
                           style={{ width: '100%', height: '70px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem', resize: 'none' }}
                           value={formData.whatsappMessage}
                           onChange={handleInputChange}
                           required
                         />
                      </div>
                    )}
                 </div>
              </div>

              {/* Drawer Footer */}
              <div style={{ 
                padding: '16px 24px', 
                background: '#F8FAFC', 
                borderTop: '1px solid #E2E8F0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    style={{ 
                      height: '38px', 
                      padding: '0 20px', 
                      fontSize: '0.85rem', 
                      background: '#FFFFFF', 
                      border: '1px solid #D1D5DB', 
                      borderRadius: '8px', 
                      color: '#4B5563', 
                      fontWeight: 600,
                      cursor: 'pointer' 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ 
                      height: '38px', 
                      padding: '0 25px', 
                      fontSize: '0.85rem', 
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' 
                    }}
                  >
                    Save Configuration
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', marginBottom: '16px' }}>
                <FaTrash style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Mapping</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this configuration? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  onClick={() => setShowConfirmModal({ isOpen: false, id: null })}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  style={{ flex: 1, padding: '10px', background: '#E53E3E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSTemplate;
