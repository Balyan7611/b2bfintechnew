import React, { useState, useRef } from 'react';
import { 
  FiShield, FiLock, FiCheckCircle, FiInfo, FiSmartphone, FiCreditCard, FiUserPlus, FiUsers, FiDollarSign, FiActivity
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';

const ToggleItem = ({ label, stateKey, permissions, handleToggle, disabled = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
     <label className={styles.switch} style={{ margin: 0, transform: 'scale(0.85)', transformOrigin: 'left center' }}>
        <input type="checkbox" checked={permissions[stateKey]} onChange={() => handleToggle(stateKey)} disabled={disabled} />
        <span className={styles.slider}></span>
     </label>
     <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', lineHeight: '1.4' }}>{label}</span>
  </div>
);

const SectionCard = ({ title, icon, children, headerAction }) => (
  <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #F1F5F9' }}>
    <div style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{title}</h3>
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
    <div style={{ padding: '24px' }}>
      {children}
    </div>
  </div>
);

const PermissionSetting = () => {
  const [permissions, setPermissions] = useState({
    twoWayAuthAdmin: true,
    otpLoginAdmin: false,
    tpinLoginAdmin: true,
    systemDown: false,
    googleAuth: true,
    
    addBalanceOtp: false,
    addBalanceTpin: true,
    deductBalanceOtp: false,
    deductBalanceTpin: true,
    
    regOtpVerify: false,
    mailSendReg: false,
    otpSendReg: false,
    mailSendRegOtp: false,
    otpSendRegOtp: true,
    mailSendPassChangeOtp: false,
    otpSendPassChangeOtp: true,
    mailSendTpinChangeOtp: false,
    otpSendTpinChangeOtp: true,
    regPanVerify: false,
    regAadharVerify: false,
    
    workingWithoutKyc: false,
    memberPanelDisable: false,
    
    addBankOtp: false,
    addBankTpin: true,
    
    cashoutOtp: false,
    cashoutTpin: true
  });

  const lastActiveAuth = useRef('tpinLoginAdmin');

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleToggle = (key) => {
    // Define groups of mutually exclusive toggles
    const exclusiveGroups = [
      ['otpLoginAdmin', 'tpinLoginAdmin', 'googleAuth'],
      ['addBalanceOtp', 'addBalanceTpin'],
      ['deductBalanceOtp', 'deductBalanceTpin'],
      ['addBankOtp', 'addBankTpin'],
      ['cashoutOtp', 'cashoutTpin']
    ];

    // Check if the toggled key belongs to any exclusive group
    for (const group of exclusiveGroups) {
      if (group.includes(key)) {
        setPermissions(prev => {
          // If turning ON, turn OFF the others in the group
          if (!prev[key]) {
             if (group.includes('googleAuth')) {
               lastActiveAuth.current = key; // Remember for TwoWayAuth
             }
             const newState = { ...prev };
             group.forEach(k => { newState[k] = (k === key); });
             return newState;
          }
          // If turning OFF, just turn it OFF
          return { ...prev, [key]: false };
        });
        return;
      }
    }
    
    setPermissions(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      // If two way auth is turned off, automatically turn off the child options
      if (key === 'twoWayAuthAdmin') {
        if (!newState.twoWayAuthAdmin) {
          newState.otpLoginAdmin = false;
          newState.tpinLoginAdmin = false;
          newState.googleAuth = false;
        } else {
          // Restore the last active auth option
          newState[lastActiveAuth.current] = true;
        }
      }
      return newState;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }, 1500);
  };

  const saveButton = (
    <button onClick={handleSave} disabled={isSaving} style={{ 
      display: 'flex', alignItems: 'center', gap: '8px', 
      background: isSaving ? '#64748B' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', 
      color: '#fff', border: 'none', borderRadius: '10px', 
      padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700, 
      cursor: isSaving ? 'not-allowed' : 'pointer',
      boxShadow: isSaving ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
      transition: 'all 0.3s ease'
    }}>
      {isSaving ? (
        <FiActivity className="spinner" size={16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <FiCheckCircle size={16} /> 
      )}
      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
    </button>
  );

  return (
    <div className={styles.container} style={{ padding: '20px 20px 100px 20px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh', marginBottom: '60px' }}>
      
      {showToast && (
        <div style={{ 
          position: 'fixed', top: '20px', right: '20px', background: '#22C55E', color: '#fff', 
          padding: '12px 24px', borderRadius: '8px', zIndex: 9999, fontWeight: 700, 
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)', animation: 'slideIn 0.3s ease-out'
        }}>
          Permissions Saved Successfully!
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* ── ADMIN LOGIN PERMISSION ── */}
        <SectionCard title="Admin Login Permission" icon={<FiLock size={16} />} headerAction={saveButton}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
            <ToggleItem label="Two Way Authentication Admin" stateKey="twoWayAuthAdmin" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="OTP Login For Admin Login" stateKey="otpLoginAdmin" permissions={permissions} handleToggle={handleToggle} disabled={!permissions.twoWayAuthAdmin} />
            <ToggleItem label="TPIN Login For Admin Login" stateKey="tpinLoginAdmin" permissions={permissions} handleToggle={handleToggle} disabled={!permissions.twoWayAuthAdmin} />
            <ToggleItem label="System Down" stateKey="systemDown" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Google Auth" stateKey="googleAuth" permissions={permissions} handleToggle={handleToggle} disabled={!permissions.twoWayAuthAdmin} />
          </div>
          
          {permissions.googleAuth && (
            <div style={{ marginTop: '30px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
               <div style={{ width: '150px', height: '150px', background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94A3B8' }}>
                  <FiSmartphone size={32} style={{ marginBottom: '10px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>QR Placeholder</span>
               </div>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Account Name: <span style={{ color: '#0F172A' }}>Admin</span></div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Secret Key: <span style={{ color: '#3B82F6' }}>MFRTQNZYGZSTCMDC</span></div>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#3B82F6', fontSize: '1.1rem', fontWeight: 800 }}>Step 2: Link your device to your account:</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>You have two options to link your device to your account:</p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <strong>Using QR Code:</strong> Select Scan a barcode. If the Authenticator app cannot locate a barcode scanner app on your mobile device, you might be prompted to download and install one. Once the app is installed, reopen Google Authenticator, then point your camera at the QR code on your computer screen.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <strong>Using Secret Key:</strong> Select Enter provided key, then enter account name of your account in the "Enter account name" box. Next, enter the secret key appear on your computer screen in the "Enter your key" box. Make sure you've chosen to make the key Time based, then select Add.
                  </p>
               </div>
            </div>
          )}
        </SectionCard>

        {/* ── ADMIN AMOUNT ADD PERMISSION ── */}
        <SectionCard title="Admin Amount Add Permission" icon={<FiDollarSign size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
            <ToggleItem label="Add Balance OTP" stateKey="addBalanceOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Add Balance TPIN" stateKey="addBalanceTpin" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Deduct Balance OTP" stateKey="deductBalanceOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Deduct Balance TPIN" stateKey="deductBalanceTpin" permissions={permissions} handleToggle={handleToggle} />
          </div>
        </SectionCard>

        {/* ── MEMBER REGISTRATION PERMISSION ── */}
        <SectionCard title="Member Registration Permission" icon={<FiUserPlus size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
            <ToggleItem label="Registration With OTP Verification" stateKey="regOtpVerify" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Mail Send Registration" stateKey="mailSendReg" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="OTP Send Registration" stateKey="otpSendReg" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Mail Send Registration OTP" stateKey="mailSendRegOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="OTP Send Registration OTP" stateKey="otpSendRegOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Mail Send Password ChangeOTP" stateKey="mailSendPassChangeOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="OTP Send Password Change OTP" stateKey="otpSendPassChangeOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Mail Send TPIN Change OTP" stateKey="mailSendTpinChangeOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="OTP Send TPIN Change OTP" stateKey="otpSendTpinChangeOtp" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Registration With Pan Verification" stateKey="regPanVerify" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Registration With Aadhar Verification" stateKey="regAadharVerify" permissions={permissions} handleToggle={handleToggle} />
          </div>
        </SectionCard>

        {/* ── MEMBER PERMISSION ── */}
        <SectionCard title="Member Permission" icon={<FiUsers size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
            <ToggleItem label="Working Without KYC" stateKey="workingWithoutKyc" permissions={permissions} handleToggle={handleToggle} />
            <ToggleItem label="Member Panel Disable" stateKey="memberPanelDisable" permissions={permissions} handleToggle={handleToggle} />
          </div>
        </SectionCard>

        {/* ── GRID ROW: BANK & TRANSACTION ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
           <SectionCard title="Member Bank Add Permission" icon={<FiCreditCard size={16} />}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
               <ToggleItem label="Add Bank With OTP" stateKey="addBankOtp" permissions={permissions} handleToggle={handleToggle} />
               <ToggleItem label="Add Bank With TPIN" stateKey="addBankTpin" permissions={permissions} handleToggle={handleToggle} />
             </div>
           </SectionCard>
           
           <SectionCard title="Member Transaction Permission" icon={<FiActivity size={16} />}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
               <ToggleItem label="Cashout Transaction OTP" stateKey="cashoutOtp" permissions={permissions} handleToggle={handleToggle} />
               <ToggleItem label="Cashout Transaction TPIN" stateKey="cashoutTpin" permissions={permissions} handleToggle={handleToggle} />
             </div>
           </SectionCard>
        </div>

      </div>
    </div>
  );
};

export default PermissionSetting;
