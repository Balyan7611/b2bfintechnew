import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FaHistory, FaSearch, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUser, FaChevronDown, FaDesktop, FaMobileAlt, FaTabletAlt, FaGlobe, FaMapMarkerAlt, FaNetworkWired } from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import { getSession } from '../../../utils/authUtils';
import { resolveReportScopeId } from '../../../utils/reportScope';
import SearchableSelect from '../common/SearchableSelect';
import sharedStyles from '../common/SharedTable.module.css';

const LoginHistory = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');
  const [fullData, setFullData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);   const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminMemberId, setAdminMemberId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const dropdownRef = useRef(null);
  
  const getToday = () => new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(getToday());
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

    useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      let resolvedMemberId;
      if (isAdmin) {
        resolvedMemberId = selectedMember?.id || selectedMember?.msrno || '';
      } else {
        // Never fall back to session.memberId here — for an API-panel account
        // that field holds the login STRING (not a numeric id), and sending
        // it as memberID would either error out or, worse, be misread by the
        // backend as someone else's numeric id. Use the same fail-closed
        // resolver the reports use instead.
        const { id, error } = await resolveReportScopeId();
        if (!id) {
          console.error('[LoginHistory]', error);
          setFullData([]);
          setLoading(false);
          return;
        }
        resolvedMemberId = id;
      }

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
        }
      }
      
      setFullData(items);
      setPage(1);
    } catch (err) {
      console.error(err);
      setFullData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fromDate, toDate, statusFilter, selectedMember]);

  const filteredData = fullData
    .filter(item => {
      // Client-side date range filter (backend may not filter reliably)
      const rawTime = item.loginTime || item.createdAt || item.createdOn || item.LoginTime || '';
      const itemDateStr = rawTime ? rawTime.substring(0, 10) : ''; // "YYYY-MM-DD"
      if (fromDate && itemDateStr && itemDateStr < fromDate) return false;
      if (toDate && itemDateStr && itemDateStr > toDate) return false;

      // Search term filter
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const matchedMember = memberOptions.find(m => String(m.id) === String(item.msrno));
      const memberName = matchedMember ? matchedMember.name : '';
      const memberCode = matchedMember ? (matchedMember.memberId || '') : '';
      return (
        (item.loginIpaddress || '').toLowerCase().includes(q) ||
        (item.deviceName || '').toLowerCase().includes(q) ||
        (item.browser || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.loginType || '').toLowerCase().includes(q) ||
        memberName.toLowerCase().includes(q) ||
        memberCode.toLowerCase().includes(q)
      );
    })
    // Newest first
    .sort((a, b) => {
      const tA = a.loginTime || a.createdAt || a.createdOn || a.LoginTime || '';
      const tB = b.loginTime || b.createdAt || b.createdOn || b.LoginTime || '';
      return tB.localeCompare(tA);
    });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const getPaginationPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div style={{ padding: '15px 16px 0px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ 
        background: 'var(--card-bg, #ffffff)', 
        borderRadius: '16px', 
        padding: '20px 25px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        alignItems: 'end'
      }}>
         <h3 style={{ gridColumn: '1 / -1', margin: '0 0 5px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0D1B3E' }}>
           Login History
         </h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4E6080' }}>From Date</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '40px', boxSizing: 'border-box' }}>
              <FaCalendarAlt color="#64748b" />
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', width: '100%' }}
              />
            </div>
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4E6080' }}>To Date</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '40px', boxSizing: 'border-box' }}>
              <FaCalendarAlt style={{ color: '#64748B' }} />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', width: '100%' }}
              />
            </div>
         </div>

         {isAdmin && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }} ref={dropdownRef}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4E6080' }}>Select Member</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex', gap: '10px', alignItems: 'center', background: '#ffffff', 
                  padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  cursor: 'pointer', height: '40px', justifyContent: 'space-between',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  userSelect: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <FaUser style={{ color: '#64748B', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: selectedMember ? '#0f172a' : '#64748b', fontWeight: selectedMember ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedMember ? `${selectedMember.name} (${selectedMember.memberId || selectedMember.id})` : 'All Members'}
                  </span>
                </div>
                <FaChevronDown style={{ fontSize: '0.75rem', color: '#64748B', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }} />
              </div>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '48px', left: 0, background: '#ffffff',
                  border: '1px solid #e2e8f0', borderRadius: '12px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000, width: '300px', padding: '10px 0'
                }}>
                  <div style={{ padding: '0 12px 10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaSearch style={{ color: '#94a3b8', fontSize: '0.875rem' }} />
                    <input
                      type="text"
                      placeholder="Search member..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', padding: '6px 4px', color: '#0f172a' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 0' }}>
                    <div
                      onClick={() => { setSelectedMember(null); setIsDropdownOpen(false); setMemberSearchQuery(''); setPage(1); }}
                      style={{ 
                        padding: '8px 16px', fontSize: '0.875rem', cursor: 'pointer', color: '#475569',
                        fontWeight: !selectedMember ? 600 : 500,
                        backgroundColor: !selectedMember ? '#f8fafc' : 'transparent'
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
                            onClick={() => { setSelectedMember(m); setIsDropdownOpen(false); setMemberSearchQuery(''); setPage(1); }}
                            style={{
                              padding: '10px 16px', fontSize: '0.85rem', cursor: 'pointer',
                              backgroundColor: isSel ? '#f8fafc' : 'transparent',
                              borderBottom: '1px solid #f8fafc'
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
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                        No members found
                      </div>
                    )}
                  </div>
                </div>
              )}
           </div>
         )}

         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4E6080' }}>Status</label>
            <SearchableSelect
              value={statusFilter}
              onChange={val => { setStatusFilter(val || ''); setPage(1); }}
              options={[
                { label: 'All Status', value: '' },
                { label: 'Success', value: 'Success' },
                { label: 'Failed', value: 'Failed' }
              ]}
              placeholder="All Status"
              style={{ height: '40px', borderRadius: '8px' }}
            />
         </div>

         <button 
           onClick={() => { setPage(1); fetchHistory(); }}
           style={{
             height: '40px',
             background: 'linear-gradient(135deg, #1756AA, #124d96)',
             color: '#fff',
             border: 'none',
             borderRadius: '8px',
             fontWeight: 700,
             fontSize: '0.9rem',
             cursor: 'pointer',
             boxShadow: '0 4px 10px rgba(23, 86, 170, 0.15)',
             transition: 'all 0.2s',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: '8px'
           }}
           onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
           onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
         >
           <FaSearch /> Search
         </button>
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
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', color: '#334155' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search IP, device, location..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
          <table className={sharedStyles.table} style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '52px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '96px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>#</th>
                <th>User / Member</th>
                <th>IP Address</th>
                <th>Device / Browser</th>
                <th>Location</th>
                <th>Login Time</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <div style={{ width: 18, height: 18, border: '2px solid #e2e8f0', borderTopColor: '#1756AA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Loading history…
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
                  const isValidDate = dateObj && !isNaN(dateObj);
                  const datePart = isValidDate ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  const timePart = isValidDate ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

                                    const status = item.status || item.Status || 'Success';
                  const isSuccess = status.toLowerCase() === 'success' || status === '1' || status === true;

                                    const matchedMember = memberOptions.find(m => String(m.id) === String(item.msrno));
                  const session = getSession();
                  const displayName = isAdmin
                    ? (matchedMember ? matchedMember.name : (item.loginType || 'Unknown'))
                    : (session?.fullName || session?.name || 'Member');
                  const displayCode = isAdmin
                    ? (matchedMember ? (matchedMember.memberId || '') : (item.msrno ? `#${item.msrno}` : ''))
                    : (session?.memberId || '');
                  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

                                    const ipRaw = item.loginIpaddress || item.ipAddress || item.ip || item.IPAddress || '';

                                    const deviceRaw = (item.device || item.browser || item.Device || '').trim();
                  const isMobile = /mobile|android|iphone|ipad/i.test(deviceRaw);
                  const isTablet = /tablet|ipad/i.test(deviceRaw);
                  const DeviceIcon = isTablet ? FaTabletAlt : isMobile ? FaMobileAlt : FaDesktop;
                  const deviceColor = isMobile ? '#7c3aed' : isTablet ? '#0891b2' : '#1756AA';

                                    const locationRaw = item.location || item.Location || '';

                  return (
                    <tr key={item.id || item.Id || index}>
                                            <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 26, height: 26, borderRadius: '50%',
                          background: '#f1f5f9', color: '#64748b',
                          fontSize: '0.7rem', fontWeight: 700
                        }}>
                          {(page - 1) * pageSize + index + 1}
                        </span>
                      </td>

                                            <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #1756AA, #0D1B3E)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 800, letterSpacing: 0.5
                          }}>{initials}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                            {displayCode && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 1 }}>{displayCode}</div>}
                          </div>
                        </div>
                      </td>

                                            <td>
                        {ipRaw ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 6, padding: '3px 8px',
                            fontFamily: 'monospace', fontSize: '0.72rem', color: '#334155', fontWeight: 600,
                            maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
                            <FaNetworkWired style={{ color: '#94a3b8', fontSize: '0.6rem', flexShrink: 0 }} />
                            {ipRaw}
                          </span>
                        ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>

                                            <td>
                        {deviceRaw ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                              background: `${deviceColor}15`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <DeviceIcon style={{ color: deviceColor, fontSize: '0.7rem' }} />
                            </span>
                            <span style={{
                              fontSize: '0.72rem', color: '#475569', fontWeight: 500,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              maxWidth: 148
                            }} title={deviceRaw}>{deviceRaw}</span>
                          </div>
                        ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>

                                            <td>
                        {locationRaw ? (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationRaw)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', cursor: 'pointer' }}
                          >
                            <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: '0.65rem', flexShrink: 0 }} />
                            <span style={{
                              fontSize: '0.72rem', color: '#1756aa', fontWeight: 600,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              maxWidth: 110, textDecoration: 'underline'
                            }} title={`View ${locationRaw} on Map`}>{locationRaw}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaGlobe style={{ fontSize: '0.65rem' }} /> Unknown
                          </span>
                        )}
                      </td>

                                            <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#334155' }}>{datePart}</span>
                          {timePart && <span style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{timePart}</span>}
                        </div>
                      </td>

                                            <td style={{ textAlign: 'center' }}>
                        <span className={isSuccess ? sharedStyles.success : sharedStyles.failed} style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.67rem', fontWeight: 800,
                          display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
                          {isSuccess ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <FiDatabase style={{ fontSize: '2rem', opacity: 0.25 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No login history found</span>
                      <span style={{ fontSize: '0.75rem' }}>Try adjusting the date range or filters</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Showing {filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#cbd5e1' : '#334155', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              <FaChevronLeft style={{ fontSize: '10px' }} />
            </button>

            {getPaginationPages().map((p, idx) =>
              p === '...' ? (
                <span key={`ell-${idx}`} style={{ width: 36, textAlign: 'center', color: '#94a3b8' }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, border: '1px solid #e2e8f0',
                    background: p === page ? '#1756AA' : '#fff',
                    color: p === page ? '#fff' : '#1756AA',
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#cbd5e1' : '#334155', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <FaChevronRight style={{ fontSize: '10px' }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginHistory;
