import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiUsers, FiDollarSign
} from 'react-icons/fi';
import {
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaArrowRight, FaUserFriends, FaWallet, FaPhoneAlt
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';

const AllMemberBalance = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');

  const [balanceData, setBalanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [search, setSearch] = useState('');

  // Table-level controls (Show entries / row search / pagination) — these
  // used to be dead UI: the "Show" dropdown had no onChange, the search box
  // had no value/onChange, and "Showing 0 to 0 of 0 entries" was a hardcoded
  // string that never reflected the real row count.
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');

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
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    setLoading(true);
    try {
                  const res = await API.userWalletBalance.getAll({
        pageNumber: 1,
        pageSize: 100,
        fromDate,
        toDate,
        memberId: selectedMember || search       });
      if (res && Array.isArray(res.data)) setBalanceData(res.data);
      else if (Array.isArray(res)) setBalanceData(res);
      else setBalanceData([]);
    } catch (err) {
      console.error("Error fetching balance data:", err);
      setBalanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBalanceData();
  };

  // The backend's GetUserWalletBalances endpoint doesn't reliably honor the
  // MemberID filter (it's been observed returning every member's row
  // regardless — see the "[wallet] no balance row for member X - server
  // returned N row(s)" warning in getForMember). So even though we send
  // memberId in the request above, we also enforce the filter client-side
  // here as a safety net — otherwise picking a member from the dropdown and
  // hitting Search silently does nothing.
  const enrichedRows = balanceData.map((row, i) => {
    const rMsrno = parseInt(row.msrno) || 0;
    const member = memberList.find(m => (parseInt(m.msrno) || 0) === rMsrno || (parseInt(m.id) || 0) === rMsrno) || {};
    return {
      ...row,
      _key: row.id || i,
      _msrno: rMsrno,
      _name: member.name || '',
      _mobile: member.mobile || '',
      _memberId: member.memberId || row.msrno,
    };
  });

  const selectedMemberNum = selectedMember ? parseInt(selectedMember) : null;
  const q = tableSearch.trim().toLowerCase();

  const filteredRows = enrichedRows.filter(row => {
    if (selectedMemberNum && row._msrno !== selectedMemberNum) return false;
    if (q && !(
      String(row._name).toLowerCase().includes(q) ||
      String(row._mobile).toLowerCase().includes(q) ||
      String(row._memberId).toLowerCase().includes(q) ||
      String(row._msrno).includes(q)
    )) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className={styles.container}>
            <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        overflow: 'visible'
      }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>All Member Balance</h2>
          <div style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaWallet /> Balance Tracker
          </div>
        </div>

                <div style={{ padding: '20px', background: '#FAFBFC' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none', color: '#334155' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Select Member</label>
                <SearchableSelect
                  name="memberId"
                  value={selectedMember}
                  onChange={(val) => { setSelectedMember(val); setCurrentPage(1); }}
                  options={[
                    { label: 'Select Member', value: '' },
                    ...(Array.isArray(memberList) ? memberList.map(m => ({
                      label: `${m.name || m.memberId} (${m.mobile})`,
                      value: m.id || m.memberId
                    })) : [])
                  ]}
                  placeholder="Select Member"
                  style={{ height: '42px', borderRadius: '10px' }}
                />
              </div>
              
              <div>
                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.2)'; }}>
                   <FiSearch /> Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

            <div className={styles.cardFullMobile}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select
              className={styles.selectEntries}
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons
            headers={['S.No', 'Name', 'Mobile', 'Member ID', 'Wallet Bal', 'AEPS Bal']}
            rows={filteredRows.map((row, i) => [i + 1, row._name || 'N/A', row._mobile || 'N/A', row._memberId, row.mainBalance, row.aepsBalance])}
            fileNamePrefix="allmemberbalance_report"
            sheetName="Report"
          />

          <div className="global-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search members..."
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          {/* Bigger, more spacious sizing than the shared table default —
              requested specifically for this page (bigger font + row padding). */}
          <table className={styles.table} style={{ minWidth: '1000px', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px', padding: '14px 10px', fontSize: '0.82rem' }}>S.NO</th>
                <th style={{ textAlign: 'left', padding: '14px 10px', fontSize: '0.82rem' }}>NAME</th>
                <th style={{ textAlign: 'left', padding: '14px 10px', fontSize: '0.82rem' }}>MEMBER ID</th>
                <th style={{ textAlign: 'left', padding: '14px 10px', fontSize: '0.82rem' }}>CONTACT NO.</th>
                <th style={{ textAlign: 'center', padding: '14px 10px', fontSize: '0.82rem' }}>WALLET BAL</th>
                <th style={{ textAlign: 'center', padding: '14px 10px', fontSize: '0.82rem' }}>AEPS BAL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <FiActivity size={24} color="#1756AA" className="spin-animation" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>Loading balances...</span>
                    </div>
                  </td>
                </tr>
              ) : pageRows.length > 0 ? (
                pageRows.map((row, i) => {
                  const displayName = row._name || `MSRNO: ${row._msrno}`;

                  return (
                    <tr key={row._key}>
                      <td style={{ padding: '14px 10px', fontSize: '0.9rem' }}>{startIndex + i + 1}</td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #1756AA 0%, #0D3B7A 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.8rem', fontWeight: 700
                          }}>
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>{displayName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                          background: '#EFF6FF', color: '#1756AA', fontWeight: 700,
                          fontSize: '0.8rem', letterSpacing: '0.3px'
                        }}>
                          {row._memberId || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                          <FaPhoneAlt style={{ fontSize: '0.72rem', color: '#94A3B8' }} />
                          {row._mobile || 'N/A'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669', padding: '14px 10px', fontSize: '0.95rem' }}>₹ {row.mainBalance}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#2563EB', padding: '14px 10px', fontSize: '0.95rem' }}>₹ {row.aepsBalance}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0', position: 'relative' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                         <FiDatabase size={24} color="#94A3B8" />
                       </div>
                       <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No member balance data found</span>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {filteredRows.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">{currentPage}</button>
            <button className="global-page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMemberBalance;
