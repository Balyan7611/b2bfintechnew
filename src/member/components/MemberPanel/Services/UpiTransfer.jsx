import React, { useState } from 'react';
import { 
  FaQrcode, FaArrowRight, FaCheckCircle, FaExclamationCircle, 
  FaMobileAlt, FaUser, FaInfoCircle, FaSearch, FaArrowLeft, FaPrint, FaFileInvoiceDollar
} from 'react-icons/fa';
import styles from './UpiTransfer.module.css';
import TransactionReceipt from './TransactionReceipt';

const INITIAL_TRANSACTIONS = [
  { sNo: 1, date: '2026-05-19 12:45', name: 'Vishnu Prajapat', upiId: '6377749427@ybl', amount: 500, status: 'success' },
  { sNo: 2, date: '2026-05-19 11:20', name: 'Rajesh Verma', upiId: 'rajesh@oksbi', amount: 2000, status: 'success' },
  { sNo: 3, date: '2026-05-18 17:10', name: 'Karan Malhotra', upiId: 'karan@ybl', amount: 1000, status: 'failed' }
];

const UPI_TAGS = [
  ['@paytm', '@okaxis', '@apl'],
  ['@okicici', '@oksbi', '@kotak'],
  ['@ybl', '@upi', '@pingpay'],
  ['@okhdfcbank', '@icici', '@axisb']
];

const UpiTransfer = () => {
  // States
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [tPin, setTPin] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'confirm', or 'success'
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastTxn, setLastTxn] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedTxnForReceipt, setSelectedTxnForReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleViewReceipt = (txn) => {
    const formattedData = {
      amount: parseFloat(txn.amount),
      charge: 0,
      total: parseFloat(txn.amount),
      beneficiary: txn.name,
      accountNo: txn.upiId, // UPI ID
      bank: 'UPI SETTLEMENT NETWORK',
      ifsc: 'UPI00000001',
      mode: 'UPI',
      customerName: 'Vishnu Kumar', // simulated customer name
      customerMobile: '9876543210',
      date: txn.date,
      status: 'SUCCESS',
      chunks: [
        {
          txnId: txn.txnId || `UT${Date.now().toString().slice(-8)}`,
          amount: parseFloat(txn.amount),
          charge: 0,
          total: parseFloat(txn.amount)
        }
      ]
    };
    setSelectedTxnForReceipt(formattedData);
    setShowReceiptModal(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTagClick = (tag) => {
    const atIndex = upiId.indexOf('@');
    if (atIndex !== -1) {
      setUpiId(upiId.substring(0, atIndex) + tag);
    } else {
      setUpiId(upiId + tag);
    }
  };

  const handleVerify = () => {
    if (!upiId) {
      showToast('Please enter a UPI ID first', 'error');
      return;
    }
    if (!upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@upi)', 'error');
      return;
    }

    setIsVerifying(true);
    showToast('Verifying UPI ID...', 'info');

    setTimeout(() => {
      setIsVerifying(false);
      const cleanedUpi = upiId.trim().toLowerCase();
      if (cleanedUpi === '6377749427@ybl' || cleanedUpi === '6377749427@ibl') {
        setName('Vishnu Prajapat');
      } else {
        const prefix = upiId.split('@')[0];
        const simulatedName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Kumar';
        setName(simulatedName);
      }
      showToast('UPI ID Verified Successfully!', 'success');
    }, 1000);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!upiId || !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID', 'error');
      return;
    }
    if (!name) {
      showToast('Please verify the UPI ID to fetch name', 'error');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setStep('confirm');
  };

  const handleProcessSubmit = (e) => {
    e.preventDefault();
    if (!tPin) {
      showToast('Please enter T-Pin to process', 'error');
      return;
    }
    // Show confirmation modal first
    setShowConfirmModal(true);
  };

  const executeTransfer = () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    showToast('Processing UPI Transfer...', 'info');

    setTimeout(() => {
      setIsSubmitting(false);
      const createdTxn = {
        sNo: transactions.length + 1,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        name: name,
        upiId: upiId,
        amount: parseFloat(amount),
        txnId: `UT${Date.now().toString().slice(-8)}`,
        status: 'success'
      };

      setTransactions([createdTxn, ...transactions]);
      setLastTxn(createdTxn);
      showToast(`Transfer of ₹${amount} successful!`, 'success');
      
      // Auto trigger the DMT-like transaction receipt modal
      const receiptData = {
        amount: parseFloat(amount),
        charge: 0,
        total: parseFloat(amount),
        beneficiary: name,
        accountNo: upiId,
        bank: 'UPI SETTLEMENT NETWORK',
        ifsc: 'UPI00000001',
        mode: 'UPI',
        customerName: 'Vishnu Kumar',
        customerMobile: '9876543210',
        date: createdTxn.date,
        status: 'SUCCESS',
        chunks: [
          {
            txnId: createdTxn.txnId,
            amount: parseFloat(amount),
            charge: 0,
            total: parseFloat(amount)
          }
        ]
      };
      setSelectedTxnForReceipt(receiptData);
      setShowReceiptModal(true);
      
      handleReset();
    }, 1200);
  };

  const handleReset = () => {
    setUpiId('');
    setName('');
    setAmount('');
    setTPin('');
    setLastTxn(null);
    setStep('form');
  };

  const filteredTxns = transactions.filter(t => 
    t.upiId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.message}
        </div>
      )}



      {/* Main Flow Section (Form / Confirm / Success) */}
      <div className={styles.formCard}>
        {step === 'form' && (
          <form onSubmit={handleNextStep} className={styles.inputGrid}>
            <h3 className={styles.cardTitle}>
              <FaQrcode /> Initiate UPI Transfer
            </h3>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              
              {/* Left Column: Form Fields */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.formGroup}>
                  <label>Enter UPIID</label>
                  <div className={styles.upiInputGroup}>
                    <input 
                      type="text" 
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setName(''); // Reset name if UPI ID is changed
                      }}
                      className={styles.inputField}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className={name ? styles.btnVerified : styles.btnVerify}
                    >
                      {isVerifying ? <div className={styles.spinner}></div> : (name ? 'Verified' : 'Verify')}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Name</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Beneficiary Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.inputField}
                      style={{ paddingRight: name ? '40px' : '16px' }}
                      required
                    />
                    {name && (
                      <FaCheckCircle 
                        style={{ 
                          position: 'absolute', 
                          right: '14px', 
                          color: '#22c55e',
                          fontSize: '1.1rem'
                        }} 
                      />
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Enter Amount</label>
                  <input 
                    type="number" 
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.inputField}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className={styles.btnPrimary}
                  style={{ width: 'fit-content', padding: '12px 32px', marginTop: '10px' }}
                >
                  <><FaArrowRight /> Next</>
                </button>
              </div>

              {/* Right Column: Tags & Bill */}
              <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* UPI Tags Card */}
                <div className={styles.tagsSection} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div className={styles.tagsTitle} style={{ marginBottom: '12px', color: '#475569', fontSize: '0.85rem' }}>QUICK UPI TAGS</div>
                  <div className={styles.tagsGrid}>
                    {UPI_TAGS.map((col, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {col.map(tag => (
                          <button 
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className={styles.tagBtn}
                            style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compact Bill Icon / Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  background: 'rgba(23,86,170,0.05)',
                  border: '1px solid rgba(23,86,170,0.1)',
                  borderRadius: '30px',
                  width: 'fit-content',
                  alignSelf: 'flex-start'
                }}>
                  <FaFileInvoiceDollar style={{ color: '#1756AA', fontSize: '1.2rem' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                    Secure UPI Receipts
                  </span>
                </div>
              </div>
              
            </div>
          </form>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleProcessSubmit} className={styles.confirmFlowGrid}>
            <h3 className={styles.cardTitle}>
              <FaQrcode /> Confirm UPI Transfer
            </h3>

            <div className={styles.confirmTableContainer}>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Name</span>
                <div className={styles.confirmValueBlock}>{name}</div>
              </div>
              
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>UPI ID</span>
                <div className={styles.confirmValueBlock}>{upiId}</div>
              </div>

              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Amount</span>
                <div className={styles.confirmValueBlock}>₹{parseFloat(amount).toFixed(2)}</div>
              </div>

              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>M-Pin</span>
                <div className={styles.confirmInputBlock}>
                  <input 
                    type="password" 
                    placeholder="Enter T-Pin"
                    value={tPin}
                    onChange={(e) => setTPin(e.target.value)}
                    className={styles.inputField}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.confirmActionsRow}>
              <button 
                type="button" 
                onClick={() => setStep('form')} 
                className={styles.btnBack}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={styles.btnProcess}
              >
                {isSubmitting ? <div className={styles.spinner}></div> : 'Process'}
              </button>
            </div>
          </form>
        )}


      </div>

      {/* Confirmation Modal Popup */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.receiptTitle} style={{ color: '#1e293b' }}>
                <FaExclamationCircle style={{ color: '#eab308' }} /> Confirm Transfer
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowConfirmModal(false)}>✕</button>
            </div>

            <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to transfer <strong style={{ color: '#0f172a' }}>₹{parseFloat(amount).toFixed(2)}</strong> to <strong style={{ color: '#0f172a' }}>{name}</strong> ({upiId})?
            </div>

            <div className={styles.confirmModalActions}>
              <button 
                className={styles.btnModalCancel} 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.btnModalConfirm} 
                onClick={executeTransfer}
              >
                Yes, Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>UPI Transfer Reports</h2>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Name or UPI ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.premiumTable}>
            <thead>
              <tr>
                <th>SNO</th>
                <th>DATE</th>
                <th>BENEFICIARY NAME</th>
                <th>UPI ID</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    No recent UPI transfer logs found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{txn.date}</td>
                    <td>{txn.name}</td>
                    <td><code className={styles.monoCode}>{txn.upiId}</code></td>
                    <td style={{ fontWeight: 800 }}>₹{txn.amount.toFixed(2)}</td>
                    <td>
                      <span className={`${styles.statusPill} ${styles[txn.status]}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewReceipt(txn)}
                        style={{
                          background: '#EFF6FF',
                          color: '#1756AA',
                          border: '1px solid #BFDBFE',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#DBEAFE';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#EFF6FF';
                        }}
                      >
                        <FaPrint size={11} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showReceiptModal && selectedTxnForReceipt && (
        <TransactionReceipt 
          data={selectedTxnForReceipt}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedTxnForReceipt(null);
          }}
        />
      )}
    </div>
  );
};

export default UpiTransfer;
