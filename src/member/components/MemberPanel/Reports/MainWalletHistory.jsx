import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import {
  setMainWalletList,
  updateMainWalletFilters,
  setMainWalletSearchQuery,
  setMainWalletRowsPerPage,
  setMainWalletCurrentPage
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import { API } from '../../../../api/endpoints';
import { getLoginId, isApiPanel } from '../../../../utils/memberIdentity';
import { resolveReportScopeId } from '../../../../utils/reportScope';
import { getSession } from '../../../../utils/authUtils';
import { formatLedgerDate } from '../../../../models/walletLedgerModel';
import styles from './AEPSReport.module.css';

const MainWalletHistory = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const { list, filters, searchQuery, rowsPerPage, currentPage } =
    useSelector(state => state.report.mainWalletReport);

    const loadHistory = useCallback(async (overrideFilters) => {
    setIsLoading(true);
    setApiError('');
    const f = overrideFilters || filters;
    try {
      // Never accept a member id from the UI, and fail closed if we can't tell
      // who we are — an unscoped ledger query returns other accounts' rows.
      const { id: queryMemberId, error: scopeError } = await resolveReportScopeId();
      if (!queryMemberId) {
        setApiError(scopeError);
        dispatch(setMainWalletList([]));
        return;
      }

      const { items } = await API.walletLedger.getMainLedger({
        memberId: queryMemberId,
        pageNumber: 1,
        pageSize: 1000,
        fromDate: f.fromDate || '',
        toDate:   f.toDate   || ''
      });


      const session = getSession();
      let myName    = session?.name || session?.fullName || '';
      let myLoginId = getLoginId() || String(queryMemberId || '');

      // API-panel accounts live in a different table than Members. Even
      // though queryMemberId is now safely resolved (see resolveReportScopeId),
      // it can still coincidentally equal an unrelated Member's row id in
      // that other table — looking it up here would display THAT member's
      // name on this page instead of the API account's own. So on the API
      // panel we skip this enrichment call and keep the session's own name.
      if (!isApiPanel() && queryMemberId) {
        try {
          const res = await API.member.getById(queryMemberId);
          const m = res?.data?.data || res?.data || res || {};
          myName    = m.name || m.fullName || m.memberName || m.ownerName || myName;
          myLoginId = m.memberID || m.memberid || m.loginID || m.loginId || myLoginId;
        } catch (e) {}
      }

      if (items.length === 0) {
        // no data — empty table will show, no error banner needed
      }

      dispatch(setMainWalletList(items.map(r => {
        const rawFactor = r.factor || (r.isCredit ? 'CR' : 'DR');
        const factor = String(rawFactor).toUpperCase().includes('CR') ? 'CR' : 'DR';
        return {
          ...r,
          member:         r.loginId || myLoginId,
          memberName:     r.memberName || myName,
          memberMobile:   r.memberMobile || '',
          opening:        (r.openingBalance || 0).toFixed(2),
          amount:         (r.amount || 0).toFixed(2),
          factor,
          serviceName:    r.serviceName  || r.service  || '-',
          operatorName:   r.operatorName || r.operator || '-',
          walletTypeName: r.walletTypeName || r.walletType || 'Main Wallet',
          surcharge:      (r.surcharge  || 0).toFixed(2),
          gst:            (r.gst        || 0).toFixed(2),
          tds:            (r.tds        || 0).toFixed(2),
          commission:     (r.commission || 0).toFixed(2),
          closing:        (r.balance    || 0).toFixed(2),
          narration:      r.narration   || r.description || '-',
          date:           formatLedgerDate(r.createdDate)
        };
      })));
    } catch (err) {
      console.error('[MainWalletHistory] failed:', err);
      const msg = err?.response?.data?.mess || err?.message || 'API error';
      setApiError(`Failed to load wallet history: ${msg}`);
      dispatch(setMainWalletList([]));
    } finally {
      setIsLoading(false);
    }
    }, [dispatch, filters]);

    useEffect(() => { loadHistory(); }, []);   
  const lower = v => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    (lower(item.narration).includes(lower(searchQuery)) ||
     lower(item.member).includes(lower(searchQuery))) &&
    (!typeFilter || item.factor === typeFilter)
  );

  const displayColumns = ['#', 'Member', 'Service', 'Operator', 'Opening Bal', 'Amount', 'CR / DR', 'Surcharge', 'GST', 'TDS', 'Commission', 'Closing Bal', 'Narration', 'Date'];

  return (
    <div className={`${styles.container} ${styles.compactTableContainer}`}>
      <AdminTable
        title="E-WALLET HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
              <div className={styles.formGroup} style={{ flex: '1 1 150px', minWidth: '140px' }}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl}
                  value={filters.fromDate}
                  onChange={e => dispatch(updateMainWalletFilters({ fromDate: e.target.value }))} />
              </div>
              <div className={styles.formGroup} style={{ flex: '1 1 150px', minWidth: '140px' }}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl}
                  value={filters.toDate}
                  onChange={e => dispatch(updateMainWalletFilters({ toDate: e.target.value }))} />
              </div>
              <div className={styles.formGroup} style={{ flex: '1 1 130px', minWidth: '120px' }}>
                <label>Type</label>
                <select className={styles.inputControl} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="CR">CR (Credit)</option>
                  <option value="DR">DR (Debit)</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex: '0 0 auto' }}>
                <label style={{ visibility: 'hidden' }}>Search</label>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => loadHistory(filters)}
                  style={{ minWidth: '120px', whiteSpace: 'nowrap', boxSizing: 'border-box', flexShrink: 0, height: '42px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <FiSearch size={14} /> Search
                </button>
              </div>
              <div className={styles.formGroup} style={{ flex: '0 0 auto' }}>
                <label style={{ visibility: 'hidden' }}>Reset</label>
                <button
                  type="button"
                  title="Reset Filters"
                  onClick={() => {
                    dispatch(updateMainWalletFilters({ fromDate: today, toDate: today }));
                    setTypeFilter('');
                    dispatch(setMainWalletSearchQuery(''));
                    dispatch(setMainWalletCurrentPage(1));
                    loadHistory({ fromDate: today, toDate: today });
                  }}
                  style={{ minWidth: '100px', whiteSpace: 'nowrap', boxSizing: 'border-box', flexShrink: 0, padding: '0 14px', height: '42px', background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.color = '#1756AA'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569'; }}
                >
                  <FiRefreshCw size={14} /> Reset
                </button>
              </div>
            </div>

            {apiError && (
              <div style={{ margin: '8px 0 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                ⚠️ {apiError}
              </div>
            )}
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        fileNamePrefix="main_wallet_history"
        exportData={filteredList.map((item, index) => [
          (currentPage - 1) * rowsPerPage + index + 1,
          `${item.memberName || 'N/A'} ${item.memberMobile ? '(' + item.memberMobile + ')' : ''}`.trim(),
          item.serviceName && item.serviceName !== '-' ? item.serviceName : '—',
          item.operatorName && item.operatorName !== '-' ? item.operatorName : '—',
          item.opening || '0.00',
          item.amount || '0.00',
          item.factor || 'N/A',
          item.surcharge || '0.00',
          item.gst || '0.00',
          item.tds || '0.00',
          item.commission || '0.00',
          item.closing || '0.00',
          item.narration || 'N/A',
          item.date || 'N/A',
        ])}
        renderRow={(item, index) => (
          <tr key={item.id || index}>
                        <td style={{ width: 40, color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center' }}>
              {(currentPage - 1) * rowsPerPage + index + 1}
            </td>

                        <td style={{ minWidth: 130 }}>
              <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{item.memberName || 'N/A'}</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.memberMobile || item.member || ''}</div>
            </td>

                        <td style={{ fontSize: '0.78rem', color: '#334155', whiteSpace: 'nowrap', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={item.serviceName}>
              {item.serviceName !== '-' ? (
                <span style={{ background: '#eff6ff', color: '#1756AA', borderRadius: 5, padding: '2px 7px', fontSize: '0.7rem', fontWeight: 600 }}>
                  {item.serviceName}
                </span>
              ) : <span style={{ color: '#cbd5e1' }}>—</span>}
            </td>

                        <td style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={item.operatorName}>
              {item.operatorName !== '-' ? item.operatorName : <span style={{ color: '#cbd5e1' }}>—</span>}
            </td>

                        <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>₹{item.opening}</td>

                        <td style={{ whiteSpace: 'nowrap' }}>
              <span style={{
                fontWeight: 800, fontSize: '0.88rem',
                color: item.factor === 'CR' ? '#15803d' : '#dc2626',
              }}>
                {item.factor === 'CR' ? '+' : '-'}₹{item.amount}
              </span>
            </td>

                        <td style={{ width: 60, textAlign: 'center' }}>
              <span style={{
                display: 'inline-block', padding: '2px 9px', borderRadius: 20,
                fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.5px',
                background: item.factor === 'CR' ? '#dcfce7' : '#fee2e2',
                color:      item.factor === 'CR' ? '#15803d' : '#991b1b',
                border:     item.factor === 'CR' ? '1px solid #86efac' : '1px solid #fca5a5',
              }}>{item.factor}</span>
            </td>

                        <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.surcharge}</td>
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.gst}</td>
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.tds}</td>
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.commission}</td>

                        <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>₹{item.closing}</td>

                        <td style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={item.narration}>{item.narration}</td>

                        <td style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>{item.date}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={val => dispatch(setMainWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={val => { dispatch(setMainWalletRowsPerPage(val)); dispatch(setMainWalletCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={val => dispatch(setMainWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage) || 1}
      />
    </div>
  );
};

export default MainWalletHistory;
