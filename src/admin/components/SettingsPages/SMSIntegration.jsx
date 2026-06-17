import React, { useState } from 'react';
import { 
  FaSms, FaLink, FaSearch, FaEdit, FaTrash, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, 
  FaPrint, FaChevronLeft, FaChevronRight, FaPlug, FaCheck, FaCalendarAlt, FaGlobe, FaRoute, FaSlidersH, FaPlus, FaTimes, FaArrowRight, FaArrowLeft, FaDatabase
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const SMSIntegration = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [currentStep, setCurrentStep] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    url: '',
    senderText: '',
    sender: '',
    countryText: '',
    country: '',
    routeText: '',
    route: '',
    param1Text: '',
    param1Val: '',
    param2Text: '',
    param2Val: '',
    mobile: '',
    message: '',
    dltText: '',
    integrationType: 'SMS'
  });

  const [integrations, setIntegrations] = useState([
    { 
      id: 1, 
      url: 'http://mobile.mediatestexample.com/submissions.jsp?accountid=1701162329402522535&',
      senderText: 'smworld',
      sender: 'SNTCH1',
      countryText: '91',
      country: 'India',
      routeText: 'transaction',
      route: 'otp',
      param1Text: 'user',
      param1Val: 'sontechno',
      param2Text: 'key',
      param2Val: 'id8571480XX',
      mobile: 'mobile',
      message: 'tempid',
      dltText: 'message',
      integrationType: 'SMS',
      addDate: '02/09/2022 12:52:15'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const prevStep = () => setCurrentStep(1);

  const resetForm = () => {
    setFormData({
      url: '', senderText: '', sender: '', countryText: '', country: '',
      routeText: '', route: '', param1Text: '', param1Val: '', param2Text: '',
      param2Val: '', mobile: '', message: '', dltText: '', integrationType: 'SMS'
    });
    setEditingItem(null);
    setCurrentStep(1);
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setIntegrations(integrations.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
    } else {
      setIntegrations([{ ...formData, id: Date.now(), addDate: new Date().toLocaleString() }, ...integrations]);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleDelete = () => {
    setIntegrations(integrations.filter(item => item.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
  };

  return (
    <div className={styles.container} style={{ padding: '10px 15px', maxWidth: '100%' }}>
      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>SMS Integration</h2>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
            color: '#fff', border: 'none', borderRadius: '8px', 
            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, 
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' 
          }} onClick={() => setShowModal(true)}>
            <FaPlus /> <span>New Integration</span>
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
              placeholder="Search integrations..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '1000px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>S.No</th>
                <th style={{ width: '90px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '280px' }}>URL ENDPOINT</th>
                <th style={{ width: '120px' }}>SENDER INFO</th>
                <th style={{ width: '150px' }}>PARAMETERS</th>
                <th style={{ width: '120px' }}>ROUTE & DLT</th>
                <th style={{ width: '80px' }}>TYPE</th>
                <th>DATE CREATED</th>
              </tr>
            </thead>
            <tbody>
              {integrations.length === 0 ? (
                <tr>
                   <td colSpan="8" style={{ textAlign: 'center', padding: '80px', color: '#A0AEC0' }}>
                      <FaDatabase style={{ fontSize: '2.5rem', opacity: 0.2, marginBottom: '10px' }} />
                      <div>No active integrations found</div>
                   </td>
                </tr>
              ) : (
                integrations.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className={styles.editBtn} style={{ width: '32px', height: '32px', background: '#1756AA', color: '#fff' }} onClick={() => handleEdit(item)}><FaEdit /></button>
                        <button className={styles.deleteBtn} style={{ width: '32px', height: '32px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FED7D7' }} onClick={() => setShowConfirmModal({ isOpen: true, id: item.id })}><FaTrash /></button>
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        maxWidth: '280px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        fontSize: '0.8rem', 
                        color: '#1756AA',
                        fontWeight: 600,
                        padding: '6px 12px',
                        background: '#F0F4FF',
                        borderRadius: '6px'
                      }}>
                        {item.url}
                      </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: '#0D1B3E', fontSize: '0.85rem' }}>{item.sender}</span>
                          <small style={{ color: '#718096', fontSize: '0.7rem' }}>Label: {item.senderText}</small>
                       </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <small style={{ fontSize: '0.75rem', color: '#4E6080' }}><b>{item.param1Text}:</b> {item.param1Val}</small>
                          <small style={{ fontSize: '0.75rem', color: '#4E6080' }}><b>{item.param2Text}:</b> {item.param2Val}</small>
                       </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#1E7E34', fontSize: '0.8rem' }}>{item.route}</span>
                          <small style={{ color: '#718096', fontSize: '0.7rem' }}>DLT: {item.dltText}</small>
                       </div>
                    </td>
                    <td><span className={styles.badge} style={{ background: '#EBF8FF', color: '#3182CE', fontSize: '0.65rem' }}>{item.integrationType}</span></td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                        <FaCalendarAlt style={{ marginRight: '5px', opacity: 0.5 }} /> {item.addDate}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ROW ── */}
        <div className={styles.paginationRow} style={{ 
          marginTop: '20px', 
          paddingTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid #F1F5F9',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '15px'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Showing {integrations.length} entries</span>
          <div className={styles.pagination} style={{ display: 'flex', gap: '6px' }}>
            <button className={styles.pageBtn} style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              background: '#fff', 
              color: '#A0AEC0', 
              cursor: 'not-allowed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem'
            }} disabled><FaChevronLeft /></button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`} style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: 'none', 
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
              color: '#fff', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.85rem',
              boxShadow: '0 3px 8px rgba(30, 58, 138, 0.2)'
            }}>1</button>
            <button className={styles.pageBtn} style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              background: '#fff', 
              color: '#A0AEC0', 
              cursor: 'not-allowed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem'
            }} disabled><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── 2-STEP INTEGRATION MODAL ── */}
      {showModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500 }}>
          <div className={styles.modalContainer} style={{ width: '700px', borderRadius: '16px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              padding: '12px 24px', 
              borderBottom: '1px solid #E2E8F0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'linear-gradient(to right, #F8FAFC, #FFFFFF)' 
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{
                   width: '36px',
                   height: '36px',
                   borderRadius: '10px',
                   background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: '#ffffff',
                   boxShadow: '0 4px 10px rgba(30, 58, 138, 0.15)'
                 }}>
                   <FaSms style={{ fontSize: '1.1rem' }} />
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                      {editingItem ? 'Edit Gateway' : 'Gateway Configuration'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                      {editingItem ? 'Modify existing API connection settings' : 'Complete steps to register gateway'}
                    </p>
                 </div>
               </div>
               <button 
                 onClick={resetForm}
                 style={{
                   width: '30px',
                   height: '30px',
                   borderRadius: '50%',
                   border: '1px solid #E2E8F0',
                   background: '#F8FAFC',
                   color: '#64748B',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease',
                   outline: 'none',
                   padding: 0
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.background = '#EF4444';
                   e.currentTarget.style.color = '#ffffff';
                   e.currentTarget.style.borderColor = '#EF4444';
                   e.currentTarget.style.transform = 'rotate(90deg)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.background = '#F8FAFC';
                   e.currentTarget.style.color = '#64748B';
                   e.currentTarget.style.borderColor = '#E2E8F0';
                   e.currentTarget.style.transform = 'none';
                 }}
               >
                 <FaTimes style={{ fontSize: '0.8rem' }} />
               </button>
            </div>

            {/* STEPPER PROGRESS BAR - Compact */}
            <div style={{ padding: '12px 0', background: '#FBFDFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', width: '250px', position: 'relative' }}>
                  {/* Line */}
                  <div style={{ position: 'absolute', top: '50%', left: '15%', right: '15%', height: '2px', background: currentStep === 2 ? '#1756AA' : '#E2E8F0', zIndex: 1 }}></div>
                  
                  {/* Step 1 */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                     <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: '#1756AA', color: '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: 700, fontSize: '0.85rem',
                        boxShadow: '0 4px 10px rgba(23, 86, 170, 0.2)'
                     }}>1</div>
                     <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1756AA' }}>API DETAILS</span>
                  </div>

                  {/* Step 2 */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                     <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: currentStep === 2 ? '#1756AA' : '#fff', 
                        color: currentStep === 2 ? '#fff' : '#A0AEC0', 
                        border: currentStep === 2 ? 'none' : '2px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: 700, fontSize: '0.85rem'
                     }}>{currentStep === 2 ? <FaCheck /> : '2'}</div>
                     <span style={{ fontSize: '0.65rem', fontWeight: 800, color: currentStep === 2 ? '#1756AA' : '#A0AEC0' }}>ROUTING</span>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className={styles.modalBody} style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
                 {currentStep === 1 && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className={styles.formGroup}>
                         <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '8px', display: 'block' }}>GATEWAY ENDPOINT URL</label>
                         <div style={{ position: 'relative' }}>
                            <FaLink style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#1756AA', opacity: 0.5 }} />
                            <input type="text" name="url" placeholder="http://api.gateway.com/send.php?..." className={styles.inputControl} style={{ height: '40px', paddingLeft: '40px', fontSize: '0.85rem' }} value={formData.url} onChange={handleInputChange} required />
                         </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>PARAM 1 KEY</label>
                           <input type="text" name="param1Text" placeholder="e.g. user" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.param1Text} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>PARAM 1 VALUE</label>
                           <input type="text" name="param1Val" placeholder="value" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.param1Val} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>PARAM 2 KEY</label>
                           <input type="text" name="param2Text" placeholder="e.g. key" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.param2Text} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>PARAM 2 VALUE</label>
                           <input type="text" name="param2Val" placeholder="value" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.param2Val} onChange={handleInputChange} />
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                         <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>API SERVICE TYPE</label>
                         <select name="integrationType" className={styles.selectControl} style={{ height: '40px', fontSize: '0.85rem' }} value={formData.integrationType} onChange={handleInputChange}>
                            <option value="SMS">Standard SMS Gateway</option>
                            <option value="WhatsApp">WhatsApp Business API</option>
                         </select>
                      </div>
                   </div>
                 )}

                 {currentStep === 2 && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>SENDER ID LABEL</label>
                           <input type="text" name="senderText" placeholder="e.g. senderid" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.senderText} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>SENDER ID VALUE</label>
                           <input type="text" name="sender" placeholder="e.g. SNTCH1" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.sender} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>ROUTE KEY</label>
                           <input type="text" name="routeText" placeholder="e.g. route" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.routeText} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>ROUTE VALUE</label>
                           <input type="text" name="route" placeholder="e.g. trans" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.route} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>MOBILE KEY</label>
                           <input type="text" name="mobile" placeholder="e.g. mobile" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.mobile} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                           <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>DLT/MSG KEY</label>
                           <input type="text" name="dltText" placeholder="e.g. message" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.dltText} onChange={handleInputChange} />
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                         <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4E6080', marginBottom: '6px', display: 'block' }}>COUNTRY SETTINGS</label>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <input type="text" name="countryText" placeholder="Label" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.countryText} onChange={handleInputChange} />
                            <input type="text" name="country" placeholder="Value" className={styles.inputControl} style={{ height: '38px', fontSize: '0.85rem' }} value={formData.country} onChange={handleInputChange} />
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className={styles.modalFooter} style={{ padding: '15px 30px', background: '#FBFDFF', borderTop: '1px solid #F1F5F9', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    {currentStep > 1 && (
                      <button type="button" className={styles.prevBtn} style={{ height: '40px', padding: '0 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={prevStep}>
                        <FaArrowLeft /> Previous
                      </button>
                    )}
                  </div>
                  
                  <div>
                    {currentStep === 1 ? (
                      <button type="button" className={styles.publishBtn} style={{ height: '40px', padding: '0 30px', fontSize: '0.9rem', gap: '8px' }} onClick={nextStep}>
                        Next Step <FaArrowRight />
                      </button>
                    ) : (
                      <button type="submit" className={styles.saveBtn} style={{ height: '40px', padding: '0 35px', fontSize: '0.95rem' }}>
                        <FaCheck /> Save Gateway
                      </button>
                    )}
                  </div>
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
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Integration</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this SMS Integration? This action cannot be undone.
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

export default SMSIntegration;
