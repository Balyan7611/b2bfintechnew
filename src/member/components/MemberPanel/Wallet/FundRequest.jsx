import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API } from '../../../../api/endpoints';
import { resolveMemberId } from '../../../../utils/memberIdentity';
import { normalizeStatus } from '../../../../models/fundRequestModel';
import { getImageUrl } from '../../../../config/siteConfig';
import { 
  FaUniversity, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle, 
  FaUpload, FaFileInvoiceDollar, FaQrcode, FaSearch, FaFilter,
  FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv, FaChevronLeft, FaChevronRight, 
  FaRegCopy, FaCheck, FaWallet, FaCalendarAlt, FaPen, FaExchangeAlt
} from 'react-icons/fa';
import styles from './FundRequest.module.css';

// Parse any date format → "YYYY-MM-DD" or '-'
function fmtDate(raw) {
  if (!raw) return '-';
  const s = String(raw).trim();
  // ISO: 2026-06-08T... or 2026-06-08
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // DD/MM/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  return s.slice(0, 10) || '-';
}

// Parse any date format → "DD/MM/YYYY HH:MM" or '-'
function fmtDateTime(raw) {
  if (!raw) return '-';
  const s = String(raw).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2,'0');
    const min = String(d.getMinutes()).padStart(2,'0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return s.slice(0, 16) || '-';
}

const COMPANY_BANKS = [
  { 
    id: 1, 
    name: 'ICICI Bank', 
    branch: 'SURAJKUND', 
    holder: 'VIRAT COMMUNICATION SERVICES INDIA PVT LTD', 
    accNo: '184205500409', 
    ifsc: 'ICIC0001842', 
    logo: '🏦'
  },
  { 
    id: 2, 
    name: 'Equitas Small Bank', 
    branch: 'EQUITAS TREASURY', 
    holder: 'VIRAT COMMUNICATION SERVICES INDIA PVT LTD', 
    accNo: '200001962612', 
    ifsc: 'ESFB0000001', 
    logo: '🏢'
  },
  { 
    id: 3, 
    name: 'Punjab National Bank', 
    branch: 'FARIDABAD NIT', 
    holder: 'VIRAT COMMUNICATION SERVICES INDIA PVT LTD', 
    accNo: '0167002100194456', 
    ifsc: 'PUNB0016700', 
    logo: '🏛️'
  },
  { 
    id: 4, 
    name: 'State Bank of India', 
    branch: 'FARIDABAD NIT', 
    holder: 'VIRAT COMMUNICATION SERVICES INDIA PVT LTD', 
    accNo: '40683257393', 
    ifsc: 'only cash deposit', 
    logo: '🏫'
  }
];

const formatCardNumber = (accNo) => {
  return accNo.replace(/(\d{4})/g, '$1 ').trim();
};

const SlipViewer = ({ slip, fallback }) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  if (imgFailed) return fallback;

  const isPdf = String(slip).toLowerCase().endsWith('.pdf');
  if (isPdf) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <embed src={slip} type="application/pdf" width="100%" height="420px" style={{ borderRadius: 8 }} />
        <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#64748b' }}>📎 Payment receipt (PDF)</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={slip}
        alt="Payment Receipt Slip"
        style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: 8, objectFit: 'contain', display: 'block', margin: '0 auto', border: '1px solid #e2e8f0' }}
        onError={() => setImgFailed(true)}
      />
      <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#64748b' }}>📎 Payment receipt attached</p>
    </div>
  );
};

const FundRequest = () => {
  const isApiPanel = typeof window !== 'undefined' && window.location.pathname.startsWith('/api-panel');

    const [memberId, setMemberId] = useState(null);
  const [companyBanks, setCompanyBanks] = useState(COMPANY_BANKS);
  const [isLoadingList, setIsLoadingList] = useState(false);

    const [selectedBank, setSelectedBank] = useState('');
  const [amount, setAmount] = useState('');
  const [refNo, setRefNo] = useState('');
  const [payMode, setPayMode] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
    const [requests, setRequests] = useState([]);
  const _today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(_today);
  const [toDate, setToDate] = useState(_today);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
    const [activeQrBank, setActiveQrBank] = useState(null);
  const [activeSlip, setActiveSlip] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const slipMapRef = useRef({});
  const toastTimerRef = useRef(null);
  const copiedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

      const resolveSlipUrl = useCallback((raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    // If path already has UploadedFiles, prepend just the base domain
    if (s.includes('UploadedFiles/')) {
      return `https://api.sahayatamoney.in/${s.replace(/^\/+/, '')}`;
    }
    // If path already has FundRequest/ folder prefix, don't double it
    if (s.startsWith('FundRequest/') || s.startsWith('/FundRequest/')) {
      return `https://api.sahayatamoney.in/UploadedFiles/${s.replace(/^\/+/, '')}`;
    }
    return getImageUrl(s, 'FundRequest');
  }, []);

  const toRow = useCallback((r, banks) => {
    const bank = (banks || []).find(b => Number(b.id) === Number(r.companyBankId));
    const rawSlip = r.cashslip || r.slipFile || r.SlipFile || r.slipUrl || null;
    const slip = resolveSlipUrl(rawSlip)
      || slipMapRef.current[r.bankRefId]
      || slipMapRef.current[rawSlip]
      || null;
    return {
      id: r.id,
      requestId: `FR${String(r.id).padStart(6, '0')}`,
      date: fmtDate(r.paymentDate || r.createdDate),
      paymentDate: fmtDate(r.paymentDate),
      payMode: r.paymentMode || '-',
      companyBank: r.companyBankName || bank?.name || (r.companyBankId ? `Bank #${r.companyBankId}` : '-'),
      amount: r.amount,
      remark: r.remark || '-',
      refId: r.bankRefId || '-',
      addDate: fmtDateTime(r.createdDate),
      approveDate: r.approveDate ? fmtDateTime(r.approveDate) : 'Pending',
      compRemarks: r.remark || '-',
      slip,
      cashslip: rawSlip || null,
      status: normalizeStatus(r.status),
      reason: normalizeStatus(r.status) === 'rejected' ? (r.reason || r.remark || 'N/A') : 'N/A'
    };
  }, [resolveSlipUrl]);

  const loadRequests = useCallback(async (id, banks) => {
    if (!id) return;
    setIsLoadingList(true);
    try {
      const rows = await API.fundRequest.getMine(id);
      setRequests(rows.map(r => toRow(r, banks)));
    } catch (err) {
      console.error('FundRequest: failed to load list', err);
    } finally {
      setIsLoadingList(false);
    }
  }, [toRow]);

  useEffect(() => {
    const init = async () => {
      const id = await resolveMemberId();
      setMemberId(id);

      let banks = COMPANY_BANKS;
      try {
        const res = await API.companyBankDetail.getAll({ pageNumber: 1, pageSize: 200 });
        const live = (Array.isArray(res) ? res : []).filter(b => b.isActive && !b.isDelete);
        if (live.length > 0) {
          banks = live.map(b => ({
            id: b.id,
            name: b.bankName,
            branch: b.branchName,
            holder: b.accountHolderName,
            accNo: b.accountNumber,
            ifsc: b.ifsccode,
            logo: '🏦',
            qrlogo: b.qrlogo
          }));
          setCompanyBanks(banks);
        }
      } catch (err) {
        console.error('FundRequest: failed to load company banks, using fallback', err);
      }

      loadRequests(id, banks);
    };
    init();
  }, [loadRequests]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`Copied ${label}: ${text}`, 'success');
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopiedText(''), 2000);
  };

  // Server JSON body limit is very small — target ≤150 KB after compression
  // Base64 adds ~33% overhead, so the actual file must be ≤~110 KB
  const TARGET_BYTES = 110 * 1024;
  const MAX_RAW_MB = 20;
  const MAX_DIM = 1024;

  const compressImage = (file) => new Promise((resolve) => {
    if (file.type === 'application/pdf') { resolve(file); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        // Binary-search quality to hit TARGET_BYTES
        const tryQuality = (lo, hi, attempt) => {
          const q = (lo + hi) / 2;
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            if (attempt >= 6 || Math.abs(blob.size - TARGET_BYTES) < 5 * 1024) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() }));
            } else if (blob.size > TARGET_BYTES) {
              tryQuality(lo, q, attempt + 1);
            } else {
              tryQuality(q, hi, attempt + 1);
            }
          }, 'image/jpeg', q);
        };
        tryQuality(0.1, 0.85, 0);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const rawMB = (file.size / 1024 / 1024).toFixed(1);

    if (file.type === 'application/pdf') {
      if (file.size > 150 * 1024) {
        showToast(`PDF too large (${rawMB} MB). Please upload a PDF under 150 KB or use an image instead.`, 'error');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      showToast(`Slip attached: ${file.name}`, 'success');
      return;
    }

    if (file.size > MAX_RAW_MB * 1024 * 1024) {
      showToast(`File too large (${rawMB} MB). Max 20 MB allowed.`, 'error');
      e.target.value = '';
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (isImage) {
      if (file.size > TARGET_BYTES) {
        showToast(`Compressing image (${rawMB} MB)…`, 'success');
      }
      const compressed = await compressImage(file);
      const compKB = (compressed.size / 1024).toFixed(0);
      setSelectedFile(compressed);
      showToast(`Slip ready: ${compressed.name} (${compKB} KB)`, 'success');
    } else {
      setSelectedFile(file);
      showToast(`Slip attached: ${file.name} (${rawMB} MB)`, 'success');
    }
  };

  const handleRefNoChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (value.length <= 12) {
      setRefNo(value);
    }
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!selectedBank) return showToast('Please select a company bank', 'error');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return showToast('Please enter a valid amount', 'error');
    if (!refNo.trim()) return showToast('Please enter UTR / Reference ID', 'error');
    if (refNo.length !== 12) return showToast('UTR / Reference ID must be exactly 12 characters', 'error');
    if (!payMode) return showToast('Please select payment mode', 'error');
    if (!payDate) return showToast('Please select payment date', 'error');
    if (!selectedFile) return showToast('Please attach the payment receipt slip (required)', 'error');

    const msrno = memberId || (await resolveMemberId());
    if (!msrno) return showToast('Could not identify your member account. Please re-login.', 'error');

    setLoading(true);
    try {
            const res = await API.fundRequest.create({
        msrno,
        companyBankId: parseInt(selectedBank),
        amount: parseFloat(amount),
        bankRefId: refNo,
        transactionId: `TXN_${refNo}`,
        paymentMode: payMode,
        paymentDate: payDate,
        remark: remark || 'Wallet loading',
                slipFile: selectedFile || undefined
      });

      if (res && (res.status === true || res.code === 'TXN')) {
        showToast('Fund request submitted successfully!', 'success');
        // Always store blob URL so view slip works immediately
        if (selectedFile) {
          const blobUrl = URL.createObjectURL(selectedFile);
          slipMapRef.current[refNo] = blobUrl;
          // Also key by the returned cashslip path if available
          const returnedSlip = res?.data?.cashslip || res?.data?.CashSlip || res?.data?.slipFile;
          if (returnedSlip) slipMapRef.current[returnedSlip] = blobUrl;
        }
        setSelectedBank('');
        setAmount('');
        setRefNo('');
        setPayMode('');
        setPayDate(new Date().toISOString().split('T')[0]);
        setRemark('');
        setSelectedFile(null);
        await loadRequests(msrno, companyBanks);
      } else {
        showToast(res?.message || res?.mess || 'Could not submit request.', 'error');
      }
    } catch (err) {
      console.error('FundRequest: create failed', err);
      showToast(err.message || 'Could not submit request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.companyBank.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDates = 
      (!fromDate || req.date >= fromDate) && 
      (!toDate || req.date <= toDate);

    return matchesSearch && matchesDates;
  });

    const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'pending') return <span className={`${styles.statusPill} ${styles.pending}`}><FaClock /> Pending</span>;
    if (s === 'approved') return <span className={`${styles.statusPill} ${styles.approved}`}><FaCheckCircle /> Approved</span>;
    return <span className={`${styles.statusPill} ${styles.rejected}`}><FaTimesCircle /> Rejected</span>;
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.message}
        </div>
      )}

            <div className={`${styles.premiumSectionCard} ${styles.formCard}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <FaWallet className={styles.headerIcon} />
            <h2 className={styles.sectionHeading}>Submit Fund Top-Up Request</h2>
          </div>
        </div>

        <form onSubmit={handleSaveRequest} className={styles.compactForm}>
          <div className={styles.compactFormGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Company Bank Selected</label>
              <div className={styles.inputWrapper}>
                <FaUniversity className={styles.inputIcon} />
                <select 
                  className={styles.selectInput}
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                >
                  <option value="">Select Bank</option>
                  {companyBanks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Deposit Amount (₹)</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputCurrencyPrefix}>₹</span>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  className={styles.textInputPrefix}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>UTR / Bank Reference No.</label>
              <div className={styles.inputWrapper}>
                <FaFileInvoiceDollar className={styles.inputIcon} />
                <input 
                  type="text" 
                  maxLength={12}
                  placeholder="Enter 12-Digit Ref No." 
                  className={styles.textInput}
                  value={refNo}
                  onChange={handleRefNoChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Mode</label>
              <div className={styles.inputWrapper}>
                <FaExchangeAlt className={styles.inputIcon} />
                <select 
                  className={styles.selectInput}
                  value={payMode}
                  onChange={e => setPayMode(e.target.value)}
                >
                  <option value="">Select Mode</option>
                  <option value="IMPS">IMPS</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                  <option value="UPI Transfer">UPI Transfer</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Date</label>
              <div className={styles.inputWrapper}>
                <FaCalendarAlt className={styles.inputIcon} />
                <input 
                  type="date" 
                  className={styles.dateInput}
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Remarks</label>
              <div className={styles.inputWrapper}>
                <FaPen className={styles.inputIcon} />
                <input 
                  type="text" 
                  placeholder="Optional Remarks" 
                  className={styles.textInput}
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.uploadSubmitRow}>
            <div className={styles.compactUploadZone}>
              <input 
                type="file" 
                id="deposit-slip-receipt" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className={styles.hiddenFileField} 
              />
              <label htmlFor="deposit-slip-receipt" className={styles.compactUploadLabel}>
                <FaUpload className={styles.compactUploadIcon} />
                <span className={styles.compactUploadText}>
                  {selectedFile ? `📎 ${selectedFile.name}` : "Attach Payment Receipt Slip (Required)"}
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className={styles.btnSaveSubmit}>
              {loading ? <div className={styles.spinner}></div> : <><FaWallet /> Submit Fund Request</>}
            </button>
          </div>
        </form>
      </div>

            <div className={styles.premiumSectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <FaUniversity className={styles.headerIcon} />
            <div>
              <h2 className={styles.sectionHeading}>Company Bank Accounts</h2>
              <p className={styles.sectionSubHeading}>Transfer to any bank below & copy details instantly</p>
            </div>
          </div>
        </div>

        <div className={styles.bankCardsGrid}>
          {companyBanks.map((bank, bankIdx) => (
            <div
              key={bank.id}
                                          className={`${styles.bankCardItem} ${styles['cardTheme' + ((bankIdx % 4) + 1)]}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardBankLogo}>{bank.logo}</div>
                <div className={styles.cardBankIdentity}>
                  <span className={styles.cardBankName}>{bank.name}</span>
                  <span className={styles.cardType}>PLATINUM</span>
                </div>
                <div className={styles.contactlessIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 3a9 9 0 0 1 9 9v1a1 1 0 0 1-2 0v-1a7 7 0 0 0-7-7H9a1 1 0 0 1 0-2h3zm-3 4a6 6 0 0 1 6 6v1a1 1 0 0 1-2 0v-1a4 4 0 0 0-4-4H7a1 1 0 0 1 0-2h2zm-3 4a3 3 0 0 1 3 3v1a1 1 0 0 1-2 0v-1a1 1 0 0 0-1-1H3a1 1 0 0 1 0-2h3z"/>
                  </svg>
                </div>
              </div>

              <div className={styles.emvChip}>
                <div className={styles.chipLine}></div>
                <div className={styles.chipLine}></div>
                <div className={styles.chipLine}></div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardAccBlock}>
                  <span className={styles.cardMetaLabel}>Account Number</span>
                  <div className={styles.copyFlex}>
                    <strong className={styles.cardAccNumber}>{formatCardNumber(bank.accNo)}</strong>
                    <button 
                      type="button"
                      className={styles.copyCardBtn}
                      onClick={() => handleCopy(bank.accNo, 'Account Number')}
                      title="Copy Account Number"
                    >
                      {copiedText === bank.accNo ? <FaCheck className={styles.checkIcon} /> : <FaRegCopy />}
                    </button>
                  </div>
                </div>

                <div className={styles.cardLowerRow}>
                  <div className={styles.cardHolderBlock}>
                    <span className={styles.cardMetaLabel}>Card Holder</span>
                    <strong className={styles.cardHolderName}>{bank.holder}</strong>
                  </div>

                  <div className={styles.cardIfscBlock}>
                    <span className={styles.cardMetaLabel}>IFSC Code</span>
                    <div className={styles.copyFlex}>
                      <strong className={styles.cardIfscText}>{bank.ifsc}</strong>
                      {bank.ifsc !== 'only cash deposit' && (
                        <button 
                          type="button"
                          className={styles.copyCardBtn}
                          onClick={() => handleCopy(bank.ifsc, 'IFSC Code')}
                          title="Copy IFSC Code"
                        >
                          {copiedText === bank.ifsc ? <FaCheck className={styles.checkIcon} /> : <FaRegCopy />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardBranchText}>📍 {bank.branch}</span>
                <button 
                  type="button"
                  className={styles.cardQrBtn}
                  onClick={() => setActiveQrBank(bank)}
                >
                  <FaQrcode /> Scan QR Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

            <div className={styles.tableCard}>
        <div className={styles.tableHeaderRow}>
          <h2 className={styles.sectionTitle}><FaFileInvoiceDollar /> Fund Request List</h2>
          
          <div className={styles.dateFilterContainer}>
            <div className={styles.dateGroup}>
              <label>From Date:</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className={styles.dateGroup}>
              <label>To Date:</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <button
              className={styles.btnFilterSubmit}
              disabled={isLoadingList}
              onClick={() => loadRequests(memberId, companyBanks)}
            >
              {isLoadingList ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>

        <div className={styles.toolbarControls}>
          <div className={styles.rowLimiter}>
            <span>Show</span>
            <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className={styles.toolbarExportActions}>
            <button className="global-export-btn btn-copy" title="Copy Table" onClick={() => showToast('Copied to clipboard!', 'success')}><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel" onClick={() => showToast('Excel exported!', 'success')}><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF" onClick={() => showToast('PDF exported!', 'success')}><FaFilePdf /></button>
            <button className="global-export-btn btn-print" title="Print Table" onClick={() => showToast('Print job initialized!', 'success')}><FaPrint /></button>
          </div>

          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Request ID, Ref, or Bank..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className={`${styles.tableWrapper} ${isApiPanel ? styles.compactTableContainer : ''}`}>
          <table className={styles.premiumTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Request ID</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Company Bank Name</th>
                <th>Amount</th>
                <th>Remark</th>
                <th>Bank Ref ID</th>
                <th>Add Date</th>
                <th>Approve Date</th>
                <th>Company Remarks</th>
                <th>Slip</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    No recent fund requests available in table.
                  </td>
                </tr>
              ) : (
                currentData.map((row, idx) => (
                  <tr key={row.requestId}>
                    <td>{startIndex + idx + 1}</td>
                    <td><code className={styles.requestIdCode}>{row.requestId}</code></td>
                    <td>{row.paymentDate !== '-' ? row.paymentDate : row.date}</td>
                    <td>{row.payMode}</td>
                    <td>{row.companyBank}</td>
                    <td style={{ fontWeight: 800 }}>₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{row.remark}</td>
                    <td><code className={styles.refIdCode}>{row.refId}</code></td>
                    <td>{row.addDate}</td>
                    <td>{row.approveDate}</td>
                    <td>{row.compRemarks}</td>
                    <td>
                      <button
                        className={styles.viewSlipBtn}
                        onClick={() => setActiveSlip(row)}
                      >
                        📎 View Slip
                      </button>
                    </td>
                    <td>{getStatusBadge(row.status)}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationSection}>
          <div className={styles.showingText}>
            Showing {filteredRequests.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
          </div>
          
          <div className={styles.paginationControls}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FaChevronLeft /> Previous
            </button>
            
            {(() => {
              const delta = 2;
              const left = currentPage - delta;
              const right = currentPage + delta;
              const pages = [];
              let prev = null;
              for (let i = 1; i <= (totalPages || 1); i++) {
                if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                  if (prev !== null && i - prev > 1) pages.push('...');
                  pages.push(i);
                  prev = i;
                }
              }
              return pages.map((pg, i) =>
                pg === '...'
                  ? <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '32px' }}>…</span>
                  : <button key={pg} className={currentPage === pg ? styles.activePageBtn : ''} onClick={() => setCurrentPage(pg)}>{pg}</button>
              );
            })()}
            
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

            {activeQrBank && (
        <div className={styles.overlay} onClick={() => setActiveQrBank(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><FaQrcode /> Scan UPI QR - {activeQrBank.name}</h3>
              <button className={styles.modalCloseBtn} onClick={() => setActiveQrBank(null)}>✕</button>
            </div>
            <div className={styles.qrModalBody}>
              <div className={styles.qrOutlineFrame}>
                <div className={styles.scanOutlineLine}></div>
                <div className={styles.emulatedQrCode}>
                  <div className={styles.qrCornerSquare} style={{ top: 10, left: 10 }}></div>
                  <div className={styles.qrCornerSquare} style={{ top: 10, right: 10 }}></div>
                  <div className={styles.qrCornerSquare} style={{ bottom: 10, left: 10 }}></div>
                  <div className={styles.qrCenterDot} style={{ top: 40, left: 40 }}></div>
                  <div className={styles.qrCenterDot} style={{ top: 60, left: 20 }}></div>
                  <div className={styles.qrCenterDot} style={{ top: 80, left: 70 }}></div>
                  <div className={styles.qrCentralUpiBadge}>UPI</div>
                </div>
              </div>
              <div className={styles.qrDetails}>
                <strong>Account No: {activeQrBank.accNo}</strong>
                <span>Holder: {activeQrBank.holder}</span>
                <span className={styles.qrTip}>Scan to pay using any UPI application (GPay, PhonePe, Paytm, BHIM) and input the UTR Reference ID in the request form.</span>
              </div>
            </div>
          </div>
        </div>
      )}

            {activeSlip && (
        <div className={styles.overlay} onClick={() => setActiveSlip(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><FaFileInvoiceDollar /> Attached Receipt Slip</h3>
              <button className={styles.modalCloseBtn} onClick={() => setActiveSlip(null)}>✕</button>
            </div>
            <div className={styles.slipModalBody}>
              {(() => {
                const defaultSummary = (
                  <>
                    <div className={styles.slipMockContainer}>
                      <div className={styles.slipMockHeader}>
                        <h4>{activeSlip.companyBank} Transaction Log</h4>
                        <span>UTR ID: {activeSlip.refId}</span>
                      </div>
                      <div style={{ height: '1.5px', background: '#cbd5e1', borderStyle: 'dashed', margin: '14px 0' }}></div>
                      <div className={styles.slipDetailGrid}>
                        <div><span>REQUEST ID</span><strong>{activeSlip.requestId}</strong></div>
                        <div><span>PAYMENT DATE</span><strong>{activeSlip.paymentDate !== '-' ? activeSlip.paymentDate : activeSlip.date}</strong></div>
                        <div><span>PAYMENT MODE</span><strong>{activeSlip.payMode}</strong></div>
                        <div><span>AMOUNT</span><strong style={{ color: '#16a34a', fontSize: '1.15rem' }}>₹{activeSlip.amount.toLocaleString('en-IN')}</strong></div>
                      </div>
                    </div>
                    <span className={styles.slipAttachedName}>📎 No receipt uploaded for this request</span>
                  </>
                );
                return activeSlip.slip
                  ? <SlipViewer slip={activeSlip.slip} fallback={defaultSummary} />
                  : defaultSummary;
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FundRequest;
