 import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCogs,
  FaDatabase,
  FaExclamationTriangle,
  FaEye, FaEyeSlash,
  FaKey,
  FaLock,
  FaServer,
  FaShieldAlt,
  FaTimes,
  FaTools,
  FaUser,
  FaUserShield
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../api/endpoints';
import { SITE_CONFIG } from '../../config/siteConfig';
import styles from '../../pages/LoginPage.module.css';
import { decodeToken, saveSession, getSession } from '../../utils/authUtils';
import { checkMaliciousInput } from '../../utils/securityUtils';


const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState(null);

  // Step 3: OTP / T-PIN verification (LoginUser can respond with
  // data.status === "OTP" or "TPIN" instead of logging in directly)
  const [authMode, setAuthMode] = useState(null); // 'OTP' | 'TPIN' | null
  const [verifyToken, setVerifyToken] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [loginLocation, setLoginLocation] = useState(null); // coords captured at password step, reused for OTP/TPIN verify

  // Forgot password modal (real 2-step API: forget-password -> verify-forget-password)
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotModalLoading, setForgotModalLoading] = useState(false);
  const [forgotModalError, setForgotModalError] = useState('');
  const [forgotLoginId, setForgotLoginId] = useState('');
  const [forgotAadhar, setForgotAadhar] = useState('');
  const [forgotPan, setForgotPan] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  // Brute-force protection: Lockout after 5 failed attempts
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const attempts = localStorage.getItem('admin_login_attempts');
    return attempts ? parseInt(attempts, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    const until = localStorage.getItem('admin_lockout_until');
    return until ? parseInt(until, 10) : 0;
  });
  const [remainingTime, setRemainingTime] = useState(0);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const session = getSession();
    if (token && session && session.sessionId) {
      const decoded = decodeToken(token);
      if (decoded && (decoded.role === '1' || decoded.role === 1)) {
        navigate('/admin/dashboard', { replace: true });
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
          localStorage.removeItem('admin_login_attempts');
          localStorage.removeItem('admin_lockout_until');
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
              errorMsg = '❌ Location access denied. Please enable location to login as Admin.';
              break;
            case 2:
              errorMsg = '❌ Location unavailable. Please check your device settings.';
              break;
            case 3:
              errorMsg = '❌ Location request timeout. Please try again.';
              break;
            default:
              errorMsg = '❌ Location access required for Admin login.';
          }
          setLocationStatus({
            status: 'off',
            error: errorMsg
          });
          reject(new Error(errorMsg));
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    const validation = checkMaliciousInput(adminId, 'Administrator ID');
    if (!validation.isValid) {
      setError(validation.reason);
      return;
    }
    if (adminId.trim().length >= 3) setStep(2);
  };

  // Shared "final success" handler used both when LoginUser logs in directly
  // and when VerifyLoginOTP / VerifyLoginTPIN completes the login.
  // `location` = the coordinates captured on the password step, so they can
  // be carried into the session and, from there, into the UserLoginHistory
  // record created in App.jsx (instead of hardcoded 0,0).
  const completeAdminLogin = (decoded, token, location) => {
    // Reset brute force counters on success
    localStorage.removeItem('admin_login_attempts');
    localStorage.removeItem('admin_lockout_until');
    setFailedAttempts(0);
    setLockoutUntil(0);

    localStorage.setItem('admin_token', token);
    localStorage.setItem('access_token', token);
    sessionStorage.setItem('admin_token', token);
    sessionStorage.setItem('access_token', token);

    // Save the secure session
    saveSession({
      adminId,
      fullName: decoded.name || 'Admin',
      role: 1,
      latitude: location?.latitude,
      longitude: location?.longitude
    });

    navigate('/admin/dashboard', { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (remainingTime > 0) {
      setError(`Too many failed attempts. Try again in ${remainingTime} seconds.`);
      return;
    }

    const validation = checkMaliciousInput(adminId, 'Administrator ID');
    if (!validation.isValid) {
      setError(validation.reason);
      return;
    }

    const pwdValidation = checkMaliciousInput(password, 'Password', true);
    if (!pwdValidation.isValid) {
      setError(pwdValidation.reason);
      return;
    }

    setLoading(true);

    try {
      const position = await checkLocationBeforeLogin();

      // Reuse the coordinates we just captured above instead of letting the
      // API layer fire a second, separate geolocation request - that second
      // request was what silently dropped lat/long from the login payload.
      const capturedLocation = {
        latitude: position?.coords?.latitude ?? 0,
        longitude: position?.coords?.longitude ?? 0,
        accuracy: position?.coords?.accuracy ?? 0,
        allowed: true
      };

      const response = await API.login({
        loginID: adminId,
        password: password,
        __presetLocation: capturedLocation
      });

      if (response.status) {
        // Backend wants a second factor before granting access
        if (response.authStatus === 'OTP' || response.authStatus === 'TPIN') {
          const pendingToken = response.data?.refreshToken || response.refreshToken;
          if (!pendingToken) throw new Error("Verification token missing from server");

          // Keep the same coordinates for the verify step below, instead of
          // asking the browser for location a third time.
          setLoginLocation(capturedLocation);
          setVerifyToken(pendingToken);
          setAuthMode(response.authStatus);
          setOtpValue('');
          setStep(3);
          return;
        }

        const token = response.refreshToken || response.accessToken;

        if (!token) throw new Error("Token missing from server");

        const decoded = decodeToken(token);

        if (decoded && (decoded.role === '1' || decoded.role === 1)) {
          completeAdminLogin(decoded, token, capturedLocation);
        } else {
          throw new Error("Unauthorized access - Admin only");
        }
      } else {
        throw new Error(response.mess || "Admin Authentication Failed");
      }
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts);

      // Generic auth error to prevent credential enumeration
      let errorMsg = "Invalid Login Credentials.";

      if (err.message && (err.message.toLowerCase().includes('location') || err.message.toLowerCase().includes('unauthorized'))) {
        errorMsg = err.message;
      }

      if (newAttempts >= 5) {
        const lockoutTime = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
        setLockoutUntil(lockoutTime);
        localStorage.setItem('admin_lockout_until', lockoutTime);
        errorMsg = "Too many failed attempts. Account locked out for 5 minutes.";
      } else {
        // Only append attempt count if it's a login failure, not a location failure
        if (!errorMsg.toLowerCase().includes('location')) {
          errorMsg = `${errorMsg} (Attempt ${newAttempts}/5)`;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpValue.trim()) {
      setError(authMode === 'TPIN' ? 'T-PIN is required' : 'OTP is required');
      return;
    }

    if (!verifyToken) {
      setError('Verification session expired. Please login again.');
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const response = authMode === 'TPIN'
        ? await API.verifyLoginTpin({ token: verifyToken, tpin: otpValue, __presetLocation: loginLocation })
        : await API.verifyLoginOtp({ token: verifyToken, otp: otpValue, __presetLocation: loginLocation });

      if (response.status) {
        const token = response.accessToken || response.refreshToken;
        if (!token) throw new Error("Token missing from server");

        const decoded = decodeToken(token);

        if (decoded && (decoded.role === '1' || decoded.role === 1)) {
          completeAdminLogin(decoded, token, loginLocation);
        } else {
          throw new Error("Unauthorized access - Admin only");
        }
      } else {
        throw new Error(response.mess || "Verification Failed");
      }
    } catch (err) {
      setError(err.message || (authMode === 'TPIN' ? "Invalid T-PIN. Please try again." : "Invalid OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPassword = () => {
    setStep(2);
    setAuthMode(null);
    setVerifyToken('');
    setOtpValue('');
    setError('');
  };

  const requestLocationAgain = () => {
    setLocationStatus(null);
    setError('');
  };

  const openForgotModal = () => {
    setForgotModalOpen(true);
    setForgotStep(1);
    setForgotModalError('');
    setForgotLoginId(adminId || '');
    setForgotAadhar('');
    setForgotPan('');
    setForgotOtp('');
    setForgotToken('');
    setNewPassword('');
    setRePassword('');
  };

  const closeForgotModal = () => {
    setForgotModalOpen(false);
    setForgotModalLoading(false);
    setForgotStep(1);
    setForgotModalError('');
    setForgotLoginId('');
    setForgotAadhar('');
    setForgotPan('');
    setForgotOtp('');
    setForgotToken('');
    setNewPassword('');
    setRePassword('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotModalError('');

    if (forgotStep === 1) {
      if (!forgotLoginId || !forgotAadhar || !forgotPan) {
        setForgotModalError('All fields are required.');
        return;
      }
      if (forgotAadhar.length !== 4) {
        setForgotModalError('Aadhar must be exactly last 4 digits.');
        return;
      }

      setForgotModalLoading(true);
      try {
        const res = await API.forgetPassword({
          loginId: forgotLoginId,
          aadharLast4: forgotAadhar,
          pan: forgotPan.toUpperCase()
        });

        const token = res?.data?.token || res?.data?.refreshToken || res?.token || res?.data;
        if (!token) throw new Error("Verification token missing from server");

        setForgotToken(token);
        setForgotStep(2);
      } catch (err) {
        setForgotModalError(err.message || 'Failed to verify details. Please check and try again.');
      } finally {
        setForgotModalLoading(false);
      }
      return;
    }

    if (forgotStep === 2) {
      if (!forgotOtp || forgotOtp.trim().length < 4) {
        setForgotModalError('Please enter a valid OTP.');
        return;
      }
      setForgotStep(3);
      return;
    }

    if (forgotStep === 3) {
      if (newPassword !== rePassword) {
        setForgotModalError('Passwords do not match. Please try again.');
        return;
      }

      setForgotModalLoading(true);
      try {
        const res = await API.verifyForgetPassword({
          token: forgotToken,
          otp: forgotOtp,
          newPassword: newPassword,
          confirmPassword: rePassword
        });

        if (res.status === true || res.status === 'success' || res.status === 1) {
          setForgotStep(4);
        } else {
          setForgotModalError(res.mess || res.message || 'Failed to reset password.');
        }
      } catch (err) {
        setForgotModalError(err.message || 'Failed to reset password.');
      } finally {
        setForgotModalLoading(false);
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        {/* LEFT PANEL: Branding & Visuals */}
        <div className={styles.brandingPanel} style={{ background: 'linear-gradient(135deg, #06113C 0%, #1756AA 100%)' }}>
          <div className={styles.brandingContent}>
            <Link to="/" className={styles.logoWrap}>
              <img src={SITE_CONFIG.logo} alt="Logo" className={styles.logoImg} />
            </Link>
            <div className={styles.heroText}>
              <h1 className={styles.mainTitle}>Admin Control</h1>
              <p className={styles.mainSub}>Authorized access for system administration and infrastructure management.</p>
            </div>

            <div className={styles.featureGrid}>
                <div className={styles.featurePill}>
                  <div className={styles.featureIconBox}><FaServer /></div>
                  <span>Endpoint Monitoring</span>
                </div>
                <div className={styles.featurePill}>
                  <div className={styles.featureIconBox}><FaDatabase /></div>
                  <span>Database Integrity</span>
                </div>
                <div className={styles.featurePill}>
                  <div className={styles.featureIconBox}><FaCogs /></div>
                  <span>System Configuration</span>
                </div>
            </div>

            <div className={styles.trustBadge}>
              <FaShieldAlt className={styles.trustIcon} style={{ color: '#F59E0B' }} />
              <div>
                <p className={styles.trustTitle}>Secure Admin Channel</p>
                <p className={styles.trustSub}>End-to-End Encrypted Session</p>
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
               <h2 className={styles.welcomeTitle}>
                 {step === 3 ? (authMode === 'TPIN' ? 'Enter T-PIN' : 'Enter OTP') : step === 2 ? 'Security Key' : 'Admin Access'}
               </h2>
               <p className={styles.welcomeSub}>
                 {step === 3
                   ? (authMode === 'TPIN' ? 'Enter the T-PIN to complete login' : 'Enter the OTP sent to your registered email/mobile')
                   : step === 2 ? `Verifying Admin: ${adminId}` : 'Restricted area. Please authenticate.'}
               </p>
             </div>

             <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${step === 2 ? styles.progressHalf : ''}`}
                  style={step === 3 ? { width: '100%' } : undefined}
                ></div>
             </div>

             {locationStatus && locationStatus.status === 'off' && step === 2 && (
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
                {error && (
                  <div className={styles.errorAlert}>
                    <FaExclamationTriangle />
                    <span>{error}</span>
                  </div>
                )}
                {step === 1 ? (
                  <form onSubmit={handleNext} className={styles.animatedStep}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>ADMINISTRATOR ID</label>
                      <div className={styles.inputWrap}>
                        <div className={styles.inputIconBox}><FaUserShield /></div>
                        <input
                          className={styles.input}
                          placeholder="e.g. ADMIN_001"
                          value={adminId}
                          onChange={(e) => setAdminId(e.target.value)}
                          maxLength={20}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className={styles.primaryBtn}>
                      Verify Identity <FaArrowRight />
                    </button>

                    <div className={styles.registerLinkRow}>
                       <Link to="/member/login" className={styles.textLink}>← Back to Member Login</Link>
                    </div>
                  </form>
                ) : step === 2 ? (
                  <form onSubmit={handleLogin} className={styles.animatedStep}>
                    <div className={styles.fieldGroup}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className={styles.fieldLabel}>PRIVATE SECURITY KEY</label>
                        <button type="button" className={styles.forgotBtn} onClick={openForgotModal}>Forgot Password?</button>
                      </div>
                      <div className={styles.inputWrap}>
                        <div className={styles.inputIconBox}><FaLock /></div>
                        <input
                          className={styles.input}
                          type={showPwd ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                        <>Grant Admin Access <FaShieldAlt /></>
                      )}
                    </button>

                    <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                       <FaArrowLeft /> Switch Admin Account
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerify} className={styles.animatedStep}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>{authMode === 'TPIN' ? 'T-PIN' : 'ONE-TIME PASSWORD'}</label>
                      <div className={styles.inputWrap}>
                        <div className={styles.inputIconBox}><FaKey /></div>
                        <input
                          className={styles.input}
                          type="text"
                          inputMode="numeric"
                          placeholder={authMode === 'TPIN' ? 'Enter T-PIN' : 'Enter OTP'}
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                          maxLength={6}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.primaryBtn} ${loading ? styles.btnLoading : ''}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className={styles.spinner}></div>
                      ) : (
                        <>Verify &amp; Login <FaShieldAlt /></>
                      )}
                    </button>

                    <button type="button" className={styles.backBtn} onClick={handleBackToPassword}>
                       <FaArrowLeft /> Back
                    </button>
                  </form>
                )}
             </div>

             <div className={styles.formFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#718096', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center' }}>
                   <FaTools /> System Version 2.0.1
                </div>
                <p className={styles.copyright} style={{ marginTop: '15px' }}>© {new Date().getFullYear()} {SITE_CONFIG.companyName}. Admin Use Only.</p>
             </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
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
                  Your password has been changed successfully.
                </p>
                <button type="button" className={styles.primaryBtn} onClick={closeForgotModal}>
                  Close & Login
                </button>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>
                  {forgotStep === 1 ? `Verify Details` : forgotStep === 2 ? `Verify OTP` : `Reset Password`}
                </h3>
                <p className={styles.modalSub}>
                  {forgotStep === 1 ? `Enter your details to verify your identity.` : forgotStep === 2 ? `Enter the OTP sent to your registered email/mobile.` : `Enter your new password.`}
                </p>

                <form onSubmit={handleForgotSubmit}>
                  {forgotStep === 1 && (
                    <>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>ADMINISTRATOR ID</label>
                        <div className={styles.inputWrap}>
                          <div className={styles.inputIconBox}><FaUser /></div>
                          <input
                            className={styles.input}
                            placeholder="e.g. ADMIN_001"
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
                          placeholder="Enter OTP"
                          maxLength={6}
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
                        <label className={styles.fieldLabel}>NEW PASSWORD</label>
                        <div className={styles.inputWrap}>
                          <input
                            className={styles.input}
                            type="password"
                            placeholder="Enter new password"
                            style={{ paddingLeft: '16px' }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>RE-ENTER PASSWORD</label>
                        <div className={styles.inputWrap}>
                          <input
                            className={styles.input}
                            type="password"
                            placeholder="Re-enter new password"
                            style={{ paddingLeft: '16px' }}
                            value={rePassword}
                            onChange={(e) => setRePassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {forgotModalError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                      <FaExclamationTriangle /> {forgotModalError}
                    </div>
                  )}

                  <button type="submit" className={`${styles.primaryBtn} ${forgotModalLoading ? styles.btnLoading : ''}`} style={{ marginTop: '20px' }} disabled={forgotModalLoading}>
                    {forgotModalLoading ? <div className={styles.spinner}></div> : (
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

export default AdminLoginPage;