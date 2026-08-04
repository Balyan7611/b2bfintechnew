import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../store/slices/uiSlice';
import { API } from '../../../api/endpoints';
import { ServiceResponseModel } from '../../../models/serviceModel';
import {
  FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw, FiSettings, FiTrash2
} from 'react-icons/fi';
import {
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint
} from 'react-icons/fa';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import MemberSearchSelect from '../../../shared/components/common/MemberSearchSelect';
import styles from '../MemberPages/MemberPages.module.css';

const SWITCH_TYPES = [
  { value: 'User Switch',     label: 'User Switch' },
  { value: 'Operator Switch', label: 'Operator Switch' },
  { value: 'Amount Switch',   label: 'Amount Switch' },
  { value: 'Package Switch',  label: 'Package Switch' },
];

const inputStyle = {
  height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
  padding: '0 12px', color: '#1E293B', fontSize: '0.85rem', outline: 'none', width: '100%',
  background: '#fff'
};
const labelStyle = {
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B',
  textTransform: 'uppercase', marginBottom: '6px', display: 'block'
};

const SwitchSystem = () => {
  const dispatch = useDispatch();

  // ── Dropdown data ──────────────────────────────────────────
  const [services,   setServices]   = useState([]);
  const [allOperators, setAllOperators] = useState([]);
  const [operators,  setOperators]  = useState([]);   // filtered by service
  const [masterApis, setMasterApis] = useState([]);

  // ── Form state ─────────────────────────────────────────────
  const [switchType,  setSwitchType]  = useState('');
  const [serviceId,   setServiceId]   = useState('');
  const [operatorId,  setOperatorId]  = useState('');
  const [apiId,       setApiId]       = useState('');
  const [slab,        setSlab]        = useState('');
  const [blockSlab,   setBlockSlab]   = useState('');
  const [memberId,    setMemberId]    = useState('');
  const [memberName,  setMemberName]  = useState('');
  const [packageId,   setPackageId]   = useState('');

  const [switchStrategy, setSwitchStrategy] = useState('FAILOVER');
  const [multipleSwitch, setMultipleSwitch] = useState('');
  const [activeAmount, setActiveAmount] = useState('');
  const [billFetch, setBillFetch] = useState('');

  const [packages,    setPackages]    = useState([]);

  // ── Table / status ─────────────────────────────────────────
  const [switchRules, setSwitchRules] = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Load all static dropdown data on mount ─────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Services
        const svcRes = await API.service.getAll();
        const svcList = ServiceResponseModel(svcRes);
        setServices(svcList);
      } catch (e) { console.warn('SwitchSystem: services load failed', e); }

      try {
        // All operators — we filter client-side when service changes
        const opRes = await API.operator.getAll({ pageSize: 1000 });
        const rawOps = Array.isArray(opRes?.data) ? opRes.data
          : Array.isArray(opRes?.data?.items) ? opRes.data.items
          : Array.isArray(opRes) ? opRes : [];
        setAllOperators(rawOps.map(o => ({
          id: o.id, serviceId: o.serviceId, name: o.name || o.operatorCode || `Op#${o.id}`
        })));
      } catch (e) { console.warn('SwitchSystem: operators load failed', e); }

      try {
        // Master APIs (API providers)
        const apiRes = await API.masterApi.getAll({ pageSize: 500 });
        const rawApis = Array.isArray(apiRes?.data) ? apiRes.data
          : Array.isArray(apiRes?.data?.items) ? apiRes.data.items
          : Array.isArray(apiRes) ? apiRes : [];
        setMasterApis(rawApis.map(a => ({
          id: a.id || a.apiid, name: a.apiname || a.name || `API#${a.id}`
        })));
      } catch (e) { console.warn('SwitchSystem: masterApis load failed', e); }

      try {
        const packRes = await API.package.getAll({ pageNumber: 1, pageSize: 5000 });
        const rawP = Array.isArray(packRes?.data) ? packRes.data : Array.isArray(packRes?.data?.items) ? packRes.data.items : Array.isArray(packRes) ? packRes : [];
        setPackages(rawP.map(p => ({ id: p.id, name: p.name || p.packageName || `Package #${p.id}` })));
      } catch (e) { console.warn('SwitchSystem: packages load failed', e); }

      loadRules();
    };
    init();
  }, []); // eslint-disable-line

  // Filter operators whenever service changes
  useEffect(() => {
    if (!serviceId) {
      setOperators([]);
      setOperatorId('');
      return;
    }
    const filtered = allOperators.filter(o => String(o.serviceId) === String(serviceId));
    setOperators(filtered);
    setOperatorId('');
  }, [serviceId, allOperators]);

  // ── Load existing switch rules (APISwitchingConcept) ───────────────
  const loadRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await API.apiSwitchingConcept.getAll({ pageNumber: 1, pageSize: 5000 });
      const items = res?.data?.items || res?.data || res || [];
      setSwitchRules(Array.isArray(items) ? items : []);
    } catch (e) {
      console.warn('SwitchSystem: rules load failed', e);
      setSwitchRules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Resolve helpers ───────────────────────────────────────
  const getServiceName = (id) =>
    services.find(s => String(s.id) === String(id))?.name || (id ? `Service #${id}` : '-');

  const getApiName = (pipeName) => pipeName || '-';

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!switchType) return dispatch(setNotification({ type: 'error', message: 'Please select a Switch Type' }));
    if (!serviceId)  return dispatch(setNotification({ type: 'error', message: 'Please select a Service' }));
    if (!apiId)      return dispatch(setNotification({ type: 'error', message: 'Please select an API' }));

    const selectedApi = masterApis.find(a => String(a.id) === String(apiId));
    const selectedOp  = operators.find(o => String(o.id) === String(operatorId));
    
    const parts = (slab || '').split('-');
    const startVal = parts[0] ? parseFloat(parts[0]) : 0;
    const endVal = parts[1] ? parseFloat(parts[1]) : 0;

    let pId = 0, mId = 0;
    if (switchType === 'Package Switch') pId = parseInt(packageId) || 0;
    if (switchType === 'User Switch') mId = parseInt(memberId) || 0;

    setIsSaving(true);
    try {
      await API.apiSwitchingConcept.create({
        opId: parseInt(operatorId) || 0,
        startVal: startVal,
        endVal: endVal,
        activeApi: parseInt(apiId) || 0,
        activeAmount: parseFloat(activeAmount) || 0,
        msrno: mId,
        packageId: pId,
        multipleSwitch: multipleSwitch || '',
        switchType: switchStrategy,
        empId: 0,
        slab: slab || '',
        billFetch: billFetch || '',
        blockSlab: blockSlab || ''
      });
      dispatch(setNotification({ type: 'success', message: 'Switch rule saved successfully!' }));
      setSwitchType(''); setServiceId(''); setOperatorId(''); setApiId(''); setSlab(''); setBlockSlab(''); setMemberId(''); setMemberName(''); setPackageId('');
      setMultipleSwitch(''); setActiveAmount(''); setBillFetch('');
      loadRules();
    } catch (e) {
      console.error('SwitchSystem: save failed', e);
      dispatch(setNotification({ type: 'error', message: e.message || 'Save failed. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this switch rule?')) return;
    try {
      await API.apiSwitchingConcept.delete(id);
      dispatch(setNotification({ type: 'success', message: 'Rule deleted.' }));
      loadRules();
    } catch (e) {
      dispatch(setNotification({ type: 'error', message: 'Delete failed.' }));
    }
  };

  // ── Pagination / search ───────────────────────────────────
  const filtered = switchRules.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      getServiceName(r.serviceId).toLowerCase().includes(q) ||
      (r.pipeName || '').toLowerCase().includes(q) ||
      (r.aliasName || '').toLowerCase().includes(q)
    );
  });
  const totalPages  = Math.ceil(filtered.length / rowsPerPage);
  const startIndex  = (currentPage - 1) * rowsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + rowsPerPage);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={styles.container} style={{ padding: '15px 15px 0 15px', maxWidth: '100%' }}>
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>Switch System</h3>
        </div>

        {/* ── Form ── */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F1F5F9', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'flex-end' }}>

            {/* 1. Switch Type */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label style={labelStyle}>Switch Type</label>
              <SearchableSelect
                options={SWITCH_TYPES}
                value={switchType}
                onChange={val => setSwitchType(val)}
                placeholder="Search Switch Type..."
                containerStyle={{ margin: 0 }}
              />
            </div>

            {/* 2. Dynamic Field Space (Appears right next to Switch Type) */}
            {switchType === 'User Switch' ? (
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label style={labelStyle}>Select Member</label>
                <MemberSearchSelect
                  value={memberName}
                  onChange={(m) => {
                    if (m) {
                      setMemberId(String(m.id || m.memberId || m.msrno));
                      const name = m.name || m.fullName || '';
                      const loginId = m.loginId || m.memberID || '';
                      setMemberName(name && loginId ? `${name} (${loginId})` : (loginId || name));
                    } else {
                      setMemberId('');
                      setMemberName('');
                    }
                  }}
                  placeholder="Search Member..."
                  style={{ height: '42px' }}
                />
              </div>
            ) : switchType === 'Package Switch' ? (
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label style={labelStyle}>Select Package</label>
                <SearchableSelect
                  options={packages.map(p => ({ value: p.id, label: p.name }))}
                  value={packageId}
                  onChange={setPackageId}
                  placeholder="Search Package..."
                  containerStyle={{ margin: 0 }}
                />
              </div>
            ) : null}

            {/* 3. Service */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label style={labelStyle}>
                Service {services.length === 0 && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(loading...)</span>}
              </label>
              <SearchableSelect
                options={services.map(s => ({ value: s.id, label: s.name }))}
                value={serviceId}
                onChange={val => setServiceId(val)}
                placeholder="Search Service..."
                containerStyle={{ margin: 0 }}
              />
            </div>

            {/* 4. Operator */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label style={labelStyle}>Operator</label>
              <SearchableSelect
                options={[
                  { value: '0', label: 'All Operator' },
                  ...operators.map(op => ({ value: op.id, label: op.name }))
                ]}
                value={operatorId}
                onChange={val => setOperatorId(val)}
                placeholder={serviceId ? 'Search Operator...' : 'Select Service first'}
                disabled={!serviceId}
                containerStyle={{ margin: 0 }}
              />
            </div>

            {/* 5. API List (Starts Row 2) */}
            <div className={styles.formGroup} style={{ margin: 0, marginTop: '12px' }}>
              <label style={labelStyle}>
                API List {masterApis.length === 0 && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(loading...)</span>}
              </label>
              <SearchableSelect
                options={masterApis.map(a => ({ value: a.id, label: a.name }))}
                value={apiId}
                onChange={val => setApiId(val)}
                placeholder="Search Api..."
                containerStyle={{ margin: 0 }}
              />
            </div>

            {/* 6. Slab (Permanent) */}
            <div className={styles.formGroup} style={{ margin: 0, marginTop: '12px' }}>
              <label style={labelStyle}>Slab</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="Enter slab details..."
                value={slab}
                onChange={e => setSlab(e.target.value)}
                style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', width: '100%', fontSize: '0.85rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#1756AA'}
                onBlur={e => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>

            {/* 7. Block Slab (Permanent) */}
            <div className={styles.formGroup} style={{ margin: 0, marginTop: '12px' }}>
              <label style={labelStyle}>Block Slab</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="Enter block slab..."
                value={blockSlab}
                onChange={e => setBlockSlab(e.target.value)}
                style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', width: '100%', fontSize: '0.85rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#1756AA'}
                onBlur={e => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>

            {/* Bill Fetch */}
            <div className={styles.formGroup} style={{ margin: 0, marginTop: '12px' }}>
              <label style={labelStyle}>Bill Fetch</label>
              <SearchableSelect
                options={masterApis.map(a => ({ value: a.id, label: a.name }))}
                value={billFetch}
                onChange={val => setBillFetch(val)}
                placeholder="Select Bill Fetch API..."
                containerStyle={{ margin: 0 }}
              />
            </div>

            {/* Save Button */}
            <div className={styles.formGroup} style={{ margin: 0, gridColumn: 'span 1', marginTop: '12px' }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                  height: '42px',
                  background: isSaving ? '#9CA3AF' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#fff', border: 'none', borderRadius: '10px', width: '100%',
                  fontWeight: 700, fontSize: '0.85rem', cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', boxShadow: isSaving ? 'none' : '0 4px 12px rgba(34,197,94,0.15)',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}
                onMouseOver={e => { if (!isSaving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(34,197,94,0.25)'; } }}
                onMouseOut={e => { if (!isSaving) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.15)'; } }}
              >
                {isSaving ? <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Note */}
            <div style={{ gridColumn: 'span 4', marginTop: '4px' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                <strong>Note:</strong> if you want fix amount then use "," and for range use "-" like (eg. 10, 20, 50-200, 300-500)
              </p>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select
              className={styles.selectEntries}
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
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
              placeholder="Search switch rules..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className={styles.tableWrapper} style={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', overflowY: 'hidden', minHeight: 'auto' }}>
          <table className={styles.table} style={{ minWidth: '900px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '200px' }}>Details</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Switch Type</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Operator</th>
                <th style={{ width: '160px', textAlign: 'center' }}>API List</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Add Date</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading switch rules...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px 0', color: '#A0AEC0' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0D1B3E', display: 'block', marginBottom: '4px' }}>
                      {searchQuery ? 'No matching rules found' : 'No Switch Rules found'}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>
                      {searchQuery ? 'Try a different search.' : 'Create a new switch rule to see it here'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentData.map((rule, idx) => {
                  const rOperator = parseInt(rule.opId) === 0 ? 'All Operator' : (operators.find(o => String(o.id) === String(rule.opId))?.name || `Operator #${rule.opId}`);
                  const rApiName = masterApis.find(a => String(a.id) === String(rule.activeApi))?.name || `API #${rule.activeApi}`;

                  return (
                    <tr key={rule.id} className={styles.hoverRow}>
                      <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{startIndex + idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', background: 'rgba(23,86,170,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', flexShrink: 0 }}>
                            <FiSettings />
                          </div>
                          <div>
                            <span style={{ color: '#1756AA', fontWeight: 800, display: 'block', fontSize: '0.85rem' }}>
                              {getServiceName(rule.serviceId)}
                            </span>
                            {rule.slab && rule.slab !== '-' && rule.slab !== 'All' && (
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Slab: {rule.slab}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#F1F5F9', color: '#4E6080', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {rule.switchType || '-'}
                        </span>
                        {rule.packageId > 0 && <div style={{fontSize: '0.7rem', color:'#64748b'}}>Pkg: {rule.packageId}</div>}
                        {rule.msrno > 0 && <div style={{fontSize: '0.7rem', color:'#64748b'}}>Mem: {rule.msrno}</div>}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                        {rOperator}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#27AE60', fontWeight: 800, fontSize: '0.85rem', display: 'block' }}>
                          {rApiName}
                        </span>
                        {rule.multipleSwitch && (
                           <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Backup: {rule.multipleSwitch}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>
                        {rule.createdDate ? rule.createdDate.slice(0, 16).replace('T', ' ') : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          title="Delete Rule"
                          onClick={() => handleDelete(rule.id)}
                          style={{ background: 'transparent', border: 'none', color: '#E53E3E', fontSize: '1.1rem', padding: 0, cursor: 'pointer' }}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ borderRadius: '8px' }}>
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: currentPage === num ? '#1756AA' : '#F1F5F9', color: currentPage === num ? '#fff' : '#4E6080', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
              >
                {num}
              </button>
            ))}
            <button className="global-page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} style={{ borderRadius: '8px' }}>
              <FiChevronRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SwitchSystem;
