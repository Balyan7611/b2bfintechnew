import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaKey, FaCopy, FaEye, FaEyeSlash, FaRedoAlt, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';
import { API } from '../../api/endpoints';
import styles from '../components/ApiSettings.module.css';

const ApiCredentials = ({ compact = false }) => {
  const { isDarkMode } = useSelector(state => state.memberPanel);
  const [showSecret, setShowSecret] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [credError, setCredError] = useState('');

  const [otpModal, setOtpModal] = useState({ open: false, mode: null });
  const [otpToken, setOtpToken] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const startOtpFlow = async (mode) => {
    setCredError('');
    setOtpError('');
    setSendingOtp(true);
    try {
      const res = await API.clientCredential.sendOtp();
      const token = res?.data?.token || (typeof res?.data === 'string' ? res.data : null) || res?.token;
      if (!token) throw new Error('OTP token missing from server response');
      setOtpToken(token);
      setOtpValue('');
      setOtpModal({ open: true, mode });
    } catch (err) {
      setCredError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const closeOtpModal = () => {
    setOtpModal({ open: false, mode: null });
    setOtpToken('');
    setOtpValue('');
    setOtpError('');
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otpValue.trim()) { setOtpError('Please enter the OTP'); return; }
    setVerifyingOtp(true);
    try {
      if (otpModal.mode === 'create') {
        const res = await API.clientCredential.createWithOtp({ token: otpToken, otp: otpValue });
        if (res?.status === false) throw new Error(res.mess || 'Failed to create credential');
        const data = res?.data || {};
        const newClientId = data.clientId || data.client_id || data.id || '';
        const newSecret = data.clientSecret || data.client_secret || data.secret || '';
        if (newClientId) setClientId(newClientId);
        if (newSecret) { setClientSecret(newSecret); setShowSecret(true); }
      } else if (otpModal.mode === 'reveal') {
        const res = await API.clientCredential.revealSecretWithOtp({ token: otpToken, otp: otpValue });
        if (res?.status === false) throw new Error(res.mess || 'Failed to reveal secret');
        const secretValue = (typeof res?.data === 'string' ? res.data : null)
          || res?.data?.clientSecret || res?.data?.secret || '';
        if (secretValue) { setClientSecret(secretValue); setShowSecret(true); }
      }
      closeOtpModal();
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleViewSecretClick = () => {
    if (clientSecret) { setShowSecret(v => !v); } else { startOtpFlow('reveal'); }
  };

  return (
    <div className={`${styles.settingsContainer} ${isDarkMode ? styles.dark : ''}`} style={compact ? { padding: 0 } : undefined}>
      <div className={styles.pageCard} style={compact ? { padding: 0, maxWidth: '100%', boxShadow: 'none', border: 'none' } : undefined}>
        <div className={styles.sectionTitle} style={compact ? { marginBottom: '22px', paddingBottom: '16px' } : undefined}>
          <div
            className={styles.sectionIcon}
            style={compact ? { width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', padding: 0, flexShrink: 0 } : undefined}
          >
            <FaKey />
          </div>
          <div>
            <h2 style={compact ? { fontSize: '1.05rem', letterSpacing: '-0.01em' } : undefined}>API Credentials</h2>
            <p>Use these keys to authenticate your API requests. Keep your secret key safe.</p>
          </div>
        </div>

        {credError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '15px', fontSize: '0.85rem' }}>
            <FaExclamationTriangle /> {credError}
          </div>
        )}

        <div className={styles.formGroup}>
          <label>API Client ID</label>
          <div className={styles.inputWrapper}>
            <input type="text" className={styles.inputField} value={clientId || 'No credential generated yet'} readOnly />
            <button className={`${styles.actionBtn} ${styles.copyBtn}`} onClick={() => clientId && copyToClipboard(clientId)} disabled={!clientId}>
              <FaCopy /> Copy
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>API Client Secret</label>
          <div className={styles.inputWrapper}>
            <input type={showSecret ? 'text' : 'password'} className={styles.inputField} value={clientSecret || '••••••••••••••••'} readOnly />
            <button className={`${styles.actionBtn} ${styles.hideBtn}`} onClick={handleViewSecretClick} disabled={sendingOtp}>
              {sendingOtp && otpModal.mode !== 'create' ? 'Sending OTP...' : showSecret ? <><FaEyeSlash /> Hide</> : <><FaEye /> View</>}
            </button>
            <button className={`${styles.actionBtn} ${styles.copyBtn}`} onClick={() => clientSecret && copyToClipboard(clientSecret)} disabled={!clientSecret}>
              <FaCopy /> Copy
            </button>
          </div>
        </div>

        <button className={styles.dangerBtn} onClick={() => startOtpFlow('create')} disabled={sendingOtp}>
          <FaRedoAlt /> {sendingOtp && otpModal.mode !== 'reveal' ? 'Sending OTP...' : 'Roll API Keys (Generate New)'}
        </button>
      </div>

      {otpModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeOtpModal}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={closeOtpModal} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}>
              <FaTimes />
            </button>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {otpModal.mode === 'create' ? 'Verify OTP to Generate New Credential' : 'Verify OTP to Reveal Secret'}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: '#64748b' }}>
              Enter the OTP sent to your registered mobile/email.
            </p>
            <form onSubmit={submitOtp}>
              <input type="text" inputMode="numeric" autoFocus placeholder="Enter OTP" value={otpValue}
                onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', marginBottom: '14px' }}
              />
              {otpModal.mode === 'create' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.78rem' }}>
                  <FaExclamationTriangle style={{ marginTop: '2px', flexShrink: 0 }} />
                  Generating a new credential will replace your current API Client ID/Secret. Any integration using the old ones will stop working.
                </div>
              )}
              {otpError && <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '14px' }}>{otpError}</div>}
              <button type="submit" className={styles.dangerBtn} style={{ width: '100%', justifyContent: 'center' }} disabled={verifyingOtp}>
                {verifyingOtp ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiCredentials;
