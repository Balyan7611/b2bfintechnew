import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaChartLine,
  FaCheck,
  FaExclamationTriangle,
  FaEye, FaEyeSlash,
  FaGooglePlay,
  FaLock,
  FaMobileAlt,
  FaShieldAlt,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../api/endpoints';
import { SITE_CONFIG } from '../../config/siteConfig';
import styles from '../../pages/LoginPage.module.css';
import { backToStep1, proceedToStep2, setPassword, setUserId } from '../../store/slices/loginSlice';
import { decodeToken, saveSession, getSession } from '../../utils/authUtils';
import { checkMaliciousInput } from '../../utils/securityUtils';


const FEATURES = [
  { icon: FaShieldAlt,  label: 'Bank-Grade Security' },
  { icon: FaMobileAlt,  label: 'Instant Settlements' },
  { icon: FaChartLine,  label: 'Real-time Reporting' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, password: reduxPassword, isStep1Done } = useSelector((s) => s.login);

  const [password, setPasswordLocal] = useState(reduxPassword || '');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModal, setForgotModal] = useState({ isOpen: false, type: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoginId, setForgotLoginId] = useState('');
  const [forgotAadhar, setForgotAadhar] = useState('');
  const [forgotPan, setForgotPan] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [locationStatus, setLocationStatus] = useState(null);

  // Brute force protection
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const attempts = localStorage.getItem('member_login_attempts');
    return attempts ? parseInt(attempts, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    const until = localStorage.getItem('member_lockout_until');
    return until ? parseInt(until, 10) : 0;
  });
  const [remainingTime, setRemainingTime] = useState(0);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const session = getSession();
    if (token && session && session.sessionId) {
      const decoded = decodeToken(token);
      if (decoded && (decoded.role === '2' || decoded.role === 2 || decoded.role > 1)) {
        navigate('/member/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutUntil > Date.now()) {
      setRemainingTime(Math.ceil((lockoutUntil - Date.now()) / 1000));
      const interval = setInterval(() => {
        const diff = lockoutUntil - Date.now();
        if (diff <= 0) {
          setLockoutUntil(0);
          setFailedAttempts(0);
          localStorage.removeItem('member_login_attempts');
          localStorage.removeItem('member_lockout_until');
          setRemainingTime(0);
          clearInterval(interval);
        } else {
          setRemainingTime(Math.ceil(diff / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  const checkLocationBeforeLogin = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Browser does not support geolocation'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus({
            status: 'on',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          resolve(position);
        },
        (error) => {
          let errorMsg = '';
          switch(error.code) {
            case 1:
              errorMsg = '⚠️ Location access denied. Proceeding with fallback...';
              break;
            case 2:
              errorMsg = '⚠️ Location unavailable. Proceeding with fallback...';
              break;
            case 3:
              errorMsg = '⚠️ Location request timeout. Proceeding with fallback...';
              break;
            default:
              errorMsg = '⚠️ Location access fallback enabled.';
          }
          setLocationStatus({
            status: 'off',
            error: errorMsg
          });
          resolve({ coords: { latitude: 28.6139, longitude: 77.2090 } }); // Resolve to Delhi coordinates instead of rejecting
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 5) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(newPassword);
  const strengthColors = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthPercent = newPassword ? (strengthScore === 0 ? 25 : (strengthScore / 4) * 100) : 0;
  const currentStrengthColor = newPassword ? strengthColors[strengthScore] : '#e2e8f0';

  const openForgotModal = (type) => {
    setForgotModal({ isOpen: true, type });
    setForgotStep(1);
    setForgotLoginId('');
    setForgotAadhar('');
    setForgotPan('');
    setForgotOtp('');
    setNewPassword('');
    setRePassword('');
    setModalError('');
  };
  
  const closeForgotModal = () => {
    setForgotModal({ isOpen: false, type: '' });
    setModalLoading(false);
    setForgotStep(1);
    setForgotLoginId('');
    setForgotAadhar('');
    setForgotPan('');
    setForgotOtp('');
    setNewPassword('');
    setRePassword('');
    setModalError('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (forgotStep === 1) {
      if (!forgotLoginId || !forgotAadhar || !forgotPan) {
        setModalError('All fields are required.');
        return;
      }
      if (forgotAadhar.length !== 4) {
        setModalError('Aadhar must be exactly last 4 digits.');
        return;
      }
      setForgotStep(2);
      return;
    }

    if (forgotStep === 2) {
      if (forgotOtp !== '1234') {
        setModalError('Invalid OTP. Please enter 1234.');
        return;
      }
      setForgotStep(3);
      return;
    }

    if (forgotStep === 3) {
      if (newPassword !== rePassword) {
        setModalError(`${forgotModal.type === 'password' ? 'Passwords' : 'TPINs'} do not match. Please try again.`);
        return;
      }
      
      setModalLoading(true);
      try {
        const isTpin = forgotModal.type === 'tpin';
        const payload = isTpin ? {
          LoginId: forgotLoginId,
          AadharLast4: forgotAadhar,
          Pan: forgotPan.toUpperCase(),
          NewPin: newPassword,
          ConfirmPin: rePassword
        } : {
          LoginId: forgotLoginId,
          AadharLast4: forgotAadhar,
          Pan: forgotPan.toUpperCase(),
          NewPassword: newPassword,
          ConfirmPassword: rePassword
        };
        
        const res = isTpin ? await API.forgetTpin(payload) : await API.forgetPassword(payload);
        if (res.status === true || res.status === 'success' || res.status === 1) {
          setForgotStep(4);
        } else {
          setModalError(res.mess || res.message || `Failed to reset ${isTpin ? 'T-PIN' : 'password'}.`);
        }
      } catch (err) {
        setModalError(err.message || `Failed to reset ${forgotModal.type === 'tpin' ? 'T-PIN' : 'password'}.`);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const handleContinue = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setLoginError(false);
    const validation = checkMaliciousInput(userId, 'User ID / Mobile');
    if (!validation.isValid) {
      setErrorMessage(validation.reason);
      setLoginError(true);
      return;
    }
    if (userId.trim().length < 3) return;
    dispatch(proceedToStep2());
    setLocationStatus(null);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setLoginError(false);

    if (remainingTime > 0) {
      setErrorMessage(`Too many failed attempts. Try again in ${remainingTime} seconds.`);
      setLoginError(true);
      return;
    }

    const validation = checkMaliciousInput(userId, 'User ID / Mobile');
    if (!validation.isValid) {
      setErrorMessage(validation.reason);
      setLoginError(true);
      return;
    }
    
    if (!password.trim()) {
      setLoginError(true);
      setErrorMessage('Password is required');
      setTimeout(() => setLoginError(false), 2000);
      return;
    }

    const pwdValidation = checkMaliciousInput(password, 'Password', true);
    if (!pwdValidation.isValid) {
      setErrorMessage(pwdValidation.reason);
      setLoginError(true);
      return;
    }
    
    setLoading(true);

    try {
      await checkLocationBeforeLogin();

      const response = await API.login({ loginID: userId, password: password });
      
      if (response.status) {
        const token = response.refreshToken || response.accessToken;
        
        if (!token) throw new Error("Token missing from server");
        
        const decoded = decodeToken(token);
        
        // Block pure admin (role===1) from logging in as member
        const roleNum = decoded ? Number(decoded.role) : -1;
        if (roleNum === 1 && !decoded?.LoginId?.startsWith('MEM')) {
          throw new Error("Unauthorized access - Admin cannot login as Member");
        }

        // Reset brute force counters on success
        localStorage.removeItem('member_login_attempts');
        localStorage.removeItem('member_lockout_until');
        setFailedAttempts(0);
        setLockoutUntil(0);

        // Store token in all keys so every service call picks it up
        localStorage.setItem('access_token', token);
        localStorage.setItem('member_token', token);
        sessionStorage.setItem('access_token', token);
        sessionStorage.setItem('member_token', token);

        // Extract real user info from JWT decoded payload
        const loginId = decoded?.LoginId || decoded?.loginId || decoded?.sub || userId;
        const userName = decoded?.unique_name || decoded?.name || decoded?.Name || 'Member';
        const mobileNo = decoded?.mobile || decoded?.Mobile || decoded?.phone || userId;
        const numericId = decoded?.sub || decoded?.id || '0';

        // Save complete session object for MemberSupport and other components
        saveSession({
          loginId: loginId,
          memberId: loginId,
          username: loginId,
          mobile: mobileNo,
          fullName: userName,
          name: userName,
          userId: numericId,
          role: roleNum || 2,
          msrno: numericId
        });

        navigate('/member/dashboard', { replace: true });
      } else {
        throw new Error(response.mess || "Login Failed");
      }
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('member_login_attempts', newAttempts);

      // Generic auth error to prevent credential enumeration
      let errorMsg = "Invalid Login Credentials.";
      
      if (err.message && (err.message.toLowerCase().includes('location') || err.message.toLowerCase().includes('unauthorized'))) {
        errorMsg = err.message;
      }

      if (newAttempts >= 5) {
        const lockoutTime = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
        setLockoutUntil(lockoutTime);
        localStorage.setItem('member_lockout_until', lockoutTime);
        errorMsg = "Too many failed attempts. Account locked out for 5 minutes.";
      } else {
        // Only append attempt count if it's a login failure, not a location failure
        if (!errorMsg.toLowerCase().includes('location')) {
          errorMsg = `${errorMsg} (Attempt ${newAttempts}/5)`;
        }
      }

      setErrorMessage(errorMsg);
      setLoginError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    dispatch(backToStep1());
    setLocationStatus(null);
    setLoginError(false);
    setErrorMessage('');
  };

  const requestLocationAgain = () => {
    setLocationStatus(null);
    setLoginError(false);
    setErrorMessage('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        {/* LEFT PANEL: Branding & Visuals */}
        <div className={styles.brandingPanel}>
          <div className={styles.brandingContent}>
            <Link to="/" className={styles.logoWrap}>
              <img src={SITE_CONFIG.logo} alt="Logo" className={styles.logoImg} />
            </Link>
            <div className={styles.heroText}>
              <h1 className={styles.mainTitle}>Access Your Portal</h1>
              <p className={styles.mainSub}>Manage your business with India's most trusted retail platform.</p>
            </div>

            <div className={styles.featureGrid}>
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className={styles.featurePill}>
                  <div className={styles.featureIconBox}><Icon /></div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className={styles.trustBadge}>
              <FaShieldAlt className={styles.trustIcon} />
              <div>
                <p className={styles.trustTitle}>ISO 27001 Certified</p>
                <p className={styles.trustSub}>100% Data Protection Guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className={styles.authPanel}>
          <div className={styles.formCard}>
             {/* Mobile Logo */}
             <div className={styles.mobileLogoBox}>
               <img src={SITE_CONFIG.logo} alt="Logo" className={styles.mobileLogo} />
             </div>

             <div className={styles.formHeader}>
               <h2 className={styles.welcomeTitle}>{isStep1Done ? 'Enter Password' : 'Sign In'}</h2>
               <p className={styles.welcomeSub}>
                 {isStep1Done ? `Continue as ${userId}` : 'Enter your credentials to continue'}
               </p>
             </div>

             {/* Progress Bar */}
             <div className={styles.progressTrack}>
                <div className={`${styles.progressFill} ${isStep1Done ? styles.progressHalf : ''}`}></div>
             </div>

             {/* Location Error Display */}
             {locationStatus && locationStatus.status === 'off' && isStep1Done && (
              <div style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '12px', 
                borderRadius: '8px', 
                margin: '15px 0',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                <FaExclamationTriangle style={{ marginRight: '8px' }} />
                {locationStatus.error}
                <button 
                  onClick={requestLocationAgain}
                  style={{ 
                    marginLeft: '10px', 
                    padding: '5px 10px', 
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

             <div className={styles.formContent}>
                {loginError && (
                  <div className={styles.errorAlert}>
                     <FaExclamationTriangle />
                     <span>{errorMessage || "Invalid password. Please try again."}</span>
                  </div>
                )}
                {!isStep1Done ? (
                  <form onSubmit={handleContinue} className={styles.animatedStep}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>USER ID / REGISTERED MOBILE</label>
                      <div className={styles.inputWrap}>
                        <div className={styles.inputIconBox}><FaUser /></div>
                        <input
                          className={styles.input}
                          placeholder="e.g. RT123456"
                          value={userId}
                          onChange={(e) => dispatch(setUserId(e.target.value))}
                          maxLength={20}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.primaryBtn} ${userId.trim().length < 3 ? styles.btnDisabled : ''}`}
                      disabled={userId.trim().length < 3}
                    >
                      Continue <FaArrowRight />
                    </button>

                    <button type="button" className={styles.backBtn} onClick={() => navigate('/')} style={{ marginTop: '10px' }}>
                       <FaArrowLeft /> Back to Home
                    </button>

                    <div className={styles.registerLinkRow}>
                       <span>New to the platform?</span>
                       <Link to="/register" className={styles.textLink}>Create an Account</Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className={styles.animatedStep}>

                    <div className={styles.fieldGroup}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className={styles.fieldLabel}>PASSWORD</label>
                        <div className={styles.forgotActions}>
                          <button type="button" className={styles.forgotBtn} onClick={() => openForgotModal('password')}>Forgot Pwd?</button>
                          <span className={styles.forgotDivider}>|</span>
                          <button type="button" className={styles.forgotBtn} onClick={() => openForgotModal('tpin')}>Forgot T-PIN?</button>
                        </div>
                      </div>
                      <div className={styles.inputWrap}>
                        <div className={styles.inputIconBox}><FaLock /></div>
                        <input
                          className={styles.input}
                          type={showPwd ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => { setPasswordLocal(e.target.value); dispatch(setPassword(e.target.value)); }}
                          maxLength={20}
                          autoFocus
                          required
                        />
                        <button className={styles.eyeBtn} type="button" onClick={() => setShowPwd(!showPwd)}>
                          {showPwd ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.primaryBtn} ${loading ? styles.btnLoading : ''}`}
                      disabled={loading || (locationStatus?.status === 'off') || (remainingTime > 0)}
                    >
                      {loading ? (
                        <div className={styles.spinner}></div>
                      ) : remainingTime > 0 ? (
                        `Locked out (${remainingTime}s)`
                      ) : (
                        <>Login Securely <FaShieldAlt /></>
                      )}
                    </button>

                    <button type="button" className={styles.backBtn} onClick={handleBack}>
                       <FaArrowLeft /> Switch Account
                    </button>
                  </form>
                )}
             </div>

             <div className={styles.formFooter}>
                <div className={styles.appDownload}>
                   <div className={styles.appInfo}>
                      <FaMobileAlt className={styles.mobileIcon} />
                      <span>Get the Mobile App</span>
                   </div>
                   <button className={styles.playStoreBtn}>
                      <FaGooglePlay /> Google Play
                   </button>
                </div>
                <p className={styles.copyright}>© {new Date().getFullYear()} {SITE_CONFIG.companyName || 'BETASOURCESOFTWARE'}. All rights reserved.</p>
             </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD / T-PIN MODAL */}
      {forgotModal.isOpen && (
        <div className={styles.modalOverlay} onClick={closeForgotModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={closeForgotModal}><FaTimes /></button>
            <div className={styles.modalIconWrap}>
              {forgotStep === 4 ? <FaCheck className={styles.modalIcon} style={{ color: '#10B981' }} /> : <FaShieldAlt className={styles.modalIcon} />}
            </div>
            
            {forgotStep === 4 ? (
              <div style={{ textAlign: 'center' }}>
                <h3 className={styles.modalTitle}>Success!</h3>
                <p className={styles.modalSub} style={{ marginBottom: '10px' }}>
                  Your {forgotModal.type === 'password' ? 'password' : 'T-PIN'} has been changed successfully.
                </p>
                <button type="button" className={styles.primaryBtn} onClick={closeForgotModal}>
                  Close & Login
                </button>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>
                  {forgotStep === 1 ? `Verify Details` : forgotStep === 2 ? `Verify OTP` : `Reset ${forgotModal.type === 'password' ? 'Password' : 'T-PIN'}`}
                </h3>
                <p className={styles.modalSub}>
                  {forgotStep === 1 ? `Enter your details to verify your identity.` : forgotStep === 2 ? `Enter the OTP sent to your registered mobile.` : `Enter your new ${forgotModal.type === 'password' ? 'password' : 'T-PIN'}.`}
                </p>

                <form onSubmit={handleModalSubmit}>
                  {forgotStep === 1 && (
                    <>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>LOGIN ID</label>
                        <div className={styles.inputWrap}>
                          <div className={styles.inputIconBox}><FaUser /></div>
                          <input 
                            className={styles.input} 
                            placeholder="e.g. RT123456" 
                            value={forgotLoginId}
                            onChange={(e) => setForgotLoginId(e.target.value)}
                            required 
                          />
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>AADHAR (LAST 4 DIGITS)</label>
                        <div className={styles.inputWrap}>
                          <input 
                            className={styles.input} 
                            placeholder="e.g. 8492" 
                            maxLength={4} 
                            value={forgotAadhar}
                            onChange={(e) => setForgotAadhar(e.target.value.replace(/[^0-9]/g, ''))}
                            required 
                            style={{ paddingLeft: '16px' }}
                          />
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>PAN CARD NUMBER</label>
                        <div className={styles.inputWrap}>
                          <input 
                            className={styles.input} 
                            placeholder="e.g. ABCDE1234F" 
                            maxLength={10} 
                            style={{ paddingLeft: '16px', textTransform: 'uppercase' }} 
                            value={forgotPan}
                            onChange={(e) => setForgotPan(e.target.value)}
                            required 
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {forgotStep === 2 && (
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>ENTER OTP</label>
                      <div className={styles.inputWrap}>
                        <input 
                          className={styles.input} 
                          placeholder="Enter 4-digit OTP (1234)" 
                          maxLength={4} 
                          style={{ paddingLeft: '16px' }} 
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          required 
                        />
                      </div>
                    </div>
                  )}

                  {forgotStep === 3 && (
                    <>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>NEW {forgotModal.type === 'password' ? 'PASSWORD' : 'T-PIN'}</label>
                        <div className={styles.inputWrap}>
                          <input 
                            className={styles.input} 
                            type="password" 
                            placeholder={`Enter new ${forgotModal.type === 'password' ? 'password' : 'T-PIN'}`} 
                            style={{ paddingLeft: '16px' }} 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                          />
                        </div>
                        {newPassword && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                              <span>Password Strength</span>
                              <span style={{ color: currentStrengthColor }}>{strengthLabels[strengthScore] || 'Very Weak'}</span>
                            </div>
                            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${strengthPercent}%`, background: currentStrengthColor, transition: 'all 0.3s ease' }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>RE-ENTER {forgotModal.type === 'password' ? 'PASSWORD' : 'T-PIN'}</label>
                        <div className={styles.inputWrap}>
                          <input 
                            className={styles.input} 
                            type="password" 
                            placeholder={`Re-enter new ${forgotModal.type === 'password' ? 'password' : 'T-PIN'}`} 
                            style={{ paddingLeft: '16px' }} 
                            value={rePassword}
                            onChange={(e) => setRePassword(e.target.value)}
                            required 
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {modalError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                      <FaExclamationTriangle /> {modalError}
                    </div>
                  )}

                  <button type="submit" className={`${styles.primaryBtn} ${modalLoading ? styles.btnLoading : ''}`} style={{ marginTop: '20px' }} disabled={modalLoading}>
                    {modalLoading ? <div className={styles.spinner}></div> : (
                      <>
                        {forgotStep === 1 ? 'Verify' : forgotStep === 2 ? 'Verify OTP' : 'Save'} <FaArrowRight />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;