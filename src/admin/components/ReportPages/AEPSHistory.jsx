import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
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
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
  const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
  const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;

  // Stats Card Computations
  const totalTxns = totalRecords || transactions.length;
  const totalAmount = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const successTxns = successCount;
  const failedTxns = failedCount;
  const pendingTxns = pendingCount;
  const totalCommission = transactions.reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0);
  const uplineCommission = totalCommission * 0.6;
  const adminCommission = totalCommission * 0.4;
  const totalTds = transactions.reduce((acc, t) => acc + (parseFloat(t.tds) || 0), 0);
  const adminProfit = totalCommission * 0.15;
  const tdsPayable = totalTds * 0.95;
  const netPayable = totalAmount - totalCommission;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fix ServiceId=8 as requested and category is AEPS (section type 9 is filtered on backend by serviceId 8)
      const res = await API.transaction.getAll({
        pageNumber,
        pageSize,
        fromDate,
        toDate,
        serviceId: '8', // Fixed ServiceId = 8
        operatorId: selectedOperator,
        apiId: '1',     // Fixed ApiId = 1
        memberId: selectedMember,
        status: selectedStatus
      });

      if (res && res.status === true) {
        if (Array.isArray(res.data)) {
          setTransactions(res.data);
          setTotalRecords(res.totalRecords || res.data.length);
        } else if (res.data && Array.isArray(res.data.items)) {
          setTransactions(res.data.items);
          setTotalRecords(res.data.totalItems || res.data.items.length);
        } else {
          setTransactions([]);
          setTotalRecords(0);
        }
      } else if (Array.isArray(res)) {
        setTransactions(res);
        setTotalRecords(res.length);
      } else {
        setTransactions([]);
        setTotalRecords(0);
      }
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
        const res = await API.member.search('');
        setMemberList(res || []);
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
              <select 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'member' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('member')}
                onBlur={() => setFocusedField(null)}
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">All Members</option>
                {Array.isArray(memberList) && memberList.map((m) => (
                  <option key={m.id || m.memberId} value={m.id || m.memberId}>
                    {m.name || m.memberId} ({m.mobile})
                  </option>
                ))}
              </select>
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
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="aepshistory_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Filter results..." />
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
                <th colSpan="3" style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', height: '20px', lineHeight: '1' }}>COMMISSION</th>
                <th rowSpan="2" style={{ width: '120px' }}>OPERATOR ID</th>
                <th rowSpan="2" style={{ width: '120px' }}>PROVIDER</th>
                <th rowSpan="2" style={{ width: '180px' }}>REMARK</th>
              </tr>
              <tr style={{ background: 'linear-gradient(90deg, #1a2f8a 0%, #0D1B5E 100%)' }}>
                <th style={{ width: '60px', fontSize: '0.65rem', padding: '4px 10px', height: '20px', lineHeight: '1' }}>UPPER LINE</th>
                <th style={{ width: '60px', fontSize: '0.65rem', padding: '4px 10px', height: '20px', lineHeight: '1' }}>ADMIN</th>
                <th style={{ width: '60px', fontSize: '0.65rem', padding: '4px 10px', height: '20px', lineHeight: '1' }}>TDS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="21" style={{ padding: '40px 0', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1756AA' }}>Loading transactions...</span>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((txn, index) => (
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
                      {txn.id || txn.orderId || ('TXN' + (index + 203841))}
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
                    <td style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534' }}>
                      ₹{((parseFloat(txn.commission) || 0) * 0.6).toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534' }}>
                      ₹{((parseFloat(txn.commission) || 0) * 0.4).toFixed(2)}
                    </td>
                    <td>
                      <span style={{ color: '#991B1B', fontWeight: '800', background: '#FEE2E2', padding: '3px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        ₹{(txn.tds || 0).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>{txn.operatorId || 'N/A'}</td>
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
                  <td colSpan="21" style={{ padding: '40px 0', color: '#A0AEC0', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>No data available in table</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {transactions.length > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0} to {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords} records
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">{pageNumber}</button>
            <button className="global-page-btn" onClick={() => setPageNumber(p => p + 1)} disabled={pageNumber * pageSize >= totalRecords}><FiChevronRight /></button>
          </div>
        </div>
      </div>

            {activeReceipt && (
        <TransactionReceipt 
          data={{
            mode: 'AEPS',
            amount: parseFloat(activeReceipt.amount) || 0,
            charge: 0,
            date: activeReceipt.createdDate ? new Date(activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
            customerName: activeReceipt.memberName || 'N/A',
            customerMobile: activeReceipt.memberCode || 'N/A',
            beneficiary: activeReceipt.aadharNo || activeReceipt.number || 'N/A',
            bank: activeReceipt.providerName || activeReceipt.serviceName || 'N/A',
            accountNo: activeReceipt.operatorId || 'N/A',
            total: parseFloat(activeReceipt.amount) || 0,
            chunks: [{ txnId: activeReceipt.operatorId || 'N/A', amount: parseFloat(activeReceipt.amount) || 0 }],
            opBal: parseFloat(activeReceipt.opBal) || 0,
            clBal: parseFloat(activeReceipt.clBal) || 0,
            commission: parseFloat(activeReceipt.commission) || 0,
            tds: parseFloat(activeReceipt.tds) || 0,
            status: activeReceipt.status || 'N/A',
            remark: activeReceipt.remark || 'N/A'
          }}
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

    </div>
  );
};

export default AEPSHistory;
