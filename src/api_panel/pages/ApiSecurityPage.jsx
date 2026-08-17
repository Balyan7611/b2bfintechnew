import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaShieldAlt, FaSave } from 'react-icons/fa';
import { API } from '../../api/endpoints';
import { resolveMemberId } from '../../utils/memberIdentity';
import styles from '../components/ApiSettings.module.css';

const ApiSecurityPage = () => {
  const { isDarkMode } = useSelector(state => state.memberPanel);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMsg('Please fill all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg('New password and confirm password do not match.');
      return;
    }

    // Fail closed rather than guess at an id — never send a password change
    // for an account we can't positively identify.
    const memberId = await resolveMemberId();
    if (!memberId) {
      setMsg('Unable to verify your account. Please sign out and sign in again.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await API.member.changePassword({
        memberId: parseInt(memberId, 10),
        oldPassword,
        newPassword
      });
      if (res && res.status === false) {
        setMsg(res.mess || res.message || 'Failed to update password.');
      } else {
        setMsg('Password updated successfully.');
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch (err) {
      setMsg(err?.response?.data?.mess || err?.message || 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
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

          <button type="submit" className={styles.saveBtn} disabled={isSaving}>
            <FaSave /> {isSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiSecurityPage;
