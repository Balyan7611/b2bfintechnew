import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GroupHeader, SubHeader, Cells as UplineCells } from '../../../shared/components/common/UplineCommissionCols';
import { API } from '../../../api/endpoints';
import { normalizeTxnResponse } from '../../../services/transaction.service';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
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

const MATMHistory = () => { 
  const [showStats, setShowStats] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [breakdownTxn, setBreakdownTxn] = useState(null);
  const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
  const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
  const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [confirmData, setConfirmData] = useState({ show: false, action: null, txn: null });
  const confirmTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current); };
  }, []);

  const [logModalData, setLogModalData] = useState({ show: false, txn: null });
  const { popup, showPopup, closePopup } = usePopup();
  const [focusedField, setFocusedField] = useState(null);
  
  const handleMenuAction = (actionName, txn, extra = {}) => {
    if (actionName === 'Force Success') {
      showPopup('success', 'Force Success Applied',
        `Transaction marked as Success.\nUTR: ${extra.utr || 'N/A'}\nReason: ${extra.reason || 'N/A'}`);
    } else if (actionName === 'Force Fail') {
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
  const [matmServiceIds, setMatmServiceIds] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [operatorList, setOperatorList] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [apiList, setApiList] = useState([]);
  const [selectedApi, setSelectedApi] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  // Gate every transaction fetch on this: until matmServiceIds is loaded, a
  // fetch would go out with an empty serviceIds filter (only sectionType
  // sent), which isn't strict enough and can let other transaction types
  // leak into this list. (Same bug found/fixed in BBPSTransaction.jsx.)
  const [mastersLoaded, setMastersLoaded] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.transaction.getAll({
        pageNumber, pageSize, fromDate, toDate,
        serviceId: selectedService || '',
        serviceIds: selectedService ? [] : matmServiceIds,
        sectionType: '9',
        operatorId: selectedOperator, apiId: selectedApi, memberId: selectedMember, status: selectedStatus,
        keyword: searchKeyword
      });
      const { items: _txns, totalItems: _total } = normalizeTxnResponse(res);
      // Wallet-transfer records get mistagged server-side with SectionType
      // values that leak into other reports — they reliably carry a "WT..."
      // order ID though. Filter those out as a stopgap. (Same issue found in
      // PayoutHistory.jsx / RechargeHistory.jsx.)
      const filtered = _txns.filter(t => !String(t.orderId || t.vendorId || '').toUpperCase().startsWith('WT'));
      setTransactions(filtered);
      setTotalRecords(filtered.length === _txns.length ? _total : Math.max(0, (_total || 0) - (_txns.length - filtered.length)));
    } catch (e) { console.error('MATMHistory fetch error:', e); setTransactions([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!mastersLoaded) return;
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, selectedStatus, mastersLoaded]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        let list = [];
        if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else {
          list = [];
        }
        const matmServices = list.filter(srv => String(srv.sectionType || '') === '9');
        setServiceList(matmServices);
        setMatmServiceIds(matmServices.map(s => String(s.id)));
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
        padding: '24px 32px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>Manage MATM History</h3>
          
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
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>API Provider</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'All Providers' },
                  ...(Array.isArray(apiList) ? apiList : []).map((api) => ({ 
                    value: api.id || api.apiId, 
                    label: api.apiname || api.apiName || api.name || `API #${api.id}` 
                  }))
                ]}
                value={selectedApi}
                onChange={val => setSelectedApi(val || '')}
                placeholder="All Providers"
                style={{ height: '38px', borderRadius: '10px' }}
              />
            </div>
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
                onFocus={() => setFocusedField('status')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">All Status</option>
                <option>Success</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
          
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Anything (Name, Card No, Op ID)</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <FiSearch size={14} />
                </div>
                <input 
                  type="text" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Enter keyword..." 
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
                width: '140px',
                boxSizing: 'border-box',
                flexShrink: 0,
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
                width: '120px',
                boxSizing: 'border-box',
                flexShrink: 0,
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
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
        totalAmount: transactions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0),
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

      <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Manage MATM History List</h3>
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

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="matmhistory_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search MATM logs..." />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '2200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th rowSpan="2" style={{ width: '60px' }}>Sr.No.</th>
                <th rowSpan="2">Date</th>
                <th rowSpan="2">Name</th>
                <th rowSpan="2">Operator</th>
                <th rowSpan="2">Op Bal</th>
                <th rowSpan="2">Amount</th>
                <th rowSpan="2">Cl Bal</th>
                <th rowSpan="2" style={{ textAlign: 'center' }}>Status</th>
                <th rowSpan="2">Card Number</th>
                <th rowSpan="2">Op ID</th>
                <th rowSpan="2">Provider</th>
                <th rowSpan="2">Remark</th>
                <th rowSpan="2">Request ID</th>
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
                    <td style={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem' }}>{index + 1}</td>
                    <td style={{ fontSize: '0.82rem' }}>{txn.createdDate || txn.date || 'N/A'}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem' }}>{txn.memberName || txn.customerName || 'N/A'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{txn.memberMobile || ''}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{txn.operatorName || txn.operator || 'N/A'}</td>
                    <td>₹{(txn.openingBalance || txn.opBal || 0).toFixed ? (txn.openingBalance || txn.opBal || 0).toFixed(2) : '0.00'}</td>
                    <td><span style={{ fontWeight: 800, color: '#0369A1' }}>₹{(parseFloat(txn.amount) || 0).toFixed(2)}</span></td>
                    <td>₹{(txn.closingBalance || txn.clBal || 0).toFixed ? (txn.closingBalance || txn.clBal || 0).toFixed(2) : '0.00'}</td>
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
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{txn.cardNumber || txn.accountNo || 'N/A'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{txn.operatorName || txn.operatorId || txn.opId || 'N/A'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{txn.provider || txn.apiName || 'N/A'}</td>
                    <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{txn.remark || txn.message || 'N/A'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{txn.orderId || txn.requestId || txn.refid || 'N/A'}</td>
                    <UplineCells txn={txn} transactions={transactions} onBreakdown={setBreakdownTxn} />
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="19" style={{ padding: '40px 0', color: '#A0AEC0', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>No MATM data found</span>
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
          <div onClick={() => setBreakdownTxn(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: 'linear-gradient(135deg,#0D1B5E,#1a2f8a)', borderRadius: 16, padding: '24px 28px', minWidth: 320, maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900 }}>UPLINE BREAKDOWN</div>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>TXN: {breakdownTxn.orderId || breakdownTxn.id || '—'}</p>
              </div>
              <button onClick={() => setBreakdownTxn(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Total Upline</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>₹{Number(breakdownTxn.uplineCommission || 0).toFixed(2)}</span>
            </div>
            {(breakdownTxn.uplineBreakdown || []).map((row, i) => {
              const colors = ['#1756AA','#7C3AED','#0891B2'];
              const bg = ['rgba(23,86,170,0.15)','rgba(124,58,237,0.15)','rgba(8,145,178,0.15)'];
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg[i]||bg[2], borderRadius: 8, padding: '10px 14px', marginBottom: 8, borderLeft: `3px solid ${colors[i]||colors[2]}` }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>{row.roleName || `L${i+1}`}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{row.memberName || '—'}</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4ade80' }}>₹{Number(row.amount || 0).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>,
        document.body
      )}

    </div>
  );
};
export default MATMHistory;
