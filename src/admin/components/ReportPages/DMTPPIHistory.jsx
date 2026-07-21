import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';

// Fixed service ID for DMT PPI – adjust as needed
const DMT_PPI_SERVICE_ID = '7'; // Example ID, change to actual

const DMTPPIHistory = () => {
    // ─── State ──────────────────────────────────────────────
    const [transactions, setTransactions] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [txnMode, setTxnMode] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Member list for dropdown
    const [memberList, setMemberList] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    // ─── Stats Computation ──────────────────────────────────
    const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
    const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
    const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;

    const totalTxns = totalRecords;
    const totalAmount = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const totalCharge = transactions.reduce((acc, t) => acc + (parseFloat(t.charge) || 0), 0);
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
                serviceId: DMT_PPI_SERVICE_ID,
                memberId: selectedMember,
                status: selectedStatus,
                search: searchKeyword,
                // additional filters like txnMode if needed
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
            console.error("Failed to fetch DMT PPI transactions:", err);
            setTransactions([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        fetchTransactions();
    }, [pageNumber, pageSize, selectedStatus, selectedMember, fromDate, toDate, searchKeyword]);

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

    // ─── Handlers ────────────────────────────────────────────
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNumber(1);
        fetchTransactions();
    };

    // ─── Render ──────────────────────────────────────────────
    return (
        <div className={styles.container} style={{ padding: '20px' }}>
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
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
                border: '1px solid #E2E8F0',
                padding: '12px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>DMT PPI History</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Toggle Stats Button */}
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
                            <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} onFocus={() => setFocusedField('fromDate')} onBlur={() => setFocusedField(null)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
                            <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} value={toDate} onChange={(e) => setToDate(e.target.value)} onFocus={() => setFocusedField('toDate')} onBlur={() => setFocusedField(null)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Select Member</label>
                            <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'member' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('member')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Members</option>
                                {memberList.map(m => (
                                    <option key={m.memberId || m.id} value={m.memberId || m.id}>
                                        {m.name} ({m.mobile})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Txn Mode</label>
                            <select value={txnMode} onChange={(e) => setTxnMode(e.target.value)} className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'mode' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'mode' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('mode')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Modes</option>
                                {/* Add options as needed */}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Status</label>
                            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'status' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'status' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('status')} onBlur={() => setFocusedField(null)}>
                                <option value="">All Status</option>
                                <option value="Success">Success</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search (Mobile, UTR, Trans ID)</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                    <FiSearch size={14} />
                                </div>
                                <input type="text" placeholder="Enter keyword..." className={styles.inputControl} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} style={{ paddingLeft: '32px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
                            </div>
                        </div>
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
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>DMT PPI History List</h3>
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
                    <ExportButtons headers={[]} rows={[]} fileNamePrefix="dmtppihistory_report" sheetName="Report" />
                    <div className="global-search-box">
                        <FiSearch />
                        <input type="text" placeholder="Filter results..." />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table} style={{ minWidth: '3200px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                                <th style={{ width: '60px' }}>#</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>ACTION</th>
                                <th>MEMBER NAME</th>
                                <th>MEMBER ID</th>
                                <th>CUST MOBILE</th>
                                <th>DATE & TIME</th>
                                <th>AMOUNT</th>
                                <th>CHARGE</th>
                                <th>GST</th>
                                <th>COMMISSION</th>
                                <th>TDS</th>
                                <th>API NAME</th>
                                <th>UTR NUMBER</th>
                                <th>TRANS ID</th>
                                <th>VENDOR ID</th>
                                <th>BANK NAME</th>
                                <th>ACCOUNT NO</th>
                                <th>IFSC CODE</th>
                                <th>BENI NAME</th>
                                <th>SOURCE</th>
                                <th style={{ textAlign: 'center' }}>STATUS</th>
                                <th>REASON</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>RECEIPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="23" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="23" style={{ padding: '30px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <FiDatabase size={24} color="#94A3B8" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No PPI records found</span>
                                    </div>
                                </td></tr>
                            ) : (
                                transactions.map((txn, idx) => (
                                    <tr key={txn.id || idx}>
                                        <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{((pageNumber - 1) * pageSize) + idx + 1}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                onClick={() => setActiveReceipt(txn)}
                                                style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                            >
                                                <FiCheckCircle size={12} /> VIEW
                                            </button>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{txn.memberName || 'N/A'}</td>
                                        <td>{txn.memberId || 'N/A'}</td>
                                        <td>{txn.customerMobile || txn.mobile || 'N/A'}</td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {txn.createdDate ? new Date(txn.createdDate).toLocaleString('en-IN') : 'N/A'}
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#0369A1' }}>₹{parseFloat(txn.amount || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.charge || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.gst || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.commission || 0).toFixed(2)}</td>
                                        <td>₹{parseFloat(txn.tds || 0).toFixed(2)}</td>
                                        <td>{txn.apiName || 'N/A'}</td>
                                        <td>{txn.utrNumber || txn.utr || 'N/A'}</td>
                                        <td>{txn.transId || txn.id || 'N/A'}</td>
                                        <td>{txn.vendorId || 'N/A'}</td>
                                        <td>{txn.bankName || 'N/A'}</td>
                                        <td>{txn.accountNo || 'N/A'}</td>
                                        <td>{txn.ifscCode || 'N/A'}</td>
                                        <td>{txn.beniName || 'N/A'}</td>
                                        <td>{txn.source || 'N/A'}</td>
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
                                        <td style={{ color: '#64748B', fontSize: '0.8rem', fontStyle: 'italic' }}>{txn.remark || txn.reason || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #BAE6FD' }}>
                                                RECEIPT
                                            </span>
                                        </td>
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
                    data={{
                        mode: 'DMT PPI',
                        amount: parseFloat(activeReceipt.amount || 0),
                        charge: parseFloat(activeReceipt.charge || 0),
                        date: activeReceipt.createdDate ? new Date(activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
                        customerName: activeReceipt.customerName || activeReceipt.memberName || 'N/A',
                        customerMobile: activeReceipt.customerMobile || activeReceipt.mobile || 'N/A',
                        beneficiary: activeReceipt.beniName || 'N/A',
                        bank: activeReceipt.bankName || 'N/A',
                        accountNo: activeReceipt.accountNo || 'N/A',
                        total: parseFloat(activeReceipt.amount || 0),
                        chunks: [{ txnId: activeReceipt.transId || activeReceipt.id || 'N/A', amount: parseFloat(activeReceipt.amount || 0) }],
                        status: activeReceipt.status || 'N/A',
                        remark: activeReceipt.remark || 'N/A'
                    }}
                    onClose={() => setActiveReceipt(null)}
                />
            )}
        </div>
    );
};

export default DMTPPIHistory;