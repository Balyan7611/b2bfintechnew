import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiMonitor, FiClock, FiMapPin, FiUser
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const EmployeeLoginList = () => {
  const dispatch = useDispatch();

  const [loginList, setLoginList] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.userLoginHistory.getAll();
        if (response && response.data) {
          setLoginList(response.data);
        } else if (Array.isArray(response)) {
          setLoginList(response);
        }
      } catch (err) {
        console.error("Failed to fetch login history", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.container} style={{ padding: '5px 2px 0px 2px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0D1B3E' }}>Employee Login Activity</h3>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '20px 25px', flexWrap: 'wrap', gap: '20px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table"><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search by employee..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.NO</th>
                <th style={{ width: '250px' }}>EMPLOYEE DETAILS</th>
                <th style={{ width: '200px' }}>DEVICE / BROWSER</th>
                <th style={{ width: '150px', textAlign: 'center' }}>IP ADDRESS</th>
                <th style={{ width: '200px', textAlign: 'center' }}>LOGIN TIMESTAMP</th>
                <th style={{ width: '120px', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loginList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                    No login activity found.
                  </td>
                </tr>
              ) : (
                loginList.map((item, idx) => (
                  <tr key={item.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '36px', height: '36px', background: 'rgba(23, 86, 170, 0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                            <FiUser />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{item.loginType || 'Employee'}</span>
                            <small style={{ color: '#718096', fontWeight: 600 }}>MSRNO: {item.msrno || '-'}</small>
                         </div></div></td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4E6080', fontSize: '0.85rem', fontWeight: 600 }}>
                          <FiMonitor style={{ color: '#A0AEC0' }} />
                          {item.deviceName || '-'} / {item.browser || '-'}
                       </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#1756AA', fontWeight: 800, fontSize: '0.8rem' }}>
                          <FiMapPin style={{ fontSize: '0.9rem' }} />
                          {item.loginIpaddress || '-'}
                       </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ color: '#4E6080', fontSize: '0.85rem', fontWeight: 700 }}>
                          {item.loginTime ? new Date(item.loginTime).toLocaleString() : '-'}
                       </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        background: item.loginStatus?.toLowerCase() === 'success' ? '#DCFCE7' : '#FEE2E2', 
                        color: item.loginStatus?.toLowerCase() === 'success' ? '#16A34A' : '#EF4444', 
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 
                      }}>
                        {item.loginStatus || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '15px 25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {loginList.length > 0 ? 1 : 0} to {loginList.length} of {loginList.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginList;
