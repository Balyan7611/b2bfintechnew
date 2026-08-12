import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaMapMarkerAlt, FaCity, FaMailBulk, FaIdCard, FaChevronDown, FaCheck,
         FaEnvelope, FaArrowRight, FaCheckCircle, FaPhoneAlt, FaGlobe, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { saveUser } from '../../utils/authUtils';
import { SITE_CONFIG } from '../../config/siteConfig';
import styles from '../../pages/RegisterDetailsPage.module.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry',
];

const RegisterDetailsPage = () => {
  const navigate = useNavigate();
  const { mobile, pan } = useSelector((s) => s.registration);

  const [currentStep, setCurrentStep] = useState(1);
  const [kycState, setKycState] = useState('initial');   const [kycForm, setKycForm] = useState({
    memberType: 'Retailer', mobile: mobile || '', otp: '', pan: pan || ''
  });
  const [form, setForm] = useState({
    fullName: '', shopName: '', address: '', shopCity: '',
    city: '', pincode: '', aadhar: '', email: '',
    shopState: '', shopAddress: '', state: '', mobile: mobile || '',
  });

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isMemberTypeOpen, setIsMemberTypeOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    let val = e.target ? e.target.value : e;
    if (key === 'pincode') val = val.replace(/\D/g, '').slice(0, 6);
    if (key === 'aadhar') {
      val = val.replace(/\D/g, '').slice(0, 12);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  useEffect(() => {
    if (form.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${form.pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setForm(f => ({
              ...f,
              state: postOffice.State,
              city: postOffice.District
            }));
            setErrors(e => ({ ...e, state: '', city: '' }));
          }
        })
        .catch(err => console.error('Pincode fetch error:', err));
    }
  }, [form.pincode]);

  const setKyc = (key) => (e) => {
    let val = e.target ? e.target.value : e;
    if (key === 'mobile') val = val.replace(/\D/g, '').slice(0, 10);
    if (key === 'otp') val = val.replace(/\D/g, '').slice(0, 6);
    if (key === 'pan') val = val.toUpperCase().slice(0, 10);
    setKycForm((f) => ({ ...f, [key]: val }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const handleSendOtp = () => {
    if (kycForm.mobile.length !== 10) {
      setErrors(e => ({...e, mobile: 'Valid 10-digit mobile required'}));
      return;
    }
    setKycState('otp_sent');
  };

  const handleVerifyOtp = () => {
    if (kycForm.otp.length < 4) {
      setErrors(e => ({...e, otp: 'Invalid OTP'}));
      return;
    }
    setKycState('verified');
  };

  const validateKyc = () => {
    const e = {};
    if (kycState !== 'verified') e.mobile = 'Mobile number must be verified';
    if (!kycForm.pan || kycForm.pan.length < 10) e.pan = 'Valid PAN required';
    return e;
  };

  const handleKycSubmit = (ev) => {
    ev.preventDefault();
    const e = validateKyc();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setForm(f => ({ ...f, mobile: kycForm.mobile }));
    setCurrentStep(2);
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())   e.fullName  = 'Required';
    if (!form.shopName.trim())   e.shopName  = 'Required';
    if (!form.address.trim())    e.address   = 'Required';
    if (!form.city.trim())       e.city      = 'Required';
    if (form.pincode.length < 6) e.pincode   = 'Invalid';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.state)             e.state     = 'Select state';
    if (!form.mobile)            e.mobile    = 'Required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const adminId = form.mobile;
      // TODO: Replace with real API registration. Local fallback generates a temp password.
      const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
      saveUser({
        adminId, password, mobile: adminId, pan,
        fullName: form.fullName, shopName: form.shopName,
        email: form.email, state: form.state, city: form.city,
        pincode: form.pincode,
      });
      setSubmitting(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.registerContainer}>
                <div className={styles.sidePanel}>
           <Link to="/" className={styles.logoLink}>
              <img src={SITE_CONFIG.logo} alt="Logo" className={styles.logoImg} />
           </Link>
           
           <div className={styles.progressStepper}>
              <div className={styles.step}>
                 <div className={`${styles.stepCircle} ${currentStep > 1 ? styles.stepDone : styles.stepActive}`}>
                   {currentStep > 1 ? <FaCheckCircle /> : 1}
                 </div>
                 <div className={styles.stepText}>
                    <span className={styles.stepLabel}>KYC VERIFIED</span>
                    <span className={styles.stepDesc}>OTP & Identity check complete</span>
                 </div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>
                 <div className={`${styles.stepCircle} ${currentStep === 2 ? styles.stepActive : ''}`}>2</div>
                 <div className={styles.stepText}>
                    <span className={styles.stepLabel}>BUSINESS PROFILE</span>
                    <span className={styles.stepDesc}>Setup your work portal</span>
                 </div>
              </div>
           </div>

           <div className={styles.sideFooter}>
              <div className={styles.trustInfo}>
                 <FaShieldAlt />
                 <span>ISO 9001:2015 Certified</span>
              </div>
           </div>
        </div>

                <div className={styles.formPanel}>
           <div className={styles.topToolbar}>
              <button className={styles.backBtn} onClick={() => {
                if (currentStep === 2) setCurrentStep(1);
                else navigate(-1);
              }}>
                 <FaArrowLeft /> <span>Back</span>
              </button>
           </div>

           {currentStep === 1 ? (
             <>
               <div className={styles.formHeader}>
                  <h1 className={styles.pageTitle}>KYC Verification</h1>
                  <p className={styles.pageSub}>Let's start with your basic details.</p>
               </div>
               <form onSubmit={handleKycSubmit} className={styles.mainForm}>
                  <div className={styles.section}>
                     <div className={styles.sectionTitle}>
                        <FaIdCard /> <span>Verification Details</span>
                     </div>
                     <div className={styles.formGrid}>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                           <label>MEMBER TYPE</label>
                           <div className={styles.dropdownContainer}>
                              <div className={styles.inputWrap}>
                                 <FaUser className={styles.inputIcon} />
                                 <button 
                                   type="button" 
                                   className={`${styles.customSelect} ${isMemberTypeOpen ? styles.selectOpen : ''}`}
                                   onClick={() => setIsMemberTypeOpen(!isMemberTypeOpen)}
                                 >
                                   <span className={kycForm.memberType ? styles.activeValue : styles.placeholder}>
                                     {kycForm.memberType || 'Select Type'}
                                   </span>
                                   <FaChevronDown className={`${styles.chevron} ${isMemberTypeOpen ? styles.chevronUp : ''}`} />
                                 </button>
                              </div>
                              {isMemberTypeOpen && (
                                <div className={styles.dropdownMenu}>
                                   {['Retailer', 'Distributor', 'Master Distributor'].map(m => (
                                     <button 
                                       key={m} 
                                       type="button" 
                                       className={`${styles.dropdownOption} ${kycForm.memberType === m ? styles.optionSelected : ''}`}
                                       onClick={() => { setKyc('memberType')(m); setIsMemberTypeOpen(false); }}
                                     >
                                       <span>{m}</span>
                                       {kycForm.memberType === m && <FaCheck className={styles.checkIcon} />}
                                     </button>
                                   ))}
                                </div>
                              )}
                           </div>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                           <label>MOBILE NUMBER</label>
                           <div className={styles.inputWithBtn}>
                              <div className={styles.inputWrap}>
                                 <FaPhoneAlt className={styles.inputIcon} />
                                 <input 
                                   placeholder="10-digit number" 
                                   value={kycForm.mobile} 
                                   onChange={setKyc('mobile')} 
                                   disabled={kycState === 'verified'}
                                   required 
                                 />
                                 {kycState === 'verified' && <FaCheckCircle className={styles.verifiedIcon} />}
                              </div>
                              {kycState === 'initial' ? (
                                <button type="button" onClick={handleSendOtp} className={styles.verifyBtn}>
                                  Send OTP
                                </button>
                              ) : (
                                <button type="button" className={styles.verifyBtn} disabled style={{ background: '#10B981', cursor: 'default' }}>
                                  {kycState === 'verified' ? 'Verified' : 'Sent'}
                                </button>
                              )}
                           </div>
                           {errors.mobile && <span className={styles.errorText}>{errors.mobile}</span>}
                        </div>

                        {kycState === 'otp_sent' && (
                           <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                              <label>ENTER OTP</label>
                              <div className={styles.inputWithBtn}>
                                 <div className={styles.inputWrap}>
                                    <FaCheck className={styles.inputIcon} />
                                    <input 
                                      placeholder="Enter 4-digit OTP" 
                                      value={kycForm.otp} 
                                      onChange={setKyc('otp')} 
                                      autoFocus
                                    />
                                 </div>
                                 <button type="button" onClick={handleVerifyOtp} className={styles.verifyBtn}>
                                   Verify
                                 </button>
                              </div>
                              {errors.otp && <span className={styles.errorText}>{errors.otp}</span>}
                           </div>
                        )}

                        <div className={styles.formGroup} style={{ gridColumn: 'span 2', opacity: kycState === 'verified' ? 1 : 0.5, pointerEvents: kycState === 'verified' ? 'auto' : 'none' }}>
                           <label>PAN NUMBER</label>
                           <div className={styles.inputWrap}>
                              <FaIdCard className={styles.inputIcon} />
                              <input 
                                placeholder="ABCDE1234F" 
                                value={kycForm.pan} 
                                onChange={setKyc('pan')} 
                                required={kycState === 'verified'} 
                                disabled={kycState !== 'verified'}
                              />
                           </div>
                           {errors.pan && <span className={styles.errorText}>{errors.pan}</span>}
                        </div>
                     </div>
                  </div>
                  <div className={styles.formFooter}>
                     <button type="submit" className={styles.primaryBtn} disabled={kycState !== 'verified'}>
                        Next Step <FaArrowRight />
                     </button>
                     <div className={styles.footerLoginHint}>
                        Already registered? <Link to="/login">Login here</Link>
                     </div>
                  </div>
               </form>
             </>
           ) : (
             <>
               <div className={styles.formHeader}>
                  <h1 className={styles.pageTitle}>Complete Your Profile</h1>
                  <p className={styles.pageSub}>Enter your business details to finalize your registration.</p>
               </div>

               <form onSubmit={handleSubmit} className={styles.mainForm}>
                  <div className={styles.section}>
                 <div className={styles.sectionTitle}>
                    <FaUser /> <span>Personal Details</span>
                 </div>
                 <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                       <label>FULL NAME</label>
                       <div className={styles.inputWrap}>
                          <FaUser className={styles.inputIcon} />
                          <input placeholder="As per PAN card" value={form.fullName} onChange={set('fullName')} required />
                       </div>
                    </div>
                    <div className={styles.formGroup}>
                       <label>EMAIL ID</label>
                       <div className={styles.inputWrap}>
                          <FaEnvelope className={styles.inputIcon} />
                          <input type="email" placeholder="name@example.com" value={form.email} onChange={set('email')} required />
                       </div>
                    </div>
                    <div className={styles.formGroup}>
                       <label>AADHAR NUMBER</label>
                       <div className={styles.inputWrap}>
                          <FaIdCard className={styles.inputIcon} />
                          <input placeholder="XXXX XXXX XXXX" value={form.aadhar} onChange={set('aadhar')} required />
                       </div>
                    </div>
                    <div className={styles.formGroup}>
                       <label>MOBILE NUMBER</label>
                       <div className={styles.inputWrap}>
                          <FaPhoneAlt className={styles.inputIcon} />
                          <input value={form.mobile} onChange={set('mobile')} placeholder="Registered number" required />
                       </div>
                    </div>
                 </div>
              </div>

              <div className={styles.section}>
                 <div className={styles.sectionTitle}>
                    <FaStore /> <span>Business Information</span>
                 </div>
                 <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                       <label>SHOP / BUSINESS NAME</label>
                       <div className={styles.inputWrap}>
                          <FaStore className={styles.inputIcon} />
                          <input placeholder="Enter shop or firm name" value={form.shopName} onChange={set('shopName')} required />
                       </div>
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                       <label>FULL ADDRESS</label>
                       <div className={styles.inputWrap}>
                          <FaMapMarkerAlt className={styles.inputIcon} />
                          <input placeholder="Area, Landmark, Street" value={form.address} onChange={set('address')} required />
                       </div>
                    </div>
                    
                    <div className={styles.locationRow}>
                       <div className={styles.formGroup}>
                          <label>STATE</label>
                          <div className={styles.dropdownContainer}>
                             <div className={styles.inputWrap}>
                                <FaGlobe className={styles.inputIcon} />
                                <button 
                                  type="button" 
                                  className={`${styles.customSelect} ${isStateOpen ? styles.selectOpen : ''}`}
                                  onClick={() => setIsStateOpen(!isStateOpen)}
                                >
                                  <span className={form.state ? styles.activeValue : styles.placeholder}>
                                    {form.state || 'Select State'}
                                  </span>
                                  <FaChevronDown className={`${styles.chevron} ${isStateOpen ? styles.chevronUp : ''}`} />
                                </button>
                             </div>
                             
                             {isStateOpen && (
                                <div className={styles.dropdownMenu}>
                                   <div className={styles.searchWrap}>
                                     <input 
                                       type="text" 
                                       placeholder="Search state..." 
                                       value={stateSearch}
                                       onChange={(e) => setStateSearch(e.target.value)}
                                       className={styles.searchInput}
                                       onClick={(e) => e.stopPropagation()}
                                       autoFocus
                                     />
                                   </div>
                                   <div className={styles.optionsList}>
                                     {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).map(s => (
                                       <button 
                                         key={s} 
                                         type="button" 
                                         className={`${styles.dropdownOption} ${form.state === s ? styles.optionSelected : ''}`}
                                         onClick={() => { set('state')(s); setIsStateOpen(false); setStateSearch(''); }}
                                       >
                                         <span>{s}</span>
                                         {form.state === s && <FaCheck className={styles.checkIcon} />}
                                       </button>
                                     ))}
                                     {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).length === 0 && (
                                       <div className={styles.noResults}>No states found</div>
                                     )}
                                   </div>
                                </div>
                              )}
                          </div>
                       </div>
                       <div className={styles.formGroup}>
                          <label>CITY / TOWN</label>
                          <div className={styles.inputWrap}>
                             <FaCity className={styles.inputIcon} />
                             <input placeholder="City name" value={form.city} onChange={set('city')} required />
                          </div>
                       </div>
                       <div className={styles.formGroup}>
                          <label>PINCODE</label>
                          <div className={styles.inputWrap}>
                             <FaMailBulk className={styles.inputIcon} />
                             <input placeholder="6-digit PIN" value={form.pincode} onChange={set('pincode')} required />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

               <div className={styles.formFooter}>
                  <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                     {submitting ? <div className={styles.spinner}></div> : <>Finish Registration <FaArrowRight /></>}
                  </button>
                  <div className={styles.footerLoginHint}>
                     Already registered? <Link to="/login">Login here</Link>
                  </div>
               </div>
            </form>
           </>
           )}
        </div>
      </div>
    </div>
  );
};

export default RegisterDetailsPage;
