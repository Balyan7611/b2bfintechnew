import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave, FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaIdCard, FaFingerprint, FaArrowLeft, FaDownload, FaSearch, FaUserPlus,
  FaHistory, FaPlusCircle, FaFileImport, FaShieldAlt, FaCheck, FaTrash, FaCloudUploadAlt
} from 'react-icons/fa';
import styles from './DMT.module.css';
import TransactionReceipt from './TransactionReceipt';
import { SITE_CONFIG } from '../../../../config/siteConfig';
import { useFetchServices } from '../../../../hooks/useFetchServices';

const DEFAULT_BENEFICIARIES = [
  { id: 1, name: 'Sachin Balyan', bank: 'Kotak Bank', accountNo: '9745556971', ifsc: 'KKBK0000962', verified: true },
  { id: 2, name: 'Dandugula Shadulla', bank: 'HDFC Bank', accountNo: '50100643538245', ifsc: 'HDFC0000001', verified: true },
  { id: 3, name: 'Mr Karanvir', bank: 'IDFC Bank', accountNo: '10012315254', ifsc: 'IDFB0020101', verified: true },
];

const CONTACTS = [
  { mobile: '9784905576', name: 'Vishnu Prajapati', rcode: 0 },
  { mobile: '6377749427', name: 'Rahul Sharma', rcode: 1 },
  { mobile: '9782921295', name: 'New Customer (Register)', rcode: 4 },
  { mobile: '6378840248', name: 'Blocked User', rcode: 3 },
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

const MOCK_TRANSACTIONS = [
  { id: 'TXN1001', amount: 5000, name: 'Sachin Balyan', mobile: '9745556971', bank: 'Kotak Bank', status: 'success', date: '2026-05-15 14:30' },
  { id: 'TXN1002', amount: 2500, name: 'Rahul Sharma', mobile: '9784905576', bank: 'SBI', status: 'pending', date: '2026-05-16 10:15' },
  { id: 'TXN1003', amount: 12000, name: 'Amit Verma', mobile: '8387001255', bank: 'HDFC', status: 'failed', date: '2026-05-16 11:45' },
  { id: 'TXN1004', amount: 1500, name: 'Karanvir', mobile: '10012315254', bank: 'IDFC', status: 'success', date: '2026-05-16 12:20' },
];

const numberToWords = (num) => {
  if (!num || isNaN(num) || num === 0) return '';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n) => {
    let str = '';
    if (n > 99) { str += a[Math.floor(n / 100)] + 'Hundred '; n %= 100; }
    if (n > 19) { str += b[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) { str += a[n]; }
    return str;
  };
  let res = '';
  if (num >= 10000000) { res += inWords(Math.floor(num / 10000000)) + 'Crore '; num %= 10000000; }
  if (num >= 100000) { res += inWords(Math.floor(num / 100000)) + 'Lakh '; num %= 100000; }
  if (num >= 1000) { res += inWords(Math.floor(num / 1000)) + 'Thousand '; num %= 1000; }
  if (num > 0) { res += inWords(num); }
  return res.trim() + ' Only';
};

const DMT = () => {
  const [view, setView] = useState('selection');
  const [selectedMobile, setSelectedMobile] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { services, loading: servicesLoading } = useFetchServices(7);
  const [showModal, setShowModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [pan, setPan] = useState('');
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newBen, setNewBen] = useState({ name: '', bank: '', accountNo: '', ifsc: '', mobile: '' });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [activeFlow, setActiveFlow] = useState(''); // 'otp' or 'biometric'
  const [transferData, setTransferData] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [otpVerified, setOtpVerified] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureDone, setCaptureDone] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txnResult, setTxnResult] = useState(null);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);

  // New states for transaction chunking
  const [transferChunks, setTransferChunks] = useState([]);
  const [activeChunkId, setActiveChunkId] = useState(null);
  const [chunkOtp, setChunkOtp] = useState('');
  const [chunkLoading, setChunkLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dmt_beneficiaries');
    setBeneficiaries(saved ? JSON.parse(saved) : DEFAULT_BENEFICIARIES);
  }, []);

  const saveBeneficiaries = (list) => {
    setBeneficiaries(list);
    localStorage.setItem('dmt_beneficiaries', JSON.stringify(list));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTransferInitiate = (ben, mode) => {
    const amount = amounts[ben.id];
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    const parsedAmt = parseFloat(amount);
    const CHUNK_LIMIT = 50000;
    const numChunks = Math.ceil(parsedAmt / CHUNK_LIMIT);
    const chunks = [];
    let remaining = parsedAmt;

    for (let i = 0; i < numChunks; i++) {
      const chunkAmt = Math.min(remaining, CHUNK_LIMIT);
      chunks.push({
        id: `chk_${Date.now()}_${i}`,
        index: i + 1,
        amount: chunkAmt,
        charge: 5, // Flat charge logic, adjust as needed
        status: 'pending',
        txnId: null
      });
      remaining -= chunkAmt;
    }

    setTransferChunks(chunks);
    setTransferData({ ...ben, amount: parsedAmt, mode });
    setView('transferConfirm');
  };

  const handleInitializeChunk = (chunkId) => {
    setActiveChunkId(chunkId);
    setChunkOtp('');
    setShowModal('chunkOtpVerify');
    showToast('OTP sent to your registered mobile', 'success');
  };

  const handleChunkOtpSubmit = (e) => {
    e.preventDefault();
    if (chunkOtp.length !== 6) {
      showToast('Enter a valid 6-digit OTP', 'error');
      return;
    }

    setChunkLoading(true);
    setTimeout(() => {
      setChunkLoading(false);
      const generatedId = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      const updatedChunks = transferChunks.map(chk =>
        chk.id === activeChunkId ? { ...chk, status: 'completed', txnId: generatedId } : chk
      );

      setTransferChunks(updatedChunks);
      showToast('Chunk processed successfully!', 'success');
      setShowModal(null);
      setActiveChunkId(null);

      // Check if all chunks are completed
      if (updatedChunks.every(c => c.status === 'completed')) {
        handleFinalSubmit(updatedChunks);
      }
    }, 1500);
  };

  const handleFetchCustomer = () => {
    if (!selectedMobile) return;
    setIsLoading(true);
    const customer = CONTACTS.find(c => c.mobile === selectedMobile);
    setTimeout(() => {
      setIsLoading(false);
      if (customer.rcode === 0) setView('beneficiary');
      else if (customer.rcode === 1 || customer.rcode === 2) {
        setView('verification');
      }
      else if (customer.rcode === 4) setView('registration');
      else {
        const modals = { 3: 'blocked' };
        setShowModal(modals[customer.rcode]);
      }
    }, 800);
  };



  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      showToast('Enter 6-digit OTP', 'error');
      return;
    }
    setOtpVerified(true);
    showToast('OTP Verified Successfully', 'success');
  };

  const handleCaptureStart = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      setCaptureDone(true);
      showToast('Fingerprint Captured ✓', 'success');
    }, 1500);
  };

  const handleVerificationSubmit = () => {
    if (!otpVerified || !captureDone) {
      showToast('Please complete OTP and Biometric first', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Aadhaar Verification Successful');
    setTimeout(() => {
      setView('selection');
      closeModal();
    }, 1500);
  };

  const closeModal = () => {
    setShowModal(null);
    setAadhaar('');
    setOtp('');
    setPan('');
    setValidated(false);
    setOtpVerified(false);
    setIsCapturing(false);
    setCaptureDone(false);
    setSubmitted(false);
    setIsVerified(false);
    setVerifyLoading(false);
    setDeleteTargetId(null);
    setChunkOtp('');
    setNewBen({ name: '', bank: '', accountNo: '', ifsc: '', mobile: '' });
  };

  const resetTransaction = () => {
    setIsCompleted(false);
    setTxnResult(null);
    setTransferChunks([]);
    closeModal();
  };

  const handleFinalSubmit = (completedChunks) => {
    // If it was triggered by click without args, just show the modal if txnResult exists
    if (!completedChunks && txnResult) {
      setShowModal('finalConfirm');
      return;
    }

    const chunks = completedChunks || transferChunks;
    const totalCharge = chunks.reduce((acc, c) => acc + c.charge, 0);
    const customer = CONTACTS.find(c => c.mobile === selectedMobile) || { name: 'sourabh', mobile: selectedMobile || '8750189025' };

    setTxnResult({
      chunks: chunks,
      amount: transferData.amount,
      charge: totalCharge,
      total: transferData.amount + totalCharge,
      beneficiary: transferData.name,
      accountNo: transferData.accountNo,
      bank: transferData.bank,
      ifsc: transferData.ifsc,
      mode: transferData.mode,
      customerName: customer.name || 'sourabh',
      customerMobile: selectedMobile || '8750189025',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'SUCCESS'
    });
    setIsCompleted(true);
    setShowModal('finalConfirm');
    showToast(`Transfer of ₹${transferData.amount} successful!`, 'success');
  };

  const handlePrintReceipt = (format = 'A4') => {
    if (!txnResult) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    // Set page rules based on format
    let pageCss = '';
    let containerCss = '';
    if (format === 'A4') {
      pageCss = '@page { size: A4 portrait; margin: 10mm; }';
      containerCss = 'max-width: 210mm; margin: 0 auto; box-shadow: none; border: none;';
    } else if (format === 'A5') {
      pageCss = '@page { size: A5 portrait; margin: 10mm; }';
      containerCss = 'max-width: 148mm; margin: 0 auto; box-shadow: none; border: none;';
    } else if (format === '80mm') {
      pageCss = '@page { size: 80mm auto; margin: 0; }';
      containerCss = 'width: 76mm; margin: 0 auto; padding: 10px; box-shadow: none; border: none; border-radius: 0;';
    } else if (format === '58mm') {
      pageCss = '@page { size: 58mm auto; margin: 0; }';
      containerCss = 'width: 54mm; margin: 0 auto; padding: 5px; box-shadow: none; border: none; border-radius: 0; font-size: 0.8em;';
    }

    const stylesHtml = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>Premium_Receipt_${format}</title>
          ${stylesHtml}
          <style>
            ${pageCss}
            body {
              background: #fff;
              display: flex;
              justify-content: center;
              padding: 0;
              margin: 0;
              font-family: 'Segoe UI', -apple-system, sans-serif;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            .printCard {
              background: white;
              border-radius: 12px;
              width: 100%;
              padding: 20px;
              display: flex;
              flex-direction: column;
              gap: 12px;
              border: 1px solid #cbd5e1;
              ${containerCss}
            }
            .printLogoRow {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 2px;
            }
            .printLogo {
              height: 40px;
              width: auto;
            }
            .printStatusBadge {
              font-size: 0.75rem;
              font-weight: 800;
              color: #15803d;
              background: #dcfce7;
              border: 1px solid #bbf7d0;
              padding: 6px 16px;
              border-radius: 50px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .printHeader {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 0;
              border-bottom: 1px solid #cbd5e1;
              border-top: 1px solid #cbd5e1;
            }
            .printAmountDisplay {
              font-size: 2rem;
              font-weight: 900;
              color: #0f172a;
              margin: 4px 0 0;
              text-align: center;
            }
            .printDetailGrid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .printDetailItem {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .printLabel {
              font-size: 0.65rem;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
            }
            .printValue {
              font-size: 0.85rem;
              font-weight: 800;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="printCard">
            <div class="printLogoRow">
              <img src="${SITE_CONFIG.logo}" alt="Logo" class="printLogo" />
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 4px; margin-bottom: 4px;">
              <span class="printStatusBadge">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#15803d" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                TRANSACTION COMPLETED
              </span>
            </div>
            
            <div class="printHeader">
              <span style="font-size: 0.9rem; font-weight: 800; color: #1e293b; flex: 1;">${txnResult.bank}</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">A/C: ${txnResult.accountNo}</span>
            </div>
            
            <div style="text-align: center; margin: 10px 0;">
              <span class="printLabel" style="font-size: 0.7rem;">TOTAL TRANSFER AMOUNT</span>
              <h2 class="printAmountDisplay">₹${txnResult.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
              <div style="display: flex; justify-content: center; margin-top: 4px;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 50px;">Total Surcharge: ₹${txnResult.charge.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="printDetailGrid">
              <div class="printDetailItem">
                <span class="printLabel">Beneficiary</span>
                <strong class="printValue">${txnResult.beneficiary}</strong>
              </div>
              <div class="printDetailItem">
                <span class="printLabel">Mode</span>
                <strong class="printValue" style="color: #1756aa; background: rgba(23, 86, 170, 0.08); padding: 2px 8px; border-radius: 4px; width: fit-content; font-size: 0.75rem;">${txnResult.mode}</strong>
              </div>
              <div class="printDetailItem" style="grid-column: span 2;">
                <span class="printLabel">TRANSACTION IDS (CHUNKS)</span>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                  ${txnResult.chunks.map(c => `
                    <div style="display: flex; justify-content: space-between; background: #F8FAFC; padding: 6px 10px; border-radius: 6px;">
                      <strong style="font-size: 0.8rem; font-family: monospace; color: #0F172A">${c.txnId}</strong>
                      <strong style="font-size: 0.8rem; color: #1756AA">₹${c.amount.toLocaleString('en-IN')}</strong>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="printDetailItem" style="grid-column: span 2;">
                <span class="printLabel">Date & Time</span>
                <strong class="printValue" style="font-size: 0.8rem;">${txnResult.date}</strong>
              </div>
              <div class="printDetailItem" style="grid-column: span 2; border-top: 1px solid #cbd5e1; paddingTop: 12px; marginTop: 6px; display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                <span class="printLabel" style="font-size: 0.8rem;">TOTAL WALLET DEBIT</span>
                <strong style="font-size: 1.1rem; color: #1756aa; font-weight: 900;">₹${txnResult.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; font-size: 0.7rem; color: #94a3b8; font-weight: bold; text-transform: uppercase;">
              🛡️ Secured by ${SITE_CONFIG.shortName}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      showToast('Printing initialized!');
    }, 500);
  };

  const handleVerifyAccount = () => {
    if (!newBen.accountNo || !newBen.ifsc) {
      showToast('Enter Account & IFSC first', 'error');
      return;
    }
    setVerifyLoading(true);
    setTimeout(() => {
      setVerifyLoading(false);
      setIsVerified(true);
      setNewBen(prev => ({ ...prev, name: 'SURESH KUMAR' }));
      showToast('Account Verified: SURESH KUMAR');
    }, 1500);
  };

  const formatAadhaar = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(' ') : raw;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!validated) { showToast('Please validate Aadhaar first', 'error'); return; }
    setSubmitted(true);
    setTimeout(() => {
      showToast('Customer Registered Successfully');
      setView('selection');
      closeModal();
    }, 1500);
  };

  const handleAddBeneficiary = (e) => {
    e.preventDefault();
    if (!newBen.name || !newBen.bank || !newBen.accountNo || !newBen.ifsc) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setAddLoading(true);
    setTimeout(() => {
      const newList = [...beneficiaries, { ...newBen, id: Date.now(), verified: true }];
      saveBeneficiaries(newList);
      setAddLoading(false);
      showToast('Beneficiary added successfully');
      setTimeout(() => {
        setView('beneficiary');
        setIsVerified(false);
        setNewBen({ bank: '', accountNo: '', ifsc: '', mobile: '', name: '' });
      }, 1000);
    }, 1200);
  };

  const handleDeleteBen = (id) => {
    setDeleteTargetId(id);
    setShowModal('confirmDelete');
  };

  const confirmDeletion = () => {
    const newList = beneficiaries.filter(b => b.id !== deleteTargetId);
    saveBeneficiaries(newList);
    showToast('Beneficiary deleted successfully');
    closeModal();
  };

  const renderModal = () => {
    if (!showModal) return null;

    // Always show receipt modal if finalConfirm is triggered — regardless of isCompleted flag
    if (showModal === 'finalConfirm') {
      if (txnResult) {
        return (
          <TransactionReceipt
            data={txnResult}
            onClose={() => { closeModal(); }}
          />
        );
      }
      // txnResult not ready yet — don't show blank modal
      return null;
    }

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
          {showModal === 'chunkOtpVerify' && (
            <div className={styles.confirmDeleteWrap} style={{ padding: '24px 20px', maxWidth: '380px', margin: '0 auto' }}>
              <div className={styles.deleteIconCircle} style={{ background: '#EFF6FF', color: '#1756AA', width: '50px', height: '50px', fontSize: '1.2rem', margin: '0 auto 15px auto' }}>
                <FaShieldAlt />
              </div>
              <h3 className={styles.modalTitle} style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Verify Transaction</h3>
              <p className={styles.confirmDeleteText} style={{ marginBottom: '24px', fontSize: '0.85rem' }}>
                Enter the 6-digit OTP sent to your registered mobile number.
              </p>
              <form onSubmit={handleChunkOtpSubmit}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={chunkOtp[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        let newOtp = chunkOtp.split('');
                        newOtp[index] = val;
                        const joinedOtp = newOtp.join('');
                        setChunkOtp(joinedOtp);
                        if (val && index < 5) {
                          const next = document.getElementById(`otp-input-${index + 1}`);
                          if (next) next.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          e.preventDefault();
                          let newOtp = chunkOtp.split('');
                          newOtp[index] = '';
                          setChunkOtp(newOtp.join(''));
                          if (index > 0) {
                            const prev = document.getElementById(`otp-input-${index - 1}`);
                            if (prev) prev.focus();
                          }
                        }
                      }}
                      style={{
                        width: '42px', height: '48px', fontSize: '1.2rem', textAlign: 'center',
                        border: '1.5px solid #CBD5E1', borderRadius: '8px', background: '#F8FAFC',
                        color: '#0F172A', fontWeight: 'bold', outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1756AA'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <div className={styles.confirmDeleteActions} style={{ marginTop: '0' }}>
                  <button type="button" className={styles.cancelBtn} onClick={() => { setShowModal(null); setActiveChunkId(null); setChunkOtp(''); }} style={{ padding: '10px 16px', fontSize: '0.9rem' }}>Cancel</button>
                  <button type="submit" className={styles.confirmBtn} style={{ background: '#1756AA', padding: '10px 16px', fontSize: '0.9rem' }} disabled={chunkLoading || chunkOtp.length !== 6}>
                    {chunkLoading ? <FaSpinner className={styles.spinner} /> : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          )}



          {showModal === 'blocked' && (
            <div className={styles.confirmDeleteWrap}>
              <div className={styles.deleteIconCircle} style={{ background: '#FEF2F2', color: '#EF4444' }}>
                <FaShieldAlt />
              </div>
              <h3 className={styles.modalTitle} style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Service Restricted</h3>
              <p className={styles.confirmDeleteText}>
                Your account access is currently blocked for this service. Please reach out to our support team for resolution.
              </p>
              <button
                className={styles.primaryBtn}
                style={{ background: '#EF4444' }}
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          )}

          {showModal === 'confirmDelete' && (
            <div className={styles.confirmDeleteWrap}>
              <div className={styles.deleteIconCircle}>
                <FaTrash />
              </div>
              <h3 className={styles.modalTitle} style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Are you sure?</h3>
              <p className={styles.confirmDeleteText}>
                You are about to remove this beneficiary. This action cannot be undone.
              </p>
              <div className={styles.confirmDeleteActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={confirmDeletion}
                >
                  Delete Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.accountNo.includes(searchTerm) || b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {toast && (
        <div className="global-toast" style={{
          background: toast.type === 'success' ? '#10B981' : '#EF4444'
        }}>
          <FaCheckCircle /> {toast.msg}
        </div>
      )}

      {view === 'beneficiary' ? (
        <div className={styles.unifiedCard}>
          <div className={styles.customerInfoSection}>
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrap} style={{ background: '#EEF2FF', color: '#6366F1' }}><FaUserPlus /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Customer Name</span>
                <span className={styles.infoValue}>Vishnu Prajapati</span>
              </div>
            </div>
            <div className={styles.infoDivider}></div>
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrap} style={{ background: '#E0F2FE', color: '#0EA5E9' }}><FaMoneyBillWave /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Total Limit</span>
                <span className={styles.infoValue} style={{ color: '#1756AA' }}>₹50,000</span>
              </div>
            </div>
            <div className={styles.infoDivider}></div>
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrap} style={{ background: '#FFF7ED', color: '#F97316' }}><FaHistory /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Used Limit</span>
                <span className={styles.infoValue} style={{ color: '#E05C2A' }}>₹12,000</span>
              </div>
            </div>
            <div className={styles.infoDivider}></div>
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrap} style={{ background: '#F0FDF4', color: '#22C55E' }}><FaShieldAlt /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Available Limit</span>
                <span className={styles.infoValue} style={{ color: '#16A34A' }}>₹38,000</span>
              </div>
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.actionBar}>
              <div className={styles.topActionsRow}>
                <div className={styles.leftActionsGroup}>
                  <button className={styles.actionBtnCompact} onClick={() => setView('selection')}><FaArrowLeft /> <span>Back</span></button>
                  <button className={styles.actionBtnCompact} onClick={() => setView('history')} title="History"><FaHistory /> <span>History</span></button>
                  <button className={styles.actionBtnCompact}><FaDownload /></button>
                </div>
              </div>
              <div className={styles.bottomActionsRow}>
                <div className={styles.searchAddGroup}>
                  <div className={styles.searchBox}><FaSearch className={styles.searchIcon} /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                  <button className={`${styles.actionBtnCompact} ${styles.addBtn}`} onClick={() => setView('addBeneficiary')}><FaPlusCircle /> Add New</button>
                </div>
                <div className={styles.secondaryActionsGroup}>
                  <button className={styles.actionBtnCompact}><FaFileImport /> Import</button>
                  <button className={styles.actionBtnCompact}><FaShieldAlt /> Check IFSC</button>
                </div>
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.benTable}>
                <thead>
                  <tr><th>S#</th><th>Beneficiary Name</th><th>Bank</th><th>Account No.</th><th>IFSC</th><th>Amount</th><th>Mode</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredBeneficiaries.map((ben, idx) => (
                    <tr key={ben.id}>
                      <td>{idx + 1}</td>
                      <td><div className={styles.verifiedName}>{ben.name} {ben.verified && <FaCheck className={styles.verifyTick} />}</div></td>
                      <td>{ben.bank}</td><td>{ben.accountNo}</td><td>{ben.ifsc}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <input
                            type="text"
                            className={styles.amountInput}
                            placeholder="0.00"
                            value={amounts[ben.id] || ''}
                            onChange={e => setAmounts({ ...amounts, [ben.id]: e.target.value.replace(/\D/g, '') })}
                          />
                          {amounts[ben.id] && parseInt(amounts[ben.id]) > 0 && (
                            <span style={{ fontSize: '0.65rem', color: '#16A34A', fontWeight: 'bold', marginTop: '4px', maxWidth: '120px', lineHeight: '1.1' }}>
                              {numberToWords(parseInt(amounts[ben.id]))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.modeGroup}>
                          <button className={`${styles.modeBtn} ${styles.impsBtn}`} onClick={() => handleTransferInitiate(ben, 'IMPS')}>IMPS</button>
                          <button className={`${styles.modeBtn} ${styles.neftBtn}`} onClick={() => handleTransferInitiate(ben, 'NEFT')}>NEFT</button>
                        </div>
                      </td>
                      <td><div className={styles.actionIcons}><button className={`${styles.iconBtn} ${styles.verifyIcon}`}><FaShieldAlt /></button><button className={`${styles.iconBtn} ${styles.deleteIcon}`} style={{ color: '#EF4444' }} onClick={() => handleDeleteBen(ben.id)}><FaTrash /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : view === 'addBeneficiary' ? (
        <div className={styles.unifiedCard} style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <button className={styles.actionBtnCompact} onClick={() => setView('beneficiary')} style={{ marginRight: '24px' }}>
              <FaArrowLeft /> <span>Back</span>
            </button>
            <h2 className={styles.title} style={{ margin: 0, fontSize: '1.6rem' }}>Add New Beneficiary</h2>
          </div>
          <form onSubmit={handleAddBeneficiary} style={{ maxWidth: '850px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className={styles.inputWrap} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.inputLabel}>Select Bank</label>
                <input 
                  list="bank-list" 
                  className={styles.inputField} 
                  placeholder="Type to search bank..." 
                  value={newBen.bank} 
                  onChange={e => setNewBen({ ...newBen, bank: e.target.value })} 
                />
                <datalist id="bank-list">
                  {POPULAR_BANKS.map(b => <option key={b.id} value={b.name} />)}
                </datalist>
                
                <div style={{ marginTop: '15px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Quick Bank Selection</span>
                  <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingTop: '5px' }}>
                    {POPULAR_BANKS.map(b => (
                      <div
                        key={b.id}
                        onClick={() => setNewBen({ ...newBen, bank: b.name })}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer',
                          minWidth: '70px',
                          transform: newBen.bank === b.name ? 'scale(1.05)' : 'scale(1)', 
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <div style={{ 
                          width: '54px', height: '54px', borderRadius: '50%', background: '#fff', 
                          border: newBen.bank === b.name ? '2px solid #1756AA' : '1px solid #e2e8f0', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', 
                          padding: '6px', 
                          boxShadow: newBen.bank === b.name ? '0 4px 10px rgba(23,86,170,0.2)' : 'none' 
                        }}>
                          <img
                            src={b.imgSrc}
                            alt={b.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: newBen.bank === b.name ? '#1756AA' : '#64748b', textAlign: 'center' }}>
                          {b.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.inputWrap}>
                <label className={styles.inputLabel}>Account Number</label>
                <div className={styles.adharRow}>
                  <input className={styles.inputField} style={{ flex: 1 }} type="text" placeholder="Enter 9-18 digit Account No" value={newBen.accountNo} onChange={e => setNewBen({ ...newBen, accountNo: e.target.value.replace(/\D/g, '').slice(0, 18) })} />
                  <button
                    type="button"
                    className={`${styles.validateBtn} ${isVerified ? styles.success : ''}`}
                    onClick={handleVerifyAccount}
                    disabled={verifyLoading || isVerified}
                    style={{
                      background: isVerified ? '#16A34A' : 'linear-gradient(135deg, #1756AA 0%, #0D1B3E 100%)',
                      minWidth: '110px',
                      padding: '11px'
                    }}
                  >
                    {verifyLoading ? <FaSpinner className={styles.spinner} /> : (isVerified ? '✓ Verified' : 'Verify')}
                  </button>
                </div>
              </div>
              <div className={styles.inputWrap}>
                <label className={styles.inputLabel}>IFSC Code</label>
                <input className={styles.inputField} type="text" placeholder="e.g. KKBK0000962" value={newBen.ifsc} onChange={e => setNewBen({ ...newBen, ifsc: e.target.value.toUpperCase().slice(0, 11) })} />
              </div>
              <div className={styles.inputWrap}>
                <label className={styles.inputLabel}>Mobile Number</label>
                <input className={styles.inputField} type="text" placeholder="Sender Mobile" value={newBen.mobile} onChange={e => setNewBen({ ...newBen, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
              </div>
              <div className={styles.inputWrap} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.inputLabel}>Beneficiary Name</label>
                <input className={styles.inputField} type="text" placeholder="Full Name" value={newBen.name} onChange={e => setNewBen({ ...newBen, name: e.target.value })} />
              </div>
            </div>
            
            <button type="submit" className={`${styles.primaryBtn} ${isVerified ? styles.successBtn : ''}`} disabled={addLoading} style={{ marginTop: '24px', maxWidth: '250px' }}>
              {addLoading ? <FaSpinner className={styles.spinner} /> : 'Add Beneficiary'}
            </button>
          </form>
        </div>
      ) : view === 'verification' ? (
        <div className={styles.verificationContainer}>
          <div className={styles.verificationCardHorizontal}>
            <div className={styles.verificationLeft}>
              <button className={styles.backBtnVerification} onClick={() => setView('selection')}><FaArrowLeft /> Back</button>
              <div className={styles.verificationHeader}>
                <div className={styles.iconCircleLarge}><FaShieldAlt /></div>
                <h2 className={styles.verificationTitle}>Quick Verification</h2>
                <p className={styles.verificationSub}>Validate your Aadhaar to instantly unlock all money transfer features.</p>
              </div>
              <div className={styles.verificationFooter}>
                <FaCheckCircle style={{ color: '#16A34A' }} /> <span>Instant KYC Verification</span>
              </div>
            </div>

            <div className={styles.verificationRight}>
              <div className={styles.mobileBackRow}><button className={styles.backBtnVerificationMobile} onClick={() => setView('selection')}><FaArrowLeft /> Back</button></div>
              <div className={styles.verificationForm}>
                <div className={styles.inputWrap}>
                  <label className={styles.inputLabel}>Registered Mobile</label>
                  <input className={styles.inputField} style={{ background: '#F8FAFC', color: '#64748B' }} value={selectedMobile} readOnly />
                </div>

                <div className={styles.inputWrap}>
                  <label className={styles.inputLabel}>Aadhaar Number</label>
                  <div className={styles.adharRow}>
                    <input
                      className={styles.inputField}
                      style={{ flex: 1, fontSize: '1.1rem', letterSpacing: '1px' }}
                      placeholder="0000 0000 0000"
                      value={aadhaar}
                      onChange={e => { setAadhaar(formatAadhaar(e.target.value)); setValidated(false); }}
                    />
                    <button
                      className={`${styles.validateBtn} ${validated ? styles.success : ''}`}
                      onClick={() => { setValidated(true); showToast('OTP Sent to Linked Mobile'); }}
                      disabled={aadhaar.replace(/\s/g, '').length < 12 || validated}
                    >
                      {validated ? '✓ Sent' : 'Validate'}
                    </button>
                  </div>
                </div>

                {validated && (
                  <>
                    <div className={styles.inputWrap} style={{ animation: 'fadeIn 0.3s' }}>
                      <label className={styles.inputLabel}>Enter OTP</label>
                      <div className={styles.adharRow}>
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="0 0 0 0 0 0"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', maxWidth: '180px' }}
                          disabled={otpVerified}
                        />
                        <button
                          className={`${styles.validateBtn} ${otpVerified ? styles.success : ''}`}
                          onClick={handleVerifyOTP}
                          disabled={otp.length < 6 || otpVerified}
                        >
                          {otpVerified ? '✓ Verified' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>

                    {otpVerified && (
                      <div className={styles.inputWrap} style={{ animation: 'fadeIn 0.4s' }}>
                        <label className={styles.inputLabel}>Biometric Capture</label>
                        <button
                          className={`${styles.captureBtnCompact} ${captureDone ? styles.captureSuccess : ''}`}
                          onClick={handleCaptureStart}
                          disabled={isCapturing || captureDone}
                        >
                          {isCapturing ? <FaSpinner className={styles.spinner} /> : captureDone ? <FaCheckCircle /> : <FaFingerprint />}
                          <span>{isCapturing ? 'Scanning...' : captureDone ? 'Fingerprint Captured ✓' : 'Scan Fingerprint'}</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className={styles.infoBox}>
                  <FaCheckCircle style={{ color: '#16A34A' }} />
                  <span>{captureDone ? 'All steps completed. You can now submit.' : otpVerified ? 'Now scan fingerprint to complete.' : validated ? 'Verify OTP to proceed.' : 'OTP will be sent to your Aadhaar linked mobile number.'}</span>
                </div>

                <button
                  className={`${styles.primaryBtn} ${(otpVerified && captureDone) ? styles.successBtn : ''}`}
                  disabled={!otpVerified || !captureDone || submitted}
                  onClick={handleVerificationSubmit}
                  style={{ marginTop: 'auto' }}
                >
                  {submitted ? <FaSpinner className={styles.spinner} /> : 'Complete Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>

      ) : view === 'registration' ? (
        <div className={styles.verificationContainer}>
          <div className={styles.verificationCardHorizontal} style={{ maxWidth: '1000px', minHeight: '450px' }}>
            <div className={styles.verificationLeft}>
              <button className={styles.backBtnVerification} onClick={() => setView('selection')}><FaArrowLeft /> Back</button>
              <div className={styles.verificationHeader}>
                <div className={styles.iconCircleLarge}><FaUserPlus /></div>
                <h2 className={styles.verificationTitle}>New User</h2>
                <p className={styles.verificationSub}>Join our secure banking network to start sending money instantly to anyone, anywhere.</p>
              </div>
              <div className={styles.verificationFooter}>
                <FaShieldAlt style={{ color: '#fff' }} /> <span>Safe & Secure Onboarding</span>
              </div>
            </div>

            <div className={styles.verificationRight} style={{ padding: '30px 50px' }}>
              <div className={styles.mobileBackRow}><button className={styles.backBtnVerificationMobile} onClick={() => setView('selection')}><FaArrowLeft /> Back</button></div>
              <form onSubmit={handleRegister} className={styles.verificationForm} style={{ background: 'none', padding: 0, border: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className={styles.inputWrap}>
                    <label className={styles.inputLabel}>Mobile Number</label>
                    <input className={styles.inputField} style={{ background: '#F8FAFC' }} value={selectedMobile} readOnly />
                  </div>
                  <div className={styles.inputWrap}>
                    <label className={styles.inputLabel}>OTP</label>
                    <div className={styles.adharRow}>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="OTP"
                        style={{ flex: 1 }}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                      <button 
                        type="button" 
                        className={`${styles.validateBtn} ${regOtpVerified || (regOtpSent && otp.length === 0) ? styles.success : ''}`} 
                        onClick={() => {
                          if (regOtpVerified) return;
                          if (otp.length === 6) {
                            setRegOtpVerified(true);
                            showToast('OTP Verified Successfully!');
                          } else {
                            setRegOtpSent(true);
                            showToast('OTP Sent');
                          }
                        }}
                      >
                        {regOtpVerified ? '✓ Verified' : (otp.length > 0 && regOtpSent ? 'Verify' : (regOtpSent ? 'Sent' : 'Get'))}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.inputWrap}>
                  <label className={styles.inputLabel}>PAN Card Number</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. ABCDE1234F"
                    value={pan}
                    onChange={e => setPan(e.target.value.toUpperCase().slice(0, 10))}
                  />
                </div>

                <div className={styles.inputWrap} style={{ marginBottom: '20px' }}>
                  <label className={styles.inputLabel}>Aadhaar Number</label>
                  <div className={styles.adharRow}>
                    <input className={styles.inputField} style={{ flex: 1 }} placeholder="0000 0000 0000" value={aadhaar} onChange={e => setAadhaar(formatAadhaar(e.target.value))} />
                    <button type="button" className={`${styles.validateBtn} ${validated ? styles.success : ''}`} onClick={() => { setValidated(true); showToast('Aadhaar Validated'); }}>
                      {validated ? '✓' : 'Verify'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`${styles.primaryBtn} ${validated ? styles.successBtn : ''}`}
                  disabled={!validated || submitted}
                  style={{ marginTop: '10px' }}
                >
                  {submitted ? <FaSpinner className={styles.spinner} /> : 'Complete Registration'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : view === 'history' ? (
        <div className={styles.unifiedCard} style={{ marginTop: '20px', padding: '0' }}>
          <div style={{ padding: '0' }}>
            <div className={styles.tableWrapper} style={{ border: 'none', borderRadius: '0' }}>
              <table className={styles.benTable}>
                <thead>
                  <tr>
                    <th>S#</th>
                    <th>ACCOUNT NO.</th>
                    <th>IFSC</th>
                    <th>AMOUNT</th>
                    <th>ORDER ID</th>
                    <th>STATUS</th>
                    <th>ADD DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.map((txn, idx) => (
                    <tr key={txn.id}>
                      <td>{idx + 1}</td>
                      <td>{txn.mobile}</td>
                      <td>{txn.bank}</td>
                      <td>₹{txn.amount.toLocaleString()}</td>
                      <td>{txn.id}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status_${txn.status}`]}`}>
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{txn.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <button className={styles.primaryBtn} style={{ width: 'auto', padding: '10px 40px' }} onClick={() => setView('beneficiary')}>Close History</button>
            </div>
          </div>
        </div>
      ) : view === 'transferConfirm' ? (
        <div className={styles.verificationContainer} style={{ padding: '0px 2px' }}>

          <div className={styles.confirmFullCard}>

            {/* ── Header ── */}
            <div className={styles.confirmHeader}>
              <div className={styles.headerTopLeft}>
                <button
                  onClick={() => setView('beneficiary')}
                  className={styles.confirmBackBtn}
                  title="Back"
                >
                  <FaArrowLeft style={{ fontSize: '0.85rem' }} />
                </button>
                <div className={styles.titleWrap}>
                  <h2 className={styles.confirmTitle}>Money Transfer</h2>
                  <span className={styles.confirmSub}>QUICK PAY - CONFIRMATION</span>
                </div>
                <div className={styles.mobileAvailLimit}>
                  <span className={styles.senderLabel}>AVAIL LIMIT</span>
                  <span className={styles.senderVal} style={{ color: '#1756AA' }}>₹38,000</span>
                </div>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.senderItem}>
                  <span className={styles.senderLabel}>SENDER NAME</span>
                  <span className={styles.senderVal}>VISHNU PRAJAPATI</span>
                </div>
                <div className={styles.senderItem}>
                  <span className={styles.senderLabel}>MOBILE NO.</span>
                  <span className={styles.senderVal}>6377749427</span>
                </div>
                <div className={`${styles.senderItem} ${styles.desktopAvailLimit}`}>
                  <span className={styles.senderLabel}>AVAIL LIMIT</span>
                  <span className={styles.senderVal} style={{ color: '#1756AA' }}>₹38,000</span>
                </div>
              </div>
            </div>

            {/* ── Bene summary ── */}
            <div className={styles.beneSummaryRow}>
              <div className={styles.summaryCol}>
                <label>Beneficiary Name</label>
                <span>{transferData?.name}</span>
              </div>
              <div className={styles.summaryCol}>
                <label>Account Number</label>
                <span style={{ color: '#E11D48', fontWeight: '800' }}>{transferData?.accountNo}</span>
              </div>
              <div className={styles.summaryCol}>
                <label>Bank</label>
                <span>{transferData?.bank}</span>
              </div>
              <div className={styles.summaryCol}>
                <label>IFSC Code</label>
                <span>{transferData?.ifsc}</span>
              </div>
              <div className={styles.summaryCol}>
                <label>Transfer Amount</label>
                <span style={{ color: '#E11D48', fontWeight: '800' }}>₹{transferData?.amount} /-</span>
              </div>
              <div className={styles.summaryCol}>
                <label>Transfer Type</label>
                <span className={styles.modeBadge}>{transferData?.mode}</span>
              </div>
            </div>

            {/* ── Confirm grid (table + action panel) ── */}
            <div className={styles.confirmGrid}>

              {/* Left — transaction table */}
              <div className={styles.gridLeft}>
                <div className={styles.sectionHeader}>Number of Transaction</div>
                <div className={styles.tableResponsiveWrap}>
                  <table className={styles.confirmTable}>
                    <thead>
                      <tr>
                        <th>CHUNK #</th>
                        <th>AMOUNT</th>
                        <th>CHARGE</th>
                        <th>STATUS</th>
                        <th className={styles.desktopActionCell}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferChunks.map((chk, idx) => (
                        <React.Fragment key={chk.id}>
                          <tr className={chk.status === 'completed' ? styles.completedRow : ''}>
                            <td>{chk.index}</td>
                            <td style={{ fontWeight: 'bold' }}>₹{chk.amount.toLocaleString('en-IN')}</td>
                            <td>₹{chk.charge}</td>
                            <td>
                              {chk.status === 'completed' ? (
                                <span className={styles.chunkBadgeSuccess}>Completed</span>
                              ) : chk.status === 'processing' ? (
                                <span className={styles.chunkBadgeProcess}>Processing</span>
                              ) : (
                                <span className={styles.chunkBadgePending}>Pending</span>
                              )}
                            </td>
                            <td className={styles.desktopActionCell}>
                              {chk.status === 'completed' ? (
                                <span style={{ color: '#16A34A', fontWeight: 'bold', fontSize: '0.75rem' }}>{chk.txnId}</span>
                              ) : (
                                <button
                                  className={styles.initChunkBtn}
                                  onClick={() => handleInitializeChunk(chk.id)}
                                  disabled={transferChunks.some(c => c.status === 'processing') || (idx > 0 && transferChunks[idx - 1].status !== 'completed')}
                                >
                                  Initialize
                                </button>
                              )}
                            </td>
                          </tr>
                          <tr className={styles.mobileActionRow}>
                            <td colSpan="4">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748B'}}>ACTION :</span>
                                {chk.status === 'completed' ? (
                                  <span style={{ color: '#16A34A', fontWeight: 'bold', fontSize: '0.75rem' }}>{chk.txnId}</span>
                                ) : (
                                  <button
                                    className={styles.initChunkBtn}
                                    onClick={() => handleInitializeChunk(chk.id)}
                                    disabled={transferChunks.some(c => c.status === 'processing') || (idx > 0 && transferChunks[idx - 1].status !== 'completed')}
                                  >
                                    Initialize
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                      <tr className={styles.finalTotalRow}>
                        <td colSpan="2">
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span>Total Deductions :</span>
                            <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '600', marginTop: '2px' }}>
                              {numberToWords(transferChunks.reduce((acc, c) => acc + c.amount + c.charge, 0))}
                            </span>
                          </div>
                        </td>
                        <td colSpan="3">
                          ₹{(transferChunks.reduce((acc, c) => acc + c.amount + c.charge, 0)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right — remark + actions */}
              <div className={styles.gridRight}>
                <div className={styles.sectionHeader}>Enter M-PIN</div>
                <div className={styles.pinForm}>
                  <div className={styles.remarkRow}>
                    <label>Remark</label>
                    <input type="text" placeholder="Optional remark" className={styles.remarkInput} />
                  </div>
                  <div className={styles.remarkRow} style={{ borderBottom: 'none' }}>
                    <label>M-PIN</label>
                    <input type="password" placeholder="Enter PIN" className={styles.remarkInput} />
                  </div>
                  <div className={styles.pinActions}>
                    {transferChunks.every(c => c.status === 'completed') ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '6px 12px' }}>
                          <FaCheckCircle style={{ color: '#16A34A', fontSize: '0.85rem' }} />
                          <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.78rem' }}>TRANSFER COMPLETED</span>
                        </div>
                        <button className={styles.confirmActionBtn} onClick={() => handleFinalSubmit(transferChunks)}>VIEW RECEIPT</button>
                      </>
                    ) : (
                      <button className={styles.cancelActionBtn} onClick={() => setView('beneficiary')}>CANCEL</button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className={styles.mainLayout}>
          <div className={styles.rightPanel}>
            <h1 className={styles.title} style={{ marginTop: '15px', marginBottom: '20px', fontSize: '1.6rem', color: '#1756AA' }}>DMT Service</h1>
            
            <div className={styles.formGroup}>
              <label>Service Provider</label>
              <select 
                className={styles.select} 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">{servicesLoading ? 'Loading services...' : '-- Select Service --'}</option>
                {services && services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className={styles.formGroup}><label>Select Customer Mobile Number</label>
              <select className={styles.select} value={selectedMobile} onChange={(e) => setSelectedMobile(e.target.value)}>
                <option value="">-- Select Contact --</option>
                {CONTACTS.map(c => <option key={c.mobile} value={c.mobile}>{c.name}</option>)}
              </select>
            </div>
            <button className={styles.submitBtn} disabled={!selectedMobile || isLoading} onClick={handleFetchCustomer}>
              {isLoading ? <FaSpinner className={styles.spinner} /> : <FaMoneyBillWave />}
              {isLoading ? 'Fetching Details...' : 'Submit Details'}
            </button>
          </div>
          <div className={styles.leftPanel}>
            <img src="/images/money_transfer.png" alt="Transfer" className={styles.illustrativeImg} />
            <div className={styles.featuresRow}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
                  <FaCheckCircle />
                </div>
                <div className={styles.featureText}>
                  <h4>Instant Payouts</h4>
                  <p>Settlements in seconds</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrap} style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                  <FaShieldAlt />
                </div>
                <div className={styles.featureText}>
                  <h4>24/7 Support</h4>
                  <p>Reliable and Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {renderModal()}
    </div>
  );
};

export default DMT;
