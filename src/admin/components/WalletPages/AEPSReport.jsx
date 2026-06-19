import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiCalendar, FiUser, FiFilter, FiActivity, FiDatabase, FiChevronLeft, FiChevronRight, FiSliders } from 'react-icons/fi';
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

const AEPSReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    memberId: '',
    service: '',
    mode: ''
  });
  const sampleData = [];
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({ fromDate: '', toDate: '', memberId: '', service: '', mode: '' });
  };

  const hasFilters = Object.values(filters).some(val => val !== '');

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className={styles.container} style={{ padding: '15px', maxWidth: '100%' }}>
      {/* ── INLINE FILTER CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, padding: '15px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSliders /> Search Filters
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiCalendar /> From Date</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>
            
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiCalendar /> To Date</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiUser /> Member ID</label>
              <select name="memberId" value={filters.memberId} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">Select Member</option>
                <option value="M001">M001 (Ram Prasad)</option>
                <option value="M002">M002 (Shyam Kumar)</option>
                <option value="M003">M003 (Amit Singh)</option>
                <option value="M004">M004 (Ravi Sharma)</option>
                <option value="M005">M005 (Priya Gupta)</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiDatabase /> Select Service</label>
              <select name="service" value={filters.service} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">All Services</option>
                {servicesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem', marginBottom: '4px' }}><FiActivity /> Select Mode</label>
              <select name="mode" value={filters.mode} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}>
                <option value="">All Modes</option>
                <option value="dr">Dr (Debit)</option>
                <option value="cr">Cr (Credit)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isLoading} style={{ 
                height: '36px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', flex: 1,
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {isLoading ? <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <><FiSearch /> Search</>}
              </button>
              
              {hasFilters && (
                <button type="button" onClick={handleClear} style={{ 
                  height: '36px', background: '#F1F5F9', flex: 1,
                  color: '#4E6080', border: '1px solid #E2E8F0', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                  Clear
                </button>
              )}
            </div>
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

          <div className="global-search-box" style={{ maxWidth: '250px', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0 10px', height: '32px' }}>
            <FiSearch style={{ color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', paddingLeft: '8px' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1600px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '40px', padding: '10px 15px', fontSize: '0.75rem' }}>SL</th>
                <th style={{ width: '200px', padding: '10px 15px', fontSize: '0.75rem' }}>MEMBER DETAILS</th>
                <th style={{ textAlign: 'center', width: '130px', padding: '10px 15px', fontSize: '0.75rem' }}>OPENING AMOUNT</th>
                <th style={{ textAlign: 'center', width: '110px', padding: '10px 15px', fontSize: '0.75rem' }}>AMOUNT</th>
                <th style={{ textAlign: 'center', width: '90px', padding: '10px 15px', fontSize: '0.75rem' }}>FACTOR</th>
                <th style={{ textAlign: 'center', width: '100px', padding: '10px 15px', fontSize: '0.75rem' }}>SURCHARGE</th>
                <th style={{ textAlign: 'center', width: '80px', padding: '10px 15px', fontSize: '0.75rem' }}>GST</th>
                <th style={{ textAlign: 'center', width: '80px', padding: '10px 15px', fontSize: '0.75rem' }}>TDS</th>
                <th style={{ textAlign: 'center', width: '120px', padding: '10px 15px', fontSize: '0.75rem' }}>COMMISSION</th>
                <th style={{ textAlign: 'center', width: '140px', padding: '10px 15px', fontSize: '0.75rem' }}>CLOSING BALANCE</th>
                <th style={{ padding: '10px 15px', fontSize: '0.75rem' }}>NARRATION</th>
                <th style={{ textAlign: 'right', width: '130px', padding: '10px 15px', fontSize: '0.75rem' }}>TRANSFERDATE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12" style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading report data...</span></div></td>
                </tr>
              ) : sampleData.length === 0 ? (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan="12" style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available. Apply filters to view records.</span>
                    </td>
                  </tr>
                  <tr style={{ height: '40px' }}><td colSpan="12" style={{ border: 'none' }}></td></tr>
                </>
              ) : (
                sampleData.map((item, index) => (
                  <tr key={index} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#1756AA', fontSize: '0.85rem', fontWeight: 800 }}>{item.member || 'N/A'}</span></div></td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.opening || '0.00'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, color: item.amount > 0 ? '#27AE60' : '#E53E3E' }}>
                        {item.amount > 0 ? '+' : ''}{item.amount || '0.00'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.factor || 'Cr'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.surcharge || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.gst || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#4E6080' }}>{item.tds || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#1756AA' }}>{item.commission || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E' }}>{item.closing || '0.00'}</td>
                    <td>
                      <div style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.75rem', color: '#4E6080', lineHeight: '1.4' }}>
                        {item.narration || 'N/A'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#718096', fontSize: '0.75rem' }}>{item.date || 'N/A'}</td>
                  </tr>
                ))
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

export default AEPSReport;
