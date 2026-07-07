import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiUsers
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaArrowRight, FaUserFriends
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';

const MoneyRemitterDetails = () => {
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Sanjay Kumar', memberId: 'B2B1001', firstName: 'Sanjay', lastName: 'Kumar', mobile: '9988776655', status: 'Active', limit: 25000, kycStatus: 'Verified', result: 'Success', regDate: '2023-10-15' },
    { id: 2, name: 'Vikash Singh', memberId: 'B2B1002', firstName: 'Vikash', lastName: 'Singh', mobile: '8877665544', status: 'Inactive', limit: 0, kycStatus: 'Pending', result: 'Pending', regDate: '2023-10-20' },
    { id: 3, name: 'Pooja Sharma', memberId: 'B2B1003', firstName: 'Pooja', lastName: 'Sharma', mobile: '7766554433', status: 'Active', limit: 25000, kycStatus: 'Verified', result: 'Success', regDate: '2023-10-22' }
  ]);
  const successCount = transactions.filter(t => (t.status || t.kycStatus || t.result)?.toLowerCase() === 'success' || (t.status || t.kycStatus || t.result)?.toLowerCase() === 'verified' || (t.status || t.kycStatus || t.result)?.toLowerCase() === 'active').length;
  const pendingCount = transactions.filter(t => (t.status || t.kycStatus || t.result)?.toLowerCase() === 'pending').length;
  const failedCount = transactions.filter(t => (t.status || t.kycStatus || t.result)?.toLowerCase() === 'failed' || (t.status || t.kycStatus || t.result)?.toLowerCase() === 'rejected').length;
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.member.search('');
        if (res && Array.isArray(res.data)) setMemberList(res.data);
        else if (Array.isArray(res)) setMemberList(res);
        else setMemberList([]);
      } catch (err) { console.error("Error fetching members:", err); }
    };
    fetchMembers();
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
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>Money Remitter Details</h2>
          <div style={{ background: 'rgba(74, 85, 104, 0.1)', color: '#4A5568', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiUsers /> Remitter Registry
          </div>
        </div>

        {/* CARD BOTTOM: FILTERS */}
        
      <style>{`
        @keyframes successGlow {
          0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
          100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
        }
        @keyframes pendingGlow {
          0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(243, 156, 18, 0); }
          100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
        }
        @keyframes failedGlow {
          0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
      `}</style>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div 
          style={{
            display: 'flex', alignItems: 'center', background: '#eafaf1', color: '#27AE60', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid #27AE60', gap: '8px', cursor: 'pointer', transition: 'all 0.25s', animation: 'successGlow 2s infinite'
          }}
        >
          <FiCheckCircle size={15} />
          <span>Success</span>
          <span style={{ background: '#27AE60', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{successCount}</span>
        </div>
        <div 
          style={{
            display: 'flex', alignItems: 'center', background: '#fef5e7', color: '#F39C12', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid #F39C12', gap: '8px', cursor: 'pointer', transition: 'all 0.25s', animation: 'pendingGlow 2s infinite'
          }}
        >
          <FiAlertCircle size={15} />
          <span>Pending</span>
          <span style={{ background: '#F39C12', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{pendingCount}</span>
        </div>
        <div 
          style={{
            display: 'flex', alignItems: 'center', background: '#fceaea', color: '#E74C3C', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid #E74C3C', gap: '8px', cursor: 'pointer', transition: 'all 0.25s', animation: 'failedGlow 2s infinite'
          }}
        >
          <FiXCircle size={15} />
          <span>Failed</span>
          <span style={{ background: '#E74C3C', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{failedCount}</span>
        </div>
      </div>
    
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
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Select Member</label>
                <select 
                  className={styles.inputControl} 
                  style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} 
                  onFocus={(e) => e.target.style.borderColor = '#1756AA'} 
                  onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">All Registered Members</option>
                  {Array.isArray(memberList) && memberList.map((m) => (
                    <option key={m.id || m.memberId} value={m.id || m.memberId}>
                      {m.name || m.memberId} ({m.mobile})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Anything</label>
                <div style={{ position: 'relative' }}>
                  <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input type="text" placeholder="Mobile, KYC, Name..." className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
                </div>
              </div>

              <div>
                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.2)'; }}>
                   <FiSearch /> Search Database
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

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="moneyremitterdetails_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search remitters..." />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                <th>MEMBER NAME</th>
                <th>MEMBER ID</th>
                <th>FIRST NAME</th>
                <th>LAST NAME</th>
                <th>MOBILE NUMBER</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th>TRANSFER LIMIT</th>
                <th style={{ textAlign: 'center' }}>KYC STATUS</th>
                <th>RESULT</th>
                <th>REGISTRATION DATE</th>
                <th style={{ width: '120px', textAlign: 'center' }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                         <FiDatabase size={24} color="#94A3B8" />
                       </div>
                       <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No remitter data found</span>
                     </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={t.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setActiveReceipt(t)}
                        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 78, 216, 0.15)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <FiInfo size={12} /> VIEW
                      </button>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.8rem' }}>{t.name}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t.memberId}</td>
                    <td style={{ fontSize: '0.8rem', color: '#334155' }}>{t.firstName}</td>
                    <td style={{ fontSize: '0.8rem', color: '#334155' }}>{t.lastName}</td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{t.mobile}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: t.status === 'Active' ? '#ECFDF5' : '#FEF2F2', color: t.status === 'Active' ? '#059669' : '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${t.status === 'Active' ? '#A7F3D0' : '#FECACA'}` }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#2563EB' }}>₹{t.limit.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        background: t.kycStatus === 'Verified' ? '#ECFDF5' : t.kycStatus === 'Pending' ? '#FFFBEB' : '#FEF2F2',
                        color: t.kycStatus === 'Verified' ? '#059669' : t.kycStatus === 'Pending' ? '#D97706' : '#DC2626',
                        border: `1px solid ${t.kycStatus === 'Verified' ? '#A7F3D0' : t.kycStatus === 'Pending' ? '#FDE68A' : '#FECACA'}`,
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 
                      }}>
                        {t.kycStatus}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{t.result}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{t.regDate}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        background: t.result === 'Success' ? '#ECFDF5' : t.result === 'Pending' ? '#FFFBEB' : '#FEF2F2',
                        color: t.result === 'Success' ? '#059669' : t.result === 'Pending' ? '#D97706' : '#DC2626',
                        border: `1px solid ${t.result === 'Success' ? '#A7F3D0' : t.result === 'Pending' ? '#FDE68A' : '#FECACA'}`,
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 
                      }}>
                        RECEIPT
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
      {activeReceipt && (
        <TransactionReceipt 
          data={{
            mode: 'REMITTER',
            amount: parseFloat(activeReceipt.amount || activeReceipt.txnAmount) || 0,
            charge: parseFloat(activeReceipt.surcharge || activeReceipt.charge) || 0,
            date: activeReceipt.createdDate ? new Date(activeReceipt.createdDate).toLocaleString('en-IN') : new Date().toLocaleString(),
            customerName: activeReceipt.customerName || activeReceipt.memberName || activeReceipt.firstName || 'N/A',
            customerMobile: activeReceipt.customerMobile || activeReceipt.mobile || activeReceipt.memberMobile || 'N/A',
            beneficiary: activeReceipt.beniName || activeReceipt.operatorName || activeReceipt.operator || 'N/A',
            bank: activeReceipt.bankName || 'N/A',
            accountNo: activeReceipt.accountNo || activeReceipt.number || 'N/A',
            total: parseFloat(activeReceipt.amount || activeReceipt.txnAmount) || 0,
            chunks: [{ txnId: activeReceipt.orderId || activeReceipt.refid || activeReceipt.txnId || 'N/A', amount: parseFloat(activeReceipt.amount || activeReceipt.txnAmount) || 0 }],
            status: activeReceipt.status || activeReceipt.kycStatus || activeReceipt.result || 'N/A',
            remark: activeReceipt.remark || 'N/A'
          }}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
export default MoneyRemitterDetails;