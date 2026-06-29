import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiUsers, FiDollarSign
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaArrowRight, FaUserFriends, FaWallet, FaUserAlt
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import Select from 'react-select';

const AllMemberBalance = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');

  const [balanceData, setBalanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

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
      // Assuming MemberID is mapped to search input or selectedMember based on backend expectation
      // We will send selectedMember as memberId, and search if any other text
      const res = await API.userWalletBalance.getAll({
        pageNumber: 1,
        pageSize: 100,
        fromDate,
        toDate,
        memberId: selectedMember || search // For now, passing whatever is selected
      });
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
    fetchBalanceData();
  };

  return (
    <div className={styles.container}>
      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        overflow: 'visible'
      }}>
        {/* CARD TOP: TITLE */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>All Member Balance</h2>
          <div style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaWallet /> Balance Tracker
          </div>
        </div>

        {/* CARD BOTTOM: FILTERS */}
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
                <Select 
                  options={Array.isArray(memberList) ? memberList.map(m => ({
                    value: m.id || m.memberId,
                    label: `${m.name || m.memberId} (${m.mobile})`
                  })) : []}
                  value={
                    selectedMember 
                      ? { 
                          value: selectedMember, 
                          label: (() => {
                            const m = memberList.find(x => (x.id || x.memberId) === selectedMember);
                            return m ? `${m.name || m.memberId} (${m.mobile})` : selectedMember;
                          })()
                        }
                      : null
                  }
                  onChange={(selectedOption) => setSelectedMember(selectedOption ? selectedOption.value : '')}
                  placeholder="Select Member"
                  isSearchable={true}
                  isClearable={true}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      height: '42px',
                      borderRadius: '10px',
                      borderColor: state.isFocused ? '#1756AA' : '#CBD5E1',
                      boxShadow: state.isFocused ? '0 0 0 1px #1756AA' : 'none',
                      '&:hover': {
                        borderColor: '#1756AA'
                      }
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: '#334155'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#1756AA' : state.isFocused ? '#F8FAFC' : 'transparent',
                      color: state.isSelected ? 'white' : '#334155',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    })
                  }}
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

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="allmemberbalance_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search members..." />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.NO</th>
                <th style={{ textAlign: 'left' }}>USER DETAILS</th>
                <th style={{ textAlign: 'center' }}>WALLET BAL</th>
                <th style={{ textAlign: 'center' }}>AEPS BAL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <FiActivity size={24} color="#1756AA" className="spin-animation" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>Loading balances...</span>
                    </div>
                  </td>
                </tr>
              ) : balanceData.length > 0 ? (
                balanceData.map((row, i) => {
                  const rMsrno = parseInt(row.msrno) || 0;
                  const member = memberList.find(m => (parseInt(m.msrno) || 0) === rMsrno || (parseInt(m.id) || 0) === rMsrno) || {};
                  
                  const userText = member.name ? `${member.name} (${member.memberId || row.msrno})` : `MSRNO: ${row.msrno}`;
                  const mobileText = member.mobile || 'N/A';

                  return (
                    <tr key={row.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.userName}><FaUserAlt style={{ fontSize: '0.75rem', color: '#1756AA' }} /> {userText}</span>
                          <span className={styles.userMobile}>{mobileText}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>₹ {row.mainBalance}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#2563EB' }}>₹ {row.aepsBalance}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0', position: 'relative' }}>
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

export default AllMemberBalance;
