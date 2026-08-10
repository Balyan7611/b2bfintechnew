import React, { useState } from 'react';
import {
  FaIdCard, FaUser, FaCalendarAlt, FaPaperPlane, FaCheckCircle,
  FaEdit, FaFileAlt, FaSpinner, FaRupeeSign, FaArrowLeft, FaInfoCircle, FaUsers, FaMapMarkerAlt,
  FaExclamationTriangle, FaQuestionCircle
} from 'react-icons/fa';
import styles from './PanCard.module.css';

const PAN_SERVICES = [
  {
    id: 'new_pan',
    title: 'New PAN Card',
    desc: 'Apply for a fresh PAN card for individuals & businesses',
    badge: 'New Application',
    badgeColor: '#0c4a6e',
    badgeBg: '#e0f2fe',
    theme: 'panCardBlue',
    btnClass: 'btnBlue',
    fee: '₹107',
    dummyPan: 'ABCDE1234F',
    dummyName: 'RAJESH KUMAR',
    dummyDob: '15/08/1990',
    dummyFather: 'SURESH KUMAR',
    modalTitle: 'NSDL Document Base Pan Apply',
  },
  {
    id: 'pan_correction',
    title: 'PAN Correction',
    desc: 'Correct name, date of birth or other details on PAN',
    badge: 'Update / Correction',
    badgeColor: '#0c4a6e',
    badgeBg: '#e0f2fe',
    theme: 'panCardGreen',
    btnClass: 'btnBlue',
    fee: '₹107',
    dummyPan: 'FGHIJ5678K',
    dummyName: 'PRIYA SHARMA',
    dummyDob: '22/03/1985',
    dummyFather: 'VINOD SHARMA',
    modalTitle: 'NSDL Documents Base Pan Correction',
  },
  {
    id: 'pan_reprint',
    title: 'PAN Reprint / Duplicate',
    desc: 'Get duplicate PAN card if lost, stolen or damaged',
    badge: 'Reprint / Duplicate',
    badgeColor: '#0c4a6e',
    badgeBg: '#e0f2fe',
    theme: 'panCardNavy',
    btnClass: 'btnBlue',
    fee: '₹107',
    dummyPan: 'LMNOP9012Q',
    dummyName: 'AMIT VERMA',
    dummyDob: '07/11/1978',
    dummyFather: 'RAMESH VERMA',
    modalTitle: 'Request Duplicate / Reprint PAN',
  },
  {
    id: 'nri_pan',
    title: 'NRI / Foreign PAN',
    desc: 'PAN card application for Non-Resident Indians & foreign nationals',
    badge: 'NRI / Foreign',
    badgeColor: '#0c4a6e',
    badgeBg: '#e0f2fe',
    theme: 'panCardWine',
    btnClass: 'btnBlue',
    fee: '₹1,017',
    dummyPan: 'RSTUV3456W',
    dummyName: 'SUNITA PATEL',
    dummyDob: '30/06/1982',
    dummyFather: 'DILIP PATEL',
    modalTitle: 'NRI / Foreign PAN Application',
  },
];

const PanCardVisual = ({ service }) => (
  <div className={styles.panCardImageBg} style={{ backgroundImage: "url('/images/pen_card.png')" }}>
        <div className={styles.pcImageName}>
      <span className={styles.pcImgLabel}>Name / नाम</span>
      <span className={styles.pcImgValue}>{service.dummyName}</span>
    </div>

        <div className={styles.pcImageFather}>
      <span className={styles.pcImgLabel}>Father's Name / पिता का नाम</span>
      <span className={styles.pcImgValue}>{service.dummyFather}</span>
    </div>

    {/* Dynamic DOB Field */}
    <div className={styles.pcImageDob}>
      <span className={styles.pcImgLabel}>Date of Birth / जन्म तिथि</span>
      <span className={styles.pcImgValue}>{service.dummyDob}</span>
    </div>

  </div>
);

/* ─── Agent Alert Modal ─── */
const AgentAlertModal = ({ onOk, onClose }) => (
  <div className={styles.smallModalOverlay} onClick={onClose}>
    <div className={styles.smallModalCard} onClick={e => e.stopPropagation()}>
      <div className={styles.smallModalBody}>
        <div className={styles.modalIconWrapPrimary}>
          <FaExclamationTriangle />
        </div>
        <p className={styles.smallModalText}>Agent Not Registered</p>
        <p className={styles.smallModalSubText}>You must register as an NSDL Agent before applying for PAN cards. Please complete your registration.</p>
        <div className={styles.smallModalBtnGroup}>
          <button className={styles.smallModalBtn} onClick={onClose}>Cancel</button>
          <button className={styles.smallModalBtnPrimary} onClick={onOk}>Register Now</button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Submit Confirmation Modal ─── */
const ConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className={styles.smallModalOverlay}>
    <div className={styles.smallModalCard}>
      <div className={styles.modalTopAccentPrimary}></div>
      <div className={styles.smallModalBody}>
        <div className={styles.modalIconWrapPrimary}>
          <FaQuestionCircle />
        </div>
        <p className={styles.smallModalText}>Confirm Submission</p>
        <p className={styles.smallModalSubText}>Are you sure you want to submit this PAN application? Make sure all details are correct.</p>
        <div className={styles.smallModalBtnGroup}>
          <button className={styles.smallModalBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.smallModalBtnPrimary} onClick={onConfirm}>Confirm & Submit</button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Agent Registration Form ─── */
const RegisterAgentForm = ({ onBack, onSubmit }) => {
  const [form, setForm] = useState({
    memberId: '', name: '', address: '', email: '', mobile: '', adhaar: '', pan: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 1500);
  };

  return (
    <div className={styles.applyViewWrapper}>
      <div className={styles.applyHeader}>
        <h2 className={styles.applyHeaderTitle}>Register NSDL Agent</h2>
        <button className={styles.btnBack} type="button" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid2}>
          <div>
            <label className={styles.formGroupLabel}>MemberID</label>
            <input className={styles.formInput} value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})} required />
          </div>
          <div>
            <label className={styles.formGroupLabel}>Name</label>
            <input className={styles.formInput} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={styles.formGroupLabel}>Address</label>
            <input className={styles.formInput} value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
          </div>
          <div>
            <label className={styles.formGroupLabel}>Email ID</label>
            <input type="email" className={styles.formInput} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className={styles.formGroupLabel}>Primary Mobile Number</label>
            <input className={styles.formInput} value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value.replace(/\D/g,'')})} maxLength={10} required />
          </div>
          <div>
            <label className={styles.formGroupLabel}>Adhaar</label>
            <input className={styles.formInput} value={form.adhaar} onChange={e => setForm({...form, adhaar: e.target.value.replace(/\D/g,'')})} maxLength={12} required />
          </div>
          <div>
            <label className={styles.formGroupLabel}>Pan Number</label>
            <input className={styles.formInput} value={form.pan} onChange={e => setForm({...form, pan: e.target.value.toUpperCase()})} maxLength={10} required />
          </div>
        </div>
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className={styles.submitBtnTeal} disabled={loading}>
            {loading ? <div className={styles.spinner}></div> : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── Apply Form Component (Full Page) ─── */
const PanApplyForm = ({ service, onBack, onSubmit }) => {
  const [form, setForm] = useState({
    title: '', firstName: '', middleName: '', lastName: '',
    gender: '', dob: '', mobile: '', email: '', place: '',
    panExisting: '', kycMode: '', selectPan: 'Physical Pan',
    fatherFirstName: '', fatherMiddleName: '', fatherLastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 1800);
  };

  const isCorrection = service.id === 'pan_correction' || service.id === 'pan_reprint';

  return (
    <div className={styles.applyViewWrapper}>
      <div className={styles.applyHeader}>
        <h2 className={styles.applyHeaderTitle}>
          <FaIdCard color="#1756AA" /> {service.modalTitle}
        </h2>
        <button className={styles.btnBack} onClick={onBack}>
          <FaArrowLeft /> Back to Services
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* APPLICANT DETAILS */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionHeader}><FaUser /> Applicant Details</h3>
          <div className={styles.formGrid3}>
            <div>
              <label className={styles.formGroupLabel}>Title <span className={styles.requiredAsterisk}>*</span></label>
              <select className={`${styles.formInput} ${styles.formSelect}`} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required>
                <option value="">Select Title</option>
                <option value="Shri">Shri</option>
                <option value="Smt">Smt</option>
                <option value="Kumari">Kumari</option>
              </select>
            </div>
            <div>
              <label className={styles.formGroupLabel}>First Name <span className={styles.requiredAsterisk}>*</span></label>
              <input className={styles.formInput} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
            </div>
            <div>
              <label className={styles.formGroupLabel}>Last Name <span className={styles.requiredAsterisk}>*</span></label>
              <input className={styles.formInput} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
            </div>
            <div>
              <label className={styles.formGroupLabel}>Gender <span className={styles.requiredAsterisk}>*</span></label>
              <select className={`${styles.formInput} ${styles.formSelect}`} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>
            <div>
              <label className={styles.formGroupLabel}>DOB <span className={styles.requiredAsterisk}>*</span></label>
              <input type="date" className={styles.formInput} value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required />
            </div>
          </div>
        </div>

        {/* CONTACT & PAN DETAILS */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionHeader}><FaFileAlt /> Contact & Application Details</h3>
          <div className={styles.formGrid3}>
            <div>
              <label className={styles.formGroupLabel}>Mobile <span className={styles.requiredAsterisk}>*</span></label>
              <input className={styles.formInput} maxLength={10} value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value.replace(/\D/g, '')})} required />
            </div>
            <div>
              <label className={styles.formGroupLabel}>Email ID <span className={styles.requiredAsterisk}>*</span></label>
              <input type="email" className={styles.formInput} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className={styles.formGroupLabel}>Place <span className={styles.requiredAsterisk}>*</span></label>
              <input className={styles.formInput} value={form.place} onChange={e => setForm({...form, place: e.target.value})} required />
            </div>
            
            {isCorrection && (
              <div>
                <label className={styles.formGroupLabel}>Pan No. <span className={styles.requiredAsterisk}>*</span></label>
                <input className={styles.formInput} maxLength={10} value={form.panExisting} onChange={e => setForm({...form, panExisting: e.target.value.toUpperCase()})} required />
              </div>
            )}
            
            <div>
              <label className={styles.formGroupLabel}>Kyc Mode <span className={styles.requiredAsterisk}>*</span></label>
              <select className={`${styles.formInput} ${styles.formSelect}`} value={form.kycMode} onChange={e => setForm({...form, kycMode: e.target.value})} required>
                <option value="">Select E-KYC Mode</option>
                <option value="Biometric">Biometric</option>
                <option value="OTP">OTP Based</option>
              </select>
            </div>
            
            <div>
              <label className={styles.formGroupLabel}>Select Pan</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" name="selectPan" value="Physical Pan" checked={form.selectPan === 'Physical Pan'} onChange={e => setForm({...form, selectPan: e.target.value})} /> Physical Pan
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="selectPan" value="E-Pan" checked={form.selectPan === 'E-Pan'} onChange={e => setForm({...form, selectPan: e.target.value})} /> E-Pan Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* PARENTS DETAILS */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionHeader}><FaUsers /> Parents Details</h3>
          <div className={styles.formGrid3}>
            <div>
              <label className={styles.formGroupLabel}>Father's First Name <span className={styles.requiredAsterisk}>*</span></label>
              <input className={styles.formInput} value={form.fatherFirstName} onChange={e => setForm({...form, fatherFirstName: e.target.value})} required />
            </div>
            <div>
              <label className={styles.formGroupLabel}>Father's Middle Name</label>
              <input className={styles.formInput} value={form.fatherMiddleName} onChange={e => setForm({...form, fatherMiddleName: e.target.value})} />
            </div>
            <div>
              <label className={styles.formGroupLabel}>Father's Last Name <span className={styles.requiredAsterisk}>*</span></label>
              <input className={styles.formInput} value={form.fatherLastName} onChange={e => setForm({...form, fatherLastName: e.target.value})} required />
            </div>
          </div>
        </div>

        <div className={styles.formActionRow}>
          <button type="submit" className={styles.submitBtnPrimary} disabled={loading}>
            {loading ? <div className={styles.spinner}></div> : 'Submit Application'}
          </button>
        </div>

        <div className={styles.guideLineBox}>
          <h4 className={styles.guideLineTitle}><FaInfoCircle /> Note Guide Line</h4>
          <ul className={styles.guideLineList}>
            <li>(a) Applicant will fill PAN Change Request Form online and submit the form.</li>
            <li>(b) If the data submitted fails in any format level validation, a response indicating the error(s) will be displayed.</li>
            <li>(c) The applicant shall rectify the error(s) and re-submit the form.</li>
            <li>(d) If there are no format level error(s) a confirmation screen with data filled by the applicant will be displayed.</li>
            <li>(e) If the applicant requires any amendment to this data, it can choose the edit option, else choose confirm.</li>
            <li>(f) For Changes or Correction in PAN data, fill all mandatory fields (marked with *) and select corresponding box.</li>
          </ul>
        </div>

      </form>
      
      {showConfirmDialog && (
        <ConfirmationModal
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
        />
      )}
    </div>
  );
};

const PanCard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAgentRegistered, setIsAgentRegistered] = useState(false);
  const [showAgentAlert, setShowAgentAlert] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeService = PAN_SERVICES.find(s => s.id === activeServiceId);

  const handleApplyNow = (serviceId) => {
        if (serviceId === 'new_pan' && !isAgentRegistered) {
      setShowAgentAlert(true);
      return;
    }
    setActiveServiceId(serviceId);
    setCurrentView('apply');
  };

  const handleAgentAlertOk = () => {
    setShowAgentAlert(false);
    setCurrentView('registerAgent');
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.msg}
        </div>
      )}

      {currentView === 'dashboard' && (
        <div className={styles.mainWhiteCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
              <FaIdCard color="#e11d48" size="1.4rem" /> PAN Card Services
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 650, color: '#475569', background: '#f8fafc', padding: '6px 14px', borderRadius: '50px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.3px' }}>
                <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}}></span>
                Select a service below to continue
              </span>
            </div>
          </div>
          <div className={styles.panCardsGrid}>
            {PAN_SERVICES.map(service => (
              <div key={service.id} className={styles.panCardItem}>
                                <div className={styles.cardTopRow}>
                  <div>
                    <h3 className={styles.cardServiceTitle}>{service.title}</h3>
                    <p className={styles.cardServiceDesc}>{service.desc}</p>
                  </div>
                  <span
                    className={styles.serviceTypeBadge}
                    style={{ color: service.badgeColor, background: service.badgeBg }}
                  >
                    {service.badge}
                  </span>
                </div>

                                <div style={{ margin: '8px 0' }}>
                  <PanCardVisual service={service} />
                </div>

                                <div className={styles.itemFooter}>
                  <span className={styles.feeInfo}>
                    <FaRupeeSign />
                    Govt. Fee:
                    <span className={styles.feePill}>{service.fee}</span>
                  </span>
                  <button
                    className={styles.applyBtnSmall}
                    onClick={() => handleApplyNow(service.id)}
                  >
                    <FaIdCard /> Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

            {currentView === 'apply' && activeService && (
        <PanApplyForm
          service={activeService}
          onBack={() => setCurrentView('dashboard')}
          onSubmit={() => {
            showToast(`✅ ${activeService.title} application submitted successfully!`);
            setCurrentView('dashboard');
          }}
        />
      )}

      {/* Register Agent Form View */}
      {currentView === 'registerAgent' && (
        <RegisterAgentForm
          onBack={() => setCurrentView('dashboard')}
          onSubmit={() => {
            setIsAgentRegistered(true);
            showToast(`✅ NSDL Agent registered successfully! You can now apply for PAN cards.`);
            setCurrentView('dashboard');
          }}
        />
      )}

      {/* Agent Registration Alert Modal */}
      {showAgentAlert && (
        <AgentAlertModal 
          onOk={handleAgentAlertOk} 
          onClose={() => setShowAgentAlert(false)} 
        />
      )}
    </div>
  );
};

export default PanCard;
