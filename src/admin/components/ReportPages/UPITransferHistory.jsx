import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import { API } from '../../../api/endpoints';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import ActionMenu from '../../../shared/components/common/ActionMenu';
import ConfirmModal from '../../../shared/components/common/ConfirmModal';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import LogModal from '../../../shared/components/common/LogModal';

// Adjust this constant to match your UPI Transfer service ID
const UPI_SERVICE_ID = '6'; // Change as per your backend

const UPITransferHistory = () => {
    // ─── State ──────────────────────────────────────────────
    const [transactions, setTransactions] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedOperator, setSelectedOperator] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Dropdown lists
    const [serviceList, setServiceList] = useState([]);
    const [operatorList, setOperatorList] = useState([]);
    const [memberList, setMemberList] = useState([]);

    // UI states
    const [showStats, setShowStats] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [focusedField, setFocusedField] = useState(null);
    const [confirmData, setConfirmData] = useState({ show: false, action: null, txn: null });
    const [logModalData, setLogModalData] = useState({ show: false, txn: null });
    const { popup, showPopup, closePopup } = usePopup();

    // ─── Stats Computation ──────────────────────────────────
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

    // ─── API Calls ──────────────────────────────────────────
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await API.transaction.getAll({
                pageNumber,
                pageSize,
                fromDate,
                toDate,
                serviceId: selectedService || UPI_SERVICE_ID, // fallback to fixed if not selected
                operatorId: selectedOperator,
                memberId: selectedMember,
                status: selectedStatus,
                search: searchKeyword,
                // providerId: selectedProvider, // if needed
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
            console.error("Failed to fetch UPI transfer transactions:", err);
            setTransactions([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        fetchTransactions();
    }, [pageNumber, pageSize, selectedStatus, selectedMember, selectedService, selectedOperator, fromDate, toDate, searchKeyword]);

    // Fetch dropdowns
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await API.service.getAll();
                if (res && Array.isArray(res.data)) setServiceList(res.data);
                else if (Array.isArray(res)) setServiceList(res);
                else setServiceList([]);
            } catch (err) { console.error("Error fetching services:", err); }
        };
        const fetchOperators = async () => {
            try {
                const res = await API.operator.getAll();
                if (res?.data?.items) setOperatorList(res.data.items);
                else if (res?.data && Array.isArray(res.data)) setOperatorList(res.data);
                else if (Array.isArray(res)) setOperatorList(res);
                else setOperatorList([]);
            } catch (err) { console.error("Error fetching operators:", err); }
        };
        const fetchMembers = async () => {
            try {
                const res = await API.member.search('');
                if (res && Array.isArray(res.data)) setMemberList(res.data);
                else if (Array.isArray(res)) setMemberList(res);
                else setMemberList([]);
            } catch (err) { console.error("Error fetching members:", err); }
        };

        fetchServices();
        fetchOperators();
        fetchMembers();
    }, []);

    // ─── Handlers ────────────────────────────────────────────
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNumber(1);
        fetchTransactions();
    };

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

    // ─── Render ──────────────────────────────────────────────
    return (
        <div className={styles.container} style={{ padding: '12px', maxWidth: '100%' }}>
            {/* ── Dynamic Keyframes ── */}
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

            {/* ── FILTER CARD ── */}
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
                        {/* From Date */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
                            <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} onFocus={() => setFocusedField('fromDate')} onBlur={() => setFocusedField(null)} />
                        </div>
                        {/* To Date */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
                            <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={toDate} onChange={(e) => setToDate(e.target.value)} onFocus={() => setFocusedField('toDate')} onBlur={() => setFocusedField(null)} />
                        </div>
                        {/* Service */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Service</label>
                            <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'service' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'service' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={selectedService} onChange={(e) => setSelectedService(e.target.value)} onFocus={() => setFocusedField('service')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Services</option>
                                {serviceList.map((srv) => (
                                    <option key={srv.id} value={srv.id}>{srv.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Operator */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Operator</label>
                            <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'operator' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'operator' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)} onFocus={() => setFocusedField('operator')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Operators</option>
                                {operatorList.map((op) => (
                                    <option key={op.id || op.operatorId} value={op.id || op.operatorId}>
                                        {op.name || op.operatorName || op.title || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Member */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Select Member</label>
                            <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'member' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} onFocus={() => setFocusedField('member')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Members</option>
                                {memberList.map((m) => (
                                    <option key={m.id || m.memberId} value={m.id || m.memberId}>
                                        {m.name || m.memberId} ({m.mobile})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* API Provider */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>API Provider</label>
                            <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'provider' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'provider' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} onFocus={() => setFocusedField('provider')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Providers</option>
                                {/* You can populate this from an API if needed */}
                            </select>
                        </div>
                        {/* Status */}
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Transaction Status</label>
                            <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'status' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'status' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} onFocus={() => setFocusedField('status')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Status</option>
                                <option value="Success">Success</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                        {/* Search */}
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Anything (UPI ID, UTR, Order ID)</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                    <FiSearch size={14} />
                                </div>
                                <input type="text" placeholder="Enter keyword..." className={styles.inputControl} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} style={{ paddingLeft: '32px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
                            </div>
                        </div>
                        {/* Search Button */}
                        <div className={styles.formGroup}>
                            <button type="submit" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', height: '38px', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', width: '100%', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <FiSearch size={15} /> Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── STATS GRID ── */}
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
                                <th style={{ width: '60px' }}>#</th>
                                <th style={{ width: '80px' }}>ACTION</th>
                                <th style={{ textAlign: 'center' }}>STATUS</th>
                                <th>MEMBER NAME</th>
                                <th>TXN DATE & TIME</th>
                                <th>AMOUNT</th>
                                <th>SURCHARGE</th>
                                <th>GST</th>
                                <th>CASHBACK</th>
                                <th>TDS</th>
                                <th>ORDER ID</th>
                                <th>UPI NAME</th>
                                <th>UPI ID</th>
                                <th>OPERATOR</th>
                                <th>UTR NUMBER</th>
                                <th>VENDOR ID</th>
                                <th>PROVIDER</th>
                                <th>SOURCE</th>
                                <th>REASON</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="19" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="19" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <FiDatabase size={24} color="#94A3B8" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No UPI transfer data found</span>
                                    </div>
                                </td></tr>
                            ) : (
                                transactions.map((txn, idx) => (
                                    <tr key={txn.id || idx}>
                                        <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{((pageNumber - 1) * pageSize) + idx + 1}</td>
                                        <td>
                                            <ActionMenu
                                                txn={txn}
                                                onViewReceipt={setActiveReceipt}
                                                onAction={handleMenuAction}
                                                alignUp={idx >= transactions.length - 2}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                background: txn.status?.toLowerCase() === 'success' ? '#DCFCE7' : txn.status?.toLowerCase() === 'pending' ? '#FEF3C7' : '#FEE2E2',
                                                color: txn.status?.toLowerCase() === 'success' ? '#15803D' : txn.status?.toLowerCase() === 'pending' ? '#B45309' : '#B91C1C',
                                                border: `1px solid ${txn.status?.toLowerCase() === 'success' ? '#BBF7D0' : txn.status?.toLowerCase() === 'pending' ? '#FDE68A' : '#FECACA'}`
                                            }}>
                                                {txn.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{txn.memberName || 'N/A'}</td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {txn.createdDate ? new Date(txn.createdDate).toLocaleString('en-IN') : 'N/A'}
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#0369A1' }}>₹{parseFloat(txn.amount || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.surcharge || txn.charge || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.gst || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.cashback || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.tds || 0).toFixed(2)}</td>
                                        <td>{txn.orderId || txn.id || 'N/A'}</td>
                                        <td>{txn.upiName || 'N/A'}</td>
                                        <td>{txn.upiId || txn.upi || 'N/A'}</td>
                                        <td>{txn.operator || txn.operatorName || 'N/A'}</td>
                                        <td>{txn.utrNumber || txn.utr || 'N/A'}</td>
                                        <td>{txn.vendorId || 'N/A'}</td>
                                        <td>{txn.providerName || txn.provider || 'N/A'}</td>
                                        <td>{txn.source || 'N/A'}</td>
                                        <td style={{ color: '#64748B', fontSize: '0.8rem', fontStyle: 'italic' }}>{txn.remark || txn.reason || 'N/A'}</td>
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

            {/* ── Modals ── */}
            {activeReceipt && (
                <TransactionReceipt
                    data={{
                        mode: 'UPI',
                        amount: parseFloat(activeReceipt.amount || 0),
                        charge: parseFloat(activeReceipt.surcharge || activeReceipt.charge || 0),
                        date: activeReceipt.createdDate ? new Date(activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
                        customerName: activeReceipt.customerName || activeReceipt.memberName || 'N/A',
                        customerMobile: activeReceipt.customerMobile || activeReceipt.mobile || 'N/A',
                        beneficiary: activeReceipt.beniName || activeReceipt.upiName || 'N/A',
                        bank: activeReceipt.bankName || 'N/A',
                        accountNo: activeReceipt.accountNo || activeReceipt.upiId || 'N/A',
                        total: parseFloat(activeReceipt.amount || 0),
                        chunks: [{ txnId: activeReceipt.orderId || activeReceipt.id || 'N/A', amount: parseFloat(activeReceipt.amount || 0) }],
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

export default UPITransferHistory;