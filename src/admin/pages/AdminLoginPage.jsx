import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCogs,
  FaDatabase,
  FaExclamationTriangle,
  FaEye, FaEyeSlash,
  FaLock,
  FaServer,
  FaShieldAlt,
  FaTools,
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
      await checkLocationBeforeLogin();

      const response = await API.login({ loginID: adminId, password: password });
      
      if (response.status) {
        const token = response.refreshToken || response.accessToken;
        
        if (!token) throw new Error("Token missing from server");
        
        const decoded = decodeToken(token);
        
        if (decoded && (decoded.role === '1' || decoded.role === 1)) {
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
          saveSession({ adminId, fullName: decoded.name || 'Admin', role: 1, msrno: decoded.sub || 0 });
          
          navigate('/admin/dashboard', { replace: true });
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

  const requestLocationAgain = () => {
    setLocationStatus(null);
    setError('');
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
               <h2 className={styles.welcomeTitle}>{step === 2 ? 'Security Key' : 'Admin Access'}</h2>
               <p className={styles.welcomeSub}>
                 {step === 2 ? `Verifying Admin: ${adminId}` : 'Restricted area. Please authenticate.'}
               </p>
             </div>

             <div className={styles.progressTrack}>
                <div className={`${styles.progressFill} ${step === 2 ? styles.progressHalf : ''}`}></div>
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
                ) : (
                  <form onSubmit={handleLogin} className={styles.animatedStep}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>PRIVATE SECURITY KEY</label>
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
    </div>
  );
};

export default AdminLoginPage;