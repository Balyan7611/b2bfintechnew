import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus, FaEdit, FaTrash, FaCopy, FaCheck, FaDatabase,
  FaFileExcel, FaFilePdf, FaFileCsv, FaPrint, FaSearch, FaChevronLeft, FaChevronRight, FaProjectDiagram, FaTimes, FaChevronDown
} from 'react-icons/fa';
import { API } from '../../../../api/endpoints';
import styles from '../../../../admin/components/MemberPages/MemberPages.module.css';

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: checked ? '#10B981' : '#EF4444', transition: '.3s', borderRadius: '34px'
      }}>
        <span style={{
          position: 'absolute', height: '14px', width: '14px', left: checked ? '23px' : '3px', bottom: '3px',
          backgroundColor: 'white', transition: '.3s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}></span>
      </span>
    </label>
  );
};

const WadhCell = ({ text }) => {
  const [copied, setCopied] = useState(false);

  if (!text) return <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>-</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '140px' }}>
      <div
        title={text}
        style={{
          fontSize: '0.7rem', fontFamily: 'monospace', color: '#475569',
          background: '#f1f5f9', padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          wordBreak: 'break-all', whiteSpace: 'normal', lineHeight: '1.2'
        }}
      >
        {text}
      </div>
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
        }}
      >
        {copied ? <FaCheck color="#10B981" /> : <FaCopy />}
      </button>
    </div>
  );
};

const SearchableSelect = ({ options = [], value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const opts = Array.isArray(options) ? options : [];
    const selected = opts.find(opt => opt.id === value);
    setSearchTerm(selected ? selected.name : '');
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        const opts = Array.isArray(options) ? options : [];
        const selected = opts.find(opt => opt.id === value);
        setSearchTerm(selected ? selected.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const opts = Array.isArray(options) ? options : [];
  const filteredOptions = opts.filter(opt =>
    opt.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 30px 10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', outline: 'none', background: '#fff', cursor: 'pointer' }}
      />
      <FaChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.8rem' }} />
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto', zIndex: 4000 }}>
          {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
            <div
              key={opt.id}
              style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#334155' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => {
                onChange(opt.id);
                setSearchTerm(opt.name);
                setIsOpen(false);
              }}
            >
              {opt.name}
            </div>
          )) : (
            <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#94a3b8' }}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const PipeModuleSettings = () => {
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id: 0,
    serviceId: 0,
    pipe: '',
    moduleName: '',
    isRequired: true,
    isOtp: true,
    isTpin: false,
    isface: false,
    isfinger: false,
    isIris: false,
    wadhFace: '',
    wadhFinger: '',
    wadhIris: ''
  });

  const [pipes, setPipes] = useState([]);

  const fetchServicesAndSettings = async () => {
    setLoading(true);
    try {
      const [sRes, settingsData, pipeData] = await Promise.all([
        API.service.getAll().catch(() => null),
        API.pipeModuleSetting.getAll().catch(() => []),
        API.pipeMaster.getAll().catch(() => [])
      ]);
      const servicesList = (sRes && sRes.status && Array.isArray(sRes.data)) ? sRes.data : [];
      setServices(servicesList);
      setData(settingsData || []);
      const pList = Array.isArray(pipeData) ? pipeData.map(p => ({ id: p.pipeName, name: p.pipeName })) : [];
      setPipes(pList);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndSettings();
  }, []);

  const toggleField = async (id, field) => {
    const record = data.find(item => item.id === id);
    if (!record) return;

    let updatedFields = {};
    if (field === 'isOtp') {
      const newOtp = !record.isOtp;
      updatedFields = { isOtp: newOtp, isTpin: !newOtp };
    } else if (field === 'isTpin') {
      const newTpin = !record.isTpin;
      updatedFields = { isTpin: newTpin, isOtp: !newTpin };
    } else {
      updatedFields = { [field]: !record[field] };
    }

    const updated = { ...record, ...updatedFields };

    try {
      await API.pipeModuleSetting.update(updated);
      setData(prev => prev.map(item => item.id === id ? updated : item));
    } catch (error) {
      console.error('Failed to update toggle field:', error);
    }
  };

  const handleFormToggle = (field) => {
    setFormData(prev => {
      if (field === 'isOtp') {
        const newOtp = !prev.isOtp;
        return {
          ...prev,
          isOtp: newOtp,
          isTpin: !newOtp
        };
      }
      if (field === 'isTpin') {
        const newTpin = !prev.isTpin;
        return {
          ...prev,
          isTpin: newTpin,
          isOtp: !newTpin
        };
      }
      return { ...prev, [field]: !prev[field] };
    });
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      serviceId: item.serviceId,
      pipe: item.pipe,
      moduleName: item.moduleName,
      isRequired: item.isRequired,
      isOtp: item.isOtp,
      isTpin: item.isTpin,
      isface: item.isface,
      isfinger: item.isfinger,
      isIris: item.isIris,
      wadhFace: item.wadhFace || '',
      wadhFinger: item.wadhFinger || '',
      wadhIris: item.wadhIris || ''
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      id: 0, serviceId: 0, pipe: '', moduleName: '',
      isRequired: true, isOtp: true, isTpin: false,
      isface: false, isfinger: false, isIris: false,
      wadhFace: '', wadhFinger: '', wadhIris: ''
    });
  };

  const handleDelete = async () => {
    if (showConfirmModal.id) {
      try {
        await API.pipeModuleSetting.delete(showConfirmModal.id);
        setData(prev => prev.filter(item => item.id !== showConfirmModal.id));
      } catch (error) {
        console.error('Failed to delete setting:', error);
      } finally {
        setShowConfirmModal({ isOpen: false, id: null });
      }
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmSubmit(false);
    try {
      if (editingId) {
        await API.pipeModuleSetting.update(formData);
      } else {
        await API.pipeModuleSetting.create(formData);
      }
      handleCloseModal();
      fetchServicesAndSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const filteredData = data.filter(item => {
    const serviceName = services.find(s => s.id === item.serviceId)?.name || '';
    return (
      serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pipe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.moduleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className={styles.container} style={{ padding: '10px 15px 200px 15px', maxWidth: '100%', minHeight: '100vh' }}>
      {/* ── MAIN LISTING CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden' }}>

        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(23, 86, 170, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', flexShrink: 0 }}>
              <FaProjectDiagram style={{ fontSize: '1.1rem' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pipe Module Settings</h3>
          </div>
          <button
            onClick={() => {
              setFormData({ id: 0, serviceId: 0, pipe: '', moduleName: '', isRequired: true, isOtp: true, isTpin: false, isface: false, isfinger: false, isIris: false, wadhFace: '', wadhFinger: '', wadhIris: '' });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <FaPlus /> <span>Add New</span>
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
              placeholder="Search pipe settings..."
              style={{ borderRadius: '10px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '1600px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px', color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>S.NO.</th>
                <th style={{ width: '90px', textAlign: 'center', color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>ACTION</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>SERVICE</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>PIPE</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>MODULE NAME</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem', textAlign: 'center' }}>IS REQUIRED</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem', textAlign: 'center' }}>IS OTP</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem', textAlign: 'center' }}>IS TPIN</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem', textAlign: 'center' }}>IS FACE</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem', textAlign: 'center' }}>IS FINGER</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem', textAlign: 'center' }}>IS IRIS</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>WADH FACE</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>WADH FINGER</th>
                <th style={{ color: '#fff', border: 'none', padding: '14px 16px', fontSize: '0.75rem' }}>WADH IRIS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No records found</td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const serviceName = services.find(s => s.id === item.serviceId)?.name || `Service #${item.serviceId}`;
                  return (
                    <tr key={item.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={{ color: '#A0AEC0', fontWeight: 700, padding: '12px 16px' }}>{index + 1}</td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleEdit(item)} className={styles.editBtn} style={{ width: '32px', height: '32px', background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Edit"><FaEdit /></button>
                          <button onClick={() => setShowConfirmModal({ isOpen: true, id: item.id })} className={styles.deleteBtn} style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.1)', color: '#E53E3E', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155', padding: '12px 16px' }}>{serviceName}</td>
                      <td style={{ color: '#475569', padding: '12px 16px' }}>{item.pipe}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(23, 86, 170, 0.08)', color: '#1756AA', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                          {item.moduleName}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}><ToggleSwitch checked={item.isRequired} onChange={() => toggleField(item.id, 'isRequired')} /></td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}><ToggleSwitch checked={item.isOtp} onChange={() => toggleField(item.id, 'isOtp')} /></td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}><ToggleSwitch checked={item.isTpin} onChange={() => toggleField(item.id, 'isTpin')} /></td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}><ToggleSwitch checked={item.isface} onChange={() => toggleField(item.id, 'isface')} /></td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}><ToggleSwitch checked={item.isfinger} onChange={() => toggleField(item.id, 'isfinger')} /></td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}><ToggleSwitch checked={item.isIris} onChange={() => toggleField(item.id, 'isIris')} /></td>
                      <td style={{ padding: '12px 16px' }}><WadhCell text={item.wadhFace} /></td>
                      <td style={{ padding: '12px 16px' }}><WadhCell text={item.wadhFinger} /></td>
                      <td style={{ padding: '12px 16px' }}><WadhCell text={item.wadhIris} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationRow} style={{ marginTop: '20px', padding: '15px 20px 25px 20px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>Showing {filteredData.length} records</span>
          <div className={styles.pagination} style={{ display: 'flex', gap: '6px' }}>
            <button className={styles.pageBtn} style={{ width: '32px', height: '32px' }} disabled><FaChevronLeft /></button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`} style={{ width: '32px', height: '32px' }}>1</button>
            <button className={styles.pageBtn} style={{ width: '32px', height: '32px' }} disabled><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── PREMIUM ADD/EDIT PIPE MODULE SETTINGS MODAL ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500 }}>
          <div className={styles.modalContainer} style={{ width: '800px', maxWidth: '95%', borderRadius: '16px', overflow: 'visible', background: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            {/* Modal Header */}
            <div className={styles.modalHeader} style={{ padding: '20px 25px 15px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(23, 86, 170, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                  <FaProjectDiagram style={{ fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E' }}>{editingId ? 'Edit Pipe Module Setting' : 'Add Pipe Module Setting'}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#718096' }}>{editingId ? 'Update configuration details' : 'Configure new pipe settings'}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8', padding: '5px' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody} style={{ padding: '20px 25px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', minHeight: '350px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Service <span style={{ color: '#ef4444' }}>*</span></label>
                  <SearchableSelect
                    options={services}
                    value={formData.serviceId}
                    onChange={(val) => setFormData({ ...formData, serviceId: val })}
                    placeholder="Search Service..."
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Pipe <span style={{ color: '#ef4444' }}>*</span></label>
                  <SearchableSelect
                    options={pipes}
                    value={formData.pipe}
                    onChange={(val) => setFormData({ ...formData, pipe: val })}
                    placeholder="Search Pipe..."
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Module Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Module Name (e.g. CUS_LOGIN)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', outline: 'none' }}
                    value={formData.moduleName} onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', background: '#f8fafc', padding: '15px 20px', borderRadius: '12px', border: '1px dashed #cbd5e1', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Is Required</span>
                  <ToggleSwitch checked={formData.isRequired} onChange={() => handleFormToggle('isRequired')} />
                </div>
                {formData.isRequired && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Is OTP</span>
                      <ToggleSwitch checked={formData.isOtp} onChange={() => handleFormToggle('isOtp')} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Is TPIN</span>
                      <ToggleSwitch checked={formData.isTpin} onChange={() => handleFormToggle('isTpin')} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Is Face</span>
                      <ToggleSwitch checked={formData.isface} onChange={() => handleFormToggle('isface')} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Is Finger</span>
                      <ToggleSwitch checked={formData.isfinger} onChange={() => handleFormToggle('isfinger')} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Is Iris</span>
                      <ToggleSwitch checked={formData.isIris} onChange={() => handleFormToggle('isIris')} />
                    </div>
                  </>
                )}
              </div>

              {formData.isRequired && (formData.isface || formData.isfinger || formData.isIris) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '-5px' }}>
                  {formData.isface && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>WADH Face</label>
                      <input
                        type="text"
                        placeholder="Enter WADH Face value"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#334155', outline: 'none', transition: 'all 0.2s ease', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                        value={formData.wadhFace} onChange={(e) => setFormData({ ...formData, wadhFace: e.target.value })}
                        onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                      />
                    </div>
                  )}

                  {formData.isfinger && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>WADH Finger</label>
                      <input
                        type="text"
                        placeholder="Enter WADH Finger value"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#334155', outline: 'none', transition: 'all 0.2s ease', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                        value={formData.wadhFinger} onChange={(e) => setFormData({ ...formData, wadhFinger: e.target.value })}
                        onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                      />
                    </div>
                  )}

                  {formData.isIris && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>WADH Iris</label>
                      <input
                        type="text"
                        placeholder="Enter WADH Iris value"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#334155', outline: 'none', transition: 'all 0.2s ease', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                        value={formData.wadhIris} onChange={(e) => setFormData({ ...formData, wadhIris: e.target.value })}
                        onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter} style={{ padding: '10px 20px', background: '#FBFDFF', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleCloseModal}
                style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Close
              </button>
              <button
                onClick={() => setShowConfirmSubmit(true)}
                style={{ background: 'linear-gradient(135deg, #1756AA 0%, #1e3a8a 100%)', color: '#fff', border: 'none', padding: '10px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(23,86,170,0.3)', transition: 'all 0.2s' }}
              >
                {editingId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SUBMIT MODAL */}
      {showConfirmSubmit && (
        <div className={styles.modalOverlay} style={{ zIndex: 3700 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#E0F2FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', marginBottom: '16px' }}>
                <FaCheck style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Confirm Save</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to save these pipe module settings?
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  style={{ flex: 1, padding: '10px', background: '#0ea5e9', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', marginBottom: '16px' }}>
                <FaTrash style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Record</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this pipe module setting? This action cannot be undone.
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

export default PipeModuleSettings;
