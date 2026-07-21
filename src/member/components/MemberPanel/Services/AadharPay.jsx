import React, { useState, useEffect } from 'react';
import { 
  FaFingerprint, FaMobileAlt, FaRupeeSign, FaUniversity, 
  FaSearch, FaPrint, FaShieldAlt, FaHistory, FaCheckCircle, 
  FaTimes, FaSpinner, FaQrcode
} from 'react-icons/fa';
import styles from './AadharPay.module.css';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';

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

const PRESETS = [500, 1000, 2000, 3000, 5000, 10000];

const AadharPay = () => {
  const [activeTab, setActiveTab] = useState('AADHARPAY');
  const [mobileNumber, setMobileNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('Disconnected'); // Disconnected, Connecting, Ready
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]); // ✅ No dummy data
  const [receiptData, setReceiptData] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePresetClick = (val) => {
    setAmount(val.toString());
  };

  const handleCheckDevice = () => {
    setDeviceStatus('Connecting');
    showToast('Scanning USB ports for biometric devices...', 'info');
    
    setTimeout(() => {
      setDeviceStatus('Ready');
      showToast('Morpho/Mantra device connected successfully! driver ready.', 'success');
    }, 1200);
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    
    if (deviceStatus !== 'Ready') {
      showToast('Please check and connect biometric device first!', 'error');
      return;
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid transfer amount', 'error');
      return;
    }
    if (!aadharNumber || aadharNumber.replace(/\s/g, '').length !== 12) {
      showToast('Please enter a valid 12-digit Aadhaar number', 'error');
      return;
    }
    if (!selectedBank) {
      showToast('Please select the customer bank', 'error');
      return;
    }

    setIsScanning(true);
    showToast('Biometric scanner activated. Please place thumb...', 'info');

    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      setLoading(true);
      
      // Simulate API process
      setTimeout(() => {
        setLoading(false);
        const success = Math.random() > 0.15; // 85% success rate
        
        const newTxn = {
          sNo: transactions.length + 1,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          orderId: `AP${Date.now().toString().slice(-8)}`,
          type: activeTab,
          amount: parseFloat(amount),
          status: success ? 'success' : 'failed'
        };

        setTransactions([newTxn, ...transactions]);

        if (success) {
          const bData = POPULAR_BANKS.find(b => b.id === selectedBank);
          showToast('Aadhaar transaction processed successfully!', 'success');
          setReceiptData({
            ...newTxn,
            mobileNumber,
            aadhar: aadharNumber.replace(/.(?=.{4})/g, 'X'),
            bankName: bData?.name || 'Unknown Bank',
            bankLogo: bData?.imgSrc || null,
            memberName: 'Demo Retailer',
            memberId: 'RET123456',
            commission: 0,
            bankTransId: `TXN${Date.now().toString().slice(-8)}`,
            rrn: `RRN${Date.now().toString().slice(-10)}`
          });
          // Reset form
          setMobileNumber('');
          setAmount('');
          setAadharNumber('');
          setSelectedBank('');
        } else {
          showToast('Transaction declined by issuer bank (AePS limit reached).', 'error');
        }
      }, 1500);
    }, 2500);
  };

  const handlePrintReceipt = (txn) => {
    // Open a mock receipt
    const randomBank = POPULAR_BANKS[Math.floor(Math.random() * POPULAR_BANKS.length)];
    setReceiptData({
      ...txn,
      mobileNumber: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000),
      aadhar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
      bankName: randomBank.name,
      bankLogo: randomBank.imgSrc,
      memberName: 'Demo Retailer',
      memberId: 'RET123456',
      commission: 0,
      bankTransId: `TXN${Date.now().toString().slice(-8)}`,
      rrn: `RRN${Date.now().toString().slice(-10)}`
    });
  };

  const formatAadhar = (val) => {
    const clean = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = clean.match(/\d{4,12}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return clean;
    }
  };

  const handleAadharChange = (e) => {
    const formatted = formatAadhar(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 12) {
      setAadharNumber(formatted);
    }
  };

  const filteredTxns = transactions.filter(t => 
    t.orderId.includes(searchTerm) || 
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.msg}
        </div>
      )}

      {/* Main Grid: Form + Biometric Widget */}
      <div className={styles.mainLayout}>
        <div className={styles.formCard}>
          {/* Integrated Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <FaShieldAlt color="#1756AA" /> AadharPay Gateway Portal
            </h2>
          </div>
          
          <form onSubmit={handleTransactionSubmit} className={styles.inputGrid}>
            {/* Mobile Number */}
            <div className={styles.formGroup}>
              <label>Customer Mobile Number</label>
              <div className={styles.inputWrapper}>
                <FaMobileAlt className={styles.inputIcon} />
                <input
                  type="text"
                  maxLength={10}
                  className={styles.inputField}
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {/* Aadhaar Number */}
            <div className={styles.formGroup}>
              <label>Customer Aadhaar Card Number (UID)</label>
              <div className={styles.inputWrapper}>
                <FaFingerprint className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="0000 0000 0000"
                  value={aadharNumber}
                  onChange={handleAadharChange}
                />
              </div>
            </div>

            {/* Amount input - only shows if Cash Withdrawal or AadharPay */}
            {(activeTab === 'CASH WITHDRAWAL' || activeTab === 'AADHARPAY') && (
              <div className={styles.formGroup}>
                <label>Amount to Withdraw (₹)</label>
                <div className={styles.inputWrapper}>
                  <FaRupeeSign className={styles.inputIcon} />
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="Enter amount (Min: ₹100)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Select Bank */}
            <div className={styles.formGroup}>
              <label>Select Customer Bank</label>
              <div className={styles.inputWrapper}>
                <FaUniversity className={styles.inputIcon} />
                <select 
                  className={styles.inputField} 
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                  style={{ paddingLeft: '46px' }}
                >
                  <option value="">-- Choose Customer Bank --</option>
                  {POPULAR_BANKS.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name} ({bank.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets Grid - only shows if Cash Withdrawal or AadharPay */}
            {(activeTab === 'CASH WITHDRAWAL' || activeTab === 'AADHARPAY') && (
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <div className={styles.presetContainer}>
                  <span className={styles.presetLabel}>Quick Amount Shortcuts (₹)</span>
                  <div className={styles.presetGrid}>
                    {PRESETS.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.presetBtn} ${amount === p.toString() ? styles.activePreset : ''}`}
                        onClick={() => handlePresetClick(p)}
                      >
                        ₹{p.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Quick Bank Selection Logos */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginTop: '5px', marginBottom: '10px' }}>
              <div className={styles.presetContainer}>
                <span className={styles.presetLabel} style={{ marginBottom: '4px' }}>Quick Bank Selection</span>
                <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '4px', paddingRight: '4px', overflowX: 'hidden', justifyContent: 'space-between' }}>
                  {POPULAR_BANKS.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBank(b.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer',
                        flex: '1', minWidth: '0', opacity: 1,
                        transform: selectedBank === b.id ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <div style={{ width: '100%', maxWidth: '48px', aspectRatio: '1/1', borderRadius: '50%', background: '#fff', border: selectedBank === b.id ? '2px solid #1756AA' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px', boxShadow: selectedBank === b.id ? '0 4px 10px rgba(23,86,170,0.2)' : 'none' }}>
                        <img
                          src={b.imgSrc}
                          alt={b.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: selectedBank === b.id ? '#1756AA' : '#64748b', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{b.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Biometric Integration Widget */}
        <div className={styles.scannerCard}>
          <h3 className={styles.cardTitle}>
            <FaFingerprint /> BIOMETRIC SCANNER
          </h3>
          
          <div 
            className={`${styles.scannerWidget} ${deviceStatus === 'Ready' ? styles.deviceActive : ''} ${isScanning ? styles.isScanning : ''}`}
            onClick={() => {
              setIsScanning(!isScanning);
              showToast(isScanning ? 'Biometric scan stopped.' : 'Biometric scan activated manually!', 'info');
            }}
            title="Click to toggle scanning animation manually!"
          >
            <FaFingerprint className={styles.scannerIcon} />
          </div>

          <div className={styles.scannerInstructions}>
            <span className={styles.instTextEn}>
              {isScanning ? 'Scanning impression... keep thumb steady.' : 'Please ask customer to place their thumb on biometric scanner.'}
            </span>
            <span className={styles.instTextHi}>
              {isScanning ? 'फिंगरप्रिंट स्कैन हो रहा है... अंगूठा स्थिर रखें।' : 'कृपया ग्राहक का अंगूठा बायोमेट्रिक स्कैनर पर रखें।'}
            </span>
            <span 
              style={{ fontSize: '0.72rem', color: '#1756AA', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}
              onClick={() => {
                setIsScanning(!isScanning);
                showToast(isScanning ? 'Scan animation stopped.' : 'Scan animation activated!', 'info');
              }}
            >
              💡 Click scanner to test animation! (चेक करने के लिए स्कैनर पर क्लिक करें)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`${styles.statusBadge} ${deviceStatus === 'Ready' ? styles.statusReady : styles.statusNotReady}`}>
              ● Device: {deviceStatus}
            </span>
          </div>

          <div className={styles.actionButtonGroup}>
            <button 
              type="button" 
              className={styles.btnSec} 
              onClick={handleCheckDevice}
              disabled={loading || isScanning}
            >
              {deviceStatus === 'Connecting' ? <FaSpinner className={styles.spinner} /> : 'Check Device'}
            </button>
            <button 
              type="button" 
              className={`${styles.btnPrimary} ${(deviceStatus !== 'Ready' || loading || isScanning) ? styles.btnDisabled : ''}`} 
              onClick={handleTransactionSubmit}
              disabled={deviceStatus !== 'Ready' || loading || isScanning}
            >
              {loading ? (
                <FaSpinner className={styles.spinner} />
              ) : (
                <>
                  <FaShieldAlt /> {activeTab === 'BALANCE ENQUIRY' ? 'Enquire Balance' : 'Cash Withdraw'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Datatable for History */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.cardTitle}><FaHistory /> Today's AePS & AadharPay Log</h3>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Order ID or Status..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
                <th>Transaction Type</th>
                <th>Transaction Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn, idx) => (
                  <tr key={txn.orderId}>
                    <td>{idx + 1}</td>
                    <td>{txn.date}</td>
                    <td><code style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{txn.orderId}</code></td>
                    <td>{txn.type}</td>
                    <td>₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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

      {/* Receipt Modal */}
      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        data={receiptData} 
      />
    </div>
  );
};

export default AadharPay;