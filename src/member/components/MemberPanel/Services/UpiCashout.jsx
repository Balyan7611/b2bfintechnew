import React, { useState, useEffect } from 'react';
import { 
  FaQrcode, FaMobileAlt, FaUser, FaDollarSign, FaPaperPlane, 
  FaCheckCircle, FaPrint, FaClock, FaSync, FaShieldAlt, FaInfoCircle
} from 'react-icons/fa';
import styles from './UpiCashout.module.css';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const INITIAL_TRANSACTIONS = [
  { sNo: 1, date: '2026-05-19 12:45', orderId: 'UC98273612', mobile: '9876543210', name: 'Amit Sharma', amount: 500, status: 'success' },
  { sNo: 2, date: '2026-05-19 11:20', orderId: 'UC98273104', mobile: '8765432109', name: 'Rajesh Verma', amount: 2000, status: 'success' },
  { sNo: 3, date: '2026-05-18 17:10', orderId: 'UC98270912', mobile: '7654321098', name: 'Karan Malhotra', amount: 1000, status: 'failed' }
];

const UpiCashout = () => {
    const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  
    const [step, setStep] = useState('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(180);   const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptData, setReceiptData] = useState(null);

    const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

    useEffect(() => {
    if (step !== 'qrcode') return;
    if (timeLeft <= 0) {
      setStep('form');
      showToast('Transaction expired! Please try again.', 'error');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickSelect = (val) => {
    setAmount(val.toString());
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (!customerName.trim()) {
      showToast('Please enter the customer name', 'error');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    showToast('Sending OTP to customer...', 'info');

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      showToast('Verification OTP sent successfully!', 'success');
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

        if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.some(val => val === '')) {
      showToast('Please enter the 4-digit verification code', 'error');
      return;
    }

    setLoading(true);
    showToast('Verifying customer OTP...', 'info');

    setTimeout(() => {
      setLoading(false);
      setStep('qrcode');
      setTimeLeft(180);       showToast('OTP verified! UPI QR generated.', 'success');
    }, 1200);
  };

  const handleSimulatePayment = (success = true) => {
    setLoading(true);
    showToast(success ? 'Processing UPI settlement...' : 'Reclaiming settlement...', 'info');

    setTimeout(() => {
      setLoading(false);
      
      const newTxn = {
        sNo: transactions.length + 1,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        orderId: `UC${Date.now().toString().slice(-8)}`,
        mobile: mobileNumber,
        name: customerName,
        amount: parseFloat(amount),
        status: success ? 'success' : 'failed'
      };

      setTransactions([newTxn, ...transactions]);

      if (success) {
        showToast('UPI cashout transaction successful!', 'success');
        setReceiptData({
          ...newTxn,
          charge: parseFloat(amount) * 0.005,
          total: parseFloat(amount)
        });
      } else {
        showToast('UPI cashout transaction failed by customer bank.', 'error');
      }
      
            setMobileNumber('');
      setCustomerName('');
      setAmount('');
      setOtpCode(['', '', '', '']);
      setStep('form');
    }, 1500);
  };

  const handlePrintReceipt = (txn) => {
    setReceiptData({
      ...txn,
      charge: txn.amount * 0.005,
      total: txn.amount
    });
  };

  const filteredTxns = transactions.filter(t => 
    t.mobile.includes(searchQuery) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.orderId.includes(searchQuery)
  );

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.message}
        </div>
      )}

            <div className={styles.mainLayout}>
        
                <div className={styles.formCard}>
          
          {step === 'form' && (
            <form onSubmit={handleSendOtp} className={styles.formFlow}>
              <h3 className={styles.cardTitle}>
                <FaQrcode /> Initiate UPI Cashout
              </h3>

              <div className={styles.inputGrid}>
                <div className={styles.formGroup}>
                  <label>Customer Mobile Number</label>
                  <div className={styles.inputWrapper}>
                    <FaMobileAlt className={styles.inputIcon} />
                    <input 
                      type="text" 
                      maxLength="10" 
                      placeholder="Enter 10-Digit Mobile" 
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Customer Name</label>
                  <div className={styles.inputWrapper}>
                    <FaUser className={styles.inputIcon} />
                    <input 
                      type="text" 
                      placeholder="Enter Customer Name" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Transaction Amount (₹)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.rupeeSymbol}>₹</span>
                    <input 
                      type="number" 
                      placeholder="Enter Amount to Cashout" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className={`${styles.inputField} ${styles.amountField}`}
                    />
                  </div>
                </div>
              </div>

                            <div className={styles.presetContainer}>
                <span className={styles.presetLabel}>Quick Select Amount</span>
                <div className={styles.presetGrid}>
                  {QUICK_AMOUNTS.map(val => (
                    <button 
                      key={val} 
                      type="button" 
                      onClick={() => handleQuickSelect(val)}
                      className={`${styles.presetBtn} ${amount === val.toString() ? styles.activePreset : ''}`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? <div className={styles.spinner}></div> : <><FaPaperPlane /> Send OTP Verification</>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className={styles.formFlow}>
              <h3 className={styles.cardTitle}>
                <FaShieldAlt /> Enter Verification OTP
              </h3>
              <p className={styles.stepSubtitle}>
                A secure verification code has been dispatched to <strong>+91 {mobileNumber}</strong>. Please enter the OTP below.
              </p>

              <div className={styles.otpGrid}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    className={styles.otpBox}
                    autoComplete="off"
                  />
                ))}
              </div>

              <div className={styles.actionButtonGroup}>
                <button type="button" onClick={() => setStep('form')} className={styles.btnSec}>
                  Back
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  {loading ? <div className={styles.spinner}></div> : 'Verify & Generate QR'}
                </button>
              </div>
            </form>
          )}

          {step === 'qrcode' && (
            <div className={styles.qrFlowContainer}>
              <h3 className={styles.cardTitle}>
                <FaQrcode /> Scan QR & Pay
              </h3>
              
              <div className={styles.qrLayout}>
                                <div className={styles.qrFrame}>
                  <div className={styles.scanOutlineLine}></div>
                  <div className={styles.qrCodeVector}>
                                        <div className={styles.qrCornerSquare} style={{ top: 12, left: 12 }}></div>
                    <div className={styles.qrCornerSquare} style={{ top: 12, right: 12 }}></div>
                    <div className={styles.qrCornerSquare} style={{ bottom: 12, left: 12 }}></div>
                    
                                        <div className={styles.qrCenterDot} style={{ top: 50, left: 50 }}></div>
                    <div className={styles.qrCenterDot} style={{ top: 70, left: 30 }}></div>
                    <div className={styles.qrCenterDot} style={{ top: 90, left: 80 }}></div>
                    <div className={styles.qrCenterDot} style={{ top: 40, left: 110 }}></div>
                    <div className={styles.qrCenterDot} style={{ top: 120, left: 60 }}></div>
                    <div className={styles.qrCenterDot} style={{ top: 100, left: 120 }}></div>
                    <div className={styles.qrCenterDot} style={{ top: 70, left: 90 }}></div>

                                        <div className={styles.qrCentralUpiBadge}>UPI</div>
                  </div>
                </div>

                <div className={styles.qrMetaInfo}>
                  <div className={styles.qrAmountBadge}>
                    <span>AMOUNT TO PAY</span>
                    <strong>₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  
                  <div className={styles.timerRow}>
                    <FaClock /> Expiring In: <strong className={styles.timerText}>{formatTime(timeLeft)}</strong>
                  </div>
                </div>
              </div>

                            <div className={styles.upiAppsRow}>
                <span className={styles.upiIconPill} style={{ background: '#EBF4FF', color: '#1A73E8' }}>GPay</span>
                <span className={styles.upiIconPill} style={{ background: '#F3E8FF', color: '#6F2DA8' }}>PhonePe</span>
                <span className={styles.upiIconPill} style={{ background: '#E0F2FE', color: '#00BAF2' }}>Paytm</span>
                <span className={styles.upiIconPill} style={{ background: '#F0FDF4', color: '#16A34A' }}>BHIM UPI</span>
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>

              <div className={styles.simulationControls}>
                <span className={styles.testTip}>💡 Merchant Control Panel (Simulate scan result):</span>
                <div className={styles.actionButtonGroup}>
                  <button type="button" onClick={() => handleSimulatePayment(false)} className={styles.btnSecError}>
                    Simulate Failure
                  </button>
                  <button type="button" onClick={() => handleSimulatePayment(true)} className={styles.btnPrimarySuccess}>
                    Simulate Success
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

                <div className={styles.illustrationCard}>
          <div className={styles.posVectorContainer}>
                        <div className={styles.vectorPOSDevice}>
              <div className={styles.vectorPOSScreen}>
                <div className={styles.vectorQRMini}>
                  <div className={styles.miniCornerSquare}></div>
                  <div className={styles.miniCenterDot}></div>
                </div>
                <span className={styles.vectorScreenText}>SCAN & SCAN</span>
              </div>
              <div className={styles.vectorPOSButtons}>
                <div className={styles.posKey}></div>
                <div className={styles.posKey}></div>
                <div className={styles.posKey}></div>
                <div className={styles.posKey} style={{ background: '#22c55e' }}></div>
              </div>
            </div>

                        <div className={styles.vectorWaveRing} style={{ animationDelay: '0s' }}></div>
            <div className={styles.vectorWaveRing} style={{ animationDelay: '0.8s' }}></div>

            <div className={styles.vectorPhone}>
              <div className={styles.vectorPhoneHeader}></div>
              <div className={styles.vectorPhoneCheckmark}>
                <FaCheckCircle />
              </div>
              <div className={styles.vectorPhoneText}>₹{amount || '1000'}.00 Sent!</div>
            </div>

            <div className={styles.vectorCard}>
              <div className={styles.vectorCardChip}></div>
              <div className={styles.vectorCardNumber}>•••• •••• •••• 4291</div>
            </div>
          </div>

          <div className={styles.infoHighlightBanner}>
            <FaInfoCircle />
            <span>
              Dynamic QR ensures zero fraud. Cashout is processed directly from the customer's UPI app to your settlement bank instantly.
            </span>
          </div>
        </div>

      </div>

      {/* Table: Transaction History log */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>UPI Cashout Reports</h2>
          <div className={styles.searchBox}>
            <FaMobileAlt className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Mobile, Name or Order ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.premiumTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date / Time</th>
                <th>Order ID</th>
                <th>Customer Mobile</th>
                <th>Customer Name</th>
                <th>Transaction Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    No recent UPI cashout logs found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn, idx) => (
                  <tr key={txn.orderId}>
                    <td>{idx + 1}</td>
                    <td>{txn.date}</td>
                    <td><code className={styles.monoCode}>{txn.orderId}</code></td>
                    <td>{txn.mobile}</td>
                    <td>{txn.name}</td>
                    <td style={{ fontWeight: 800 }}>₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`${styles.statusPill} ${styles[txn.status]}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={styles.printBtn}
                        onClick={() => handlePrintReceipt(txn)}
                        title="Print / View Receipt"
                      >
                        <FaPrint />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptData && (
        <div className={styles.modalOverlay} onClick={() => setReceiptData(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.receiptTitle}>
                <FaCheckCircle style={{ color: '#22c55e' }} /> Cashout Receipt
              </h3>
              <button className={styles.closeBtn} onClick={() => setReceiptData(null)}>✕</button>
            </div>

            <div className={styles.receiptTicket}>
              <div className={styles.receiptHeader}>
                <div className={styles.receiptLogo}>🏦</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.receiptBankName}>UPI CASHOUT SETTLEMENT</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Secured UPI Network</span>
                </div>
              </div>

              <div className={styles.receiptDivider}>
                <div className={styles.dividerDotLeft}></div>
                <div className={styles.dividerLine}></div>
                <div className={styles.dividerDotRight}></div>
              </div>

              <div className={styles.receiptBody}>
                <div className={styles.receiptAmountBlock}>
                  <span className={styles.receiptAmountLabel}>TOTAL CASHOUT VALUE</span>
                  <strong className={styles.receiptAmountDisplay}>
                    ₹{receiptData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                  <div className={styles.chargeBadgeRow}>
                    <span className={styles.chargeBadge}>Surcharge: ₹{receiptData.charge.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.receiptDetailGrid}>
                  <div className={styles.receiptDetailItem}>
                    <span className={styles.detailLabel}>ORDER ID</span>
                    <span className={styles.detailValue}>{receiptData.orderId}</span>
                  </div>
                  <div className={styles.receiptDetailItem}>
                    <span className={styles.detailLabel}>DATE & TIME</span>
                    <span className={styles.detailValue}>{receiptData.date}</span>
                  </div>
                  <div className={styles.receiptDetailItem}>
                    <span className={styles.detailLabel}>CUSTOMER MOBILE</span>
                    <span className={styles.detailValue}>{receiptData.mobile}</span>
                  </div>
                  <div className={styles.receiptDetailItem}>
                    <span className={styles.detailLabel}>CUSTOMER NAME</span>
                    <span className={styles.detailValue}>{receiptData.name}</span>
                  </div>
                  <div className={styles.receiptDetailItem}>
                    <span className={styles.detailLabel}>METHOD</span>
                    <span className={styles.modeHighlight}>DYNAMIC UPI QR</span>
                  </div>
                  <div className={styles.receiptDetailItem}>
                    <span className={styles.detailLabel}>SETTLEMENT</span>
                    <strong className={styles.detailTotalAmount} style={{ color: '#16a34a' }}>SUCCESSFUL</strong>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className={styles.btnPrintSubmit}
              onClick={() => {
                showToast('Initializing printer command...', 'success');
                window.print();
              }}
            >
              <FaPrint /> Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpiCashout;
