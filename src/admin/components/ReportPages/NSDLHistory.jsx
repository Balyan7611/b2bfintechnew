import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import { API } from '../../../api/endpoints';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2, FiInfo
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';

// Adjust this constant to match your NSDL service ID
const NSDL_SERVICE_ID = '12'; // Change as per your backend

const NSDLHistory = () => {
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
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Dropdown lists
    const [serviceList, setServiceList] = useState([]);
    const [memberList, setMemberList] = useState([]);

    // UI states
    const [showStats, setShowStats] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    // ─── Stats Computation ──────────────────────────────────
    const totalTxns = totalRecords;
    const totalAmount = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
    const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
    const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;

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
                serviceId: selectedService || NSDL_SERVICE_ID,
                memberId: selectedMember,
                status: selectedStatus,
                search: searchKeyword,
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
            console.error("Failed to fetch NSDL transactions:", err);
            setTransactions([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        fetchTransactions();
    }, [pageNumber, pageSize, selectedStatus, selectedMember, selectedService, fromDate, toDate, searchKeyword]);

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
        const fetchMembers = async () => {
            try {
                const res = await API.member.search('');
                if (res && Array.isArray(res.data)) setMemberList(res.data);
                else if (Array.isArray(res)) setMemberList(res);
                else setMemberList([]);
            } catch (err) { console.error("Error fetching members:", err); }
        };
        fetchServices();
        fetchMembers();
    }, []);

    // ─── Handlers ────────────────────────────────────────────
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNumber(1);
        fetchTransactions();
    };

    // ─── Render ──────────────────────────────────────────────
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    const currentRows = transactions.slice(startIndex, startIndex + pageSize);

    const renderStatusBadge = (status) => {
        const map = {
            'success': { bg: '#DEF7EC', color: '#03543F', border: '#BCF0DA' },
            'pending': { bg: '#FEF9C3', color: '#713F12', border: '#FEF08A' },
            'failed': { bg: '#FDE8E8', color: '#9B1C1C', border: '#F8B4B4' },
        };
        const style = map[status?.toLowerCase()] || map['pending'];
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`
            }}>
                {status}
            </span>
        );
    };

    return (
        <div className={styles.container} style={{ padding: '20px' }}>
            {/* ── FILTER CARD ── */}
            <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
                border: '1px solid #E2E8F0',
                padding: '12px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>NSDL History</h3>
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
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Anything (Name, Number, Op ID)</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                    <FiSearch size={14} />
                                </div>
                                <input type="text" placeholder="Enter keyword..." className={styles.inputControl} style={{ paddingLeft: '32px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
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
            <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>NSDL History List</h3>
                </div>
                <div className="global-table-toolbar" style={{ padding: '10px 15px' }}>
                    <div className={styles.pillRow} style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
                        <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
                    </div>

                    <ExportButtons headers={[]} rows={[]} fileNamePrefix="nsdlhistory_report" sheetName="Report" />

                    <div className="global-search-box">
                        <FiSearch />
                        <input type="text" placeholder="Search NSDL logs..." value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value); setPageNumber(1); }} />
                    </div>
                </div>

                <div className={styles.tableWrapper} style={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', overflowY: 'hidden', minHeight: 'auto' }}>
                    <table className={styles.table} style={{ minWidth: '1800px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                                <th style={{ width: '60px' }}>#</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                                <th>DATE & TIME</th>
                                <th>MEMBER NAME</th>
                                <th>NUMBER</th>
                                <th>OPERATOR</th>
                                <th>OP BAL</th>
                                <th>AMOUNT</th>
                                <th>TDS</th>
                                <th>CL BAL</th>
                                <th style={{ textAlign: 'center' }}>STATUS</th>
                                <th>OPERATOR ID</th>
                                <th>REMARK</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>RECEIPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="14" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading NSDL transactions...</td></tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan="14" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                                                <FiDatabase size={24} color="#94A3B8" />
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No NSDL records found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentRows.map((txn, idx) => {
                                    const rowIndex = (pageNumber - 1) * pageSize + idx + 1;
                                    return (
                                        <tr key={txn.id || idx}>
                                            <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{rowIndex}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setActiveReceipt(txn)}
                                                    style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 78, 216, 0.15)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <FiInfo size={12} /> VIEW
                                                </button>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                {txn.dateTime || txn.createdDate ? new Date(txn.dateTime || txn.createdDate).toLocaleString('en-IN') : 'N/A'}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{txn.memberName || txn.member || 'N/A'}</td>
                                            <td>{txn.number || txn.mobile || 'N/A'}</td>
                                            <td>{txn.operator || txn.op || 'N/A'}</td>
                                            <td style={{ fontWeight: 500, color: '#475569' }}>₹{parseFloat(txn.opBal || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: '#0369A1' }}>₹{parseFloat(txn.amount || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 600, color: '#EF4444' }}>₹{parseFloat(txn.tds || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{parseFloat(txn.clBal || 0).toFixed(2)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {renderStatusBadge(txn.status)}
                                            </td>
                                            <td>{txn.operatorId || txn.opid || 'N/A'}</td>
                                            <td style={{ color: '#64748B', fontSize: '0.8rem', fontStyle: 'italic' }}>{txn.remark || txn.reason || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setActiveReceipt(txn)}
                                                    style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #BAE6FD', cursor: 'pointer' }}
                                                >
                                                    RECEIPT
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
                        Showing {totalRecords > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} entries
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}>
                            <FiChevronLeft />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button key={page} className={`global-page-btn ${page === pageNumber ? 'global-page-active' : ''}`} onClick={() => setPageNumber(page)}>
                                {page}
                            </button>
                        ))}
                        <button className="global-page-btn" onClick={() => setPageNumber(p => p + 1)} disabled={pageNumber === totalPages}>
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Receipt Modal ── */}
            {activeReceipt && (
                <TransactionReceipt
                    data={{
                        mode: 'NSDL',
                        amount: parseFloat(activeReceipt.amount || 0),
                        charge: parseFloat(activeReceipt.charge || 0),
                        date: activeReceipt.createdDate ? new Date(activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
                        customerName: activeReceipt.customerName || activeReceipt.memberName || 'N/A',
                        customerMobile: activeReceipt.customerMobile || activeReceipt.mobile || 'N/A',
                        beneficiary: activeReceipt.beniName || activeReceipt.operatorName || activeReceipt.operator || 'N/A',
                        bank: activeReceipt.bankName || 'N/A',
                        accountNo: activeReceipt.accountNo || activeReceipt.number || 'N/A',
                        total: parseFloat(activeReceipt.amount || 0),
                        chunks: [{ txnId: activeReceipt.orderId || activeReceipt.refid || activeReceipt.txnId || 'N/A', amount: parseFloat(activeReceipt.amount || 0) }],
                        status: activeReceipt.status || 'N/A',
                        remark: activeReceipt.remark || 'N/A'
                    }}
                    onClose={() => setActiveReceipt(null)}
                />
            )}
        </div>
    );
};

export default NSDLHistory;