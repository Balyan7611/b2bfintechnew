import React, { useEffect, useState, useRef } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaUserShield, FaMobileAlt, FaIdCard, FaLock,
  FaEye, FaEyeSlash, FaCheck, FaUserPlus
} from 'react-icons/fa';
import {
  updateStaffForm,
  resetStaffForm,
  addStaff
} from '../../../store/slices/memberSlice';
import styles from './MemberPages.module.css';

const StaffRegistration = () => {
  const dispatch = useDispatch();
  const { staffForm } = useSelector((s) => s.member);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const actionTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (actionTimerRef.current) clearTimeout(actionTimerRef.current); };
  }, []);
  const [successData, setSuccessData] = useState(null);
  const [errors, setErrors] = useState({});

    const roleRef = useRef(null);
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const passwordRef = useRef(null);

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;

        if (name === 'mobile') {
      value = value.replace(/\D/g, '').slice(0, 10);     } else if (name === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);     } else if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);     } else if (name === 'loginPin') {
      value = value.replace(/\D/g, '').slice(0, 6);     } else if (name === 'pan') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);     }

    dispatch(updateStaffForm({ [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSave = () => {
    const newErrors = {};
    let firstErrorRef = null;

    if (!staffForm.role) {
      newErrors.role = true;
      if (!firstErrorRef) firstErrorRef = roleRef;
    }
    if (!staffForm.name || staffForm.name.trim() === '') {
      newErrors.name = true;
      if (!firstErrorRef) firstErrorRef = nameRef;
    }
    if (!staffForm.mobile || staffForm.mobile.trim() === '') {
      newErrors.mobile = true;
      if (!firstErrorRef) firstErrorRef = mobileRef;
    }
    if (!staffForm.password || staffForm.password.trim() === '') {
      newErrors.password = true;
      if (!firstErrorRef) firstErrorRef = passwordRef;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstErrorRef && firstErrorRef.current) {
        firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorRef.current.focus();
      }
      return;
    }

    setIsLoading(true);
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      const newStaff = {
        ...staffForm,
        memberId: staffForm.loginId || 'EMP' + Math.floor(1000 + Math.random() * 9000),
        doj: new Date().toLocaleDateString('en-GB')
      };
      dispatch(addStaff(newStaff));
      setIsLoading(false);
      dispatch(resetStaffForm());
      setErrors({});
      setSuccessData(newStaff);
      setShowSuccessModal(true);
    }, 600);
  };

  const resetForm = () => {
    dispatch(resetStaffForm());
    setErrors({});
  };

    const getInputStyle = (isError) => ({
    height: '48px',
    border: isError ? '1.5px solid #E53E3E' : '1.5px solid #E2E8F0',
    background: '#F8FAFF',
    borderRadius: '10px',
    padding: '0 16px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  });

  return (
    <div className={styles.container}>
      
      <div className={styles.cardFullMobile} style={{ padding: '40px', background: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #EEF3FC' }}>

                <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1.5px dashed #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(23,86,170,0.08)', color: '#1756AA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaUserShield />
            </div>
            <h3 style={{ margin: 0, color: '#0D1B3E', fontSize: '1.1rem', fontWeight: 700 }}>Role & Identity</h3>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>System Role <span style={{ color: '#E53E3E' }}>*</span></label>
              <select
                name="role"
                ref={roleRef}
                value={staffForm.role || ''}
                onChange={handleInputChange}
                style={getInputStyle(errors.role)}
              >
                <option value="">Select Role</option>
                <option value="Admin">Super Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Operations Staff</option>
              </select>
              {errors.role && <span style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '4px' }}>Please select a role</span>}
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Employee Name <span style={{ color: '#E53E3E' }}>*</span></label>
              <input
                type="text"
                name="name"
                ref={nameRef}
                value={staffForm.name || ''}
                onChange={handleInputChange}
                placeholder="Full Name"
                style={getInputStyle(errors.name)}
              />
              {errors.name && <span style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '4px' }}>Name is required</span>}
            </div>
          </div>
          <div className={styles.gridTwo} style={{ marginTop: '20px' }}>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Assigned Login ID</label>
              <input type="text" value={staffForm.loginId || 'EMP-XXXX'} readOnly style={{ ...getInputStyle(false), background: '#F1F5F9', color: '#718096', fontWeight: 700, cursor: 'not-allowed' }} />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Date of Birth</label>
              <input type="date" name="dob" value={staffForm.dob || ''} onChange={handleInputChange} style={getInputStyle(false)} />
            </div>
          </div>
        </div>

                <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1.5px dashed #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.08)', color: '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaMobileAlt />
            </div>
            <h3 style={{ margin: 0, color: '#0D1B3E', fontSize: '1.1rem', fontWeight: 700 }}>Contact & Location</h3>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Mobile Number <span style={{ color: '#E53E3E' }}>*</span></label>
              <input
                type="text"
                name="mobile"
                ref={mobileRef}
                value={staffForm.mobile || ''}
                onChange={handleInputChange}
                placeholder="+91 XXXX"
                style={getInputStyle(errors.mobile)}
              />
              {errors.mobile && <span style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '4px' }}>Mobile number is required</span>}
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Email Address</label>
              <input type="email" name="email" value={staffForm.email || ''} onChange={handleInputChange} placeholder="work@company.com" style={getInputStyle(false)} />
            </div>
          </div>
          <div className={styles.formGroupFull} style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Residential Address</label>
            <textarea
              name="address"
              value={staffForm.address || ''} onChange={handleInputChange} placeholder="Complete address..."
              style={{ ...getInputStyle(false), height: 'auto', minHeight: '80px', padding: '16px', fontFamily: 'inherit' }}
            />
          </div>
        </div>

                <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1.5px dashed #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(234, 162, 31, 0.08)', color: '#EAA21F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaIdCard />
            </div>
            <h3 style={{ margin: 0, color: '#0D1B3E', fontSize: '1.1rem', fontWeight: 700 }}>Verification Details</h3>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>PAN Number</label>
              <input type="text" name="pan" value={staffForm.pan || ''} onChange={handleInputChange} placeholder="ABCDE1234F" style={{ ...getInputStyle(false), textTransform: 'uppercase' }} />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Aadhar Number</label>
              <input type="text" name="aadhar" value={staffForm.aadhar || ''} onChange={handleInputChange} placeholder="XXXX XXXX XXXX" style={getInputStyle(false)} />
            </div>
          </div>
          <div className={styles.formGroup} style={{ marginTop: '20px', width: '50%' }}>
            <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Pincode</label>
            <input type="text" name="pincode" value={staffForm.pincode || ''} onChange={handleInputChange} placeholder="6 Digit Code" style={getInputStyle(false)} />
          </div>
        </div>

                <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1.5px dashed #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(229, 62, 62, 0.08)', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaLock />
            </div>
            <h3 style={{ margin: 0, color: '#0D1B3E', fontSize: '1.1rem', fontWeight: 700 }}>Security & Access</h3>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Portal Password <span style={{ color: '#E53E3E' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  ref={passwordRef}
                  value={staffForm.password || ''}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  style={getInputStyle(errors.password)}
                />
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#A0AEC0' }} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {errors.password && <span style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '4px' }}>Password is required</span>}
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Login PIN (6 Digits)</label>
              <input type="password" name="loginPin" value={staffForm.loginPin || ''} onChange={handleInputChange} autoComplete="new-password" style={{ ...getInputStyle(false), letterSpacing: '0.2em' }} />
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '15px 20px', background: 'rgba(23,86,170,0.03)', borderRadius: '10px', border: '1px solid #EEF3FC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0D1B3E' }}>Account Active Status</div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>Toggle to activate or restrict account access</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" name="active" checked={staffForm.active ?? true} onChange={handleInputChange} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

                <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '2px solid #EEF3FC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <button
            onClick={resetForm}
            style={{ padding: '12px 24px', background: '#F1F5F9', border: 'none', borderRadius: '10px', color: '#4E6080', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
          >
            Reset Form
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{ padding: '12px 32px', background: '#1756AA', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(23,86,170,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isLoading ? <div className={styles.spinner}></div> : <><FaCheck /> Register Staff</>}
          </button>
        </div>

                <div style={{ height: '40px' }}></div>
      </div>

            {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.deleteModal} style={{ background: '#fff', borderRadius: '24px', padding: '30px', textAlign: 'center', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%', background: '#E6F4EA', color: '#27AE60',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px'
            }}>
              <FaCheck />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#0D1B3E', margin: '0 0 10px 0', fontWeight: 800 }}>Success!</h3>
            <div style={{ background: '#F8FAFF', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #EEF3FC' }}>
              <p style={{ margin: '0 0 8px 0', color: '#4E6080', fontSize: '0.9rem' }}>
                <strong>{successData?.name}</strong> registered as <strong>{successData?.role}</strong>
              </p>
              <div style={{ color: '#1756AA', fontSize: '1.1rem', fontWeight: 800 }}>ID: {successData?.memberId}</div>
            </div>
            <button
              style={{ width: '100%', padding: '12px', background: '#27AE60', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => setShowSuccessModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRegistration;
