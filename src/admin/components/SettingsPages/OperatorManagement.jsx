import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiSettings, FiActivity, FiZap, FiRefreshCw, FiImage, FiList, FiDownload
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint } from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import styles from '../MemberPages/MemberPages.module.css';
import { getImageUrl } from '../../../config/siteConfig';

const OperatorManagement = () => {
  const dispatch = useDispatch();
  const { operators = [] } = useSelector(state => state.settings || {});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localOperators, setLocalOperators] = useState([]);
  const [allOperators, setAllOperators] = useState([]);
  const [services, setServices] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Image Viewer Modal State
  const [showImageModal, setShowImageModal] = useState({ isOpen: false, url: '' });

  const handleDownloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = url.substring(url.lastIndexOf('/') + 1) || 'operator_logo.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      window.open(url, '_blank');
    }
  };

  const fetchServices = async () => {
    try {
      const res = await API.service.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch (err) { console.error("Error fetching services", err); }
  };

  const fetchAllOperators = async () => {
    try {
      const res = await API.operator.getAll({ pageNumber: 1, pageSize: 10000 });
      if (res && res.status === true && res.data && res.data.items) {
        setAllOperators(res.data.items);
      }
    } catch (err) { console.error("Error fetching all operators", err); }
  };

  const fetchBbpsFields = async () => {
    try {
      const res = await API.bbpsDataDown.getAll();
      if (res && res.status === true && res.data && res.data.items) {
        setBbpsFields(res.data.items);
      }
    } catch (err) { console.error("Error fetching BBPS fields", err); }
  };

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      const res = await API.operator.getAll({
        pageNumber,
        pageSize
      });
      if (res && res.status === true && res.data) {
        const items = res.data.items || [];
        setTotalItems(res.data.totalItems || items.length);
        setLocalOperators(items.map(item => ({
          id: item.id,
          name: item.name,
          code: item.operatorCode,
          service: item.serviceName || (item.serviceId === 1 ? 'Prepaid' : item.serviceId === 2 ? 'Postpaid' : 'DTH'),
          status: item.isActive,
          addDate: item.addDate ? new Date(item.addDate).toLocaleDateString('en-GB') : '27/03/2025',
          logo: item.img ? getImageUrl(item.img, 'operators') : '',
          minValue: item.minVal !== undefined ? item.minVal.toString() : '0',
          maxValue: item.maxVal !== undefined ? item.maxVal.toString() : '0',
          downOperator: item.isOffLine,
          ...item
        })));
        setErrorMsg('');
      } else {
        setErrorMsg('Failed to fetch operators from API.');
      }
    } catch (err) {
      console.error("Error fetching operators:", err);
      setErrorMsg('Failed to connect to the operator API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchAllOperators();
    fetchBbpsFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  const [formData, setFormData] = useState({
    id: '', name: '', code: '', service: '', minValue: '0', maxValue: '0', logo: '', status: false, downOperator: false
  });

  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, op: null });

  // Close action dropdown on outside click and scroll
  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, op: null } : prev);
      }
    };
    const handleScroll = () => {
      setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, op: null } : prev);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // ── ADD FIELD BBPS MODAL ──
  const [addFieldModal, setAddFieldModal] = useState({ isOpen: false, operator: null });
  const [fieldForm, setFieldForm] = useState({ id: 0, spKey: '', index: '0', labels: '', fieldMinLen: 0, fieldMaxLen: 0, isOptional: false, values: '' });
  const [bbpsFields, setBbpsFields] = useState([]);
  const [editingFieldId, setEditingFieldId] = useState(null);

  const handleOpenAddField = (op) => {
    setFieldForm({ 
      id: 0, 
      spKey: op.code || '', 
      index: '0', 
      labels: '', 
      fieldMinLen: 0, 
      fieldMaxLen: 0, 
      isOptional: false, 
      values: op.service || '' 
    });
    setEditingFieldId(null);
    setAddFieldModal({ isOpen: true, operator: op });
  };

  const handleFieldFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFieldForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    if (!fieldForm.labels) return;
    
    try {
      const payload = {
        id: fieldForm.id ? Number(fieldForm.id) : 0,
        spKey: fieldForm.spKey || '',
        index: fieldForm.index || '0',
        labels: fieldForm.labels || '',
        fieldMinLen: Number(fieldForm.fieldMinLen) || 0,
        fieldMaxLen: Number(fieldForm.fieldMaxLen) || 0,
        isOptional: fieldForm.isOptional || false,
        values: fieldForm.values || ''
      };
      
      let res;
      if (payload.id && payload.id !== 0) {
        res = await API.bbpsDataDown.update(payload);
      } else {
        res = await API.bbpsDataDown.create(payload);
      }
      
      if (res && res.status === true) {
        fetchBbpsFields();
        setFieldForm(prev => ({
          id: 0,
          spKey: prev.spKey,
          index: (Number(prev.index) + 1).toString(),
          labels: '',
          fieldMinLen: 0,
          fieldMaxLen: 0,
          isOptional: false,
          values: prev.values
        }));
        setEditingFieldId(null);
      }
    } catch (err) {
      console.error("Error submitting BBPS field:", err);
    }
  };

  const handleFieldDelete = async (id) => {
    try {
      const res = await API.bbpsDataDown.delete(id);
      if (res && res.status === true) {
        fetchBbpsFields();
      }
    } catch (err) {
      console.error("Error deleting BBPS field:", err);
    }
  };

  const handleDelete = () => {
    // Delete operator is kept local since there is no API endpoint for deletion in instructions
    setLocalOperators(localOperators.filter(op => op.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClick = () => {
    setFormData({ 
      id: '', 
      name: '', 
      code: '', 
      serviceId: '', 
      minValue: '0', 
      maxValue: '0', 
      commission: '0', 
      logo: '', 
      status: true, 
      downOperator: false 
    });
    setLogoPreview('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (operator) => {
    setFormData({
      id: operator.id,
      name: operator.name,
      code: operator.code,
      serviceId: operator.serviceId || '',
      minValue: operator.minValue || '0',
      maxValue: operator.maxValue || '0',
      commission: operator.commission || '0',
      logo: operator.logo || '',
      status: operator.status || false,
      downOperator: operator.downOperator || false
    });
    setLogoPreview(operator.logo || '');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (operator) => {
    try {
      const formPayload = new FormData();
      formPayload.append('Id', operator.id.toString());
      formPayload.append('ServiceId', operator.serviceId.toString());
      formPayload.append('OperatorCode', operator.code);
      formPayload.append('Name', operator.name);
      formPayload.append('MinVal', operator.minValue ? operator.minValue.toString() : '0');
      formPayload.append('MaxVal', operator.maxValue ? operator.maxValue.toString() : '0');
      formPayload.append('Commission', operator.commission ? operator.commission.toString() : '0');
      formPayload.append('IsActive', (!operator.status).toString());
      formPayload.append('IsPending', operator.isPending ? 'true' : 'false');
      formPayload.append('IsOffLine', operator.downOperator ? 'true' : 'false');
      
      const res = await API.operator.update(formPayload);
      if (res && res.status === true) {
        fetchOperators();
      }
    } catch (err) {
      console.error("Error toggling operator status:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('Id', formData.id && !isNaN(formData.id) ? formData.id.toString() : '0');
      formPayload.append('ServiceId', formData.serviceId ? formData.serviceId.toString() : '0');
      formPayload.append('OperatorCode', formData.code);
      formPayload.append('Name', formData.name);
      
      if (selectedFile) {
        formPayload.append('File', selectedFile);
      }
      
      formPayload.append('MinVal', formData.minValue ? formData.minValue.toString() : '0');
      formPayload.append('MaxVal', formData.maxValue ? formData.maxValue.toString() : '0');
      formPayload.append('Commission', formData.commission ? formData.commission.toString() : '0');
      formPayload.append('IsActive', formData.status ? 'true' : 'false');
      formPayload.append('IsPending', 'false');
      formPayload.append('IsOffLine', formData.downOperator ? 'true' : 'false');

      let res;
      if (formData.id && !isNaN(formData.id) && parseInt(formData.id) > 0) {
        res = await API.operator.update(formPayload);
      } else {
        res = await API.operator.create(formPayload);
      }

      if (res && res.status === true) {
        fetchOperators();
        setIsModalOpen(false);
        setSelectedFile(null);
        setLogoPreview('');
      } else {
        setErrorMsg(res?.mess || 'Failed to save operator.');
      }
    } catch (err) {
      console.error("Error saving operator:", err);
      setErrorMsg('Failed to connect to the operator API.');
    }
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 60px 2px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 60px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Operator Management</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <PrimaryButton className={styles.addBtn} onClick={handleAddClick} style={{ height: '38px', minWidth: 'auto' }}>
              <FiPlus /> <span>Add Operator</span>
            </PrimaryButton>
          </div>
        </div>

        {errorMsg && (
          <div style={{ margin: '15px 20px 0 20px', padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '10px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 8px', outline: 'none', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons 
            headers={['S.NO', 'OPERATOR NAME', 'CODE', 'SERVICE', 'STATUS', 'ADD DATE']}
            rows={localOperators.map((op, idx) => [
              (pageNumber - 1) * pageSize + idx + 1, op.name, op.code, op.service, op.status ? 'ACTIVE' : 'INACTIVE', op.addDate
            ])}
            fileNamePrefix="operator_report"
            sheetName="Operators"
          />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <FiSearch color="#A0AEC0" />
            <input 
               type="text" 
               placeholder="Search operators..." 
               style={{ fontSize: '0.85rem', border: 'none', outline: 'none', background: 'transparent', width: '100%' }} 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1); }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.NO</th>
                <th style={{ width: '120px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '200px' }}>OPERATOR DETAILS</th>
                <th style={{ width: '150px', textAlign: 'center' }}>CODE</th>
                <th style={{ width: '200px', textAlign: 'center' }}>SERVICE</th>
                <th style={{ width: '120px', textAlign: 'center' }}>STATUS</th>
                <th style={{ width: '150px', textAlign: 'right', paddingRight: '25px' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {localOperators.filter(op => 
                op.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                op.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                op.service?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((op, idx) => (
                <tr key={op.id} className={styles.hoverRow}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{(pageNumber - 1) * pageSize + idx + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-dropdown-wrapper" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <button
                        className="action-dropdown-wrapper"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeActionRow.id === op.id) {
                            setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, op: null } : prev);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownHeight = 160;
                            const isUpward = (window.innerHeight - rect.bottom) < dropdownHeight;
                            
                            setActiveActionRow({ 
                              id: op.id, 
                              x: rect.right + 12, 
                              y: isUpward ? rect.bottom : rect.top, 
                              isUpward,
                              op 
                            });
                          }
                        }}
                        style={{ padding: '0 12px', height: '32px', borderRadius: '8px', background: activeActionRow.id === op.id ? '#D1FAE5' : '#10B981', color: activeActionRow.id === op.id ? '#059669' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s', boxShadow: activeActionRow.id === op.id ? 'none' : '0 2px 6px rgba(16,185,129,0.3)' }}
                        title="Actions"
                      >
                        Action <span style={{ fontSize: '1.1rem', marginTop: '-2px', fontWeight: 900 }}>⋮</span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div 
                         onClick={() => op.logo && setShowImageModal({ isOpen: true, url: op.logo })}
                         style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', overflow: 'hidden', cursor: op.logo ? 'pointer' : 'default' }}
                         title={op.logo ? "Click to view image" : ""}
                       >
                          {op.logo ? <img src={op.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiImage size={18} />}
                       </div>
                       <span style={{ color: '#1E293B', fontSize: '0.95rem', fontWeight: 800 }}>{op.name}</span></div></td>
                  <td style={{ textAlign: 'center' }}>
                     <span style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                       {op.code}
                     </span>
                  </td>
                  <td style={{ textAlign: 'center', color: '#475569', fontWeight: 700 }}>{op.service}</td>
                  <td style={{ textAlign: 'center' }}>
                     <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                        <input type="checkbox" checked={op.status} onChange={() => handleToggleStatus(op)} />
                        <span className={styles.slider}></span>
                     </label>
                  </td>
                  <td style={{ textAlign: 'right', color: '#94A3B8', fontWeight: 700, fontSize: '0.85rem', paddingRight: '25px' }}>{op.addDate}</td>
                </tr>
              ))}
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading data...</span>
                  </td>
                </tr>
              ) : localOperators.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
                    
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span></td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {totalItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1} to{' '}
            {Math.min(pageNumber * pageSize, totalItems)} of {totalItems} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', cursor: pageNumber <= 1 || isLoading ? 'not-allowed' : 'pointer', opacity: pageNumber <= 1 || isLoading ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1 || isLoading}
            >
              <FiChevronLeft />
            </button>
            {(() => {
              const pages = [];
              const totalPageNumber = Math.ceil(totalItems / pageSize);
              if (totalPageNumber === 0) return null;
              const delta = 2;
              const left = Math.max(2, pageNumber - delta);
              const right = Math.min(totalPageNumber - 1, pageNumber + delta);
              pages.push(1);
              if (left > 2) pages.push('...');
              for (let i = left; i <= right; i++) pages.push(i);
              if (right < totalPageNumber - 1) pages.push('...');
              if (totalPageNumber > 1) pages.push(totalPageNumber);

              return pages.map((p, idx) => p === '...' ? (
                <span key={`ell-${idx}`} style={{ width: '36px', textAlign: 'center', color: '#A0AEC0', fontSize: '0.9rem' }}>...</span>
              ) : (
                <button
                  key={p}
                  className={p === pageNumber ? styles.pageActive : styles.pageBtn}
                  onClick={() => setPageNumber(p)}
                  disabled={isLoading}
                  style={{
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                    background: p === pageNumber ? '#1756AA' : '#fff', 
                    color: p === pageNumber ? '#fff' : '#475569',
                    border: p === pageNumber ? 'none' : '1px solid #E2E8F0', cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ));
            })()}
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', cursor: pageNumber >= Math.ceil(totalItems / pageSize) || isLoading ? 'not-allowed' : 'pointer', opacity: pageNumber >= Math.ceil(totalItems / pageSize) || isLoading ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={() => setPageNumber(p => Math.min(Math.ceil(totalItems / pageSize), p + 1))}
              disabled={pageNumber >= Math.ceil(totalItems / pageSize) || isLoading}
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
            @keyframes dropdownFadeInSideOperator {
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
              minWidth: '168px', 
              overflow: 'hidden', 
              animation: 'dropdownFadeInSideOperator 0.15s ease-out' 
            }}
          >
            <button
              onClick={() => { handleEdit(activeActionRow.op); setActiveActionRow({ id: null, x: 0, y: 0, op: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiEdit size={12} /></span>
              Edit
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { handleOpenAddField(activeActionRow.op); setActiveActionRow({ id: null, x: 0, y: 0, op: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiList size={12} /></span>
              Add Field BBPS
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setShowConfirmModal({ isOpen: true, id: activeActionRow.id }); setActiveActionRow({ id: null, x: 0, y: 0, op: null }); }}
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

      {/* ── ADD/EDIT MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} style={{ backdropFilter: 'blur(5px)' }} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff', borderRadius: '20px 0 0 20px', boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.08)', borderLeft: '1px solid #E2E8F0' }}>
            <div className={styles.drawerHeader} style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <FiSettings size={16} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A', fontWeight: 800 }}>{formData.id ? 'Operator Details Update' : 'Operator Details'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={14} />
              </button>
            </div>
            
            <div className={styles.drawerBody} style={{ padding: '25px', overflowY: 'auto' }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>OperatorName :</label>
                      <input type="text" name="name" className={styles.inputControl} value={formData.name} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>OperatorCode :</label>
                      <input type="text" name="code" className={styles.inputControl} value={formData.code} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Service :</label>
                      <select name="serviceId" className={styles.inputControl} value={formData.serviceId} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }}>
                        <option value="">Select Service</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Logo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '42px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                           {logoPreview ? <img src={logoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiImage style={{ color: '#94A3B8' }} />}
                        </div>
                        <input 
                          type="file" 
                          name="logo" 
                          onChange={handleFileChange}
                          className={styles.inputControl} 
                          style={{ borderRadius: '8px', padding: '7px 10px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', flex: 1 }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Min Value :</label>
                      <input type="number" name="minValue" className={styles.inputControl} value={formData.minValue} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Max Value :</label>
                      <input type="number" name="maxValue" className={styles.inputControl} value={formData.maxValue} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Commission :</label>
                      <input type="number" name="commission" className={styles.inputControl} value={formData.commission || '0'} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Active :</label>
                      <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', height: '42px' }}>
                        <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Down Opeator :</label>
                      <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', height: '42px' }}>
                        <input type="checkbox" name="downOperator" checked={formData.downOperator} onChange={handleInputChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '30px' }}>
                  <PrimaryButton type="submit">
                    Submit
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showConfirmModal.isOpen && (
        <div className={styles.drawerOverlay} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowConfirmModal({ isOpen: false, id: null })}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '360px', padding: '30px 25px', textAlign: 'center', borderRadius: '16px', background: '#fff', transform: 'none', position: 'relative', height: 'auto', minHeight: 'auto' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <FiTrash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>Delete Operator?</h3>
            <p style={{ margin: '0 0 25px 0', color: '#64748B', fontSize: '0.9rem', lineHeight: '1.5' }}>Are you sure you want to delete this operator? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowConfirmModal({ isOpen: false, id: null })} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontWeight: 700, cursor: 'pointer', flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#E53E3E', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)', flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD FIELD BBPS POPUP MODAL ── */}
      {addFieldModal.isOpen && (
        <div
          onClick={() => setAddFieldModal({ isOpen: false, operator: null })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'modalSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <style>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: scale(0.92) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>

            {/* MODAL HEADER */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(23, 86, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                  <FiList size={16} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Add Field BBPS
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, paddingLeft: '10px', borderLeft: '1.5px solid #CBD5E1' }}>
                    Operator: <strong style={{ color: '#0F172A' }}>{addFieldModal.operator?.name}</strong>
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setAddFieldModal({ isOpen: false, operator: null })}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#F1F5F9', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              <form id="addFieldForm" onSubmit={handleFieldSubmit}>
                
                {/* Row 1: Service + Operator Code + Label (3 Columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Service :</label>
                    <select
                      name="values"
                      value={fieldForm.values}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    >
                      <option value="">Select Service</option>
                      {services.map(ser => (
                        <option key={ser.id} value={ser.name}>{ser.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Operator Code :</label>
                    <select
                      name="spKey"
                      value={fieldForm.spKey}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    >
                      <option value="">Select Operator</option>
                      {allOperators.map(op => (
                        <option key={op.id} value={op.operatorCode}>{op.name} ({op.operatorCode})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Label :</label>
                    <input
                      type="text"
                      name="labels"
                      value={fieldForm.labels}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 12px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    />
                  </div>
                </div>

                {/* Row 3: Index + Min Length + Max Length + Save Button (4 Columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Index :</label>
                    <input
                      type="number"
                      name="index"
                      value={fieldForm.index}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Min Length :</label>
                    <input
                      type="number"
                      name="fieldMinLen"
                      value={fieldForm.fieldMinLen}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Max Length :</label>
                    <input
                      type="number"
                      name="fieldMaxLen"
                      value={fieldForm.fieldMaxLen}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <PrimaryButton type="submit" style={{ height: '34px', fontSize: '0.8rem' }}>
                      <FiCheck size={14} />
                      Save
                    </PrimaryButton>
                  </div>
                </div>

                {/* Field List Table */}
                <div className={styles.tableWrapper} style={{ marginTop: '10px', minHeight: '160px' }}>
                  <table className={styles.table} style={{ minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                        <th style={{ width: '150px', padding: '8px 10px', fontSize: '0.75rem' }}>OPERATOR NAME</th>
                        <th style={{ width: '150px', padding: '8px 10px', fontSize: '0.75rem' }}>SERVICE NAME</th>
                        <th style={{ width: '150px', padding: '8px 10px', fontSize: '0.75rem' }}>LABEL</th>
                        <th style={{ width: '120px', padding: '8px 10px', fontSize: '0.75rem' }}>MIN LENGTH</th>
                        <th style={{ width: '120px', padding: '8px 10px', fontSize: '0.75rem' }}>MAX LENGTH</th>
                        <th style={{ width: '80px', textAlign: 'center', padding: '8px 10px', fontSize: '0.75rem' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bbpsFields.filter(f => f.spKey === addFieldModal.operator?.code).map((f) => (
                        <tr key={f.id}>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{addFieldModal.operator?.name}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{f.values}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 700 }}>{f.labels}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{f.fieldMinLen}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{f.fieldMaxLen}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <button 
                                type="button"
                                onClick={() => {
                                  setFieldForm(f);
                                  setEditingFieldId(f.id);
                                }}
                                style={{ border: 'none', background: 'transparent', color: '#3B82F6', cursor: 'pointer', padding: '4px' }}
                                title="Edit Field"
                              >
                                <FiEdit />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleFieldDelete(f.id)}
                                style={{ border: 'none', background: 'transparent', color: '#E53E3E', cursor: 'pointer', padding: '4px' }}
                                title="Delete Field"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bbpsFields.filter(f => f.spKey === addFieldModal.operator?.code).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '30px 0', textAlign: 'center', color: '#94A3B8' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No fields available for this operator</span>
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </form>
            </div>

            {/* FOOTER REMOVED AS REQUESTED */}
          </div>
        </div>
      )}
      {/* ── IMAGE VIEWER MODAL ── */}
      {showImageModal.isOpen && (
        <div 
          onClick={() => setShowImageModal({ isOpen: false, url: '' })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', padding: '20px', width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', animation: 'modalSlideIn 0.2s ease-out' }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '10px', marginBottom: '15px' }}>
              <button 
                onClick={() => handleDownloadImage(showImageModal.url)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#F1F5F9', color: '#1E293B', cursor: 'pointer' }}
                title="Download logo"
              >
                <FiDownload size={16} />
              </button>
              <button 
                onClick={() => setShowImageModal({ isOpen: false, url: '' })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#F1F5F9', color: '#64748B', cursor: 'pointer' }}
              >
                <FiX size={16} />
              </button>
            </div>
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '12px', padding: '10px', boxSizing: 'border-box' }}>
              <img src={showImageModal.url} alt="Operator Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorManagement;
