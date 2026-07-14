import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, FaSpinner, FaCheckCircle, FaExclamationTriangle, 
  FaArrowLeft, FaDownload, FaSearch, FaPlusCircle, FaShieldAlt, 
  FaTrash, FaHistory, FaFileExport, FaLock, FaUniversity, FaUserCheck,
  FaPrint
} from 'react-icons/fa';
import styles from './Payout.module.css';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';

const DEFAULT_ACCOUNTS = [
  { id: 1, name: 'Vishnu Prajapati', bank: 'Kotak Mahindra Bank', accountNo: '9745556971', ifsc: 'KKBK0000962', status: 'Approved' },
  { id: 2, name: 'Rahul Sharma', bank: 'HDFC Bank', accountNo: '50100643538245', ifsc: 'HDFC0000001', status: 'Approved' },
];

const getImagePath = (path) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const firstPart = parts[0] || '';
  const isRepoSubdirectory = firstPart && 
                             firstPart !== 'member' && 
                             firstPart !== 'admin' && 
                             firstPart !== 'dashboard' && 
                             firstPart !== 'shopping';
                             
  const base = isRepoSubdirectory ? `/${firstPart}/` : '/';
  return base + cleanPath;
};

const POPULAR_BANKS = [
  { id: '1', name: 'State Bank of India', code: 'SBI', imgSrc: getImagePath('/images/SBI.png') },
  { id: '2', name: 'HDFC Bank', code: 'HDFC', imgSrc: getImagePath('/images/hdfc.png') },
  { id: '3', name: 'ICICI Bank', code: 'ICICI', imgSrc: getImagePath('/images/icic.png') },
  { id: '4', name: 'Kotak Mahindra Bank', code: 'KOTAK', imgSrc: getImagePath('/images/kotak.png') },
  { id: '5', name: 'Axis Bank', code: 'AXIS', imgSrc: getImagePath('/images/Axix.png') },
  { id: '6', name: 'Punjab National Bank', code: 'PNB', imgSrc: getImagePath('/images/pnb.jpg') },
  { id: '7', name: 'Bank of Baroda', code: 'BOB', imgSrc: getImagePath('/images/BOB.png') },
  { id: '8', name: 'Canara Bank', code: 'CANARA', imgSrc: getImagePath('/images/Canara.png') },
  { id: '9', name: 'Union Bank of India', code: 'UBI', imgSrc: getImagePath('/images/union.png') }
];

const MOCK_TRANSACTIONS = [];

const Payout = () => {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showModal, setShowModal] = useState(null); 
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [amounts, setAmounts] = useState({});
  const [mpinDigits, setMpinDigits] = useState(['', '', '', '']);
  const [remark, setRemark] = useState('');
  const [transferData, setTransferData] = useState(null);
  const [newAcc, setNewAcc] = useState({ name: '', bank: '', accountNo: '', ifsc: '' });
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  
  // Master Transfer Form States
  const [moveTo, setMoveTo] = useState('wallet');
  const [masterAmount, setMasterAmount] = useState('');
  const [txnMode, setTxnMode] = useState('IMPS');

  const sessionStr = localStorage.getItem('bss_current_session');
  let retailerMobile = '8750189025';
  let retailerName = 'Demo Retailer';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session?.name) retailerName = session.name;
      if (session?.mobile) retailerMobile = session.mobile;
    } catch (e) {}
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerifyAccount = () => {
    if (!newAcc.accountNo || !newAcc.ifsc) {
      showToast('Enter Account & IFSC first', 'error');
      return;
    }
    setVerifyLoading(true);
    setTimeout(() => {
      setVerifyLoading(false);
      setIsVerified(true);
      setNewAcc(prev => ({ ...prev, name: 'VISHNU PRAJAPATI' }));
      showToast('Account Verified: VISHNU PRAJAPATI');
    }, 1500);
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAcc.name || !newAcc.bank || !newAcc.accountNo || !newAcc.ifsc) {
      showToast('Please fill and verify all fields', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newList = [...accounts, { ...newAcc, id: Date.now(), status: 'Approved' }];
      setAccounts(newList);
      setLoading(false);
      showToast('Payout Bank Account added successfully');
      setCurrentView('dashboard');
      setNewAcc({ name: '', bank: '', accountNo: '', ifsc: '' });
      setIsVerified(false);
    }, 1200);
  };

  const handlePinChange = (val, index) => {
    if (isNaN(val)) return;
    const newPin = [...mpinDigits];
    newPin[index] = val.slice(-1);
    setMpinDigits(newPin);
    
    // auto focus next field
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePinKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !mpinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newPin = [...mpinDigits];
        newPin[index - 1] = '';
        setMpinDigits(newPin);
      }
    }
  };

  const initiatePayout = (acc, mode) => {
    const amount = amounts[acc.id];
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setTransferData({ ...acc, amount: parseFloat(amount), mode });
    setMpinDigits(['', '', '', '']);
    setShowModal('transferConfirm');
  };

  const handlePayoutSubmit = () => {
    const pinStr = mpinDigits.join('');
    if (!pinStr || pinStr.length < 4) {
      showToast('Please enter 4-digit M-PIN', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const surcharge = transferData.amount <= 10000 ? 5 : (transferData.amount <= 25000 ? 10 : 15);
      const totalDebit = transferData.amount + surcharge;
      const newTxn = {
        id: `PAY${Date.now().toString().slice(-6)}`,
        amount: transferData.amount,
        charge: surcharge,
        total: totalDebit,
        name: transferData.name,
        accountNo: transferData.accountNo,
        bank: transferData.bank,
        ifsc: transferData.ifsc,
        mode: transferData.mode,
        status: 'success',
        customerName: retailerName,
        customerMobile: retailerMobile,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      setTransactions([newTxn, ...transactions]);
      setReceiptData(newTxn);
      showToast('Payout initiated successfully!', 'success');
      setMpinDigits(['', '', '', '']);
      setRemark('');
      setSearchTerm('');
      setAmounts(prev => ({ ...prev, [transferData.id]: '' }));
      setShowModal(null);
    }, 2000);
  };

  const handleDeleteAccount = (id) => {
    setDeleteTargetId(id);
    setShowModal('confirmDelete');
  };

  const confirmDeletion = () => {
    setAccounts(accounts.filter(acc => acc.id !== deleteTargetId));
    showToast('Account removed successfully');
    setShowModal(null);
  };

  const handleExecuteWalletTransfer = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Amount successfully moved to Main Wallet!', 'success');
      setMasterAmount('');
      setShowModal(null);
    }, 1200);
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountNo.includes(searchTerm) || acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.msg}
        </div>
      )}

      {/* Main stacked layout */}
      {currentView === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Top Row: Payout Form Card & Surcharge Card side-by-side */}
          <div className={styles.topRow}>
            {/* Master Transfer Form */}
            <div className={styles.transferFormCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                  <FaUniversity color="#e11d48" /> Payout Service
                </h2>
              </div>

              <div className={styles.transferFormGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>AEPS Wallet Balance</label>
                  <input 
                    type="text" 
                    value="84,520.00" 
                    disabled 
                    className={styles.disabledInput} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className={styles.textInput}
                    value={masterAmount}
                    onChange={(e) => setMasterAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.transferFormGrid}>
                <div className={styles.radioGroup}>
                  <span className={styles.radioLabel}>Move To :</span>
                  <label className={styles.radioItem}>
                    <input type="radio" name="moveTo" value="wallet" checked={moveTo === 'wallet'} onChange={() => setMoveTo('wallet')} />
                    <span>Main Wallet</span>
                  </label>
                  <label className={styles.radioItem}>
                    <input type="radio" name="moveTo" value="bank" checked={moveTo === 'bank'} onChange={() => setMoveTo('bank')} />
                    <span>Bank</span>
                  </label>
                </div>
                
                <div className={`${styles.radioGroup} ${moveTo === 'wallet' ? styles.disabledRadioGroup : ''}`}>
                  <span className={styles.radioLabel}>Transaction Mode :</span>
                  <label className={styles.radioItem}>
                    <input type="radio" name="txnMode" value="IMPS" checked={txnMode === 'IMPS'} onChange={() => setTxnMode('IMPS')} disabled={moveTo === 'wallet'} />
                    <span>IMPS</span>
                  </label>
                  <label className={styles.radioItem}>
                    <input type="radio" name="txnMode" value="NEFT" checked={txnMode === 'NEFT'} onChange={() => setTxnMode('NEFT')} disabled={moveTo === 'wallet'} />
                    <span>NEFT</span>
                  </label>
                </div>
              </div>

              <div className={styles.walletTransferAction} style={{ visibility: moveTo === 'wallet' ? 'visible' : 'hidden' }}>
                <button 
                  className={styles.walletTransferBtn}
                  disabled={loading || moveTo !== 'wallet'}
                  onClick={() => {
                    if(moveTo !== 'wallet') return;
                    if(!masterAmount || masterAmount <= 0) return showToast('Enter valid amount', 'error');
                    setShowModal('confirmWalletTransfer');
                  }}
                >
                  {loading ? <FaSpinner className="fa-spin" /> : 'Move to Main Wallet'}
                </button>
              </div>
            </div>

            {/* Surcharge Structure Card */}
            <div className={styles.surchargeCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 className={styles.surchargeTitle}>
                  <FaShieldAlt color="#1756AA" /> Surcharge Structure
                </h3>
              </div>

              <div className={styles.surchargeList}>
                <div className={styles.surchargeItem}>
                  <span className={styles.surchargeSlab}>₹1 - ₹10,000</span>
                  <span className={styles.surchargeFee}>₹5.00 Charge</span>
                </div>
                <div className={styles.surchargeItem}>
                  <span className={styles.surchargeSlab}>₹10,001 - ₹25,000</span>
                  <span className={styles.surchargeFee}>₹10.00 Charge</span>
                </div>
                <div className={styles.surchargeItem}>
                  <span className={styles.surchargeSlab}>₹25,001 - ₹2,00,000</span>
                  <span className={styles.surchargeFee}>₹15.00 Charge</span>
                </div>
              </div>
              <div style={{ marginTop: 'auto', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <FaLock style={{ color: '#1756AA', fontSize: '1rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: '#1e3a8a', fontWeight: '750', lineHeight: '1.3' }}>Settlements are processed 24/7/365 instantly.</span>
              </div>
            </div>
          </div>

          {moveTo === 'bank' && (
            <div className={styles.cardSection}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>Bank Details</h2>
                
                <div className={styles.headerSearchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search Account No or Name..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoComplete="new-password"
                    name="payout_search_no_autofill"
                  />
                </div>

                <button className={styles.addAccBtn} onClick={() => setCurrentView('addAccount')}>
                  <FaPlusCircle /> Add Account
                </button>
              </div>

              <div className={styles.accountsScrollArea}>
                <div className={styles.accountsGrid}>
                  {filteredAccounts.length === 0 ? (
                    <div className={styles.emptyAccounts}>
                      <FaUniversity className={styles.emptyIcon} />
                      <p>No verified settlement accounts found.</p>
                    </div>
                  ) : (
                    filteredAccounts.map(acc => (
                      <div key={acc.id} className={styles.accountCard}>
                        <div className={styles.accountBadge}>
                          <FaCheckCircle /> Verified
                        </div>
                        <div className={styles.accountDetails}>
                          <h3>{acc.name}</h3>
                          <p className={styles.bankName}>{acc.bank}</p>
                          <p className={styles.accNo}>A/C: {acc.accountNo}</p>
                          <p className={styles.ifsc}>IFSC: {acc.ifsc}</p>
                        </div>
                        
                        <div className={styles.payoutFormRow}>
                          <div className={styles.amountInputWrap}>
                            <span className={styles.amountCurrencySymbol}>₹</span>
                            <input 
                              type="number" 
                              placeholder="Amount" 
                              className={styles.amountInput}
                              value={amounts[acc.id] || ''}
                              onChange={e => setAmounts({ ...amounts, [acc.id]: e.target.value })}
                            />
                          </div>
                          <div className={styles.modeGroup}>
                            <button className={styles.modeBtnImps} onClick={() => initiatePayout(acc, 'IMPS')}>IMPS</button>
                            <button className={styles.modeBtnNeft} onClick={() => initiatePayout(acc, 'NEFT')}>NEFT</button>
                          </div>
                        </div>

                        <button className={styles.deleteAccBtn} onClick={() => handleDeleteAccount(acc.id)}>
                          <FaTrash /> Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Premium Datatable for Recent Payout History */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.cardTitle}><FaHistory /> Recent Payout History</h3>
            </div>
            
            <div className={styles.tableResponsive}>
              <table className={styles.premiumTable}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date / Time</th>
                    <th>Transaction ID</th>
                    <th>Beneficiary Name</th>
                    <th>Bank Name</th>
                    <th>Account No.</th>
                    <th>Payout Mode</th>
                    <th>Amount</th>
                    <th>Charge</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No recent payout transactions.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn, idx) => (
                      <tr key={txn.id}>
                        <td style={{ color: '#64748b', fontWeight: '700', fontSize: '0.78rem' }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                              {txn.date ? txn.date.split(' ')[0] : '—'}
                            </span>
                            <span style={{ fontWeight: '600', color: '#94a3b8', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                              {txn.date ? txn.date.split(' ')[1] : ''}
                            </span>
                          </div>
                        </td>
                        <td><code style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{txn.id}</code></td>
                        <td>{txn.name}</td>
                        <td>{txn.bank}</td>
                        <td>{txn.accountNo}</td>
                        <td>
                          <span style={{ 
                            background: 'rgba(23,86,170,0.08)', 
                            color: '#1756AA', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.72rem', 
                            fontWeight: '700' 
                          }}>
                            {txn.mode || 'IMPS'}
                          </span>
                        </td>
                        <td>₹{Number(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>₹{Number(txn.charge || 5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[txn.status]}`}>
                            {txn.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {txn.status === 'success' && (
                            <button
                              className={styles.printIconBtn}
                              onClick={() => setReceiptData(txn)}
                              title="Print Receipt"
                            >
                              <FaPrint />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {currentView === 'addAccount' && (
        <div className={styles.addAccountViewCard}>
          <div className={styles.viewHeader}>
            <button className={styles.backBtn} onClick={() => setCurrentView('dashboard')}>
              <FaArrowLeft /> Back to Payout
            </button>
            <h2 className={styles.sectionTitle}>Add Settlement Account</h2>
          </div>
          
          <form onSubmit={handleAddAccount} className={styles.addAccountForm}>
            <div className={styles.formGroup} style={{ marginTop: '5px' }}>
              <div className={styles.presetContainer}>
                <span className={styles.presetLabel} style={{ marginBottom: '4px' }}>Quick Bank Selection</span>
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '4px', paddingRight: '4px' }}>
                  {POPULAR_BANKS.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setNewAcc({ ...newAcc, bank: b.name })}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        minWidth: '65px', opacity: 1,
                        transform: newAcc.bank === b.name ? 'scale(1.08)' : 'scale(1)', transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fff', border: newAcc.bank === b.name ? '2px solid #1756AA' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6px', boxShadow: newAcc.bank === b.name ? '0 4px 10px rgba(23,86,170,0.2)' : 'none' }}>
                        <img
                          src={b.imgSrc}
                          alt={b.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: newAcc.bank === b.name ? '#1756AA' : '#64748b' }}>{b.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.inlineFormGrid}>
              <div className={styles.modalInputWrap}>
                <label>Select Bank from List</label>
                <select 
                  className={styles.modalInputField} 
                  value={newAcc.bank} 
                  onChange={e => setNewAcc({ ...newAcc, bank: e.target.value })}
                >
                  <option value="">-- Choose Customer Bank --</option>
                  {POPULAR_BANKS.map(bank => (
                    <option key={bank.id} value={bank.name}>{bank.name} ({bank.code})</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalInputWrap}>
                <label>Account Number</label>
                <div className={styles.modalAdharRow}>
                  <input 
                    className={styles.modalInputField} 
                    style={{ flex: 1 }} 
                    type="text" 
                    placeholder="Enter 9-18 digit Account No" 
                    value={newAcc.accountNo} 
                    onChange={e => setNewAcc({ ...newAcc, accountNo: e.target.value.replace(/\D/g, '').slice(0, 18) })} 
                  />
                  <button 
                    type="button" 
                    className={`${styles.modalValidateBtn} ${isVerified ? styles.modalSuccess : ''}`} 
                    onClick={handleVerifyAccount}
                    disabled={verifyLoading || isVerified}
                  >
                    {verifyLoading ? <FaSpinner className={styles.spinner} /> : (isVerified ? '✓ Verified' : 'Verify')}
                  </button>
                </div>
              </div>

              <div className={styles.modalInputWrap}>
                <label>IFSC Code</label>
                <input 
                  className={styles.modalInputField} 
                  type="text" 
                  placeholder="e.g. KKBK0000962" 
                  value={newAcc.ifsc} 
                  onChange={e => setNewAcc({ ...newAcc, ifsc: e.target.value.toUpperCase().slice(0, 11) })} 
                />
              </div>

              <div className={styles.modalInputWrap}>
                <label>Beneficiary Name</label>
                <input 
                  className={styles.modalInputField} 
                  type="text" 
                  placeholder="Full Name" 
                  value={newAcc.name} 
                  onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} 
                  readOnly={isVerified}
                  style={isVerified ? { background: '#F1F5F9', color: '#475569' } : {}}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`${styles.saveAccountBtn} ${isVerified ? styles.modalSuccessBtn : ''}`} 
              disabled={loading}
            >
              {loading ? <FaSpinner className={styles.spinner} /> : 'Save Account'}
            </button>
          </form>
        </div>
      )}

      {showModal === 'transferConfirm' && (() => {
        const surcharge = transferData.amount <= 10000 ? 5 : (transferData.amount <= 25000 ? 10 : 15);
        const totalDebit = transferData.amount + surcharge;

        return (
          <div className={styles.modalOverlay} onClick={() => setShowModal(null)}>
            <div className={styles.receiptModalCard} onClick={e => e.stopPropagation()}>
              
              <div className={styles.modalHeader}>
                <h3 className={styles.receiptTitle}><FaShieldAlt /> Transaction Review</h3>
                <button onClick={() => setShowModal(null)} className={styles.closeBtn}>✕</button>
              </div>

              <div className={styles.modalBodyGrid}>
                {/* Left side: Premium Receipt Ticket */}
                <div className={styles.modalGridLeft}>
                  <div className={styles.receiptTicket}>
                    <div className={styles.receiptHeader}>
                      <div className={styles.receiptLogo}>
                        <FaUniversity />
                      </div>
                      <span className={styles.receiptBankName}>{transferData?.bank}</span>
                      <span className={styles.receiptAccNo}>A/C: {transferData?.accountNo}</span>
                    </div>

                    <div className={styles.receiptDivider}>
                      <div className={styles.dividerDotLeft}></div>
                      <div className={styles.dividerLine}></div>
                      <div className={styles.dividerDotRight}></div>
                    </div>

                    <div className={styles.receiptBody}>
                      <div className={styles.receiptAmountBlock}>
                        <span className={styles.receiptAmountLabel}>Transfer Amount</span>
                        <h2 className={styles.receiptAmountDisplay}>₹{transferData?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        <div className={styles.chargeBadgeRow}>
                          <span className={styles.chargeBadge}>+ ₹{surcharge.toFixed(2)} Payout Charge</span>
                        </div>
                      </div>

                      <div className={styles.receiptDetailGrid}>
                        <div className={styles.receiptDetailItem}>
                          <span className={styles.detailLabel}>Beneficiary</span>
                          <strong className={styles.detailValue}>{transferData?.name}</strong>
                        </div>
                        <div className={styles.receiptDetailItem}>
                          <span className={styles.detailLabel}>Payout Mode</span>
                          <strong className={`${styles.detailValue} ${styles.modeHighlight}`}>{transferData?.mode}</strong>
                        </div>
                        <div className={styles.receiptDetailItem} style={{ gridColumn: 'span 2' }}>
                          <span className={styles.detailLabel}>Total Wallet Debit</span>
                          <strong className={styles.detailTotalAmount}>₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Security PIN, remarks & Actions */}
                <div className={styles.modalGridRight}>
                  {/* Secure PIN Entry Panel */}
                  <div className={styles.securePinPanel}>
                    <div className={styles.panelTitleRow}>
                      <FaLock className={styles.lockIcon} />
                      <span>Enter Secure M-PIN</span>
                    </div>
                    
                    <div className={styles.digitInputRow}>
                      {mpinDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`pin-${idx}`}
                          type="password"
                          maxLength={1}
                          className={styles.pinDigitBox}
                          value={digit}
                          onChange={e => handlePinChange(e.target.value, idx)}
                          onKeyDown={e => handlePinKeyDown(e, idx)}
                          autoComplete="new-password"
                        />
                      ))}
                    </div>
                    <span className={styles.secureBadge}>🛡️ End-to-End Encrypted Settlement</span>
                  </div>

                  {/* Remarks Box */}
                  <div className={styles.remarkBox}>
                    <label className={styles.remarkLabel}>Remark (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Settlement notes..." 
                      className={styles.remarkInput}
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                    />
                  </div>

                  {/* Action row */}
                  <div className={styles.confirmActions}>
                    <button className={styles.modalCancelBtn} onClick={() => setShowModal(null)}>Cancel</button>
                    <button 
                      className={`${styles.modalConfirmBtn} ${mpinDigits.join('').length === 4 ? styles.payoutReadyBtn : ''}`}
                      onClick={handlePayoutSubmit}
                      disabled={loading || mpinDigits.join('').length < 4}
                    >
                      {loading ? <FaSpinner className={styles.spinner} /> : (
                        <>Confirm & Payout</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {showModal === 'confirmDelete' && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.deletePrompt}>
              <FaExclamationTriangle className={styles.deletePromptIcon} />
              <h3>Remove Settlement Account</h3>
              <p>Are you sure you want to remove this settlement account? You will have to re-verify it to use it again.</p>
              <div className={styles.deleteActions}>
                <button className={styles.modalCancelBtn} onClick={() => setShowModal(null)}>Cancel</button>
                <button className={styles.modalDeleteBtn} onClick={confirmDeletion}>Remove Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal === 'confirmWalletTransfer' && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.deletePrompt}>
              <FaMoneyBillWave className={styles.deletePromptIcon} style={{ color: '#10b981' }} />
              <h3>Confirm Wallet Transfer</h3>
              <p>Are you sure you want to transfer <strong>₹{parseFloat(masterAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> from your AEPS Wallet to your Main Wallet?</p>
              <div className={styles.deleteActions}>
                <button className={styles.modalCancelBtn} onClick={() => setShowModal(null)} disabled={loading}>Cancel</button>
                <button 
                  className={styles.modalConfirmBtn} 
                  style={{ background: '#10b981' }} 
                  onClick={handleExecuteWalletTransfer}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className={styles.spinner} /> : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        data={receiptData} 
      />
    </div>
  );
};

export default Payout;
