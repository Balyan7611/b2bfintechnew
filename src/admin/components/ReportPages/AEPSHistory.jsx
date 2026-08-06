import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { API } from '../../../api/endpoints';
import { normalizeTxnResponse } from '../../../services/transaction.service';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useLocation } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, 
  FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiActivity as FiSignal,
  FiUser, FiSmartphone, FiCpu, FiTrendingUp, FiBarChart2
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaFingerprint
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import ActionMenu from '../../../shared/components/common/ActionMenu';
import ConfirmModal from '../../../shared/components/common/ConfirmModal';
import LogModal from '../../../shared/components/common/LogModal';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import StatsGrid from '../../../shared/components/common/StatsGrid';

const AEPSHistory = () => {
  const [showStats, setShowStats] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get('Status') || '';
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [editingAadhaarId, setEditingAadhaarId] = useState(null);
  const [confirmData, setConfirmData] = useState({ show: false, action: null, txn: null });
  const [logModalData, setLogModalData] = useState({ show: false, txn: null });
  const { popup, showPopup, closePopup } = usePopup();
  const [editAadhaarValue, setEditAadhaarValue] = useState('');
  const [breakdownTxn, setBreakdownTxn] = useState(null);

  const handleMenuAction = (actionName, txn) => {
    if (actionName === 'Force Fail' || actionName === 'Force Success' || actionName === 'Check Status') {
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
    
    // Simulate API call and show result dynamically based on status
    setTimeout(() => {
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

  const handleAadhaarSave = (id) => {
    setTransactions(prev => prev.map((t, i) => (t.id || i) === id ? { ...t, aadharNo: editAadhaarValue } : t));
    setEditingAadhaarId(null);
  };


  const [memberList, setMemberList] = useState([]);

  const [serviceList, setServiceList] = useState([]);
  const [selectedService, setSelectedService] = useState('');

  const [operatorList, setOperatorList] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
  const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
  const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;

  // Stats Card Computations — all from real API data
  const totalTxns      = totalRecords || transactions.length;
  const totalAmount    = transactions.reduce((acc, t) => acc + (parseFloat(t.amount)           || 0), 0);
  const successTxns    = successCount;
  const failedTxns     = failedCount;
  const pendingTxns    = pendingCount;
  const totalCommission= transactions.reduce((acc, t) => acc + (parseFloat(t.commission)       || 0), 0);
  // Use actual uplineCommission from API; fallback to breakdown sum; last resort 0
  const uplineCommission = transactions.reduce((acc, t) => {
    if (t.uplineCommission != null) return acc + (parseFloat(t.uplineCommission) || 0);
    if (Array.isArray(t.uplineBreakdown))
      return acc + t.uplineBreakdown.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    return acc;
  }, 0);
  const adminCommission= totalCommission - uplineCommission;
  const totalTds       = transactions.reduce((acc, t) => acc + (parseFloat(t.tds)             || 0), 0);
  const totalCharge    = transactions.reduce((acc, t) => acc + (parseFloat(t.charge)           || 0), 0);
  const adminProfit    = adminCommission - totalTds;
  const tdsPayable     = totalTds;
  const netPayable     = totalAmount - totalCommission;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // AEPS: serviceId 17,18 / sectionType 9,10
      const params = {
        pageNumber,
        pageSize,
        fromDate,
        toDate,
        serviceId: '',
        sectionType: '9,10',
        operatorId: selectedOperator,
        apiId: '',
        memberId: selectedMember,
        status: selectedStatus,
      };
      // Pass keyword to API for server-side search by txnId/orderId
      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
      const res = await API.transaction.getAll(params);

            const { items: _txns, totalItems: _total, totalSuccess: _succ, totalPending: _pend, totalFailed: _fail } = normalizeTxnResponse(res);
      setTransactions(_txns);
      setTotalRecords(_total);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactions([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pageNumber, pageSize, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(1);
    fetchTransactions();
  };

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
        
        // Filter specifically for AEPS services (sectionType 9 or Aeps related)
        const aepsServices = list.filter(srv => String(srv.sectionType || '') === '9');
        setServiceList(aepsServices);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await API.operator.getAll();
        if (res?.data?.items) {
          setOperatorList(res.data.items);
        } else if (res?.data && Array.isArray(res.data)) {
          setOperatorList(res.data);
        } else if (Array.isArray(res)) {
          setOperatorList(res);
        }
      } catch (err) {
        console.error("Failed to fetch operators:", err);
      }
    };
    fetchOperators();
  }, []);

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
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('Status') || '';
    setSelectedStatus(statusParam);
  }, [location.search]);

  return (
    <div className={styles.container} style={{ padding: '12px', maxWidth: '100%' }}>
      {/* Dynamic Keyframe Animations for Button Rays */}
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

      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(23, 86, 170, 0.04), 0 1px 8px rgba(0, 0, 0, 0.02)',
        border: '1px solid #E2E8F0',
        padding: '24px 32px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>AEPS History</h3>
          <button 
            type="button" 
            onClick={() => setShowStats(!showStats)}
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              height: '38px',
              padding: '0 20px',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1.5px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(15, 23, 42, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)';
            }}
          >
            <FiBarChart2 size={16} />
            {showStats ? 'Hide Stats' : 'View Stats'}
          </button>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
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
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onFocus={() => setFocusedField('fromDate')}
                onBlur={() => setFocusedField(null)}
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
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onFocus={() => setFocusedField('toDate')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Service</label>
              <select 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'service' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'service' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('service')}
                onBlur={() => setFocusedField(null)}
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">All Services</option>
                {Array.isArray(serviceList) && serviceList.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Operator</label>
              <select 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'operator' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'operator' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('operator')}
                onBlur={() => setFocusedField(null)}
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
              >
                <option value="">All Operators</option>
                {Array.isArray(operatorList) && operatorList.map((op) => (
                  <option key={op.id || op.operatorId} value={op.id || op.operatorId}>
                    {op.name || op.operatorName || op.title || op.id || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Member</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'All Members' },
                  ...memberList.map(m => {
                    const name = m.name || m.fullName || m.memberName || m.ownerName || m.firmName || '';
                    const loginId = m.memberID || m.memberid || m.loginID || m.loginId || String(m.id || m.msrno || '');
                    return { value: String(m.id || m.msrno), label: name ? `${name} (${loginId})` : loginId };
                  })
                ]}
                value={selectedMember}
                onChange={val => setSelectedMember(val || '')}
                placeholder="All Members"
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Provider</label>
              <select 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'provider' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'provider' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('provider')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">All Providers</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Status</label>
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
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Keyword</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <FiSearch size={14} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by ID, Name, Remark..." 
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
            <div className={styles.formGroup}>
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
                  width: '100%',
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
            </div>
          </div>
        </form>
      </div>

      {/* ── STATS CARDS GRID ── */}
      <StatsGrid stats={{
        totalTxns,
        totalAmount,
        successTxns,
        failedTxns,
        pendingTxns,
        totalCommission,
        uplineCommission,
        adminCommission,
        totalTds,
        totalCharge,
        adminProfit,
        tdsPayable,
        netPayable
      }} showStats={showStats} />


      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>AEPS History List</h3>
        </div>

        {/* TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '12px 20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="aepshistory_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Filter by TXN ID, name, mobile..."
              value={tableFilter}
              onChange={e => setTableFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper} style={{ minHeight: '300px', overflowX: 'auto' }}>
          <table className={styles.table} style={{ minWidth: '2200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th rowSpan="2" style={{ width: '50px' }}>#</th>
                <th rowSpan="2" style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                <th rowSpan="2" style={{ width: '100px' }}>DATE & TIME</th>
                <th rowSpan="2" style={{ width: '120px' }}>TXN ID</th>
                <th rowSpan="2" style={{ width: '180px' }}>MEMBER DETAILS</th>
                <th rowSpan="2" style={{ width: '180px' }}>CUSTOMER DETAILS</th>
                <th rowSpan="2" style={{ width: '120px' }}>SERVICE TYPE</th>
                <th rowSpan="2" style={{ width: '120px' }}>VENDOR NAME</th>
                <th rowSpan="2" style={{ width: '150px' }}>RRN NO.</th>
                <th rowSpan="2" style={{ width: '100px' }}>AMOUNT</th>
                <th rowSpan="2" style={{ width: '70px', fontSize: '0.7rem' }}>CHARGE</th>
                <th rowSpan="2" style={{ width: '100px', textAlign: 'center' }}>STATUS</th>
                <th rowSpan="2" style={{ width: '120px' }}>AADHAAR NO</th>
                <th rowSpan="2" style={{ width: '100px' }}>OP BAL</th>
                <th rowSpan="2" style={{ width: '100px' }}>CL BAL</th>
                {/* COMMISSION group: ADMIN + TDS only (UPPER LINE removed — now part of UPLINE group) */}
                <th colSpan="2" style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', height: '20px', lineHeight: '1' }}>COMMISSION</th>
                {/* UPLINE COMMISSION group — TOTAL + per-role sub-cols */}
                {(() => {
                  const sample = transactions.find(t => (t.uplineBreakdown || []).length > 0);
                  const roles = sample ? sample.uplineBreakdown : [];
                  const cols = roles.length > 0 ? roles.length : 2;
                  return (
                    <th colSpan={cols + 1} style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', height: '20px', lineHeight: '1', background: 'rgba(21,128,61,0.25)', borderLeft: '2px solid rgba(21,128,61,0.5)' }}>
                      UPLINE COMMISSION
                    </th>
                  );
                })()}
                <th rowSpan="2" style={{ width: '120px' }}>OPERATOR ID</th>
                <th rowSpan="2" style={{ width: '120px' }}>PROVIDER</th>
                <th rowSpan="2" style={{ width: '180px' }}>REMARK</th>
              </tr>
              <tr style={{ background: 'linear-gradient(90deg, #1a2f8a 0%, #0D1B5E 100%)' }}>
                <th style={{ width: '70px', fontSize: '0.65rem', padding: '4px 10px', height: '20px', lineHeight: '1' }}>ADMIN</th>
                <th style={{ width: '60px', fontSize: '0.65rem', padding: '4px 10px', height: '20px', lineHeight: '1' }}>TDS</th>
                {/* UPLINE sub-col headers: TOTAL + roleName from first sample row */}
                {(() => {
                  const sample = transactions.find(t => (t.uplineBreakdown || []).length > 0);
                  const roles = sample ? sample.uplineBreakdown : [];
                  const cols = roles.length > 0 ? roles.length : 2;
                  return (
                    <>
                      <th style={{ width: '75px', fontSize: '0.65rem', padding: '4px 8px', height: '20px', lineHeight: '1', background: 'rgba(21,128,61,0.2)', color: '#bbf7d0', borderLeft: '2px solid rgba(21,128,61,0.5)', fontWeight: 900 }}>TOTAL</th>
                      {Array.from({ length: cols }, (_, i) => (
                        <th key={i} style={{ width: '80px', fontSize: '0.6rem', padding: '4px 6px', height: '20px', lineHeight: '1', background: 'rgba(21,128,61,0.15)', color: '#86efac', whiteSpace: 'nowrap' }}>
                          {roles[i]?.roleName ? roles[i].roleName.toUpperCase() : `L${i + 1}`}
                        </th>
                      ))}
                    </>
                  );
                })()}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="25" style={{ padding: '40px 0', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1756AA' }}>Loading transactions...</span>
                  </td>
                </tr>
              ) : (() => {
                const q = tableFilter.trim().toLowerCase();
                const displayTxns = q
                  ? transactions.filter(t =>
                      (t.orderId   || '').toLowerCase().includes(q) ||
                      (t.memberName|| '').toLowerCase().includes(q) ||
                      (t.customerName || '').toLowerCase().includes(q) ||
                      (t.memberMobile || '').includes(q) ||
                      (t.customerMobile || '').includes(q) ||
                      (t.rrn       || '').toLowerCase().includes(q) ||
                      (t.status    || '').toLowerCase().includes(q)
                    )
                  : transactions;
                return displayTxns.length > 0 ? (
                displayTxns.map((txn, index) => (
                  <tr key={txn.id || index}>
                    <td>{((pageNumber - 1) * pageSize) + index + 1}</td>
                    <td style={{ textAlign: 'center', overflow: 'visible' }}>
                      <ActionMenu txn={txn} onViewReceipt={setActiveReceipt} onAction={handleMenuAction} alignUp={index >= transactions.length - 2 && transactions.length > 2} />
                    </td>
                                        <td style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                      {txn.createdDate ? (
                        <>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>{new Date(txn.createdDate).toLocaleDateString('en-IN')}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{new Date(txn.createdDate).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', hour12: true})}</div>
                        </>
                      ) : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1E293B' }}>
                      {txn.orderId || txn.id || ('TXN' + (index + 203841))}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{txn.memberName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>Code: <span style={{color: '#1756AA'}}>{txn.memberCode || 'N/A'}</span></div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.85rem' }}>{txn.customerName || 'Cust ' + (index + 1)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{txn.customerMobile || '98765' + String(10000 + index).slice(-5)}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                      {txn.serviceType || 'AEPS Withdrawal'}
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                      {txn.vendorName || 'ICICI AEPS'}
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1756AA' }}>
                      {txn.rrn || 'RRN' + (900000000000 + index)}
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#0369A1', background: '#E0F2FE', padding: '4px 8px', borderRadius: '6px' }}>
                        ₹{(txn.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: '#475569', fontSize: '0.75rem' }}>
                      ₹{(txn.charge || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        background: txn.status?.toLowerCase() === 'success' ? '#DCFCE7' : txn.status?.toLowerCase() === 'pending' ? '#FEF3C7' : '#FEE2E2',
                        color: txn.status?.toLowerCase() === 'success' ? '#15803D' : txn.status?.toLowerCase() === 'pending' ? '#B45309' : '#B91C1C',
                        border: `1px solid ${txn.status?.toLowerCase() === 'success' ? '#BBF7D0' : txn.status?.toLowerCase() === 'pending' ? '#FDE68A' : '#FECACA'}`
                      }}>
                        {txn.status || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#475569' }}>
                      {editingAadhaarId === (txn.id || index) ? (
                        <input 
                          type="text" 
                          autoFocus
                          value={editAadhaarValue}
                          onChange={(e) => setEditAadhaarValue(e.target.value)}
                          onBlur={() => handleAadhaarSave(txn.id || index)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAadhaarSave(txn.id || index) }}
                          style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                        />
                      ) : (
                        <span 
                          onDoubleClick={() => { 
                            setEditingAadhaarId(txn.id || index); 
                            setEditAadhaarValue(txn.aadharNo || txn.number || ''); 
                          }}
                          style={{ cursor: 'pointer', borderBottom: '1px dashed #94A3B8' }}
                          title="Double click to edit"
                        >
                          {txn.aadharNo || txn.number ? `XXXX-XXXX-${String(txn.aadharNo || txn.number).slice(-4)}` : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: '600', color: '#64748B' }}>₹{(txn.opBal || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: '700', color: '#334155' }}>₹{(txn.clBal || 0).toFixed(2)}</td>
                    {/* COMMISSION: ADMIN + TDS */}
                    <td style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534' }}>
                      ₹{((parseFloat(txn.commission) || 0) * 0.4).toFixed(2)}
                    </td>
                    <td>
                      <span style={{ color: '#991B1B', fontWeight: '800', background: '#FEE2E2', padding: '3px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        ₹{(txn.tds || 0).toFixed(2)}
                      </span>
                    </td>
                    {/* UPLINE COMMISSION — TOTAL + per-role cells (aligned after TDS) */}
                    {(() => {
                      const sample = transactions.find(t => (t.uplineBreakdown || []).length > 0);
                      const roles = sample ? sample.uplineBreakdown : [];
                      const cols = roles.length > 0 ? roles.length : 2;
                      const breakdown = txn.uplineBreakdown || [];

                      debugger;
                      return (
                        <>
                          {/* TOTAL */}
                          <td style={{ borderLeft: '2px solid rgba(21,128,61,0.3)', background: 'rgba(240,253,244,0.4)' }}>
                            {txn.uplineCommission != null ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>₹{Number(txn.uplineCommission).toFixed(2)}</span>
                                {breakdown.length > 0 && (
                                  <button onClick={() => setBreakdownTxn(txn)} title="View breakdown" style={{ width: 15, height: 15, borderRadius: '50%', border: 'none', background: '#1756AA', color: '#fff', fontSize: '0.5rem', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>i</button>
                                )}
                              </div>
                            ) : <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>—</span>}
                          </td>
                          {/* Per-role cells: amount + memberName */}
                          {Array.from({ length: cols }, (_, i) => {
                            const row = breakdown[i];
                            return (
                              <td key={i} style={{ background: 'rgba(240,253,244,0.2)', fontSize: '0.72rem' }}>
                                {row ? (
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#166534' }}>₹{Number(row.amount || 0).toFixed(2)}</div>
                                    <div style={{ fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 75 }} title={row.memberName}>{row.memberName || '—'}</div>
                                  </div>
                                ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                              </td>
                            );
                          })}
                        </>
                      );
                    })()}
                    <td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>{txn.operatorName || txn.operatorId || 'N/A'}</td>
                    <td>
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid #E2E8F0' }}>
                        {txn.providerName || txn.serviceName || 'N/A'}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8rem', fontStyle: 'italic', whiteSpace: 'normal', maxWidth: '180px', lineHeight: '1.3' }}>{txn.remark || 'N/A'}</td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="25" style={{ padding: '40px 0', color: '#A0AEC0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                        {tableFilter ? `No results for "${tableFilter}"` : 'No data available in table'}
                      </span>
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {(() => {
          const totalPages = Math.ceil(totalRecords / pageSize) || 1;
          // Build smart page list: always show first, last, current ±2, with ellipsis
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
                {/* Prev */}
                <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}><FiChevronLeft /></button>
                {/* Smart page numbers */}
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
                {/* Next */}
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
        details={confirmData.txn ? {
          'Member': confirmData.txn.member || confirmData.txn.memberName || 'N/A',
          'Txn ID': confirmData.txn.txnId || confirmData.txn.id || 'N/A',
          'Amount': `₹${confirmData.txn.amount || 0}`,
          'Date': confirmData.txn.date || 'N/A'
        } : null}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmData({ show: false, action: null, txn: null })}
      />
      <PopupModal show={popup.show} type={popup.type} title={popup.title} message={popup.message} onClose={closePopup} />
      <LogModal
        show={logModalData.show}
        txn={logModalData.txn}
        onClose={() => setLogModalData({ show: false, txn: null })}
      />

      {/* Upline Breakdown Portal */}
      {breakdownTxn && ReactDOM.createPortal(
        <>
          <div onClick={() => setBreakdownTxn(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.55)', backdropFilter: 'blur(4px)', zIndex: 9500 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9501, width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(10,20,50,0.28)', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ background: 'linear-gradient(135deg,#0A1428,#1756AA)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 800 }}>Upline Commission Breakdown</h3>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>TXN: {breakdownTxn.orderId || breakdownTxn.id || '—'}</p>
              </div>
              <button onClick={() => setBreakdownTxn(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>Total Upline Earning</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>₹{Number(breakdownTxn.uplineCommission || 0).toFixed(2)}</span>
            </div>
            <div style={{ padding: '12px 20px 20px', maxHeight: 340, overflowY: 'auto' }}>
              {(breakdownTxn.uplineBreakdown || []).map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 8, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: i === 0 ? 'linear-gradient(135deg,#1756AA,#0A1428)' : i === 1 ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900 }}>L{row.levelNo || i + 1}</div>
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

export default AEPSHistory;
