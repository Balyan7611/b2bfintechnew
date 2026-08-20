import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiUserPlus, FiGlobe, FiRefreshCw
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaArrowRight, FaAddressCard
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const WalletPPIRegistration = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchData = async () => {
    // Wire up when API endpoint available
  };

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
            <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>Wallet PPI Registration</h2>
          <div style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667EEA', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiGlobe /> Onboarding Logs
          </div>
        </div>

                <div style={{ padding: '20px', background: '#FAFBFC' }}>
          <form onSubmit={(e) => { e.preventDefault(); setPageNumber(1); fetchData(); }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} value={toDate} onChange={(e) => setToDate(e.target.value)} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
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
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Anything</label>
                <div style={{ position: 'relative' }}>
                  <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input type="text" placeholder="Mobile, Merchant Code..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className={styles.inputControl} style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="submit" style={{ height: '38px', width: '120px', padding: '0 16px', whiteSpace: 'nowrap', boxSizing: 'border-box', flexShrink: 0, background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textTransform: 'uppercase', letterSpacing: '0.5px' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1.5px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(34, 197, 94, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.12)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)'; }}>
                   <FiSearch size={15} /> Search
                </button>
                <button
                  type="button"
                  title="Reset Filters"
                  onClick={() => {
                    setFromDate(today);
                    setToDate(today);
                    setSelectedMember('');
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

            <div className={styles.cardFullMobile}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="walletppiregistration_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search onboardings..." />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '2200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                <th>MEMBER NAME</th>
                <th>MEMBER ID</th>
                <th>MERCHANT CODE</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>EMAIL ADDRESS</th>
                <th>FULL ADDRESS</th>
                <th>PINCODE</th>
                <th>STATE</th>
                <th>PAN NUMBER</th>
                <th>FIRM NAME</th>
                <th>REGISTRATION DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="14" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0', position: 'relative' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                     <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                       <FiDatabase size={24} color="#94A3B8" />
                     </div>
                     <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No registration data found</span>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {(() => {
          const totalPages = Math.ceil(totalRecords / pageSize) || 1;
          const getPages = () => {
            const pages = [];
            const delta = 2;
            const left  = pageNumber - delta;
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
                    : <button
                        key={pg}
                        onClick={() => setPageNumber(pg)}
                        style={{
                          minWidth: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                          borderColor: pg === pageNumber ? '#1756AA' : '#e2e8f0',
                          background: pg === pageNumber ? '#1756AA' : '#fff',
                          color: pg === pageNumber ? '#fff' : '#475569',
                          fontWeight: pg === pageNumber ? 800 : 500,
                          fontSize: '0.82rem', cursor: 'pointer',
                        }}
                      >{pg}</button>
                )}
                <button className="global-page-btn" onClick={() => setPageNumber(p => Math.min(p + 1, totalPages))} disabled={pageNumber >= totalPages}><FiChevronRight /></button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default WalletPPIRegistration;
