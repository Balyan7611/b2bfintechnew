import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../store/slices/uiSlice';
import { API } from '../../../api/endpoints';
import { normalizeStatus } from '../../../models/fundRequestModel';
import { getImageUrl } from '../../../config/siteConfig';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaFilter, FaClock, FaCheckCircle, FaTimesCircle,
  FaFileInvoiceDollar, FaSyncAlt
} from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from './FundRequest.module.css';

// Which wallet an approved top-up lands in. Main is the default for fund
// requests; change here if the business wants AEPS/Commission instead.
const CREDIT_WALLET_TYPE = 'Main';
// Admin's own Member.Id, used as the "byMsrno" (source) on the transfer.
const ADMIN_MSRNO = 1;

const FundRequest = () => {
  const dispatch = useDispatch();
  const [fundRequestList, setFundRequestList] = useState([]);
  const [companyBanks, setCompanyBanks] = useState([]);
  // msrno → { name, loginId } for fast lookup
  const [memberMap, setMemberMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, row: null, type: '', reason: '' });
  const [activeSlip, setActiveSlip] = useState(null);
  
  const [filters, setFilters] = useState({
    fromDate: '', toDate: '', memberId: '', status: '', paymentMode: '', bankName: ''
  });
  const [tempFilters, setTempFilters] = useState(filters);

  // Shapes a FundRequest API row for this table.
  // banks = company banks array, mMap = { msrno: { name, loginId } }
  const toRow = useCallback((r, banks = [], mMap = {}) => {
    const bankId = r.bankId || r.companyBankId;
    const bankName = (banks.find(b => String(b.id) === String(bankId))?.name) 
      || r.companyBankName || r.bankName || 'Unknown Bank';

    const msrnoStr = String(r.msrno || r.memberId || '');
    const mem = mMap[msrnoStr] || {};
    const resolvedName    = r.memberName || r.name || mem.name    || '';
    const resolvedLoginId = r.loginId   || mem.loginId || msrnoStr;

    // Payment date: use dedicated paymentDate if available, fallback to createdDate
    const rawPayDate = r.paymentDate || r.createdDate || '';
    const rawAddDate = r.createdDate || r.paymentDate || '';

    return {
      ...r,
      memberName: resolvedName,
      loginId: resolvedLoginId,
      // Combined string used in search filter
      memberId: String(resolvedLoginId || resolvedName || msrnoStr),
      msrno: r.msrno || r.memberId,
      companyBankName: bankName,
      paymentDate: rawPayDate ? rawPayDate.slice(0, 10) : '-',
      addDate: rawAddDate ? rawAddDate.replace('T', ' ').slice(0, 16) : '-',
      approveRejectDate: r.approveDate ? r.approveDate.replace('T', ' ').slice(0, 16) : '-',
      status: normalizeStatus(r.status) === 'approved' ? 'Approved'
        : normalizeStatus(r.status) === 'rejected' ? 'Rejected' : 'Pending',
      reason: normalizeStatus(r.status) === 'rejected' ? (r.reason || r.remark || '-') : '-',
      slip: getImageUrl(r.cashslip, 'FundRequest') || r.slipUrl || null,
      cashslip: r.cashslip || null,
      indemnityBond: null
    };
  }, []);

  const loadRequests = useCallback(async (banks, existingMap = {}) => {
    setIsLoading(true);
    try {
      const rows = await API.fundRequest.getAll({ pageNumber: 1, pageSize: 500 });
      console.log('[Admin FundRequest] loaded', rows.length, 'request(s)', rows);

      // Collect unique msrnos that we don't already have in the map
      const uniqueMsrnos = [...new Set(rows.map(r => r.msrno || r.memberId).filter(Boolean))];
      const mMap = { ...existingMap };

      // Fetch member details for any msrno not yet resolved
      await Promise.allSettled(
        uniqueMsrnos
          .filter(msrno => !mMap[String(msrno)])
          .map(async (msrno) => {
            try {
              const res = await API.member.getById(msrno);
              // Handle: res | res.data | res.data.data
              const m = res?.data?.data || res?.data || res || {};
              const name    = m.name || m.fullName || m.memberName || m.ownerName || m.firstName || m.firmName || '';
              const loginId = m.memberID || m.memberid || m.loginID   || m.loginId || m.username || String(msrno);
              console.log(`[FundRequest] member ${msrno} →`, name, loginId, m);
              mMap[String(msrno)] = { name, loginId };
            } catch (e) {
              console.warn(`FundRequest: could not fetch member ${msrno}`, e);
              mMap[String(msrno)] = { name: '', loginId: String(msrno) };
            }
          })
      );

      setMemberMap(mMap);
      setFundRequestList(rows.map(r => toRow(r, banks, mMap)));
    } catch (err) {
      console.error('Admin FundRequest: failed to load list', err);
      setFundRequestList([]);
    } finally {
      setIsLoading(false);
    }
  }, [toRow]);

  useEffect(() => {
    const init = async () => {
      let banks = [];

      // Load company banks
      try {
        const res = await API.companyBankDetail.getAll({ pageNumber: 1, pageSize: 200 });
        banks = (Array.isArray(res) ? res : [])
          .filter(b => !b.isDelete)
          .map(b => ({ id: b.id, name: b.bankName || b.name }));
        setCompanyBanks(banks);
      } catch (err) {
        console.warn('Admin FundRequest: could not load company banks', err);
      }

      loadRequests(banks);
    };
    init();
  }, [loadRequests]);

  // Approve = mark the request approved, THEN credit the member's wallet.
  // The credit is deliberately a separate call so a failed transfer is visible
  // rather than silently leaving an "approved" request with no money moved.
  const handleActionSubmit = async () => {
    const row = actionModal.row;
    if (!row) return;
    const isApprove = actionModal.type === 'Approve';

    if (!isApprove && !actionModal.reason.trim()) {
      dispatch(setNotification({ type: 'error', message: 'Please enter a reason for rejection.' }));
      return;
    }

    setBusyId(row.id);
    try {
      if (isApprove) {
        await API.fundRequest.approve(row, { remark: actionModal.reason || 'Approved, amount received' });

        try {
          await API.userWalletBalance.transfer({
            msrno: row.msrno,
            byMsrno: ADMIN_MSRNO,
            amount: row.amount,
            transactionType: 'Credit',
            walletType: CREDIT_WALLET_TYPE,
            description: `Fund Request Approved (Ref: ${row.bankRefId || row.id})`
          });
          dispatch(setNotification({ type: 'success', message: `Approved — ₹${row.amount} credited to ${CREDIT_WALLET_TYPE} wallet.` }));
        } catch (transferErr) {
          console.error('Admin FundRequest: wallet transfer failed', transferErr);
          dispatch(setNotification({
            type: 'error',
            message: 'Request approved but the wallet credit FAILED. Please transfer manually.'
          }));
        }
      } else {
        await API.fundRequest.reject(row, actionModal.reason);
        dispatch(setNotification({ type: 'success', message: 'Fund request rejected.' }));
      }

      await loadRequests(companyBanks, memberMap);
    } catch (err) {
      console.error('Admin FundRequest: action failed', err);
      dispatch(setNotification({ type: 'error', message: err.message || 'Action failed.' }));
    } finally {
      setBusyId(null);
      setActionModal({ open: false, row: null, type: '', reason: '' });
    }
  };

  // Filter Data. API values can be numbers (msrno) or null, so everything is
  // coerced to a string before any string method is called on it.
  const lower = (v) => String(v ?? '').toLowerCase();

  const filteredData = fundRequestList.filter(item => {
    const q = lower(searchQuery);
    const matchesSearch = lower(item.memberId).includes(q) || lower(item.bankRefId).includes(q);

    // Advanced Filters
    let matchesFilters = true;
    if (filters.memberId && lower(item.memberId) !== lower(filters.memberId)) matchesFilters = false;
    if (filters.status && lower(item.status) !== lower(filters.status)) matchesFilters = false;
    if (filters.paymentMode && lower(item.paymentMode) !== lower(filters.paymentMode)) matchesFilters = false;
    if (filters.bankName && !lower(item.companyBankName).includes(lower(filters.bankName))) matchesFilters = false;
    
    // Date Filters
    // The API gives YYYY-MM-DD; legacy rows used DD/MM/YYYY. Normalise both.
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
      const [d, m, y] = String(dateStr).split('/');
      return d && m && y ? `${y}-${m}-${d}` : null;
    };
    const itemDate = parseDate(item.paymentDate);
    
    if (filters.fromDate && itemDate && itemDate < filters.fromDate) matchesFilters = false;
    if (filters.toDate && itemDate && itemDate > filters.toDate) matchesFilters = false;

    return matchesSearch && matchesFilters;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return <span className={`${styles.badge} ${styles.pending}`}><FaClock /> Pending</span>;
    if (s === 'approved') return <span className={`${styles.badge} ${styles.approved}`}><FaCheckCircle /> Approved</span>;
    if (s === 'rejected') return <span className={`${styles.badge} ${styles.rejected}`}><FaTimesCircle /> Rejected</span>;
    return <span className={styles.badge}>{status}</span>;
  };

  return (
    <div className={styles.container}>
      
      {/* ── FILTER MODAL ── */}
      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Search & Filter Requests</h2>
              <button className={styles.closeBtn} onClick={() => setShowFilterModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.filterGrid}>
                <div className={styles.formGroup}>
                  <label>From Date</label>
                  <input type="date" className={styles.inputControl} value={tempFilters.fromDate} onChange={e => setTempFilters({...tempFilters, fromDate: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>To Date</label>
                  <input type="date" className={styles.inputControl} value={tempFilters.toDate} onChange={e => setTempFilters({...tempFilters, toDate: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Member</label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'All Members' },
                      ...Array.from(new Set(fundRequestList.map(r => r.memberId).filter(Boolean))).map(memId => {
                        const row = fundRequestList.find(r => r.memberId === memId);
                        const name = row?.memberName && row.memberName !== '-' ? row.memberName : 'Unknown';
                        const login = row?.loginId || row?.msrno || '';
                        return { value: memId, label: `${name} (${login})` };
                      })
                    ]}
                    value={tempFilters.memberId}
                    onChange={val => setTempFilters({...tempFilters, memberId: val})}
                    placeholder="Search Member..."
                    containerStyle={{ margin: 0 }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'rejected', label: 'Rejected' }
                    ]}
                    value={tempFilters.status}
                    onChange={val => setTempFilters({...tempFilters, status: val})}
                    placeholder="Search Status..."
                    containerStyle={{ margin: 0 }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Payment Mode</label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'All Modes' },
                      ...Array.from(new Set(fundRequestList.map(r => r.paymentMode).filter(Boolean))).map(mode => ({ value: mode, label: mode }))
                    ]}
                    value={tempFilters.paymentMode}
                    onChange={val => setTempFilters({...tempFilters, paymentMode: val})}
                    placeholder="Search Mode..."
                    containerStyle={{ margin: 0 }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'All Banks' },
                      ...companyBanks.map(b => ({ value: b.name, label: b.name }))
                    ]}
                    value={tempFilters.bankName}
                    onChange={val => setTempFilters({...tempFilters, bankName: val})}
                    placeholder="Search Bank..."
                    containerStyle={{ margin: 0 }}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => {
                const empty = { fromDate: '', toDate: '', memberId: '', status: '', paymentMode: '', bankName: '' };
                setTempFilters(empty);
                setFilters(empty);
                setShowFilterModal(false);
              }}>Reset</button>
              <button className={styles.submitBtn} onClick={() => {
                setFilters(tempFilters);
                setCurrentPage(1);
                setShowFilterModal(false);
              }}>
                <FaSearch /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.pageTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Fund Request Management
          </h2>
          <div className={styles.headerActions}>
            <button className={styles.filterBtn} onClick={() => setShowFilterModal(true)}>
              <FaFilter /> Filters
            </button>
          </div>
        </div>
        {/* Top Controls */}
        <div className={styles.topControls}>
          <div className={styles.rowsSelector}>
            <span>Show</span>
            <select 
              className={styles.selectInput}
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>rows</span>
          </div>

          <ExportButtons 
            headers={['S.No', 'Member ID', 'Amount', 'Company Bank Name', 'Bank Ref ID', 'Payment Date', 'Payment Mode', 'Status']}
            rows={currentData.map((row, index) => [
              startIndex + index + 1, row.memberId, row.amount, row.companyBankName, row.bankRefId, row.paymentDate, row.paymentMode, row.status
            ])}
            fileNamePrefix="fund_request_report"
            sheetName="Fund Requests"
          />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Member or Ref ID..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Wrapper */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th style={{ minWidth: '100px' }}>Action</th>
                <th>Member ID</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Company Bank Name</th>
                <th>Bank Ref ID</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Indemnity Bond</th>
                <th>Add Date</th>
                <th>Approve Date</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{startIndex + index + 1}</td>
                  <td>
                    {row.status === 'Pending' ? (
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.approveBtn}
                          title="Approve"
                          disabled={busyId === row.id}
                          onClick={() => setActionModal({ open: true, row, type: 'Approve', reason: '' })}
                        ><FaCheckCircle /></button>
                        <button
                          className={styles.rejectBtn}
                          title="Reject"
                          disabled={busyId === row.id}
                          onClick={() => setActionModal({ open: true, row, type: 'Reject', reason: '' })}
                        ><FaTimesCircle /></button>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {row.loginId || '-'}
                  </td>
                  <td>
                    {row.memberName && row.memberName !== '-' ? row.memberName : '-'}
                  </td>
                  <td className={styles.amountText}>₹ {row.amount}</td>
                  <td>{row.companyBankName}</td>
                  <td>{row.bankRefId}</td>
                  <td className={styles.fwBold}>{row.paymentDate}</td>
                  <td><span className={styles.payModeBadge}>{row.paymentMode}</span></td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.remark}>{row.remark}</td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>
                    {row.indemnityBond ? <a href="#" className={styles.linkText} title="View Bond">View Bond</a> : '-'}
                  </td>
                  <td>{row.addDate}</td>
                  <td>{row.approveRejectDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {isLoading ? 'Loading fund requests...' : 'No data available in table'}
                      </span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationRow}>
          <div className={styles.pageInfo}>
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num}
                className={`${styles.pageBtn} ${currentPage === num ? styles.pageActive : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTION MODAL ── */}
      {actionModal.open && (
        <div className={styles.modalOverlay} onClick={() => setActionModal({ open: false, row: null, type: '', reason: '' })}>
          <div className={styles.modalContainer} style={{ maxWidth: '400px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: actionModal.type === 'Approve' ? '#F0FDF4' : '#FFF5F5', color: actionModal.type === 'Approve' ? '#27AE60' : '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>
              {actionModal.type === 'Approve' ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', color: '#0D1B3E' }}>{actionModal.type} Request</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#4E6080' }}>
              Are you sure you want to {actionModal.type.toLowerCase()} the request for <strong style={{ color: '#0D1B3E' }}>{actionModal.row.memberId}</strong> (₹{actionModal.row.amount})?
            </p>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4E6080', marginBottom: '8px' }}>Reason / Remark</label>
              <input 
                type="text" 
                className={styles.inputControl}
                placeholder={`Enter reason for ${actionModal.type.toLowerCase()}`}
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className={styles.cancelBtn} onClick={() => setActionModal({ open: false, row: null, type: '', reason: '' })}>Cancel</button>
              <button 
                className={styles.submitBtn} 
                style={{ background: actionModal.type === 'Approve' ? '#27AE60' : '#E53E3E', boxShadow: 'none' }}
                disabled={busyId !== null}
                onClick={handleActionSubmit}
              >
                {busyId !== null ? 'Processing...' : `Confirm ${actionModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SLIP VIEWER MODAL ── */}
      {activeSlip && (
        <div className={styles.modalOverlay} onClick={() => setActiveSlip(null)}>
          <div className={styles.modalContainer} style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}><FaFileInvoiceDollar style={{ marginRight: '8px' }} />Payment Receipt Slip</h2>
              <button className={styles.closeBtn} onClick={() => setActiveSlip(null)}><FaTimesCircle /></button>
            </div>
            <div style={{ padding: '20px' }}>
              {activeSlip.slip ? (
                /* ── Member uploaded a slip — show actual image or PDF link ── */
                <>
                  {String(activeSlip.slip).toLowerCase().endsWith('.pdf') ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <a
                        href={activeSlip.slip}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}
                      >
                        📄 View Receipt (PDF)
                      </a>
                    </div>
                  ) : (
                    <img
                      src={activeSlip.slip}
                      alt="Payment Receipt Slip"
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  )}
                  <div style={{ fontSize: '10px', color: '#ccc', wordBreak: 'break-all', marginTop: '4px' }}>
                    DEBUG URL: {activeSlip.slip}
                  </div>
                  <a
                    href={activeSlip.slip}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'none', textAlign: 'center', marginTop: '10px', color: '#3b82f6', fontWeight: 600 }}
                  >
                    Open Receipt File ↗
                  </a>
                  <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem', color: '#64748b' }}>📎 Payment receipt uploaded by member</p>
                </>
              ) : (
                /* ── No slip uploaded — show transaction summary ── */
                <>
                  <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                      <strong style={{ color: '#0f172a' }}>{activeSlip.companyBankName} — Transaction Log</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>UTR: {activeSlip.bankRefId}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>MEMBER ID</span><strong>{activeSlip.memberId}</strong></div>
                      <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>PAYMENT DATE</span><strong>{activeSlip.paymentDate}</strong></div>
                      <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>PAYMENT MODE</span><strong>{activeSlip.paymentMode}</strong></div>
                      <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>AMOUNT</span><strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>₹{Number(activeSlip.amount).toLocaleString('en-IN')}</strong></div>
                      <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>STATUS</span><strong>{activeSlip.status}</strong></div>
                      <div><span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>BANK</span><strong>{activeSlip.companyBankName}</strong></div>
                    </div>
                  </div>
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>📎 No receipt slip uploaded by member for this request</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundRequest;

