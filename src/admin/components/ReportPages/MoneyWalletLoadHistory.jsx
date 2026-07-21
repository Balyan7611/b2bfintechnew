import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import { API } from '../../../api/endpoints';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2, FiInfo, FiPlusCircle
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';

// Adjust this constant to match your Money Wallet Load service ID
const WALLET_LOAD_SERVICE_ID = '11'; // Change as per your backend

const MoneyWalletLoadHistory = () => {
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
    const [searchKeyword, setSearchKeyword] = useState('');

    // Dropdown lists
    const [memberList, setMemberList] = useState([]);

    // UI states
    const [showStats, setShowStats] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    // ─── Stats Computation ──────────────────────────────────
    const totalTxns = totalRecords;
    const totalAmount = transactions.reduce((acc, t) => acc + (parseFloat(t.loadAmount || t.amount) || 0), 0);
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
                serviceId: WALLET_LOAD_SERVICE_ID, // Use the specific service ID
                memberId: selectedMember,
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
            console.error("Failed to fetch wallet load transactions:", err);
            setTransactions([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        fetchTransactions();
    }, [pageNumber, pageSize, selectedMember, fromDate, toDate, searchKeyword]);

    // Fetch members for dropdown
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await API.member.search('');
                if (res && Array.isArray(res.data)) setMemberList(res.data);
                else if (Array.isArray(res)) setMemberList(res);
                else setMemberList([]);
            } catch (err) { console.error("Error fetching members:", err); }
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
        <div className={styles.container}>
            {/* ── FILTER CARD ── */}
            <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Money Wallet Load History</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(43, 108, 176, 0.1)', color: '#2B6CB0', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* <FiPlusCircle /> Wallet Audit Active */}
                        </div>
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

                <div style={{ padding: '20px', background: '#FAFBFC' }}>
                    <form onSubmit={handleSearchSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s', color: '#334155' }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} onFocus={() => setFocusedField('fromDate')} onBlur={() => setFocusedField(null)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s', color: '#334155' }} value={toDate} onChange={(e) => setToDate(e.target.value)} onFocus={() => setFocusedField('toDate')} onBlur={() => setFocusedField(null)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Select Member</label>
                                <select className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s', color: '#334155' }} value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} onFocus={() => setFocusedField('member')} onBlur={() => setFocusedField(null)}>
                                    <option value="">All Active Members</option>
                                    {memberList.map((m) => (
                                        <option key={m.id || m.memberId} value={m.id || m.memberId}>
                                            {m.name || m.memberId} ({m.mobile})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Anything</label>
                                <div style={{ position: 'relative' }}>
                                    <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                    <input type="text" placeholder="Order ID, Mobile..." className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', outline: 'none', transition: 'all 0.25s', boxSizing: 'border-box' }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
                                </div>
                            </div>
                            <div>
                                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}>
                                    <FiSearch /> Search Wallet Logs
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── STATS GRID ── */}
            <StatsGrid stats={stats} showStats={showStats} />

            {/* ── DATA TABLE ── */}
            <div className={styles.cardFullMobile}>
                <div className="global-table-toolbar">
                    <div className={styles.pillRow} style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
                        <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
                    </div>

                    <ExportButtons headers={[]} rows={[]} fileNamePrefix="moneywalletloadhistory_report" sheetName="Report" />

                    <div className="global-search-box">
                        <FiSearch />
                        <input type="text" placeholder="Search wallet logs..." value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value); setPageNumber(1); }} />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table} style={{ minWidth: '2200px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                                <th style={{ width: '60px' }}>#</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                                <th>MEMBER NAME</th>
                                <th>MEMBER ID</th>
                                <th>MERCHANT CODE</th>
                                <th>MOBILE NUMBER</th>
                                <th>LOAD AMOUNT</th>
                                <th>API CHARGE</th>
                                <th>GST</th>
                                <th>OPENING BAL</th>
                                <th>CLOSING BAL</th>
                                <th>COMMISSION</th>
                                <th>TDS</th>
                                <th>TXN COST</th>
                                <th>ORDER ID</th>
                                <th style={{ textAlign: 'center' }}>STATUS</th>
                                <th>LOAD DATE & TIME</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>RECEIPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="18" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading wallet transactions...</td></tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan="18" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                                                <FiDatabase size={24} color="#94A3B8" />
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No wallet load history found</span>
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
                                                    style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 78, 216, 0.15)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <FiInfo size={12} /> VIEW
                                                </button>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{txn.memberName || txn.member || 'N/A'}</td>
                                            <td>{txn.memberId || 'N/A'}</td>
                                            <td>{txn.merchantCode || 'N/A'}</td>
                                            <td>{txn.mobile || txn.memberMobile || 'N/A'}</td>
                                            <td style={{ fontWeight: 700, color: '#0369A1' }}>₹{parseFloat(txn.loadAmount || txn.amount || 0).toFixed(2)}</td>
                                            <td>₹{parseFloat(txn.apiCharge || txn.charge || 0).toFixed(2)}</td>
                                            <td>₹{parseFloat(txn.gst || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 500, color: '#475569' }}>₹{parseFloat(txn.openingBal || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{parseFloat(txn.closingBal || 0).toFixed(2)}</td>
                                            <td style={{ color: '#10B981' }}>₹{parseFloat(txn.commission || 0).toFixed(2)}</td>
                                            <td style={{ color: '#EF4444' }}>₹{parseFloat(txn.tds || 0).toFixed(2)}</td>
                                            <td>₹{parseFloat(txn.txnCost || 0).toFixed(2)}</td>
                                            <td>{txn.orderId || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {renderStatusBadge(txn.status)}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                {txn.loadDate || txn.createdDate ? new Date(txn.loadDate || txn.createdDate).toLocaleString('en-IN') : 'N/A'}
                                            </td>
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

                <div className="global-pagination">
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
                        mode: 'WALLET_LOAD',
                        amount: parseFloat(activeReceipt.loadAmount || activeReceipt.amount || 0),
                        charge: parseFloat(activeReceipt.apiCharge || activeReceipt.charge || 0),
                        date: activeReceipt.loadDate || activeReceipt.createdDate ? new Date(activeReceipt.loadDate || activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
                        customerName: activeReceipt.memberName || 'N/A',
                        customerMobile: activeReceipt.mobile || 'N/A',
                        beneficiary: 'Wallet Load',
                        bank: 'N/A',
                        accountNo: activeReceipt.orderId || 'N/A',
                        total: parseFloat(activeReceipt.loadAmount || activeReceipt.amount || 0),
                        chunks: [{ txnId: activeReceipt.orderId || 'N/A', amount: parseFloat(activeReceipt.loadAmount || activeReceipt.amount || 0) }],
                        status: activeReceipt.status || 'N/A',
                        remark: activeReceipt.remark || 'N/A'
                    }}
                    onClose={() => setActiveReceipt(null)}
                />
            )}
        </div>
    );
};

export default MoneyWalletLoadHistory;