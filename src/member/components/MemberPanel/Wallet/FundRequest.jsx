import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaUniversity, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle, 
  FaUpload, FaFileInvoiceDollar, FaQrcode, FaSearch, FaFilter,
  FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv, FaChevronLeft, FaChevronRight, 
  FaRegCopy, FaCheck, FaWallet, FaCalendarAlt, FaPen, FaExchangeAlt
} from 'react-icons/fa';
import styles from './FundRequest.module.css';

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

// ✅ Removed INITIAL_REQUESTS — now the list starts empty

const formatCardNumber = (accNo) => {
  return accNo.replace(/(\d{4})/g, '$1 ').trim();
};

const FundRequest = () => {
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');
  // Form states
  const [selectedBank, setSelectedBank] = useState('');
  const [amount, setAmount] = useState('');
  const [refNo, setRefNo] = useState('');
  const [payMode, setPayMode] = useState('');
  const [payDate, setPayDate] = useState('');
  const [remark, setRemark] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // List states – now starts with an empty array ✅
  const [requests, setRequests] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal / Interaction states
  const [activeQrBank, setActiveQrBank] = useState(null);
  const [activeSlip, setActiveSlip] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`Copied ${label}: ${text}`, 'success');
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      showToast(`Slip attached: ${e.target.files[0].name}`, 'success');
    }
  };

  const handleRefNoChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (value.length <= 12) {
      setRefNo(value);
    }
  };

  const handleSaveRequest = (e) => {
    e.preventDefault();
    if (!selectedBank) return showToast('Please select a company bank', 'error');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return showToast('Please enter a valid amount', 'error');
    if (!refNo.trim()) return showToast('Please enter UTR / Reference ID', 'error');
    if (refNo.length !== 12) return showToast('UTR / Reference ID must be exactly 12 characters', 'error');
    if (!payMode) return showToast('Please select payment mode', 'error');
    if (!payDate) return showToast('Please select payment date', 'error');

    setLoading(true);
    showToast('Submitting request...', 'info');

    setTimeout(() => {
      setLoading(false);
      
      const newRequest = {
        sNo: requests.length + 1,
        requestId: `FR${Math.floor(1000000 + Math.random() * 9000000)}`,
        date: payDate,
        payMode: payMode,
        companyBank: selectedBank,
        amount: parseFloat(amount),
        remark: remark || 'Wallet loading',
        refId: refNo,
        addDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
        approveDate: 'Pending',
        compRemarks: 'Verifying with bank',
        slip: selectedFile ? selectedFile.name : 'attached_receipt.png',
        status: 'pending',
        reason: 'N/A'
      };

      setRequests([newRequest, ...requests]);
      showToast('Fund request saved successfully!', 'success');

      // Clear form
      setSelectedBank('');
      setAmount('');
      setRefNo('');
      setPayMode('');
      setPayDate('');
      setRemark('');
      setSelectedFile(null);
    }, 1200);
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

  // Pagination Logic
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

      {/* SECTION 1: Submit New Request */}
      {!isApiPanel && (
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
                  {COMPANY_BANKS.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
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
                  {selectedFile ? `📎 ${selectedFile.name}` : "Attach Payment Receipt Slip"}
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className={styles.btnSaveSubmit}>
              {loading ? <div className={styles.spinner}></div> : <><FaWallet /> Submit Fund Request</>}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* SECTION 2: Company Bank Cards */}
      {!isApiPanel && (
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
          {COMPANY_BANKS.map(bank => (
            <div 
              key={bank.id} 
              className={`${styles.bankCardItem} ${styles['cardTheme' + bank.id]}`}
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
      )}

      {/* SECTION 3: Fund Request History */}
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
            <button className={styles.btnFilterSubmit} onClick={() => showToast('Date filters applied!', 'success')}>
              Submit
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

        <div className={styles.tableWrapper}>
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
                    <td>{row.date}</td>
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
                        View Slip
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
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num}
                className={currentPage === num ? styles.activePageBtn : ''}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* QR overlay popup */}
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

      {/* Slip viewer modal */}
      {activeSlip && (
        <div className={styles.overlay} onClick={() => setActiveSlip(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><FaFileInvoiceDollar /> Attached Receipt Slip</h3>
              <button className={styles.modalCloseBtn} onClick={() => setActiveSlip(null)}>✕</button>
            </div>
            <div className={styles.slipModalBody}>
              <div className={styles.slipMockContainer}>
                <div className={styles.slipMockHeader}>
                  <h4>{activeSlip.companyBank} Transaction Log</h4>
                  <span>UTR ID: {activeSlip.refId}</span>
                </div>
                <div style={{ height: '1.5px', background: '#cbd5e1', borderStyle: 'dashed', margin: '14px 0' }}></div>
                <div className={styles.slipDetailGrid}>
                  <div><span>REQUEST ID</span><strong>{activeSlip.requestId}</strong></div>
                  <div><span>PAYMENT DATE</span><strong>{activeSlip.date}</strong></div>
                  <div><span>PAYMENT MODE</span><strong>{activeSlip.payMode}</strong></div>
                  <div><span>AMOUNT</span><strong style={{ color: '#16a34a', fontSize: '1.15rem' }}>₹{activeSlip.amount.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
              <span className={styles.slipAttachedName}>📎 Attached receipt file: {activeSlip.slip}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FundRequest;