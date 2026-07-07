import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUserId, proceedToStep2, setPassword, backToStep1, resetLogin } from '../../store/slices/loginSlice';
import { findUserByCredentials, saveSession } from '../../utils/authUtils';
import {
  FaShieldAlt, FaMobileAlt, FaChartLine, FaUsers, FaHistory,
  FaExclamationTriangle, FaUser, FaLock, FaEye, FaEyeSlash,
  FaArrowRight, FaGooglePlay, FaCheck, FaTimes, FaGlobe, FaArrowLeft
} from 'react-icons/fa';
import { SITE_CONFIG } from '../../config/siteConfig';
import styles from '../../pages/LoginPage.module.css';

const FEATURES = [
  { icon: FaShieldAlt,  label: 'Bank-Grade Security' },
  { icon: FaMobileAlt,  label: 'Instant Settlements' },
  { icon: FaChartLine,  label: 'Real-time Reporting' },
];

const ApiLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, password: reduxPassword, isStep1Done } = useSelector((s) => s.login);

  useEffect(() => {
    dispatch(resetLogin());
    setPasswordLocal('');
  }, [dispatch]);

  const [password, setPasswordLocal] = useState(reduxPassword || '');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [forgotModal, setForgotModal] = useState({ isOpen: false, type: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [modalError, setModalError] = useState('');

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
    setNewPassword('');
    setRePassword('');
    setModalError('');
  };
  const closeForgotModal = () => {
    setForgotModal({ isOpen: false, type: '' });
    setModalLoading(false);
    setForgotStep(1);
    setNewPassword('');
    setRePassword('');
    setModalError('');
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setModalError('');
    if (forgotStep === 3 && newPassword !== rePassword) {
      setModalError('Passwords do not match. Please try again.');
      return;
    }
    setModalLoading(true);
    setTimeout(() => {
      setModalLoading(false);
      if (forgotStep === 1) setForgotStep(2);
      else if (forgotStep === 2) setForgotStep(3);
      else if (forgotStep === 3) setForgotStep(4);
    }, 1200);
  };

  const handleContinue = (e) => {
    if (e) e.preventDefault();
    if (userId.trim().length < 3) return;
    dispatch(proceedToStep2());
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 800);
      return;
    }
    
    setLoading(true);
    // Simulating API check
    setTimeout(() => {
      let user = findUserByCredentials(userId, password);
      
      // Fallback for user's requested test credentials
      if (!user && (
        (userId.toLowerCase().trim() === '6377749427' && password === '1234') ||
        (userId.toLowerCase().trim() === 'api@gmail.com' && password === 'api@123')
      )) {
         user = { 
           adminId: userId, 
           fullName: 'API User', 
           mobile: '6377749427', 
           role: 'Retailer' 
         };
      }

      if (!user) {
        setLoginError(true);
        setLoading(false);
        setTimeout(() => setLoginError(false), 2000);
        return;
      }
      
      const fakeToken = "header.eyJyb2xlIjoiMiIsIm5hbWUiOiJBUEkgVXNlciIsImV4cCI6OTk5OTk5OTk5OX0=.signature";
      localStorage.setItem('access_token', fakeToken);
      localStorage.setItem('member_token', fakeToken);
      sessionStorage.setItem('access_token', fakeToken);
      sessionStorage.setItem('member_token', fakeToken);

      saveSession(user);
      setLoading(false);
      navigate('/api/dashboard');
    }, 1500);
  };

  const handleBack = () => {
    dispatch(backToStep1()); 
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

             <div className={styles.formContent}>
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
                    {loginError && (
                      <div className={styles.errorAlert}>
                         <FaExclamationTriangle />
                         <span>Invalid password. Please try again.</span>
                      </div>
                    )}

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
                      disabled={loading}
                    >
                      {loading ? <div className={styles.spinner}></div> : <>Login Securely <FaShieldAlt /></>}
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
                <p className={styles.copyright}>© 2025 BETASOURCESOFTWARE. All rights reserved.</p>
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
                          <input className={styles.input} placeholder="e.g. RT123456" required />
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>AADHAR (LAST 4 DIGITS)</label>
                        <div className={styles.inputWrap}>
                          <input 
                            className={styles.input} 
                            placeholder="e.g. 8492" 
                            maxLength={4} 
                            required 
                            style={{ paddingLeft: '16px' }}
                            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                          />
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>PAN CARD NUMBER</label>
                        <div className={styles.inputWrap}>
                          <input className={styles.input} placeholder="e.g. ABCDE1234F" maxLength={10} style={{ paddingLeft: '16px', textTransform: 'uppercase' }} required />
                        </div>
                      </div>
                    </>
                  )}

                  {forgotStep === 2 && (
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>ENTER OTP</label>
                      <div className={styles.inputWrap}>
                        <input className={styles.input} placeholder="Enter 6-digit OTP" maxLength={6} style={{ paddingLeft: '16px' }} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} required />
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

export default ApiLoginPage;
