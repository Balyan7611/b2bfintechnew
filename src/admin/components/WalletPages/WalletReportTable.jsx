import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiCalendar, FiUser, FiFilter, FiActivity, FiDatabase, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint } from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

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

const AEPSWalletReport = () => {
  const columns = [
    'S.No', 'TransID', 'Parent', 'User', 'Number', 'Operator', 'Bene Account', 
    'Amount', 'Cost', 'Comm/Charge', 'Operator ID', 'API Ref', 'Remaining Bal', 'Status'
  ];

  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className={styles.container} style={{ padding: '15px', maxWidth: '100%' }}>
      {/* ── INLINE FILTER CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, padding: '15px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 800, color: '#0D1B3E', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter /> Wallet Filters
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiCalendar /> From Date</label>
              <input type="date" className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>
            
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiCalendar /> To Date</label>
              <input type="date" className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiUser /> Member ID</label>
              <input type="text" placeholder="Enter Member ID" className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiActivity /> Select Mode</label>
              <select className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">All Modes</option>
                <option value="dr">Dr (Debit)</option>
                <option value="cr">Cr (Credit)</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiDatabase /> Select Service</label>
              <select className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">All Services</option>
                {servicesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button type="submit" disabled={isLoading} style={{ 
              height: '36px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', 
              color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {isLoading ? <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <><FiSearch /> Search</>}
            </button>
          </div>
        </form>
      </div>

      {/* ── REPORT TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <div className="global-table-toolbar" style={{ padding: '12px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '6px', border: '1px solid #E2E8F0', height: '30px', padding: '0 8px' }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" style={{ width: '32px', height: '32px' }} title="Copy Table"><FaCopy size={12} /></button>
            <button className="global-export-btn btn-excel" style={{ width: '32px', height: '32px' }} title="Download Excel"><FaFileExcel size={12} /></button>
            <button className="global-export-btn btn-pdf" style={{ width: '32px', height: '32px' }} title="Download PDF"><FaFilePdf size={12} /></button>
            <button className="global-export-btn btn-csv" style={{ width: '32px', height: '32px' }} title="Download CSV"><FaFileCsv size={12} /></button>
            <button className="global-export-btn btn-print" style={{ width: '32px', height: '32px' }} title="Print Table"><FaPrint size={12} /></button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1500px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                {columns.map((col, idx) => (
                  <th key={idx} style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '0.8rem' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading report data...</span></div></td>
                </tr>
              ) : (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan={columns.length} style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available. Apply filters to view records.</span>
                    </td>
                  </tr>
                  <tr style={{ height: '40px' }}><td colSpan={columns.length} style={{ border: 'none' }}></td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Showing 0 to 0 of 0 records</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronLeft size={14} /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#1756AA', color: 'white', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AEPSWalletReport;
