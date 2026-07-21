import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import ReceiptModal from '../../../shared/components/common/ReceiptModal';
import { API } from '../../../api/endpoints';
import {
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiDatabase, FiAlertCircle, FiXCircle, FiBarChart2, FiFileText, FiCheck, FiX
} from 'react-icons/fi';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const DisputeRecharge = () => {
    // ─── State ──────────────────────────────────────────────
    const [disputeData, setDisputeData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // UI states
    const [showStats, setShowStats] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', txid: null });
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    // ─── Stats Computation ──────────────────────────────────
    const totalDisputes = totalRecords;
    const acceptedCount = disputeData.filter(t => t.status?.toLowerCase() === 'accepted').length;
    const cancelledCount = disputeData.filter(t => t.status?.toLowerCase() === 'cancelled').length;
    const pendingCount = disputeData.filter(t => t.status?.toLowerCase() === 'success' || t.status?.toLowerCase() === 'pending').length;

    const totalAmount = disputeData.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const totalCharge = disputeData.reduce((acc, t) => acc + (parseFloat(t.charge) || 0), 0);
    const totalCommission = disputeData.reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0);
    const totalTDS = disputeData.reduce((acc, t) => acc + (parseFloat(t.tds) || 0), 0);

    const uplineCommission = totalCommission * 0.6;
    const adminCommission = totalCommission * 0.4;
    const adminProfit = totalCommission * 0.15;
    const tdsPayable = totalTDS * 0.95;
    const netPayable = totalAmount - totalCommission - totalTDS;

    const stats = {
        totalTxns: totalDisputes,
        totalAmount,
        successTxns: acceptedCount,      // reusing successTxns for accepted
        failedTxns: cancelledCount,       // reusing failedTxns for cancelled
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
    const fetchDisputes = async () => {
        setLoading(true);
        try {
            // Replace with actual API endpoint for dispute recharge
            // Example: const res = await API.dispute.getAll({ pageNumber, pageSize, fromDate, toDate, search: searchKeyword });
            // For now we simulate with a mock call using the existing static data
            await new Promise(resolve => setTimeout(resolve, 300));
            // Simulated API response
            const mockData = [
                { sno: 1, api: 'SoniTechno', txid: '9694935907', op: 'Jio', num: '9990167317', amt: '349.00', status: 'Success', opid: 'BR000C3CFHMW', by: 'Pay99RT4291 Suhail', date: '17/04/2025 18:45:58' },
                { sno: 2, api: 'SoniTechno', txid: '5744464283', op: 'Airtel', num: '7289054316', amt: '22.00', status: 'Success', opid: '3104235732', by: 'Pay99RT4097 Brijesh Kumar', date: '15/04/2025 19:39:13' },
            ];
            setDisputeData(mockData);
            setTotalRecords(mockData.length);
        } catch (err) {
            console.error("Failed to fetch disputes:", err);
            setDisputeData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        fetchDisputes();
    }, [pageNumber, pageSize, fromDate, toDate, searchKeyword]);

    // ─── Handlers ────────────────────────────────────────────
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNumber(1);
        fetchDisputes();
    };

    const handleAction = (type, txid) => {
        // Update local state (simulate API call)
        setDisputeData(prev =>
            prev.map(row =>
                row.txid === txid
                    ? { ...row, status: type === 'accept' ? 'Accepted' : 'Cancelled' }
                    : row
            )
        );
        setConfirmModal({ isOpen: false, type: '', txid: null });
        // In real scenario, call API to update status
    };

    // ─── Render Helpers ──────────────────────────────────────
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    const currentRows = disputeData.slice(startIndex, startIndex + pageSize);

    const renderStatusBadge = (status) => {
        const map = {
            'success': { bg: '#DEF7EC', color: '#03543F', border: '#BCF0DA' },
            'accepted': { bg: '#DEF7EC', color: '#03543F', border: '#BCF0DA' },
            'cancelled': { bg: '#FDE8E8', color: '#9B1C1C', border: '#F8B4B4' },
            'pending': { bg: '#FEF9C3', color: '#713F12', border: '#FEF08A' },
        };
        const style = map[status?.toLowerCase()] || map['pending'];
        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
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

    // ─── Render ──────────────────────────────────────────────
    return (
        <div className={styles.container} style={{ padding: '12px', maxWidth: '100%' }}>
            {/* ── FILTER CARD ── */}
            <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(23, 86, 170, 0.04), 0 1px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid #E2E8F0',
                marginBottom: '24px',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '16px 28px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>Dispute Recharge Report</h2>
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

                <div style={{ padding: '24px 28px', background: '#FAFBFC' }}>
                    <form onSubmit={handleSearchSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s' }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} onFocus={() => setFocusedField('fromDate')} onBlur={() => setFocusedField(null)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', transition: 'all 0.25s' }} value={toDate} onChange={(e) => setToDate(e.target.value)} onFocus={() => setFocusedField('toDate')} onBlur={() => setFocusedField(null)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search</label>
                                <div style={{ position: 'relative' }}>
                                    <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                    <input type="text" placeholder="TXID, Number, UTR..." className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', outline: 'none', transition: 'all 0.25s' }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
                                </div>
                            </div>
                            <div>
                                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}>
                                    <FiSearch /> Search Logs
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── STATS GRID ── */}
            <StatsGrid stats={stats} showStats={showStats} />

            {/* ── DATA TABLE ── */}
            <div className={styles.cardFullMobile} style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                <div className="global-table-toolbar" style={{ padding: '12px 20px' }}>
                    <div className={styles.pillRow} style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
                        <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
                    </div>

                    <ExportButtons headers={[]} rows={[]} fileNamePrefix="disputerecharge_report" sheetName="Report" />

                    <div className="global-search-box">
                        <FiSearch />
                        <input type="text" placeholder="Search dispute logs..." value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value); setPageNumber(1); }} />
                    </div>
                </div>

                <div className={styles.tableWrapper} style={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', overflowY: 'hidden', minHeight: 'auto' }}>
                    <table className={styles.table} style={{ minWidth: '1800px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                                <th style={{ width: '60px' }}>#</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>ACTION</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>STATUS</th>
                                <th>API NAME</th>
                                <th>TXID</th>
                                <th>OPERATOR</th>
                                <th>NUMBER</th>
                                <th>AMOUNT</th>
                                <th>OPERATOR ID</th>
                                <th>RECHARGE BY</th>
                                <th>DATE & TIME</th>
                                <th style={{ textAlign: 'center' }}>RECEIPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="12" style={{ padding: '30px 0', textAlign: 'center', color: '#1756AA' }}>Loading disputes...</td></tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <FiDatabase size={24} color="#94A3B8" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No dispute recharge records found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentRows.map((row, idx) => {
                                    const rowIndex = startIndex + idx + 1;
                                    const isAccepted = row.status?.toLowerCase() === 'accepted';
                                    const isCancelled = row.status?.toLowerCase() === 'cancelled';
                                    return (
                                        <tr key={row.txid || idx}>
                                            <td>{rowIndex}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => !isAccepted && setConfirmModal({ isOpen: true, type: 'accept', txid: row.txid })}
                                                        disabled={isAccepted}
                                                        style={{
                                                            width: '30px', height: '30px', borderRadius: '8px',
                                                            background: isAccepted ? '#16A34A' : isCancelled ? '#F0FDF4' : '#F0FDF4',
                                                            color: isAccepted ? '#fff' : '#16A34A',
                                                            border: isAccepted ? 'none' : '1px solid #BBF7D0',
                                                            cursor: isAccepted ? 'not-allowed' : 'pointer',
                                                            opacity: isCancelled ? 0.5 : 1,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (!isAccepted) {
                                                                e.currentTarget.style.background = '#16A34A';
                                                                e.currentTarget.style.color = '#fff';
                                                                e.currentTarget.style.opacity = '1';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (!isAccepted) {
                                                                e.currentTarget.style.background = isCancelled ? '#F0FDF4' : '#F0FDF4';
                                                                e.currentTarget.style.color = '#16A34A';
                                                                if (isCancelled) e.currentTarget.style.opacity = '0.5';
                                                            }
                                                        }}
                                                    >
                                                        <FiCheck size={16} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={() => !isCancelled && setConfirmModal({ isOpen: true, type: 'cancel', txid: row.txid })}
                                                        disabled={isCancelled}
                                                        style={{
                                                            width: '30px', height: '30px', borderRadius: '8px',
                                                            background: isCancelled ? '#DC2626' : isAccepted ? '#FEF2F2' : '#FEF2F2',
                                                            color: isCancelled ? '#fff' : '#DC2626',
                                                            border: isCancelled ? 'none' : '1px solid #FECACA',
                                                            cursor: isCancelled ? 'not-allowed' : 'pointer',
                                                            opacity: isAccepted ? 0.5 : 1,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (!isCancelled) {
                                                                e.currentTarget.style.background = '#DC2626';
                                                                e.currentTarget.style.color = '#fff';
                                                                e.currentTarget.style.opacity = '1';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (!isCancelled) {
                                                                e.currentTarget.style.background = isAccepted ? '#FEF2F2' : '#FEF2F2';
                                                                e.currentTarget.style.color = '#DC2626';
                                                                if (isAccepted) e.currentTarget.style.opacity = '0.5';
                                                            }
                                                        }}
                                                    >
                                                        <FiX size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {renderStatusBadge(row.status)}
                                            </td>
                                            <td>{row.api}</td>
                                            <td>{row.txid}</td>
                                            <td>{row.op}</td>
                                            <td>{row.num}</td>
                                            <td style={{ fontWeight: 800, color: '#0D1B3E' }}>₹{row.amt}</td>
                                            <td>{row.opid}</td>
                                            <td>{row.by}</td>
                                            <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{row.date}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setActiveReceipt(row)}
                                                    style={{
                                                        background: 'rgba(231, 76, 60, 0.1)',
                                                        border: 'none',
                                                        color: '#E74C3C',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <FiFileText /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="global-pagination" style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9' }}>
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

            {/* ── CONFIRMATION MODAL ── */}
            {confirmModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#ffffff', padding: '20px 24px', borderRadius: '20px', width: '90%', maxWidth: '340px',
                        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)', textAlign: 'center', position: 'relative',
                        border: '1px solid #E2E8F0'
                    }}>
                        <button
                            onClick={() => setConfirmModal({ isOpen: false, type: '', txid: null })}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: '#F8FAFC', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <FiX size={16} strokeWidth={3} />
                        </button>

                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px', margin: '10px auto 16px auto',
                            background: confirmModal.type === 'accept' ? '#E8F5E9' : '#FFEBEE',
                            color: confirmModal.type === 'accept' ? '#2E7D32' : '#C62828',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: confirmModal.type === 'accept' ? '0 4px 10px rgba(46, 125, 50, 0.15)' : '0 4px 10px rgba(198, 40, 40, 0.15)'
                        }}>
                            {confirmModal.type === 'accept' ? <FiCheck size={28} strokeWidth={3} /> : <FaExclamationTriangle size={24} />}
                        </div>

                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
                            {confirmModal.type === 'accept' ? 'Accept Dispute?' : 'Cancel Dispute?'}
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5' }}>
                            Do you want to {confirmModal.type === 'accept' ? 'accept' : 'cancel'} the dispute for transaction ID <strong style={{ color: '#0F172A' }}>{confirmModal.txid}</strong>?
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, type: '', txid: null })}
                                style={{ padding: '10px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => handleAction(confirmModal.type, confirmModal.txid)}
                                style={{ padding: '10px', background: confirmModal.type === 'accept' ? '#2E7D32' : '#C62828', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Yes, Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── RECEIPT MODAL ── */}
            <ReceiptModal
                isOpen={!!activeReceipt}
                onClose={() => setActiveReceipt(null)}
                data={activeReceipt ? {
                    amount: parseFloat(activeReceipt.amt),
                    charge: 0,
                    date: activeReceipt.date,
                    customerName: activeReceipt.by ? activeReceipt.by.split(' ').slice(1).join(' ') : 'Guest User',
                    customerMobile: activeReceipt.num,
                    beneficiary: activeReceipt.by || 'Agent User',
                    bank: activeReceipt.api,
                    accountNo: activeReceipt.opid || activeReceipt.txid,
                    mode: 'Recharge Dispute',
                    total: parseFloat(activeReceipt.amt),
                    bankTransId: activeReceipt.txid,
                    id: activeReceipt.txid
                } : null}
            />
        </div>
    );
};

export default DisputeRecharge;