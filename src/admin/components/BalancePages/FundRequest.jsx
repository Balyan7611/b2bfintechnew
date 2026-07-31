import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../store/slices/uiSlice';
import { API } from '../../../api/endpoints';
import { normalizeStatus } from '../../../models/fundRequestModel';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaFilter, FaClock, FaCheckCircle, FaTimesCircle,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import ReceiptModal from '../../../shared/components/common/ReceiptModal';
import styles from './FundRequest.module.css';

// Which wallet an approved top-up lands in. Main is the default for fund
// requests; change here if the business wants AEPS/Commission instead.
const CREDIT_WALLET_TYPE = 'Main';
// Admin's own Member.Id, used as the "byMsrno" (source) on the transfer.
const ADMIN_MSRNO = 1;

const FundRequest = () => {
  const dispatch = useDispatch();
  const [fundRequestList, setFundRequestList] = useState([]);
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
  const toRow = (r) => ({
    ...r,
    // Always a string — msrno is numeric, and the filters below call
    // .toLowerCase() on this.
    memberId: String(r.loginId || r.memberName || r.msrno || ''),
    msrno: r.msrno,
    companyBankName: r.companyBankName || `Bank #${r.companyBankId}`,
    paymentDate: (r.createdDate || '').slice(0, 10),
    addDate: (r.createdDate || '').replace('T', ' ').slice(0, 16) || '-',
    approveRejectDate: r.approveDate ? r.approveDate.replace('T', ' ').slice(0, 16) : '-',
    status: normalizeStatus(r.status) === 'approved' ? 'Approved'
      : normalizeStatus(r.status) === 'rejected' ? 'Rejected' : 'Pending',
    reason: normalizeStatus(r.status) === 'rejected' ? (r.reason || r.remark || '-') : '-',
    cashSlip: null,
    indemnityBond: null
  });

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await API.fundRequest.getAll({ pageNumber: 1, pageSize: 500 });
      console.log('[Admin FundRequest] loaded', rows.length, 'request(s)', rows);
      setFundRequestList(rows.map(toRow));
    } catch (err) {
      console.error('Admin FundRequest: failed to load list', err);
      setFundRequestList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

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

      await loadRequests();
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
                  <label>Member ID</label>
                  <select className={styles.inputControl} value={tempFilters.memberId} onChange={e => setTempFilters({...tempFilters, memberId: e.target.value})}>
                    <option value="">All Members</option>
                    <option value="MDT8597">MDT8597</option>
                    <option value="Pay99DT5001">Pay99DT5001</option>
                    <option value="Pay99RT4003">Pay99RT4003</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select className={styles.inputControl} value={tempFilters.status} onChange={e => setTempFilters({...tempFilters, status: e.target.value})}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Payment Mode</label>
                  <select className={styles.inputControl} value={tempFilters.paymentMode} onChange={e => setTempFilters({...tempFilters, paymentMode: e.target.value})}>
                    <option value="">All Modes</option>
                    <option value="imps">IMPS</option>
                    <option value="neft">NEFT</option>
                    <option value="rtgs">RTGS</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <select className={styles.inputControl} value={tempFilters.bankName} onChange={e => setTempFilters({...tempFilters, bankName: e.target.value})}>
                    <option value="">All Banks</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="kotak">Kotak Bank</option>
                  </select>
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
                <th>Amount</th>
                <th>Company Bank Name</th>
                <th>Bank Ref ID</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Add Date</th>
                <th>Approve/Reject Date</th>
                <th>Cash Slip</th>
                <th>Indemnity Bond</th>
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
                  <td className={styles.fwBold}>{row.memberId}</td>
                  <td className={styles.amountText}>₹ {row.amount}</td>
                  <td>{row.companyBankName}</td>
                  <td>{row.bankRefId}</td>
                  <td className={styles.fwBold}>{row.paymentDate}</td>
                  <td><span className={styles.payModeBadge}>{row.paymentMode}</span></td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.remark}>{row.remark}</td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>{row.reason}</td>
                  <td>{row.addDate}</td>
                  <td>{row.approveRejectDate}</td>
                  <td>
                    {row.cashSlip ? (
                      <a 
                        href="#" 
                        className={styles.linkText} 
                        title="View Slip"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlip(row);
                        }}
                      >
                        View Slip
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    {row.indemnityBond ? <a href="#" className={styles.linkText} title="View Bond">View Bond</a> : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
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

      {/* Slip viewer modal */}
      <ReceiptModal 
        isOpen={!!activeSlip}
        onClose={() => setActiveSlip(null)}
        data={activeSlip ? {
          amount: activeSlip.amount,
          charge: 0,
          date: activeSlip.paymentDate + ' 10:26:00',
          customerName: 'Vishnu Prajapati',
          customerMobile: '9784905576',
          beneficiary: activeSlip.memberId.split(' [')[0],
          bank: activeSlip.companyBankName,
          accountNo: activeSlip.bankRefId,
          mode: activeSlip.paymentMode,
          total: activeSlip.amount,
          bankTransId: activeSlip.bankRefId,
          id: activeSlip.bankRefId
        } : null}
      />
    </div>
  );
};

export default FundRequest;

