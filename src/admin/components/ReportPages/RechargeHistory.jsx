import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GroupHeader, SubHeader, Cells as UplineCells } from '../../../shared/components/common/UplineCommissionCols';
import { API } from '../../../api/endpoints';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { normalizeTxnResponse } from '../../../services/transaction.service';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useLocation } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo,
  FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiActivity as FiSignal,
  FiUser, FiSmartphone, FiCpu, FiTrendingUp, FiBarChart2, FiRefreshCw
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import ActionMenu from '../../../shared/components/common/ActionMenu';
import ConfirmModal from '../../../shared/components/common/ConfirmModal';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import LogModal from '../../../shared/components/common/LogModal';
import StatsGrid from '../../../shared/components/common/StatsGrid';

const RechargeHistory = () => {
  const [breakdownTxn, setBreakdownTxn] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
  const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
  const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;
  const [focusedField, setFocusedField] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get('Status') || '';
  const [selectedStatus, setSelectedStatus] = useState(initialStatus); 
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [forceDataMap, setForceDataMap] = useState({});   // txnId -> {action,utr,reason}
  const [confirmData, setConfirmData] = useState({ show: false, action: null, txn: null });
  const confirmTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current); };
  }, []);

  const [logModalData, setLogModalData] = useState({ show: false, txn: null });
  const { popup, showPopup, closePopup } = usePopup();

  const handleMenuAction = (actionName, txn, extra = {}) => {
    if (actionName === 'Force Success') {
      const txnKey = txn.id || txn.orderId || '';
      if (txnKey) setForceDataMap(prev => ({ ...prev, [txnKey]: { action: 'Force Success', utr: extra.utr||'', reason: extra.reason||'' } }));
      showPopup('success', 'Force Success Applied',
        `Transaction marked as Success.\nUTR: ${extra.utr || 'N/A'}\nReason: ${extra.reason || 'N/A'}`);
    } else if (actionName === 'Force Fail') {
      const txnKey = txn.id || txn.orderId || '';
      if (txnKey) setForceDataMap(prev => ({ ...prev, [txnKey]: { action: 'Force Fail', utr: '', reason: extra.reason||'' } }));
      showPopup('error', 'Force Fail Applied',
        `Transaction marked as Failed.\nReason: ${extra.reason || 'N/A'}`);
    } else if (actionName === 'Check Status') {
      setConfirmData({ show: true, action: actionName, txn });
    } else if (actionName === 'Get Logs') {
      setLogModalData({ show: true, txn });
    } else {
      showPopup('info', 'Action Triggered', `${actionName} triggered for txn ${txn.id || txn.orderId || 'N/A'}`);
    }
  };

  const handleConfirmAction = () => {
    const { action, txn } = confirmData;
    setConfirmData({ show: false, action: null, txn: null });
    
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => {
      if (action === 'Check Status') {
        const status = txn && txn.status ? txn.status.toLowerCase() : 'pending';
        if (status === 'success') {
          showPopup('success', 'Status Checked', 'Congratulations! Status is Successful.');
        } else if (status === 'pending') {
          showPopup('warning', 'Status Checked', 'Transaction status is still Pending.');
        } else {
          showPopup('error', 'Status Checked', 'Transaction status is Failed / Rejected.');
        }
      } else {
        showPopup('success', 'Action Successful', `Successfully applied ${action} to the transaction.`);
      }
    }, 300);
  };

  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [serviceList, setServiceList] = useState([]);
  const [rechargeServiceIds, setRechargeServiceIds] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [operatorList, setOperatorList] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [apiList, setApiList] = useState([]);
  const [selectedApi, setSelectedApi] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  // Gate every transaction fetch on this: until rechargeServiceIds is
  // loaded, a fetch would go out with an empty serviceIds filter (only
  // sectionType sent), which isn't strict enough and can let other
  // transaction types leak into this list. (Same bug found/fixed in
  // BBPSTransaction.jsx.)
  const [mastersLoaded, setMastersLoaded] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.transaction.getAll({
        pageNumber,
        pageSize,
        fromDate,
        toDate,
        serviceId: selectedService || '',
        serviceIds: selectedService ? [] : rechargeServiceIds,
        sectionType: '1',
        operatorId: selectedOperator,
        apiId: selectedApi,
        memberId: selectedMember,
        status: selectedStatus,
        keyword: searchKeyword
      });
      const { items: _txns, totalItems: _total } = normalizeTxnResponse(res);
      // Admin's "Add Fund"/"Deduct Fund" wallet actions write into the
      // shared Transaction table with a mistagged SectionType, so no
      // sectionType/serviceId filter can fully exclude them — those records
      // reliably carry a "WT..." order ID (Wallet Transfer) though. Filter
      // those out as a stopgap. (Same backend mistagging issue found in
      // PayoutHistory.jsx.)
      const filtered = _txns.filter(t => !String(t.orderId || t.vendorId || '').toUpperCase().startsWith('WT'));
      setTransactions(filtered);
      setTotalRecords(filtered.length === _txns.length ? _total : Math.max(0, (_total || 0) - (_txns.length - filtered.length)));
    } catch (e) { console.error('RechargeHistory fetch error:', e); setTransactions([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!mastersLoaded) return;
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, mastersLoaded]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        let list = [];
        if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }

                const rechargeServices = list.filter(srv => String(srv.sectionType || '') === '1');
        setServiceList(rechargeServices);
        setRechargeServiceIds(rechargeServices.map(s => String(s.id)));
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setMastersLoaded(true);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await API.operator.getAll();
        let allOps = [];
        if (res?.data?.items) allOps = res.data.items;
        else if (res?.data && Array.isArray(res.data)) allOps = res.data;
        else if (Array.isArray(res)) allOps = res;

        if (selectedService) {
          allOps = allOps.filter(op => String(op.serviceId) === String(selectedService));
        }
        setOperatorList(allOps);
      } catch (err) {
        console.error("Failed to fetch operators:", err);
      }
    };
    fetchOperators();
    setSelectedOperator('');
  }, [selectedService]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.member.getAll({ pageNumber: 1, pageSize: 5000 });
        const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setMemberList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const res = await API.masterApi.getAll();
        const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setApiList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch APIs:", err);
      }
    };
    fetchApis();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('Status') || '';
    setSelectedStatus(statusParam);
  }, [location.search]);

  return (
    <div className={styles.container} style={{ padding: '12px', maxWidth: '100%' }}>
            <style>{`
        @keyframes successGlow {
          0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
          100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
        }
        @keyframes pendingGlow {
          0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(243, 156, 18, 0); }
          100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
        }
        @keyframes failedGlow {
          0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
            <div style={{ 
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(23, 86, 170, 0.04), 0 1px 8px rgba(0, 0, 0, 0.02)',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>Recharge Transaction</h3>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
              style={{
                background: '#0F172A',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
              onMouseOut={(e) => e.currentTarget.style.background = '#0F172A'}
              onClick={() => setShowStats(!showStats)}
            >
              <FiBarChart2 size={16} /> {showStats ? 'Hide Stats' : 'View Stats'}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setPageNumber(1); fetchTransactions(); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
              <input 
                type="date" 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('fromDate')}
                onBlur={() => setFocusedField(null)}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
              <input 
                type="date" 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('toDate')}
                onBlur={() => setFocusedField(null)}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Service</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'All Services' },
                  ...(Array.isArray(serviceList) ? serviceList : []).map((srv) => ({ value: srv.id, label: srv.name }))
                ]}
                value={selectedService}
                onChange={val => setSelectedService(val || '')}
                placeholder="All Services"
                style={{ height: '38px', borderRadius: '10px' }}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Operator</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'All Operators' },
                  ...(Array.isArray(operatorList) ? operatorList : []).map((op) => ({ 
                    value: op.id || op.operatorId, 
                    label: op.name || op.operatorName || op.title || op.id || 'Unknown' 
                  }))
                ]}
                value={selectedOperator}
                onChange={val => setSelectedOperator(val || '')}
                placeholder="All Operators"
                style={{ height: '38px', borderRadius: '10px' }}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Provider</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'All APIs' },
                  ...(Array.isArray(apiList) ? apiList : []).map((api) => ({ 
                    value: api.id || api.apiId, 
                    label: api.apiname || api.apiName || api.name || `API #${api.id}` 
                  }))
                ]}
                value={selectedApi}
                onChange={val => setSelectedApi(val || '')}
                placeholder="All APIs"
                style={{ height: '38px', borderRadius: '10px' }}
              />
            </div>
          </div>
          
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', alignItems: 'flex-end' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Transaction Status</label>
              <select 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'status' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'status' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                onFocus={() => setFocusedField('status')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Select Member</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'All Members' },
                  ...memberList.map(m => {
                    const name = m.name || m.fullName || m.memberName || m.ownerName || m.firmName || '';
                    const loginId = m.memberID || m.memberid || m.loginID || m.loginId || String(m.id || m.msrno || '');
                    return { value: String(m.id || m.uniqueID || m.msrno || ''), label: name ? `${name} (${loginId})` : loginId };
                  })
                ]}
                value={selectedMember}
                onChange={val => setSelectedMember(val || '')}
                placeholder="All Members"
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>MinAmount</label>
              <input 
                type="number" 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'minAmt' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'minAmt' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('minAmt')}
                onBlur={() => setFocusedField(null)}
                defaultValue="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Max Amount</label>
              <input 
                type="number" 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'maxAmt' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'maxAmt' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('maxAmt')}
                onBlur={() => setFocusedField(null)}
                defaultValue="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <FiSearch size={14} />
                </div>
                <input 
                  type="text" 
                  placeholder="" 
                  className={styles.inputControl} 
                  style={{ 
                    paddingLeft: '32px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    fontSize: '0.825rem', 
                    border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                    boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                    transition: 'all 0.25s', 
                    width: '100%', 
                    background: '#FCFDFE',
                    color: '#334155',
                    fontWeight: 500
                  }} 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onFocus={() => setFocusedField('search')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  height: '38px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '140px',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #24D366 0%, #17b350 100%)';
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(34, 197, 94, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)';
                }}
              >
                <FiSearch size={15} />
                Search
              </button>
              <button
                type="button"
                title="Reset Filters"
                onClick={() => {
                  setFromDate(today);
                  setToDate(today);
                  setSelectedService('');
                  setSelectedOperator('');
                  setSelectedMember('');
                  setSelectedApi('');
                  setSelectedStatus('');
                  setSearchKeyword('');
                  setPageNumber(1);
                }}
                style={{
                  background: '#fff',
                  color: '#475569',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  height: '38px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  width: '120px',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                  padding: '0 16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.color = '#1756AA'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569'; }}
              >
                <FiRefreshCw size={14} />
                Reset
              </button>
          </div>
        </form>
      </div>

            <StatsGrid stats={{
        totalTxns: transactions.length,
        totalAmount: transactions.reduce((acc, curr) => acc + (parseFloat(curr.amount || curr.txnAmount) || 0), 0),
        successTxns: transactions.filter(t => t.status?.toLowerCase() === 'success').length,
        failedTxns: transactions.filter(t => t.status?.toLowerCase() === 'failed').length,
        pendingTxns: transactions.filter(t => t.status?.toLowerCase() === 'pending').length,
        totalCommission: 0,
        uplineCommission: 0,
        adminCommission: 0,
        totalTds: 0,
        adminProfit: 0,
        tdsPayable: 0,
        netPayable: 0
      }} showStats={showStats} />

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Recharge Transaction List</h3>
        </div>
        <div className="global-table-toolbar" style={{ padding: '10px 15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="rechargehistory_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search recharge logs..." />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '3800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th rowSpan="2" style={{ width: '80px', textAlign: 'center' }}>Action</th>
                <th rowSpan="2" style={{ width: '60px' }}>SNO</th>
                <th rowSpan="2">Date</th>
                <th rowSpan="2">Name</th>
                <th rowSpan="2">Operator</th>
                <th rowSpan="2">Image</th>
                <th rowSpan="2">Number</th>
                <th rowSpan="2" style={{ textAlign: 'center' }}>Status</th>
                <th rowSpan="2">Reason</th>
                <th rowSpan="2">OP Bal</th>
                <th rowSpan="2">Amount</th>
                <th rowSpan="2">CL Bal</th>
                <th rowSpan="2">Through</th>
                <th rowSpan="2">Provider</th>
                <th rowSpan="2">IP</th>
                <th rowSpan="2">Recharge ID</th>
                <th rowSpan="2">Admin Profit</th>
                <th rowSpan="2">Provider RequestID</th>
                <GroupHeader transactions={transactions} />
              </tr>
              <tr style={{ background: 'linear-gradient(90deg, #1a2f8a 0%, #0D1B5E 100%)' }}>
                <SubHeader transactions={transactions} />
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <tr key={txn.id || index} style={(() => {
                      const s = (txn.status || '').toLowerCase();
                      if (s === 'success') return { background: '#F0FDF4' };
                      if (s === 'pending') return { background: '#FFFBEB' };
                      if (s === 'processing') return { background: '#EFF6FF' };
                      return { background: '#FFF5F5' };
                    })()}>
                    <td style={{ textAlign: 'center', overflow: 'visible' }}>
                      <ActionMenu txn={txn} onViewReceipt={txn => {
                            const fd = forceDataMap[txn.id || txn.orderId];
                            setActiveReceipt({ ...txn, _type: 'recharge', forceAction: fd?.action, forceUtr: fd?.utr, forceReason: fd?.reason });
                          }} onAction={handleMenuAction} alignUp={index >= transactions.length - 2 && transactions.length > 2} />
                    </td>
                    <td>{((pageNumber-1)*pageSize)+index+1}</td>
                    <td>{txn.createdDate || txn.date || 'N/A'}</td>
                    {/* `memberName` dropped — that's the BC's own name, not the
                        recharge customer's; never fabricate. */}
                    <td>{txn.customerName || 'N/A'}</td>
                    <td>{txn.operatorName || txn.operator || 'N/A'}</td>
                    <td>-</td>
                    {/* `accountNo` dropped — that's DMT's bank account field, not
                        a recharge mobile number. */}
                    <td>{txn.number || txn.mobile || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {(() => {
                        const s = (txn.status || '').toLowerCase();
                        const isSuccess    = s === 'success';
                        const isPending    = s === 'pending';
                        const isProcessing = s === 'processing';
                        const bg    = isSuccess ? '#DCFCE7' : isPending ? '#FEF3C7' : isProcessing ? '#DBEAFE' : '#FEE2E2';
                        const color = isSuccess ? '#15803D' : isPending ? '#B45309' : isProcessing ? '#1E40AF' : '#B91C1C';
                        const bdr   = isSuccess ? '#BBF7D0' : isPending ? '#FDE68A' : isProcessing ? '#BFDBFE' : '#FECACA';
                        return (
                          <span style={{
                            padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem',
                            fontWeight: '800', textTransform: 'uppercase', display: 'inline-block',
                            background: bg, color, border: `1px solid ${bdr}`
                          }}>
                            {(txn.status || 'N/A').toUpperCase()}
                          </span>
                        );
                      })()}
                    </td>
                    <td>{txn.reason || txn.remark || txn.message || '-'}</td>
                    <td>₹{txn.openingBalance || txn.opBal || '0.00'}</td>
                    <td>₹{txn.amount || txn.txnAmount || '0.00'}</td>
                    <td>₹{txn.closingBalance || txn.clBal || '0.00'}</td>
                    <td>{txn.through || txn.fromChannel || txn.source || 'N/A'}</td>
                    <td>{txn.provider || txn.apiName || 'N/A'}</td>
                    <td>{txn.ip || 'N/A'}</td>
                    <td>{txn.orderId || txn.txnId || txn.refid || 'N/A'}</td>
                    <td>₹{txn.adminProfit || '0.00'}</td>
                    <td>{txn.providerRequestId || txn.vendorId || 'N/A'}</td>
                    <UplineCells txn={txn} transactions={transactions} onBreakdown={setBreakdownTxn} />
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="21" style={{ padding: '40px 0', color: '#A0AEC0', textAlign: 'center' }}>
                       <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>No recharge data found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {(() => {
          const totalPages = Math.ceil(totalRecords / pageSize) || 1;
          const getPages = () => {
            const pages = [];
            const delta = 2;
            const left  = pageNumber - delta;
            const right = pageNumber + delta;
            let prev = null;
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                if (prev !== null && i - prev > 1) pages.push('...');
                pages.push(i);
                prev = i;
              }
            }
            return pages;
          };
          return (
            <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.82rem', color: '#718096', fontWeight: 600 }}>
                Showing {transactions.length > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0}–{Math.min(pageNumber * pageSize, totalRecords)} of <strong>{totalRecords}</strong> records &nbsp;|&nbsp; Page {pageNumber} of {totalPages}
              </div>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}><FiChevronLeft /></button>
                {getPages().map((pg, i) =>
                  pg === '...'
                    ? <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '36px' }}>…</span>
                    : <button
                        key={pg}
                        onClick={() => setPageNumber(pg)}
                        style={{
                          minWidth: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                          borderColor: pg === pageNumber ? '#1756AA' : '#e2e8f0',
                          background: pg === pageNumber ? '#1756AA' : '#fff',
                          color: pg === pageNumber ? '#fff' : '#475569',
                          fontWeight: pg === pageNumber ? 800 : 500,
                          fontSize: '0.82rem', cursor: 'pointer',
                        }}
                      >{pg}</button>
                )}
                <button className="global-page-btn" onClick={() => setPageNumber(p => Math.min(p + 1, totalPages))} disabled={pageNumber >= totalPages}><FiChevronRight /></button>
              </div>
            </div>
          );
        })()}
      </div>
      {activeReceipt && (
        <TransactionReceipt 
          data={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      <ConfirmModal 
        show={confirmData.show} 
        title={confirmData.action === 'Check Status' ? 'Check Transaction Status' : `Confirm ${confirmData.action}`}
        message={confirmData.action === 'Check Status' ? 'Are you sure you want to check the status of this transaction?' : `Are you sure you want to apply ${confirmData.action} to this transaction?`}
        type={confirmData.action === 'Force Fail' ? 'danger' : confirmData.action === 'Check Status' ? 'warning' : 'success'}
        confirmText={confirmData.action === 'Check Status' ? 'Check Status' : 'Yes, I am sure'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmData({ show: false, action: null, txn: null })}
      />
      <PopupModal show={popup.show} type={popup.type} title={popup.title} message={popup.message} onClose={closePopup} />
      <LogModal
        show={logModalData.show}
        txn={logModalData.txn}
        onClose={() => setLogModalData({ show: false, txn: null })}
      />

            {breakdownTxn && ReactDOM.createPortal(
        <>
          <div onClick={() => setBreakdownTxn(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.55)', backdropFilter: 'blur(4px)', zIndex: 9500 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9501, width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(10,20,50,0.28)', overflow: 'hidden', fontFamily: 'Arial,sans-serif' }}>
            <div style={{ background: 'linear-gradient(135deg,#0A1428,#1756AA)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 800 }}>Upline Commission Breakdown</h3>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>TXN: {breakdownTxn.orderId || breakdownTxn.txnId || '—'}</p>
              </div>
              <button onClick={() => setBreakdownTxn(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>Total Upline Earning</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>₹{Number(breakdownTxn.uplineCommission).toFixed(2)}</span>
            </div>
            <div style={{ padding: '12px 20px 20px', maxHeight: 340, overflowY: 'auto' }}>
              {(breakdownTxn.uplineBreakdown || []).map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 8, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: i === 0 ? 'linear-gradient(135deg,#1756AA,#0A1428)' : 'linear-gradient(135deg,#7c3aed,#4c1d95)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900 }}>L{row.levelNo || i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.memberName || 'N/A'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{row.roleName || `Level ${row.levelNo || i + 1}`}{row.memberMobile ? ` · ${row.memberMobile}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d' }}>+₹{Number(row.amount || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 1 }}>{row.createdOn ? new Date(row.createdOn).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
export default RechargeHistory;
