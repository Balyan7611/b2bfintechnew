import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaCheckCircle, FaSave, FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, FaPrint, FaChevronLeft, FaChevronRight, FaExclamationCircle } from 'react-icons/fa';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { updateApiCommForm, addApiCommEntry, setApiCommForm, updateApiCommEntry, toggleApiCommStatus, deleteApiCommEntry } from '../../../store/slices/commissionSlice';
import styles from './Commission.module.css';

const SetApiCommissionRange = () => {
  const dispatch = useDispatch();
  const { apiCommForm, apiCommList } = useSelector(state => state.commission);

  const apiNameRef = useRef(null);
  const serviceRef = useRef(null);
  const operatorRef = useRef(null);
  const topFormRef = useRef(null);
  const [errors, setErrors] = useState({ apiName: false, service: false, operator: false });
  const [editingId, setEditingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, title: '', desc: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateApiCommForm({ name, value }));
  };

  const handleSlabTypeChange = (type) => {
      };

  const handleSubmit = () => {
    const newErrors = {
      apiName: !apiCommForm.apiName,
      service: !apiCommForm.service,
      operator: !apiCommForm.operator
    };
    setErrors(newErrors);

    if (newErrors.apiName) {
      apiNameRef.current?.focus();
      return;
    }
    if (newErrors.service) {
      serviceRef.current?.focus();
      return;
    }
    if (newErrors.operator) {
      operatorRef.current?.focus();
      return;
    }
    
    if (editingId) {
      dispatch(updateApiCommEntry(editingId));
      setEditingId(null);
    } else {
      dispatch(addApiCommEntry());
    }
    setErrors({ apiName: false, service: false, operator: false });
  };

  const handleEdit = (item) => {
    topFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setEditingId(item.id);
    dispatch(setApiCommForm({
      apiName: item.apiName,
      service: item.service,
      operator: item.operator,
      startValue: item.startValue,
      endValue: item.endValue,
      general: item.general,
      amountType: item.amountType || 'COM',
      valueType: item.valueType || 'PER',
      details: item.details || ''
    }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    dispatch(setApiCommForm({
      apiName: '',
      service: '',
      operator: '',
      startValue: 0,
      endValue: 0,
      general: 0,
      amountType: 'COM',
      valueType: 'PER',
      details: ''
    }));
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'toggle') {
      dispatch(toggleApiCommStatus(confirmModal.id));
    } else if (confirmModal.type === 'delete') {
      dispatch(deleteApiCommEntry(confirmModal.id));
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  return (
    <div className={styles.container} ref={topFormRef}>
            <div className={styles.card} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1.5px solid #F8FAFF' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.2rem' }}>Set Commission Range (API)</h2>
            <p className={styles.directorySubtitle} style={{ fontSize: '0.75rem' }}>Configure detailed commission slabs for external APIs</p>
          </div>
        </div>
        
                <div className={styles.formGridFive}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Api <span style={{color: '#EF4444'}}>*</span></label>
            <SearchableSelect
              name="apiName"
              value={apiCommForm.apiName}
              onChange={(val) => handleChange({ target: { name: 'apiName', value: val } })}
              options={[
                { label: 'Select Api', value: '' },
                { label: 'Jio API', value: 'Jio API' },
                { label: 'Airtel API', value: 'Airtel API' },
                { label: 'Yes Bank API', value: 'Yes Bank API' }
              ]}
              placeholder="Select Api"
              style={{ height: '42px', borderRadius: '10px' }}
            />
            {errors.apiName && <span className={styles.errorText}><FaExclamationCircle /> API is required</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Service <span style={{color: '#EF4444'}}>*</span></label>
            <SearchableSelect
              name="service"
              value={apiCommForm.service}
              onChange={(val) => handleChange({ target: { name: 'service', value: val } })}
              options={[
                { label: 'Select Service', value: '' },
                { label: 'AEPS', value: 'AEPS' },
                { label: 'DMT', value: 'DMT' },
                { label: 'Recharge', value: 'Recharge' }
              ]}
              placeholder="Select Service"
              style={{ height: '42px', borderRadius: '10px' }}
            />
            {errors.service && <span className={styles.errorText}><FaExclamationCircle /> Service is required</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Operator <span style={{color: '#EF4444'}}>*</span></label>
            <SearchableSelect
              name="operator"
              value={apiCommForm.operator}
              onChange={(val) => handleChange({ target: { name: 'operator', value: val } })}
              options={[
                { label: 'Select Operator', value: '' },
                { label: 'Jio', value: 'Jio' },
                { label: 'Airtel', value: 'Airtel' },
                { label: 'VI', value: 'VI' }
              ]}
              placeholder="Select Operator"
              style={{ height: '42px', borderRadius: '10px' }}
            />
            {errors.operator && <span className={styles.errorText}><FaExclamationCircle /> Operator is required</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Value</label>
            <input type="number" name="startValue" className={styles.inputControl} value={apiCommForm.startValue} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>End Value</label>
            <input type="number" name="endValue" className={styles.inputControl} value={apiCommForm.endValue} onChange={handleChange} />
          </div>
        </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                    <div className={styles.slabCol} style={{ width: '240px', flex: 'none', marginBottom: 0, height: '100%' }}>
            <h4 className={styles.slabColTitle}>Slab Charges</h4>
            <div className={styles.slabGeneralRow}>
              <span>General</span>
              <input 
                type="number" 
                name="general"
                className={styles.inputControl} 
                style={{ padding: '8px 12px', flex: 1 }} 
                value={apiCommForm.general}
                onChange={handleChange}
              />
            </div>
            <div className={styles.pillGroupWrapper}>
              <div className={styles.pillGroup}>
                {['COM', 'SUR'].map(t => (
                  <button 
                    key={t}
                    className={`${styles.pillBtn} ${apiCommForm.amountType === t ? styles.pillBtnActiveCOM : ''}`}
                    onClick={() => dispatch(updateApiCommForm({ name: 'amountType', value: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className={styles.pillGroup}>
                {['PER', 'FIX'].map(t => (
                  <button 
                    key={t}
                    className={`${styles.pillBtn} ${apiCommForm.valueType === t ? styles.pillBtnActivePER : ''}`}
                    onClick={() => dispatch(updateApiCommForm({ name: 'valueType', value: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Commission/Surcharge Details</label>
              <textarea 
                name="details" 
                className={styles.inputControl} 
                style={{ resize: 'none', height: '100%', minHeight: '135px' }}
                placeholder="Enter specific details or notes"
                value={apiCommForm.details}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {editingId && (
                <button className={styles.cancelUpdateBtn} onClick={cancelEdit}>
                  Cancel
                </button>
              )}
              <button className={styles.saveBtn} style={{ alignSelf: 'flex-start' }} onClick={handleSubmit}>
                <FaCheckCircle /> {editingId ? "Update API Range" : "Save API Range"}
              </button>
            </div>
          </div>
        </div>
      </div>

            <div className={styles.card}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table"><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box">
            <FaSearch />
            <input type="text" placeholder="Search range details..." />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.tableFull} style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', padding: '12px 8px' }}>#</th>
                <th style={{ padding: '12px 8px' }}>API & OPERATOR</th>
                <th style={{ padding: '12px 8px' }}>RANGE</th>
                <th style={{ padding: '12px 8px' }}>SLAB CHARGES</th>
                <th style={{ padding: '12px 8px' }}>NOTES</th>
                <th style={{ padding: '12px 8px' }}>UPDATE</th>
                <th style={{ padding: '12px 8px' }}>ACTIVE</th>
                <th style={{ padding: '12px 8px' }}>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {apiCommList.length > 0 ? apiCommList.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0', padding: '12px 8px' }}>{i + 1}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#0D1B3E' }}>{item.apiName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{item.service} | {item.operator}</div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#4E6080' }}>{item.startValue} - {item.endValue}</div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ fontWeight: 600 }}>{item.general}</span>
                    <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '6px' }}>({item.amountType} - {item.valueType})</span>
                  </td>
                  <td style={{ padding: '12px 8px', maxWidth: '200px' }}>
                    {item.details && (
                      <span style={{ 
                        background: '#FFF3E0', 
                        color: '#DD6B20', 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        display: 'inline-block',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: '1.4'
                      }}>
                        {item.details}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button className={styles.pillBlue} onClick={() => handleEdit(item)}>Update</button>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button 
                      className={`${styles.toggleStatus} ${!item.isActive ? styles.inactive : ''}`}
                      onClick={() => setConfirmModal({ isOpen: true, type: 'toggle', id: item.id, title: item.isActive ? 'Deactivate Status' : 'Activate Status', desc: `Are you sure you want to ${item.isActive ? 'deactivate' : 'activate'} this range?` })}
                    >
                      {item.isActive ? 'Active' : 'Deactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button className={styles.deleteBtn} onClick={() => setConfirmModal({ isOpen: true, type: 'delete', id: item.id, title: 'Delete API Range', desc: 'Are you sure you want to delete this configuration? This action cannot be undone.' })}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className={styles.emptyState}>No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                <div className="global-pagination">
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing 1 to {apiCommList.length} of {apiCommList.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="global-page-btn">
              <FaChevronLeft />
            </button>
            <span className="global-page-btn global-page-active">1</span>
            <button className="global-page-btn">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
            {confirmModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.modalTitle}>{confirmModal.title}</h3>
            <p className={styles.modalDesc}>{confirmModal.desc}</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancel</button>
              <button className={`${styles.confirmBtn} ${confirmModal.type === 'delete' ? styles.danger : ''}`} onClick={handleConfirmAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetApiCommissionRange;
