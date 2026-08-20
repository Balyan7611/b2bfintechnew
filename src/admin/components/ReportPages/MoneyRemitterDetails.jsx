import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiUsers, FiBarChart2, FiRefreshCw
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

    const [selectedMember, setSelectedMember] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [showStats, setShowStats] = useState(false);

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
    totalAmount: totalLimit,              successTxns: successResult,
    failedTxns: failedResult,
    pendingTxns: pendingResult,
    totalCommission: activeLimit,         uplineCommission: activeLimit * 0.6,
    adminCommission: activeLimit * 0.4,
    totalTds: 0,                          adminProfit: activeLimit * 0.15,
    tdsPayable: 0,
    netPayable: totalLimit - activeLimit * 0.4,
      };

    const fetchRemitters = async () => {
    setLoading(true);
    try {
      const res = await API.member.getAll({
        pageNumber,
        pageSize,
        search: searchKeyword || '',
        isActive: selectedStatus === 'Active' ? true : selectedStatus === 'Inactive' ? false : null,
        fromDate,
        toDate,
      });

      let items = [];
      let total = 0;

      if (res && res.data) {
        const d = res.data;
        items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
        total = d.totalItems ?? d.totalCount ?? items.length;
      } else if (Array.isArray(res)) {
        items = res;
        total = res.length;
      }

      // Filter by selectedMember if set
      if (selectedMember) {
        items = items.filter(m => String(m.id || m.memberId) === String(selectedMember));
      }

      const mapped = items.map((m, i) => {
        const fullName = m.name || m.fullName || m.memberName || m.ownerName || m.firmName || '';
        const parts = fullName.trim().split(' ');
        const firstName = m.firstName || parts[0] || '-';
        const lastName = m.lastName || parts.slice(1).join(' ') || '-';
        const isActive = m.isActive === true || m.isActive === 1 || String(m.isActive).toLowerCase() === 'true';
        const kycApproved = m.isKycApproved === true || m.isKycApproved === 1 || String(m.isKycApproved).toLowerCase() === 'true';
        return {
          id: m.id || m.msrno || i + 1,
          name: fullName || '-',
          memberId: m.memberID || m.memberid || m.loginID || m.loginId || m.username || String(m.id || ''),
          firstName,
          lastName,
          mobile: m.mobile || m.mobileNo || m.phone || '-',
          status: isActive ? 'Active' : 'Inactive',
          limit: m.transferLimit || m.limit || 0,
          kycStatus: kycApproved ? 'Verified' : 'Pending',
          result: kycApproved ? 'Success' : 'Pending',
          regDate: (m.createdDate || m.registrationDate || m.addDate || '').slice(0, 10) || '-',
        };
      });

      setTransactions(mapped);
      setTotalRecords(total);
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

    return (
    <div className={styles.container}>
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
                <SearchableSelect
                  options={[
                    { value: '', label: 'All Registered Members' },
                    ...(Array.isArray(memberList) ? memberList : []).map((m) => ({
                      value: m.id || m.memberId,
                      label: `${m.name || m.memberId} (${m.mobile})`
                    }))
                  ]}
                  value={selectedMember}
                  onChange={val => setSelectedMember(val || '')}
                  placeholder="All Registered Members"
                  style={{ height: '42px', borderRadius: '10px' }}
                />
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button type="submit" style={{ height: '38px', width: '120px', padding: '0 16px', whiteSpace: 'nowrap', boxSizing: 'border-box', flexShrink: 0, background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                 <FiSearch size={15} /> Search
              </button>
              <button
                type="button"
                title="Reset Filters"
                onClick={() => {
                  setFromDate(today);
                  setToDate(today);
                  setSelectedMember('');
                  setSelectedStatus('');
                  setSearchKeyword('');
                  setPageNumber(1);
                }}
                style={{ height: '38px', width: '120px', boxSizing: 'border-box', flexShrink: 0, padding: '0 16px', background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontWeight: 700, fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.color = '#1756AA'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569'; }}
              >
                <FiRefreshCw size={14} /> Reset
              </button>
            </div>
          </form>
        </div>
      </div>

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
                  <tr key={t.id} className={styles.hoverRow} style={(() => {
                      const s = (t.status || '').toLowerCase();
                      if (s === 'active') return { background: '#F0FDF4' };
                      return { background: '#FFF5F5' };
                    })()}>
                    <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem' }}>{((pageNumber - 1) * pageSize) + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setActiveReceipt({ ...t, _type: 'dmt' })}
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

        {(() => {
          const totalPages = Math.ceil(totalRecords / pageSize) || 1;
          const getPages = () => {
            const pages = [];
            const delta = 2;
            const left = pageNumber - delta;
            const right = pageNumber + delta;
            let prev = null;
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                if (prev !== null && i - prev > 1) pages.push('...');
                pages.push(i);
                prev = i;
              }
            }
            return pages;
          };
          return (
            <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.82rem', color: '#718096', fontWeight: 600 }}>
                Showing {transactions.length > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0}–{Math.min(pageNumber * pageSize, totalRecords)} of <strong>{totalRecords}</strong> records &nbsp;|&nbsp; Page {pageNumber} of {totalPages}
              </div>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="global-page-btn" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber === 1}><FiChevronLeft /></button>
                {getPages().map((pg, i) =>
                  pg === '...'
                    ? <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '36px' }}>…</span>
                    : <button key={pg} onClick={() => setPageNumber(pg)} style={{ minWidth: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: pg === pageNumber ? '#1756AA' : '#e2e8f0', background: pg === pageNumber ? '#1756AA' : '#fff', color: pg === pageNumber ? '#fff' : '#475569', fontWeight: pg === pageNumber ? 800 : 500, fontSize: '0.82rem', cursor: 'pointer' }}>{pg}</button>
                )}
                <button className="global-page-btn" onClick={() => setPageNumber(p => Math.min(p + 1, totalPages))} disabled={pageNumber >= totalPages}><FiChevronRight /></button>
              </div>
            </div>
          );
        })()}
      </div>

      {activeReceipt && (
        <TransactionReceipt 
          data={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};

export default MoneyRemitterDetails;
