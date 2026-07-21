import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiUsers, FiBarChart2
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaArrowRight, FaUserFriends
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import StatsGrid from '../../../shared/components/common/StatsGrid';

const MoneyRemitterDetails = () => {
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [showStats, setShowStats] = useState(false);

  // ─── Stats Computation ────────────────────────────────────
  const totalRemitters = transactions.length;
  const activeRemitters = transactions.filter(t => t.status?.toLowerCase() === 'active').length;
  const inactiveRemitters = transactions.filter(t => t.status?.toLowerCase() === 'inactive').length;
  const verifiedKYC = transactions.filter(t => t.kycStatus?.toLowerCase() === 'verified').length;
  const pendingKYC = transactions.filter(t => t.kycStatus?.toLowerCase() === 'pending').length;
  const successResult = transactions.filter(t => t.result?.toLowerCase() === 'success').length;
  const pendingResult = transactions.filter(t => t.result?.toLowerCase() === 'pending').length;
  const failedResult = transactions.filter(t => t.result?.toLowerCase() === 'failed').length;
  const totalLimit = transactions.reduce((acc, t) => acc + (parseFloat(t.limit) || 0), 0);
  const avgLimit = totalRemitters > 0 ? totalLimit / totalRemitters : 0;
  const activeLimit = transactions
    .filter(t => t.status?.toLowerCase() === 'active')
    .reduce((acc, t) => acc + (parseFloat(t.limit) || 0), 0);
  const verifiedLimit = transactions
    .filter(t => t.kycStatus?.toLowerCase() === 'verified')
    .reduce((acc, t) => acc + (parseFloat(t.limit) || 0), 0);
  const successRate = totalRemitters > 0 ? (successResult / totalRemitters) * 100 : 0;

  const stats = {
    totalTxns: totalRemitters,
    totalAmount: totalLimit,          // using total limit as a proxy for amount
    successTxns: successResult,
    failedTxns: failedResult,
    pendingTxns: pendingResult,
    totalCommission: activeLimit,     // placeholder – no commission data
    uplineCommission: activeLimit * 0.6,
    adminCommission: activeLimit * 0.4,
    totalTds: 0,                      // no TDS data
    adminProfit: activeLimit * 0.15,
    tdsPayable: 0,
    netPayable: totalLimit - activeLimit * 0.4,
    // Additional custom metrics can be added here
  };

  // ─── API Calls ────────────────────────────────────────────
  const fetchRemitters = async () => {
    setLoading(true);
    try {
      // Replace with actual API endpoint for money remitter details
      // For now, we'll simulate with a delayed mock response
      // const res = await API.moneyRemitter.getAll({ pageNumber, pageSize, fromDate, toDate, memberId: selectedMember, status: selectedStatus, search: searchKeyword });
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockData = [
        { id: 1, name: 'Sanjay Kumar', memberId: 'B2B1001', firstName: 'Sanjay', lastName: 'Kumar', mobile: '9988776655', status: 'Active', limit: 25000, kycStatus: 'Verified', result: 'Success', regDate: '2023-10-15' },
        { id: 2, name: 'Vikash Singh', memberId: 'B2B1002', firstName: 'Vikash', lastName: 'Singh', mobile: '8877665544', status: 'Inactive', limit: 0, kycStatus: 'Pending', result: 'Pending', regDate: '2023-10-20' },
        { id: 3, name: 'Pooja Sharma', memberId: 'B2B1003', firstName: 'Pooja', lastName: 'Sharma', mobile: '7766554433', status: 'Active', limit: 25000, kycStatus: 'Verified', result: 'Success', regDate: '2023-10-22' },
        { id: 4, name: 'Rohit Mehta', memberId: 'B2B1004', firstName: 'Rohit', lastName: 'Mehta', mobile: '6655443322', status: 'Active', limit: 30000, kycStatus: 'Verified', result: 'Success', regDate: '2023-11-01' },
        { id: 5, name: 'Anjali Gupta', memberId: 'B2B1005', firstName: 'Anjali', lastName: 'Gupta', mobile: '5544332211', status: 'Inactive', limit: 0, kycStatus: 'Pending', result: 'Failed', regDate: '2023-11-05' },
        { id: 6, name: 'Rajesh Kumar', memberId: 'B2B1006', firstName: 'Rajesh', lastName: 'Kumar', mobile: '4433221100', status: 'Active', limit: 20000, kycStatus: 'Verified', result: 'Success', regDate: '2023-11-10' },
        { id: 7, name: 'Sunita Devi', memberId: 'B2B1007', firstName: 'Sunita', lastName: 'Devi', mobile: '3322110099', status: 'Active', limit: 15000, kycStatus: 'Pending', result: 'Pending', regDate: '2023-11-15' },
      ];
      setTransactions(mockData);
      setTotalRecords(mockData.length);
    } catch (err) {
      console.error("Failed to fetch remitter details:", err);
      setTransactions([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemitters();
  }, [pageNumber, pageSize, selectedStatus, selectedMember]);

  // ─── Member List for dropdown ─────────────────────────────
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(1);
    fetchRemitters();
  };

  // ─── Render ──────────────────────────────────────────────
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
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>Money Remitter Details</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(74, 85, 104, 0.1)', color: '#4A5568', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* <FiUsers /> Remitter Registry */}
            </div>
            <button 
              type="button" 
              onClick={() => setShowStats(!showStats)}
              style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                height: '38px',
                padding: '0 20px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <FiBarChart2 size={16} />
              {showStats ? 'Hide Stats' : 'View Stats'}
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', background: '#FAFBFC' }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Select Member</label>
                <select 
                  className={styles.inputControl} 
                  style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }}
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
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Status</label>
                <select 
                  className={styles.inputControl} 
                  style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Anything</label>
                <div style={{ position: 'relative' }}>
                  <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input type="text" placeholder="Mobile, KYC, Name..." className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                </div>
              </div>

              <div>
                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}>
                   <FiSearch /> Search Database
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── STATS CARDS GRID ── */}
      <StatsGrid stats={stats} showStats={showStats} />

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="moneyremitterdetails_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Filter results..." />
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
              {loading ? (
                <tr><td colSpan="13" style={{ padding: '40px 0', textAlign: 'center', color: '#1756AA' }}>Loading remitter data...</td></tr>
              ) : transactions.length === 0 ? (
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
                    <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{((pageNumber - 1) * pageSize) + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setActiveReceipt(t)}
                        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
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
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {transactions.length > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0} to {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords} entries
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">{pageNumber}</button>
            <button className="global-page-btn" onClick={() => setPageNumber(p => p + 1)} disabled={pageNumber * pageSize >= totalRecords}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {activeReceipt && (
        <TransactionReceipt 
          data={{
            mode: 'REMITTER',
            amount: parseFloat(activeReceipt.limit || 0),
            charge: 0,
            date: activeReceipt.regDate ? new Date(activeReceipt.regDate).toLocaleString('en-IN') : new Date().toLocaleString(),
            customerName: activeReceipt.name || activeReceipt.firstName || 'N/A',
            customerMobile: activeReceipt.mobile || 'N/A',
            beneficiary: 'N/A',
            bank: 'N/A',
            accountNo: activeReceipt.memberId || 'N/A',
            total: parseFloat(activeReceipt.limit || 0),
            chunks: [{ txnId: activeReceipt.memberId || 'N/A', amount: parseFloat(activeReceipt.limit || 0) }],
            status: activeReceipt.status || activeReceipt.kycStatus || activeReceipt.result || 'N/A',
            remark: 'N/A'
          }}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};

export default MoneyRemitterDetails;