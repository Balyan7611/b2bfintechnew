import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FaHistory, FaSearch, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUser, FaChevronDown } from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import { getSession } from '../../../utils/authUtils';
import sharedStyles from '../common/SharedTable.module.css';

const LoginHistory = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');
  const [fullData, setFullData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // stores the selected member object
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminMemberId, setAdminMemberId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const dropdownRef = useRef(null);
  
  // Date filters defaulting to current month
  const getToday = () => new Date().toISOString().split('T')[0];
  const getFirstOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState(getFirstOfMonth());
  const [toDate, setToDate] = useState(getToday());

  const handleSearchMembers = async (query) => {
    try {
      const res = await API.member.search(query || '');
      setMemberOptions(res || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      handleSearchMembers('');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && memberSearchQuery !== undefined) {
      const delayDebounce = setTimeout(() => {
        handleSearchMembers(memberSearchQuery);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [memberSearchQuery, isAdmin]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant local filtering of member choices
  const filteredMemberOptions = memberOptions.filter(m => {
    const query = memberSearchQuery.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(query) ||
      (m.memberId || m.id || '').toString().toLowerCase().includes(query) ||
      (m.mobile || '').toLowerCase().includes(query)
    );
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const session = getSession();
      // If admin, use selectedMember.id (numeric) first, as backend filters by numeric ID (e.g. MemberID=2)
      const resolvedMemberId = isAdmin ? (selectedMember?.id || selectedMember?.msrno || '') : (session?.msrno || session?.userId || session?.memberId || '');

      // Fetch a large page size to handle sorting locally since API might return ascending
      const res = await API.userLoginHistory.getAll({ 
        pageNumber: 1, 
        pageSize: 10000,
        fromDate: fromDate || undefined,
        toDate: toDate ? `${toDate}T23:59:59` : undefined,
        memberID: resolvedMemberId || undefined,
        status: statusFilter || undefined
      });
      
      let items = [];
      let total = 1;

      if (res && res.data) {
        const payload = res.data;
        if (Array.isArray(payload)) {
            items = payload;
        } else if (payload.data && Array.isArray(payload.data)) {
            items = payload.data;
            total = payload.totalPages || payload.TotalPages || Math.ceil((payload.totalCount || payload.TotalCount || 0) / pageSize);
        } else if (payload.items && Array.isArray(payload.items)) {
            items = payload.items;
            total = payload.totalPages || Math.ceil((payload.totalCount || 0) / pageSize);
        } else if (payload.data && payload.data.items && Array.isArray(payload.data.items)) {
            items = payload.data.items;
            total = payload.data.totalPages || Math.ceil((payload.data.totalCount || 0) / pageSize);
        } else if (payload.Data && Array.isArray(payload.Data)) {
            items = payload.Data;
            total = payload.TotalPages || Math.ceil((payload.TotalCount || 0) / pageSize);
        } else if (payload.data && payload.data.data && Array.isArray(payload.data.data)) {
            items = payload.data.data;
            total = payload.data.totalPages || 1;
        }
      }

      // Sort all items descending so newest is at the top
      items.sort((a, b) => {
        const timeA = new Date(a.loginTime || a.createdDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.loginTime || b.createdDate || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setFullData(items);
      setPage(1); // reset to page 1 on new fetch
    } catch (err) {
      console.error("Failed to fetch login history:", err);
      setFullData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredData = fullData.filter(item => {
    const term = searchTerm.toLowerCase();
    
    // Find matched member details to search by name and ID in main search bar
    const matchedMember = memberOptions.find(m => String(m.id) === String(item.msrno));
    const session = getSession();
    
    const displayName = isAdmin 
      ? (matchedMember ? matchedMember.name : (item.loginType || '')) 
      : (session?.fullName || session?.name || '');
    const displayCode = isAdmin 
      ? (matchedMember ? (matchedMember.memberId || '') : '') 
      : (session?.memberId || '');

    return (
      (item.loginIpaddress || item.ipAddress || item.ip || '').toLowerCase().includes(term) ||
      (item.device || item.browser || '').toLowerCase().includes(term) ||
      (item.location || '').toLowerCase().includes(term) ||
      (item.status || '').toLowerCase().includes(term) ||
      displayName.toLowerCase().includes(term) ||
      displayCode.toLowerCase().includes(term) ||
      String(item.msrno || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div style={{ padding: '24px 32px 24px 32px', width: '100%', boxSizing: 'border-box', margin: '0' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4f46e5', fontSize: '1.25rem'
        }}>
          <FaHistory />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary, #1e293b)' }}>Login History</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem' }}>
            Track and monitor your recent account access activity.
          </p>
        </div>
      </div>

      <div style={{ 
        background: 'var(--card-bg, #ffffff)', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-color, #e2e8f0)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <FaCalendarAlt color="#64748b" />
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem' }}
              />
            </div>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>TO</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <FaCalendarAlt style={{ color: '#64748B' }} />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem' }}
              />
            </div>
            
            {isAdmin && (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex', gap: '10px', alignItems: 'center', background: '#ffffff', 
                    padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1',
                    cursor: 'pointer', minWidth: '180px', height: '42px', justifyContent: 'space-between',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUser style={{ color: '#64748B' }} />
                    <span style={{ fontSize: '0.875rem', color: selectedMember ? '#0f172a' : '#64748b', fontWeight: selectedMember ? 600 : 500 }}>
                      {selectedMember ? `${selectedMember.name} (${selectedMember.memberId || selectedMember.id})` : 'All Members'}
                    </span>
                  </div>
                  <FaChevronDown style={{ fontSize: '0.75rem', color: '#64748B', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </div>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '48px', left: 0, background: '#ffffff',
                    border: '1px solid #e2e8f0', borderRadius: '12px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000, width: '300px', padding: '10px 0',
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <div style={{ padding: '0 12px 10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaSearch style={{ color: '#94a3b8', fontSize: '0.875rem' }} />
                      <input
                        type="text"
                        placeholder="Search member by name, ID or phone..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', padding: '6px 4px', color: '#0f172a' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px 0' }}>
                      <div
                        onClick={() => { setSelectedMember(null); setIsDropdownOpen(false); setMemberSearchQuery(''); }}
                        style={{ 
                          padding: '8px 16px', fontSize: '0.875rem', cursor: 'pointer', color: '#475569',
                          fontWeight: !selectedMember ? 600 : 500,
                          backgroundColor: !selectedMember ? '#f8fafc' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = !selectedMember ? '#f8fafc' : 'transparent'}
                      >
                        All Members
                      </div>
                      {filteredMemberOptions.length > 0 ? (
                        filteredMemberOptions.map(m => {
                          const isSel = selectedMember?.id === m.id;
                          return (
                            <div
                              key={m.id || m.memberId}
                              onClick={() => { setSelectedMember(m); setIsDropdownOpen(false); setMemberSearchQuery(''); }}
                              style={{
                                padding: '10px 16px', fontSize: '0.85rem', cursor: 'pointer',
                                backgroundColor: isSel ? '#f8fafc' : 'transparent',
                                borderBottom: '1px solid #f8fafc',
                                transition: 'background 0.15s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isSel ? '#f8fafc' : 'transparent'}
                            >
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                ID: {m.memberId || m.id} | 📞 {m.mobile}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '16px', textOver: 'ellipsis', overflow: 'hidden', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                          No members found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', height: '42px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', color: '#1E293B', fontSize: '0.875rem', fontWeight: 500, width: '130px', cursor: 'pointer' }}
              >
                <option value="">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <button 
              onClick={() => { setPage(1); fetchHistory(); }}
              style={{
                padding: '8px 16px',
                background: '#1756AA',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#124285'}
              onMouseOut={(e) => e.target.style.background = '#1756AA'}
            >
              Search
            </button>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search IP, device, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <div className={sharedStyles.tableWrapper}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User / Member</th>
                <th>IP Address</th>
                <th>Device / Browser</th>
                <th>Location</th>
                <th>Login Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <div className={sharedStyles.spinner}></div>
                      <span style={{ color: '#64748b' }}>Loading history...</span>
                    </div>
                  </td>
                </tr>
              ) : pagedData.length > 0 ? (
                pagedData.map((item, index) => {
                  let rawTime = item.loginTime || item.createdAt || item.createdOn || item.LoginTime;
                  if (rawTime && typeof rawTime === 'string' && !rawTime.endsWith('Z') && !rawTime.includes('+')) {
                    rawTime += 'Z';
                  }
                  const dateObj = rawTime ? new Date(rawTime) : null;
                  const formattedDate = dateObj && !isNaN(dateObj) ? dateObj.toLocaleString() : 'N/A';
                  
                  const status = item.status || item.Status || 'Success';
                  const isSuccess = status.toLowerCase() === 'success' || status === '1' || status === true;

                  const matchedMember = memberOptions.find(m => String(m.id) === String(item.msrno));
                  const session = getSession();
                  const displayName = isAdmin 
                    ? (matchedMember ? matchedMember.name : (item.loginType || 'N/A')) 
                    : (session?.fullName || session?.name || 'Member');
                  const displayCode = isAdmin 
                    ? (matchedMember ? (matchedMember.memberId || `MSRNO: ${item.msrno}`) : `MSRNO: ${item.msrno}`) 
                    : (session?.memberId || `MSRNO: ${item.msrno}`);

                  return (
                    <tr key={item.id || item.Id || index}>
                      <td>{(page - 1) * pageSize + index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{displayName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{displayCode}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{item.loginIpaddress || item.ipAddress || item.ip || item.IPAddress || '-'}</td>
                      <td>{item.device || item.browser || item.Device || '-'}</td>
                      <td>{item.location || item.Location || 'Unknown'}</td>
                      <td>{formattedDate}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
                          color: isSuccess ? '#166534' : '#991b1b'
                        }}>
                          {isSuccess ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FiDatabase style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No login history found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing page {page} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handlePrevPage} 
              disabled={page === 1}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: page === 1 ? '#f8fafc' : '#ffffff',
                color: page === 1 ? '#cbd5e1' : '#334155',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <FaChevronLeft style={{ fontSize: '10px' }} /> Prev
            </button>
            <button 
              onClick={handleNextPage} 
              disabled={page === totalPages || totalPages === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: (page === totalPages || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page === totalPages || totalPages === 0) ? '#cbd5e1' : '#334155',
                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              Next <FaChevronRight style={{ fontSize: '10px' }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginHistory;
