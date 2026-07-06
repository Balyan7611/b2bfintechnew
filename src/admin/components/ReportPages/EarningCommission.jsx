import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiTrendingUp, FiDollarSign
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaArrowRight, FaHandHoldingUsd
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const EarningCommission = () => {
  const [memberList, setMemberList] = useState([]);
  const [serviceList, setServiceList] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.member.search('');
        setMemberList(res || []);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        if (res && Array.isArray(res.data)) setServiceList(res.data);
        else if (Array.isArray(res)) setServiceList(res);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className={styles.container}>
      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        {/* CARD TOP: TITLE */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>Earning Commission Downline</h2>
          <div style={{ background: 'rgba(56, 161, 105, 0.1)', color: '#38A169', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiTrendingUp /> Profit Tracking Active
          </div>
        </div>

        {/* CARD BOTTOM: FILTERS */}
        <div style={{ padding: '20px', background: '#FAFBFC' }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Select User</label>
                <select className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}>
                  <option value="">All Downline Members</option>
                  {memberList.map(m => (
                    <option key={m.memberId || m.id} value={m.memberId || m.id}>{m.name} ({m.mobile})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Service</label>
                <select className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}>
                  <option value="">All Services</option>
                  {serviceList.map(s => (
                    <option key={s.id || s.serviceId} value={s.id || s.serviceId}>{s.serviceName || s.name}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Anything</label>
                <div style={{ position: 'relative' }}>
                  <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input type="text" placeholder="User, Particular..." className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
                </div>
              </div>

              <div>
                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.2)'; }}>
                   <FiSearch /> Generate Report
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="earningcommission_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search commission logs..." />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                <th>MEMBER USERNAME</th>
                <th>TXN DATE & TIME</th>
                <th>PARTICULARS</th>
                <th>TRANS TYPE</th>
                <th>AMOUNT</th>
                <th>COMMISSION</th>
                <th>TDS</th>
                <th>GST</th>
                <th>NET COMM</th>
                <th>OPENING BAL</th>
                <th>CLOSING BAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="13" style={{ textAlign: 'center', padding: '20px 0', color: '#A0AEC0' }}>
                   
                     <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No commission records found</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>Showing 0 to 0 of 0 entries</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">1</button>
            <button className="global-page-btn" disabled><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningCommission;
