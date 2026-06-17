import React, { useState, useEffect } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaShieldAlt, FaSearch, FaChevronLeft, FaChevronRight,
  FaCopy, FaFileExcel, FaFileCsv, FaFilePdf, FaPrint
} from 'react-icons/fa';
import { updateSecurityToggle } from '../../../store/slices/memberSlice';
import styles from './MemberPages.module.css';

const MemberSecurity = () => {
  const dispatch = useDispatch();
  const { securityState } = useSelector((s) => s.member);
  const { globalToggles, memberList } = securityState;
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sample data integration if memberList is empty (for demo/UI check)
  const displayList = memberList && memberList.length > 0 ? memberList : [
    { id: '1', name: 'Pay99RT4190', memberId: '', twoWay: true, otp: true, tpin: false },
    { id: '2', name: 'Pay99RT4193', memberId: '', twoWay: true, otp: true, tpin: false },
    { id: '3', name: 'Pay99RT4200', memberId: '', twoWay: true, otp: false, tpin: false },
    { id: '4', name: 'Pay99RT4254', memberId: '', twoWay: true, otp: false, tpin: false },
    { id: '5', name: 'Pay99RT4521', memberId: '', twoWay: true, otp: false, tpin: false },
    { id: '6', name: 'Aabid Hussain', memberId: 'Pay99RT4412', twoWay: true, otp: false, tpin: false },
    { id: '7', name: 'Aakash', memberId: 'Pay99RT4477', twoWay: true, otp: false, tpin: false },
    { id: '8', name: 'Aakash Gautam', memberId: 'Pay99RT4489', twoWay: true, otp: false, tpin: false },
    { id: '9', name: 'Aakash Tyagi', memberId: 'Pay99RT4547', twoWay: true, otp: false, tpin: false },
    { id: '10', name: 'Askib', memberId: 'Pay99RT4528', twoWay: true, otp: false, tpin: false },
  ];

  const handleToggle = (id, field) => {
    dispatch(updateSecurityToggle({ id, field }));
  };

  const filteredMembers = displayList.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const GlobalToggleCard = ({ label, field, active, disabled }) => (
    <div className={styles.premiumToggleCard} style={disabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}>
      <span className={styles.premiumToggleLabel}>{label}</span>
      <label className={`${styles.switch} ${styles.switchSmall}`}>
        <input 
          type="checkbox" 
          checked={active} 
          disabled={disabled}
          onChange={() => handleToggle('global', field)} 
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.25rem' }}>Login Security</h2>
            <p className={styles.directorySubtitle}>Manage member authentication security</p>
          </div>
          <div className={styles.headerRight} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <GlobalToggleCard label="Two Way Auth" field="twoWay" active={globalToggles.twoWay} />
            <GlobalToggleCard label="OTP Login" field="otp" active={globalToggles.otp} disabled={!globalToggles.twoWay} />
            <GlobalToggleCard label="TPIN Login" field="tpin" active={globalToggles.tpin} disabled={!globalToggles.twoWay} />
          </div>
        </div>
        
        {/* ── EXPORT & SEARCH CONTROLS ── */}
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="membersecurity_report" sheetName="Report" />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px' }}>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableContainer}>
          <table className={styles.tableFull} style={{ minWidth: '800px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ width: '25%' }}>MEMBER NAME</th>
                <th style={{ width: '15%' }}>MEMBER ID</th>
                <th style={{ width: '15%', textAlign: 'center' }}>TWO WAY AUTH</th>
                <th style={{ width: '15%', textAlign: 'center' }}>OTP LOGIN</th>
                <th style={{ width: '15%', textAlign: 'center' }}>TPIN LOGIN</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.slice(0, rowsPerPage).map((m, idx) => (
                <tr key={m.id}>
                  <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{idx + 1}</td>
                  <td className={styles.fwBold}>{m.name}</td>
                  <td style={{ color: '#1756AA', fontWeight: 700 }}>{m.memberId || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <label className={`${styles.switch} ${styles.switchSmall}`}>
                        <input 
                          type="checkbox" 
                          checked={m.twoWay} 
                          onChange={() => handleToggle(m.id, 'twoWay')} 
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: m.twoWay ? '#27AE60' : '#A0AEC0' }}>
                        {m.twoWay ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <label className={`${styles.switch} ${styles.switchSmall}`} style={!m.twoWay ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}>
                        <input 
                          type="checkbox" 
                          checked={m.otp} 
                          disabled={!m.twoWay}
                          onChange={() => handleToggle(m.id, 'otp')} 
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: m.twoWay && m.otp ? '#27AE60' : '#A0AEC0' }}>
                        {m.otp ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <label className={`${styles.switch} ${styles.switchSmall}`} style={!m.twoWay ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}>
                        <input 
                          type="checkbox" 
                          checked={m.tpin} 
                          disabled={!m.twoWay}
                          onChange={() => handleToggle(m.id, 'tpin')} 
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: m.twoWay && m.tpin ? '#27AE60' : '#A0AEC0' }}>
                        {m.tpin ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#A0AEC0' }}>
                      No records found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className={styles.paginationRow}>
          <span className={styles.paginationInfo}>
            Showing 1 to {Math.min(rowsPerPage, filteredMembers.length)} of {filteredMembers.length} entries
          </span>
          
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn} disabled>
              <FaChevronLeft />
            </button>
            <button className={styles.pageBtn}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSecurity;


