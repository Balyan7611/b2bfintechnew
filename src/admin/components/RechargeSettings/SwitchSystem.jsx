import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiActivity, FiFilter, FiX, FiCheck, FiChevronLeft, FiChevronRight, FiDatabase, FiRefreshCw, FiPlus, FiCpu, FiTrendingUp, FiTrash2, FiRepeat, FiSettings
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const SwitchSystem = () => {
  const dispatch = useDispatch();
  const { switchRules = [] } = useSelector(state => state.recharge);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const servicesList = [
    { id: 'recharge', name: 'Recharge' },
    { id: 'mobile_postpaid', name: 'MOBILE POSTPAID' },
    { id: 'dth', name: 'DTH' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'water', name: 'Water' },
    { id: 'gas', name: 'GAS' },
    { id: 'lpg_gas', name: 'LPG Gas' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'internet', name: 'Internet' },
    { id: 'landline_postpaid', name: 'Landline Postpaid' },
    { id: 'emi', name: 'EMI' },
    { id: 'fastag', name: 'FasTag' },
    { id: 'education', name: 'Education' },
    { id: 'cable_tv', name: 'Cable Tv' },
    { id: 'municipal_tax', name: 'Municipal Tax' },
    { id: 'aeps', name: 'AEPS' },
    { id: 'aadhar_pay', name: 'Aadhar Pay' },
    { id: 'payment_gateway', name: 'Payment Gateway' },
    { id: 'scan_pay', name: 'Scan & Pay' },
    { id: 'nsdl_pan', name: 'NSDL PAN' },
    { id: 'matm', name: 'mATM' },
    { id: 'settlement', name: 'Settlement' },
    { id: 'fund_transfer', name: 'Fund Transfer' },
    { id: 'my_services', name: 'My Services' },
    { id: 'matm_onboard', name: 'MATM OnBoard' },
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'money_transfer', name: 'Money Transfer' },
    { id: 'broadband', name: 'Broadband' },
    { id: 'datacard', name: 'DataCard' },
    { id: 'broadband_alt', name: 'BroadBand' },
    { id: 'digital_voucher', name: 'Digital Voucher' },
    { id: 'prepaid_datacard', name: 'Prepaid DataCard' },
    { id: 'metro', name: 'Metro' },
    { id: 'prebooking', name: 'Prebooking' },
    { id: 'wifi', name: 'WiFi' },
    { id: 'e_challan', name: 'E-Challan' },
    { id: 'broadband_postpaid', name: 'Broadband Postpaid' },
    { id: 'pay_credit_card_bills', name: 'Pay Credit Card Bills' },
    { id: 'account_verification', name: 'Account Verification' },
    { id: 'dmt_ppi', name: 'DMT PPI' },
    { id: 'account_opening', name: 'Account Opening' },
    { id: 'loan', name: 'Loan' },
    { id: 'mobile_prepaid', name: 'Mobile Prepaid' },
    { id: 'donation', name: 'Donation' },
    { id: 'health_insurance', name: 'Health Insurance' },
    { id: 'housing_society', name: 'Housing Society' },
    { id: 'life_insurance', name: 'Life Insurance' },
    { id: 'loan_repay', name: 'Loan Repay' },
    { id: 'muncipal_service', name: 'Muncipal Service' },
    { id: 'recurring_deposit', name: 'Recurring Deposit' },
    { id: 'clubs_association', name: 'Clubs Association' },
    { id: 'rental', name: 'Rental' },
    { id: 'subscription', name: 'Subscription' },
    { id: 'npmc', name: 'NPMC' },
    { id: 'nps', name: 'NPS' },
    { id: 'prepaid_meter', name: 'Prepaid Meter' },
    { id: 'neeraj_bar', name: 'Neeraj Bar' }
  ];

  const operatorsData = {
    recharge: ['Airtel', 'Jio', 'Vi', 'BSNL'],
    mobile_prepaid: ['Airtel', 'Jio', 'Vi', 'BSNL'],
    mobile_postpaid: ['Airtel Postpaid', 'Jio Postpaid', 'Vi Postpaid', 'BSNL Postpaid'],
    dth: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'Videocon D2H', 'Sun Direct'],
    datacard: ['JioFi', 'Airtel Data Card', 'Vi Dongle'],
    postpaid: ['Airtel Postpaid', 'Jio Postpaid', 'Vi Postpaid', 'BSNL Postpaid'],
    electricity: ['Tata Power', 'Adani Electricity', 'BSES Rajdhani', 'UPPCL', 'BESCOM', 'MSEDCL'],
    broadband: ['Airtel Xstream', 'JioFiber', 'Excitel', 'Hathway', 'BSNL Fiber'],
    water: ['Delhi Jal Board', 'BMC Water', 'BWSSB', 'HMWS&SB'],
    gas: ['Indraprastha Gas', 'Mahanagar Gas', 'Gujarat Gas', 'Adani Gas'],
    aeps: ['Cash Withdrawal', 'Balance Inquiry', 'Mini Statement'],
    money_transfer: ['DMT Transfer 1', 'DMT Transfer 2']
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>Switch System</h3>
        </div>

        {/* ── NEW INLINE ADD FORM ── */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F1F5F9', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'flex-end' }}>
            {/* Switch Type */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Switch Type</label>
              <select className={styles.inputControl} style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', color: '#1E293B', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}>
                <option value="">Select Switch Type</option>
                <option value="user">User Switch</option>
                <option value="operator">Operator Switch</option>
                <option value="amount">Amount Switch</option>
                <option value="package">Package Switch</option>
              </select>
            </div>
            {/* Service */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Service</label>
              <select className={styles.inputControl} style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', color: '#1E293B', fontSize: '0.85rem', outline: 'none' }} value={selectedService} onChange={(e) => setSelectedService(e.target.value)} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}>
                <option value="">Select Service</option>
                {servicesList.map(srv => <option key={srv.id} value={srv.id}>{srv.name}</option>)}
              </select>
            </div>
            {/* Operator */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Operator</label>
              <select className={styles.inputControl} style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', color: '#1E293B', fontSize: '0.85rem', outline: 'none' }} disabled={!selectedService} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}>
                <option value="">{selectedService ? 'Select Operator' : 'Select All'}</option>
                {selectedService && operatorsData[selectedService] && operatorsData[selectedService].map(op => (
                  <option key={op} value={op.toLowerCase()}>{op}</option>
                ))}
              </select>
            </div>
            {/* Api List */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Api List</label>
              <select className={styles.inputControl} style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', color: '#1E293B', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}>
                <option value="">Select Api</option>
                <option value="soni">SoniTechno</option>
                <option value="paytm">Paytm</option>
              </select>
            </div>

            {/* Slab */}
            <div className={styles.formGroup} style={{ margin: 0, gridColumn: 'span 3', marginTop: '12px' }}>
              <label className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Slab</label>
              <input type="text" className={styles.inputControl} placeholder="Enter slab details..." style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', width: '100%', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
            </div>

            {/* Save Button */}
            <div className={styles.formGroup} style={{ margin: 0, gridColumn: 'span 1', marginTop: '12px' }}>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                  height: '42px', 
                  background: isSaving ? '#9CA3AF' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
                  color: '#fff', border: 'none', borderRadius: '10px', width: '100%',
                  fontWeight: 700, fontSize: '0.85rem', cursor: isSaving ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.2s', boxShadow: isSaving ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.15)', whiteSpace: 'nowrap',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }} 
                onMouseOver={(e) => { if(!isSaving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(34, 197, 94, 0.25)'; } }} 
                onMouseOut={(e) => { if(!isSaving) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15)'; } }}
              >
                {isSaving ? <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Note */}
            <div style={{ gridColumn: 'span 4', marginTop: '4px' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                <strong>Note:</strong> if you want fix amount then use "," and for range use "-" like (eg. 10, 20, 50-200, 300-500)
              </p>
            </div>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table"><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search switch rules..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper} style={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', overflowY: 'hidden', minHeight: 'auto' }}>
          <table className={styles.table} style={{ minWidth: '900px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '180px' }}>Details</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Switch Type</th>
                <th style={{ width: '150px', textAlign: 'center' }}>API LIST</th>
                <th style={{ width: '150px', textAlign: 'center' }}>ADDDATE</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {switchRules.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px 0', color: '#A0AEC0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0D1B3E', display: 'block', marginBottom: '4px' }}>No Switch Rules found</span>
                        <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>Create a new switch rule to see it here</p>
                      </div></td>
                </tr>
              ) : (
                switchRules.map((rule, idx) => (
                  <tr key={idx} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', background: 'rgba(23, 86, 170, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                             <FiSettings />
                          </div>
                          <span style={{ color: '#1756AA', fontWeight: 800 }}>{rule.name}</span></div></td>
                    <td style={{ textAlign: 'center' }}>
                       <span style={{ background: '#F1F5F9', color: '#4E6080', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                         {rule.type}
                       </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <span style={{ color: '#27AE60', fontWeight: 800 }}>{rule.target}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>{rule.createdAt}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className={styles.editBtn} style={{ background: 'transparent', border: 'none', color: '#1756AA', fontSize: '1.1rem', padding: 0 }} title="Edit Rule"><FiActivity /></button>
                        <button className={styles.deleteBtn} style={{ background: 'transparent', border: 'none', color: '#E53E3E', fontSize: '1.1rem', padding: 0 }} title="Delete Rule"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {switchRules.length > 0 ? 1 : 0} to {switchRules.length} of {switchRules.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SwitchSystem;
