import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Server-side paging + filters (GetUserLoginHistory: PageNumber, PageSize, FromDate, ToDate, Status, MemberID)
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Client-side text search over the currently loaded page
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // We fetch a large batch matching the date/status filters (server-side)
  // and then sort + paginate on the client. This is deliberate: the backend
  // doesn't document a sort order for GetUserLoginHistory, so asking it for
  // just PageSize=10/PageNumber=1 risked showing only the OLDEST 10 records
  // (insertion order) - meaning any recent login (admin or member) could be
  // buried past page 1 and never show up at all. Sorting newest-first on the
  // client guarantees the most recent activity - including admin logins -
  // is always visible.
  const SERVER_FETCH_SIZE = 5000;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.userLoginHistory.getAll({
        pageNumber: 1,
        pageSize: SERVER_FETCH_SIZE,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(toDate).toISOString() : undefined,
        status: statusFilter || undefined
      });

      // Robust array extraction – handles various response shapes
      let dataArray = [];
      if (response) {
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (Array.isArray(response)) {
          dataArray = response;
        } else if (typeof response === 'object') {
          dataArray = response.items || response.results || response.list || response.records || [];
        }
      }

      // Newest first, regardless of whatever order the backend returned.
      dataArray = [...dataArray].sort((a, b) => {
        const aTime = a.loginTime ? new Date(a.loginTime).getTime() : 0;
        const bTime = b.loginTime ? new Date(b.loginTime).getTime() : 0;
        if (bTime !== aTime) return bTime - aTime;
        return (b.id || 0) - (a.id || 0);
      });

      setLoginList(dataArray);
      setPageNumber(1);
    } catch (err) {
      console.error("Failed to fetch login history", err);
      setError('Unable to load login activity. Please try again later.');
      setLoginList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, statusFilter]);

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setPageNumber(1);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this login history record? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await API.userLoginHistory.delete(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete login history record", err);
      setError('Unable to delete this record. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredList = loginList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(item.loginType || '').toLowerCase().includes(q) ||
      String(item.deviceName || '').toLowerCase().includes(q) ||
      String(item.browser || '').toLowerCase().includes(q) ||
      String(item.loginIpaddress || '').toLowerCase().includes(q) ||
      String(item.msrno || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const visibleList = filteredList.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  return (
    <div className={styles.container} style={{ padding: '5px 16px 0px 16px', maxWidth: '100%' }}>
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
            <select
              className={styles.selectEntries}
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPageNumber(1); }}
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '7px 10px', fontSize: '0.85rem', color: '#4E6080' }}
              title="From Date"
            />
            <span style={{ color: '#A0AEC0', fontSize: '0.8rem' }}>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPageNumber(1); }}
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '7px 10px', fontSize: '0.85rem', color: '#4E6080' }}
              title="To Date"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
              style={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '7px 10px', fontSize: '0.85rem', color: '#4E6080' }}
            >
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
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
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1); }}
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
                <th style={{ width: '90px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: '#718096' }}>
                    Loading login activity...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: '#EF4444' }}>
                    {error}
                  </td>
                </tr>
              ) : visibleList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0' }}>
                    No login activity found.
                  </td>
                </tr>
              ) : (
                visibleList.map((item, idx) => (
                  <tr key={item.id || idx} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{(pageNumber - 1) * pageSize + idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '36px', height: '36px', background: 'rgba(23, 86, 170, 0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                            <FiUser />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{item.loginType || 'Employee'}</span>
                            <small style={{ color: '#718096', fontWeight: 600 }}>MSRNO: {item.msrno || '-'}</small>
                         </div>
                      </div>
                    </td>
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
                        background: item.isActiveSession ? '#DBEAFE' : (item.loginStatus?.toLowerCase() === 'success' ? '#DCFCE7' : '#FEE2E2'),
                        color: item.isActiveSession ? '#2563EB' : (item.loginStatus?.toLowerCase() === 'success' ? '#16A34A' : '#EF4444'),
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800
                      }}>
                        {item.isActiveSession ? 'Active' : (item.loginStatus || 'Unknown')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Delete record"
                        style={{
                          background: '#FEE2E2',
                          color: '#EF4444',
                          border: 'none',
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                          opacity: deletingId === item.id ? 0.5 : 1
                        }}
                      >
                        <FiX />
                      </button>
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
            Showing {filteredList.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0} to {Math.min(pageNumber * pageSize, filteredList.length)} of {filteredList.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="global-page-btn"
              disabled={pageNumber <= 1 || loading}
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              style={{ borderRadius: '8px' }}
            >
              <FiChevronLeft />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>{pageNumber}</div>
            <button
              className="global-page-btn"
              disabled={pageNumber >= totalPages || loading}
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
              style={{ borderRadius: '8px' }}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginList;