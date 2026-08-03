import React, { useState } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { 
  FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiZap, FiLoader
} from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const QuickSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({ success: 0, pending: 0, failed: 0 });

  const handleSearch = async (e, targetPage = 1) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await API.transaction.search({
        searchTerm: searchTerm.trim(),
        pageNumber: targetPage,
        pageSize: pageSize
      });

      if (res && res.status !== false) {
        const payload = res.data || res;
        setResults(payload.items || []);
        setTotalItems(payload.totalItems || 0);
        setPage(targetPage);
        setStats({
          success: payload.totalSuccess || 0,
          pending: payload.totalPending || 0,
          failed: payload.totalFailed || 0
        });
      } else {
        setResults([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('QuickSearch: Search failed:', err);
      setResults([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalItems / pageSize)) {
      handleSearch(null, newPage);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'success') {
      return (
        <span style={{ background: '#ECFDF5', color: '#10B981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FiCheckCircle size={12} /> Success
        </span>
      );
    } else if (s === 'pending') {
      return (
        <span style={{ background: '#FFFBEB', color: '#F59E0B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FiAlertCircle size={12} /> Pending
        </span>
      );
    } else {
      return (
        <span style={{ background: '#FEF2F2', color: '#EF4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FiXCircle size={12} /> Failed
        </span>
      );
    }
  };

  // Setup CSV exports mapping
  const exportHeaders = ['Date', 'Order ID', 'Vendor ID', 'Ref ID', 'RRN', 'Customer Name', 'Mobile', 'Account No', 'IFSC', 'Amount', 'Surcharge', 'Commission', 'Opening Bal', 'Closing Bal', 'Status'];
  const exportRows = results.map(r => [
    r.createdDate ? new Date(r.createdDate).toLocaleString('en-IN') : '',
    r.orderId || '',
    r.vendorId || '',
    r.refid || '',
    r.rrn || '',
    r.customerName || '',
    r.customerMobile || '',
    r.accountNo || '',
    r.ifsc || '',
    r.amount || 0,
    r.surcharge || 0,
    r.commission || 0,
    r.openingBalance || 0,
    r.closingBalance || 0,
    r.status || ''
  ]);

  return (
    <div className={styles.container}>
      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        {/* CARD TOP: TITLE */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>Quick Search</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Real-time Universal Transaction Lookup</p>
          </div>
        </div>

        {/* CARD BOTTOM: FILTERS */}
        <div style={{ padding: '20px', background: '#FAFBFC' }}>
          <form onSubmit={(e) => handleSearch(e, 1)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'flex-end', maxWidth: '800px' }}>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Search Criteria (Order ID / RRN / Mobile / Account / Customer)</label>
                <div style={{ position: 'relative' }}>
                  <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input 
                    type="text" 
                    placeholder="Enter Order ID, RRN, Phone, Acc or Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.inputControl} 
                    style={{ height: '42px', width: '100%', paddingLeft: '35px', fontSize: '0.85rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }} 
                    onFocus={(e) => e.target.style.borderColor = '#1756AA'} 
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} 
                  />
                </div>
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ height: '42px', padding: '0 25px', background: 'linear-gradient(135deg, #1756AA 0%, #0d3b7a 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(23, 86, 170, 0.2)', transition: 'all 0.2s' }} 
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }} 
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? <FiLoader className={styles.spin} /> : <FiZap />} Search
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* Stats row if we have results */}
      {results.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '12px 20px', border: '1px solid #E2E8F0', flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Success</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>{stats.success}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '12px 20px', border: '1px solid #E2E8F0', flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Pending</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>{stats.pending}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '12px 20px', border: '1px solid #E2E8F0', flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Failed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>{stats.failed}</div>
          </div>
        </div>
      )}

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={exportHeaders} rows={exportRows} fileNamePrefix="quicksearch_report" sheetName="Report" />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '2200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>#</th>
                <th>DATE & TIME</th>
                <th>ORDER ID</th>
                <th>VENDOR ID</th>
                <th>REF ID</th>
                <th>RRN</th>
                <th>CUSTOMER NAME</th>
                <th>MOBILE</th>
                <th>ACCOUNT NO</th>
                <th>IFSC</th>
                <th>AMOUNT</th>
                <th>SURCHARGE</th>
                <th>COMMISSION</th>
                <th>OPENING BAL</th>
                <th>CLOSING BAL</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center', padding: '40px 0', color: '#718096' }}>
                    <FiLoader className={`${styles.spin} ${styles.loaderIcon}`} size={24} />
                    <div style={{ marginTop: '8px', fontWeight: 600 }}>Searching database records...</div>
                  </td>
                </tr>
              ) : results.length > 0 ? (
                results.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{r.createdDate ? new Date(r.createdDate).toLocaleString('en-IN') : '-'}</td>
                    <td style={{ fontWeight: 700, color: '#0D1B5E' }}>{r.orderId || '-'}</td>
                    <td>{r.vendorId || '-'}</td>
                    <td>{r.refid || '-'}</td>
                    <td>{r.rrn || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{r.customerName || '-'}</td>
                    <td>{r.customerMobile || '-'}</td>
                    <td>{r.accountNo || '-'}</td>
                    <td>{r.ifsc || '-'}</td>
                    <td style={{ fontWeight: 700, color: '#1756AA' }}>₹ {Number(r.amount || 0).toFixed(2)}</td>
                    <td style={{ color: '#EF4444' }}>₹ {Number(r.surcharge || 0).toFixed(2)}</td>
                    <td style={{ color: '#10B981' }}>₹ {Number(r.commission || 0).toFixed(2)}</td>
                    <td>₹ {Number(r.openingBalance || 0).toFixed(2)}</td>
                    <td>₹ {Number(r.closingBalance || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{getStatusBadge(r.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center', padding: '40px 0', color: '#A0AEC0' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No search results found. Try adjusting criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="global-pagination">
            <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="global-page-btn" 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1 || loading}
              >
                <FiChevronLeft />
              </button>
              <button className="global-page-btn global-page-active">{page}</button>
              <button 
                className="global-page-btn" 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === Math.ceil(totalItems / pageSize) || loading}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSearch;
