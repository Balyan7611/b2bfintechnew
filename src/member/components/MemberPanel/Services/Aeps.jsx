import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaFingerprint, FaMobileAlt, FaRupeeSign, FaUniversity,
    FaSearch, FaPrint, FaShieldAlt, FaHistory, FaSpinner,
    FaMoneyBillWave, FaWallet, FaFileInvoice, FaInfoCircle, FaExclamationTriangle,
    FaChevronDown
} from 'react-icons/fa';
import styles from './Aeps.module.css';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import { useFetchServices } from '../../../../hooks/useFetchServices';
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';

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
  { id: '3', name: 'ICICI Bank', code: 'ICICI', imgSrc: getImagePath('/images/icic.png') },
  { id: '2', name: 'HDFC Bank', code: 'HDFC', imgSrc: getImagePath('/images/hdfc.png') },
  { id: '1', name: 'State Bank of India', code: 'SBI', imgSrc: getImagePath('/images/SBI.png') },
  { id: '6', name: 'Punjab National Bank', code: 'PNB', imgSrc: getImagePath('/images/pnb.jpg') },
  { id: '5', name: 'Axis Bank', code: 'AXIS', imgSrc: getImagePath('/images/Axix.png') },
  { id: '10', name: 'IDFC First Bank', code: 'IDFC', imgSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="15" fill="%23680A1A"/><path d="M30 35 h40 v8 H38 v10 h32 v8 H38 v14 H30 z" fill="%23FFFFFF"/><path d="M48 35 l12 20 l12 -20 z" fill="%23FFC72C"/><text x="50" y="88" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">IDFC FIRST</text></svg>` },
  { id: '11', name: 'Airtel Payments Bank', code: 'AIRTEL', imgSrc: getImagePath('/images/parterners/Airtel.png') },
  { id: '12', name: 'Indian Bank', code: 'INDIAN', imgSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="15" fill="%23094A81"/><circle cx="50" cy="40" r="18" fill="none" stroke="%23FFD700" stroke-width="6"/><circle cx="38" cy="55" r="18" fill="none" stroke="%23FFD700" stroke-width="6"/><circle cx="62" cy="55" r="18" fill="none" stroke="%23FFD700" stroke-width="6"/><text x="50" y="90" fill="%23FFFFFF" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">INDIAN BANK</text></svg>` }
];

const PRESETS = [500, 1000, 2000, 3000, 5000, 10000];

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

const useIsMobile = () => {
  // Force re-render on breakpoint change (no stale state — tick is just a trigger)
  const [, setTick] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const update = () => setTick(n => n + 1);
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => { mq.removeEventListener('change', update); window.removeEventListener('resize', update); };
  }, []);
  // Read live value every render — never stale, unaffected by Fast Refresh
  return window.matchMedia('(max-width: 600px)').matches || window.innerWidth <= 600;
};

const Aeps = () => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState('provider'); // 'provider' | 'onboarding' | 'portal'
  const [authScanning, setAuthScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('CASH WITHDRAWAL');
  const [rightTab, setRightTab] = useState('rules');
  const [consentChecked, setConsentChecked] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const { services, loading: servicesLoading } = useFetchServices(9);
  const [amount, setAmount] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const bankDropdownRef = useRef(null);
  const [deviceStatus, setDeviceStatus] = useState('Disconnected');
  const [deviceName, setDeviceName] = useState('');
  const [deviceCheckError, setDeviceCheckError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const [txnPageSize] = useState(10);
  const [txnTotal, setTxnTotal] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const [txnFromDate, setTxnFromDate] = useState(today);
  const [txnToDate, setTxnToDate] = useState(today);
  const [txnStatus, setTxnStatus] = useState('Success');
  const [lastCapture, setLastCapture] = useState(null);
  const [activeRdServiceUrl, setActiveRdServiceUrl] = useState(null);

  const flashIntervalRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (e) e.preventDefault();

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

    if (activeTab === 'CASH WITHDRAWAL' && parseFloat(amount) > 5000 && !otpVerified) {
      setShowOtpModal(true);
      showToast('🔑 OTP Sent to customer mobile number', 'success');
      return;
    }

    await executeBiometricTransaction();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      showToast('Please enter a 6-digit OTP', 'error');
      return;
    }
    setOtpVerifying(true);
    setTimeout(() => {
      setOtpVerifying(false);
      setOtpVerified(true);
      setShowOtpModal(false);
      showToast('OTP Verified Successfully! Starting biometric scan...', 'success');
      setTimeout(async () => {
        await executeBiometricTransaction();
        setOtpVerified(false);
      }, 500);
    }, 1500);
  };

  const executeBiometricTransaction = async () => {
    const fpRecord = await captureFingerprint();
    if (!fpRecord) return;

    setLoading(true);

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

  const startOnboardingAuth = () => {
    setAuthScanning(true);
    showToast('Biometric scanner activated. Place thumb for daily authentication...', 'info');
    setTimeout(() => {
      setAuthScanning(false);
      setAuthSuccess(true);
      showToast('Daily Authentication Successful! Redirecting to AePS Gateway...', 'success');
      setTimeout(() => {
        setStep('portal');
      }, 800);
    }, 2000);
  };

  const fetchAepsHistory = useCallback(async () => {
    setTxnLoading(true);
    try {
      const res = await API.transaction.getAll({
        pageNumber: txnPage,
        pageSize: txnPageSize,
        fromDate: txnFromDate,
        toDate: txnToDate,
        serviceId: 17,
        status: txnStatus || '',
      });
      const normalized = normalizeTxnResponse(res);
      const mapped = normalized.items.map((t, i) => ({
        sNo: (txnPage - 1) * txnPageSize + i + 1,
        orderId: t.orderId || t.OrderId || t.txnId || t.TxnId || '-',
        date: t.createdDate || t.CreatedDate || t.date || '-',
        type: t.serviceName || t.ServiceName || t.txnType || 'AePS',
        amount: parseFloat(t.amount || t.Amount || 0),
        status: t.status || t.Status || '-',
        bank: t.bankName || t.BankName || t.operator || '-',
        rrn: t.rrn || t.RRN || t.bankRrn || '-',
        remark: t.remark || t.Remark || '-',
        raw: t,
      }));
      setTransactions(mapped);
      setTxnTotal(normalized.totalItems);
    } catch (err) {
      console.error('AEPS history fetch error:', err);
    } finally {
      setTxnLoading(false);
    }
  }, [txnPage, txnPageSize, txnFromDate, txnToDate, txnStatus]);

  useEffect(() => {
    fetchAepsHistory();
  }, [fetchAepsHistory]);

  const filteredTxns = transactions.filter(t =>
    (t.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.rrn || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>

      <style>{`
        .aeps-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .aeps-capture-btn { width: 220px; align-self: flex-start; }
        .aeps-tab-short { display: none; }
        @media (max-width: 600px) {
          .aeps-2col { grid-template-columns: 1fr !important; }
          .aeps-portal-header { flex-direction: column !important; align-items: flex-start !important; }
          .aeps-capture-btn { width: 100% !important; align-self: stretch !important; box-sizing: border-box !important; }
          .aeps-guide-label { display: none !important; }
          .aeps-guide-tab { padding: 8px 2px !important; font-size: 0.7rem !important; }
          .aeps-provider-grid { grid-template-columns: 1fr !important; }
          .aeps-tab-label { display: none !important; }
          .aeps-tab-short { display: inline !important; }
        }
      `}</style>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.msg}
        </div>
      )}

      {/* 2-Column Main Layout wrapping all steps */}
      <div className={styles.mainLayout} style={{ alignItems: 'flex-start' }}>

        {/* LEFT COLUMN: Active Step Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* STEP 1: Select AEPS Provider */}
          {step === 'provider' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', width: '100%' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0D1B5E', margin: '0 0 8px 0' }}>Select AEPS Provider</h2>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 20px 0' }}>Please choose your preferred AEPS Banking Partner</p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Provider 1 */}
                <div
                  onClick={() => setStep('onboarding')}
                  style={{
                    border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '20px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s',
                    background: '#fff'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', fontSize: '1.4rem', fontWeight: 'bold' }}>
                      🏦
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0D1B5E' }}>bank8</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>AEPS Banking Partner</span>
                    </div>
                  </div>
                  <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Accepted
                  </span>
                </div>

                {/* Provider 2 */}
                <div
                  onClick={() => setStep('onboarding')}
                  style={{
                    border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '20px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s',
                    background: '#fff'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', fontSize: '1.4rem', fontWeight: 'bold' }}>
                      🏦
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0D1B5E' }}>bank9</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>AEPS Banking Partner</span>
                    </div>
                  </div>
                  <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Accepted
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Merchant Onboarding & Two-Way Authentication */}
          {step === 'onboarding' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0D1B5E', margin: '0 0 5px 0' }}>Merchant Onboarding</h2>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>Complete the pending steps to start AEPS</p>
                </div>
                <button
                  onClick={() => setStep('provider')}
                  style={{ background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}
                >
                  ← Back
                </button>
              </div>

              {/* Progress indicators */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A', padding: '8px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', background: '#16A34A', color: '#fff', borderRadius: '50%', fontSize: '0.65rem' }}>✓</span>
                  Two Way Registration
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A', padding: '8px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', background: '#16A34A', color: '#fff', borderRadius: '50%', fontSize: '0.65rem' }}>✓</span>
                  EKYC
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', padding: '8px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', background: '#DC2626', color: '#fff', borderRadius: '50%', fontSize: '0.7rem', fontWeight: 'bold' }}>!</span>
                  Daily Authentication
                </div>
              </div>

              {/* Main Interactive Onboarding Card Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'center' }}>

                {/* Left Side: Instructions and Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#F8FAFF', borderRadius: '12px', padding: '20px', border: '1px solid #E0E8F5' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#0D1B5E', fontSize: '1.05rem', fontWeight: '800' }}>Two-Way Authentication</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      As per compliance guidelines, merchants must verify their identity using biometric daily.
                      Please ensure your scanner (Mantra/Morpho) is connected and RD services are active.
                    </p>
                  </div>

                  <button
                    onClick={startOnboardingAuth}
                    disabled={authScanning || authSuccess}
                    style={{
                      background: authSuccess ? '#16A34A' : 'linear-gradient(135deg, #1756AA 0%, #0d1b3e 100%)',
                      color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '10px',
                      fontSize: '1rem', fontWeight: '800', cursor: authScanning ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 20px rgba(23,86,170,0.2)', transition: 'all 0.3s'
                    }}
                  >
                    {authScanning ? 'Scanning Fingerprint...' : authSuccess ? 'Authenticated ✓' : 'TWO Way Authentication'}
                  </button>
                </div>

                {/* Right Side: Visual Scanner Graphic */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#F8FAFF', borderRadius: '16px', border: '1.5px dashed #CBD5E1' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#0D1B5E', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFingerprint /> BIOMETRIC SCANNER
                  </h4>

                  <div style={{
                    width: '120px', height: '120px', borderRadius: '50%', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)', position: 'relative', marginBottom: '15px',
                    border: authScanning ? '3px solid #22C55E' : '3px solid #E2E8F0',
                    animation: authScanning ? 'pulse 1.5s infinite' : 'none'
                  }}>
                    <FaFingerprint style={{ fontSize: '3.5rem', color: authSuccess ? '#22C55E' : authScanning ? '#10B981' : '#64748B' }} />
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: authSuccess ? '#16A34A' : authScanning ? '#10B981' : '#E53E3E' }}>
                    Device: {authSuccess ? 'Ready' : authScanning ? 'Scanning...' : 'Disconnected'}
                  </span>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#94A3B8', textAlign: 'center' }}>
                    Please click Two-Way Authentication to simulate device scanner.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Actual AEPS Portal */}
          {step === 'portal' && (
            <div className={styles.formCard} style={{ width: '100%' }}>
              <div className={`${styles.portalHeader} aeps-portal-header`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setStep('onboarding')}
                    style={{ background: '#F1F5F9', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap' }}
                  >
                    ← Back to Steps
                  </button>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                    <FaShieldAlt color="#1756AA" /> AadharPay Gateway
                  </h2>
                </div>
              </div>
              <div className="aeps-portal-tabbar" style={{ display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '16px', gap: '6px', width: '100%', marginBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {[
                  { id: 'CASH WITHDRAWAL', label: 'Cash Withdrawal', short: 'Withdraw', icon: <FaMoneyBillWave /> },
                  { id: 'BALANCE ENQUIRY', label: 'Balance Enquiry', short: 'Balance', icon: <FaWallet /> },
                  { id: 'MINISTATEMENT', label: 'Mini Statement', short: 'Mini Stmt', icon: <FaFileInvoice /> }
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        showToast(`Switched to ${tab.label}`, 'info');
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: isMobile ? '4px' : '8px', padding: isMobile ? '9px 4px' : '11px 8px',
                        borderRadius: '12px', border: 'none', fontSize: isMobile ? '0.72rem' : '0.82rem',
                        fontWeight: isActive ? '800' : '600', cursor: 'pointer', transition: 'all 0.2s',
                        background: isActive ? '#ffffff' : 'transparent',
                        color: isActive ? '#1756AA' : '#64748B',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span className="aeps-tab-label">{tab.label}</span>
                      <span className="aeps-tab-short">{tab.short}</span>
                      {isActive && (
                        <div style={{
                          position: 'absolute', bottom: '2px', left: '50%',
                          transform: 'translateX(-50%)', width: '30px', height: '3px',
                          borderRadius: '2px', background: '#1756AA'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>

                {/* Row 1: Mobile & Aadhaar */}
                <div className={styles.portalFormRow}>
                  <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>
                      📱 Customer Mobile Number
                    </label>
                    <div className={styles.inputWrapper}>
                      <FaMobileAlt className={styles.inputIcon} />
                      <input
                        type="text"
                        maxLength={10}
                        className={styles.inputField}
                        placeholder="10 digit mobile number"
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>
                      🆔 Aadhaar Number
                    </label>
                    <div className={styles.inputWrapper}>
                      <FaFingerprint className={styles.inputIcon} />
                      <input
                        type="text"
                        maxLength={14}
                        className={styles.inputField}
                        placeholder="12 digit Aadhaar number"
                        value={aadharNumber}
                        onChange={handleAadharChange}
                        required
                      />
                    </div>
                    <span
                      onClick={() => setRightTab('seeding')}
                      style={{ fontSize: '0.75rem', color: '#1756AA', fontWeight: '600', cursor: 'pointer', marginTop: '6px', display: 'inline-block' }}
                    >
                      🔗 Aadhaar kis bank me link hai? — UIDAI par check kare
                    </span>
                  </div>
                </div>

                {/* Row 2: Presets & Amount Input (Only show for Cash Withdrawal) */}
                {activeTab === 'CASH WITHDRAWAL' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>
                      ₹ Transaction Amount
                    </label>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {PRESETS.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePresetClick(p)}
                          style={{
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1',
                            background: amount === p.toString() ? '#1756AA' : '#fff',
                            color: amount === p.toString() ? '#fff' : '#334155',
                            fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          ₹ {p.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>

                    <div className={styles.portalFormRow} style={{ alignItems: 'center', marginTop: '5px' }}>
                      <div className={styles.inputWrapper}>
                        <FaRupeeSign className={styles.inputIcon} />
                        <input
                          type="number"
                          className={styles.inputField}
                          placeholder="0"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          required={activeTab === 'CASH WITHDRAWAL'}
                        />
                      </div>

                      <div style={{ background: '#E6F4EA', border: '1px solid #34A853', borderRadius: '10px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#137333', fontWeight: '700' }}>Earning Commission</span>
                        <strong style={{ fontSize: '0.9rem', color: '#137333', fontWeight: '800' }}>₹ 0.00</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Row 3: Bank Quick Icons Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>
                    🏦 Select Bank
                  </label>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', justifyContent: 'space-between' }}>
                    {POPULAR_BANKS.map(b => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBank(b.id)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer',
                          flex: '0 0 56px', transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '12px', background: '#fff',
                          border: selectedBank === b.id ? '2.5px solid #1756AA' : '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px',
                          boxShadow: selectedBank === b.id ? '0 4px 10px rgba(23,86,170,0.15)' : 'none'
                        }}>
                          {!brokenImages[b.id] ? (
                            <img
                              src={b.imgSrc}
                              alt={b.name}
                              onError={() => setBrokenImages(prev => ({ ...prev, [b.id]: true }))}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1756AA' }}>
                              {b.code}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bank Select Dropdown Selector */}
                  <div style={{ position: 'relative', width: '100%' }} ref={bankDropdownRef}>
                    <div
                      onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      style={{
                        display: 'flex', gap: '10px', alignItems: 'center', background: '#ffffff',
                        padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
                        cursor: 'pointer', height: '46px', justifyContent: 'space-between',
                        boxSizing: 'border-box', transition: 'all 0.2s', userSelect: 'none'
                      }}
                      onMouseOver={(e) => { if (!isBankDropdownOpen) e.currentTarget.style.borderColor = '#1756AA' }}
                      onMouseOut={(e) => { if (!isBankDropdownOpen) e.currentTarget.style.borderColor = '#e2e8f0' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <FaUniversity style={{ color: '#94a3b8', flexShrink: 0, fontSize: '1rem' }} />
                        <span style={{ fontSize: '0.9rem', color: selectedBank ? '#1e293b' : '#64748b', fontWeight: selectedBank ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedBank ? `${POPULAR_BANKS.find(b => b.id === selectedBank)?.name} (${POPULAR_BANKS.find(b => b.id === selectedBank)?.code})` : '-- Choose Customer Bank --'}
                        </span>
                      </div>
                      <FaChevronDown style={{ fontSize: '0.75rem', color: '#64748B', transition: 'transform 0.2s', transform: isBankDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }} />
                    </div>

                    {isBankDropdownOpen && (
                      <div style={{
                        position: 'absolute', top: '52px', left: 0, background: '#ffffff',
                        border: '1px solid #e2e8f0', borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000, width: '100%', padding: '10px 0'
                      }}>
                        <div style={{ padding: '0 12px 10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaSearch style={{ color: '#94a3b8', fontSize: '0.875rem' }} />
                          <input
                            type="text"
                            placeholder="Search bank..."
                            value={bankSearchQuery}
                            onChange={(e) => setBankSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', padding: '6px 4px', color: '#0f172a' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '4px 0' }}>
                          <div
                            onClick={() => { setSelectedBank(''); setIsBankDropdownOpen(false); setBankSearchQuery(''); }}
                            style={{
                              padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', color: '#475569',
                              fontWeight: !selectedBank ? 600 : 500,
                              backgroundColor: !selectedBank ? '#f8fafc' : 'transparent'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = !selectedBank ? '#f8fafc' : 'transparent'}
                          >
                            -- Choose Customer Bank --
                          </div>
                          {POPULAR_BANKS.filter(b => b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) || b.code.toLowerCase().includes(bankSearchQuery.toLowerCase())).length > 0 ? (
                            POPULAR_BANKS.filter(b => b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) || b.code.toLowerCase().includes(bankSearchQuery.toLowerCase())).map(b => {
                              const isSel = selectedBank === b.id;
                              return (
                                <div
                                  key={b.id}
                                  onClick={() => { setSelectedBank(b.id); setIsBankDropdownOpen(false); setBankSearchQuery(''); }}
                                  style={{
                                    padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer',
                                    backgroundColor: isSel ? '#f8fafc' : 'transparent',
                                    borderBottom: '1px solid #f8fafc'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = isSel ? '#f8fafc' : 'transparent'}
                                >
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                    {b.code}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                              No banks found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <span
                    onClick={() => setRightTab('seeding')}
                    style={{ fontSize: '0.75rem', color: '#1756AA', fontWeight: '600', cursor: 'pointer' }}
                  >
                    🔗 Wahi bank chune jisme Aadhaar link hai — status check kare
                  </span>
                </div>

                {/* Instruction Banner Box */}
                <div style={{
                  background: '#F0F5FF', border: '1px dashed #1756AA', borderRadius: '12px',
                  padding: '16px', display: 'flex', gap: '15px', alignItems: 'center'
                }}>
                  <div style={{ background: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <FaFingerprint color="#1756AA" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: '700' }}>Please ask customer to place thumb on the biometric scanner.</span>
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>कृपया ग्राहक का अंगूठा बायोमेट्रिक स्कैनर पर रखें।</span>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={e => setConsentChecked(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px' }}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#475569', lineHeight: '1.4', fontWeight: '600' }}>
                    <strong>Customer consent liya gaya hai.</strong> Maine customer ko amount, bank aur charges bata diye hai. Biometric customer ne khud rakha hai — third party transaction nahi hai.
                  </span>
                </label>

                {/* Capture & Proceed Button */}
                <button
                  type="submit"
                  disabled={loading || isScanning}
                  className="aeps-capture-btn"
                  style={{
                    background: (loading || isScanning) ? '#94A3B8' : 'linear-gradient(135deg, #1756AA, #124080)',
                    cursor: (loading || isScanning) ? 'not-allowed' : 'pointer',
                    color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px',
                    fontSize: '1rem', fontWeight: '700', boxShadow: '0 8px 20px rgba(23,86,170,0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Processing...' : isScanning ? 'Scanning Fingerprint...' : 'Capture & Proceed'}
                </button>

              </form>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Premium Guidelines Tabs Card (Always rendered side-by-side) */}
        <div style={{ background: '#fff', borderRadius: isMobile ? '14px' : '20px', padding: isMobile ? '12px 10px' : '20px', boxShadow: '0 10px 30px rgba(13,27,62,0.05)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '18px', overflow: 'hidden' }}>
          {/* Tabs Header */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            {[
              { id: 'rules', label: 'Rules', icon: '🛡️' },
              { id: 'seeding', label: 'Seeding', icon: '🔗' },
              { id: 'device', label: 'Device', icon: '📱' },
              { id: 'help', label: 'Help', icon: '❓', badge: '7' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRightTab(t.id)}
                className="aeps-guide-tab"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '5px', padding: '8px 4px', borderRadius: '8px', border: 'none',
                  fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                  background: rightTab === t.id ? '#ffffff' : 'transparent',
                  color: rightTab === t.id ? '#1756AA' : '#64748B',
                  boxShadow: rightTab === t.id ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{t.icon}</span>
                <span className="aeps-guide-label">{t.label}</span>
                {t.badge && (
                  <span className="aeps-guide-label" style={{ background: '#1756AA', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px' }}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: Rules */}
          {rightTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <span style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', width: 'fit-content' }}>
                🛡️ RBI / NPCI Guidelines
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0D1B5E' }}>AEPS Transaction Rules</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Please follow these mandatory compliance rules</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {[
                  "Aadhaar & mobile number customer ke hone chahiye — third party transaction strictly prohibited.",
                  "Customer ki consent lena mandatory hai. Biometric zabardasti capture na kare.",
                  "Transaction se pehle Daily Two-Way Authentication complete karna zaroori hai.",
                  "₹5,000 se upar ke Cash Withdrawal par OTP verification mandatory hai.",
                  "Har transaction ki receipt customer ko dena obligatory hai.",
                  "Customer se AEPS ke liye extra charge lena allowed nahi hai.",
                  "Biometric device RD Service registered aur properly connected hona chahiye."
                ].map((rule, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span>
                    <span style={{ fontSize: '0.8rem', color: '#334155' }}>{rule}</span>
                  </div>
                ))}
              </div>

              {/* 4 Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '15px' }}>
                {[
                  { label: 'Min Amount', val: '₹ 100' },
                  { label: 'Max / Txn', val: '₹ 10,000' },
                  { label: 'OTP Above', val: '₹ 5,000' },
                  { label: 'Auth', val: 'Daily' }
                ].map((card, idx) => (
                  <div key={idx} style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>{card.label}</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1756AA', fontWeight: '800' }}>{card.val}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: Seeding */}
          {rightTab === 'seeding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0D1B5E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔗 Aadhaar – Bank Seeding
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                "Account not linked" jaisa error aaye to Aadhaar us bank me link (seed) nahi hai. Yahan se check karwaye.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {[
                  { title: 'UIDAI — Bank Seeding Status', desc: 'Aadhaar kis bank se link hai, online check kare', icon: '🏦' },
                  { title: '*99*99*1#', desc: 'Bina internet ke phone se seeding status', icon: '📞' },
                  { title: 'NPCI — APB FAQs', desc: 'Aadhaar mapper / seeding ki puri jaankari', icon: 'ℹ️' }
                ].map((item, idx) => (
                  <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#fff' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0D1B5E' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    </div>
                    <span style={{ color: '#94A3B8', fontSize: '1rem' }}>›</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: Device & Tester */}
          {rightTab === 'device' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0D1B5E', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaFingerprint /> Device & RD Service
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  Apna device chune — RD Service download / renew ka page khulega.
                </p>
              </div>

              <div style={{ background: '#F8FAFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', border: deviceStatus === 'Ready' ? '2.5px solid #22C55E' : '2.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaFingerprint style={{ fontSize: '1.8rem', color: deviceStatus === 'Ready' ? '#22C55E' : '#94A3B8' }} />
                </div>
                <button
                  type="button"
                  onClick={handleCheckDevice}
                  disabled={loading || isScanning}
                  style={{ background: '#1756AA', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                >
                  {deviceStatus === 'Connecting' ? 'Testing...' : 'Test / Capture Biometric Device'}
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: deviceStatus === 'Ready' ? '#22C55E' : '#EF4444' }}>
                  Status: {deviceStatus === 'Ready' ? `Ready (${deviceName || 'Mantra MFS100'})` : 'Disconnected'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '5px' }}>
                {[
                  { name: 'Mantra', desc: 'MFS100 / MFS110 L1 / MIS100', link: 'https://www.rdservice.in' },
                  { name: 'Morpho / IDEMIA', desc: 'MSO 1300 E2 / E3 L1', link: 'https://rdservicesonline.com' },
                  { name: 'Startek', desc: 'FM220U / FM220U-L1', link: 'https://www.startek.com' },
                  { name: 'SecuGen', desc: 'Hamster Pro 20 / HU20', link: 'https://secugenindia.com' },
                  { name: 'Precision', desc: 'PB510 / PB1000', link: 'https://www.precisionbiometric.co.in' },
                  { name: 'Evolute', desc: 'Fingerprint L1 RD', link: 'https://www.evolute.in' },
                  { name: 'Aratek', desc: 'A600 L1', link: 'https://www.aratek.co' },
                  { name: 'Next Biometrics', desc: 'NB-3023-U / L1', link: 'https://www.nextbiometrics.com' },
                  { name: 'Iris (Mantra MIS100V2)', desc: 'Iris scanner RD', link: 'https://www.rdservice.in' },
                  { name: 'UIDAI - certified device list', desc: 'Registered device ki official jaankari', link: 'https://uidai.gov.in' }
                ].map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(d.name + ' RD Service official download ' + d.desc)}`, '_blank')}
                    style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#fff', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F0F5FF', color: '#1756AA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <FaFingerprint />
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0D1B5E' }}>{d.name}</h5>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{d.desc}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: '#94A3B8' }}>📥</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#F0F5FF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaInfoCircle color="#475569" /> RD Service ke rules:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '15px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                  <li>RD Service sirf <strong>device banane wali company</strong> ki official site se hi le — third party / cracked RD se transaction fail aur account block ho sakta hai.</li>
                  <li>RD license aam taur par <strong>1 saal</strong> chalta hai, uske baad renew karna padta hai.</li>
                  <li>Windows par RD Service <strong>background me chalu</strong> rehna chahiye, warna "Device not found" aata hai.</li>
                  <li>Ek PC par <strong>ek hi company</strong> ka RD Service rakhe — do alag RD aapas me takrate hai.</li>
                </ol>
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px' }}>
                <FaExclamationTriangle color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400E', lineHeight: '1.5' }}>
                  Device kaam na kare to: RD Service app kholein → device USB nikaal kar dobara lagaye → browser refresh kare → phir bhi na ho to RD license expiry check kare.
                </p>
              </div>

            </div>
          )}

          {/* TAB CONTENT: Help (7 Q&As) */}
          {rightTab === 'help' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0D1B5E' }}>Common Problems</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Customer ko kya bataye — ready answers</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                {[
                  { q: "Account not linked / Aadhaar link nahi hai", a: "Customer ka Aadhaar us bank me seed nahi hai. UIDAI par seeding status check kare (Seeding tab). Aadhaar sirf ek hi bank me active rehta hai. Link karwana bank branch ka kaam hai.", icon: "🔗" },
                  { q: "Finger capture nahi ho raha / quality low", a: "Ungli saaf karke halka geela kare, thoda dabaye. Mehnat-kash customer ka anguthaa ghisa hota hai — doosri ungli try kare. Scanner ka glass saaf rakhe. RD Service chalu hona chahiye (Device tab).", icon: "👤" },
                  { q: "OTP nahi aa raha", a: "OTP Aadhaar se registered mobile par jata hai, customer ke current number par nahi. Number badla ho to Aadhaar kendra par update karwana padega. Resend OTP 1 baar try kare.", icon: "📱" },
                  { q: "Paisa kat gaya lekin cash nahi mila", a: "Bank ki taraf se aam taur par 24-72 ghante me auto-reverse ho jata hai. Customer ko receipt aur RRN number zaroor de — complaint me wahi kaam aata hai.", icon: "💸" },
                  { q: "Balance galat dikha raha hai", a: "Balance seedha bank se aata hai. Kabhi hold amount / pending clearing ki wajah se alag dikhta hai. Customer ko bank passbook ya bank app se confirm karne ko kahe.", icon: "🏦" },
                  { q: "Limit aur charges", a: "Per transaction limit bank ki hoti hai. ₹5,000 se upar par OTP mandatory hai. Customer se AEPS ka extra charge lena allowed nahi hai.", icon: "📊" },
                  { q: "Customer ko kya batana zaroori hai", a: "Amount, bank ka naam aur ki biometric uski marzi se liya ja raha hai. Transaction ke baad receipt dena obligatory hai. Kisi doosre ke Aadhaar/anguthe se transaction na kare.", icon: "🗣️" }
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', transition: 'all 0.2s' }}>
                      <div
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', background: isOpen ? '#F8FAFF' : '#ffffff', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA', fontSize: '1rem', fontWeight: 'bold' }}>
                            {faq.icon}
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0D1B5E' }}>{faq.q}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '14px 16px', background: '#F8FAFF', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
        {/* END RIGHT COLUMN */}

      </div>
      {/* END 2-Column Layout */}

      {/* Table Card - Below the 2-column layout, only for portal step */}
      {step === 'portal' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.cardTitle}><FaHistory /> AePS Transaction History</h3>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by Order ID, Status, RRN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className={styles.filterRow}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>From Date</label>
              <input type="date" value={txnFromDate} onChange={e => { setTxnFromDate(e.target.value); setTxnPage(1); }}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.82rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>To Date</label>
              <input type="date" value={txnToDate} onChange={e => { setTxnToDate(e.target.value); setTxnPage(1); }}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.82rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Status</label>
              <select value={txnStatus} onChange={e => { setTxnStatus(e.target.value); setTxnPage(1); }}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.82rem', outline: 'none', background: '#fff' }}>
                <option value="">All</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <button onClick={() => { setTxnPage(1); fetchAepsHistory(); }}
              style={{ padding: '8px 18px', background: '#1756AA', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end' }}>
              Search
            </button>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.premiumTable}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date / Time</th>
                  <th>Order ID</th>
                  <th>Bank RRN</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {txnLoading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No AePS transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((txn) => (
                    <tr key={txn.orderId + txn.sNo}>
                      <td>{txn.sNo}</td>
                      <td>{txn.date ? new Date(txn.date).toLocaleString('en-IN') : '-'}</td>
                      <td><code style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{txn.orderId}</code></td>
                      <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{txn.rrn}</td>
                      <td>{txn.type}</td>
                      <td>₹{Number(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span className={`${styles.statusPill} ${styles[txn.status]}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.printBtn}
                          onClick={() => handlePrintReceipt(txn.raw || txn)}
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

          {/* Pagination */}
          {txnTotal > txnPageSize && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Showing {(txnPage - 1) * txnPageSize + 1}–{Math.min(txnPage * txnPageSize, txnTotal)} of {txnTotal}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setTxnPage(p => Math.max(1, p - 1))} disabled={txnPage === 1}
                  style={{ padding: '6px 14px', borderRadius: '7px', border: '1.5px solid #E2E8F0', background: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', opacity: txnPage === 1 ? 0.4 : 1 }}>
                  ‹ Prev
                </button>
                <button onClick={() => setTxnPage(p => p + 1)} disabled={txnPage * txnPageSize >= txnTotal}
                  style={{ padding: '6px 14px', borderRadius: '7px', border: '1.5px solid #E2E8F0', background: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', opacity: txnPage * txnPageSize >= txnTotal ? 0.4 : 1 }}>
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'portal' && (
        <ReceiptModal
          isOpen={!!receiptData}
          onClose={() => setReceiptData(null)}
          data={receiptData}
        />
      )}

      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0D1B5E', fontWeight: '800' }}>Verification Required</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
              Transaction amount is greater than ₹5,000. Please enter the 6-digit OTP sent to customer's mobile number: <strong>{mobileNumber}</strong>. (Use <strong>123456</strong> for testing).
            </p>
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center', fontWeight: '700' }}
                required
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpVerifying}
                  style={{ flex: 2, padding: '12px', background: '#1756AA', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {otpVerifying ? 'Verifying...' : 'Verify & Proceed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aeps;
