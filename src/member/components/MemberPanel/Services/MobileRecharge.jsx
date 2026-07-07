import React, { useState } from 'react';
import styles from './MobileRecharge.module.css';
import { 
  MdPhoneIphone, 
  MdAccountBalanceWallet, 
  MdOutlineSecurity, 
  MdInfoOutline,
  MdFlashOn,
  MdPayment,
  MdLocationOn,
  MdClose,
  MdCheckCircle
} from 'react-icons/md';
import { BiNetworkChart } from 'react-icons/bi';
import ServiceQuickNav from './ServiceQuickNav';
import { useFetchServices } from '../../../../hooks/useFetchServices';

const MobileRecharge = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [service, setService] = useState('');
  const [operator, setOperator] = useState('');
  const [state, setState] = useState('');
  const [amount, setAmount] = useState('0');
  const [tp, setTp] = useState('');
  const [activeTab, setActiveTab] = useState('Topup');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const { services, loading: servicesLoading } = useFetchServices(1);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const operators = ["Airtel", "Jio", "Vodafone Idea (Vi)", "BSNL", "MTNL"];
  const states = ["Delhi", "Maharashtra", "Gujarat", "Rajasthan", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal"];
  const planTabs = ["Topup", "Data", "Validity", "R-Offer"];

  const plansData = {
    Topup: [
      { price: "239", validity: "28 Days", desc: "1.5GB/Day + Unlimited Calls + 100 SMS/Day" },
      { price: "299", validity: "28 Days", desc: "2GB/Day + Unlimited Calls + 100 SMS/Day" },
      { price: "666", validity: "84 Days", desc: "1.5GB/Day + Unlimited Calls + 100 SMS/Day" },
      { price: "719", validity: "84 Days", desc: "2GB/Day + Unlimited Calls + 100 SMS/Day" },
      { price: "2999", validity: "365 Days", desc: "2.5GB/Day + Unlimited Calls + 100 SMS/Day" },
      { price: "155", validity: "28 Days", desc: "2GB Data + Unlimited Calls + 300 SMS" },
    ],
    Data: [
      { price: "15", validity: "Existing Pack", desc: "1GB Data Booster" },
      { price: "25", validity: "Existing Pack", desc: "2GB Data Booster" },
      { price: "61", validity: "Existing Pack", desc: "6GB Data Booster" },
      { price: "121", validity: "Existing Pack", desc: "12GB Data Booster" },
    ],
    Validity: [
      { price: "155", validity: "28 Days", desc: "Unlimited Calls + 2GB Data + 300 SMS" },
      { price: "179", validity: "28 Days", desc: "Unlimited Calls + 2GB Data + 300 SMS + Apps" },
      { price: "459", validity: "84 Days", desc: "Unlimited Calls + 6GB Data + 1000 SMS" },
      { price: "1799", validity: "365 Days", desc: "Unlimited Calls + 24GB Data + 3600 SMS" },
    ],
    "R-Offer": [
      { price: "149", validity: "20 Days", desc: "Special Offer: 1GB/Day + Unlimited Calls" },
      { price: "219", validity: "28 Days", desc: "Exclusive: 1.5GB/Day + Free Subscription" },
    ]
  };

  const currentPlans = plansData[activeTab] || [];

  const handlePlanClick = (plan) => {
    setAmount(plan.price);
    setSelectedPlanPrice(plan.price);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    if (tp.length !== 4) {
      showToast("Please enter a valid 4-digit TPin.", "error");
      return;
    }
    if (amount <= 0) {
      showToast("Please enter a valid amount.", "error");
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalRecharge = () => {
    showToast("Recharge request submitted successfully!", "success");
    setShowConfirm(false);
    // Reset form
    setMobileNumber('');
    setService('');
    setAmount('0');
    setTp('');
    setSelectedPlanPrice(null);
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          {toast.msg}
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Mobile Recharge</h1>
          <p className={styles.subtitle}>Quick and secure prepaid mobile recharge across all operators</p>
        </div>
        <ServiceQuickNav />
      </div>

      <div className={styles.mainLayout}>
        {/* Form Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <MdPayment /> Recharge Details
            </div>
          </div>
          
          <form className={styles.formSection} onSubmit={handleProceed}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Mobile Number</label>
              <div className={styles.inputWrapper}>
                <MdPhoneIphone className={styles.inputIcon} />
                <input 
                  type="text" 
                  className={styles.inputField} 
                  placeholder="Enter 10 digit number" 
                  value={mobileNumber}
                  maxLength={10}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Service Provider</label>
              <div className={styles.inputWrapper}>
                <BiNetworkChart className={styles.inputIcon} />
                <select 
                  className={`${styles.inputField} ${styles.selectField}`}
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                >
                  <option value="">{servicesLoading ? 'Loading services...' : 'Select Service'}</option>
                  {services && services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Operator</label>
              <div className={styles.inputWrapper}>
                <BiNetworkChart className={styles.inputIcon} />
                <select 
                  className={`${styles.inputField} ${styles.selectField}`}
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  required
                >
                  <option value="">Select Operator</option>
                  {operators.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Circle / State</label>
              <div className={styles.inputWrapper}>
                <MdLocationOn className={styles.inputIcon} />
                <select 
                  className={`${styles.inputField} ${styles.selectField}`}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.amountWrapper}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Amount ( ₹ )</label>
                <div className={styles.inputWrapper}>
                  <MdAccountBalanceWallet className={styles.inputIcon} />
                  <input 
                    type="number" 
                    className={styles.inputField} 
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedPlanPrice(null); // Reset selection if manually typing
                    }}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>TPin</label>
                <div className={styles.inputWrapper}>
                  <MdOutlineSecurity className={styles.inputIcon} />
                  <input 
                    type="password" 
                    className={`${styles.inputField} ${styles.tpInput}`}
                    placeholder="****" 
                    value={tp}
                    maxLength={4}
                    onChange={(e) => setTp(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button className={styles.linkBtn}>
                <MdFlashOn /> Latest Offers
              </button>
              <button className={styles.linkBtn}>
                <MdInfoOutline /> View History
              </button>
            </div>

            <button type="submit" className={styles.payBtn}>
              Proceed to Recharge
            </button>
          </form>
        </div>

        {/* Plans Section */}
        <div className={styles.planSection}>
          <div className={styles.planFilters}>
            {planTabs.map(tab => (
              <button 
                key={tab}
                className={`${styles.filterBtn} ${activeTab === tab ? styles.filterBtnActive : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedPlanPrice(null); // Reset selection when switching tabs
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.planGrid}>
            {currentPlans.map((plan, idx) => (
              <div 
                key={`${activeTab}-${idx}`} 
                className={`${styles.planCard} ${selectedPlanPrice === plan.price ? styles.planCardSelected : ''}`} 
                onClick={() => handlePlanClick(plan)}
              >
                <div className={styles.planPriceRow}>
                  <div className={styles.planPrice}>₹{plan.price}</div>
                  <div className={styles.planValidity}>{plan.validity}</div>
                </div>
                <p className={styles.planDesc}>{plan.desc}</p>
              </div>
            ))}
            {currentPlans.length === 0 && (
              <div className={styles.subtitle}>No plans available for this category.</div>
            )}
          </div>

          <div className={styles.disclaimerBox}>
            <MdInfoOutline className={styles.disclaimerIcon} />
            <div className={styles.disclaimerText}>
              <strong>Note:</strong> Plan details are indicative. Please verify with your operator before proceeding. Recharges once successful cannot be reversed.
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <MdCheckCircle className={styles.modalHeaderIcon} />
                Confirm Recharge
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setShowConfirm(false)}>
                <MdClose />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Mobile Number</span>
                <span className={styles.confirmValue}>+91 {mobileNumber}</span>
              </div>
              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Operator</span>
                <span className={styles.confirmValue}>{operator}</span>
              </div>
              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Circle / State</span>
                <span className={styles.confirmValue}>{state}</span>
              </div>
              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Recharge Amount</span>
                <span className={styles.confirmValueTotal}>₹{amount}</span>
              </div>
              
              <div className={styles.modalDisclaimer}>
                Please confirm the details above. Recharges cannot be cancelled once processed.
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleFinalRecharge}>
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileRecharge;
