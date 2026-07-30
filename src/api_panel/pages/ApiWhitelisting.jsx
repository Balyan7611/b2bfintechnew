import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaServer, FaCheckCircle, FaExclamationTriangle, FaPaperPlane, FaLock, FaGlobe, FaNetworkWired, FaHistory, FaTrash, FaToggleOn, FaToggleOff, FaTimes } from 'react-icons/fa';
import AdminTable from '../../shared/components/common/AdminTable';
import { API } from '../../api/endpoints';
import { getSession } from '../../utils/authUtils';
import styles from './ApiWhitelisting.module.css';

const ApiWhitelisting = () => {
  const [inputValue, setInputValue] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalError, setModalError] = useState('');

  const [ipList, setIpList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const session = getSession();
  const currentUserId = session?.userId || session?.msrno || 2;

  const fetchIpList = async () => {
    setLoadingList(true);
    try {
      const res = await API.ipAuthanticate.getAll({ userId: currentUserId > 0 ? currentUserId : '' });
      const data = res?.data?.items || res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      setIpList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch IP whitelist:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchIpList();
  }, []);

  // STEP 1: Send OTP for IP Whitelisting
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setErrorMessage('');
    setModalError('');
    setIsSubmitting(true);

    try {
      const payload = {
        userId: Number(currentUserId) || 2,
        ip: inputValue.trim()
      };

      const res = await API.ipAuthanticate.sendIpWhitelistOtp(payload);
      
      if (res?.status === false) {
        setErrorMessage(res?.message || 'This IP address is already whitelisted.');
        return;
      }

      if (res?.status === true || res?.data) {
        const token = res?.data?.token || res?.token || res?.data;
        if (!token) throw new Error('OTP Token missing from server response');
        
        setOtpToken(token);
        setOtp('');
        setModalError('');
        setVerifySuccess(false);
        setShowOtpModal(true);
      } else {
        throw new Error(res?.message || 'Failed to send OTP for IP Whitelisting');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP for IP Whitelisting');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP & Save IP to DB (Category 18 Notification)
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setModalError('Please enter OTP');
      return;
    }
    setModalError('');
    setIsVerifying(true);

    try {
      const payload = {
        token: otpToken,
        otp: otp.trim(),
        ip: inputValue.trim(),
        userId: Number(currentUserId) || 2
      };

      const res = await API.ipAuthanticate.verifyAndWhitelistIp(payload);

      if (res?.status === true || res?.data === true) {
        setVerifySuccess(true);
        await fetchIpList();
        
        setTimeout(() => {
          setShowOtpModal(false);
          setVerifySuccess(false);
          setInputValue('');
          setReason('');
          setOtp('');
          setOtpToken('');
        }, 2000);
      } else {
        setModalError(res?.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setModalError(err.message || 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const updatedPayload = {
        id: item.id || item.Id,
        msrno: item.msrno || item.Msrno || Number(currentUserId) || 2,
        ip: item.ip || item.IP,
        token: item.token || item.Token || 'IP_TOKEN',
        isActive: !(item.isActive ?? item.IsActive),
        userId: item.userId || item.UserId || Number(currentUserId) || 2
      };
      await API.ipAuthanticate.update(updatedPayload);
      await fetchIpList();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this IP entry?')) return;
    try {
      const res = await API.ipAuthanticate.delete(id);
      if (res?.status === false) {
        alert(res?.message || 'Failed to delete entry. The server returned an error.');
      } else {
        alert(res?.message || 'IP entry deleted successfully.');
        await fetchIpList();
      }
    } catch (err) {
      alert('Failed to delete entry: ' + err.message);
    }
  };

  const filteredHistory = ipList.filter(item => {
    const val = String(item.ip || item.IP || '').toLowerCase();
    return val.includes(searchQuery.toLowerCase());
  });

  const totalEntries = filteredHistory.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const paginatedData = filteredHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const tableColumns = [
    'IP ADDRESS', 'STATUS', 'USER ID', 'DATE ADDED', 'ACTION'
  ];

  return (
    <div className={styles.container}>


      <div className={styles.formSection}>
        <div className={styles.policyAlert}>
          <div className={styles.policyTitle}>
            <FaExclamationTriangle /> Security Policy:
          </div>
          <ul className={styles.policyList}>
            <li>IP Whitelisting requires 2-Step OTP Verification for security.</li>
            <li>Step 1 sends an OTP to your registered mobile. Duplicate IPs are automatically blocked.</li>
            <li>Step 2 verifies the OTP, registers the IP in DB, and sends Category 18 Security Notification.</li>
          </ul>
        </div>

        {errorMessage && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #FCA5A5', fontWeight: 600 }}>
            <FaExclamationTriangle /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>IP Address</label>
            <div className={styles.inputWrap}>
              <div className={styles.iconWrap}>
                <FaNetworkWired />
              </div>
              <input 
                className={styles.input}
                placeholder="e.g. 48.43.181.120"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
              />
            </div>
            {inputValue && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={`${styles.statusIndicator} ${styles.valid}`}>
                  <FaCheckCircle /> Valid IP Format
                </div>
                <span className={styles.hintText}>Enter Server IP to Whitelist</span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Reason / Remarks</label>
            <textarea 
              className={styles.textarea}
              placeholder="e.g. Production API Gateway server IP"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.submitWrap} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={isSubmitting || !inputValue.trim()}
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP & Whitelist IP'} <FaPaperPlane />
            </button>
            <p className={styles.helpText}>
              <FaLock /> Automated 2-Step OTP Security Active
            </p>
          </div>
        </form>
      </div>

      <div className={styles.historySection} style={{ padding: 0, border: 'none', boxShadow: 'none', background: 'transparent' }}>
        <AdminTable
          title="YOUR WHITELISTED IPS"
          icon={<FaHistory />}
          columns={tableColumns}
          data={paginatedData}
          renderRow={(item) => {
            const isAct = item.isActive ?? item.IsActive;
            const itemIp = item.ip || item.IP;
            const itemId = item.id || item.Id;
            const itemDate = item.addDate || item.AddDate || '—';
            return (
              <tr key={itemId || itemIp}>
                <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.95rem' }}>{itemIp}</td>
                <td>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: isAct ? '#DCFCE7' : '#FEE2E2',
                    color: isAct ? '#15803D' : '#B91C1C',
                    border: `1px solid ${isAct ? '#BBF7D0' : '#FECACA'}`
                  }}>
                    {isAct ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#475569' }}>{item.userId || item.UserId || currentUserId}</td>
                <td style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  {typeof itemDate === 'string' && itemDate.includes('T') ? itemDate.replace('T', ' ').split('.')[0] : itemDate}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      title={isAct ? "Deactivate" : "Activate"}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isAct ? '#16a34a' : '#94a3b8' }}
                    >
                      {isAct ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button 
                      onClick={() => handleDelete(itemId)}
                      title="Delete IP"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#ef4444' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
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
        <div className={styles.modalOverlay} onClick={() => !isVerifying && setShowOtpModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowOtpModal(false)}><FaTimes /></button>

            {verifySuccess ? (
              <div className={styles.successScreen}>
                <div className={styles.successIconWrap}>
                  <FaCheckCircle className={styles.successIcon} />
                </div>
                <h3 className={styles.modalTitle} style={{ color: '#16a34a' }}>IP Whitelisted Successfully!</h3>
                <p className={styles.modalSubtitle}>IP address <strong>{inputValue}</strong> has been registered and activated for your account.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Verify OTP for Whitelisting</h3>
                <p className={styles.modalSubtitle}>
                  Please enter the OTP sent to your registered mobile number for IP: <strong>{inputValue}</strong>
                </p>

                <div className={styles.inputWrap} style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ paddingLeft: '16px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {modalError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                    <FaExclamationTriangle /> {modalError}
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowOtpModal(false)}>Cancel</button>
                  <button 
                    className={styles.submitBtn} 
                    style={{ margin: 0, padding: '10px 24px' }} 
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || !otp.trim()}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify OTP & Whitelist'}
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
