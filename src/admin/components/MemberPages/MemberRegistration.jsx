import React, { useState, useEffect } from 'react';
import { FiDatabase } from 'react-icons/fi';
import RoleSelect from '../../../shared/components/common/RoleSelect';
import PackageSelect from '../../../shared/components/common/PackageSelect';
import MemberSearchSelect from '../../../shared/components/common/MemberSearchSelect';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import { useDispatch, useSelector } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  FaUser, FaMapMarkerAlt, FaBriefcase, FaIdCard, FaCheck, FaChevronRight, FaChevronLeft,
  FaCalendarAlt, FaEnvelope, FaMobileAlt, FaBuilding, FaSearch, FaUserTag, FaUserPlus, FaTimes, FaGlobeAmericas
} from 'react-icons/fa';
import { updateRegistrationForm, setRegStep, updateMemberDirect } from '../../../store/slices/memberSlice';
import { MemberService } from '../../../services/member.service';
import styles from './MemberPages.module.css';

const MemberRegistration = ({ isModal = false, onClose }) => {
  const dispatch = useDispatch();
  const { registrationState } = useSelector((s) => s.member);
  const { currentStep, form } = registrationState;
  const { popup, showPopup, closePopup } = usePopup();

  // ── FORM STATE ──────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [genderOptions, setGenderOptions] = useState(['Male', 'Female', 'Other']);
  const [stateOptions, setStateOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // ── DROPDOWN DATA FOR FORM ─────────────────────────────────────────────
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [gendersRes, statesRes] = await Promise.all([
          API.gender.getAll().catch(() => null),
          API.state.getAll().catch(() => null)
        ]);
        if (gendersRes && Array.isArray(gendersRes)) {
          const mapped = gendersRes.map(g => g.name).filter(Boolean);
          if (mapped.length > 0) setGenderOptions(mapped);
        }
        if (statesRes && Array.isArray(statesRes)) setStateOptions(statesRes);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchDropdownData();
  }, []);

  // ── FORM VALIDATION ────────────────────────────────────────────────────
  const validateStep = (step) => {
    let stepErrors = {};
    if (step === 1) {
      if (!form.role) stepErrors.role = 'Field is required';
      if (!form.upline) stepErrors.upline = 'Field is required';
      if (!form.packageId) stepErrors.packageId = 'Field is required';
    } else if (step === 2) {
      if (!form.name || !form.name.trim()) stepErrors.name = 'Field is required';
      if (!form.aadhar || !form.aadhar.trim()) stepErrors.aadhar = 'Field is required';
      else if (form.aadhar.length !== 12) stepErrors.aadhar = 'Aadhar must be 12 digits';
      if (!form.pan || !form.pan.trim()) stepErrors.pan = 'Field is required';
      else if (form.pan.length !== 10) stepErrors.pan = 'PAN must be 10 characters';
      if (!form.dob) stepErrors.dob = 'Field is required';
      if (!form.mobile || !form.mobile.trim()) stepErrors.mobile = 'Field is required';
      else if (form.mobile.length !== 10) stepErrors.mobile = 'Mobile must be 10 digits';
      if (!form.email || !form.email.trim()) stepErrors.email = 'Field is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) stepErrors.email = 'Invalid email format';
    } else if (step === 3) {
      if (!form.address1 || !form.address1.trim()) stepErrors.address1 = 'Field is required';
      if (!form.pincode || !form.pincode.trim()) stepErrors.pincode = 'Field is required';
      else if (form.pincode.length !== 6) stepErrors.pincode = 'Pincode must be 6 digits';
      if (!form.state) stepErrors.state = 'Field is required';
      if (!form.city || !form.city.trim()) stepErrors.city = 'Field is required';
    } else if (step === 4) {
      if (!form.businessName || !form.businessName.trim()) stepErrors.businessName = 'Field is required';
      if (!form.bizAddress || !form.bizAddress.trim()) stepErrors.bizAddress = 'Field is required';
      if (!form.bizState) stepErrors.bizState = 'Field is required';
      if (!form.bizCity || !form.bizCity.trim()) stepErrors.bizCity = 'Field is required';
      if (!form.bizPincode || !form.bizPincode.trim()) stepErrors.bizPincode = 'Field is required';
      else if (form.bizPincode.length !== 6) stepErrors.bizPincode = 'Pincode must be 6 digits';
    }
    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (validateStep(currentStep)) {
      dispatch(setRegStep(currentStep + 1));
    } else {
      setErrorMsg('Please fill all required fields before proceeding.');
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'mobile' || name === 'whatsapp') value = value.replace(/\D/g, '').slice(0, 10);
    else if (name === 'aadhar') value = value.replace(/\D/g, '').slice(0, 12);
    else if (name === 'pan') value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    else if (name === 'pincode' || name === 'bizPincode') value = value.replace(/\D/g, '').slice(0, 6);
    if (errors[name]) {
      setErrors(prev => { const copy = { ...prev }; delete copy[name]; return copy; });
    }
    dispatch(updateRegistrationForm({ [name]: value }));
  };

  const handleSave = () => {
    setErrorMsg('');
    if (!validateStep(4)) { setErrorMsg('Please complete all required fields.'); return; }
    setIsLoading(true);
    MemberService.createMember(form)
      .then(() => {
        setIsLoading(false);
        showPopup('success', 'Registration Successful', 'Member has been registered successfully!');
        dispatch(updateRegistrationForm({ 
          role: '', upline: '', packageId: '', title: 'Mr', gender: 'Male', name: '', 
          aadhar: '', pan: '', dob: '', mobile: '', whatsapp: '', email: '', 
          address1: '', pincode: '', postOffice: '', city: '', state: '', 
          businessName: '', bizAddress: '', bizPincode: '', bizPostOffice: '', bizCity: '', bizState: '' 
        }));
        dispatch(setRegStep(1));
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.mess || err?.message || 'Failed to create member');
      });
  };

  const steps = [
    { id: 1, label: 'ROLE' },
    { id: 2, label: 'PERSONAL' },
    { id: 3, label: 'ADDRESS' },
    { id: 4, label: 'BUSINESS' },
  ];

  const mainContent = (
    <div className={isModal ? '' : styles.cardFullMobile} style={isModal ? { marginTop: 0, overflow: 'visible' } : { marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '24px', overflow: 'visible' }}>
      
      {/* HEADER */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUserPlus style={{ color: '#1756AA' }} /> Partner Onboarding Wizard
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#718096' }}>Register and onboard new retail partners to the network</p>
        </div>
        {isModal && (
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              color: '#718096',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* PREMIUM STEPPER */}
      <div style={{ padding: '12px 0', background: '#FBFDFF', borderBottom: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', width: '80%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '2px', background: '#E2E8F0', zIndex: 1 }}></div>
            <div style={{ position: 'absolute', top: '14px', left: '10%', width: `${((currentStep-1)/3)*80}%`, height: '2px', background: '#1756AA', zIndex: 1, transition: '0.3s' }}></div>
            
            {steps.map((s) => (
              <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                 <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    background: currentStep >= s.id ? '#1756AA' : '#fff', 
                    color: currentStep >= s.id ? '#fff' : '#A0AEC0', 
                    border: currentStep >= s.id ? 'none' : '2px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem',
                    boxShadow: currentStep >= s.id ? '0 4px 10px rgba(23, 86, 170, 0.2)' : 'none'
                 }}>
                    {currentStep > s.id ? <FaCheck style={{ fontSize: '0.65rem' }} /> : s.id}
                 </div>
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, color: currentStep >= s.id ? '#1756AA' : '#A0AEC0', letterSpacing: '0.5px' }}>{s.label}</span>
              </div>
            ))}
         </div>
      </div>

      {/* WIZARD BODY */}
      <div style={{ padding: '20px 24px', minHeight: '260px', background: '#fff', overflow: currentStep === 1 ? 'visible' : 'auto' }}>
        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', marginBottom: '20px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}
        {currentStep === 1 && <Step1 form={form} onChange={handleInputChange} errors={errors} />}
        {currentStep === 2 && <Step2 form={form} onChange={handleInputChange} genderOptions={genderOptions} errors={errors} />}
        {currentStep === 3 && <Step3 form={form} onChange={handleInputChange} states={stateOptions} errors={errors} />}
        {currentStep === 4 && <Step4 form={form} onChange={handleInputChange} states={stateOptions} errors={errors} />}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div>
          {currentStep > 1 && (
            <button type="button" className={styles.prevBtn} style={{ height: '40px', padding: '0 25px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setErrorMsg(''); dispatch(setRegStep(currentStep - 1)); }}>
              <FaChevronLeft /> Previous Step
            </button>
          )}
        </div>
        
        <div>
          {currentStep < 4 ? (
            <button type="button" className={styles.nextBtn} style={{ height: '40px', padding: '0 30px', fontSize: '0.9rem', background: '#1756AA', color: '#fff', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={handleNextStep}>
              Next Step <FaChevronRight />
            </button>
          ) : (
            <button type="button" className={styles.publishBtn} style={{ height: '40px', padding: '0 35px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleSave} disabled={isLoading}>
              {isLoading ? <div className={styles.spinner}></div> : <><FaCheck /> Complete Registration</>}
            </button>
          )}
        </div>
      </div>

    </div>
  );

  if (isModal) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        background: 'rgba(13, 27, 62, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }} onClick={onClose}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          boxShadow: '0 20px 40px rgba(13, 27, 62, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'fadeIn 0.3s ease-out',
          overflowY: 'auto'
        }} onClick={e => e.stopPropagation()}>
          {mainContent}
          <PopupModal 
            show={popup.show} 
            type={popup.type} 
            title={popup.title} 
            message={popup.message} 
            onClose={() => {
              closePopup();
              if (popup.type === 'success') onClose();
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {mainContent}
      <PopupModal 
        show={popup.show} 
        type={popup.type} 
        title={popup.title} 
        message={popup.message} 
        onClose={closePopup} 
      />
    </div>
  );
};

const Step1 = ({ form, onChange, errors = {} }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', minHeight: '200px' }}>
      {/* SELECT ROLE — uses shared RoleSelect (API-bound) */}
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserTag style={{ color: '#1756AA' }} /> SELECT ROLE
        </label>
        <RoleSelect
          value={form.role}
          onChange={(val) => onChange({ target: { name: 'role', value: val } })}
          placeholder="Select Role"
          style={{ height: '40px', fontSize: '0.9rem' }}
        />
        {errors.role && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.role}</span>}
      </div>

      {/* SELECT UPLINE — uses shared MemberSearchSelect (API-bound) */}
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserPlus style={{ color: '#1756AA' }} /> SELECT UPLINE
        </label>
        <div style={{ position: 'relative', zIndex: 9999 }}>
          <MemberSearchSelect
            value={form.upline || ''}
            onChange={(member) => onChange({ target: { name: 'upline', value: member ? (member.memberId || member.id) : '' } })}
            placeholder="Search or Select Upline Member..."
          />
        </div>
        {errors.upline && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.upline}</span>}
      </div>

      {/* SELECT PACKAGE — uses shared PackageSelect (API-bound) */}
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBriefcase style={{ color: '#1756AA' }} /> PACKAGE ID
        </label>
        <PackageSelect
          value={form.packageId}
          onChange={(val) => onChange({ target: { name: 'packageId', value: val } })}
          placeholder="Select Package"
          style={{ height: '40px', fontSize: '0.9rem' }}
        />
        {errors.packageId && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.packageId}</span>}
      </div>
    </div>
  );
};

const Step2 = ({ form, onChange, genderOptions = ['Male', 'Female', 'Other'], errors = {} }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>TITLE SELECTION</label>
      <div className={styles.pillRow} style={{ gap: '8px' }}>
        {['Mr', 'Mrs', 'Miss'].map(t => (
          <button 
            key={t}
            type="button"
            className={`${styles.pillTab} ${form.title === t ? styles.pillTabActive : ''}`}
            style={{ padding: '6px 18px', fontSize: '0.75rem' }}
            onClick={() => onChange({ target: { name: 'title', value: t } })}
          >{t}</button>
        ))}
      </div>
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>GENDER</label>
      <div className={styles.pillRow} style={{ gap: '8px' }}>
        {genderOptions.map(g => (
          <button 
            key={g}
            type="button"
            className={`${styles.pillTab} ${form.gender === g ? styles.pillTabActive : ''}`}
            style={{ padding: '6px 18px', fontSize: '0.75rem' }}
            onClick={() => onChange({ target: { name: 'gender', value: g } })}
          >{g}</button>
        ))}
      </div>
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>FULL NAME</label>
      <div className={styles.inputWrap}>
        <input type="text" name="name" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Enter name" value={form.name} onChange={onChange} />
      </div>
      {errors.name && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.name}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>AADHAR NUMBER</label>
      <div className={styles.inputWrap}>
        <input type="text" name="aadhar" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="XXXX XXXX XXXX" value={form.aadhar} onChange={onChange} />
      </div>
      {errors.aadhar && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.aadhar}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>PAN NUMBER</label>
      <div className={styles.inputWrap}>
        <input type="text" name="pan" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="ABCDE1234F" value={form.pan} onChange={onChange} />
      </div>
      {errors.pan && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.pan}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>DATE OF BIRTH</label>
      <div className={styles.inputWrap}>
        <input type="date" name="dob" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} value={form.dob} onChange={onChange} />
      </div>
      {errors.dob && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.dob}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>MOBILE NUMBER</label>
      <div className={styles.inputWrap}>
        <input type="text" name="mobile" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="+91" value={form.mobile} onChange={onChange} />
      </div>
      {errors.mobile && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.mobile}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>WHATSAPP NUMBER</label>
      <div className={styles.inputWrap}>
        <input type="text" name="whatsapp" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="+91 (Optional)" value={form.whatsapp} onChange={onChange} />
      </div>
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>EMAIL ADDRESS</label>
      <div className={styles.inputWrap}>
        <input type="email" name="email" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Enter email address" value={form.email} onChange={onChange} />
      </div>
      {errors.email && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.email}</span>}
    </div>
  </div>
);

const Step3 = ({ form, onChange, states, errors = {} }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>RESIDENTIAL ADDRESS</label>
      <div className={styles.inputWrap}>
        <input type="text" name="address1" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="House no, Street..." value={form.address1} onChange={onChange} />
      </div>
      {errors.address1 && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.address1}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>AREA PINCODE</label>
      <div className={styles.inputWrap}>
        <input type="text" name="pincode" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="6 digit code" value={form.pincode} onChange={onChange} />
      </div>
      {errors.pincode && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.pincode}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>STATE SELECTION</label>
      <div className={styles.inputWrap}>
         <select name="state" className={styles.selectControl} style={{ height: '40px', paddingLeft: '15px', fontSize: '0.85rem' }} value={form.state} onChange={onChange}>
           <option value="">Select State</option>
           {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
         </select>
      </div>
      {errors.state && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.state}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>CITY / DISTRICT</label>
      <div className={styles.inputWrap}>
         <input type="text" name="city" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px', fontSize: '0.85rem' }} placeholder="Enter city name" value={form.city} onChange={onChange} />
      </div>
      {errors.city && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.city}</span>}
    </div>
  </div>
);

const Step4 = ({ form, onChange, states, errors = {} }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>REGISTERED BUSINESS NAME</label>
      <div className={styles.inputWrap}>
        <input type="text" name="businessName" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Enter shop name" value={form.businessName} onChange={onChange} />
      </div>
      {errors.businessName && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.businessName}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS ADDRESS</label>
      <div className={styles.inputWrap}>
        <input type="text" name="bizAddress" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Shop address" value={form.bizAddress} onChange={onChange} />
      </div>
      {errors.bizAddress && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.bizAddress}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS STATE</label>
      <div className={styles.inputWrap}>
         <select name="bizState" className={styles.selectControl} style={{ height: '40px', paddingLeft: '15px', fontSize: '0.85rem' }} value={form.bizState} onChange={onChange}>
           <option value="">Select State</option>
           {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
         </select>
      </div>
      {errors.bizState && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.bizState}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS CITY</label>
      <div className={styles.inputWrap}>
         <input type="text" name="bizCity" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px', fontSize: '0.85rem' }} placeholder="Enter business city" value={form.bizCity} onChange={onChange} />
      </div>
      {errors.bizCity && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.bizCity}</span>}
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS PINCODE</label>
      <div className={styles.inputWrap}>
        <input type="text" name="bizPincode" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="6 digit code" value={form.bizPincode} onChange={onChange} />
      </div>
      {errors.bizPincode && <span style={{ color: '#E53E3E', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.bizPincode}</span>}
    </div>
  </div>
);

export default MemberRegistration;
