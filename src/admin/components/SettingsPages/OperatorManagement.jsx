import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiSettings, FiActivity, FiZap, FiRefreshCw, FiImage, FiList
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint } from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';

const OperatorManagement = () => {
  const dispatch = useDispatch();
  const { operators = [] } = useSelector(state => state.settings || {});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localOperators, setLocalOperators] = useState([]);
  const [services, setServices] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await API.service.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch (err) { console.error("Error fetching services", err); }
  };

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      const res = await API.operator.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        setLocalOperators(res.data.map(item => ({
          id: item.id,
          name: item.name,
          code: item.operatorCode,
          service: item.serviceId === 1 ? 'Prepaid' : item.serviceId === 2 ? 'Postpaid' : 'DTH',
          status: item.isActive,
          addDate: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : '27/03/2025',
          logo: item.image || '',
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
    fetchOperators();
    fetchServices();
  }, []);

  const [formData, setFormData] = useState({
    id: '', name: '', code: '', service: '', minValue: '0', maxValue: '0', logo: '', status: false, downOperator: false
  });

  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });

  // ── ADD FIELD BBPS MODAL ──
  const [addFieldModal, setAddFieldModal] = useState({ isOpen: false, operator: null });
  const [fieldForm, setFieldForm] = useState({ service: '', operatorCode: '', operatorCodeText: '', index: '0', label: '', minLength: '0', maxLength: '0' });
  const [bbpsFields, setBbpsFields] = useState([]);
  const [editingFieldId, setEditingFieldId] = useState(null);

  const handleOpenAddField = (op) => {
    setFieldForm({ service: op.service || '', operatorCode: op.code, operatorCodeText: op.code, index: '0', label: '', minLength: '0', maxLength: '0' });
    setEditingFieldId(null);
    setAddFieldModal({ isOpen: true, operator: op });
  };

  const handleFieldFormChange = (e) => {
    const { name, value } = e.target;
    setFieldForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldSubmit = (e) => {
    e.preventDefault();
    if (!fieldForm.label) return;
    
    if (editingFieldId) {
      setBbpsFields(bbpsFields.map(f => f.id === editingFieldId ? { ...fieldForm, id: editingFieldId } : f));
      setEditingFieldId(null);
    } else {
      const newField = { ...fieldForm, id: Date.now() };
      setBbpsFields([...bbpsFields, newField]);
    }
    setFieldForm({ ...fieldForm, index: (Number(fieldForm.index) + 1).toString(), label: '', minLength: '0', maxLength: '0' });
  };

  const handleDelete = () => {
    // Delete operator is not present in OpenAPI, keep it local
    setLocalOperators(localOperators.filter(op => op.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddClick = () => {
    setFormData({ id: '', name: '', code: '', serviceId: '', minValue: '0', maxValue: '0', logo: '', status: false, downOperator: false });
    setIsModalOpen(true);
  };

  const handleEdit = (operator) => {
    setFormData({ ...formData, ...operator, serviceId: operator.serviceId || operator.service });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: formData.id && !isNaN(formData.id) ? parseInt(formData.id) : 0,
        serviceId: parseInt(formData.serviceId) || 0,
        operatorCode: formData.code,
        name: formData.name,
        minVal: parseFloat(formData.minValue) || 0,
        maxVal: parseFloat(formData.maxValue) || 0,
        commission: parseFloat(formData.commission) || 0,
        isActive: formData.status,
        isPending: false,
        isOffLine: formData.downOperator
      };
      
      // Update is the only endpoint in Operator OpenAPI spec
      if (formData.id && !isNaN(formData.id)) {
        await API.operator.update(payload);
      }
      fetchOperators();
    } catch (err) {
      console.error("Error saving operator:", err);
      // Fallback local logic
      if (formData.id) {
        setLocalOperators(localOperators.map(op => op.id === formData.id ? { ...op, ...formData } : op));
      } else {
        const newOperator = { 
          ...formData, 
          id: Date.now(), 
          addDate: new Date().toLocaleDateString('en-GB') 
        };
        setLocalOperators([newOperator, ...localOperators]);
      }
    } finally {
      setIsModalOpen(false);
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
            <button className={styles.addBtn} onClick={handleAddClick} style={{ height: '38px', padding: '0 18px', fontSize: '0.85rem', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: '#fff', border: 'none', minWidth: 'auto', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              <FiPlus /> <span>Add Operator</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ margin: '15px 20px 0 20px', padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

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

          <ExportButtons 
            headers={['S.NO', 'OPERATOR NAME', 'CODE', 'SERVICE', 'STATUS', 'ADD DATE']}
            rows={localOperators.map((op, idx) => [
              idx + 1, op.name, op.code, op.service, op.status ? 'ACTIVE' : 'INACTIVE', op.addDate
            ])}
            fileNamePrefix="operator_report"
            sheetName="Operators"
          />

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search operators..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1100px' }}>
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
              {localOperators.map((op, idx) => (
                <tr key={op.id} className={styles.hoverRow}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                     <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className={styles.editBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', color: '#3B82F6', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => handleEdit(op)} title="Edit Operator"><FiEdit /></button>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleOpenAddField(op)} title="Add Field BBPS"><FiList size={15} /></button>
                        <button className={styles.deleteBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FED7D7', cursor: 'pointer' }} title="Delete Operator" onClick={() => setShowConfirmModal({ isOpen: true, id: op.id })}><FiTrash2 /></button>
                     </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', overflow: 'hidden' }}>
                          {op.logo ? <img src={op.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiImage size={18} />}
                       </div>
                       <span style={{ color: '#1E293B', fontSize: '0.95rem', fontWeight: 800 }}>{op.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                     <span style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                       {op.code}
                     </span>
                  </td>
                  <td style={{ textAlign: 'center', color: '#475569', fontWeight: 700 }}>{op.service}</td>
                  <td style={{ textAlign: 'center' }}>
                     <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                        <input type="checkbox" checked={op.status} readOnly />
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FiDatabase style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing 1 to 4 of 4 records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── ADD/EDIT MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff' }}>
            <div className={styles.drawerHeader} style={{ padding: '20px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <FiSettings size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>{formData.id ? 'Operator Details Update' : 'Operator Details'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={16} />
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
                           {formData.logo ? <img src={formData.logo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiImage style={{ color: '#94A3B8' }} />}
                        </div>
                        <input type="file" name="logo" className={styles.inputControl} style={{ borderRadius: '8px', padding: '7px 10px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', flex: 1 }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Min Value :</label>
                      <input type="number" name="minValue" className={styles.inputControl} value={formData.minValue} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Max Value :</label>
                      <input type="number" name="maxValue" className={styles.inputControl} value={formData.maxValue} onChange={handleInputChange} style={{ borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.9rem' }} />
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
                  <button type="submit" style={{ padding: '10px 30px', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s' }}>
                    Submit
                  </button>
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
                      name="service"
                      value={fieldForm.service}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    >
                      <option value="">Select Service</option>
                      <option value="Prepaid">Prepaid</option>
                      <option value="Postpaid">Postpaid</option>
                      <option value="DTH">DTH</option>
                      <option value="BBPS">BBPS</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Water">Water</option>
                      <option value="Gas">Gas</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Operator Code :</label>
                    <select
                      name="operatorCode"
                      value={fieldForm.operatorCode}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none', transition: 'border 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    >
                      {localOperators.map(op => (
                        <option key={op.id} value={op.code}>{op.name} ({op.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Label :</label>
                    <input
                      type="text"
                      name="label"
                      value={fieldForm.label}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 12px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    />
                  </div>
                </div>

                {/* Row 3: OperatorCode + Index + Min Length + Max Length + Save Button (5 Columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', marginBottom: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>OperatorCode :</label>
                    <input
                      type="text"
                      name="operatorCodeText"
                      value={fieldForm.operatorCodeText}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
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
                      name="minLength"
                      value={fieldForm.minLength}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Max Length :</label>
                    <input
                      type="number"
                      name="maxLength"
                      value={fieldForm.maxLength}
                      onChange={handleFieldFormChange}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.8rem', background: '#FCFDFE', color: '#334155', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      style={{ height: '34px', padding: '0 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #1756AA 0%, #0D1B5E 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(23, 86, 170, 0.2)', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                    >
                      <FiCheck size={14} />
                      Save
                    </button>
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
                      {bbpsFields.filter(f => f.operatorCode === addFieldModal.operator?.code).map((f) => (
                        <tr key={f.id}>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{addFieldModal.operator?.name}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{f.service}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 700 }}>{f.label}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{f.minLength}</td>
                          <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{f.maxLength}</td>
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
                                onClick={() => setBbpsFields(bbpsFields.filter(item => item.id !== f.id))}
                                style={{ border: 'none', background: 'transparent', color: '#E53E3E', cursor: 'pointer', padding: '4px' }}
                                title="Delete Field"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bbpsFields.filter(f => f.operatorCode === addFieldModal.operator?.code).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '30px 0', textAlign: 'center', color: '#94A3B8' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <FiDatabase style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No fields available for this operator</span>
                            </div>
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
    </div>
  );
};

export default OperatorManagement;
