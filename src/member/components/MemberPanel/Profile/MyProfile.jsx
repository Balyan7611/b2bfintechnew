import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import html2canvas from 'html2canvas';
import { 
  FaUser, FaKey, FaShieldAlt, FaIdCard, FaUniversity, FaImages, FaTools, 
  FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle,
  FaSave, FaUserEdit, FaTimes, FaCrop, FaArrowsAlt, FaCertificate, FaDownload,
  FaPlus, FaTrash, FaClock, FaFileUpload, FaSpinner, FaBuilding,
  FaCreditCard, FaRegCheckCircle, FaHourglassHalf, FaPaperPlane
} from 'react-icons/fa';
import { setNotification } from '../../../../store/slices/uiSlice';
import { getSession, saveSession } from '../../../../utils/authUtils';
import { API } from '../../../../api/endpoints';
import styles from './MyProfile.module.css';

const MyProfile = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector(state => state.memberPanel);
  const [activeTab, setActiveTab] = useState('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImg, setProfileImg] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Session User
  const [sessionUser, setSessionUser] = useState(null);

  // Modal & File States for Cropper
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImg, setTempImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const certRef = useRef(null);

  // Profile Fields
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    loginId: '',
    mobile: '',
    email: '',
    aadhar: '',
    pan: '',
    shopName: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    role: 'Retailer'
  });

  // Reset Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Reset Pin State
  const [pinData, setPinData] = useState({
    oldPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Account Details (Member Bank Accounts)
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    branchName: ''
  });

  // KYC State
  const [kycDocs, setKycDocs] = useState([]);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [showUploadKycModal, setShowUploadKycModal] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [newKyc, setNewKyc] = useState({
    docName: 'Aadhar Card',
    docNumber: '',
    fileUrl: ''
  });

  // My Services State
  const [masterServices, setMasterServices] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [requestingServiceId, setRequestingServiceId] = useState(null);

  // 1. Initial Load: Get User Session & Profile
  useEffect(() => {
    const session = getSession();
    if (session) {
      setSessionUser(session);
      fetchMemberProfile(session);
    }
  }, []);

  // Fetch Member Details from API
  const fetchMemberProfile = async (session) => {
    setIsLoadingProfile(true);
    try {
      const targetLoginId = String(session?.loginId || session?.username || session?.adminId || '').trim();
      const targetMsrno = parseInt(session?.msrno || session?.userId || session?.id || 0);

      let fetchedMember = null;

      // 1. Try getById if msrno is valid (>0)
      if (targetMsrno > 0 && API.member?.getById) {
        try {
          const res = await API.member.getById(targetMsrno);
          const candidate = res?.data?.data || res?.data || res;
          if (candidate && (candidate.id || candidate.ID || candidate.loginId || candidate.loginID || candidate.LoginID)) {
            const candidateLogin = String(candidate.loginId || candidate.loginID || candidate.LoginID || '').trim();
            if (!targetLoginId || !candidateLogin || candidateLogin.toLowerCase() === targetLoginId.toLowerCase()) {
              fetchedMember = candidate;
            }
          }
        } catch (_) {}
      }

      // 2. If not found or mismatch, search explicitly by targetLoginId
      if (!fetchedMember && targetLoginId && API.member?.getAll) {
        try {
          const allRes = await API.member.getAll({ search: targetLoginId });
          const items = allRes?.data?.items || allRes?.data?.data || allRes?.data || (Array.isArray(allRes) ? allRes : []);
          const matched = items.find(m => String(m.loginId || m.loginID || m.LoginID || '').toLowerCase() === targetLoginId.toLowerCase());
          if (matched) {
            fetchedMember = matched;
          }
        } catch (_) {}
      }

      const m = fetchedMember || {};
      setFormData({
        id: m.id || m.ID || m.msrno || targetMsrno || 0,
        name: m.name || m.Name || m.fullName || session?.name || session?.fullName || '',
        loginId: m.loginId || m.loginID || m.LoginID || targetLoginId || '',
        mobile: m.mobile || m.Mobile || session?.mobile || '',
        email: m.email || m.Email || session?.email || '',
        aadhar: m.aadhar || m.Aadhar || '',
        pan: m.pan || m.Pan || '',
        shopName: m.shopName || m.ShopName || m.companyName || m.firmName || 'My Shop',
        address: m.address || m.Address || '',
        state: m.state || m.State || '',
        city: m.city || m.City || '',
        pincode: m.pinCode || m.PinCode || m.pincode || '',
        role: m.roleName || m.RoleName || m.role?.name || m.Role?.Name || (session?.role === 1 ? 'Admin' : 'Retailer')
      });

      const realName = m.name || m.Name || m.fullName || null;
      if (realName && session && (realName !== session.name || realName !== session.fullName)) {
        saveSession({
          ...session,
          name: realName,
          fullName: realName,
          mobile: m.mobile || m.Mobile || session.mobile,
          email: m.email || m.Email || session.email
        });
      }
    } catch (err) {
      console.error('Error fetching member profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // 2. Fetch Tab Specific Data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const memberId = sessionUser?.msrno || sessionUser?.userId || formData.id;
    if (activeTab === 'AccountDetails') {
      fetchBankAccounts(memberId);
    } else if (activeTab === 'KYC') {
      fetchKycDocs(memberId);
    } else if (activeTab === 'MyService') {
      fetchServicesData(memberId);
    }
  }, [activeTab, sessionUser]);

  // Fetch Member Bank Accounts
  const fetchBankAccounts = async (memberId) => {
    setIsLoadingBanks(true);
    try {
      if (API.memberBankDetail?.getAll) {
        const res = await API.memberBankDetail.getAll({ MemberID: memberId });
        const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setBankAccounts(list);
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // Fetch KYC Documents
  const fetchKycDocs = async (memberId) => {
    setIsLoadingKyc(true);
    try {
      if (API.kycDocument?.getKycdocumentsMaster) {
        const res = await API.kycDocument.getKycdocumentsMaster({ MemberID: memberId });
        const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setKycDocs(list);
      }
    } catch (err) {
      console.error('Error fetching KYC documents:', err);
    } finally {
      setIsLoadingKyc(false);
    }
  };

  // Fetch Master & Assigned Services
  const fetchServicesData = async (memberId) => {
    setIsLoadingServices(true);
    try {
      const [masterRes, assignedRes] = await Promise.all([
        API.service?.getAll ? API.service.getAll() : null,
        API.memberService?.getAll ? API.memberService.getAll({ MemberID: memberId }) : null
      ]);

      const masters = masterRes?.data?.items || masterRes?.data || (Array.isArray(masterRes) ? masterRes : []);
      const assigned = assignedRes?.data?.items || assignedRes?.data || (Array.isArray(assignedRes) ? assignedRes : []);

      setMasterServices(masters);
      setAssignedServices(assigned);
    } catch (err) {
      console.error('Error fetching services data:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // ── HANDLERS ──

  // Save Profile Details
  const handleSaveProfile = async () => {
    const memberId = formData.id || sessionUser?.msrno;
    if (!memberId) {
      dispatch(setNotification({ type: 'error', message: 'Unable to identify member ID' }));
      return;
    }

    try {
      if (API.member?.updateMember) {
        const payload = {
          id: memberId,
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          aadhar: formData.aadhar,
          pan: formData.pan,
          companyName: formData.shopName,
          address: formData.address,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode
        };
        await API.member.updateMember(memberId, payload);
        const currentSess = getSession();
        if (currentSess && formData.name) {
          saveSession({
            ...currentSess,
            name: formData.name,
            fullName: formData.name,
            mobile: formData.mobile,
            email: formData.email
          });
        }
      }
      setIsEditing(false);
      dispatch(setNotification({ type: 'success', message: 'Profile details updated successfully!' }));
    } catch (err) {
      console.error('Failed to update profile:', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to update profile details' }));
    }
  };

  // Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      dispatch(setNotification({ type: 'error', message: 'Please enter old and new passwords' }));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(setNotification({ type: 'error', message: 'New password and confirm password do not match' }));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      dispatch(setNotification({ type: 'error', message: 'New password must be at least 6 characters long' }));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const memberId = formData.id || sessionUser?.msrno;
      if (API.member?.changePassword) {
        const res = await API.member.changePassword({
          memberId: parseInt(memberId),
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        });
        if (res && res.status === false) {
          dispatch(setNotification({ type: 'error', message: res.mess || res.message || 'Failed to update password' }));
        } else {
          dispatch(setNotification({ type: 'success', message: 'Password updated successfully!' }));
          setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }
      }
    } catch (err) {
      console.error('Password change error:', err);
      dispatch(setNotification({ type: 'error', message: err?.response?.data?.mess || 'Error changing password' }));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Update Pin
  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (!pinData.oldPin || !pinData.newPin) {
      dispatch(setNotification({ type: 'error', message: 'Please enter current and new 4-digit PIN' }));
      return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
      dispatch(setNotification({ type: 'error', message: 'New PIN and confirm PIN do not match' }));
      return;
    }
    if (pinData.newPin.length !== 4 || isNaN(pinData.newPin)) {
      dispatch(setNotification({ type: 'error', message: 'T-PIN must be a 4-digit number' }));
      return;
    }

    setIsUpdatingPin(true);
    try {
      const memberId = formData.id || sessionUser?.msrno;
      if (API.member?.changePin) {
        const res = await API.member.changePin({
          memberId: parseInt(memberId),
          oldPin: pinData.oldPin,
          newPin: pinData.newPin
        });
        if (res && res.status === false) {
          dispatch(setNotification({ type: 'error', message: res.mess || res.message || 'Failed to update T-PIN' }));
        } else {
          dispatch(setNotification({ type: 'success', message: 'Transaction PIN updated successfully!' }));
          setPinData({ oldPin: '', newPin: '', confirmPin: '' });
        }
      }
    } catch (err) {
      console.error('PIN change error:', err);
      dispatch(setNotification({ type: 'error', message: err?.response?.data?.mess || 'Error changing T-PIN' }));
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Submit New Bank Account
  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!newBank.bankName || !newBank.accountNumber || !newBank.ifscCode) {
      dispatch(setNotification({ type: 'error', message: 'Please fill Bank Name, Account Number, and IFSC Code' }));
      return;
    }

    setIsSubmittingBank(true);
    try {
      const memberId = formData.id || sessionUser?.msrno;
      if (API.memberBankDetail?.create) {
        await API.memberBankDetail.create({
          msrno: parseInt(memberId),
          bankName: newBank.bankName,
          accountNumber: newBank.accountNumber,
          ifscCode: newBank.ifscCode,
          accountHolderName: newBank.accountHolderName || formData.name,
          branchName: newBank.branchName || 'Main',
          isActive: true
        });
        dispatch(setNotification({ type: 'success', message: 'Bank account added successfully!' }));
        setShowAddBankModal(false);
        setNewBank({ bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', branchName: '' });
        fetchBankAccounts(memberId);
      }
    } catch (err) {
      console.error('Add bank error:', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to add bank account' }));
    } finally {
      setIsSubmittingBank(false);
    }
  };

  // Delete Bank Account
  const handleDeleteBank = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    try {
      if (API.memberBankDetail?.delete) {
        await API.memberBankDetail.delete(id);
        dispatch(setNotification({ type: 'success', message: 'Bank account deleted successfully' }));
        fetchBankAccounts(formData.id || sessionUser?.msrno);
      }
    } catch (err) {
      console.error('Delete bank error:', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to delete bank account' }));
    }
  };

  // Upload KYC Document
  const handleSaveKyc = async (e) => {
    e.preventDefault();
    if (!newKyc.docName || !newKyc.docNumber) {
      dispatch(setNotification({ type: 'error', message: 'Please fill document name and document number' }));
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const memberId = formData.id || sessionUser?.msrno;
      if (API.kycDocument?.create) {
        await API.kycDocument.create({
          msrno: parseInt(memberId),
          documentName: newKyc.docName,
          documentNumber: newKyc.docNumber,
          isApproved: false,
          createdDate: new Date().toISOString()
        });
        dispatch(setNotification({ type: 'success', message: 'KYC Document submitted for verification!' }));
        setShowUploadKycModal(false);
        setNewKyc({ docName: 'Aadhar Card', docNumber: '', fileUrl: '' });
        fetchKycDocs(memberId);
      }
    } catch (err) {
      console.error('Upload KYC error:', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to submit KYC document' }));
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Request Service Activation
  const handleRequestService = async (service) => {
    const memberId = formData.id || sessionUser?.msrno;
    if (!memberId) {
      dispatch(setNotification({ type: 'error', message: 'Unable to identify member session' }));
      return;
    }

    setRequestingServiceId(service.id);
    try {
      if (API.memberService?.create) {
        await API.memberService.create({
          memberId: parseInt(memberId),
          serviceId: parseInt(service.id),
          isActive: false,
          remark: 'Requested by Member'
        });
        dispatch(setNotification({ type: 'success', message: `Service request for '${service.name}' submitted successfully!` }));
        fetchServicesData(memberId);
      }
    } catch (err) {
      console.error('Request service error:', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to request service' }));
    } finally {
      setRequestingServiceId(null);
    }
  };

  // Download Certificate Image
  const handleDownloadCertificate = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Certificate_${formData.name || 'Member'}.png`;
      link.click();
      dispatch(setNotification({ type: 'success', message: 'Certificate downloaded successfully!' }));
    } catch (err) {
      console.error('Certificate download error:', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to download certificate' }));
    }
  };

  // Image Cropper Drag Handlers
  const handleCameraClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImg(event.target.result);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setIsDragging(false);

  const handleSaveCrop = () => {
    setProfileImg(tempImg);
    setShowCropModal(false);
  };

  const tabs = [
    { id: 'Profile', label: 'Profile', icon: <FaUser /> },
    { id: 'ResetPassword', label: 'Reset Password', icon: <FaKey /> },
    { id: 'ResetPin', label: 'Reset Pin', icon: <FaShieldAlt /> },
    { id: 'KYC', label: 'KYC', icon: <FaIdCard /> },
    { id: 'AccountDetails', label: 'Account Details', icon: <FaUniversity /> },
    { id: 'MyService', label: 'My Service', icon: <FaTools /> },
    { id: 'Certificate', label: 'Certificate', icon: <FaCertificate /> },
    { id: 'Gallery', label: 'Gallery', icon: <FaImages /> }
  ];

  return (
    <div 
      className={`${styles.profilePage} ${isDarkMode ? styles.dark : ''}`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* CROP MODAL */}
      {showCropModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModal} onMouseUp={onMouseUp}>
            <div className={styles.modalHeader}>
              <h3><FaCrop /> Edit Profile Picture</h3>
              <button className={styles.closeBtn} onClick={() => setShowCropModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.cropArea}>
              <div 
                className={styles.cropCircle} 
                onMouseDown={onMouseDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <img 
                  src={tempImg} 
                  alt="Crop Preview" 
                  style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    pointerEvents: 'none'
                  }}
                />
                <div className={styles.dragIndicator}><FaArrowsAlt /></div>
              </div>
            </div>
            <div className={styles.cropControls}>
              <div className={styles.controlHeader}>
                <label>Zoom Level</label>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.01" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <p className={styles.hintText}>Click and drag image to position</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowCropModal(false)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={handleSaveCrop}>Apply Image</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BANK ACCOUNT MODAL */}
      {showAddBankModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModal}>
            <div className={styles.modalHeader}>
              <h3><FaUniversity /> Add Bank Account</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddBankModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveBank} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label>Bank Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  value={newBank.bankName}
                  onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Account Number *</label>
                <input 
                  type="text"
                  required
                  placeholder="Enter Bank Account Number"
                  value={newBank.accountNumber}
                  onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>IFSC Code *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. SBIN0001234"
                  value={newBank.ifscCode}
                  onChange={(e) => setNewBank({ ...newBank, ifscCode: e.target.value.toUpperCase() })}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Account Holder Name</label>
                <input 
                  type="text"
                  placeholder={formData.name || "Enter Holder Name"}
                  value={newBank.accountHolderName}
                  onChange={(e) => setNewBank({ ...newBank, accountHolderName: e.target.value })}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Branch Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Main Branch"
                  value={newBank.branchName}
                  onChange={(e) => setNewBank({ ...newBank, branchName: e.target.value })}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddBankModal(false)}>Cancel</button>
                <button type="submit" disabled={isSubmittingBank} className={styles.confirmBtn}>
                  {isSubmittingBank ? <FaSpinner className={styles.spin} /> : <FaSave />} Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD KYC MODAL */}
      {showUploadKycModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModal}>
            <div className={styles.modalHeader}>
              <h3><FaFileUpload /> Upload KYC Document</h3>
              <button className={styles.closeBtn} onClick={() => setShowUploadKycModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveKyc} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label>Document Type *</label>
                <select 
                  value={newKyc.docName}
                  onChange={(e) => setNewKyc({ ...newKyc, docName: e.target.value })}
                  className={styles.editInput}
                >
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Bank Passbook / Cheque">Bank Passbook / Cheque</option>
                  <option value="Shop Establishment Photo">Shop Establishment Photo</option>
                  <option value="Selfie Photo">Selfie Photo</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Document Number *</label>
                <input 
                  type="text"
                  required
                  placeholder="Enter Document Number (e.g. 1234-5678-9012 or ABCDE1234F)"
                  value={newKyc.docNumber}
                  onChange={(e) => setNewKyc({ ...newKyc, docNumber: e.target.value })}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowUploadKycModal(false)}>Cancel</button>
                <button type="submit" disabled={isSubmittingKyc} className={styles.confirmBtn}>
                  {isSubmittingKyc ? <FaSpinner className={styles.spin} /> : <FaSave />} Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div className={styles.profileHeader}>
        <div className={styles.headerCover}></div>
        <div className={styles.headerContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <img 
                src={profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'Member'}`} 
                alt="Profile" 
                className={styles.profileImg}
              />
              <button className={styles.cameraBtn} onClick={handleCameraClick} title="Change Photo">
                <FaCamera />
              </button>
            </div>
            <div className={styles.userBasicInfo}>
              <h1>{formData.name || sessionUser?.name || sessionUser?.fullName || 'Member'}</h1>
              <p>{formData.role} ({formData.loginId || sessionUser?.loginId || sessionUser?.username || 'RT1001'})</p>
              <div className={styles.statusBadge}>
                <FaCheckCircle /> Verified Merchant
              </div>
            </div>
          </div>
          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Registration Status</span>
              <span className={`${styles.statValue} ${styles.successText}`}>Verified</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Account Type</span>
              <span className={styles.statValue}>{formData.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABS & CONTENT */}
      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <nav className={styles.tabsNav}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.tabContent}>

            {/* TAB 1: PROFILE */}
            {activeTab === 'Profile' && (
              <div className={styles.detailsGrid}>
                <div className={styles.gridHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaUserEdit className={styles.titleIcon} />
                    <h2>Personal & Firm Information</h2>
                  </div>
                  <div className={styles.headerActions}>
                    {!isEditing ? (
                      <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                        <FaTools /> Edit Profile
                      </button>
                    ) : (
                      <button className={styles.saveBtn} onClick={handleSaveProfile}>
                        <FaSave /> Save Changes
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.infoTable}>
                  <div className={styles.tableRow}>
                    <label className={styles.label}>FULL NAME</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.name || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>LOGIN ID</label>
                    <span className={styles.value}>{formData.loginId || '—'}</span>
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>MOBILE NUMBER</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.mobile} 
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.mobile || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>EMAIL ADDRESS</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.email || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>FIRM / SHOP NAME</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.shopName} 
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.shopName || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>AADHAR NUMBER</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.aadhar} 
                        onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.aadhar || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>PAN NUMBER</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.pan} 
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.pan || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>ADDRESS</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.address} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{formData.address || '—'}</span>
                    )}
                  </div>

                  <div className={styles.tableRow}>
                    <label className={styles.label}>CITY / STATE</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={`${formData.city}, ${formData.state}`} 
                        onChange={(e) => {
                          const parts = e.target.value.split(',');
                          setFormData({ ...formData, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                        }}
                        className={styles.editInput} 
                      />
                    ) : (
                      <span className={styles.value}>{(formData.city || formData.state) ? `${formData.city}, ${formData.state}` : '—'}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RESET PASSWORD */}
            {activeTab === 'ResetPassword' && (
              <div className={styles.resetSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaKey className={styles.titleIcon} />
                    <div>
                      <h2>Change Password</h2>
                      <p className={styles.sectionSub}>Update your account login password</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className={styles.resetForm}>
                  <div className={styles.inputGroup}>
                    <label>Old Password *</label>
                    <div className={styles.inputWrapper}>
                      <FaShieldAlt className={styles.inputIcon} />
                      <input 
                        type="password" 
                        required
                        placeholder="Enter current password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>New Password *</label>
                    <div className={styles.inputWrapper}>
                      <FaKey className={styles.inputIcon} />
                      <input 
                        type="password" 
                        required
                        placeholder="Enter new password (min 6 characters)"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Confirm New Password *</label>
                    <div className={styles.inputWrapper}>
                      <FaCheckCircle className={styles.inputIcon} />
                      <input 
                        type="password" 
                        required
                        placeholder="Re-enter new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" disabled={isUpdatingPassword} className={styles.submitBtn}>
                      {isUpdatingPassword ? <FaSpinner className={styles.spin} /> : <FaSave />} Update Password
                    </button>
                    <button type="button" className={styles.clearBtn} onClick={() => setPasswordData({oldPassword:'', newPassword:'', confirmPassword:''})}>
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: RESET PIN */}
            {activeTab === 'ResetPin' && (
              <div className={styles.resetSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaShieldAlt className={styles.titleIcon} />
                    <div>
                      <h2>Change Transaction Pin</h2>
                      <p className={styles.sectionSub}>Update your 4-digit secret transaction PIN</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdatePin} className={styles.resetForm}>
                  <div className={styles.inputGroup}>
                    <label>Old PIN *</label>
                    <div className={styles.inputWrapper}>
                      <FaShieldAlt className={styles.inputIcon} />
                      <input 
                        type="password" 
                        maxLength={4}
                        required
                        placeholder="Enter current 4-digit PIN"
                        value={pinData.oldPin}
                        onChange={(e) => setPinData({...pinData, oldPin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>New PIN *</label>
                    <div className={styles.inputWrapper}>
                      <FaShieldAlt className={styles.inputIcon} />
                      <input 
                        type="password" 
                        maxLength={4}
                        required
                        placeholder="Enter new 4-digit PIN"
                        value={pinData.newPin}
                        onChange={(e) => setPinData({...pinData, newPin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Confirm New PIN *</label>
                    <div className={styles.inputWrapper}>
                      <FaCheckCircle className={styles.inputIcon} />
                      <input 
                        type="password" 
                        maxLength={4}
                        required
                        placeholder="Re-enter new 4-digit PIN"
                        value={pinData.confirmPin}
                        onChange={(e) => setPinData({...pinData, confirmPin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" disabled={isUpdatingPin} className={styles.submitBtn}>
                      {isUpdatingPin ? <FaSpinner className={styles.spin} /> : <FaSave />} Update PIN
                    </button>
                    <button type="button" className={styles.clearBtn} onClick={() => setPinData({oldPin:'', newPin:'', confirmPin:''})}>
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: KYC DOCUMENTS */}
            {activeTab === 'KYC' && (
              <div>
                <div className={styles.gridHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaIdCard className={styles.titleIcon} />
                    <div>
                      <h2>KYC Document Verification</h2>
                      <p className={styles.sectionSub}>View and upload mandatory KYC documents for merchant account</p>
                    </div>
                  </div>
                  <button className={styles.addHeaderBtn} onClick={() => setShowUploadKycModal(true)}>
                    <FaFileUpload /> Upload Document
                  </button>
                </div>

                {isLoadingKyc ? (
                  <div className={styles.emptyState}>
                    <FaSpinner className={styles.spin} />
                    <p>Loading KYC Documents...</p>
                  </div>
                ) : (
                  <div className={styles.cardGrid}>
                    {[
                      { name: 'Aadhar Card', key: 'Aadhar' },
                      { name: 'PAN Card', key: 'PAN' },
                      { name: 'Bank Passbook / Cheque', key: 'Bank' },
                      { name: 'Shop Establishment Photo', key: 'Shop' },
                      { name: 'Selfie Photo', key: 'Selfie' }
                    ].map(docType => {
                      const found = kycDocs.find(k => (k.documentName || k.docName || '').toLowerCase().includes(docType.key.toLowerCase()));
                      const isApproved = found && (found.isApproved || found.status === 'Approved');
                      const isPending = found && !isApproved;

                      return (
                        <div key={docType.name} className={styles.itemCard}>
                          <div className={styles.cardHeader}>
                            <div className={styles.cardTitleInfo}>
                              <div className={styles.cardIcon}><FaIdCard /></div>
                              <div>
                                <h4 className={styles.cardTitle}>{docType.name}</h4>
                                <p className={styles.cardSub}>{found ? (found.documentNumber || found.docNumber || 'Uploaded') : 'Not Uploaded Yet'}</p>
                              </div>
                            </div>
                          </div>
                          <div className={styles.cardFooter}>
                            {isApproved ? (
                              <span className={styles.badgeApproved}><FaRegCheckCircle /> Verified</span>
                            ) : isPending ? (
                              <span className={styles.badgePending}><FaHourglassHalf /> Under Review</span>
                            ) : (
                              <span className={styles.badgeMuted}><FaExclamationTriangle /> Not Submitted</span>
                            )}
                            <button className={styles.editBtn} onClick={() => { setNewKyc({ ...newKyc, docName: docType.name }); setShowUploadKycModal(true); }}>
                              <FaFileUpload /> {found ? 'Re-upload' : 'Upload'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ACCOUNT DETAILS (MEMBER BANK ACCOUNTS) */}
            {activeTab === 'AccountDetails' && (
              <div>
                <div className={styles.gridHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaUniversity className={styles.titleIcon} />
                    <div>
                      <h2>Member Bank Accounts</h2>
                      <p className={styles.sectionSub}>Manage settlement & payout bank accounts linked to your wallet</p>
                    </div>
                  </div>
                  <button className={styles.addHeaderBtn} onClick={() => setShowAddBankModal(true)}>
                    <FaPlus /> Add Bank Account
                  </button>
                </div>

                {isLoadingBanks ? (
                  <div className={styles.emptyState}>
                    <FaSpinner className={styles.spin} />
                    <p>Loading Bank Accounts...</p>
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaUniversity className={styles.emptyIcon} />
                    <h3>No Bank Account Linked</h3>
                    <p>Click "Add Bank Account" to link your settlement bank account.</p>
                    <button className={styles.addHeaderBtn} onClick={() => setShowAddBankModal(true)}>
                      <FaPlus /> Link New Bank Account
                    </button>
                  </div>
                ) : (
                  <div className={styles.cardGrid}>
                    {bankAccounts.map((b, idx) => (
                      <div key={b.id || idx} className={styles.itemCard}>
                        <div className={styles.cardHeader}>
                          <div className={styles.cardTitleInfo}>
                            <div className={styles.cardIcon}><FaUniversity /></div>
                            <div>
                              <h4 className={styles.cardTitle}>{b.bankName || b.bank_name || 'Bank Account'}</h4>
                              <p className={styles.cardSub}>{b.accountHolderName || b.account_holder_name || formData.name}</p>
                            </div>
                          </div>
                          <button className={styles.deleteIconBtn} onClick={() => handleDeleteBank(b.id)} title="Delete Account">
                            <FaTrash />
                          </button>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>A/C Number:</span>
                            <span className={styles.detailVal}>{b.accountNumber || b.account_number || '—'}</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>IFSC Code:</span>
                            <span className={styles.detailVal}>{b.ifscCode || b.ifsc_code || '—'}</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Branch:</span>
                            <span className={styles.detailVal}>{b.branchName || b.branch_name || 'Main Branch'}</span>
                          </div>
                        </div>
                        <div className={styles.cardFooter}>
                          <span className={styles.badgeApproved}><FaCheckCircle /> Active Settlement A/C</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: MY SERVICE */}
            {activeTab === 'MyService' && (
              <div>
                <div className={styles.gridHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaTools className={styles.titleIcon} />
                    <div>
                      <h2>My Services & Activation</h2>
                      <p className={styles.sectionSub}>View assigned services or request new services for your retailer panel</p>
                    </div>
                  </div>
                </div>

                {isLoadingServices ? (
                  <div className={styles.emptyState}>
                    <FaSpinner className={styles.spin} />
                    <p>Loading Services...</p>
                  </div>
                ) : (
                  <div className={styles.cardGrid}>
                    {(masterServices.length > 0 ? masterServices : [
                      { id: 1, name: 'DMT (Money Transfer)', sectionType: 1 },
                      { id: 2, name: 'AEPS (Biometric Cash Withdrawal)', sectionType: 1 },
                      { id: 3, name: 'Mobile & DTH Recharge', sectionType: 2 },
                      { id: 4, name: 'Payout & Wallet Transfer', sectionType: 1 },
                      { id: 5, name: 'UPI Dynamic QR Payment', sectionType: 1 },
                      { id: 6, name: 'Aadhar Pay', sectionType: 1 },
                      { id: 7, name: 'PAN Card Services', sectionType: 3 },
                      { id: 8, name: 'Electricity & Utility Bills (BBPS)', sectionType: 2 }
                    ]).map(service => {
                      // Check if member has this service assigned
                      const assigned = assignedServices.find(a => Number(a.serviceId || a.service_id) === Number(service.id));
                      const isApproved = assigned && assigned.isActive;
                      const isPending = assigned && !assigned.isActive;

                      return (
                        <div key={service.id} className={styles.itemCard}>
                          <div className={styles.cardHeader}>
                            <div className={styles.cardTitleInfo}>
                              <div className={styles.cardIcon}><FaTools /></div>
                              <div>
                                <h4 className={styles.cardTitle}>{service.name}</h4>
                                <p className={styles.cardSub}>Service Code: SRV-{service.id}</p>
                              </div>
                            </div>
                          </div>
                          <div className={styles.cardFooter}>
                            {isApproved ? (
                              <span className={styles.badgeApproved}><FaRegCheckCircle /> Approved Service</span>
                            ) : isPending ? (
                              <span className={styles.badgePending}><FaHourglassHalf /> Pending Approval</span>
                            ) : (
                              <button 
                                className={styles.requestServiceBtn} 
                                disabled={requestingServiceId === service.id}
                                onClick={() => handleRequestService(service)}
                              >
                                {requestingServiceId === service.id ? <FaSpinner className={styles.spin} /> : <FaPaperPlane />} Request Activation
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: CERTIFICATE */}
            {activeTab === 'Certificate' && (
              <div className={styles.certifiedWrapper}>
                <div ref={certRef} className={styles.certificateCard} id="certificate-card">
                  <div className={styles.certTopStripe}></div>
                  
                  <div className={styles.certHeader}>
                    <div className={styles.certBrandText}>
                      <span className={styles.certBrandName}>BYPE DIGITAL SERVICES</span>
                      <span className={styles.certBrandTagline}>Government Registered Financial Solutions Partner</span>
                    </div>
                  </div>

                  <div className={styles.certTitleSection}>
                    <h2 className={styles.certTitle}>AUTHORIZATION CERTIFICATE</h2>
                  </div>

                  <div className={styles.certBody}>
                    <p className={styles.certSubtext}>This is to certify that</p>
                    <h3 className={styles.certMemberName}>{formData.name || 'Retailer Name'}</h3>
                    <div className={styles.certDivider}></div>
                    <p className={styles.certAppointText}>
                      is an Authorized <strong>{formData.role}</strong> of <strong>{formData.shopName || 'Retail Point'}</strong>.
                    </p>
                    <p className={styles.certCity}>Location: {formData.city || 'Jaipur'}, {formData.state || 'Rajasthan'}</p>
                  </div>

                  <div className={styles.certFooter}>
                    <div className={styles.certFooterLeft}>
                      <span className={styles.certFooterLabel}>MERCHANT CODE</span>
                      <span className={styles.certFooterValue}>{formData.loginId || 'RT1001'}</span>
                    </div>
                    <div className={styles.certFooterCenter}>
                      <div className={styles.certPoweredBox}>
                        <span className={styles.certPoweredBy}>OFFICIAL SEAL</span>
                        <FaBuilding style={{ fontSize: '2rem', color: '#1756AA', marginTop: '4px' }} />
                      </div>
                      <div className={styles.certSignatureLine}></div>
                      <span className={styles.certFooterLabel}>AUTHORIZED SIGNATURE</span>
                    </div>
                    <div className={styles.certFooterRight}>
                      <span className={styles.certFooterLabel}>VERIFIED ON</span>
                      <span className={styles.certFooterValue}>{new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className={styles.certBottomStripe}></div>
                </div>

                <button className={styles.certDownloadBtn} onClick={handleDownloadCertificate}>
                  <FaDownload /> Download Official Certificate
                </button>
              </div>
            )}

            {/* TAB 8: GALLERY */}
            {activeTab === 'Gallery' && (
              <div className={styles.detailsGrid}>
                <div className={styles.gridHeader}>
                  <div className={styles.titleWithIcon}>
                    <FaImages className={styles.titleIcon} />
                    <h2>Merchant Store Gallery</h2>
                  </div>
                  <button className={styles.addHeaderBtn} onClick={handleCameraClick}>
                    <FaCamera /> Upload Shop Photo
                  </button>
                </div>
                <div className={styles.cardGrid}>
                  <div className={styles.itemCard}>
                    <img 
                      src={profileImg || "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&auto=format&fit=crop&q=60"} 
                      alt="Store Outlet" 
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                    <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: '0.85rem' }}>{formData.shopName || 'Main Store Front'}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;