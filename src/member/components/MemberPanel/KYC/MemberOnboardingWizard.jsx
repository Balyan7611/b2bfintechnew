import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiFileText, FiBriefcase, FiLayers, 
  FiUploadCloud, FiCheckCircle, FiChevronRight, FiChevronLeft,
  FiSmile, FiCamera, FiAlertCircle, FiTrash2,
  FiInfo, FiLock, FiLoader,
  FiUsers, FiShield, FiTrendingUp, FiHeart, FiHome, FiHelpCircle,
  FiPlus, FiMapPin, FiPhone, FiMail, FiMap
} from 'react-icons/fi';
import styles from './MemberOnboardingWizard.module.css';

const COMPANY_TYPES = [
  { id: 'proprietorship', label: 'Proprietorship', icon: FiUser },
  { id: 'partnership', label: 'Partnership Firm', icon: FiUsers },
  { id: 'llp', label: 'LLP', icon: FiShield },
  { id: 'private_limited', label: 'Private Limited Company', icon: FiBriefcase },
  { id: 'public_limited', label: 'Public Limited Company', icon: FiTrendingUp },
  { id: 'trust', label: 'Trust / Society', icon: FiHeart },
  { id: 'huf', label: 'HUF', icon: FiHome },
  { id: 'others', label: 'Others', icon: FiHelpCircle }
];

const DOCUMENT_CHECKLISTS = {
  proprietorship: [
    { key: 'owner_aadhaar', label: 'Aadhaar (Owner)', required: true },
    { key: 'owner_pan', label: 'PAN (Owner)', required: true },
    { key: 'address_proof', label: 'Business Address Proof', required: true },
    { key: 'declaration', label: 'Proprietorship Declaration', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  partnership: [
    { key: 'firm_pan', label: 'PAN (Firm)', required: true },
    { key: 'partnership_deed', label: 'Partnership Deed', required: true },
    { key: 'partners_aadhaar', label: 'Aadhaar (Partners)', required: true },
    { key: 'address_proof', label: 'Address Proof (Partners)', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  llp: [
    { key: 'llp_agreement', label: 'LLP Agreement', required: true },
    { key: 'llp_pan', label: 'LLP PAN', required: true },
    { key: 'din_partners', label: 'DIN of Partners', required: true },
    { key: 'partners_aadhaar', label: 'Aadhaar (Designated Partners)', required: true },
    { key: 'address_proof', label: 'Address Proof', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  private_limited: [
    { key: 'coi', label: 'Certificate of Incorporation', required: true },
    { key: 'moa_aoa', label: 'MOA & AOA', required: true },
    { key: 'company_pan', label: 'PAN (Company)', required: true },
    { key: 'cin', label: 'CIN Verification', required: true },
    { key: 'directors_id', label: 'Aadhaar (Directors)', required: true },
    { key: 'address_proof', label: 'Address Proof (Company)', required: true },
    { key: 'board_resolution', label: 'Board Resolution', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  public_limited: [
    { key: 'coi', label: 'Certificate of Incorporation', required: true },
    { key: 'moa_aoa', label: 'MOA & AOA', required: true },
    { key: 'company_pan', label: 'PAN (Company)', required: true },
    { key: 'cin', label: 'CIN Verification', required: true },
    { key: 'directors_id', label: 'Aadhaar (Directors)', required: true },
    { key: 'board_resolution', label: 'Board Resolution', required: true },
    { key: 'shareholding', label: 'Shareholding Pattern', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  trust: [
    { key: 'trust_registration', label: 'Registration Certificate', required: true },
    { key: 'trust_deed', label: 'Trust Deed / Society Bylaws', required: true },
    { key: 'trust_pan', label: 'PAN', required: true },
    { key: 'trustees_id', label: 'Aadhaar (Trustees)', required: true },
    { key: 'address_proof', label: 'Address Proof', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  huf: [
    { key: 'karta_pan', label: 'PAN (HUF)', required: true },
    { key: 'karta_aadhaar', label: 'Aadhaar (Karta)', required: true },
    { key: 'family_declaration', label: 'Family Details', required: true },
    { key: 'address_proof', label: 'Address Proof', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ],
  others: [
    { key: 'guidelines', label: 'As per RBI Guidelines & Nature of Entity', required: true },
    { key: 'relevant_kyc', label: 'Relevant KYC Documents', required: true },
    { key: 'address_proof', label: 'Address Proof', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true }
  ]
};

const MemberOnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState({
    1: false, 2: false, 3: false, 4: false, 5: false,
    6: false, 7: false, 8: false, 9: false, 10: false, 11: false
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // STEP 1: eKYC State (Aadhaar & OTP and Webcam)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);

  // STEP 2: PAN State
  const [panNumber, setPanNumber] = useState('');
  const [panVerified, setPanVerified] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  const [panName, setPanName] = useState('');

  // STEP 3: Profile State
  const [profileData, setProfileData] = useState({
    fullName: '',
    shopName: '',
    email: '',
    address: '',
    nomineeName: '',
    nomineeRelation: '',
    sourceOfFunds: '',
    purpose: ''
  });

  // STEP 4: Company State
  const [selectedCompanyType, setSelectedCompanyType] = useState('');

  // STEP 5: Business Information State
  const [businessData, setBusinessData] = useState({
    legalName: '',
    tradeName: '',
    category: 'Retail',
    nature: '',
    website: '',
    supportEmail: '',
    supportMobile: '',
    startDate: '',
    turnover: 'Below 10 Lakh'
  });

  // STEP 6: GST / CIN / LLP Information State
  const [gstData, setGstData] = useState({
    gstNumber: '',
    gstVerified: false,
    gstRegDate: '',
    cinNumber: '',
    cinVerified: false,
    llpin: '',
    msme: '',
    coiNumber: '',
    authority: ''
  });
  const [gstLoading, setGstLoading] = useState(false);
  const [cinLoading, setCinLoading] = useState(false);

  // STEP 7: Office Address State
  const [officeAddress, setOfficeAddress] = useState({
    line1: '',
    line2: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    latitude: '',
    longitude: '',
    officePhoto: '',
    addressProof: ''
  });

  // STEP 8: Director / Partner Details State (Dynamic Array)
  const [directors, setDirectors] = useState([
    {
      name: '',
      designation: '',
      dob: '',
      mobile: '',
      email: '',
      panNumber: '',
      panVerified: false,
      aadhaarNumber: '',
      aadhaarVerified: false,
      din: '',
      address: '',
      photograph: ''
    }
  ]);
  const [dirVerificationLoading, setDirVerificationLoading] = useState({}); // tracking index-field loading states

  // STEP 9: Authorized Contact Person State
  const [authorizedPerson, setAuthorizedPerson] = useState({
    name: '',
    designation: '',
    mobile: '',
    email: '',
    telephone: '',
    altMobile: '',
    idProof: '',
    addressProof: ''
  });

  // STEP 10: Dynamic Document Uploads State
  const [uploadedFiles, setUploadedFiles] = useState({});

  // ── Verification & OTP Handlers ───────────────────────────────────────────
  const handleSendAadhaarOtp = () => {
    if (aadhaarNumber.length !== 12 || isNaN(aadhaarNumber)) {
      setErrorMessage('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }
    setErrorMessage('');
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setResendTimer(30);
      setSuccessMessage('OTP sent successfully to your Aadhaar-linked mobile number.');
    }, 1500);
  };

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyAadhaarOtp = () => {
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (aadhaarOtp === '123456') {
        setAadhaarVerified(true);
        setSuccessMessage('Aadhaar verified successfully! Please capture selfie below to finish Step 1.');
        setErrorMessage('');
      } else {
        setErrorMessage('Invalid OTP. Use demo code: 123456');
      }
    }, 1500);
  };

  const handleCapturePhoto = () => {
    setCapturingPhoto(true);
    setTimeout(() => {
      setCapturingPhoto(false);
      setIsPhotoCaptured(true);
      setCapturedPhotoUrl('https://placehold.co/150x150?text=Selfie+Captured');
      setCompletedSteps(prev => ({ ...prev, 1: true }));
      setSuccessMessage('Face verification matching Aadhaar records successful!');
    }, 2000);
  };

  const handleVerifyPan = () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      setErrorMessage('Please enter a valid 10-character PAN (e.g. ABCDE1234F).');
      return;
    }
    setErrorMessage('');
    setPanLoading(true);
    setTimeout(() => {
      setPanLoading(false);
      setPanVerified(true);
      setPanName(profileData.fullName || 'DEMO COMPLIANT MEMBER');
      setCompletedSteps(prev => ({ ...prev, 2: true }));
      setSuccessMessage('PAN details verified successfully with NSDL records.');
    }, 1500);
  };

  const handleVerifyGst = () => {
    const gstRegEx = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegEx.test(gstData.gstNumber.toUpperCase())) {
      setErrorMessage('Please enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).');
      return;
    }
    setErrorMessage('');
    setGstLoading(true);
    setTimeout(() => {
      setGstLoading(false);
      setGstData(prev => ({ ...prev, gstVerified: true, gstRegDate: '2020-04-01' }));
      setBusinessData(prev => ({
        ...prev,
        legalName: 'DEMO TECH SOLUTIONS PVT LTD',
        tradeName: 'DEMO FINTECH SOLUTIONS'
      }));
      setSuccessMessage('GST details verified. Legal Name & Trade Name populated!');
    }, 1500);
  };

  const handleVerifyCin = () => {
    if (gstData.cinNumber.trim().length !== 21) {
      setErrorMessage('Please enter a valid 21-character CIN.');
      return;
    }
    setErrorMessage('');
    setCinLoading(true);
    setTimeout(() => {
      setCinLoading(false);
      setGstData(prev => ({ ...prev, cinVerified: true, authority: 'ROC Mumbai' }));
      setSuccessMessage('CIN verified successfully with MCA records!');
    }, 1500);
  };

  const handleVerifyDirectorPan = (index) => {
    const pan = directors[index].panNumber;
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      setErrorMessage(`Please enter a valid PAN for Director ${index + 1}.`);
      return;
    }
    setErrorMessage('');
    setDirVerificationLoading(prev => ({ ...prev, [`pan_${index}`]: true }));
    setTimeout(() => {
      setDirVerificationLoading(prev => ({ ...prev, [`pan_${index}`]: false }));
      const newDirs = [...directors];
      newDirs[index].panVerified = true;
      setDirectors(newDirs);
      setSuccessMessage(`Director ${index + 1} PAN verified successfully!`);
    }, 1200);
  };

  const handleVerifyDirectorAadhaar = (index) => {
    const aadhar = directors[index].aadhaarNumber;
    if (aadhar.length !== 12 || isNaN(aadhar)) {
      setErrorMessage(`Please enter a valid 12-digit Aadhaar for Director ${index + 1}.`);
      return;
    }
    setErrorMessage('');
    setDirVerificationLoading(prev => ({ ...prev, [`aadhaar_${index}`]: true }));
    setTimeout(() => {
      setDirVerificationLoading(prev => ({ ...prev, [`aadhaar_${index}`]: false }));
      const newDirs = [...directors];
      newDirs[index].aadhaarVerified = true;
      setDirectors(newDirs);
      setSuccessMessage(`Director ${index + 1} Aadhaar KYC completed!`);
    }, 1200);
  };

  // ── Dynamic Array Functions ───────────────────────────────────────────────
  const handleAddDirector = () => {
    setDirectors([
      ...directors,
      {
        name: '',
        designation: '',
        dob: '',
        mobile: '',
        email: '',
        panNumber: '',
        panVerified: false,
        aadhaarNumber: '',
        aadhaarVerified: false,
        din: '',
        address: '',
        photograph: ''
      }
    ]);
  };

  const handleRemoveDirector = (index) => {
    if (directors.length === 1) return;
    const list = [...directors];
    list.splice(index, 1);
    setDirectors(list);
  };

  const handleDirectorChange = (index, field, value) => {
    const newDirs = [...directors];
    newDirs[index][field] = value;
    setDirectors(newDirs);
  };

  // ── File Upload Controls ──────────────────────────────────────────────────
  const handleFileUpload = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [key]: file.name
      }));
    }
  };

  const handleRemoveFile = (key) => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleOfficeFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setOfficeAddress(prev => ({ ...prev, [field]: file.name }));
    }
  };

  const handleAuthPersonFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setAuthorizedPerson(prev => ({ ...prev, [field]: file.name }));
    }
  };

  const handleDirectorFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newDirs = [...directors];
      newDirs[index].photograph = file.name;
      setDirectors(newDirs);
    }
  };

  // ── Step Navigation ───────────────────────────────────────────────────────
  const checkDocsComplete = () => {
    const neededDocs = DOCUMENT_CHECKLISTS[selectedCompanyType] || [];
    return neededDocs.every(doc => !doc.required || uploadedFiles[doc.key]);
  };

  const steps = [
    { num: 1, label: 'eKYC', icon: FiUser },
    { num: 2, label: 'PAN', icon: FiFileText },
    { num: 3, label: 'Profile', icon: FiUser },
    { num: 4, label: 'Entity', icon: FiLayers },
    { num: 5, label: 'Business', icon: FiBriefcase },
    { num: 6, label: 'GST/CIN', icon: FiFileText },
    { num: 7, label: 'Office Address', icon: FiMapPin },
    { num: 8, label: 'Directors', icon: FiUsers },
    { num: 9, label: 'Auth Person', icon: FiShield },
    { num: 10, label: 'Documents', icon: FiUploadCloud },
    { num: 11, label: 'Review', icon: FiCheckCircle }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        {/* Onboarding Header */}
        {currentStep < 11 && (
          <div className={styles.wizardHeader}>
            <div className={styles.headerTitleWrap}>
              <FiShield className={styles.headerLockIcon} />
              <h1 className={styles.wizardTitle}>Identity Verification & KYC</h1>
            </div>
          </div>
        )}

        {/* Stepper Progress */}
        {currentStep < 11 && (
          <div className={styles.stepperContainer}>
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = completedSteps[s.num];
              const isActive = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div 
                    className={`${styles.stepWrapper} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepCompleted : ''}`}
                    onClick={() => {
                      setCurrentStep(s.num);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                  >
                    <div className={styles.stepCircle}>
                      {isCompleted ? <FiCheckCircle className={styles.checkIcon} /> : <Icon />}
                    </div>
                    <span className={styles.stepLabel}>{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`${styles.stepLine} ${isCompleted ? styles.lineCompleted : ''}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Messaging Area */}
        {errorMessage && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className={styles.successAlert}>
            <FiCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Step Forms */}
        <div className={styles.formContainer}>
          
          {/* STEP 1: eKYC Form */}
          {currentStep === 1 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>1. eKYC Aadhaar Authentication</h2>
              
              <div className={styles.ekycGrid}>
                {/* Inputs & Capture Side */}
                <div className={styles.ekycInputsSide}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Aadhaar Card Number</label>
                    <div className={styles.actionInputWrap}>
                      <input 
                        type="text" 
                        placeholder="12-digit Aadhaar Number"
                        maxLength={12}
                        className={styles.formInput}
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        disabled={aadhaarVerified}
                      />
                      {aadhaarVerified ? (
                        <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                          <FiCheckCircle /> Verified
                        </button>
                      ) : (
                        <button 
                          className={styles.inlineActionBtn}
                          onClick={handleSendAadhaarOtp}
                          disabled={isSendingOtp || resendTimer > 0}
                        >
                          {isSendingOtp ? <><FiLoader className={styles.spinIcon} /> Sending...</> : (otpSent ? 'Resend' : 'Send OTP')}
                        </button>
                      )}
                    </div>
                    {resendTimer > 0 && !aadhaarVerified && (
                      <span className={styles.timerText}>Resend available in {resendTimer}s</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Enter Aadhaar OTP (Demo: 123456)</label>
                    <div className={styles.actionInputWrap}>
                      <input 
                        type="text" 
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className={styles.formInput}
                        value={aadhaarOtp}
                        onChange={(e) => setAadhaarOtp(e.target.value)}
                        disabled={aadhaarVerified || !otpSent}
                      />
                      {aadhaarVerified ? (
                        <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                          <FiCheckCircle /> Verified
                        </button>
                      ) : (
                        <button 
                          className={styles.inlineActionBtn}
                          onClick={handleVerifyAadhaarOtp}
                          disabled={!otpSent || isVerifyingOtp}
                        >
                          {isVerifyingOtp ? <><FiLoader className={styles.spinIcon} /> Verifying...</> : 'Verify OTP'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selfie Capture Box moved below OTP */}
                  {aadhaarVerified && (
                    <div className={styles.cameraBoxWrap} style={{ marginTop: '20px', width: '100%' }}>
                      <h3 className={styles.cameraTitle}>Live Selfie / Photo</h3>
                      
                      <div className={styles.cameraScreen} style={{ width: '100%', height: '140px' }}>
                        {capturingPhoto ? (
                          <div className={styles.capturingOverlay}>
                            <div className={styles.scannerLaser}></div>
                            <div className={styles.faceGuideFrame}></div>
                            <FiSmile className={styles.smileIconPulse} />
                            <span style={{ position: 'relative', zIndex: 3 }}>Verifying face...</span>
                          </div>
                        ) : isPhotoCaptured ? (
                          <img src={capturedPhotoUrl} alt="Captured Selfie" className={styles.capturedPhoto} />
                        ) : (
                          <div className={styles.emptyCameraScreen}>
                            <div className={styles.faceGuideFrameIdle}></div>
                            <FiCamera className={styles.cameraIconPlaceholder} />
                            <span>Webcam feed ready</span>
                          </div>
                        )}
                      </div>

                      <button 
                        className={`${styles.cameraCaptureBtn} ${isPhotoCaptured ? styles.verifiedBtn : ''}`}
                        onClick={handleCapturePhoto}
                        disabled={capturingPhoto || isPhotoCaptured}
                        style={{ width: '100%' }}
                      >
                        {capturingPhoto ? <><FiLoader className={styles.spinIcon} /> Verifying...</> : 
                         isPhotoCaptured ? <><FiCheckCircle /> Captured</> : <><FiCamera /> Capture Selfie</>}
                      </button>
                    </div>
                  )}
                </div>

                {/* Aadhaar User Details Card (Right Side) */}
                <div className={styles.aadhaarDetailsCardWrap}>
                  {aadhaarVerified ? (
                    <div className={styles.aadhaarVerifiedCard}>
                      <div className={styles.verifiedBadgeRow}>
                        <span className={styles.aadhaarVerifiedPill}>
                          <FiCheckCircle /> AADHAAR CARD VERIFIED
                        </span>
                      </div>
                      
                      <div className={styles.aadhaarUserBody}>
                        <div className={styles.aadhaarUserPhoto}>
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                            alt="Vishnu Prajapat" 
                          />
                        </div>
                        
                        <div className={styles.aadhaarUserDetails}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Full Name</span>
                            <span className={styles.detailVal}>Vishnu Prajapat</span>
                          </div>
                          
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Aadhaar Number</span>
                            <span className={styles.detailVal}>XXXX-XXXX-{aadhaarNumber.slice(-4) || '1234'}</span>
                          </div>

                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Mobile Number</span>
                            <span className={styles.detailVal}>9876543210</span>
                          </div>
                          
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Date of Birth</span>
                            <span className={styles.detailVal}>12/05/1998</span>
                          </div>
                          
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Gender</span>
                            <span className={styles.detailVal}>Male</span>
                          </div>
                          
                          <div className={styles.detailRow} style={{ gridColumn: 'span 2' }}>
                            <span className={styles.detailLabel}>Address</span>
                            <span className={styles.detailVal}>123, Main Street, Near City Palace, Jaipur, Rajasthan - 302001</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.aadhaarCardLockOverlay}>
                      <FiLock className={styles.lockIconLarge} />
                      <h3>Aadhaar KYC Details Locked</h3>
                      <p>Complete the 12-digit Aadhaar & OTP verification on the left to securely fetch and display card details.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAN Form */}
          {currentStep === 2 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>2. PAN Card Verification</h2>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Permanent Account Number (PAN)</label>
                <div className={styles.actionInputWrap}>
                  <input 
                    type="text" 
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    className={styles.formInput}
                    value={panNumber.toUpperCase()}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    disabled={panVerified}
                  />
                  {panVerified ? (
                    <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                      <FiCheckCircle /> Verified
                    </button>
                  ) : (
                    <button 
                      className={styles.inlineActionBtn}
                      onClick={handleVerifyPan}
                      disabled={panLoading}
                    >
                      {panLoading ? <><FiLoader className={styles.spinIcon} /> Verifying...</> : 'Verify PAN'}
                    </button>
                  )}
                </div>
              </div>

              {panVerified && (
                <div className={styles.verifiedDataPanel}>
                  <h4 className={styles.verifiedHeader}>NSDL Matches Found:</h4>
                  <div className={styles.verifiedDataRow}>
                    <strong>Name on PAN:</strong>
                    <span>{panName}</span>
                  </div>
                  <div className={styles.verifiedDataRow}>
                    <strong>Status:</strong>
                    <span className={styles.statusActiveLabel}>Active & Verified</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Basic Profile Form */}
          {currentStep === 3 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>3. Basic Profile Details</h2>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Member Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter name"
                    className={styles.formInput}
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Shop / Company Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter shop name"
                    className={styles.formInput}
                    value={profileData.shopName}
                    onChange={(e) => setProfileData({...profileData, shopName: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Primary Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter email"
                    className={styles.formInput}
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Nominee Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter nominee name"
                    className={styles.formInput}
                    value={profileData.nomineeName}
                    onChange={(e) => setProfileData({...profileData, nomineeName: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Nominee Relationship</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Spouse, Father"
                    className={styles.formInput}
                    value={profileData.nomineeRelation}
                    onChange={(e) => setProfileData({...profileData, nomineeRelation: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Source of Funds</label>
                  <select 
                    className={styles.formSelect}
                    value={profileData.sourceOfFunds}
                    onChange={(e) => setProfileData({...profileData, sourceOfFunds: e.target.value})}
                  >
                    <option value="">Select source</option>
                    <option value="business_savings">Business Savings</option>
                    <option value="family_inheritance">Family Inheritance</option>
                    <option value="investments">Investments</option>
                    <option value="others">Other Savings</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Account Opening Purpose</label>
                  <select 
                    className={styles.formSelect}
                    value={profileData.purpose}
                    onChange={(e) => setProfileData({...profileData, purpose: e.target.value})}
                  >
                    <option value="">Select purpose</option>
                    <option value="business_settlements">Business Settlements & Payouts</option>
                    <option value="api_integrations">API Banking Integrations</option>
                    <option value="customer_deposits">Customer Deposits Collection</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                <label className={styles.inputLabel}>Registered Shop/Business Address</label>
                <textarea 
                  placeholder="Enter full business address"
                  className={styles.formTextarea}
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Company Selection */}
          {currentStep === 4 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>4. Select Business Legal Entity Type</h2>

              <div className={styles.companyGrid}>
                {COMPANY_TYPES.map((type) => {
                  const isSelected = selectedCompanyType === type.id;
                  const Icon = type.icon;
                  return (
                    <div 
                      key={type.id} 
                      className={`${styles.companyCard} ${isSelected ? styles.companyCardActive : ''}`}
                      onClick={() => {
                        setSelectedCompanyType(type.id);
                        setCompletedSteps(prev => ({ ...prev, 4: true }));
                      }}
                    >
                      <Icon className={styles.companyIcon} />
                      <h4 className={styles.companyLabel}>{type.label}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Business Information */}
          {currentStep === 5 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>5. Business Information</h2>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Legal Business Name</label>
                  <input 
                    type="text" 
                    placeholder="As registered in legal documents"
                    className={styles.formInput}
                    value={businessData.legalName}
                    onChange={(e) => setBusinessData({...businessData, legalName: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Trade Name</label>
                  <input 
                    type="text" 
                    placeholder="Brand / Doing Business As"
                    className={styles.formInput}
                    value={businessData.tradeName}
                    onChange={(e) => setBusinessData({...businessData, tradeName: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Business Category</label>
                  <select 
                    className={styles.formSelect}
                    value={businessData.category}
                    onChange={(e) => setBusinessData({...businessData, category: e.target.value})}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="FinTech">FinTech</option>
                    <option value="Travel">Travel</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Business Website</label>
                  <input 
                    type="text" 
                    placeholder="e.g. www.mysite.com"
                    className={styles.formInput}
                    value={businessData.website}
                    onChange={(e) => setBusinessData({...businessData, website: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Support Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. support@mysite.com"
                    className={styles.formInput}
                    value={businessData.supportEmail}
                    onChange={(e) => setBusinessData({...businessData, supportEmail: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Support Mobile</label>
                  <input 
                    type="text" 
                    placeholder="10-digit number"
                    className={styles.formInput}
                    value={businessData.supportMobile}
                    onChange={(e) => setBusinessData({...businessData, supportMobile: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Business Start Date</label>
                  <input 
                    type="date" 
                    className={styles.formInput}
                    value={businessData.startDate}
                    onChange={(e) => setBusinessData({...businessData, startDate: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Annual Turnover</label>
                  <select 
                    className={styles.formSelect}
                    value={businessData.turnover}
                    onChange={(e) => setBusinessData({...businessData, turnover: e.target.value})}
                  >
                    <option value="Below 10 Lakh">Below 10 Lakh</option>
                    <option value="10-50 Lakh">10-50 Lakh</option>
                    <option value="50 Lakh - 1 Crore">50 Lakh - 1 Crore</option>
                    <option value="1 Crore - 5 Crore">1 Crore - 5 Crore</option>
                    <option value="Above 5 Crore">Above 5 Crore</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                <label className={styles.inputLabel}>Nature of Business</label>
                <textarea 
                  placeholder="Describe your core business operations..."
                  className={styles.formTextarea}
                  value={businessData.nature}
                  onChange={(e) => setBusinessData({...businessData, nature: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 6: GST / CIN / LLP Information */}
          {currentStep === 6 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>6. GST / CIN / LLP Information</h2>

              <div className={styles.formGrid}>
                
                {/* GST Number verification */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>GST Number (Demo: 22AAAAA0000A1Z5)</label>
                  <div className={styles.actionInputWrap}>
                    <input 
                      type="text" 
                      placeholder="15-digit GSTIN"
                      maxLength={15}
                      className={styles.formInput}
                      value={gstData.gstNumber.toUpperCase()}
                      onChange={(e) => setGstData({...gstData, gstNumber: e.target.value.toUpperCase()})}
                      disabled={gstData.gstVerified}
                    />
                    {gstData.gstVerified ? (
                      <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                        <FiCheckCircle /> Verified
                      </button>
                    ) : (
                      <button 
                        className={styles.inlineActionBtn}
                        onClick={handleVerifyGst}
                        disabled={gstLoading}
                      >
                        {gstLoading ? <><FiLoader className={styles.spinIcon} /> Verifying...</> : 'Verify GST'}
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>GST Registration Date</label>
                  <input 
                    type="date" 
                    className={styles.formInput}
                    value={gstData.gstRegDate}
                    onChange={(e) => setGstData({...gstData, gstRegDate: e.target.value})}
                  />
                </div>

                {/* CIN Number verification */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>CIN Number (Company - 21 Chars)</label>
                  <div className={styles.actionInputWrap}>
                    <input 
                      type="text" 
                      placeholder="e.g. U72900MH2020PTC345678"
                      maxLength={21}
                      className={styles.formInput}
                      value={gstData.cinNumber.toUpperCase()}
                      onChange={(e) => setGstData({...gstData, cinNumber: e.target.value.toUpperCase()})}
                      disabled={gstData.cinVerified}
                    />
                    {gstData.cinVerified ? (
                      <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                        <FiCheckCircle /> Verified
                      </button>
                    ) : (
                      <button 
                        className={styles.inlineActionBtn}
                        onClick={handleVerifyCin}
                        disabled={cinLoading}
                      >
                        {cinLoading ? <><FiLoader className={styles.spinIcon} /> Verifying...</> : 'Verify CIN'}
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>LLPIN (LLP Only)</label>
                  <input 
                    type="text" 
                    placeholder="LLP Identification Number"
                    className={styles.formInput}
                    value={gstData.llpin}
                    onChange={(e) => setGstData({...gstData, llpin: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>MSME / UDYAM Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. UDYAM-XX-00-1234567"
                    className={styles.formInput}
                    value={gstData.msme}
                    onChange={(e) => setGstData({...gstData, msme: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Certificate of Incorporation No.</label>
                  <input 
                    type="text" 
                    placeholder="COI Reference Number"
                    className={styles.formInput}
                    value={gstData.coiNumber}
                    onChange={(e) => setGstData({...gstData, coiNumber: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.inputLabel}>Business Registration Authority</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ROC Mumbai / MSME / Registrar of Firms"
                    className={styles.formInput}
                    value={gstData.authority}
                    onChange={(e) => setGstData({...gstData, authority: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Registered Office Address */}
          {currentStep === 7 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>7. Registered Office Address</h2>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.inputLabel}>Address Line 1</label>
                  <input 
                    type="text" 
                    placeholder="Flat / Room No, Building Name"
                    className={styles.formInput}
                    value={officeAddress.line1}
                    onChange={(e) => setOfficeAddress({...officeAddress, line1: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.inputLabel}>Address Line 2</label>
                  <input 
                    type="text" 
                    placeholder="Street, Area, Locality"
                    className={styles.formInput}
                    value={officeAddress.line2}
                    onChange={(e) => setOfficeAddress({...officeAddress, line2: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>State</label>
                  <input 
                    type="text" 
                    placeholder="State Name"
                    className={styles.formInput}
                    value={officeAddress.state}
                    onChange={(e) => setOfficeAddress({...officeAddress, state: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>District</label>
                  <input 
                    type="text" 
                    placeholder="District Name"
                    className={styles.formInput}
                    value={officeAddress.district}
                    onChange={(e) => setOfficeAddress({...officeAddress, district: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>City</label>
                  <input 
                    type="text" 
                    placeholder="City Name"
                    className={styles.formInput}
                    value={officeAddress.city}
                    onChange={(e) => setOfficeAddress({...officeAddress, city: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Pincode</label>
                  <input 
                    type="text" 
                    placeholder="6-digit pin"
                    maxLength={6}
                    className={styles.formInput}
                    value={officeAddress.pincode}
                    onChange={(e) => setOfficeAddress({...officeAddress, pincode: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Latitude</label>
                  <input 
                    type="text" 
                    placeholder="Latitude coordinate"
                    className={styles.formInput}
                    value={officeAddress.latitude}
                    onChange={(e) => setOfficeAddress({...officeAddress, latitude: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Longitude</label>
                  <input 
                    type="text" 
                    placeholder="Longitude coordinate"
                    className={styles.formInput}
                    value={officeAddress.longitude}
                    onChange={(e) => setOfficeAddress({...officeAddress, longitude: e.target.value})}
                  />
                </div>

                {/* File Uploads for Office */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Office Photo</label>
                  <div className={styles.fileUploaderBox}>
                    {officeAddress.officePhoto ? (
                      <span className={styles.uploadedFileBadge}>
                        📄 {officeAddress.officePhoto}
                        <button className={styles.fileRemover} onClick={() => setOfficeAddress({...officeAddress, officePhoto: ''})}>✕</button>
                      </span>
                    ) : (
                      <label className={styles.customFileBtn}>
                        <FiUploadCloud /> Choose File
                        <input type="file" onChange={(e) => handleOfficeFileChange('officePhoto', e)} className={styles.hiddenFile} />
                      </label>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Proof</label>
                  <div className={styles.fileUploaderBox}>
                    {officeAddress.addressProof ? (
                      <span className={styles.uploadedFileBadge}>
                        📄 {officeAddress.addressProof}
                        <button className={styles.fileRemover} onClick={() => setOfficeAddress({...officeAddress, addressProof: ''})}>✕</button>
                      </span>
                    ) : (
                      <label className={styles.customFileBtn}>
                        <FiUploadCloud /> Choose File
                        <input type="file" onChange={(e) => handleOfficeFileChange('addressProof', e)} className={styles.hiddenFile} />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 8: Director / Partner Details (Dynamic Form) */}
          {currentStep === 8 && (
            <div className={styles.stepFade}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className={styles.stepTitle}>8. Director / Partner Details</h2>
                <button type="button" onClick={handleAddDirector} className={styles.addDirectorBtn}>
                  <FiPlus /> Add Director / Partner
                </button>
              </div>

              {directors.map((dir, idx) => (
                <div key={idx} className={styles.directorCard}>
                  <div className={styles.directorCardHeader}>
                    <h3>Director / Partner {idx + 1}</h3>
                    {directors.length > 1 && (
                      <button type="button" onClick={() => handleRemoveDirector(idx)} className={styles.removeDirectorBtn}>
                        <FiTrash2 /> Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="As in PAN"
                        className={styles.formInput}
                        value={dir.name}
                        onChange={(e) => handleDirectorChange(idx, 'name', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Designation</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Director, Partner"
                        className={styles.formInput}
                        value={dir.designation}
                        onChange={(e) => handleDirectorChange(idx, 'designation', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Date of Birth</label>
                      <input 
                        type="date" 
                        className={styles.formInput}
                        value={dir.dob}
                        onChange={(e) => handleDirectorChange(idx, 'dob', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Mobile Number</label>
                      <input 
                        type="text" 
                        placeholder="10-digit mobile"
                        className={styles.formInput}
                        value={dir.mobile}
                        onChange={(e) => handleDirectorChange(idx, 'mobile', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="Enter email"
                        className={styles.formInput}
                        value={dir.email}
                        onChange={(e) => handleDirectorChange(idx, 'email', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>DIN (If Applicable)</label>
                      <input 
                        type="text" 
                        placeholder="Director Identification Number"
                        className={styles.formInput}
                        value={dir.din}
                        onChange={(e) => handleDirectorChange(idx, 'din', e.target.value)}
                      />
                    </div>

                    {/* Director PAN Verification */}
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>PAN Number</label>
                      <div className={styles.actionInputWrap}>
                        <input 
                          type="text" 
                          placeholder="e.g. ABCDE1234F"
                          maxLength={10}
                          className={styles.formInput}
                          value={dir.panNumber.toUpperCase()}
                          onChange={(e) => handleDirectorChange(idx, 'panNumber', e.target.value.toUpperCase())}
                          disabled={dir.panVerified}
                        />
                        {dir.panVerified ? (
                          <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                            <FiCheckCircle /> Verified
                          </button>
                        ) : (
                          <button 
                            className={styles.inlineActionBtn}
                            onClick={() => handleVerifyDirectorPan(idx)}
                            disabled={dirVerificationLoading[`pan_${idx}`]}
                          >
                            {dirVerificationLoading[`pan_${idx}`] ? <><FiLoader className={styles.spinIcon} />...</> : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Director Aadhaar Verification */}
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Aadhaar Number</label>
                      <div className={styles.actionInputWrap}>
                        <input 
                          type="text" 
                          placeholder="12-digit Aadhaar"
                          maxLength={12}
                          className={styles.formInput}
                          value={dir.aadhaarNumber}
                          onChange={(e) => handleDirectorChange(idx, 'aadhaarNumber', e.target.value)}
                          disabled={dir.aadhaarVerified}
                        />
                        {dir.aadhaarVerified ? (
                          <button className={`${styles.inlineActionBtn} ${styles.verifiedBtn}`} disabled>
                            <FiCheckCircle /> Verified
                          </button>
                        ) : (
                          <button 
                            className={styles.inlineActionBtn}
                            onClick={() => handleVerifyDirectorAadhaar(idx)}
                            disabled={dirVerificationLoading[`aadhaar_${idx}`]}
                          >
                            {dirVerificationLoading[`aadhaar_${idx}`] ? <><FiLoader className={styles.spinIcon} />...</> : 'KYC'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Photograph</label>
                      <div className={styles.fileUploaderBox}>
                        {dir.photograph ? (
                          <span className={styles.uploadedFileBadge}>
                            📄 {dir.photograph}
                            <button className={styles.fileRemover} onClick={() => handleDirectorChange(idx, 'photograph', '')}>✕</button>
                          </span>
                        ) : (
                          <label className={styles.customFileBtn}>
                            <FiUploadCloud /> Upload Photo
                            <input type="file" onChange={(e) => handleDirectorFileChange(idx, e)} className={styles.hiddenFile} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.inputLabel}>Residential Address</label>
                      <textarea 
                        placeholder="Enter full residential address..."
                        className={styles.formTextarea}
                        value={dir.address}
                        onChange={(e) => handleDirectorChange(idx, 'address', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 9: Authorized Contact Person */}
          {currentStep === 9 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>9. Authorized Contact Person</h2>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Contact Person Name</label>
                  <input 
                    type="text" 
                    placeholder="Full legal name"
                    className={styles.formInput}
                    value={authorizedPerson.name}
                    onChange={(e) => setAuthorizedPerson({...authorizedPerson, name: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Compliance Officer, CEO"
                    className={styles.formInput}
                    value={authorizedPerson.designation}
                    onChange={(e) => setAuthorizedPerson({...authorizedPerson, designation: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="10-digit number"
                    className={styles.formInput}
                    value={authorizedPerson.mobile}
                    onChange={(e) => setAuthorizedPerson({...authorizedPerson, mobile: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. contact@mysite.com"
                    className={styles.formInput}
                    value={authorizedPerson.email}
                    onChange={(e) => setAuthorizedPerson({...authorizedPerson, email: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Office Telephone</label>
                  <input 
                    type="text" 
                    placeholder="Landline / Tel number"
                    className={styles.formInput}
                    value={authorizedPerson.telephone}
                    onChange={(e) => setAuthorizedPerson({...authorizedPerson, telephone: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Alternate Mobile</label>
                  <input 
                    type="text" 
                    placeholder="Secondary contact number"
                    className={styles.formInput}
                    value={authorizedPerson.altMobile}
                    onChange={(e) => setAuthorizedPerson({...authorizedPerson, altMobile: e.target.value})}
                  />
                </div>

                {/* Files uploads for Authorized Person */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Identity Proof</label>
                  <div className={styles.fileUploaderBox}>
                    {authorizedPerson.idProof ? (
                      <span className={styles.uploadedFileBadge}>
                        📄 {authorizedPerson.idProof}
                        <button className={styles.fileRemover} onClick={() => setAuthorizedPerson({...authorizedPerson, idProof: ''})}>✕</button>
                      </span>
                    ) : (
                      <label className={styles.customFileBtn}>
                        <FiUploadCloud /> Upload ID
                        <input type="file" onChange={(e) => handleAuthPersonFileChange('idProof', e)} className={styles.hiddenFile} />
                      </label>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Proof</label>
                  <div className={styles.fileUploaderBox}>
                    {authorizedPerson.addressProof ? (
                      <span className={styles.uploadedFileBadge}>
                        📄 {authorizedPerson.addressProof}
                        <button className={styles.fileRemover} onClick={() => setAuthorizedPerson({...authorizedPerson, addressProof: ''})}>✕</button>
                      </span>
                    ) : (
                      <label className={styles.customFileBtn}>
                        <FiUploadCloud /> Upload Address Proof
                        <input type="file" onChange={(e) => handleAuthPersonFileChange('addressProof', e)} className={styles.hiddenFile} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Dynamic Document Uploads */}
          {currentStep === 10 && (
            <div className={styles.stepFade}>
              <h2 className={styles.stepTitle}>
                10. Onboarding Document Upload (
                {COMPANY_TYPES.find(c => c.id === selectedCompanyType)?.label || 'Proprietorship'}
                )
              </h2>

              <div className={styles.documentList}>
                {(DOCUMENT_CHECKLISTS[selectedCompanyType || 'proprietorship'] || DOCUMENT_CHECKLISTS.proprietorship).map((doc) => {
                  const hasFile = uploadedFiles[doc.key];
                  return (
                    <div key={doc.key} className={styles.documentUploadRow}>
                      <div className={styles.docInfo}>
                        <span className={styles.docLabel}>
                          {doc.label} {doc.required && <span className={styles.reqStar}>*</span>}
                        </span>
                        {hasFile && <span className={styles.fileNameText}>📄 {uploadedFiles[doc.key]}</span>}
                      </div>

                      <div className={styles.docActions}>
                        {hasFile ? (
                          <button 
                            className={styles.removeFileBtn}
                            onClick={() => handleRemoveFile(doc.key)}
                          >
                            <FiTrash2 /> Remove
                          </button>
                        ) : (
                          <label className={styles.fileLabel}>
                            <FiUploadCloud /> Upload
                            <input 
                              type="file" 
                              className={styles.hiddenFile}
                              onChange={(e) => handleFileUpload(doc.key, e)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 11: Review & Final Onboarding Status */}
          {currentStep === 11 && (
            <div className={styles.stepFade}>
              <div className={styles.successScreenCard}>
                <div className={styles.successPulseWrap}>
                  <FiCheckCircle className={styles.finalSuccessIcon} />
                </div>
                <h2 className={styles.finalTitle}>Onboarding Documents Submitted</h2>
                <div className={styles.pendingBadgeWrap}>
                  PENDING KYC VERIFICATION
                </div>
                <p className={styles.finalDesc}>
                  Our accounts team is reviewing your digital eKYC, PAN, business details, registration documents, and director details. 
                  You will receive a notification as soon as verification completes.
                </p>
                
                <div className={styles.reviewSummaryPanel}>
                  <h3>Verification Details</h3>
                  <div className={styles.summaryRow}>
                    <span>Aadhaar Number:</span>
                    <span>********{aadhaarNumber.slice(-4) || '1234'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>PAN Card:</span>
                    <span>{panNumber.toUpperCase() || 'ABCDE1234F'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Business Type:</span>
                    <span>{COMPANY_TYPES.find(c => c.id === selectedCompanyType)?.label || 'Proprietorship'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Business Name:</span>
                    <span>{businessData.legalName || 'N/A'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Trade Name:</span>
                    <span>{businessData.tradeName || 'N/A'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>GST Number:</span>
                    <span>{gstData.gstNumber || 'N/A'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Office Pin:</span>
                    <span>{officeAddress.pincode || 'N/A'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Authorized Contact:</span>
                    <span>{authorizedPerson.name || 'N/A'}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Total Directors Added:</span>
                    <span>{directors.length}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Documents Uploaded:</span>
                    <span>{Object.keys(uploadedFiles).length} files</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        {currentStep < 11 && (
          <div className={styles.wizardControls}>
            {currentStep > 1 && currentStep < 11 && (
              <button 
                className={styles.backBtn}
                onClick={() => {
                  setCurrentStep(prev => prev - 1);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                <FiChevronLeft /> Back
              </button>
            )}

            {currentStep === 10 ? (
              <button 
                className={styles.nextBtn}
                onClick={() => {
                  if (checkDocsComplete()) {
                    setCompletedSteps(prev => ({ ...prev, 10: true, 11: true }));
                    setErrorMessage('');
                    setSuccessMessage('');
                    setCurrentStep(11);
                  } else {
                    setErrorMessage('Please upload all required onboarding documents.');
                  }
                }}
              >
                Submit Onboarding <FiChevronRight />
              </button>
            ) : currentStep < 11 ? (
              <button 
                className={styles.nextBtn}
                onClick={() => {
                  setCompletedSteps(prev => ({ ...prev, [currentStep]: true }));
                  setErrorMessage('');
                  setSuccessMessage('');
                  setCurrentStep(prev => prev + 1);
                }}
              >
                Next <FiChevronRight />
              </button>
            ) : null}
          </div>
        )}

        {/* Footer Reference */}
        {currentStep < 11 && (
          <div className={styles.complianceFooter}>
            <FiInfo />
            <span>Onboarding is compliant with RBI KYC Master Directions and anti-money laundering (AML) protocols.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberOnboardingWizard;
