import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import {
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight,
  FiDatabase, FiX, FiLayers, FiImage
} from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';

/* ─── input style helper ─── */
const iStyle = {
  borderRadius: '10px', padding: '10px 14px',
  border: '1px solid #E2E8F0', background: '#F8FAFC',
  color: '#1E293B', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box'
};
const labelStyle = {
  fontSize: '0.72rem', fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'block'
};

const INIT_FORM = {
  id: null, name: '', url: '', price: '0', image: null, icon: '',
  sectionType: '', apiid: '1', userId: '1',
  isActive: true, isNew: false, isComming: false, onoff: true, isKyc: false,
  reason: '', onTime: '0', offTime: '0', orderBy: '0',
  isGst: false, gst: false, isTds: false, tds: '0',
};

const ServiceManagement = () => {
  const [localServices, setLocalServices]   = useState([]);
  const [sectionTypes, setSectionTypes]     = useState([]);  // from API
  const [isLoading, setIsLoading]           = useState(true);
  const [errorMsg, setErrorMsg]             = useState('');
  const [successMsg, setSuccessMsg]         = useState('');
  const [searchQuery, setSearchQuery]       = useState('');
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [formData, setFormData]             = useState(INIT_FORM);
  const [formSaving, setFormSaving]         = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null, name: '' });
  const [showImageModal, setShowImageModal] = useState({ isOpen: false, url: null });
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, service: null });
  const [toggleConfirmModal, setToggleConfirmModal] = useState({ isOpen: false, type: '', service: null });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Close action dropdown on outside click and scroll
  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, service: null } : prev);
      }
    };
    const handleScroll = () => {
      setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, service: null } : prev);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true); // true for capturing scroll on any container
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  /* ── toast helper ── */
  const toast = (msg, isError = false) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
    if (isError) setErrorMsg(msg); else setErrorMsg('');
  };

  /* ── 1. Load SectionTypes ── */
  const fetchSectionTypes = async () => {
    try {
      const res = await API.sectionType.getAll(true);
      console.log('SectionType API response:', res); // debug
      if (res && res.status === true && Array.isArray(res.data)) {
        setSectionTypes(res.data);
      } else {
        console.warn('SectionType empty or error:', res);
      }
    } catch (err) {
      console.error('SectionType fetch error:', err);
    }
  };

  /* ── 2. Load Services ── */
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await API.service.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        setLocalServices(res.data.map(item => ({
          ...item,
          price:    item.price != null ? parseFloat(item.price).toFixed(2) : '0.00',
          position: item.orderBy || 0,
          addDate:  item.createdDate
            ? new Date(item.createdDate).toLocaleDateString('en-GB')
            : 'N/A',
        })));
        setErrorMsg('');
      } else {
        setErrorMsg(res?.mess || 'Failed to fetch services.');
      }
    } catch (err) {
      setErrorMsg('Connection error while fetching services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionTypes();
    fetchServices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  /* ── 3. Toggle isActive ── */
  const handleToggleActive = async (service) => {
    const newVal = !service.isActive;
    // Optimistic update UI immediately
    setLocalServices(prev => prev.map(s =>
      s.id === service.id ? { ...s, isActive: newVal } : s
    ));
    try {
      // Pass full service object — service layer builds correct FormData
      const res = await API.service.toggleActive({ ...service, isActive: newVal });
      if (res && (res.status === true || res.code === 'TXN')) {
        toast(res.mess || `"${service.name}" ${newVal ? 'Activated' : 'Deactivated'}`);
      } else {
        throw new Error(res?.mess || 'Toggle failed');
      }
    } catch (err) {
      // Revert on error
      setLocalServices(prev => prev.map(s =>
        s.id === service.id ? { ...s, isActive: !newVal } : s
      ));
      toast(err.message || 'Failed to update status', true);
    }
  };

  /* ── 4. Toggle onoff ── */
  const handleToggleOnOff = async (service) => {
    const newVal = !service.onoff;
    setLocalServices(prev => prev.map(s =>
      s.id === service.id ? { ...s, onoff: newVal } : s
    ));
    try {
      const res = await API.service.toggleOnOff({ ...service, onoff: newVal });
      if (res && (res.status === true || res.code === 'TXN')) {
        toast(res.mess || `"${service.name}" turned ${newVal ? 'ON ✅' : 'OFF ❌'}`);
      } else {
        throw new Error(res?.mess || 'Toggle failed');
      }
    } catch (err) {
      setLocalServices(prev => prev.map(s =>
        s.id === service.id ? { ...s, onoff: !newVal } : s
      ));
      toast(err.message || 'Failed to update On/Off', true);
    }
  };

  /* ── 5. Open Add Modal ── */
  const handleAddClick = () => {
    setFormData(INIT_FORM);
    setIsModalOpen(true);
  };

  /* ── 6. Open Edit Modal ── */
  const handleEdit = (service) => {
    setFormData({
      id:        service.id,
      name:      service.name      || '',
      url:       service.url       || '',
      price:     service.price     || '0',
      image:     null,  // file input reset
      icon:      service.icon      || '',
      sectionType: String(service.sectionType || ''),
      apiid:     String(service.apiid || ''),
      isActive:  service.isActive  ?? true,
      isNew:     service.isNew     ?? false,
      isComming: service.isComming ?? false,
      onoff:     service.onoff     ?? true,
      reason:    service.reason    || '',
      onTime:    String(service.onTime  || '0'),
      offTime:   String(service.offTime || '0'),
      orderBy:   String(service.orderBy || '0'),
      isGst:     service.isGst     ?? false,
      gst:       service.gst       ?? false,
      isTds:     service.isTds     ?? false,
      tds:       String(service.tds || '0'),
    });
    setIsModalOpen(true);
  };

  /* ── 7. Input changes ── */
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /* ── 8. Save (Create / Update) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      // Pass formData object directly — service layer handles FormData building
      let res;
      if (formData.id) {
        res = await API.service.update(formData, formData.image || null);
      } else {
        res = await API.service.create(formData, formData.image || null);
      }

      if (res && (res.status === true || res.code === 'TXN')) {
        toast(res.mess || (formData.id ? 'Service updated! ✅' : 'Service created! ✅'));
        setIsModalOpen(false);
        fetchServices();
      } else {
        toast(res?.mess || 'Save failed. Check all fields.', true);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast(err.message || 'Error saving service. Check console.', true);
    } finally {
      setFormSaving(false);
    }
  };

  /* ── 9. Delete ── */
  const handleDelete = async () => {
    const { id, name } = showConfirmModal;
    setShowConfirmModal({ isOpen: false, id: null, name: '' });
    try {
      const res = await API.service.delete(id);
      if (res && res.status === true) {
        setLocalServices(prev => prev.filter(s => s.id !== id));
        toast(`Service "${name}" deleted`);
      } else {
        // fallback: remove locally
        setLocalServices(prev => prev.filter(s => s.id !== id));
        toast(`Service "${name}" removed`);
      }
    } catch {
      // Even if API fails, remove locally
      setLocalServices(prev => prev.filter(s => s.id !== id));
      toast(`Service "${name}" removed`);
    }
  };

  /* ── 10. Filtered list & Pagination ── */
  const filtered = localServices.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.sectionType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + rowsPerPage);

  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage]);

  /* ── Helper: sectionType name from id ── */
  const getSectionName = (id) => {
    const st = sectionTypes.find(s => s.id === Number(id));
    return st ? st.name : (id || '—');
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 60px 2px', maxWidth: '100%' }}>

      {/* ── Toast ── */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: errorMsg ? '#E53E3E' : '#10B981', color: '#fff',
          padding: '12px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {successMsg}
        </div>
      )}

      {/* ── MAIN CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 60px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Service Management</h3>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg,#10B981,#059669)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
            }}
            onClick={handleAddClick}
          >
            <FiPlus size={16} /> Add New Service
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '12px 20px 0', padding: '10px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TOOLBAR */}
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '10px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 8px', outline: 'none', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons
            headers={['Service Name', 'Section', 'URL', 'Price', 'Active', 'Position']}
            rows={filtered.map(s => [s.name, getSectionName(s.sectionType), s.url, s.price, s.isActive ? 'Yes' : 'No', s.position])}
            fileNamePrefix="service_report"
            sheetName="Services"
          />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <FiSearch color="#A0AEC0" />
            <input 
               type="text" 
               placeholder="Search services..." 
               style={{ fontSize: '0.85rem', border: 'none', outline: 'none', background: 'transparent', width: '100%' }} 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg,#0D1B5E,#1a2f8a)' }}>
                <th style={{ width: '60px', textAlign: 'center' }}>S.NO</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                <th style={{ textAlign: 'left' }}>Service Name</th>
                <th style={{ textAlign: 'left' }}>Section Type</th>
                <th style={{ textAlign: 'left' }}>Service URL</th>
                <th style={{ width: '90px', textAlign: 'left' }}>Price</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Image</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Order</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontWeight: 600 }}>
                    ⏳ Loading services...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FiDatabase size={28} style={{ opacity: 0.3 }} />
                      <span style={{ fontWeight: 600 }}>No services found</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.map((service, idx) => (
                <tr key={service.id} className={styles.hoverRow}>
                  {/* S.NO */}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#A0AEC0' }}>
                    {startIndex + idx + 1}
                  </td>
                  {/* Actions Column */}
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-dropdown-wrapper" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <button
                        className="action-dropdown-wrapper"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeActionRow.id === service.id) {
                            setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, service: null } : prev);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownHeight = 160;
                            const isUpward = (window.innerHeight - rect.bottom) < dropdownHeight;
                            
                            setActiveActionRow({ 
                              id: service.id, 
                              x: rect.right + 12, 
                              y: isUpward ? rect.bottom : rect.top, 
                              isUpward,
                              service 
                            });
                          }
                        }}
                        style={{ padding: '0 12px', height: '32px', borderRadius: '8px', background: activeActionRow.id === service.id ? '#D1FAE5' : '#10B981', color: activeActionRow.id === service.id ? '#059669' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s', boxShadow: activeActionRow.id === service.id ? 'none' : '0 2px 6px rgba(16,185,129,0.3)' }}
                        title="Actions"
                      >
                        Action <span style={{ fontSize: '1.1rem', marginTop: '-2px', fontWeight: 900 }}>⋮</span>
                      </button>
                    </div>
                  </td>
                  {/* Name */}
                  <td style={{ fontWeight: 600, color: '#334155' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>{service.name}</span>
                      {service.isNew && <span style={{ fontSize: '0.62rem', background: '#FEF3C7', color: '#D97706', padding: '1px 5px', borderRadius: '8px', fontWeight: 700, width: 'fit-content' }}>NEW</span>}
                    </div>
                  </td>
                  {/* Section */}
                  <td style={{ color: '#4E6080', fontSize: '0.85rem' }}>
                    {getSectionName(service.sectionType)}
                  </td>
                  {/* URL */}
                  <td style={{ color: '#4E6080', wordBreak: 'break-all', fontSize: '0.78rem' }}>
                    {service.url || <span style={{ color: '#CBD5E1' }}>—</span>}
                  </td>
                  {/* Price */}
                  <td style={{ fontWeight: 700, color: '#334155' }}>₹{service.price}</td>
                  {/* Image */}
                  <td style={{ textAlign: 'center' }}>
                    {service.image ? (
                      <img 
                        src={`https://api.sahayatamoney.in/UploadedFiles/services/${service.image}`} 
                        alt="Service" 
                        onClick={() => setShowImageModal({ isOpen: true, url: `https://api.sahayatamoney.in/UploadedFiles/services/${service.image}` })}
                        style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer', border: '1px solid #E2E8F0', padding: '2px', background: '#fff' }}
                        title="Click to view full image"
                      />
                    ) : (
                      <button
                        onClick={() => setShowImageModal({ isOpen: true, url: null })}
                        style={{ width: '36px', height: '36px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: 'none', color: '#3B82F6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      ><FiImage size={16} /></button>
                    )}
                  </td>
                  {/* Order */}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748B' }}>{service.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            <span className={styles.pageActive} style={{ 
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', background: '#1756AA', color: '#fff', fontSize: '0.9rem', fontWeight: 600
            }}>{currentPage}</span>
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTION DROPDOWN PORTAL (fixed position, never clipped) ── */}
      {activeActionRow.id && (
        <>
          <style>{`
            @keyframes dropdownFadeInSide {
              from { opacity: 0; transform: translateX(-10px) ${activeActionRow.isUpward ? 'translateY(10px)' : 'translateY(-10px)'}; }
              to   { opacity: 1; transform: translateX(0) translateY(0); }
            }
          `}</style>
          <div
            className="action-dropdown-wrapper"
            style={{ 
              position: 'fixed', 
              top: activeActionRow.isUpward ? 'auto' : activeActionRow.y, 
              bottom: activeActionRow.isUpward ? (window.innerHeight - activeActionRow.y) : 'auto',
              left: activeActionRow.x, 
              background: '#fff', 
              borderRadius: '12px', 
              boxShadow: '0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)', 
              border: '1px solid #E2E8F0', 
              zIndex: 9999, 
              minWidth: '180px', 
              overflow: 'hidden', 
              animation: 'dropdownFadeInSide 0.15s ease-out' 
            }}
          >
            <button
              onClick={() => { handleEdit(activeActionRow.service); setActiveActionRow({ id: null, x: 0, y: 0, service: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiEdit size={12} /></span>
              Edit
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setToggleConfirmModal({ isOpen: true, type: 'active', service: activeActionRow.service }); setActiveActionRow({ id: null, x: 0, y: 0, service: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                  <input type="checkbox" checked={activeActionRow.service.isActive === true} readOnly />
                  <span className={styles.slider}></span>
                </label>
              </div>
              Toggle Active
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setShowConfirmModal({ isOpen: true, id: activeActionRow.service.id, name: activeActionRow.service.name }); setActiveActionRow({ id: null, x: 0, y: 0, service: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#E53E3E', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiTrash2 size={12} /></span>
              Delete
            </button>
          </div>
        </>
      )}

      {/* ═══════════════ CONFIRM TOGGLE ═══════════════ */}
      {toggleConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: '16px', fontSize: '1.3rem' }}>
                <FiDatabase />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0D1B3E' }}>Confirm Status Change</h3>
              <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#718096', lineHeight: 1.5 }}>
                Are you sure you want to toggle the <strong>{toggleConfirmModal.type === 'active' ? 'Active Status' : 'On/Off Status'}</strong> for "{toggleConfirmModal.service?.name}"?
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button onClick={() => setToggleConfirmModal({ isOpen: false, type: '', service: null })} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => {
                  if (toggleConfirmModal.type === 'active') handleToggleActive(toggleConfirmModal.service);
                  else handleToggleOnOff(toggleConfirmModal.service);
                  setToggleConfirmModal({ isOpen: false, type: '', service: null });
                }} style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          ADD / EDIT MODAL DRAWER
      ═══════════════════════════════════════ */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()} style={{ width: '820px', maxWidth: '95%', background: '#fff' }}>

            {/* Drawer Header */}
            <div className={styles.drawerHeader} style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiLayers size={16} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  {formData.id ? 'Edit Service' : 'Add New Service'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <FiX size={14} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.drawerBody} style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* ROW 1: Name, URL, Price */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Service Name *</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} required style={iStyle} placeholder="e.g. Prepaid Recharge" />
                    </div>
                    <div>
                      <label style={labelStyle}>Service URL</label>
                      <input name="url" value={formData.url} onChange={handleInputChange} style={iStyle} placeholder="https://..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Price</label>
                      <input name="price" type="number" value={formData.price} onChange={handleInputChange} style={iStyle} min="0" step="0.01" />
                    </div>
                  </div>

                  {/* ROW 2: Image, Icon, SectionType (API), API ID, Order */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Image</label>
                      <input name="image" type="file" accept="image/*" onChange={handleInputChange} style={{ ...iStyle, padding: '8px' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Icon</label>
                      <input name="icon" value={formData.icon} onChange={handleInputChange} style={iStyle} placeholder="e.g. electricity-icon" />
                    </div>
                    <div>
                      <label style={labelStyle}>Section Type *</label>
                      <select name="sectionType" value={formData.sectionType} onChange={handleInputChange} style={iStyle}>
                        <option value="">-- Select Section Type --</option>
                        {sectionTypes.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>API ID</label>
                      <input name="apiid" value={formData.apiid} onChange={handleInputChange} style={iStyle} placeholder="1" type="number" />
                    </div>
                    <div>
                      <label style={labelStyle}>Order By</label>
                      <input name="orderBy" value={formData.orderBy} onChange={handleInputChange} style={iStyle} type="number" min="0" />
                    </div>
                  </div>

                  {/* ROW 3: Checkboxes */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Flags & Status</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px' }}>
                      {[
                        { key: 'isActive',  label: 'Active' },
                        { key: 'onoff',     label: 'On/Off Service' },
                        { key: 'isNew',     label: 'Mark as New' },
                        { key: 'isComming', label: 'Coming Soon' },
                        { key: 'isGst',     label: 'GST Apply' },
                        { key: 'gst',       label: 'GST Inclusive' },
                        { key: 'isTds',     label: 'TDS Apply' },
                      ].map(({ key, label }) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', fontWeight: 600, cursor: 'pointer', padding: '8px 10px', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleInputChange} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ROW 4: Times & TDS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>On Time (Hour)</label>
                      <input name="onTime" type="number" value={formData.onTime} onChange={handleInputChange} style={iStyle} min="0" max="23" />
                    </div>
                    <div>
                      <label style={labelStyle}>Off Time (Hour)</label>
                      <input name="offTime" type="number" value={formData.offTime} onChange={handleInputChange} style={iStyle} min="0" max="23" />
                    </div>
                    <div>
                      <label style={labelStyle}>TDS Value (%)</label>
                      <input name="tds" type="number" value={formData.tds} onChange={handleInputChange} style={iStyle} min="0" step="0.01" />
                    </div>
                    <div>
                      <label style={labelStyle}>Reason</label>
                      <input name="reason" value={formData.reason} onChange={handleInputChange} style={iStyle} placeholder="Optional" />
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="submit"
                    disabled={formSaving}
                    style={{ padding: '11px 28px', background: formSaving ? '#94A3B8' : 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: formSaving ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                  >
                    {formSaving ? 'Saving...' : (formData.id ? 'Update Service' : 'Create Service')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: '11px 20px', background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CONFIRM DELETE ═══════════════ */}
      {showConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', marginBottom: '16px', fontSize: '1.3rem' }}>
                <FiTrash2 />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Service</h3>
              <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#718096', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>"{showConfirmModal.name}"</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button onClick={() => setShowConfirmModal({ isOpen: false, id: null, name: '' })} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#E53E3E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ IMAGE PREVIEW ═══════════════ */}
      {showImageModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }} onClick={() => setShowImageModal({ isOpen: false, url: null })}>
          <div className={styles.modalContainer} style={{ width: '420px', borderRadius: '16px', padding: '20px', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowImageModal({ isOpen: false, url: null })} style={{ position: 'absolute', top: '14px', right: '14px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <FiX />
            </button>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#0D1B3E' }}>Service Image</h3>
            {showImageModal.url ? (
              <div style={{ width: '100%', height: '240px', borderRadius: '12px', background: '#F8FAFC', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={showImageModal.url} alt="Service" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ height: '200px', borderRadius: '12px', background: '#F8FAFC', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                <FiImage size={40} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <span style={{ fontWeight: 600 }}>No Image Available</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceManagement;
