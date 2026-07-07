import React, { useState } from 'react';
import { FaShieldAlt, FaServer, FaCheckCircle, FaExclamationTriangle, FaPaperPlane, FaLock, FaGlobe, FaNetworkWired, FaHistory } from 'react-icons/fa';
import AdminTable from '../../shared/components/common/AdminTable';
import styles from './ApiWhitelisting.module.css';

const MOCK_HISTORY = [
  { id: 1, type: 'WEBHOOK', value: 'https://sonitechno.com/aernop.ashx', status: 'APPROVED', note: 'Approved by Company', date: '06 Feb 2026, 06:51 PM' },
  { id: 2, type: 'IP', value: '223.181.45.224', status: 'CANCELLED', note: '-', date: '04 Feb 2026, 09:16 PM' },
];

const ApiWhitelisting = () => {
  const [reqType, setReqType] = useState('IP Whitelist');
  const [inputValue, setInputValue] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue) return;
    setIsSubmitting(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifySuccess(false);
      setOtp('');
      setShowOtpModal(true);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (!otp) return;
    setIsVerifying(true);
    // Simulate API verification
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      
      // Auto close modal after success
      setTimeout(() => {
        setShowOtpModal(false);
        setInputValue('');
        setReason('');
        setOtp('');
        setVerifySuccess(false);
      }, 2000);
    }, 1500);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHistory = MOCK_HISTORY.filter(item => 
    item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalEntries = filteredHistory.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const paginatedData = filteredHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const tableColumns = [
    'REQUEST TYPE', 'VALUE', 'STATUS', 'NOTE', 'REQUESTED DATE', 'ACTION'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topCards}>
        <div className={styles.configCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaServer style={{ color: '#1756AA' }} /> Active Server IPs
            </div>
          </div>
          <table className={styles.configTable}>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Server IP</th>
                <th>Environment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>API</strong></td>
                <td>157.119.43.220</td>
                <td><span className={`${styles.badge} ${styles.badgeProd}`}>Production</span></td>
                <td><span className={`${styles.badge} ${styles.badgeActive}`}>Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.policyAlert}>
          <div className={styles.policyTitle}>
            <FaExclamationTriangle /> Security Policy:
          </div>
          <ul className={styles.policyList}>
            <li>IP whitelist: only India (IN) allowed.</li>
            <li>Webhook must be HTTPS and must match approved domain.</li>
            <li>OTP verification is mandatory before submission.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Request Type</label>
              <div className={styles.inputWrap}>
                <select 
                  className={`${styles.input} ${styles.select}`}
                  style={{ paddingLeft: '16px' }}
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                >
                  <option value="IP Whitelist">IP Whitelist</option>
                  <option value="Webhook URL">Webhook URL</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {reqType === 'IP Whitelist' ? 'IP Address' : 'Webhook URL'}
              </label>
              <div className={styles.inputWrap}>
                <div className={styles.iconWrap}>
                  {reqType === 'IP Whitelist' ? <FaNetworkWired /> : <FaGlobe />}
                </div>
                <input 
                  className={styles.input}
                  placeholder={reqType === 'IP Whitelist' ? 'e.g. 43.205.22.48' : 'e.g. https://yourdomain.com/callback'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  required
                />
              </div>
              {inputValue && reqType === 'IP Whitelist' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className={`${styles.statusIndicator} ${styles.valid}`}>
                    <FaCheckCircle /> Valid format
                  </div>
                  <span className={styles.hintText}>Enter Server IP to check country</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Reason (Optional)</label>
            <div className={styles.inputWrap}>
              <input 
                className={styles.input}
                style={{ paddingLeft: '16px' }}
                placeholder="e.g. New server deployment / Callback migration"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !inputValue}>
              {isSubmitting ? 'Processing...' : (
                <>
                  <FaPaperPlane /> Submit Request (OTP)
                </>
              )}
            </button>
            <p className={styles.hintText} style={{ marginTop: '12px' }}>
              <FaLock style={{ verticalAlign: 'middle', marginRight: '4px' }}/>
              After validation, OTP will be required to submit the request.
            </p>
          </div>
        </form>
      </div>

      <div className={styles.historySection} style={{ padding: 0, border: 'none', boxShadow: 'none', background: 'transparent' }}>
        <AdminTable
          title="YOUR RECENT REQUESTS"
          icon={<FaHistory />}
          columns={tableColumns}
          data={paginatedData}
          renderRow={(item) => (
            <tr key={item.id}>
              <td>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  background: item.type === 'WEBHOOK' ? '#F3E8FF' : '#E0EEFF', 
                  color: item.type === 'WEBHOOK' ? '#7E22CE' : '#0369A1',
                  border: `1px solid ${item.type === 'WEBHOOK' ? '#E9D5FF' : '#BAE6FD'}`
                }}>
                  {item.type}
                </span>
              </td>
              <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.95rem' }}>{item.value}</td>
              <td>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: item.status === 'APPROVED' ? '#DCFCE7' : item.status === 'CANCELLED' ? '#FEE2E2' : '#FFEDD5',
                  color: item.status === 'APPROVED' ? '#15803D' : item.status === 'CANCELLED' ? '#B91C1C' : '#C2410C',
                  border: `1px solid ${item.status === 'APPROVED' ? '#BBF7D0' : item.status === 'CANCELLED' ? '#FECACA' : '#FED7AA'}`
                }}>
                  {item.status}
                </span>
              </td>
              <td>
                <span style={{ 
                  background: '#F8FAFC', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                  fontWeight: 500
                }}>
                  {item.note}
                </span>
              </td>
              <td style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{item.date}</td>
              <td style={{ color: '#94a3b8' }}>—</td>
            </tr>
          )}
          searchQuery={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalEntries={totalEntries}
          totalPages={totalPages}
        />
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {verifySuccess ? (
              <div className={styles.successScreen}>
                <div className={styles.successIconWrap}>
                  <FaCheckCircle className={styles.successIcon} />
                </div>
                <h3 className={styles.modalTitle} style={{ color: '#16a34a' }}>Verification Successful!</h3>
                <p className={styles.modalSubtitle}>Your security configuration has been updated.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Verify OTP</h3>
                <p className={styles.modalSubtitle}>Please enter the OTP sent to your registered mobile number.</p>
                <div className={styles.inputWrap} style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ paddingLeft: '16px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowOtpModal(false)}>Cancel</button>
                  <button 
                    className={styles.submitBtn} 
                    style={{ margin: 0, padding: '10px 24px' }} 
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otp.length < 4}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiWhitelisting;
