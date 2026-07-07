import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaKey, FaShieldAlt, FaLink, FaNetworkWired, FaSave, 
  FaCopy, FaEye, FaEyeSlash, FaRedoAlt
} from 'react-icons/fa';
import styles from './ApiSettings.module.css';

const ApiSettings = () => {
  const { isDarkMode } = useSelector(state => state.memberPanel);
  const [activeTab, setActiveTab] = useState('ApiCredentials');
  const [showSecret, setShowSecret] = useState(false);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const tabs = [
    { id: 'ApiCredentials', label: 'API Credentials', icon: <FaKey /> },
    { id: 'Webhooks', label: 'Webhook Settings', icon: <FaLink /> },
    { id: 'IPWhitelist', label: 'IP Whitelisting', icon: <FaNetworkWired /> },
    { id: 'Security', label: 'Security', icon: <FaShieldAlt /> }
  ];

  return (
    <div className={`${styles.settingsContainer} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.settingsCard}>
        {/* Sidebar Navigation */}
        <div className={styles.sidebar}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          
          {activeTab === 'ApiCredentials' && (
            <div>
              <div className={styles.sectionTitle}>
                <div className={styles.sectionIcon}><FaKey /></div>
                <div>
                  <h2>API Credentials</h2>
                  <p>Use these keys to authenticate your API requests. Keep your secret key safe.</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Merchant ID (Member ID)</label>
                <div className={styles.inputWrapper}>
                  <input type="text" className={styles.inputField} value="RT1236" readOnly />
                  <button className={`${styles.actionBtn} ${styles.copyBtn}`} onClick={() => copyToClipboard('RT1236')}>
                    <FaCopy /> Copy
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>API Token / Access Key</label>
                <div className={styles.inputWrapper}>
                  <input type="text" className={styles.inputField} value="dpay_live_8f7d6a5s4d3f2g1h" readOnly />
                  <button className={`${styles.actionBtn} ${styles.copyBtn}`} onClick={() => copyToClipboard('dpay_live_8f7d6a5s4d3f2g1h')}>
                    <FaCopy /> Copy
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>API Secret Key</label>
                <div className={styles.inputWrapper}>
                  <input 
                    type={showSecret ? "text" : "password"} 
                    className={styles.inputField} 
                    value="sec_9k8j7h6g5f4d3s2a1q" 
                    readOnly 
                  />
                  <button className={`${styles.actionBtn} ${styles.hideBtn}`} onClick={() => setShowSecret(!showSecret)}>
                    {showSecret ? <><FaEyeSlash /> Hide</> : <><FaEye /> View</>}
                  </button>
                  <button className={`${styles.actionBtn} ${styles.copyBtn}`} onClick={() => copyToClipboard('sec_9k8j7h6g5f4d3s2a1q')}>
                    <FaCopy /> Copy
                  </button>
                </div>
              </div>

              <button className={styles.dangerBtn}>
                <FaRedoAlt /> Roll API Keys (Generate New)
              </button>
            </div>
          )}

          {activeTab === 'Webhooks' && (
            <div>
              <div className={styles.sectionTitle}>
                <div className={styles.sectionIcon}><FaLink /></div>
                <div>
                  <h2>Webhook Settings</h2>
                  <p>Configure URLs to receive real-time updates for transactions.</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Transaction Callback URL (Success/Fail/Pending)</label>
                <input 
                  type="url" 
                  className={styles.inputField} 
                  placeholder="https://yourwebsite.com/api/dpay-callback"
                  defaultValue="https://mysite.com/webhook/recharge"
                />
              </div>
              <button className={styles.saveBtn}><FaSave /> Save Webhook URL</button>
            </div>
          )}

          {activeTab === 'IPWhitelist' && (
            <div>
              <div className={styles.sectionTitle}>
                <div className={styles.sectionIcon}><FaNetworkWired /></div>
                <div>
                  <h2>IP Whitelisting</h2>
                  <p>Restrict API access to specific IP addresses for enhanced security.</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Allowed IP Addresses (Comma separated)</label>
                <textarea 
                  className={styles.inputField}
                  placeholder="e.g. 192.168.1.1, 203.0.113.50"
                  defaultValue="203.0.113.45"
                />
              </div>
              <button className={styles.saveBtn}><FaSave /> Save IP Rules</button>
            </div>
          )}

          {activeTab === 'Security' && (
            <div>
              <div className={styles.sectionTitle}>
                <div className={styles.sectionIcon}><FaShieldAlt /></div>
                <div>
                  <h2>Security</h2>
                  <p>Change your dashboard login password.</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Old Password</label>
                <input type="password" className={styles.inputField} placeholder="Enter current password" />
              </div>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input type="password" className={styles.inputField} placeholder="Enter new password" />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input type="password" className={styles.inputField} placeholder="Re-enter new password" />
              </div>
              <button className={styles.saveBtn}><FaSave /> Update Password</button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
