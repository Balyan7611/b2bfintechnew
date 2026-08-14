import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSave, FaTrash, FaCheckCircle, FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, FaPrint, FaChevronLeft, FaChevronRight, FaExclamationCircle } from 'react-icons/fa';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { updateApiForm, addApiEntry, toggleApiStatus, deleteApiEntry } from '../../../store/slices/commissionSlice';
import styles from './Commission.module.css';

const SetCommissionAPI = () => {
  const dispatch = useDispatch();
  const { apiForm, apiList } = useSelector(state => state.commission);

  const apiNameRef = useRef(null);
  const apiUrlRef = useRef(null);
  const [errors, setErrors] = useState({ apiName: false, apiUrl: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateApiForm({ name, value }));
  };

  const handleSubmit = () => {
    const newErrors = {
      apiName: !apiForm.apiName,
      apiUrl: !apiForm.apiUrl
    };
    setErrors(newErrors);

    if (newErrors.apiName) {
      apiNameRef.current?.focus();
      return;
    }
    if (newErrors.apiUrl) {
      apiUrlRef.current?.focus();
      return;
    }
    dispatch(addApiEntry());
    setErrors({ apiName: false, apiUrl: false });
  };

  return (
    <div className={styles.container}>
            <div className={styles.card} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1.5px solid #F8FAFF' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.2rem' }}>Commission API Setup</h2>
            <p className={styles.directorySubtitle} style={{ fontSize: '0.75rem' }}>Configure and manage external commission APIs</p>
          </div>
        </div>

        <div className={styles.formGridThree} style={{ marginBottom: '16px' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>API Name <span style={{color: '#EF4444'}}>*</span></label>
            <input
              ref={apiNameRef}
              type="text"
              name="apiName"
              className={styles.inputControl}
              placeholder="e.g. Jio Recharge API"
              value={apiForm.apiName}
              onChange={handleChange}
            />
            {errors.apiName && <span className={styles.errorText}><FaExclamationCircle /> API Name is required</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>API URL <span style={{color: '#EF4444'}}>*</span></label>
            <input
              ref={apiUrlRef}
              type="text"
              name="apiUrl"
              className={styles.inputControl}
              placeholder="https://api.example.com/commission"
              value={apiForm.apiUrl}
              onChange={handleChange}
            />
            {errors.apiUrl && <span className={styles.errorText}><FaExclamationCircle /> API URL is required</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>API Key</label>
            <input
              type="text"
              name="apiKey"
              className={styles.inputControl}
              placeholder="Enter API Key"
              value={apiForm.apiKey}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Service Type</label>
            <SearchableSelect
              name="serviceType"
              value={apiForm.serviceType}
              onChange={(val) => handleChange({ target: { name: 'serviceType', value: val } })}
              options={[
                { label: 'Select Service Type', value: '' },
                { label: 'AEPS', value: 'AEPS' },
                { label: 'DMT', value: 'DMT' },
                { label: 'Recharge', value: 'Recharge' },
                { label: 'Payout', value: 'Payout' },
                { label: 'UPI', value: 'UPI' }
              ]}
              placeholder="Select Service Type"
              style={{ height: '42px', borderRadius: '10px' }}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Commission %</label>
            <input
              type="number"
              name="commissionPct"
              className={styles.inputControl}
              placeholder="Enter Commission %"
              value={apiForm.commissionPct}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Surcharge %</label>
            <input
              type="number"
              name="surchargePct"
              className={styles.inputControl}
              placeholder="Enter Surcharge %"
              value={apiForm.surchargePct}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            <FaSave /> Save API Config
          </button>
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
            <input type="text" placeholder="Search APIs..." />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.tableFull} style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>API NAME</th>
                <th>API URL</th>
                <th>SERVICE TYPE</th>
                <th>COMMISSION %</th>
                <th>SURCHARGE %</th>
                <th>STATUS</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {apiList.length > 0 ? apiList.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, color: '#0D1B3E' }}>{item.apiName}</td>
                  <td style={{ fontSize: '0.8rem', color: '#1756AA' }}>{item.apiUrl}</td>
                  <td>{item.serviceType}</td>
                  <td style={{ fontWeight: 600 }}>{item.commissionPct}%</td>
                  <td style={{ fontWeight: 600 }}>{item.surchargePct}%</td>
                  <td>
                    <button
                      className={`${styles.toggleStatus} ${!item.isActive ? styles.inactive : ''}`}
                      onClick={() => dispatch(toggleApiStatus(item.id))}
                    >
                      {item.isActive ? 'Active' : 'Deactive'}
                    </button>
                  </td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => dispatch(deleteApiEntry(item.id))}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className={styles.emptyState}>No API configurations added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                <div className="global-pagination">
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing 1 to {apiList.length} of {apiList.length} entries
          </span>
          <div style={{ display: 'center', alignItems: 'center', gap: '12px' }}>
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
    </div>
  );
};

export default SetCommissionAPI;
