import React, { useState, useEffect, useRef } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowRight,
  FaSearch, FaShieldAlt
} from 'react-icons/fa';
import { updateChangePassword } from '../../../store/slices/memberSlice';
import styles from './MemberPages.module.css';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { changePassword } = useSelector((s) => s.member);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [passError, setPassError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminTpin, setAdminTpin] = useState(['', '', '', '']);
  const [adminTpinError, setAdminTpinError] = useState('');
  const [isSuggestedActive, setIsSuggestedActive] = useState(false);

  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);

  const adminTpinRefs = useRef([]);

  // Clear form on mount to prevent any stale state
  useEffect(() => {
    dispatch(updateChangePassword({ newPass: '', confirmPass: '', member: '' }));
  }, [dispatch]);

  // Reset Admin TPIN when modal opens
  useEffect(() => {
    if (showConfirmModal) {
      setAdminTpin(['', '', '', '']);
      setAdminTpinError('');
    }
  }, [showConfirmModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateChangePassword({ [name]: value }));
  };

  const getStrength = (pass) => {
    if (!pass) return '';
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[@#$&!]/.test(pass)) score++;
    
    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  };

  const strength = getStrength(changePassword.newPass);

  const suggestStrongPassword = () => {
    if (!changePassword.member) {
      setMemberError('Please select a member first!');
      return;
    }
    setMemberError('');
    setPassError('');

    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    const lowercaseConsonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'AEIOU';
    const lowercaseVowels = 'aeiou';
    const specialChars = '@#$&!';
    const digitsPool = '0123456789';

    // 4 letters (Alternating consonant/vowel structure to keep it memorable but secure)
    const part1 = consonants[Math.floor(Math.random() * consonants.length)] + 
                  lowercaseVowels[Math.floor(Math.random() * lowercaseVowels.length)] + 
                  lowercaseConsonants[Math.floor(Math.random() * lowercaseConsonants.length)] + 
                  lowercaseVowels[Math.floor(Math.random() * lowercaseVowels.length)];
    
    // 2 special characters
    const part2 = specialChars[Math.floor(Math.random() * specialChars.length)] + 
                  specialChars[Math.floor(Math.random() * specialChars.length)];

    // 4 random digits
    let part3 = '';
    for (let i = 0; i < 4; i++) {
      part3 += digitsPool[Math.floor(Math.random() * digitsPool.length)];
    }

    const suggested = `${part1}${part2}${part3}`;
    dispatch(updateChangePassword({ newPass: suggested, confirmPass: suggested }));
    setIsSuggestedActive(true);
    setShowNew(true);
    setShowConfirm(true);
  };

  const handleAdminPinChange = (e, index) => {
    setAdminTpinError('');
    const val = e.target.value;
    if (val && isNaN(val)) return;

    const currentArray = [...adminTpin];
    currentArray[index] = val.slice(-1);
    setAdminTpin(currentArray);

    // Auto focus next
    if (val && index < 3) {
      adminTpinRefs.current[index + 1]?.focus();
    }
  };

  const handleAdminKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      adminTpinRefs.current[index - 1]?.focus();
    }
  };

  const handleProcess = () => {
    if (!changePassword.member) {
      setMemberError('Please select a member first!');
      return;
    }
    if (!changePassword.newPass) {
      setPassError('Please enter a new password!');
      return;
    }
    if (changePassword.newPass.length < 8 || changePassword.newPass.length > 10) {
      setPassError('Password must be between 8 and 10 characters long!');
      return;
    }
    if (changePassword.newPass !== changePassword.confirmPass) {
      setPassError('Passwords do not match!');
      return;
    }

    setMemberError('');
    setPassError('');
    setShowConfirmModal(true);
  };

  const confirmUpdate = () => {
    const enteredAdminTpin = adminTpin.join('');
    if (!enteredAdminTpin) {
      setAdminTpinError('Please enter Admin TPIN');
      return;
    }
    if (enteredAdminTpin.length < 4) {
      setAdminTpinError('Please enter full 4-digit Admin TPIN');
      return;
    }
    if (enteredAdminTpin !== '1234') {
      setAdminTpinError('Incorrect Admin TPIN! (Hint: 1234)');
      return;
    }
    setShowConfirmModal(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      dispatch(updateChangePassword({ newPass: '', confirmPass: '', member: '' }));
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Anti-Autofill Dummy Fields */}
        <input type="text" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />

        <div className={styles.cardHeader} style={{ padding: '10px 24px', borderBottom: '1px solid #EEF3FC', background: '#fff' }}>
          <h2 className={styles.cardTitle} style={{ margin: 0, fontSize: '1.2rem', color: '#0D1B3E' }}>Change Member Password</h2>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Select Member */}
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Select Member</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="member"
                  style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#0D1B3E', fontWeight: 500 }}
                  value={changePassword.member}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value) {
                      setMemberError('');
                    }
                  }}
                  autoComplete="off"
                >
                  <option value="">Select Member</option>
                  <option value="100000 Pay99 [9999999999]">100000 Pay99 [9999999999]</option>
                  <option value="RT1236 BALYAN [6377487868]">RT1236 BALYAN [6377487868]</option>
                  <option value="MDT8597 FARIDABAD [9354821335]">MDT8597 FARIDABAD [9354821335]</option>
                  <option value="Pay99RT4002 SoniTechno [8005575599]">Pay99RT4002 SoniTechno [8005575599]</option>
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#A0AEC0', fontSize: '0.7rem' }}>▼</div>
              </div>
            </div>

            {/* Selected Member Details */}
            {changePassword.member && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', background: '#fff', border: '1px solid #EEF3FC', borderRadius: '8px', overflow: 'hidden', marginTop: '2px', marginBottom: '4px' }}>
                <div style={{ flex: 1, padding: '6px 12px', borderRight: '1px solid #EEF3FC', textAlign: 'center', fontSize: '0.8rem', color: '#0D1B3E' }}>
                  <span style={{ fontWeight: 600, color: '#4E6080' }}>Name:</span> {changePassword.member.includes('Pay99') ? 'VIVEK VARSHNEY' : changePassword.member.includes('BALYAN') ? 'BALYAN' : 'FARIDABAD'}
                </div>
                <div style={{ flex: 1, padding: '6px 12px', borderRight: '1px solid #EEF3FC', textAlign: 'center', fontSize: '0.8rem', color: '#0D1B3E' }}>
                  <span style={{ fontWeight: 600, color: '#4E6080' }}>Mobile:</span> {changePassword.member.match(/\[(\d+)\]/)?.[1] || '9999999999'}
                </div>
                <div style={{ flex: 1, padding: '6px 12px', textAlign: 'center', fontSize: '0.8rem', color: '#0D1B3E' }}>
                  <span style={{ fontWeight: 600, color: '#4E6080' }}>Shop:</span> {changePassword.member.includes('Pay99') ? 'Pay99' : changePassword.member.split(' ')[0]}
                </div>
              </div>
            )}

            {/* Inline Error Messages */}
            {memberError && (
              <div style={{ gridColumn: '1 / -1', color: '#E53E3E', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF5F5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FED7D7' }}>
                <span>⚠️</span> {memberError}
              </div>
            )}
            {passError && (
              <div style={{ gridColumn: '1 / -1', color: '#E53E3E', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF5F5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FED7D7' }}>
                <span>⚠️</span> {passError}
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '-5px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D1B3E' }}>Set Password</span>
              <button 
                type="button"
                onClick={suggestStrongPassword}
                style={{
                  background: 'linear-gradient(135deg, #1756AA 0%, #114080 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(23,86,170,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 14px rgba(23,86,170,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 4px 10px rgba(23,86,170,0.15)';
                }}
              >
                ⚡ Suggest Password
              </button>
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="txt_n_p"
                  style={{ 
                    width: '100%', 
                    height: '42px', 
                    border: '1.5px solid #E2E8F0', 
                    background: '#F8FAFF', 
                    borderRadius: '10px', 
                    padding: '0 45px 0 16px', 
                    outline: 'none', 
                    boxSizing: 'border-box', 
                    fontSize: '0.85rem', 
                    color: '#0D1B3E', 
                    letterSpacing: !showNew && changePassword.newPass ? '0.15em' : 'normal',
                    WebkitTextSecurity: showNew ? 'none' : 'disc'
                  }}
                  placeholder="New Password"
                  value={changePassword.newPass}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isSuggestedActive) {
                      dispatch(updateChangePassword({ newPass: val, confirmPass: val }));
                    } else {
                      dispatch(updateChangePassword({ newPass: val }));
                    }
                    setPassError('');
                  }}
                  readOnly={!newPassFocused}
                  onFocus={() => setNewPassFocused(true)}
                  onBlur={() => setNewPassFocused(false)}
                  autoComplete="off"
                />
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#A0AEC0', display: 'flex' }}>
                  {showNew ? (
                    <FaEyeSlash onClick={() => setShowNew(false)} />
                  ) : (
                    <FaEye onClick={() => setShowNew(true)} />
                  )}
                </div>
              </div>
              {changePassword.newPass && (
                <div style={{ marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength === 'strong' ? '100%' : strength === 'medium' ? '66%' : '33%', background: strength === 'strong' ? '#27AE60' : strength === 'medium' ? '#EAA21F' : '#E53E3E', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="txt_c_p"
                  style={{ 
                    width: '100%', 
                    height: '42px', 
                    border: '1.5px solid #E2E8F0', 
                    background: '#F8FAFF', 
                    borderRadius: '10px', 
                    padding: '0 45px 0 16px', 
                    outline: 'none', 
                    boxSizing: 'border-box', 
                    fontSize: '0.85rem', 
                    color: '#0D1B3E', 
                    letterSpacing: !showConfirm && changePassword.confirmPass ? '0.15em' : 'normal',
                    WebkitTextSecurity: showConfirm ? 'none' : 'disc'
                  }}
                  placeholder="Re-type Password"
                  value={changePassword.confirmPass}
                  onChange={(e) => {
                    setIsSuggestedActive(false);
                    dispatch(updateChangePassword({ confirmPass: e.target.value }));
                    setPassError('');
                  }}
                  readOnly={!confirmPassFocused}
                  onFocus={() => setConfirmPassFocused(true)}
                  onBlur={() => setConfirmPassFocused(false)}
                  autoComplete="off"
                />
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#A0AEC0', display: 'flex' }}>
                  {showConfirm ? (
                    <FaEyeSlash onClick={() => setShowConfirm(false)} />
                  ) : (
                    <FaEye onClick={() => setShowConfirm(true)} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '32px', paddingTop: '24px', borderTop: '1px dashed #E2E8F0' }}>
            <button
              style={{ padding: '12px 35px', borderRadius: '12px', background: '#1756AA', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(23,86,170,0.25)', transition: 'all 0.3s' }}
              onClick={handleProcess}
              disabled={isSuccess}
            >
              {isSuccess ? (
                <>
                  <FaCheckCircle /> Updated Successfully!
                </>
              ) : (
                <>Change Password <FaArrowRight /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EBF8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#3182CE'
            }}>
              <FaShieldAlt style={{ fontSize: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#0D1B3E', fontWeight: 700, margin: '0 0 8px 0' }}>
              Confirm Password Update
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4E6080', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Are you sure you want to update the Password for <span style={{ fontWeight: 600, color: '#1A202C' }}>{changePassword.member.split(' [')[0]}</span>?
            </p>

            {/* Admin TPIN verification field */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600, display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                Enter Admin TPIN to Authorize
              </label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }}>
                {adminTpin.map((digit, i) => (
                  <input 
                    key={i}
                    ref={el => adminTpinRefs.current[i] = el}
                    type="password"
                    maxLength="1"
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      textAlign: 'center', 
                      padding: '0', 
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      borderRadius: '8px',
                      background: '#F8FAFF',
                      border: adminTpinError ? '1.5px solid #E53E3E' : '1.5px solid #E2E8F0',
                      outline: 'none',
                      color: '#0D1B3E'
                    }}
                    value={digit}
                    onChange={(e) => handleAdminPinChange(e, i)}
                    onKeyDown={(e) => handleAdminKeyDown(e, i)}
                    autoComplete="new-password"
                  />
                ))}
              </div>
              {adminTpinError && (
                <div style={{ color: '#E53E3E', fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                  {adminTpinError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  background: '#ffffff',
                  color: '#4E6080',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpdate}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#1756AA',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(23,86,170,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
