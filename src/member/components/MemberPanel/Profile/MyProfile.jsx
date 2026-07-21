import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import html2canvas from 'html2canvas';
import { 
  FaUser, FaKey, FaShieldAlt, FaIdCard, FaUniversity, FaImages, FaTools, 
  FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle,
  FaSave, FaUserEdit, FaTimes, FaCrop, FaArrowsAlt, FaCertificate, FaDownload
} from 'react-icons/fa';
import styles from './MyProfile.module.css';

const MyProfile = () => {
  const { isDarkMode } = useSelector(state => state.memberPanel);
  const [activeTab, setActiveTab] = useState('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImg, setProfileImg] = useState(""); // ✅ removed dummy image – empty by default
  
  // Modal & File States
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImg, setTempImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  // ✅ All profile fields start empty
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile: '',
    email: '',
    aadhar: '',
    pan: '',
    shopName: '',
    state: '',
    city: '',
    pincode: ''
  });

  // Reset Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Reset Pin State
  const [pinData, setPinData] = useState({
    oldPin: '',
    newPin: '',
    confirmPin: ''
  });

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImg(event.target.result);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag Logic
  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    // In a real production app, we would use a canvas to crop the image based on x, y, and zoom.
    // For this UI demonstration, we simulate by saving the result.
    setProfileImg(tempImg);
    setShowCropModal(false);
  };

  const tabs = [
    { id: 'Profile', label: 'Profile', icon: <FaUser /> },
    { id: 'ResetPassword', label: 'Reset Password', icon: <FaKey /> },
    { id: 'ResetPin', label: 'Reset Pin', icon: <FaShieldAlt /> },
    { id: 'KYC', label: 'KYC', icon: <FaIdCard /> },
    { id: 'AccountDetails', label: 'Account Details', icon: <FaUniversity /> },
    { id: 'Gallery', label: 'Gallery', icon: <FaImages /> },
    { id: 'MyService', label: 'My Service', icon: <FaTools /> }
  ];

  return (
    <div 
      className={`${styles.profilePage} ${isDarkMode ? styles.dark : ''}`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />

      {showCropModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModal} onMouseUp={onMouseUp}>
            <div className={styles.modalHeader}>
              <h3><FaCrop /> Edit Profile Picture</h3>
              <button className={styles.closeBtn} onClick={() => setShowCropModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.cropArea}>
              <div 
                className={styles.cropCircle} 
                onMouseDown={onMouseDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <img 
                  src={tempImg} 
                  alt="Crop Preview" 
                  style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    pointerEvents: 'none'
                  }}
                />
                <div className={styles.dragIndicator}><FaArrowsAlt /></div>
              </div>
            </div>
            <div className={styles.cropControls}>
              <div className={styles.controlHeader}>
                <label>Zoom Level</label>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.01" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <p className={styles.hintText}>Click and drag image to position</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowCropModal(false)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={handleSaveCrop}>Apply Image</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.profileHeader}>
        <div className={styles.headerCover}></div>
        <div className={styles.headerContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <img 
                src={profileImg || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} 
                alt="Profile" 
                className={styles.profileImg}
                style={profileImg === tempImg ? {
                  transform: `translate(${position.x/2}px, ${position.y/2}px) scale(${zoom})`,
                  width: '100%', height: '100%', objectFit: 'cover'
                } : {}}
              />
              <button className={styles.cameraBtn} onClick={handleCameraClick} title="Change Photo">
                <FaCamera />
              </button>
            </div>
            <div className={styles.userBasicInfo}>
              <h1>{formData.name || 'Member'}</h1>
              <p>Retailer (RT1236)</p>
              <div className={styles.statusBadge}>
                <FaCheckCircle /> Verified Merchant
              </div>
            </div>
          </div>
          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Registration Status</span>
              <span className={`${styles.statValue} ${styles.successText}`}>Verified</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Account Type</span>
              <span className={styles.statValue}>Retailer</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <nav className={styles.tabsNav}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.tabContent}>
            {activeTab === 'Profile' && (
              <div className={styles.detailsGrid}>
                <div className={styles.gridHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaUserEdit className={styles.titleIcon} />
                    <h2>Personal Information</h2>
                  </div>
                  <div className={styles.headerActions}>
                    {!isEditing ? (
                      <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                        <FaTools /> Edit Profile
                      </button>
                    ) : (
                      <button className={styles.saveBtn} onClick={() => setIsEditing(false)}>
                        <FaSave /> Save Changes
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.infoTable}>
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className={styles.tableRow}>
                      <label className={styles.label}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name={key}
                          value={value}
                          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                          className={styles.editInput}
                        />
                      ) : (
                        <span className={styles.value}>{value || '—'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'ResetPassword' && (
              <div className={styles.resetSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaKey className={styles.titleIcon} />
                    <div>
                      <h2>Change Password</h2>
                      <p className={styles.sectionSub}>Manage your account security</p>
                    </div>
                  </div>
                </div>

                <div className={styles.resetForm}>
                  <div className={styles.inputGroup}>
                    <label>Old Password</label>
                    <div className={styles.inputWrapper}>
                      <FaShieldAlt className={styles.inputIcon} />
                      <input 
                        type="password" 
                        placeholder="Enter current password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>New Password</label>
                    <div className={styles.inputWrapper}>
                      <FaKey className={styles.inputIcon} />
                      <input 
                        type="password" 
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Confirm New Password</label>
                    <div className={styles.inputWrapper}>
                      <FaCheckCircle className={styles.inputIcon} />
                      <input 
                        type="password" 
                        placeholder="Re-enter new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button className={styles.submitBtn}>
                      <FaSave /> Update Password
                    </button>
                    <button className={styles.clearBtn} onClick={() => setPasswordData({oldPassword:'', newPassword:'', confirmPassword:''})}>
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ResetPin' && (
              <div className={styles.resetSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaShieldAlt className={styles.titleIcon} />
                    <div>
                      <h2>Change Transaction Pin</h2>
                      <p className={styles.sectionSub}>Update your 4-digit transaction pin</p>
                    </div>
                  </div>
                </div>

                <div className={styles.resetForm}>
                  <div className={styles.inputGroup}>
                    <label>Old Pin</label>
                    <div className={styles.inputWrapper}>
                      <FaShieldAlt className={styles.inputIcon} />
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="Enter current 4-digit pin"
                        value={pinData.oldPin}
                        onChange={(e) => setPinData({...pinData, oldPin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>New Pin</label>
                    <div className={styles.inputWrapper}>
                      <FaShieldAlt className={styles.inputIcon} />
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="Enter new 4-digit pin"
                        value={pinData.newPin}
                        onChange={(e) => setPinData({...pinData, newPin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Confirm New Pin</label>
                    <div className={styles.inputWrapper}>
                      <FaCheckCircle className={styles.inputIcon} />
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="Re-enter new 4-digit pin"
                        value={pinData.confirmPin}
                        onChange={(e) => setPinData({...pinData, confirmPin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button className={styles.submitBtn}>
                      <FaSave /> Update Pin
                    </button>
                    <button className={styles.clearBtn} onClick={() => setPinData({oldPin:'', newPin:'', confirmPin:''})}>
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab !== 'Profile' && activeTab !== 'ResetPassword' && activeTab !== 'ResetPin' && (
              <div className={styles.placeholder}>
                <FaExclamationTriangle />
                <h3>{activeTab} Module</h3>
                <p>This section is currently under maintenance or being updated with new features.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;