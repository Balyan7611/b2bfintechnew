import React, { useState, useEffect } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  FaUser, FaMapMarkerAlt, FaBriefcase, FaIdCard, FaCheck, FaChevronRight, FaChevronLeft,
  FaCalendarAlt, FaEnvelope, FaMobileAlt, FaBuilding, FaSearch, FaUserTag, FaUserPlus, FaTimes, FaGlobeAmericas,
  FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv
} from 'react-icons/fa';
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import { updateRegistrationForm, setRegStep, addMember, deleteMember, updateMemberDirect } from '../../../store/slices/memberSlice';
import { MemberService } from '../../../services/member.service';
import styles from './MemberPages.module.css';

const MemberRegistration = () => {
  const dispatch = useDispatch();
  const { registrationState, manageMemberState } = useSelector((s) => s.member);
  const { currentStep, form } = registrationState;
  const memberList = manageMemberState.list;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [genderOptions, setGenderOptions] = useState(['Male', 'Female']);
  const [roleOptions, setRoleOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [gendersRes, rolesRes, packagesRes] = await Promise.all([
          API.gender.getAll().catch(() => null),
          API.getRoles().catch(() => null),
          API.package.getAll().catch(() => null)
        ]);
        
        if (gendersRes && Array.isArray(gendersRes)) {
          const mapped = gendersRes.map(g => g.name).filter(Boolean);
          if (mapped.length > 0) setGenderOptions(mapped);
        }

        if (rolesRes && Array.isArray(rolesRes)) {
            setRoleOptions(rolesRes);
        }
        
        if (packagesRes) {
            if (packagesRes.data && Array.isArray(packagesRes.data)) {
                setPackageOptions(packagesRes.data);
            } else if (Array.isArray(packagesRes)) {
                setPackageOptions(packagesRes);
            }
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    fetchDropdownData();
  }, []);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
    "Lakshadweep", "Puducherry"
  ];

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    // Apply strict formatting rules
    if (name === 'mobile' || name === 'whatsapp') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'pan') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    dispatch(updateRegistrationForm({ [name]: value }));
  };

  const handleSave = () => {
    if (!form.role || !form.packageId) {
      dispatch(setRegStep(1));
      setErrorMsg('Please complete Role and Package details.');
      return;
    }
    if (!form.name || !form.mobile || !form.pan || !form.aadhar) {
      dispatch(setRegStep(2));
      setErrorMsg('Please complete Personal and KYC details.');
      return;
    }
    if (!form.address1 || !form.state) {
      dispatch(setRegStep(3));
      setErrorMsg('Please complete Residential Address details.');
      return;
    }
    if (!form.businessName) {
      dispatch(setRegStep(4));
      setErrorMsg('Please complete Business details (Shop Name).');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const payload = {
        roleId: parseInt(form.role) || 0,
        titleId: form.title === 'Mr' ? 1 : form.title === 'Mrs' ? 2 : 3,
        packageId: parseInt(form.packageId) || 0,
        parentId: form.upline === 'Admin' ? 1 : 1,
        name: form.name || "",
        email: form.email || "",
        mobile: form.mobile || "",
        alterNativeMobileNumber: form.whatsapp || "",
        genderId: form.gender === 'Female' ? 2 : 1,
        dob: form.dob || "",
        pic: "",
        loginOnOff: true,
        deviceId: "",
        appToken: "",
        macAddress: "",
        deviceRegister: "",
        fromChannel: "",
        time: 0,
        aadhar: form.aadhar || "",
        pan: form.pan || "",
        address: form.address1 || "",
        pinCode: form.pincode || "",
        stateId: 1, 
        cityId: 2, 
        parentStr: "",
        shopName: form.businessName || "",
        shopAddress: form.bizAddress || "",
        shopPinCode: form.bizPincode || "",
        shopStateId: 1,
        shopCityId: 2,
        postOffice: form.postOffice || form.city || "",
        businessPostOffice: form.bizPostOffice || form.bizCity || ""
    };

    if (editingId) {
        // Mock edit for now
        dispatch(updateMemberDirect({ id: editingId, updates: form }));
        setIsLoading(false);
        setIsModalOpen(false);
        setErrorMsg('');
    } else {
        MemberService.createMember(payload)
            .then((res) => {
                setIsLoading(false);
                setIsModalOpen(false);
                setErrorMsg('');
                dispatch(addMember(form));
            })
            .catch((err) => {
                setIsLoading(false);
                setErrorMsg(err?.response?.data?.mess || err?.message || "Failed to create member");
            });
    }
  };

  const handleEdit = (member) => {
    dispatch(updateRegistrationForm(member));
    setEditingId(member.id);
    dispatch(setRegStep(1));
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      dispatch(deleteMember(deleteModal.id));
    }
    setDeleteModal({ open: false, id: null });
  };

  const filteredMembers = memberList.filter(m => 
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.memberId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.mobile || '').includes(searchQuery)
  );

  const steps = [
    { id: 1, label: 'ROLE' },
    { id: 2, label: 'PERSONAL' },
    { id: 3, label: 'ADDRESS' },
    { id: 4, label: 'BUSINESS' },
  ];

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.25rem' }}>Member Directory</h2>
            <p className={styles.directorySubtitle}>Manage and onboard new retail partners</p>
          </div>
          <button onClick={() => {
              setEditingId(null);
              dispatch(updateRegistrationForm({ role: '', upline: '', packageId: '', title: 'Mr', gender: 'Male', name: '', aadhar: '', pan: '', dob: '', mobile: '', whatsapp: '', email: '', address1: '', pincode: '', postOffice: '', city: '', state: '', businessName: '', bizAddress: '', bizPincode: '', bizPostOffice: '', bizCity: '', bizState: '' }));
              dispatch(setRegStep(1));
              setIsModalOpen(true);
            }} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            <FaUserPlus /> New Registration
          </button>
        </div>

        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="memberregistration_report" sheetName="Report" />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px' }}>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>SL</th>
                <th style={{ width: '100px' }}>Action</th>
                <th style={{ width: '150px' }}>Member ID</th>
                <th style={{ width: '150px' }}>Member Name</th>
                <th style={{ width: '180px' }}>Shop & City</th>
                <th style={{ width: '150px' }}>Contact Details</th>
                <th style={{ width: '150px' }}>KYC (PAN/Aadhar)</th>
                <th style={{ width: '120px' }}>Role/Package</th>
                <th style={{ width: '120px' }}>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.map((m, idx) => (
                <tr key={m.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className={styles.actionRow} style={{ display: 'flex', gap: '8px' }}>
                      <button className={styles.editBtn} style={{ background: '#EEF3FC', color: '#1756AA', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }} title="Edit Member" onClick={() => handleEdit(m)}><HiOutlinePencilAlt size={16} /></button>
                      <button className={styles.deleteBtn} style={{ background: '#FFF5F5', color: '#E53E3E', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }} title="Delete Member" onClick={() => setDeleteModal({ open: true, id: m.id })}><HiOutlineTrash size={16} /></button>
                    </div>
                  </td>
                  <td className={styles.fwBold} style={{ color: '#1756AA' }}>{m.memberId || 'PENDING'}</td>
                  <td>
                    <div className={styles.contactCell}>
                      <span className={styles.fwBold}>{m.name}</span>
                      <small style={{ color: '#718096' }}>{m.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span style={{ fontWeight: 600 }}>{m.shop || m.businessName || 'N/A'}</span>
                      <small style={{ color: '#718096' }}>{m.city || 'N/A'}, {m.state || ''}</small>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span style={{ color: '#2D3748', fontWeight: 600 }}>M: {m.mobile}</span>
                      <small style={{ color: '#27AE60', fontWeight: 700 }}>W: {m.whatsapp || m.mobile}</small>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span style={{ fontSize: '0.75rem' }}>PAN: {m.pan || 'N/A'}</span>
                      <span style={{ fontSize: '0.75rem' }}>AAD: {m.aadhar || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={styles.roleTag}>{m.role}</span>
                      <span style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700 }}>{m.packageId}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{m.doj}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#A0AEC0' }}>
                      No recent registrations found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing 1 to {filteredMembers.length} of {filteredMembers.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className={styles.pageBtn} style={{ width: '36px', height: '36px' }}>
              <FaChevronLeft />
            </button>
            <span className={styles.pageActive} style={{ 
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', background: '#1756AA', color: '#fff', fontSize: '0.9rem', fontWeight: 600
            }}>1</span>
            <button className={styles.pageBtn} style={{ width: '36px', height: '36px' }}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteModal.open && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal({ open: false, id: null })} style={{ zIndex: 5000 }}>
          <div className={styles.modalContainer} style={{ maxWidth: '350px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <HiOutlineTrash />
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: '#0D1B3E' }}>Delete Member?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#4E6080' }}>Are you sure you want to permanently delete this member?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteModal({ open: false, id: null })} style={{ background: '#EDF2F7', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', color: '#4E6080', fontWeight: 600 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ background: '#E53E3E', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTRATION MODAL ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 4000 }}>
          <div className={styles.modalContainer} style={{ width: '750px', borderRadius: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className={styles.modalHeader} style={{ padding: '20px 30px', borderBottom: '1px solid #F1F5F9' }}>
               <div>
                  <h3 className={styles.modalTitle} style={{ fontSize: '1.25rem', margin: 0 }}>Member Onboarding</h3>
                  <p className={styles.modalSubtitle} style={{ fontSize: '0.8rem', margin: 0, color: '#718096' }}>Complete the steps to register a new partner</p>
               </div>
               <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                  <FaTimes />
               </button>
            </div>

            {/* PREMIUM STEPPER */}
            <div style={{ padding: '15px 0', background: '#FBFDFF', borderBottom: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', width: '80%', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '2px', background: '#E2E8F0', zIndex: 1 }}></div>
                  <div style={{ position: 'absolute', top: '18px', left: '10%', width: `${((currentStep-1)/3)*80}%`, height: '2px', background: '#1756AA', zIndex: 1, transition: '0.3s' }}></div>
                  
                  {steps.map((s) => (
                    <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                       <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          background: currentStep >= s.id ? '#1756AA' : '#fff', 
                          color: currentStep >= s.id ? '#fff' : '#A0AEC0', 
                          border: currentStep >= s.id ? 'none' : '2px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
                          boxShadow: currentStep >= s.id ? '0 4px 10px rgba(23, 86, 170, 0.2)' : 'none'
                       }}>
                          {currentStep > s.id ? <FaCheck /> : s.id}
                       </div>
                       <span style={{ fontSize: '0.65rem', fontWeight: 800, color: currentStep >= s.id ? '#1756AA' : '#A0AEC0', letterSpacing: '0.5px' }}>{s.label}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className={styles.modalBody} style={{ padding: '25px 30px', flex: 1, overflowY: 'auto' }}>
              {errorMsg && (
                <div style={{ padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, animation: 'fadeIn 0.3s ease' }}>
                  <span>⚠️</span> {errorMsg}
                </div>
              )}
              {currentStep === 1 && <Step1 form={form} onChange={handleInputChange} roleOptions={roleOptions} packageOptions={packageOptions} />}
              {currentStep === 2 && <Step2 form={form} onChange={handleInputChange} genderOptions={genderOptions} />}
              {currentStep === 3 && <Step3 form={form} onChange={handleInputChange} states={indianStates} />}
              {currentStep === 4 && <Step4 form={form} onChange={handleInputChange} states={indianStates} />}
            </div>

            <div className={styles.modalFooter} style={{ padding: '15px 30px', borderTop: '1px solid #F1F5F9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                {currentStep > 1 && (
                  <button type="button" className={styles.prevBtn} style={{ height: '40px', padding: '0 25px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setErrorMsg(''); dispatch(setRegStep(currentStep - 1)); }}>
                    <FaChevronLeft /> Previous Step
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 4 ? (
                  <button type="button" className={styles.nextBtn} style={{ height: '40px', padding: '0 30px', fontSize: '0.9rem', background: '#1756AA', color: '#fff', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setErrorMsg(''); dispatch(setRegStep(currentStep + 1)); }}>
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
        </div>
      )}
    </div>
  );
};

const Step1 = ({ form, onChange, roleOptions = [], packageOptions = [] }) => (
  <div className={styles.gridTwo} style={{ gap: '20px' }}>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaUserTag style={{ color: '#1756AA' }} /> SELECT ROLE
      </label>
      <select name="role" className={styles.selectControl} style={{ height: '40px' }} value={form.role} onChange={onChange}>
        <option value="">Select Role</option>
        {roleOptions.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaUserPlus style={{ color: '#1756AA' }} /> SELECT UPLINE
      </label>
      <select name="upline" className={styles.selectControl} style={{ height: '40px' }} value={form.upline} onChange={onChange}>
        <option value="">Select Upline</option>
        <option value="Admin">Admin</option>
      </select>
    </div>
    <div className={styles.formGroup}>
      <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4E6080', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaBriefcase style={{ color: '#1756AA' }} /> PACKAGE ID
      </label>
      <select name="packageId" className={styles.selectControl} style={{ height: '40px' }} value={form.packageId} onChange={onChange}>
        <option value="">Select Package</option>
        {packageOptions.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  </div>
);

const Step2 = ({ form, onChange, genderOptions = ['Male', 'Female'] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
    <div className={styles.gridTwo}>
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
    </div>
    
    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>FULL NAME</label>
        <div className={styles.inputWrap}>
          <input type="text" name="name" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Enter name" value={form.name} onChange={onChange} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>AADHAR NUMBER</label>
        <div className={styles.inputWrap}>
          <input type="text" name="aadhar" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="XXXX XXXX XXXX" value={form.aadhar} onChange={onChange} />
        </div>
      </div>
    </div>

    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>PAN NUMBER</label>
        <div className={styles.inputWrap}>
          <input type="text" name="pan" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="ABCDE1234F" value={form.pan} onChange={onChange} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>DATE OF BIRTH</label>
        <div className={styles.inputWrap}>
          <input type="date" name="dob" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} value={form.dob} onChange={onChange} />
        </div>
      </div>
    </div>

    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>MOBILE NUMBER</label>
        <div className={styles.inputWrap}>
          <input type="text" name="mobile" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="+91" value={form.mobile} onChange={onChange} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>WHATSAPP NUMBER</label>
        <div className={styles.inputWrap}>
          <input type="text" name="whatsapp" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="+91" value={form.whatsapp} onChange={onChange} />
        </div>
      </div>
    </div>
  </div>
);

const Step3 = ({ form, onChange, states }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>RESIDENTIAL ADDRESS</label>
        <div className={styles.inputWrap}>
          <input type="text" name="address1" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="House no, Street..." value={form.address1} onChange={onChange} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>AREA PINCODE</label>
        <div className={styles.inputWrap}>
          <input type="text" name="pincode" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="6 digit code" value={form.pincode} onChange={onChange} />
        </div>
      </div>
    </div>
    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>STATE SELECTION</label>
        <div className={styles.inputWrap}>
           <select name="state" className={styles.selectControl} style={{ height: '40px', paddingLeft: '15px', fontSize: '0.85rem' }} value={form.state} onChange={onChange}>
             <option value="">Select State</option>
             {states.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>CITY / DISTRICT</label>
        <div className={styles.inputWrap}>
           <input type="text" name="city" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px', fontSize: '0.85rem' }} placeholder="Enter city name" value={form.city} onChange={onChange} />
        </div>
      </div>
    </div>
  </div>
);

const Step4 = ({ form, onChange, states }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>REGISTERED BUSINESS NAME</label>
        <div className={styles.inputWrap}>
          <input type="text" name="businessName" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Enter shop name" value={form.businessName} onChange={onChange} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS ADDRESS</label>
        <div className={styles.inputWrap}>
          <input type="text" name="bizAddress" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px' }} placeholder="Shop address" value={form.bizAddress} onChange={onChange} />
        </div>
      </div>
    </div>
    <div className={styles.gridTwo}>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS STATE</label>
        <div className={styles.inputWrap}>
           <select name="bizState" className={styles.selectControl} style={{ height: '40px', paddingLeft: '15px', fontSize: '0.85rem' }} value={form.bizState} onChange={onChange}>
             <option value="">Select State</option>
             {states.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontWeight: 700, fontSize: '0.7rem' }}>BUSINESS CITY</label>
        <div className={styles.inputWrap}>
           <input type="text" name="bizCity" className={styles.inputControl} style={{ height: '38px', paddingLeft: '15px', fontSize: '0.85rem' }} value={form.bizCity} onChange={onChange} />
        </div>
      </div>
    </div>
  </div>
);

export default MemberRegistration;
