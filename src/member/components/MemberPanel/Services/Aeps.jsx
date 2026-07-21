import React, { useState, useEffect, useRef } from 'react';
import {
  FaFingerprint, FaMobileAlt, FaRupeeSign, FaUniversity,
  FaSearch, FaPrint, FaShieldAlt, FaHistory, FaSpinner
} from 'react-icons/fa';
import styles from './Aeps.module.css';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import { useFetchServices } from '../../../../hooks/useFetchServices';

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

// ============================================================
// MANTRA MFS100 RD SERVICE CONFIG
// ============================================================
const RD_SERVICE_CANDIDATES = [
  'https://127.0.0.1:11100',
  'https://127.0.0.1:11101',
  'https://127.0.0.1:8003',
  'http://127.0.0.1:11100',
];

const PID_OPTIONS_XML = `<PidOptions ver="1.0">
  <Opts fCount="1" fType="0" iCount="0" iType="0" pCount="0" pType="0" format="0" pidVer="2.0" timeout="10000" posh="UNKNOWN" env="P" />
  <CustOpts>
    <Param name="mantrakey" value="" />
  </CustOpts>
</PidOptions>`;

const FP_STORAGE_KEY = 'aeps_fingerprint_captures';

const parseXML = (str) => new window.DOMParser().parseFromString(str, 'text/xml');

const resolveRdServiceUrl = async () => {
  const attempts = [];
  for (const base of RD_SERVICE_CANDIDATES) {
    try {
      const response = await fetch(`${base}/rd/info`, {
        method: 'GET',
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined,
      });
      const text = await response.text();
      attempts.push({ base, ok: true });
      return { base, text, attempts };
    } catch (error) {
      attempts.push({ base, ok: false, errorName: error.name, errorMsg: error.message });
    }
  }
  return { base: null, text: null, attempts };
};

const saveFingerprintCaptureLocally = (record) => {
  try {
    const existing = JSON.parse(localStorage.getItem(FP_STORAGE_KEY) || '[]');
    existing.unshift(record);
    localStorage.setItem(FP_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.error('Could not save fingerprint capture locally:', e);
  }
};

const Aeps = () => {
  const [activeTab, setActiveTab] = useState('CASH WITHDRAWAL');
  const [selectedService, setSelectedService] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const { services, loading: servicesLoading } = useFetchServices(9);
  const [amount, setAmount] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('Disconnected');
  const [deviceName, setDeviceName] = useState('');
  const [deviceCheckError, setDeviceCheckError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]); // ✅ No dummy data
  const [receiptData, setReceiptData] = useState(null);
  const [lastCapture, setLastCapture] = useState(null);
  const [activeRdServiceUrl, setActiveRdServiceUrl] = useState(null);

  const flashIntervalRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startLightFlash = () => {
    if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    setIsLightOn(true);
    flashIntervalRef.current = setInterval(() => {
      setIsLightOn(prev => !prev);
    }, 150);
  };

  const stopLightFlash = () => {
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    setIsLightOn(false);
  };

  useEffect(() => {
    return () => {
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isScanning && deviceStatus !== 'Ready') {
        checkDevice(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [loading, isScanning, deviceStatus]);

  const handlePresetClick = (val) => {
    setAmount(val.toString());
  };

  const checkDevice = async (silent = false) => {
    setDeviceStatus('Connecting');
    setDeviceCheckError('');
    setDeviceName('');

    const { base, text, attempts } = await resolveRdServiceUrl();

    console.log('RD Service auto-detect attempts:', attempts);
    if (text) console.log('RD Service /rd/info RAW RESPONSE:', text);

    if (!base) {
      setDeviceStatus('Disconnected');
      setDeviceName('');
      const allCertOrNetwork = attempts.every(a => a.errorName === 'TypeError');
      const reason = allCertOrNetwork
        ? 'None of the RD Service ports responded. Either the RD Service app isn\'t running, or its self-signed certificate hasn\'t been trusted in this browser yet (open each URL below directly once and accept the warning).'
        : 'RD Service ports were unreachable — check the console for exact errors per port.';
      setDeviceCheckError(`${reason} Tried: ${RD_SERVICE_CANDIDATES.join(', ')}`);
      if (!silent) showToast('❌ Could not reach RD Service on any known port', 'error');
      return;
    }

    setActiveRdServiceUrl(base);

    const xml = parseXML(text);
    const rdServiceNode = xml.querySelector('RDService');
    const status = rdServiceNode?.getAttribute('status');
    const deviceInfo = xml.querySelector('DeviceInfo');
    const mi = (deviceInfo?.getAttribute('mi') || '').trim();
    const mc = (deviceInfo?.getAttribute('mc') || '').trim();
    const dpId = deviceInfo?.getAttribute('dpId') || '';

    const paramNodes = Array.from(xml.querySelectorAll('additional_info Param'));
    const certParam = paramNodes.find(p => {
      const name = (p.getAttribute('name') || '').toLowerCase();
      return name.includes('certif') || name.includes('level');
    });
    const certLevel = (certParam?.getAttribute('value') || '').toUpperCase();

    const isMantra = mi.toUpperCase().includes('MANTRA');
    const isMFS100 = mc.toUpperCase().includes('MFS100');
    const isL1 = certLevel.includes('L1');

    if (status === 'READY' && isMantra && isMFS100 && isL1) {
      setDeviceStatus('Ready');
      setDeviceName('Mantra MFS100 L1');
      if (!silent) showToast(`✅ Mantra MFS100 L1 connected (dpId: ${dpId}) via ${base}`, 'success');
    } else if (status === 'READY' && isMantra && isMFS100 && !certLevel) {
      setDeviceStatus('Ready');
      setDeviceName('Mantra MFS100 (level unknown)');
      setDeviceCheckError('Device connected, but RD Service didn\'t report a certification level — cannot confirm L1 from here. Check during capture instead.');
      if (!silent) showToast('⚠️ Mantra MFS100 connected, but L1 level unconfirmed', 'error');
    } else if (status === 'READY') {
      setDeviceStatus('Disconnected');
      setDeviceCheckError(`A device is connected via ${base}, but it's not Mantra MFS100 L1 (found: ${mi || 'unknown'} ${mc || ''} ${certLevel || ''}).`.trim());
      if (!silent) showToast('❌ Connected device is not Mantra MFS100 L1', 'error');
    } else {
      setDeviceStatus('Disconnected');
      setDeviceCheckError(`RD Service found at ${base}, but reported status: ${status || 'unknown'}. Is the Mantra L1 scanner plugged in?`);
      if (!silent) showToast('❌ RD Service found, but device not ready', 'error');
    }
  };

  const handleCheckDevice = () => {
    showToast('🔍 Checking biometric device...', 'info');
    checkDevice(false);
  };

  const captureFingerprint = async () => {
    if (deviceStatus !== 'Ready' || !activeRdServiceUrl) {
      showToast('⚠️ Please connect the biometric device first (use "Check Device")', 'error');
      return null;
    }

    setIsScanning(true);
    startLightFlash();
    showToast('🔴 Place finger on scanner now...', 'info');

    try {
      const response = await fetch(`${activeRdServiceUrl}/rd/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: PID_OPTIONS_XML,
        signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined,
      });

      const text = await response.text();
      const xml = parseXML(text);

      const resp = xml.querySelector('Resp');
      const errCode = resp?.getAttribute('errCode');
      const errInfo = resp?.getAttribute('errInfo');
      const qScore = resp?.getAttribute('qScore');

      stopLightFlash();
      setIsScanning(false);

      if (errCode === '0') {
        const dataNode = xml.querySelector('Data');
        const deviceInfo = xml.querySelector('DeviceInfo');

        const record = {
          id: `FP${Date.now()}`,
          capturedAt: new Date().toISOString(),
          qualityScore: qScore || null,
          dpId: deviceInfo?.getAttribute('dpId') || '',
          rdsId: deviceInfo?.getAttribute('rdsId') || '',
          deviceModel: `${deviceInfo?.getAttribute('mi') || ''} ${deviceInfo?.getAttribute('mc') || ''}`.trim(),
          pidDataBase64: dataNode?.textContent || '',
        };

        saveFingerprintCaptureLocally(record);
        setLastCapture(record);
        showToast(`✅ Fingerprint captured (quality score: ${qScore ?? 'n/a'})`, 'success');
        return record;
      } else {
        showToast(`❌ Capture failed: ${errInfo || 'Unknown error'} (code ${errCode})`, 'error');
        return null;
      }
    } catch (error) {
      stopLightFlash();
      setIsScanning(false);
      console.error(`Fingerprint capture error (via ${activeRdServiceUrl}):`, error);
      showToast(`❌ Could not reach RD Service at ${activeRdServiceUrl} for capture. Is it still running?`, 'error');
      return null;
    }
  };

  const handleScannerClick = () => {
    if (isScanning) {
      stopLightFlash();
      setIsScanning(false);
      showToast('⏹️ Scan stopped.', 'info');
      return;
    }
    captureFingerprint();
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    if (deviceStatus !== 'Ready') {
      showToast('⚠️ Please check and connect biometric device first!', 'error');
      return;
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if ((activeTab === 'CASH WITHDRAWAL') && (!amount || isNaN(amount) || parseFloat(amount) <= 0)) {
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

    const fpRecord = await captureFingerprint();
    if (!fpRecord) return;

    setLoading(true);

    // ⚠️ Replace this simulated backend call with your real AePS/aggregator API.
    setTimeout(() => {
      setLoading(false);
      const success = Math.random() > 0.15;

      const newTxn = {
        sNo: transactions.length + 1,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        orderId: `AE${Date.now().toString().slice(-8)}`,
        type: activeTab,
        amount: (activeTab === 'CASH WITHDRAWAL') ? parseFloat(amount) : 0,
        status: success ? 'success' : 'failed'
      };

      setTransactions([newTxn, ...transactions]);

      if (success) {
        const bData = POPULAR_BANKS.find(b => b.id === selectedBank);
        showToast('✅ Aadhaar transaction processed successfully!', 'success');
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
        setMobileNumber('');
        setAmount('');
        setAadharNumber('');
        setSelectedBank('');
      } else {
        showToast('❌ Transaction declined by issuer bank (AePS limit reached).', 'error');
      }
    }, 1500);
  };

  const handlePrintReceipt = (txn) => {
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

      <div className={styles.mainLayout}>
        {/* Left Column: Form */}
        <div className={styles.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <FaShieldAlt color="#1756AA" /> AePS Service Gateway
            </h2>
            <div className={styles.tabBar} style={{ padding: '4px', border: '1px solid #e2e8f0', boxShadow: 'none', background: '#f8fafc', borderRadius: '10px' }}>
              {['CASH WITHDRAWAL', 'BALANCE ENQUIRY', 'MINISTATEMENT', 'RD SERVICE'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
                  style={{ minWidth: 'auto', padding: '8px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                  onClick={() => {
                    setActiveTab(tab);
                    showToast(`Switched gateway tab to ${tab}`, 'info');
                  }}
                >
                  <FaFingerprint /> {tab}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleTransactionSubmit} className={styles.inputGrid}>
            {/* Service Provider */}
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Service Provider</label>
              <div className={styles.inputWrapper}>
                <FaShieldAlt className={styles.inputIcon} />
                <select
                  className={styles.inputField}
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  style={{ appearance: 'auto' }}
                  required
                >
                  <option value="">{servicesLoading ? 'Loading services...' : 'Select Service'}</option>
                  {services && services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

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

            {/* Aadhaar */}
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

            {/* Amount */}
            {(activeTab === 'CASH WITHDRAWAL') && (
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

            {/* Bank Selection */}
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

            {/* Presets */}
            {(activeTab === 'CASH WITHDRAWAL') && (
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

            {/* Quick Bank Logos */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginTop: '5px' }}>
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

        {/* Right Column: Biometric Scanner Widget */}
        <div className={styles.scannerCard}>
          <h3 className={styles.cardTitle}>
            <FaFingerprint /> BIOMETRIC SCANNER
          </h3>

          <div
            className={`${styles.scannerWidget} ${deviceStatus === 'Ready' ? styles.deviceActive : ''} ${isScanning ? styles.isScanning : ''}`}
            style={{
              boxShadow: isLightOn 
                ? '0 0 40px 20px rgba(255, 200, 0, 0.8), 0 0 80px 40px rgba(255, 100, 0, 0.4)'
                : (deviceStatus === 'Ready' ? '0 0 20px 10px rgba(23, 86, 170, 0.3)' : 'none'),
              borderColor: isLightOn ? '#ffcc00' : (deviceStatus === 'Ready' ? '#1756AA' : '#e2e8f0'),
              transition: 'box-shadow 0.05s, border-color 0.05s',
              cursor: 'pointer',
            }}
            onClick={handleScannerClick}
            title="Click to capture a real fingerprint (device must be ready)"
          >
            <FaFingerprint className={styles.scannerIcon} />
          </div>

          <div className={styles.scannerInstructions}>
            <span className={styles.instTextEn}>
              {isScanning ? 'Scanning fingerprint... keep thumb steady.' : 'Click the fingerprint icon to scan.'}
            </span>
            <span className={styles.instTextHi}>
              {isScanning ? 'फिंगरप्रिंट स्कैन हो रहा है... अंगूठा स्थिर रखें।' : 'स्कैन करने के लिए फिंगरप्रिंट आइकन पर क्लिक करें।'}
            </span>
            {lastCapture && (
              <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 'bold', marginTop: '4px' }}>
                ✔ Last capture quality: {lastCapture.qualityScore ?? 'n/a'} ({new Date(lastCapture.capturedAt).toLocaleTimeString()})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`${styles.statusBadge} ${deviceStatus === 'Ready' ? styles.statusReady : styles.statusNotReady}`}>
              ● Device: {deviceStatus}
            </span>
            {deviceName && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1756AA', background: '#e6f0ff', padding: '2px 10px', borderRadius: '12px' }}>
                {deviceName}
              </span>
            )}
            {deviceCheckError && (
              <span style={{ color: '#e74c3c', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {deviceCheckError}
              </span>
            )}
          </div>

          <div className={styles.actionButtonGroup}>
            <button
              type="button"
              className={styles.btnSec}
              onClick={handleCheckDevice}
              disabled={loading || isScanning}
            >
              {deviceStatus === 'Connecting' ? <FaSpinner className={styles.spinner} /> : '🔍 Check Device'}
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
                  <FaShieldAlt /> {activeTab === 'BALANCE ENQUIRY' ? 'Enquire Balance' : (activeTab === 'MINISTATEMENT' ? 'Get Statement' : 'Cash Withdraw')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.cardTitle}><FaHistory /> Today's AePS Log</h3>
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
                    No recent AePS transactions matching filters.
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

      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        data={receiptData} 
      />
    </div>
  );
};

export default Aeps;