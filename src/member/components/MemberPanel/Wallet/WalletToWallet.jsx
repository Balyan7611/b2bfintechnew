import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaUser, FaWallet, FaPaperPlane,
  FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaCheckCircle, FaExclamationCircle, FaSpinner
} from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './WalletToWallet.module.css';
import sharedStyles from '../../../../shared/components/common/SharedTable.module.css';
import { API } from '../../../../api/endpoints';
import { resolveMemberId } from '../../../../utils/memberIdentity';
import { getSession } from '../../../../utils/authUtils';

const WalletToWallet = () => {
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');

  // Transfer form
  const [mobile, setMobile] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [error, setError] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [pin, setPin] = useState('');
  const [transferType, setTransferType] = useState('credit');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  // Sender info
  const [senderBalance, setSenderBalance] = useState(0);
  const [senderMsrno, setSenderMsrno] = useState(null);

  // History table
  const [transactions, setTransactions] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load sender info on mount
  useEffect(() => {
    const init = async () => {
      try {
        const msrno = await resolveMemberId();
        setSenderMsrno(msrno);
        if (msrno) {
          const bal = await API.userWalletBalance.getForMember(msrno);
          setSenderBalance(bal?.mainBalance ?? 0);
        }
      } catch (e) {
        console.warn('WalletToWallet: could not load sender info', e);
      }
    };
    init();
  }, []);

  // Receiver lookup by mobile
  useEffect(() => {
    if (mobile.length !== 10) {
      setReceiver(null);
      setError('');
      return;
    }
    let cancelled = false;
    setIsLoadingUser(true);
    setError('');
    setReceiver(null);

    API.member.search(mobile)
      .then(res => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const found = list.find(m => (m.mobile || m.mobileNo || m.phone) === mobile);
        if (found) {
          setReceiver({
            name: found.name || found.fullName || found.ownerName || found.firmName || '-',
            mobile: mobile,
            email: found.email || found.emailId || '-',
            memberId: found.memberID || found.memberid || found.loginID || found.loginId || String(found.id || ''),
            msrno: found.id || found.msrno,
          });
        } else {
          setError('No member found with this mobile number');
        }
      })
      .catch(() => { if (!cancelled) setError('Failed to lookup member'); })
      .finally(() => { if (!cancelled) setIsLoadingUser(false); });

    return () => { cancelled = true; };
  }, [mobile]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!senderMsrno) return;
    setHistLoading(true);
    try {
      const { items, totalItems } = await API.walletLedger.getMainLedger({
        memberId: senderMsrno,
        pageNumber,
        pageSize,
        fromDate,
        toDate,
      });
      setTransactions(items);
      setTotalRecords(totalItems ?? items.length);
    } catch (e) {
      console.error('WalletToWallet history error:', e);
      setTransactions([]);
    } finally {
      setHistLoading(false);
    }
  }, [senderMsrno, pageNumber, pageSize, fromDate, toDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const showToastMsg = (msg, type) => {
    setToast({ show: true, message: msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!receiver) return;
    if (!amount || parseFloat(amount) <= 0) { showToastMsg('Please enter a valid amount', 'error'); return; }
    setPin('');
    setTransferType('credit');
    setShowConfirm(true);
  };

  const processTransfer = async () => {
    if (pin.length < 4) { showToastMsg('T-PIN is required to confirm', 'error'); return; }
    setIsProcessing(true);
    try {
      await API.userWalletBalance.transfer({
        msrno: receiver.msrno,
        byMsrno: senderMsrno,
        amount: parseFloat(amount),
        transactionType: transferType === 'credit' ? 'Credit' : 'Debit',
        walletType: 'Main',
        description: remark || `Wallet to Wallet Transfer`,
        tpin: pin,
      });
      showToastMsg(`Successfully ${transferType === 'credit' ? 'credited to' : 'debited from'} ${receiver.name}: ₹${amount}`, 'success');
      setMobile(''); setAmount(''); setRemark(''); setPin(''); setReceiver(null);
      setShowConfirm(false);
      // Refresh balance + history
      const bal = await API.userWalletBalance.getForMember(senderMsrno);
      setSenderBalance(bal?.mainBalance ?? 0);
      loadHistory();
    } catch (err) {
      showToastMsg(err?.response?.data?.message || err?.message || 'Transfer failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Client-side search filter
  const filteredTxns = transactions.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (t.narration || t.description || '').toLowerCase().includes(q)
      || (t.orderId || t.txnId || '').toLowerCase().includes(q);
  });

  // AEPS pagination
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const getPages = () => {
    const pages = [], delta = 2;
    let prev = null;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= pageNumber - delta && i <= pageNumber + delta)) {
        if (prev !== null && i - prev > 1) pages.push('...');
        pages.push(i); prev = i;
      }
    }
    return pages;
  };

  return (
    <div className={styles.container}>

      {toast.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500'
        }}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {toast.message}
        </div>
      )}

      <div className={styles.layout} style={isApiPanel ? { display: 'block' } : {}}>

        {/* Transfer Form */}
        {!isApiPanel && (
          <div className={styles.formPanel}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                <FaWallet color="#1756AA" /> Wallet to Wallet Transfer
              </h2>
            </div>
            <form onSubmit={handleSubmitClick}>
              <div className={styles.formGroup}>
                <label>Receiver Mobile Number (10 digits)</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setMobile(val); }}
                    maxLength="10"
                  />
                </div>
                {isLoadingUser && <div className={styles.loadingText}><FaSpinner className={styles.spinner} /> Fetching user details...</div>}
                {error && <div className={styles.errorAlert}><FaExclamationCircle /> {error}</div>}
              </div>

              {receiver && (
                <div className={styles.userCard}>
                  <div className={styles.userCardHeader}>
                    <div className={styles.avatar}>{receiver.name.charAt(0)}</div>
                    <div className={styles.userInfo}>
                      <h4>{receiver.name}</h4>
                      <p>{receiver.mobile}</p>
                    </div>
                  </div>
                  <div className={styles.userDetailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Member ID</span>
                      <span className={styles.detailValue}>{receiver.memberId}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email ID</span>
                      <span className={styles.detailValue} style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{receiver.email}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <div className={styles.balanceHint}>
                  <span>Your Balance:</span>
                  <strong>₹{Number(senderBalance).toFixed(2)}</strong>
                </div>
                <label>Amount (₹)</label>
                <input type="number" className={styles.input} placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!receiver} min="1" />
              </div>

              <div className={styles.formGroup}>
                <label>Remark (Optional)</label>
                <input type="text" className={styles.input} placeholder="Add a note" value={remark} onChange={(e) => setRemark(e.target.value)} disabled={!receiver} />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={!receiver || !amount || parseFloat(amount) <= 0}>
                <FaPaperPlane /> Proceed to Transfer
              </button>
            </form>
          </div>
        )}

        {/* History Table */}
        <div className={styles.historyPanel}>
          {/* Date filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', padding: '14px 0 10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>From Date</label>
              <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPageNumber(1); }} style={{ height: 36, borderRadius: 8, border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.82rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>To Date</label>
              <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPageNumber(1); }} style={{ height: 36, borderRadius: 8, border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '0.82rem' }} />
            </div>
            <button onClick={() => { setPageNumber(1); loadHistory(); }} style={{ height: 36, padding: '0 18px', background: '#1756AA', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              <FaSearch style={{ marginRight: 6 }} /> Search
            </button>
          </div>

          <div className={styles.tableToolbar}>
            <div className={styles.filters}>
              <div className={styles.searchWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input type="text" className={`${styles.filterInput} ${styles.searchInput}`} placeholder="Search Txn ID / Narration" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Show</span>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPageNumber(1); }} style={{ height: 32, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem' }}>
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
              <div className={sharedStyles.exportGroup} style={{ margin: 0, gap: '8px' }}>
                <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_copy}`} title="Copy"><FaCopy size={14} /></button>
                <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_excel}`} title="Excel"><FaFileExcel size={14} /></button>
                <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_pdf}`} title="PDF"><FaFilePdf size={14} /></button>
              </div>
            </div>
          </div>

          <div className={sharedStyles.tableWrapper}>
            <table className={sharedStyles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Narration</th>
                  <th>Opening Bal</th>
                  <th>Amount</th>
                  <th>CR/DR</th>
                  <th>Closing Bal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#1756AA' }}>Loading...</td></tr>
                ) : filteredTxns.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px 24px', color: '#64748b' }}>No transactions found for selected date range</td></tr>
                ) : filteredTxns.map((txn, idx) => {
                  const isCr = String(txn.factor || txn.crDr || '').toUpperCase().includes('CR');
                  return (
                    <tr key={txn.id || idx}>
                      <td>{(pageNumber - 1) * pageSize + idx + 1}</td>
                      <td style={{ fontSize: '0.78rem' }}>{txn.date || txn.createdDate || '-'}</td>
                      <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.desc || txn.narration || txn.description || '-'}</td>
                      <td>₹{Number(txn.opening || txn.openingBalance || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(txn.amount || 0).toFixed(2)}</td>
                      <td><span style={{ background: isCr ? '#ECFDF5' : '#FEF2F2', color: isCr ? '#059669' : '#DC2626', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>{isCr ? 'CR' : 'DR'}</span></td>
                      <td>₹{Number(txn.closing || txn.balance || 0).toFixed(2)}</td>
                      <td><span className={`${sharedStyles.statusPill} ${sharedStyles[(txn.status || 'success').toLowerCase()]}`}>{txn.status || 'SUCCESS'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AEPS Pagination */}
          <div style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: '0.82rem', color: '#718096', fontWeight: 600 }}>
              Showing {filteredTxns.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0}–{Math.min(pageNumber * pageSize, totalRecords)} of <strong>{totalRecords}</strong> records
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}><FiChevronLeft /></button>
              {getPages().map((pg, i) =>
                pg === '...'
                  ? <span key={`d${i}`} style={{ padding: '0 4px', color: '#94a3b8', lineHeight: '36px' }}>…</span>
                  : <button key={pg} onClick={() => setPageNumber(pg)} style={{ minWidth: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: pg === pageNumber ? '#1756AA' : '#e2e8f0', background: pg === pageNumber ? '#1756AA' : '#fff', color: pg === pageNumber ? '#fff' : '#475569', fontWeight: pg === pageNumber ? 800 : 500, fontSize: '0.82rem', cursor: 'pointer' }}>{pg}</button>
              )}
              <button className="global-page-btn" onClick={() => setPageNumber(p => Math.min(p + 1, totalPages))} disabled={pageNumber >= totalPages}><FiChevronRight /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.compactModal}`}>
            <h3 className={styles.modalTitle}>Confirm Transfer</h3>
            <p className={styles.modalText}>Transfer to <strong>{receiver?.name}</strong></p>
            <div className={styles.modalAmount}>₹{parseFloat(amount || 0).toLocaleString()}</div>
            <div className={styles.typeSelector}>
              <label className={styles.radioLabel}>
                <input type="radio" name="transferType" value="credit" checked={transferType === 'credit'} onChange={(e) => setTransferType(e.target.value)} />
                <span>Credit</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="transferType" value="debit" checked={transferType === 'debit'} onChange={(e) => setTransferType(e.target.value)} />
                <span>Debit</span>
              </label>
            </div>
            <div className={styles.pinWrapper}>
              <label>T-PIN</label>
              <input type="text" maxLength="4" className={styles.pinInput} placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus autoComplete="new-password" style={{ WebkitTextSecurity: 'disc' }} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowConfirm(false)} disabled={isProcessing}>Cancel</button>
              <button className={styles.btnConfirm} onClick={processTransfer} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletToWallet;
