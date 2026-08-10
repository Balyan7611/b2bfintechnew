import React, { useState } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaEllipsisV, FaCog, FaEdit, FaEye, 
  FaUserLock, FaTrash, FaCheck, FaExclamationCircle, FaFilter,
  FaCalendarAlt, FaUserTag, FaIdCard, FaMobileAlt, FaHandHoldingUsd, FaArrowRight,
  FaUsersCog, FaUserFriends
} from 'react-icons/fa';
import { updateManageMemberFilters } from '../../../store/slices/memberSlice';
import styles from './MemberPages.module.css';

const ApiUser = ({ onBack }) => {
  const dispatch = useDispatch();
  const { manageMemberState } = useSelector((s) => s.member);
  const { filters } = manageMemberState;
  const list = [];
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateManageMemberFilters({ [name]: value }));
  };

  const handlePillClick = (name, value) => {
    dispatch(updateManageMemberFilters({ [name]: value }));
  };

  return (
    <div className={styles.container}>
            <div className={styles.card} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1.5px solid #F8FAFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {onBack && (
              <button 
                onClick={onBack}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4E6080',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
                title="Back to Dashboard"
              >
                <FaChevronLeft size={14} />
              </button>
            )}
            <div className={styles.directoryTitleGroup}>
              <h2 className={styles.directoryTitle} style={{ fontSize: '1.1rem' }}>API User Directory</h2>
              <p className={styles.directorySubtitle} style={{ fontSize: '0.7rem' }}>Manage and monitor API user members</p>
            </div>
          </div>
          <div className={styles.directoryBadge} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            <FaUsersCog /> <span>API User Panel</span>
          </div>
        </div>
        
        <div className={styles.formGrid4} style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', gridColumn: 'span 2' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem' }}>From Date</label>
              <div className={styles.inputWrap}>
                <input type="date" name="fromDate" className={styles.inputControl} style={{ paddingLeft: '12px', fontSize: '0.85rem' }} value={filters.fromDate} onChange={handleFilterChange} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem' }}>To Date</label>
              <div className={styles.inputWrap}>
                <input type="date" name="toDate" className={styles.inputControl} style={{ paddingLeft: '12px', fontSize: '0.85rem' }} value={filters.toDate} onChange={handleFilterChange} />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} style={{ fontSize: '0.75rem' }}>Role</label>
            <div className={styles.inputWrap}>
              <select name="role" className={styles.inputControl} style={{ paddingLeft: '12px', fontSize: '0.85rem' }} value={filters.role} onChange={handleFilterChange}>
                <option value="">Select Role</option>
                <option value="API User">API User</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} style={{ fontSize: '0.75rem' }}>Search API User</label>
            <div className={styles.inputWrap}>
              <input type="text" name="search" className={styles.inputControl} style={{ paddingLeft: '12px', fontSize: '0.85rem' }} placeholder="Mobile / LoginID" value={filters.search} onChange={handleFilterChange} />
            </div>
          </div>
        </div>

        <div className={styles.formGrid3} style={{ marginTop: '24px', alignItems: 'flex-end' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>API User Type</label>
            <div className={styles.pillRow}>
              {['Active', 'DeActive', 'All'].map(t => (
                <button 
                  key={t}
                  className={`${styles.pillTab} ${filters.memberType === t ? styles.pillTabActive : ''}`}
                  onClick={() => handlePillClick('memberType', t)}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>KYC Status</label>
            <div className={styles.pillRow}>
              {['KYC', 'Non-KYC', 'All'].map(k => (
                <button 
                  key={k}
                  className={`${styles.pillTab} ${filters.kycStatus === k ? styles.pillTabActive : ''}`}
                  onClick={() => handlePillClick('kycStatus', k)}
                >{k}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={styles.searchBtnRed}>
              <FaFilter /> Filter List
            </button>
          </div>
        </div>
      </div>

            <div className={styles.card}>
        <div className={styles.directoryHeader} style={{ marginBottom: '24px', background: '#F8FAFF', padding: '16px', borderRadius: '14px', border: '1px solid #EEF3FC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="apiuser_report" sheetName="Report" />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '2400px' }}>
            <FaSearch />
            <input type="text" placeholder="Quick search..." />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.tableFull} style={{ minWidth: '2400px' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Action</th>
                <th>Main Balance</th>
                <th>AEPS Balance</th>
                <th>Hold Amount</th>
                <th>APIUserID</th>
                <th>APIUser Name</th>
                <th>City</th>
                <th>Parent Details</th>
                <th>Mobile</th>
                <th>AEPS Status</th>
                <th>Email</th>
                <th>Alt Mobile</th>
                <th>Shop Name</th>
                <th>Aadhar</th>
                <th>PAN</th>
                <th>DOB</th>
                <th>DOJ</th>
                <th>Joined By</th>
                <th>Password</th>
                <th>LoginPin</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="22" style={{ textAlign: 'center', padding: '24px', color: '#718096', fontSize: '0.9rem' }}>
                    No data available in table
                  </td>
                </tr>
              ) : (
                list.map((m, i) => (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td style={{ position: 'relative', zIndex: activeDropdown === m.id ? 1001 : 1 }}>
                      <div style={{ position: 'relative' }}>
                        <button 
                          className={styles.actionBtnGreen}
                          onClick={() => setActiveDropdown(activeDropdown === m.id ? null : m.id)}
                        >
                          Action <FaEllipsisV />
                        </button>
                        {activeDropdown === m.id && (
                          <div className={styles.actionMenu}>
                            <button><FaEdit style={{ color: '#EAA21F' }} /> Edit</button>
                            <button><FaEye style={{ color: '#27AE60' }} /> View</button>
                            <button><FaCog style={{ color: '#1756AA' }} /> Login</button>
                            <button><FaUserLock style={{ color: '#718096' }} /> Block</button>
                            <button><FaTrash style={{ color: '#E53E3E' }} /> Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.fwBold} style={{ color: '#27AE60' }}>₹ {m.mainBal}</td>
                    <td className={styles.fwBold} style={{ color: '#1756AA' }}>₹ {m.aepsBal}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="number" className={styles.inputControl} style={{ width: '80px', padding: '6px 10px', paddingLeft: '10px' }} value={m.holdAmt} readOnly />
                        <button className={styles.pillRedSmall}>Hold</button>
                      </div>
                    </td>
                    <td className={styles.fwBold}>{m.memberId}</td>
                    <td className={styles.fwBold}>{m.name}</td>
                    <td>{m.city}</td>
                    <td>{m.parent}</td>
                    <td>{m.mobile}</td>
                    <td>
                      <span className={`${styles.badge} ${m.aepsStatus === 'Registered' ? styles.badge_green : styles.badge_red}`}>
                        {m.aepsStatus === 'Registered' ? <FaCheck /> : <FaExclamationCircle />} {m.aepsStatus}
                      </span>
                    </td>
                    <td>{m.email}</td>
                    <td>{m.altMobile}</td>
                    <td>{m.shop}</td>
                    <td>{m.aadhar}</td>
                    <td>{m.pan}</td>
                    <td>{m.dob}</td>
                    <td>{m.doj}</td>
                    <td>{m.joinedBy}</td>
                    <td style={{ color: '#A0AEC0', fontStyle: 'italic', fontSize: '0.75rem' }}>{m.password}</td>
                    <td className={styles.fwBold}>{m.pin}</td>
                    <td><span className={styles.badge} style={{ background: '#F1F5F9', color: '#4E6080' }}>{m.source}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {list.length > 0 ? 1 : 0} to {list.length} of {list.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className={styles.pageBtn} style={{ width: '36px', height: '36px' }}>
              <FaChevronLeft />
            </button>
            <span className={styles.pageActive} style={{ 
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', background: '#1756AA', color: '#fff', fontSize: '0.9rem', fontWeight: 600
            }}>1</span>
            <button className={styles.pageBtn} style={{ width: '36px', height: '36px' }}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiUser;
