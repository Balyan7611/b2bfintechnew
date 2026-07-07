import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaUser, FaIdCard, FaEnvelope, FaWallet, FaPaperPlane,
  FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaCheckCircle, FaExclamationCircle, FaSpinner
} from 'react-icons/fa';
import styles from './WalletToWallet.module.css';
import sharedStyles from '../../../../shared/components/common/SharedTable.module.css';

// --- Dummy Data ---
const dummySender = {
  name: 'Soni',
  memberId: 'Pay99RT4004',
  mobile: '8890977983',
  email: 'vipin@gmail.com',
  balance: 0.00
};

const dummyReceiver = {
  name: 'Vishnu Prajapati',
  mobile: '6377749427',
  email: 'vishnuprajapati888@gmail.com',
  memberId: 'PAY99RT6377',
  balance: 2450.00
};

const initialTransactions = [
  { id: 1, date: '15 May 2026, 14:30', sender: 'Soni', receiver: 'Vishnu Prajapati', amount: 500, txnId: 'TXN202605001', status: 'Success' },
  { id: 2, date: '02 May 2026, 09:15', sender: 'Soni', receiver: 'Vishnu Prajapati', amount: 1200, txnId: 'TXN202605002', status: 'Success' },
  { id: 3, date: '18 Apr 2026, 18:45', sender: 'Vishnu Prajapati', receiver: 'Soni', amount: 300, txnId: 'TXN202604003', status: 'Failed' },
  { id: 4, date: '05 Apr 2026, 11:20', sender: 'Soni', receiver: 'Vishnu Prajapati', amount: 750, txnId: 'TXN202604004', status: 'Pending' },
  { id: 5, date: '22 Mar 2026, 16:10', sender: 'Soni', receiver: 'Vishnu Prajapati', amount: 2000, txnId: 'TXN202603005', status: 'Success' },
  { id: 6, date: '10 Mar 2026, 10:05', sender: 'Vishnu Prajapati', receiver: 'Soni', amount: 450, txnId: 'TXN202603006', status: 'Success' },
  { id: 7, date: '28 Feb 2026, 13:50', sender: 'Soni', receiver: 'Vishnu Prajapati', amount: 600, txnId: 'TXN202602007', status: 'Success' },
  { id: 8, date: '14 Feb 2026, 15:30', sender: 'Soni', receiver: 'Vishnu Prajapati', amount: 900, txnId: 'TXN202602008', status: 'Failed' },
];

const WalletToWallet = () => {
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');
  const [mobile, setMobile] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [error, setError] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [pin, setPin] = useState('');
  const [transferType, setTransferType] = useState('credit');

  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Handle Mobile Input & Auto Fetch
  useEffect(() => {
    if (mobile.length === 10) {
      setIsLoadingUser(true);
      setError('');
      setReceiver(null);
      setAmount('');

      // Simulate API call
      setTimeout(() => {
        if (mobile === '6377749427') {
          setReceiver(dummyReceiver);
          setSearch(''); // Clear search on new user
        } else {
          setError('User not found');
        }
        setIsLoadingUser(false);
      }, 800);
    } else {
      setReceiver(null);
      setError('');
      setIsLoadingUser(false);
    }
  }, [mobile]);

  const showToastMsg = (msg, type) => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!receiver) return;
    if (!amount || parseFloat(amount) <= 0) {
      showToastMsg('Please enter a valid amount', 'error');
      return;
    }
    setPin('');
    setTransferType('credit');
    setShowConfirm(true);
  };

  const processTransfer = () => {
    if (pin.length < 4) {
      showToastMsg('T-PIN is required to confirm', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate transaction processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirm(false);

      // Mock failure if amount is exactly 1 (for testing error state)
      if (parseFloat(amount) === 1) {
        showToastMsg('Transfer failed! Insufficient funds or server error.', 'error');
        return;
      }

      const actionText = transferType === 'credit' ? 'credited to' : 'debited from';
      showToastMsg(`Successfully ${actionText} ${receiver.name}: ₹${amount}`, 'success');

      // Add to history
      const newTxn = {
        id: Date.now(),
        date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        sender: dummySender.name,
        receiver: receiver.name,
        amount: parseFloat(amount),
        txnId: `TXN${Date.now()}`,
        status: 'Success'
      };

      setTransactions([newTxn, ...transactions]);

      // Reset form
      setMobile('');
      setAmount('');
      setRemark('');
      setPin('');
      setReceiver(null);
    }, 1500);
  };

  const filteredTransactions = transactions.filter(t => {
    if (!receiver) return false;
    const matchesReceiver = t.receiver.toLowerCase() === receiver.name.toLowerCase();
    const matchesSearch = t.txnId.toLowerCase().includes(search.toLowerCase()) || t.receiver.toLowerCase().includes(search.toLowerCase());

    return matchesReceiver && matchesSearch;
  });

  return (
    <div className={styles.container}>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'slideDown 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500'
        }}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {toast.message}
        </div>
      )}



      <div className={styles.layout} style={isApiPanel ? { display: 'block' } : {}}>
        {/* LEFT PANEL */}
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setMobile(val);
                  }}
                  maxLength="10"
                />
              </div>
              {isLoadingUser && <div className={styles.loadingText}><FaSpinner className={styles.spinner} /> Fetching user details...</div>}
              {error && <div className={styles.errorAlert}><FaExclamationCircle /> {error}</div>}
            </div>

            {receiver && (
              <div className={styles.userCard}>
                <div className={styles.userCardHeader}>
                  <div className={styles.avatar}>
                    {receiver.name.charAt(0)}
                  </div>
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
                <strong>₹{dummySender.balance.toFixed(2)}</strong>
              </div>
              <label>Amount (₹)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!receiver}
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Remark (Optional)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Add a note"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                disabled={!receiver}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!receiver || !amount || parseFloat(amount) <= 0}
            >
              <FaPaperPlane /> Proceed to Transfer
            </button>
          </form>
        </div>
        )}

        {/* RIGHT PANEL */}
        <div className={styles.historyPanel}>
          <div className={styles.tableToolbar}>
            <div className={styles.filters}>
              <div className={styles.searchWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input 
                  type="text" 
                  className={`${styles.filterInput} ${styles.searchInput}`} 
                  placeholder="Search Txn ID / Name" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="new-password"
                  name="search-txn-unique"
                  data-lpignore="true"
                />
              </div>
            </div>
            <div className={sharedStyles.exportGroup} style={{ margin: 0, gap: '8px' }}>
              <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_copy}`} title="Copy"><FaCopy size={14} /></button>
              <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_excel}`} title="Excel"><FaFileExcel size={14} /></button>
              <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_pdf}`} title="PDF"><FaFilePdf size={14} /></button>
            </div>
          </div>

          <div className={sharedStyles.tableWrapper}>
            <table className={sharedStyles.table}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date & Time</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                  <th>Txn ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn, idx) => (
                  <tr key={txn.id}>
                    <td>{idx + 1}</td>
                    <td>{txn.date}</td>
                    <td>{txn.receiver}</td>
                    <td className={styles.amount}>₹{txn.amount.toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{txn.txnId}</td>
                    <td>
                      <span className={`${sharedStyles.statusPill} ${sharedStyles[txn.status.toLowerCase()]}`}>
                        {txn.status === 'Success' && <FaCheckCircle style={{ fontSize: '10px' }} />}
                        {txn.status === 'Failed' && <FaExclamationCircle style={{ fontSize: '10px' }} />}
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 24px', color: '#64748b' }}>
                      {!receiver ? 'Enter a valid receiver mobile number to view transactions' : 'No transactions found for this user'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span>Showing 1 to {filteredTransactions.length} of {filteredTransactions.length} entries</span>
            <select className={styles.filterInput}>
              <option>10 entries</option>
              <option>25 entries</option>
              <option>50 entries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.compactModal}`}>
            <h3 className={styles.modalTitle}>Confirm Transfer</h3>
            <p className={styles.modalText}>
              Transfer to <strong>{receiver?.name}</strong>
            </p>
            <div className={styles.modalAmount}>₹{parseFloat(amount).toLocaleString()}</div>

            <div className={styles.typeSelector}>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="transferType" 
                  value="credit" 
                  checked={transferType === 'credit'} 
                  onChange={(e) => setTransferType(e.target.value)}
                />
                <span>Credit</span>
              </label>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="transferType" 
                  value="debit" 
                  checked={transferType === 'debit'} 
                  onChange={(e) => setTransferType(e.target.value)}
                />
                <span>Debit</span>
              </label>
            </div>
            
            <div className={styles.pinWrapper}>
              <label>T-PIN</label>
              <input 
                type="text" 
                maxLength="4"
                className={styles.pinInput}
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
                autoComplete="new-password"
                style={{ WebkitTextSecurity: 'disc' }}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowConfirm(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className={styles.btnConfirm}
                onClick={processTransfer}
                disabled={isProcessing}
              >
                {isProcessing ? 'Wait...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WalletToWallet;

