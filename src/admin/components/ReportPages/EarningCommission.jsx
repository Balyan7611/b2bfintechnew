import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2, FiInfo, FiTrendingUp
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';

// Fixed service ID for commission transactions – adjust if needed
const COMMISSION_SERVICE_ID = '0'; // Use a specific service ID for commissions if required

const EarningCommission = () => {
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
    const [selectedService, setSelectedService] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Dropdown lists
    const [memberList, setMemberList] = useState([]);
    const [serviceList, setServiceList] = useState([]);

    // UI states
    const [showStats, setShowStats] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    // ─── Stats Computation ──────────────────────────────────
    const totalTxns = totalRecords;
    const totalAmount = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
    const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
    const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed' || t.status?.toLowerCase() === 'rejected').length;

    const totalCommission = transactions.reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0);
    const totalTDS = transactions.reduce((acc, t) => acc + (parseFloat(t.tds) || 0), 0);

    // Derived values (using typical ratios)
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
            // Use the transaction API to fetch commission data
            // You can filter by serviceId, or use a dedicated commission endpoint
            const res = await API.transaction.getAll({
                pageNumber,
                pageSize,
                fromDate,
                toDate,
                serviceId: selectedService || COMMISSION_SERVICE_ID,
                memberId: selectedMember,
                search: searchKeyword,
                // Add other filters if needed (e.g., hasCommission: true)
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
            console.error("Failed to fetch commission transactions:", err);
            setTransactions([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        fetchTransactions();
    }, [pageNumber, pageSize, selectedMember, selectedService, fromDate, toDate, searchKeyword]);

    // Fetch dropdowns
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await API.member.search('');
                setMemberList(res || []);
            } catch (err) { console.error("Failed to fetch members:", err); }
        };
        const fetchServices = async () => {
            try {
                const res = await API.service.getAll();
                if (res && Array.isArray(res.data)) setServiceList(res.data);
                else if (Array.isArray(res)) setServiceList(res);
                else setServiceList([]);
            } catch (err) { console.error("Failed to fetch services:", err); }
        };
        fetchMembers();
        fetchServices();
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
            'rejected': { bg: '#FDE8E8', color: '#9B1C1C', border: '#F8B4B4' },
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
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Earning Commission Downline</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(56, 161, 105, 0.1)', color: '#38A169', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiTrendingUp /> Profit Tracking Active
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
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Select User</label>
                                <select className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s', color: '#334155' }} value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} onFocus={() => setFocusedField('member')} onBlur={() => setFocusedField(null)}>
                                    <option value="">All Downline Members</option>
                                    {memberList.map(m => (
                                        <option key={m.memberId || m.id} value={m.memberId || m.id}>
                                            {m.name} ({m.mobile})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Service</label>
                                <select className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'service' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s', color: '#334155' }} value={selectedService} onChange={(e) => setSelectedService(e.target.value)} onFocus={() => setFocusedField('service')} onBlur={() => setFocusedField(null)}>
                                    <option value="">All Services</option>
                                    {serviceList.map(s => (
                                        <option key={s.id || s.serviceId} value={s.id || s.serviceId}>
                                            {s.serviceName || s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Anything</label>
                                <div style={{ position: 'relative' }}>
                                    <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                    <input type="text" placeholder="User, Particular..." className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', outline: 'none', transition: 'all 0.25s', boxSizing: 'border-box' }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
                                </div>
                            </div>
                            <div>
                                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}>
                                    <FiSearch /> Generate Report
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

                    <ExportButtons headers={[]} rows={[]} fileNamePrefix="earningcommission_report" sheetName="Report" />

                    <div className="global-search-box">
                        <FiSearch />
                        <input type="text" placeholder="Search commission logs..." value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value); setPageNumber(1); }} />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table} style={{ minWidth: '1800px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                                <th style={{ width: '60px' }}>#</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                                <th>MEMBER USERNAME</th>
                                <th>TXN DATE & TIME</th>
                                <th>PARTICULARS</th>
                                <th>TRANS TYPE</th>
                                <th>AMOUNT</th>
                                <th>COMMISSION</th>
                                <th>TDS</th>
                                <th>GST</th>
                                <th>NET COMM</th>
                                <th>OPENING BAL</th>
                                <th>CLOSING BAL</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>RECEIPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="14" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading commission data...</td></tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan="14" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                                                <FiDatabase size={24} color="#94A3B8" />
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No commission data found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentRows.map((t, idx) => {
                                    const rowIndex = (pageNumber - 1) * pageSize + idx + 1;
                                    return (
                                        <tr key={t.id || idx} className={styles.hoverRow}>
                                            <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{rowIndex}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setActiveReceipt(t)}
                                                    style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 78, 216, 0.15)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <FiInfo size={12} /> VIEW
                                                </button>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.8rem' }}>{t.memberName || t.member || 'N/A'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{t.mobile || t.memberMobile || ''}</div>
                                            </td>
                                            <td style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                                                {t.date || t.createdDate ? new Date(t.date || t.createdDate).toLocaleString('en-IN') : 'N/A'}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{t.particulars || t.remarks || 'N/A'}</td>
                                            <td>
                                                <span style={{
                                                    background: (t.type || t.txnType) === 'Credit' ? '#ECFDF5' : '#FEF2F2',
                                                    color: (t.type || t.txnType) === 'Credit' ? '#059669' : '#DC2626',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                                                    border: `1px solid ${(t.type || t.txnType) === 'Credit' ? '#A7F3D0' : '#FECACA'}`
                                                }}>
                                                    {t.type || t.txnType || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 800, color: '#0F172A' }}>₹{parseFloat(t.amount || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: '#10B981' }}>+ ₹{parseFloat(t.commission || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 600, color: '#EF4444' }}>- ₹{parseFloat(t.tds || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 600, color: '#F59E0B' }}>- ₹{parseFloat(t.gst || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '0 8px' }}>₹{parseFloat(t.netComm || t.netCommission || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 600, color: '#475569' }}>₹{parseFloat(t.opening || t.openingBal || 0).toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{parseFloat(t.closing || t.closingBal || 0).toFixed(2)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {renderStatusBadge(t.status || t.txnStatus)}
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
                        mode: 'COMMISSION',
                        amount: parseFloat(activeReceipt.amount || 0),
                        charge: parseFloat(activeReceipt.charge || 0),
                        date: activeReceipt.createdDate ? new Date(activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
                        customerName: activeReceipt.customerName || activeReceipt.memberName || activeReceipt.firstName || 'N/A',
                        customerMobile: activeReceipt.customerMobile || activeReceipt.mobile || activeReceipt.memberMobile || 'N/A',
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

export default EarningCommission;