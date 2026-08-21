import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSearch, FiCalendar, FiUser, FiChevronLeft, FiChevronRight, FiSliders
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { 
  setEntriesToShow, setSearchTerm, setLoading 
} from '../../../store/slices/walletSlice';
import { API } from '../../../api/endpoints';
import { formatLedgerDate } from '../../../models/walletLedgerModel';
import styles from '../MemberPages/MemberPages.module.css';

const AEPSWalletReport = () => {
  const dispatch = useDispatch();
  const { entriesToShow, searchTerm, isLoading } = useSelector(state => state.wallet);
  // This page was never actually wired to real data — it always rendered a
  // hardcoded empty array, so nothing an admin did (e.g. adding funds to a
  // member's AEPS Wallet) ever showed up here. Now backed by the same
  // WalletLedger endpoint (WalletTypeId=AEPS) the member panel's own AEPS
  // Wallet history page uses.
  const [walletList, setWalletList] = useState([]);
  const [apiError, setApiError] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [membersList, setMembersList] = useState([]);
  
  const getCurrentDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadingTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current); };
  }, []);

  const [filters, setFilters] = useState({
    fromDate: getCurrentDateString(),
    toDate: getCurrentDateString(),
    memberId: ''
  });

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await API.member.search('');
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMembersList(items);
      } catch (err) {
        console.error("Error loading members in AEPSWalletReport:", err);
      }
    };
    fetchAllMembers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    const cleared = { fromDate: getCurrentDateString(), toDate: getCurrentDateString(), memberId: '' };
    setFilters(cleared);
    loadHistory(cleared);
  };

  const hasFilters = Object.values(filters).some(val => val !== getCurrentDateString() && val !== '');

  // Admin panel: memberId is optional — an admin should see every member's
  // AEPS wallet activity by default, and can narrow to one specific member
  // via the "Select Member" dropdown above.
  const loadHistory = async (f) => {
    const activeFilters = f || filters;
    dispatch(setLoading(true));
    setApiError('');
    try {
      const { items, totalItems } = await API.walletLedger.getAepsLedger({
        memberId: activeFilters.memberId || undefined,
        pageNumber: 1,
        pageSize: 500,
        fromDate: activeFilters.fromDate || '',
        toDate: activeFilters.toDate || ''
      });
      setWalletList(items.map(r => {
        const rawFactor = r.factor || (r.isCredit ? 'CR' : 'DR');
        const factor = String(rawFactor).toUpperCase().includes('CR') ? 'CR' : 'DR';
        return {
          ...r,
          member: r.memberName || r.loginId || 'N/A',
          mode: factor,
          opening: (r.openingBalance || 0).toFixed(2),
          amount: (r.amount || 0).toFixed(2),
          closing: (r.balance || 0).toFixed(2),
          surcharge: (r.surcharge || 0).toFixed(2),
          gst: (r.gst || 0).toFixed(2),
          tds: (r.tds || 0).toFixed(2),
          commission: (r.commission || 0).toFixed(2),
          narration: r.narration || r.description || 'N/A',
          date: formatLedgerDate(r.createdDate)
        };
      }));
      setTotalRecords(totalItems || items.length || 0);
    } catch (err) {
      console.error('[AEPSWalletReport] failed:', err);
      const msg = err?.response?.data?.mess || err?.message || 'API error';
      setApiError(`Failed to load wallet report: ${msg}`);
      setWalletList([]);
      setTotalRecords(0);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => { loadHistory(filters); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    loadHistory(filters);
  };

  const lowerSearch = String(searchTerm || '').toLowerCase();
  const filteredList = walletList.filter(item =>
    !lowerSearch ||
    String(item.member || '').toLowerCase().includes(lowerSearch) ||
    String(item.narration || '').toLowerCase().includes(lowerSearch)
  );
  const visibleList = filteredList.slice(0, Number(entriesToShow) || 10);

  return (
    <div className={styles.container} style={{ padding: '15px', maxWidth: '100%' }}>
            <div className={styles.cardFullMobile} style={{ marginTop: 0, padding: '15px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSliders /> AEPS Wallet Report
        </h3>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>From Date :</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>
            
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>To Date :</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={styles.inputControl} style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.label} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0D1B3E' }}>Member ID</label>
              <SearchableSelect
                name="memberId"
                value={filters.memberId}
                onChange={(val) => handleFilterChange({ target: { name: 'memberId', value: val } })}
                options={[
                  { label: 'Select Member', value: '' },
                  ...membersList.map(m => ({
                    label: `${m.memberId || m.loginId || m.id || m.msrno} - ${m.name || m.userName || ''}`,
                    value: m.memberId || m.loginId || m.id || m.msrno
                  }))
                ]}
                placeholder="Select Member"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isLoading} style={{ 
                height: '36px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', flex: 1, maxWidth: '150px',
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {isLoading ? <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></div> : <>Search</>}
              </button>
              
              {hasFilters && (
                <button type="button" onClick={handleClear} style={{ 
                  height: '36px', background: '#F1F5F9', width: '80px',
                  color: '#4E6080', border: '1px solid #E2E8F0', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>
        {apiError && (
          <div style={{ margin: '12px 0 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚠️ {apiError}
          </div>
        )}
      </div>

            <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <div className="global-table-toolbar" style={{ padding: '12px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              style={{ borderRadius: '6px', border: '1px solid #E2E8F0', height: '30px', padding: '0 8px' }} 
              value={entriesToShow}
              onChange={(e) => dispatch(setEntriesToShow(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" style={{ width: '32px', height: '32px' }} title="Copy Table"><FaCopy size={12} /></button>
            <button className="global-export-btn btn-excel" style={{ width: '32px', height: '32px' }} title="Download Excel"><FaFileExcel size={12} /></button>
            <button className="global-export-btn btn-pdf" style={{ width: '32px', height: '32px' }} title="Download PDF"><FaFilePdf size={12} /></button>
            <button className="global-export-btn btn-csv" style={{ width: '32px', height: '32px' }} title="Download CSV"><FaFileCsv size={12} /></button>
            <button className="global-export-btn btn-print" style={{ width: '32px', height: '32px' }} title="Print Table"><FaPrint size={12} /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '250px', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0 10px', height: '32px' }}>
            <FiSearch style={{ color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', paddingLeft: '8px' }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #EEF1F6' }}>
          {/* table-layout: auto (default) — each column sizes itself to fit its
              own content instead of being forced into a fixed pixel width. That
              forced-width approach was cutting Date/Member text off mid-word and
              letting it visually spill into the next column. The wrapper above
              already has overflow-x: auto, so on a narrow/small screen the whole
              table just scrolls horizontally instead of squeezing or overlapping. */}
          <table className={styles.table} style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
                <th style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                <th style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member</th>
                <th style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mode</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opening</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Closing</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Surcharge</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TDS</th>
                <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Commission</th>
                <th style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Narration</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12" style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Loading records...</span></div></td>
                </tr>
              ) : visibleList.length === 0 ? (
                <>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td colSpan="12" style={{ textAlign: 'center', color: '#A0AEC0', padding: '20px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span>
                    </td>
                  </tr>
                                    <tr style={{ height: '30px' }}><td colSpan="12" style={{ border: 'none' }}></td></tr>
                </>
              ) : (
                visibleList.map((item, index) => {
                  const isCredit = String(item.mode).toUpperCase() === 'CR';
                  return (
                  <tr
                    key={index}
                    className={styles.hoverRow}
                    style={{
                      background: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                      borderBottom: '1px solid #EEF1F6',
                    }}
                  >
                    <td style={{ fontWeight: 700, color: '#A0AEC0', padding: '11px 8px' }}>{index + 1}</td>
                    <td style={{ fontWeight: 600, color: '#4E6080', fontSize: '0.75rem', padding: '11px 8px' }}>{item.date || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: '#0D1B3E', padding: '11px 8px' }}>{item.member || 'N/A'}</td>
                    <td style={{ padding: '11px 8px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 50,
                        fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.3px',
                        background: isCredit ? '#ECFDF5' : '#FEF2F2',
                        color: isCredit ? '#15803D' : '#B91C1C',
                        border: `1px solid ${isCredit ? '#A7F3D0' : '#FECACA'}`,
                      }}>{item.mode || 'N/A'}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#475569', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.opening || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: isCredit ? '#15803D' : '#B91C1C', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.amount || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#0F172A', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.closing || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#D97706', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.surcharge || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#D97706', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.gst || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#EF4444', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.tds || '0.00'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#27AE60', padding: '11px 8px', fontSize: '0.78rem' }}>₹{item.commission || '0.00'}</td>
                    <td style={{ padding: '11px 8px' }}><div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.75rem', color: '#718096', lineHeight: '1.4' }}>{item.narration || 'N/A'}</div></td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '15px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>
            Showing {visibleList.length === 0 ? 0 : 1} to {visibleList.length} of {totalRecords} entries
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronLeft size={14} /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#1756AA', color: 'white', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '6px', width: '30px', height: '30px' }}><FiChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AEPSWalletReport;
