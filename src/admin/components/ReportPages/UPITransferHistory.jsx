import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GroupHeader, SubHeader, Cells as UplineCells } from '../../../shared/components/common/UplineCommissionCols';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import { API } from '../../../api/endpoints';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { normalizeTxnResponse } from '../../../services/transaction.service';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2, FiRefreshCw
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import ActionMenu from '../../../shared/components/common/ActionMenu';
import ConfirmModal from '../../../shared/components/common/ConfirmModal';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import LogModal from '../../../shared/components/common/LogModal';

const UPI_SERVICE_ID = '12'; 
const UPITransferHistory = () => {
        const [transactions, setTransactions] = useState([]);
    const [breakdownTxn, setBreakdownTxn] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

        const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [selectedService, setSelectedService] = useState('');
    const [selectedOperator, setSelectedOperator] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

        const [serviceList, setServiceList] = useState([]);
    const [operatorList, setOperatorList] = useState([]);
    const [memberList, setMemberList] = useState([]);
    const [apiList, setApiList] = useState([]);

        const [showStats, setShowStats] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);
  const [forceDataMap, setForceDataMap] = useState({});   // txnId -> {action,utr,reason}
    const [focusedField, setFocusedField] = useState(null);
    const [confirmData, setConfirmData] = useState({ show: false, action: null, txn: null });
  const confirmTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current); };
  }, []);

    const [logModalData, setLogModalData] = useState({ show: false, txn: null });
    const { popup, showPopup, closePopup } = usePopup();

        const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
    const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
    const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;

    const totalTxns = totalRecords;
    const totalAmount = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const totalCharge = transactions.reduce((acc, t) => acc + (parseFloat(t.surcharge || t.charge) || 0), 0);
    const totalGST = transactions.reduce((acc, t) => acc + (parseFloat(t.gst) || 0), 0);
    const totalCommission = transactions.reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0);
    const totalTDS = transactions.reduce((acc, t) => acc + (parseFloat(t.tds) || 0), 0);

    const uplineCommission = totalCommission * 0.6;
    const adminCommission = totalCommission * 0.4;
    const adminProfit = totalCommission * 0.15;
    const tdsPayable = totalTDS * 0.95;
    const netPayable = totalAmount - totalCommission - totalTDS;

    const stats = {
        totalTxns,
        totalAmount,
        successTxns: successCount,
        failedTxns: failedCount,
        pendingTxns: pendingCount,
        totalCommission,
        uplineCommission,
        adminCommission,
        totalTds: totalTDS,
        adminProfit,
        tdsPayable,
        netPayable,
    };

        const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await API.transaction.getAll({
                pageNumber,
                pageSize,
                fromDate,
                toDate,
                sectionType: selectedService || UPI_SERVICE_ID,                 operatorId: selectedOperator,
                memberId: selectedMember,
                status: selectedStatus,
                search: searchKeyword,
                apiId: selectedProvider,
                            });

                  const { items: _txns, totalItems: _total, totalSuccess: _succ, totalPending: _pend, totalFailed: _fail } = normalizeTxnResponse(res);
      setTransactions(_txns);
      setTotalRecords(_total);
        } catch (err) {
            console.error("Failed to fetch UPI transfer transactions:", err);
            setTransactions([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

        useEffect(() => {
        fetchTransactions();
    }, [pageNumber, pageSize, selectedStatus, selectedMember, selectedService, selectedOperator, fromDate, toDate, searchKeyword]);

        useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await API.service.getAll();
                if (res && Array.isArray(res.data)) setServiceList(res.data);
                else if (Array.isArray(res)) setServiceList(res);
                else setServiceList([]);
            } catch (err) { console.error("Error fetching services:", err); }
        };
        const fetchMembers = async () => {
            try {
                const res = await API.member.getAll({ pageNumber: 1, pageSize: 5000 });
                const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
                setMemberList(Array.isArray(list) ? list : []);
            } catch (err) { console.error("Error fetching members:", err); }
        };

        fetchServices();
        fetchMembers();
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

        const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNumber(1);
        fetchTransactions();
    };

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
            `}</style>

                        <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(23, 86, 170, 0.04), 0 1px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid #E2E8F0',
                padding: '24px 32px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>UPI Transfer History</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                        >
                            <FiBarChart2 size={16} />
                            {showStats ? 'Hide Stats' : 'View Stats'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
                                                <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
                            <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} onFocus={() => setFocusedField('fromDate')} onBlur={() => setFocusedField(null)} />
                        </div>
                                                <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
                            <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={toDate} onChange={(e) => setToDate(e.target.value)} onFocus={() => setFocusedField('toDate')} onBlur={() => setFocusedField(null)} />
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
                                value={selectedProvider}
                                onChange={val => setSelectedProvider(val || '')}
                                placeholder="All Providers"
                                style={{ height: '38px', borderRadius: '10px' }}
                            />
                        </div>
                                                <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Transaction Status</label>
                            <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'status' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'status' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} onFocus={() => setFocusedField('status')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Status</option>
                                <option value="Success">Success</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                                                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Anything (UPI ID, UTR, Order ID)</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                    <FiSearch size={14} />
                                </div>
                                <input type="text" placeholder="Enter keyword..." className={styles.inputControl} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} style={{ paddingLeft: '32px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                            <button type="submit" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', height: '38px', width: '140px', boxSizing: 'border-box', flexShrink: 0, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <FiSearch size={15} /> Search
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
                                    setSelectedStatus('');
                                    setSelectedProvider('');
                                    setSearchKeyword('');
                                    setPageNumber(1);
                                }}
                                style={{ background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: '10px', height: '38px', width: '120px', boxSizing: 'border-box', flexShrink: 0, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', padding: '0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.color = '#1756AA'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569'; }}
                            >
                                <FiRefreshCw size={14} /> Reset
                            </button>
                    </div>
                </form>
            </div>

                        <StatsGrid stats={stats} showStats={showStats} />

            {/* ── DATA TABLE ── */}
            <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>UPI Transfer History List</h3>
                </div>
                <div className="global-table-toolbar" style={{ padding: '10px 15px' }}>
                    <div className={styles.pillRow} style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
                        <select className={styles.selectEntries} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
                    </div>
                    <ExportButtons headers={[]} rows={[]} fileNamePrefix="upitransferhistory_report" sheetName="Report" />
                    <div className="global-search-box">
                        <FiSearch />
                        <input type="text" placeholder="Filter results..." />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table} style={{ minWidth: '2400px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                                <th rowSpan="2" style={{ width: '60px' }}>S.No</th>
                                <th rowSpan="2" style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                                <th rowSpan="2">Date</th>
                                <th rowSpan="2" style={{ textAlign: 'center' }}>Status</th>
                                <th rowSpan="2">Amount</th>
                                <th rowSpan="2">Member</th>
                                <th rowSpan="2">UPI ID</th>
                                <th rowSpan="2">UPI name</th>
                                <th rowSpan="2">Op. bal</th>
                                <th rowSpan="2">Cl. bal</th>
                                <th rowSpan="2">Surcharge</th>
                                <th rowSpan="2">GST</th>
                                <th rowSpan="2">Order ID</th>
                                <th rowSpan="2">Remark</th>
                                <th rowSpan="2">Source</th>
                                <th rowSpan="2">Chain comm.</th>
                                <th rowSpan="2">Admin profit</th>
                                <GroupHeader transactions={transactions} />
                            </tr>
                            <tr style={{ background: 'linear-gradient(90deg, #1a2f8a 0%, #0D1B5E 100%)' }}>
                                <SubHeader transactions={transactions} />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="18" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="18" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <FiDatabase size={24} color="#94A3B8" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No UPI transfer data found</span>
                                    </div>
                                </td></tr>
                            ) : (
                                transactions.map((txn, idx) => (
                                    <tr key={txn.id || idx} style={(() => {
                      const s = (txn.status || '').toLowerCase();
                      if (s === 'success') return { background: '#F0FDF4' };
                      if (s === 'pending') return { background: '#FFFBEB' };
                      if (s === 'processing') return { background: '#EFF6FF' };
                      return { background: '#FFF5F5' };
                    })()}>
                                        <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{((pageNumber - 1) * pageSize) + idx + 1}</td>
                                        <td>
                                            <ActionMenu
                                                txn={txn}
                                                onViewReceipt={txn => {
                            const fd = forceDataMap[txn.id || txn.orderId];
                            setActiveReceipt({ ...txn, _type: 'upi', forceAction: fd?.action, forceUtr: fd?.utr, forceReason: fd?.reason });
                          }}
                                                onAction={handleMenuAction}
                                                alignUp={idx >= transactions.length - 2}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ color: '#0D1B3E', fontWeight: '800', fontSize: '0.85rem' }}>{txn.createdDate?.split('T')[0] || txn.date?.split('T')[0] || 'N/A'}</div>
                                            <div style={{ color: '#718096', fontSize: '0.75rem', fontWeight: '600', marginTop: '2px' }}>{txn.createdDate?.split('T')[1]?.split('.')[0] || ''}</div>
                                        </td>
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
                                        <td>
                                            <span style={{ fontWeight: '800', color: '#0369A1', background: '#E0F2FE', padding: '4px 8px', borderRadius: '6px' }}>
                                                ₹{(txn.amount || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#1756AA' }}>{txn.memberName || 'N/A'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#4E6080' }}>{txn.memberId || 'N/A'}</div>
                                        </td>
                                        <td>{txn.accountNo || txn.upiId || 'N/A'}</td>
                                        <td>{txn.beniName || txn.upiName || 'N/A'}</td>
                                        <td>₹{(txn.openingBalance || txn.opBal || 0).toFixed(2)}</td>
                                        <td>₹{(txn.closingBalance || txn.clBal || 0).toFixed(2)}</td>
                                        <td style={{ fontWeight: '600', color: '#64748B' }}>₹{(txn.surcharge || 0).toFixed(2)}</td>
                                        <td style={{ fontWeight: '600', color: '#64748B' }}>₹{(txn.gst || 0).toFixed(2)}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{txn.orderId || txn.txnId || txn.refid || 'N/A'}</td>
                                        <td>{txn.remark || txn.message || txn.reason || 'N/A'}</td>
                                        <td>{txn.source || txn.fromChannel || 'N/A'}</td>
                                        <td style={{ fontWeight: '600', color: '#64748B' }}>₹{(txn.chainComm || 0).toFixed(2)}</td>
                                        <td style={{ fontWeight: '600', color: '#64748B' }}>₹{(txn.adminProfit || 0).toFixed(2)}</td>
                                        <UplineCells txn={txn} transactions={transactions} onBreakdown={setBreakdownTxn} />
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
                        Showing {transactions.length > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0} to {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords} entries
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}>
                            <FiChevronLeft />
                        </button>
                        <button className="global-page-btn global-page-active">{pageNumber}</button>
                        <button className="global-page-btn" onClick={() => setPageNumber(p => p + 1)} disabled={pageNumber * pageSize >= totalRecords}>
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
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

export default UPITransferHistory;
