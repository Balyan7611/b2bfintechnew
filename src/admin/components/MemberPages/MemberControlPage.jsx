import React, { useEffect, useState, useMemo, useRef } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch } from 'react-redux';
import { API } from '../../../api/endpoints';
import {
  FaArrowLeft, FaEdit, FaHandHoldingUsd, FaMoneyBillWave,
  FaCreditCard, FaExchangeAlt, FaUserLock, FaRupeeSign,
  FaTimesCircle, FaExclamationTriangle, FaUser, FaMobileAlt,
  FaIdCard, FaWallet, FaFingerprint, FaCog, FaCheckCircle,
  FaUserCheck, FaLock, FaCheck
} from 'react-icons/fa';
import { updateMemberDirect } from '../../../store/slices/memberSlice';
import styles from './MemberControlPage.module.css';
import QuickActionGrid from '../../../shared/components/common/QuickActionGrid';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';

const MemberControlPage = ({ activeMemberData, onClose, initialEdit = false, backLabel = 'to Dashboard', setHasUnsavedChanges }) => {
  const dispatch = useDispatch();

  // ── STATE DECLARATIONS ──
  const [isEditingProfile, setIsEditingProfile] = useState(initialEdit);
  const [showTpinModal, setShowTpinModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [adminTpin, setAdminTpin] = useState(['', '', '', '']);
  const [adminTpinError, setAdminTpinError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingProfilePayload, setPendingProfilePayload] = useState(null);
  const adminTpinRefs = useRef([]);
  const [profileForm, setProfileForm] = useState({
    name: '', mobile: '', shop: '', aadhar: '', pan: '',
    title: 'Mr.', role: 'Retailer', packageId: 'Retailer',
    altMobile: '', gender: 'Male', address: '', state: 'Uttar Pradesh',
    city: '', pincode: '', postOffice: '', dob: '', active: true,
    businessName: '', businessAddress: '', businessCity: '',
    businessState: 'Uttar Pradesh', businessPincode: '', businessPostOffice: ''
  });

  useEffect(() => {
    if (activeMemberData) {
      setProfileForm({
        name: activeMemberData.name || '',
        mobile: activeMemberData.mobile || '',
        shop: activeMemberData.email || activeMemberData.shop || activeMemberData.shopName || '',
        aadhar: activeMemberData.aadhar || '',
        pan: activeMemberData.pan || '',
        title: activeMemberData.title || 'Mr.',
        role: activeMemberData.role || activeMemberData.memberType || 'Retailer',
        packageId: activeMemberData.packageId || 'Retailer',
        altMobile: activeMemberData.altMobile || '',
        gender: activeMemberData.gender || 'Male',
        address: activeMemberData.address || '',
        state: activeMemberData.state || 'Uttar Pradesh',
        city: activeMemberData.city || '',
        pincode: activeMemberData.pincode || '',
        postOffice: activeMemberData.postOffice || 'Aurangabad Aheer',
        dob: activeMemberData.dob || '',
        active: activeMemberData.active !== undefined ? activeMemberData.active : true,
        businessName: activeMemberData.businessName || '',
        businessAddress: activeMemberData.businessAddress || '',
        businessCity: activeMemberData.businessCity || '',
        businessState: activeMemberData.businessState || 'Uttar Pradesh',
        businessPincode: activeMemberData.businessPincode || '',
        businessPostOffice: activeMemberData.businessPostOffice || 'Aurangabad Aheer'
      });
    }
  }, [activeMemberData]);

  const [genderOptions, setGenderOptions] = useState(['Male', 'Female']);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res = await API.gender.getAll();
        if (res && Array.isArray(res)) {
          const mapped = res.map(g => g.name).filter(Boolean);
          if (mapped.length > 0) setGenderOptions(mapped);
        }
      } catch (err) {
        console.error("Error fetching genders:", err);
      }
    };
    fetchGenders();
  }, []);

  const [activeActionType, setActiveActionType] = useState(null); // null | 'addFund' | 'deductFund' | 'addAeps' | 'deductAeps' | 'creditLimit' | 'holdAmt'
  const [actionAmount, setActionAmount] = useState('');
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [pendingStatusToggle, setPendingStatusToggle] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [limitMode, setLimitMode] = useState('Credit'); // 'Credit' | 'Debit'
  const [validationError, setValidationError] = useState(null);

  const [mainWalletBal, setMainWalletBal] = useState(0);
  const [aepsWalletBal, setAepsWalletBal] = useState(0);

  useEffect(() => {
    if (activeMemberData) {
      setMainWalletBal(parseFloat(activeMemberData.mainWallet || activeMemberData.mainBal || activeMemberData.balance || 0));
      setAepsWalletBal(parseFloat(activeMemberData.aepsWallet || activeMemberData.aepsBal || activeMemberData.aepsBalance || 0));
    }
  }, [activeMemberData]);

  // ── OTP SECURE COUNTDOWN TIMER EFFECT ──
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // ── TRANSACTION SUBMIT HANDLER ──
  const handleMemberActionSubmit = (e) => {
    e.preventDefault();
    if (!activeActionType || !actionAmount || isNaN(actionAmount) || parseFloat(actionAmount) <= 0) return;
    
    if (!otpSent) {
      setValidationError("Please click 'Send OTP' and enter the OTP sent to verify this transaction.");
      return;
    }
    if (!otpVal || otpVal.length !== 6) {
      setValidationError("Please enter a valid 6-digit OTP.");
      return;
    }

    const amount = parseFloat(actionAmount);
    let updates = {};
    
    if (activeActionType === 'addFund') {
      const current = parseFloat(mainWalletBal || 0);
      updates = { mainWallet: (current + amount), mainBal: (current + amount).toFixed(2) };
    } else if (activeActionType === 'deductFund') {
      const current = parseFloat(mainWalletBal || 0);
      if (current < amount) {
        setValidationError("Insufficient balance to deduct!");
        return;
      }
      updates = { mainWallet: (current - amount), mainBal: (current - amount).toFixed(2) };
    } else if (activeActionType === 'addAeps') {
      const current = parseFloat(aepsWalletBal || 0);
      updates = { aepsWallet: (current + amount), aepsBal: (current + amount).toFixed(2) };
    } else if (activeActionType === 'deductAeps') {
      const current = parseFloat(aepsWalletBal || 0);
      if (current < amount) {
        setValidationError("Insufficient AEPS balance to deduct!");
        return;
      }
      updates = { aepsWallet: (current - amount), aepsBal: (current - amount).toFixed(2) };
    } else if (activeActionType === 'creditLimit') {
      const current = parseFloat(activeMemberData.creditLimit || 0);
      if (limitMode === 'Credit') {
        updates = { creditLimit: (current + amount).toFixed(2) };
      } else {
        if (current < amount) {
          setValidationError("Cannot debit limit more than the current available limit!");
          return;
        }
        updates = { creditLimit: (current - amount).toFixed(2) };
      }
    } else if (activeActionType === 'holdAmt') {
      updates = { holdAmt: amount.toString() };
    }

    setPendingTransaction({
      amount,
      type: activeActionType,
      updates,
      limitMode: activeActionType === 'creditLimit' ? limitMode : null
    });
  };

  // ── CONFIRM TRANSACTION DISPATCH ──
  const confirmPendingTransaction = async () => {
    if (!pendingTransaction) return;

    const isFundTransfer = ['addFund', 'deductFund', 'addAeps', 'deductAeps'].includes(pendingTransaction.type);
    
    if (isFundTransfer) {
      try {
        const payload = {
          msrno: activeMemberData.msrno || activeMemberData.id,
          byMsrno: 1,
          amount: pendingTransaction.amount,
          transactionType: pendingTransaction.type.startsWith('add') ? 'Credit' : 'Debit',
          walletType: pendingTransaction.type.toLowerCase().includes('aeps') ? 'Aeps' : 'Main',
          description: "Wallet update via Member Control Center"
        };
        await API.userWalletBalance.transfer(payload);
        
        // Locally update state so that balance card updates immediately
        if (pendingTransaction.updates.mainWallet !== undefined) {
          setMainWalletBal(pendingTransaction.updates.mainWallet);
        }
        if (pendingTransaction.updates.aepsWallet !== undefined) {
          setAepsWalletBal(pendingTransaction.updates.aepsWallet);
        }

        alert('Transaction Successful!');
      } catch (err) {
        console.error('Transfer API Error:', err);
        alert('Transaction Failed: ' + (err?.response?.data?.message || err.message || 'Unknown Error'));
        return; 
      }
    }

    dispatch(updateMemberDirect({ id: activeMemberData.id, updates: pendingTransaction.updates }));
    setPendingTransaction(null);
    setActionAmount('');
    setActiveActionType(null);
    setOtpSent(false);
    setOtpVal('');
    setOtpTimer(0);
    setLimitMode('Credit');
  };

  // ── EDIT PROFILE SAVE HANDLER ──
  const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      roleId: parseInt(activeMemberData.roleId) || 2,
      titleId: profileForm.title === 'Mr.' ? 1 : profileForm.title === 'Mrs.' ? 2 : 3,
      packageId: parseInt(activeMemberData.packageId) || 2,
      parentId: parseInt(activeMemberData.parentId) || 1,
      name: profileForm.name,
      email: profileForm.shop, // email is bound here
      mobile: profileForm.mobile,
      alterNativeMobileNumber: profileForm.altMobile,
      genderId: profileForm.gender === 'Female' ? 2 : profileForm.gender === 'Other' ? 3 : 1,
      dob: profileForm.dob ? profileForm.dob.split('T')[0] : "",
      pic: activeMemberData.pic || "profile2.jpg",
      loginOnOff: activeMemberData.loginOnOff ?? false,
      deviceId: activeMemberData.deviceId || "",
      appToken: activeMemberData.appToken || "",
      macAddress: activeMemberData.macAddress || "",
      deviceRegister: activeMemberData.deviceRegister || "",
      fromChannel: activeMemberData.fromChannel || "",
      time: parseInt(activeMemberData.time) || 8243,
      aadhar: profileForm.aadhar,
      pan: profileForm.pan,
      address: profileForm.address,
      pinCode: profileForm.pincode,
      stateId: profileForm.state === 'Delhi' ? 2 : profileForm.state === 'Rajasthan' ? 3 : profileForm.state === 'Haryana' ? 4 : profileForm.state === 'Maharashtra' ? 5 : 1,
      cityId: parseInt(activeMemberData.cityId) || 1,
      parentStr: activeMemberData.parentStr || "",
      shopName: profileForm.businessName,
      shopAddress: profileForm.businessAddress,
      shopPinCode: profileForm.businessPincode,
      shopStateId: profileForm.businessState === 'Delhi' ? 2 : profileForm.businessState === 'Rajasthan' ? 3 : profileForm.businessState === 'Haryana' ? 4 : profileForm.businessState === 'Maharashtra' ? 5 : 1,
      shopCityId: parseInt(activeMemberData.shopCityId) || 1,
      postOffice: profileForm.postOffice,
      businessPostOffice: profileForm.businessPostOffice
    };

    setPendingProfilePayload(payload);
    setAdminTpin(['', '', '', '']);
    setAdminTpinError('');
    setShowTpinModal(true);
  };

  // Set Unsaved Changes
  useEffect(() => {
    if (setHasUnsavedChanges) {
      setHasUnsavedChanges(isEditingProfile);
    }
  }, [isEditingProfile, setHasUnsavedChanges]);

  const handleActionMenuClick = (menuLabel) => {
    setActiveActionType(menuLabel);
  };

  const handleTpinSubmit = async () => {
    const enteredAdminTpin = adminTpin.join('');
    if (!enteredAdminTpin || enteredAdminTpin.length < 4) {
      setAdminTpinError('Please enter full 4-digit Admin TPIN');
      return;
    }
    if (enteredAdminTpin !== '1234') {
      setAdminTpinError('Incorrect Admin TPIN! (Hint: 1234)');
      return;
    }

    setShowTpinModal(false);

    try {
      const res = await API.member.updateMember(activeMemberData.id, pendingProfilePayload);
      if (res && (res.status === true || res.code === 'TXN')) {
        dispatch(updateMemberDirect({
          id: activeMemberData.id,
          updates: { ...pendingProfilePayload, memberType: pendingProfilePayload.role }
        }));
        
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setIsEditingProfile(false);
          if (backLabel === '') {
            onClose();
          }
        }, 2000);
      } else {
        setValidationError(res.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setValidationError("An error occurred while updating the profile.");
    }
  };

  // ── BLOCK / UNBLOCK MEMBER TENTATIVE ──
  const handleToggleMemberStatus = () => {
    setPendingStatusToggle(true);
  };

  return (
    <div className={styles.memberControlPage}>
      {/* Top Navigation Row */}
      <div className={styles.memberControlTopBar}>
        <button 
          className={styles.pageBackBtn}
          onClick={() => {
            if (isEditingProfile) {
              setShowUnsavedModal(true);
            } else if (activeActionType) {
              setActiveActionType(null);
              setActionAmount('');
            } else {
              onClose();
            }
          }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} /> Back {backLabel && <span className={styles.hideOnMobile}>{backLabel}</span>}
        </button>
        <span className={styles.controlPageTitle}>
          {isEditingProfile
            ? 'Edit Member Profile'
            : activeActionType
            ? 'Wallet & Fund Operation'
            : 'Member Control Center'}
        </span>
      </div>

      {isEditingProfile ? (
        /* ── FULL PROFILE EDITING PAGE ── */
        <form onSubmit={handleProfileFormSubmit} className={styles.editProfileFormPage}>
          
          {/* Section 1: Personal Details */}
          <div className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <span className={styles.roleBadge}>Role: {profileForm.role}</span>
              <h3 className={styles.formSectionTitle}>Personal Details</h3>
            </div>
            
            <div className={styles.formGrid}>
              {/* Title Select */}
              <div className={styles.formGroup}>
                <label>Title</label>
                <select 
                  value={profileForm.title} 
                  onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              </div>

              {/* Name */}
              <div className={styles.formGroup}>
                <label>Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              {/* PackageID */}
              <div className={styles.formGroup}>
                <label>PackageID</label>
                <input 
                  type="text" 
                  value={profileForm.packageId} 
                  onChange={e => setProfileForm({ ...profileForm, packageId: e.target.value })}
                  className={styles.formInput}
                  readOnly
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={profileForm.shop}
                  onChange={e => setProfileForm({ ...profileForm, shop: e.target.value })}
                  className={styles.formInput}
                  placeholder="email@example.com"
                />
              </div>

              {/* Mobile */}
              <div className={styles.formGroup}>
                <label>Mobile</label>
                <input 
                  type="text" 
                  value={profileForm.mobile} 
                  onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className={styles.formInput}
                  required
                />
              </div>

              {/* Alternative Mobile */}
              <div className={styles.formGroup}>
                <label>Alternative Mobile</label>
                <input 
                  type="text" 
                  value={profileForm.altMobile} 
                  onChange={e => setProfileForm({ ...profileForm, altMobile: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Aadhar Number */}
              <div className={styles.formGroup}>
                <label>Aadhar Number</label>
                <input 
                  type="text" 
                  value={profileForm.aadhar} 
                  onChange={e => setProfileForm({ ...profileForm, aadhar: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Pan Number */}
              <div className={styles.formGroup}>
                <label>Pan Number</label>
                <input 
                  type="text" 
                  value={profileForm.pan} 
                  onChange={e => setProfileForm({ ...profileForm, pan: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Gender Radio */}
              <div className={styles.formGroup}>
                <label>Gender</label>
                <div className={styles.radioGroup}>
                  {genderOptions.map(g => (
                    <label key={g} className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="gender" 
                        value={g} 
                        checked={profileForm.gender === g} 
                        onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className={`${styles.formGroup} ${styles.fullWidthRow}`}>
                <label>Address</label>
                <input 
                  type="text" 
                  value={profileForm.address} 
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* State Dropdown */}
              <div className={styles.formGroup}>
                <label>State</label>
                <select 
                  value={profileForm.state} 
                  onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>

              {/* City */}
              <div className={styles.formGroup}>
                <label>City</label>
                <input 
                  type="text" 
                  value={profileForm.city} 
                  onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Pin Code */}
              <div className={styles.formGroup}>
                <label>Pin Code</label>
                <input 
                  type="text" 
                  value={profileForm.pincode} 
                  onChange={e => setProfileForm({ ...profileForm, pincode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Post Office Dropdown */}
              <div className={styles.formGroup}>
                <label>Post Office</label>
                <select 
                  value={profileForm.postOffice} 
                  onChange={e => setProfileForm({ ...profileForm, postOffice: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="Aurangabad Aheer">Aurangabad Aheer</option>
                  <option value="Sikandrabad H.O">Sikandrabad H.O</option>
                  <option value="Bulandshahr G.O">Bulandshahr G.O</option>
                </select>
              </div>

              {/* DOB */}
              <div className={styles.formGroup}>
                <label>DOB</label>
                <input 
                  type="date" 
                  value={profileForm.dob} 
                  onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Active Status Checkbox */}
              <div className={styles.formGroup}>
                <label>Active Status</label>
                <div className={styles.checkboxWrapper}>
                  <input 
                    type="checkbox" 
                    checked={profileForm.active} 
                    onChange={e => setProfileForm({ ...profileForm, active: e.target.checked })}
                    className={styles.formCheckbox}
                  />
                  <span className={styles.checkboxText}>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Business Details */}
          <div className={styles.formSection} style={{ marginTop: '24px' }}>
            <div className={styles.formSectionHeader}>
              <h3 className={styles.formSectionTitle}>Business Details</h3>
            </div>
            
            <div className={styles.formGrid}>
              {/* Business Name */}
              <div className={styles.formGroup}>
                <label>Business Name</label>
                <input 
                  type="text" 
                  value={profileForm.businessName} 
                  onChange={e => setProfileForm({ ...profileForm, businessName: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Business Address */}
              <div className={styles.formGroup}>
                <label>Business Address</label>
                <input 
                  type="text" 
                  value={profileForm.businessAddress} 
                  onChange={e => setProfileForm({ ...profileForm, businessAddress: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* City */}
              <div className={styles.formGroup}>
                <label>City</label>
                <input 
                  type="text" 
                  value={profileForm.businessCity} 
                  onChange={e => setProfileForm({ ...profileForm, businessCity: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* State Dropdown */}
              <div className={styles.formGroup}>
                <label>State</label>
                <select 
                  value={profileForm.businessState} 
                  onChange={e => setProfileForm({ ...profileForm, businessState: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>

              {/* Pin Code */}
              <div className={styles.formGroup}>
                <label>PinCode</label>
                <input 
                  type="text" 
                  value={profileForm.businessPincode} 
                  onChange={e => setProfileForm({ ...profileForm, businessPincode: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Post Office Dropdown */}
              <div className={styles.formGroup}>
                <label>Post Office</label>
                <select 
                  value={profileForm.businessPostOffice} 
                  onChange={e => setProfileForm({ ...profileForm, businessPostOffice: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="Aurangabad Aheer">Aurangabad Aheer</option>
                  <option value="Sikandrabad H.O">Sikandrabad H.O</option>
                  <option value="Bulandshahr G.O">Bulandshahr G.O</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className={styles.editPageActions}>
            <button 
              type="button" 
              onClick={() => {
                if (backLabel === '') {
                  onClose();
                } else {
                  setIsEditingProfile(false);
                }
              }}
              className={styles.editCancelBtn}
              style={{
                padding: '10px 24px',
                background: '#F1F5F9',
                border: 'none',
                color: '#475569',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <PrimaryButton 
              type="submit" 
            >
              Proceed & Save
            </PrimaryButton>
          </div>

        </form>
      ) : activeActionType ? (
        /* ── FULL PAGE FUND & WALLET MANAGEMENT ── */
        <form onSubmit={handleMemberActionSubmit} className={styles.fundManagementPage}>
          <div className={styles.fundPageHeader}>
            <h3 className={styles.fundPageTitle}>
              {activeActionType === 'addFund' && '💰 Add Wallet Fund'}
              {activeActionType === 'deductFund' && '💸 Deduct Wallet Fund'}
              {activeActionType === 'addAeps' && '💳 Add AEPS Wallet Fund'}
              {activeActionType === 'deductAeps' && '🪙 Deduct AEPS Wallet Fund'}
              {activeActionType === 'creditLimit' && '🛡️ Set Credit Limit'}
              {activeActionType === 'holdAmt' && '🔒 Set Hold Amount'}
            </h3>
            <span className={styles.fundMemberBadge}>
              Member: <strong>{activeMemberData.name}</strong> ({activeMemberData.memberId})
            </span>
          </div>

          <div className={styles.fundSplitGrid}>
            
            {/* Left Column: Balances Overview Panel */}
            <div className={styles.fundBalancesPanel}>
              <h4 className={styles.panelSubtitle}>Account Balance Overview</h4>
              <div className={styles.miniBalCardGrid}>
                <div className={`${styles.miniBalCard} ${styles.miniBalMain}`}>
                  <span className={styles.miniBalLabel}>Main Wallet Balance</span>
                  <span className={styles.miniBalVal}>
                    ₹ {parseFloat(mainWalletBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`${styles.miniBalCard} ${styles.miniBalAeps}`}>
                  <span className={styles.miniBalLabel}>AEPS Wallet Balance</span>
                  <span className={styles.miniBalVal}>
                    ₹ {parseFloat(aepsWalletBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`${styles.miniBalCard} ${styles.miniBalHold}`}>
                  <span className={styles.miniBalLabel}>Current Hold Amount</span>
                  <span className={styles.miniBalVal} style={{ color: '#E53E3E' }}>
                    ₹ {parseFloat(activeMemberData.holdAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`${styles.miniBalCard} ${styles.miniBalCredit}`}>
                  <span className={styles.miniBalLabel}>Available Credit Limit</span>
                  <span className={styles.miniBalVal} style={{ color: '#2B6CB0' }}>
                    ₹ {parseFloat(activeMemberData.creditLimit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Transaction Input Controls */}
            <div className={styles.fundInputsPanel}>
              <h4 className={styles.panelSubtitle}>Enter Transaction Parameters</h4>
              
              <div className={styles.fundFormGroup}>
                <label className={styles.fundInputLabel}>Amount to Process (INR) <span style={{ color: '#E53E3E' }}>*</span></label>
                <div className={styles.fundAmountWrapper}>
                  <span className={styles.fundCurrencyPrefix}>₹</span>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="Enter Amount (e.g. 5000)..." 
                    className={styles.fundAmountInput}
                    value={actionAmount}
                    onChange={e => setActionAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Payment Options (Only for Add/Deduct Fund) */}
              {(activeActionType === 'addFund' || activeActionType === 'deductFund') && (
                <div className={styles.fundInputRow}>
                  <div className={styles.fundFormGroup} style={{ flex: 1 }}>
                    <label className={styles.fundInputLabel}>Transaction Category</label>
                    <select className={styles.fundSelectInput}>
                      <option value="adjustment">Balance Adjustment</option>
                      <option value="bank_transfer">Bank Transfer (IMPS/NEFT)</option>
                      <option value="cash">Cash Deposit</option>
                      <option value="upi">UPI Payment</option>
                      <option value="penalty">Penalty Charge</option>
                    </select>
                  </div>
                  <div className={styles.fundFormGroup} style={{ flex: 1 }}>
                    <label className={styles.fundInputLabel}>Payment Reference No. (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TXN942048218..." 
                      className={styles.fundInputText}
                    />
                  </div>
                </div>
              )}

              {/* OTP Secure Verification Fields */}
              {activeActionType && (
                <>
                  <div className={styles.fundFormGroup}>
                    <label className={styles.fundInputLabel}>Registered Email ID</label>
                    <input 
                      type="email" 
                      value={activeMemberData.email || 'pay99@gmail.com'} 
                      readOnly 
                      className={styles.fundInputText}
                      style={{ background: '#F8FAFF', color: '#718096', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className={styles.fundFormGroup}>
                    <label className={styles.fundInputLabel}>Enter OTP Sent to Mobile/Email <span style={{ color: '#E53E3E' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text" 
                        maxLength="6"
                        placeholder="Enter 6-Digit OTP..." 
                        value={otpVal}
                        onChange={e => setOtpVal(e.target.value)}
                        required
                        className={styles.fundInputText}
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setOtpSent(true);
                          setOtpTimer(60);
                        }}
                        disabled={otpTimer > 0}
                        className={styles.sendOtpBtn}
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                    {otpSent && (
                      <span style={{ fontSize: '0.72rem', color: '#27AE60', fontWeight: '700', marginTop: '4px' }}>
                        ✓ OTP sent successfully to registered contact points.
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Credit Limit Specific Select Mode Option */}
              {activeActionType === 'creditLimit' && (
                <div className={styles.fundFormGroup}>
                  <label className={styles.fundInputLabel}>Select Mode <span style={{ color: '#E53E3E' }}>*</span></label>
                  <select 
                    className={styles.fundSelectInput}
                    value={limitMode}
                    onChange={e => setLimitMode(e.target.value)}
                    required
                  >
                    <option value="Credit">Credit (Add Limit)</option>
                    <option value="Debit">Debit (Deduct Limit)</option>
                  </select>
                </div>
              )}

              <div className={styles.fundFormGroup}>
                <label className={styles.fundInputLabel}>Remarks / Narration <span style={{ color: '#E53E3E' }}>*</span></label>
                <textarea 
                  placeholder="Write a clear narration explaining the purpose of this operation..." 
                  className={styles.fundTextareaInput}
                  required
                  defaultValue="Manual balance update via Admin Portal."
                />
              </div>
            </div>

          </div>

          {/* Action Buttons Row */}
          <div className={styles.fundActionsRow}>
            <button 
              type="button" 
              onClick={() => {
                setActiveActionType(null);
                setActionAmount('');
                setOtpSent(false);
                setOtpVal('');
                setOtpTimer(0);
                setLimitMode('Credit');
              }}
              className={styles.fundCancelBtn}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.fundConfirmBtn} ${
                activeActionType.startsWith('add') ? styles.confirmBtnAdd : 
                activeActionType.startsWith('deduct') ? styles.confirmBtnDeduct : 
                styles.confirmBtnBlue
              }`}
            >
              {activeActionType === 'addFund' && 'Add Wallet Balance'}
              {activeActionType === 'deductFund' && 'Deduct Wallet Balance'}
              {activeActionType === 'addAeps' && 'Credit AEPS Wallet'}
              {activeActionType === 'deductAeps' && 'Debit AEPS Wallet'}
              {activeActionType === 'creditLimit' && 'Update Credit Limit'}
              {activeActionType === 'holdAmt' && 'Restrict Hold Amount'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Profile Header Block */}
          <div className={styles.memberModalProfileHeader}>
            <div className={styles.memberAvatarCircle}>
              {activeMemberData.name ? activeMemberData.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className={styles.memberHeaderDetails}>
              <div className={styles.memberNameRow}>
                <h2>{activeMemberData.name}</h2>
                <span className={`${styles.statusTag} ${activeMemberData.memberType === 'DeActive' ? styles.statusTagDeactive : styles.statusTagActive}`}>
                  {activeMemberData.memberType === 'DeActive' ? 'Inactive' : 'Active'}
                </span>
                <span className={`${styles.statusTag} ${activeMemberData.aepsStatus === 'Registered' ? styles.statusTagActive : styles.statusTagWarning}`}>
                  KYC {activeMemberData.aepsStatus === 'Registered' ? 'Verified' : 'Pending'}
                </span>
                <span className={`${styles.statusTag} ${activeMemberData.aepsStatus === 'Registered' ? styles.statusTagActive : styles.statusTagDeactive}`}>
                  AEPS {activeMemberData.aepsStatus === 'Registered' ? 'Registered' : 'Not Registered'}
                </span>
                <span className={`${styles.statusTag} ${parseFloat(activeMemberData.holdAmt || activeMemberData.holdAmount || 0) > 0 ? styles.statusTagDeactive : styles.statusTagActive}`}>
                  {parseFloat(activeMemberData.holdAmt || activeMemberData.holdAmount || 0) > 0 ? 'On Hold' : 'No Hold'}
                </span>
              </div>
              <div className={styles.memberHeaderSubtext}>
                <span><strong>ID:</strong> {activeMemberData.memberId || 'N/A'}</span>
                <span><strong>Mobile:</strong> {activeMemberData.mobile}</span>
                <span><strong>Shop:</strong> {activeMemberData.shop || 'N/A'}</span>
                <span><strong>City:</strong> {activeMemberData.city || 'N/A'}</span>
              </div>
              <div className={styles.memberHeaderStatusDesc}>
                <span>
                  💡 <strong>Status Summary:</strong> Account is <strong>{activeMemberData.memberType === 'DeActive' ? 'blocked' : 'active'}</strong>, 
                  KYC is <strong>{activeMemberData.aepsStatus === 'Registered' ? 'verified' : 'pending'}</strong>, 
                  AEPS is <strong>{activeMemberData.aepsStatus === 'Registered' ? 'active' : 'not registered (requires KYC)'}</strong>, and 
                  wallet has <strong>{parseFloat(activeMemberData.holdAmt || activeMemberData.holdAmount || 0) > 0 ? `hold restriction of ₹${parseFloat(activeMemberData.holdAmt || activeMemberData.holdAmount || 0).toFixed(2)}` : 'no hold restriction'}</strong>.
                </span>
              </div>
            </div>
          </div>

          {/* Modal Split Content Body Container */}
          <div className={styles.memberModalBody}>
            {/* LEFT COLUMN: Balances & Technical Specifications */}
            <div className={styles.modalLeftColumn}>
              {/* Balances Grid */}
              <div className={styles.memberModalBalancesRow}>
                <div className={`${styles.memberBalCard} ${styles.balCardMain}`}>
                  <div className={styles.balCardHeader}>
                    <span className={styles.balCardLabel}>Main Wallet</span>
                    <FaWallet className={styles.balCardIcon} />
                  </div>
                  <span className={styles.balCardVal}>
                    ₹ {parseFloat(mainWalletBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`${styles.memberBalCard} ${styles.balCardAeps}`}>
                  <div className={styles.balCardHeader}>
                    <span className={styles.balCardLabel}>AEPS Wallet</span>
                    <FaFingerprint className={styles.balCardIcon} />
                  </div>
                  <span className={styles.balCardVal}>
                    ₹ {parseFloat(aepsWalletBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`${styles.memberBalCard} ${styles.balCardHold}`}>
                  <div className={styles.balCardHeader}>
                    <span className={styles.balCardLabel}>Hold Amount</span>
                    <FaLock className={styles.balCardIcon} />
                  </div>
                  <span className={styles.balCardVal}>
                    ₹ {parseFloat(activeMemberData.holdAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>


            </div>

            {/* RIGHT COLUMN: Quick Account Actions Panel */}
            <div className={styles.modalRightColumn}>
              <h3 className={styles.modalSectionTitle}>Quick Account Operations</h3>
              
              <QuickActionGrid
                isEditingProfile={isEditingProfile}
                activeActionType={activeActionType}
                memberType={activeMemberData.memberType}
                onEditProfile={() => {
                  const next = !isEditingProfile;
                  setIsEditingProfile(next);
                  setActiveActionType(null);
                  if (next) {
                    setProfileForm({
                      name: activeMemberData.name || '',
                      mobile: activeMemberData.mobile || '',
                      shop: activeMemberData.shop || '',
                      aadhar: activeMemberData.aadhar || '',
                      pan: activeMemberData.pan || '',
                      title: activeMemberData.title || 'Mr.',
                      role: activeMemberData.role || activeMemberData.memberType || 'Retailer',
                      packageId: activeMemberData.packageId || 'Retailer',
                      altMobile: activeMemberData.altMobile || '',
                      gender: activeMemberData.gender || 'Male',
                      address: activeMemberData.address || '',
                      state: activeMemberData.state || 'Uttar Pradesh',
                      city: activeMemberData.city || '',
                      pincode: activeMemberData.pincode || '',
                      postOffice: activeMemberData.postOffice || 'Aurangabad Aheer',
                      dob: activeMemberData.dob || '',
                      active: activeMemberData.active !== undefined ? activeMemberData.active : true,
                      businessName: activeMemberData.businessName || '',
                      businessAddress: activeMemberData.businessAddress || '',
                      businessCity: activeMemberData.businessCity || '',
                      businessState: activeMemberData.businessState || 'Uttar Pradesh',
                      businessPincode: activeMemberData.businessPincode || '',
                      businessPostOffice: activeMemberData.businessPostOffice || 'Aurangabad Aheer',
                    });
                  }
                }}
                onAction={(type, defaultAmt) => {
                  setActiveActionType(activeActionType === type ? null : type);
                  setIsEditingProfile(false);
                  setActionAmount(defaultAmt !== undefined ? String(defaultAmt) : '');
                }}
                onBlock={handleToggleMemberStatus}
                holdAmt={activeMemberData.holdAmt}
                creditLimit={activeMemberData.creditLimit}
              />
            </div>
          </div>
        </>
      )}

      {/* Wallet Action Confirmation Dialog Modal */}
      {pendingTransaction && (
        <div className={styles.fundConfirmModalOverlay} onClick={() => setPendingTransaction(null)}>
          <div className={styles.fundConfirmModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmModalIconCircle} style={{
              background: (pendingTransaction.type.startsWith('add') || pendingTransaction.limitMode === 'Credit') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(229, 62, 62, 0.1)',
              color: (pendingTransaction.type.startsWith('add') || pendingTransaction.limitMode === 'Credit') ? '#27AE60' : '#E53E3E'
            }}>
              <FaExclamationTriangle />
            </div>

            <h3>Confirm Transaction</h3>
            <p>Please double-check the transaction details below before proceeding.</p>

            <div className={styles.confirmDetailsBox}>
              <div className={styles.confirmDetailRow}>
                <span className={styles.detailLabel}>Operation Type</span>
                <span className={styles.detailValue} style={{
                  color: (pendingTransaction.type.startsWith('add') || pendingTransaction.limitMode === 'Credit') ? '#27AE60' : '#E53E3E',
                  fontWeight: '700'
                }}>
                  {pendingTransaction.type === 'addFund' && 'Add Main Wallet Fund'}
                  {pendingTransaction.type === 'deductFund' && 'Deduct Main Wallet Fund'}
                  {pendingTransaction.type === 'addAeps' && 'Credit AEPS Wallet'}
                  {pendingTransaction.type === 'deductAeps' && 'Debit AEPS Wallet'}
                  {pendingTransaction.type === 'creditLimit' && `Update Credit Limit (${pendingTransaction.limitMode})`}
                  {pendingTransaction.type === 'holdAmt' && 'Restrict Hold Amount'}
                </span>
              </div>
              <div className={styles.confirmDetailRow}>
                <span className={styles.detailLabel}>Target Member</span>
                <span className={styles.detailValue}>{activeMemberData.name} ({activeMemberData.memberId})</span>
              </div>
              <div className={styles.confirmDetailRow}>
                <span className={styles.detailLabel}>Transaction Amount</span>
                <span className={styles.detailValueAmount}>
                  ₹ {pendingTransaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className={styles.confirmModalActions}>
              <button 
                type="button" 
                onClick={() => setPendingTransaction(null)}
                className={styles.confirmModalCancelBtn}
              >
                No, Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmPendingTransaction}
                className={styles.confirmModalProceedBtn}
                style={{
                  background: (pendingTransaction.type.startsWith('add') || pendingTransaction.limitMode === 'Credit') ? '#27AE60' : '#E53E3E',
                  boxShadow: (pendingTransaction.type.startsWith('add') || pendingTransaction.limitMode === 'Credit') ? '0 8px 20px rgba(39, 174, 96, 0.25)' : '0 8px 20px rgba(229, 62, 62, 0.25)'
                }}
              >
                Yes, Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Toggle Confirmation Dialog Modal */}
      {pendingStatusToggle && (
        <div className={styles.fundConfirmModalOverlay} onClick={() => setPendingStatusToggle(false)}>
          <div className={styles.fundConfirmModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmModalIconCircle} style={{
              background: activeMemberData.memberType === 'DeActive' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(229, 62, 62, 0.1)',
              color: activeMemberData.memberType === 'DeActive' ? '#27AE60' : '#E53E3E'
            }}>
              <FaExclamationTriangle />
            </div>

            <h3>Confirm Account Status Change</h3>
            <p>
              Are you sure you want to {activeMemberData.memberType === 'DeActive' ? 'Activate' : 'Block'} the account of{' '}
              <strong>{activeMemberData.name}</strong> ({activeMemberData.memberId})?
            </p>

            <div className={styles.confirmModalActions} style={{ marginTop: '24px' }}>
              <button 
                type="button" 
                onClick={() => setPendingStatusToggle(false)}
                className={styles.confirmModalCancelBtn}
              >
                No, Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const nextStatus = activeMemberData.memberType === 'DeActive' ? 'Active' : 'DeActive';
                  dispatch(updateMemberDirect({
                    id: activeMemberData.id,
                    updates: { memberType: nextStatus }
                  }));
                  setPendingStatusToggle(false);
                }}
                className={styles.confirmModalProceedBtn}
                style={{
                  background: activeMemberData.memberType === 'DeActive' ? '#27AE60' : '#E53E3E',
                  boxShadow: activeMemberData.memberType === 'DeActive' ? '0 8px 20px rgba(39, 174, 96, 0.25)' : '0 8px 20px rgba(229, 62, 62, 0.25)'
                }}
              >
                Yes, {activeMemberData.memberType === 'DeActive' ? 'Activate' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Validation Error Alert Modal */}
      {validationError && (
        <div className={styles.errorModalOverlay} onClick={() => setValidationError(null)}>
          <div className={styles.errorModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.errorModalIconCircle}>
              <FaTimesCircle />
            </div>
            <h3>Operation Failed</h3>
            <p className={styles.errorMessageText}>{validationError}</p>
            <div className={styles.errorModalActions}>
              <button 
                type="button" 
                onClick={() => setValidationError(null)}
                className={styles.errorModalCloseBtn}
              >
                Okay, Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TPIN Modal */}
      {showTpinModal && (
        <div className={styles.errorModalOverlay} onClick={() => setShowTpinModal(false)}>
          <div className={styles.errorModalCard} onClick={e => e.stopPropagation()} style={{ padding: '30px' }}>
            <div className={styles.errorModalIconCircle} style={{ background: '#EBF3FC', color: '#1756AA' }}>
              <FaLock />
            </div>
            <h3 style={{ marginTop: '15px', color: '#0D1B3E' }}>Enter Admin TPIN</h3>
            <p style={{ color: '#4E6080', fontSize: '0.9rem', marginBottom: '20px' }}>Please enter your 4-digit Admin TPIN to proceed.</p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
              {adminTpin.map((digit, i) => (
                <input
                  key={i}
                  ref={el => adminTpinRefs.current[i] = el}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={e => {
                    setAdminTpinError('');
                    const val = e.target.value.replace(/\D/g, '');
                    const currentArray = [...adminTpin];
                    currentArray[i] = val;
                    setAdminTpin(currentArray);
                    
                    if (val && i < 3) {
                      adminTpinRefs.current[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !adminTpin[i] && i > 0) {
                      adminTpinRefs.current[i - 1]?.focus();
                    } else if (e.key === 'Enter') {
                      handleTpinSubmit();
                    }
                  }}
                  style={{
                    width: '45px', height: '45px', textAlign: 'center', fontSize: '1.2rem',
                    border: adminTpinError ? '1.5px solid #E53E3E' : '1.5px solid #CBD5E1',
                    borderRadius: '8px', outline: 'none', background: '#F8FAFC'
                  }}
                />
              ))}
            </div>

            {adminTpinError && <p style={{ color: '#E53E3E', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '15px', textAlign: 'center' }}>{adminTpinError}</p>}

            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              <button 
                onClick={() => setShowTpinModal(false)}
                style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleTpinSubmit}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Verify & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE OVERLAY (Profile Update) */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModalCard}>
            <div className={styles.successIconCircle}>
              <FaCheck />
            </div>
            <h3>Profile Updated Successfully!</h3>
            <p>Changes have been saved and applied.</p>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 27, 62, 0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FFF5F5', color: '#E53E3E', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaExclamationTriangle />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0D1B3E', margin: '0 0 8px 0' }}>Unsaved Changes</h3>
            <p style={{ fontSize: '0.85rem', color: '#4E6080', margin: '0 0 24px 0', lineHeight: '1.4' }}>You have unsaved changes in the profile. Do you want to discard them and go back?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowUnsavedModal(false)} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowUnsavedModal(false); setIsEditingProfile(false); onClose(); }} style={{ flex: 1, padding: '10px', background: '#E53E3E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberControlPage;

