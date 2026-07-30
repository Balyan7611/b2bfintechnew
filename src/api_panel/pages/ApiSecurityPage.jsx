import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaShieldAlt, FaSave } from 'react-icons/fa';
import styles from '../components/ApiSettings.module.css';

const ApiSecurityPage = () => {
  const { isDarkMode } = useSelector(state => state.memberPanel);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMsg('Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg('New password and confirm password do not match.');
      return;
    }
    // TODO: wire to real change-password API
    setMsg('Password updated successfully.');
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className={`${styles.settingsContainer} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.pageCard}>
        <div className={styles.sectionTitle}>
          <div className={styles.sectionIcon}><FaShieldAlt /></div>
          <div>
            <h2>Security</h2>
            <p>Change your dashboard login password.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Old Password</label>
            <input type="password" className={styles.inputField} placeholder="Enter current password"
              value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>New Password</label>
            <input type="password" className={styles.inputField} placeholder="Enter new password"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <input type="password" className={styles.inputField} placeholder="Re-enter new password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem',
              background: msg.includes('successfully') ? '#f0fdf4' : '#fef2f2',
              color: msg.includes('successfully') ? '#16a34a' : '#ef4444',
              border: `1px solid ${msg.includes('successfully') ? '#bbf7d0' : '#fca5a5'}` }}>
              {msg}
            </div>
          )}

          <button type="submit" className={styles.saveBtn}><FaSave /> Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ApiSecurityPage;
