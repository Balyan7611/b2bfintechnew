import React, { useState, useEffect } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaShieldAlt, FaSearch, FaChevronLeft, FaChevronRight,
  FaCopy, FaFileExcel, FaFileCsv, FaFilePdf, FaPrint
} from 'react-icons/fa';
import { updateSecurityToggle } from '../../../store/slices/memberSlice';
import { API } from '../../../api/endpoints';
import styles from './MemberPages.module.css';

const MemberSecurity = () => {
  const dispatch = useDispatch();
  const { securityState } = useSelector((s) => s.member);
  const { memberList } = securityState;
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Local state for UI functionality
  const [members, setMembers] = useState([]);

  const fetchMembers = async () => {
    try {
      const response = await API.memberSecurity.getAll();
      if (response && response.data) {
        setMembers(response.data);
      } else if (Array.isArray(response)) {
        setMembers(response);
      }
    } catch (error) {
      console.error("Failed to fetch member security settings:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const [globalToggles, setGlobalToggles] = useState(
    securityState.globalToggles || { twoWay: true, otp: false, tpin: false }
  );

  const handleGlobalToggle = (field) => {
    setGlobalToggles(prev => {
      const newValue = !prev[field];
      const newGlobal = { ...prev, [field]: newValue };
      
      // If turning off Two Way Auth, turn off OTP and TPIN globally too
      if (field === 'twoWay' && !newValue) {
         newGlobal.otp = false;
         newGlobal.tpin = false;
      }

      // OTP and TPIN are mutually exclusive
      if (field === 'otp' && newValue) {
         newGlobal.tpin = false;
      }
      if (field === 'tpin' && newValue) {
         newGlobal.otp = false;
      }
      
      // Update all members to match the global toggle
      setMembers(membersList => membersList.map(m => {
        let updatedMember = { ...m, [field]: newValue };
        if (field === 'twoWay' && !newValue) {
           updatedMember.otp = false;
           updatedMember.tpin = false;
        }
        if (field === 'otp' && newValue) {
           updatedMember.tpin = false;
        }
        if (field === 'tpin' && newValue) {
           updatedMember.otp = false;
        }
        return updatedMember;
      }));
      
      return newGlobal;
    });
  };

  const handleToggle = async (id, field) => {
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex === -1) return;

    const m = members[memberIndex];
    let updatedMember = { ...m, [field]: !m[field] };
    
    // UI logic mapping
    const fieldMapping = {
      'twoWay': 'twoWay',
      'otp': 'isOtp',
      'tpin': 'isTpin'
    };

    const isOtp = field === 'otp' ? updatedMember.otp : m.isOtp;
    const isTpin = field === 'tpin' ? updatedMember.tpin : m.isTpin;

    if (field === 'twoWay' && !updatedMember.twoWay) {
       updatedMember.otp = false;
       updatedMember.tpin = false;
       updatedMember.isOtp = false;
       updatedMember.isTpin = false;
    }
    
    if (field === 'otp' && updatedMember.otp) {
       updatedMember.tpin = false;
       updatedMember.isTpin = false;
       updatedMember.isOtp = true;
    }
    if (field === 'tpin' && updatedMember.tpin) {
       updatedMember.otp = false;
       updatedMember.isOtp = false;
       updatedMember.isTpin = true;
    }

    // Set optimistic UI update
    setMembers(membersList => membersList.map(member => member.id === id ? updatedMember : member));

    try {
      const payload = {
        id: updatedMember.id,
        msrno: updatedMember.msrno || 0,
        twoWay: updatedMember.twoWay || false,
        isOtp: updatedMember.isOtp || updatedMember.otp || false,
        isTpin: updatedMember.isTpin || updatedMember.tpin || false,
        isPattern: updatedMember.isPattern || false,
        isGoogleAuth: updatedMember.isGoogleAuth || false,
        authKey: updatedMember.authKey || "string",
        isSeparateProfitWallet: updatedMember.isSeparateProfitWallet || false
      };
      await API.memberSecurity.update(payload);
    } catch (error) {
      console.error("Failed to update security:", error);
      alert("Failed to update security setting.");
      // Revert on error
      setMembers(membersList => membersList.map(member => member.id === id ? m : member));
    }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const GlobalToggleCard = ({ label, field, active, disabled }) => (
    <div className={styles.premiumToggleCard} style={{ ...(disabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}), padding: '8px 12px', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '50px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <span className={styles.premiumToggleLabel} style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{label}</span>
      <label className={`${styles.switch} ${styles.switchSmall}`} style={{ margin: 0 }}>
        <input 
          type="checkbox" 
          checked={active} 
          disabled={disabled}
          onChange={() => handleGlobalToggle(field)} 
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
              {filteredMembers.length > 0 ? filteredMembers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((m, idx) => (
                <tr key={m.id}>
                  <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
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
                      </span></div></td>
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
                      </span></div></td>
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
                      </span></div></td>
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
            Showing {filteredMembers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredMembers.length)} of {filteredMembers.length} entries
          </span>
          
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageBtn} 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
              {currentPage}
            </div>
            <button 
              className={styles.pageBtn} 
              onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredMembers.length / rowsPerPage) || 1))}
              disabled={currentPage === (Math.ceil(filteredMembers.length / rowsPerPage) || 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSecurity;


