import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMainWalletList,
  updateMainWalletFilters,
  setMainWalletSearchQuery,
  setMainWalletRowsPerPage,
  setMainWalletCurrentPage
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import { API } from '../../../../api/endpoints';
import { resolveMemberId, getLoginId } from '../../../../utils/memberIdentity';
import { getSession } from '../../../../utils/authUtils';
import { formatLedgerDate } from '../../../../models/walletLedgerModel';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import styles from './AEPSReport.module.css';

const MainWalletHistory = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [memberOptions, setMemberOptions] = useState([]);

  const { list, filters, searchQuery, rowsPerPage, currentPage } =
    useSelector(state => state.report.mainWalletReport);

  // ── Load member dropdown (always, not just for api panel) ──
  useEffect(() => {
    API.member.getAll({ pageNumber: 1, pageSize: 5000 })
      .then(res => {
        const items = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setMemberOptions(
          (Array.isArray(items) ? items : []).map(m => {
            const name = m.name || m.fullName || m.memberName || m.ownerName || m.firmName || '';
            const loginId = m.memberID || m.memberid || m.loginID || m.loginId || m.username || String(m.id || m.msrno || '');
            return { value: String(m.id || m.msrno), label: name ? `${name} (${loginId})` : loginId };
          })
        );
      })
      .catch(err => console.warn('MainWallet: member list failed', err));
  }, []);

  // ── Load wallet ledger ──
  const loadHistory = useCallback(async (overrideFilters) => {
    setIsLoading(true);
    setApiError('');
    const f = overrideFilters || filters;
    try {
      const defaultMemberId = await resolveMemberId();
      const queryMemberId = f.memberId || defaultMemberId || undefined;
      console.log('[MainWalletHistory] memberId:', queryMemberId, 'filters:', f);

      const { items } = await API.walletLedger.getMainLedger({
        memberId: queryMemberId,
        pageNumber: 1,
        pageSize: 1000,
        fromDate: f.fromDate || '',
        toDate:   f.toDate   || ''
      });

      console.log('[MainWalletHistory] rows received:', items.length);

      const session = getSession();
      let myName    = session?.name || session?.fullName || '';
      let myLoginId = getLoginId() || String(queryMemberId || '');

      if (queryMemberId) {
        try {
          const res = await API.member.getById(queryMemberId);
          const m = res?.data?.data || res?.data || res || {};
          myName    = m.name || m.fullName || m.memberName || m.ownerName || myName;
          myLoginId = m.memberID || m.memberid || m.loginID || m.loginId || myLoginId;
        } catch (e) {}
      }

      if (items.length === 0) {
        setApiError(`No records found${queryMemberId ? ` for member ID ${queryMemberId}` : ''}. Check date filters or try Search.`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  // Initial load
  useEffect(() => { loadHistory(); }, []);   // eslint-disable-line

  const lower = v => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.narration).includes(lower(searchQuery)) ||
    lower(item.member).includes(lower(searchQuery))
  );

  const displayColumns = ['#', 'Member', 'Service', 'Operator', 'Opening Bal', 'Amount', 'CR / DR', 'Surcharge', 'GST', 'TDS', 'Commission', 'Closing Bal', 'Narration', 'Date'];

  return (
    <div className={`${styles.container} ${styles.compactTableContainer}`}>
      <AdminTable
        title="E-WALLET HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl}
                  value={filters.fromDate}
                  onChange={e => dispatch(updateMainWalletFilters({ fromDate: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl}
                  value={filters.toDate}
                  onChange={e => dispatch(updateMainWalletFilters({ toDate: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member</label>
                <SearchableSelect
                  options={memberOptions}
                  value={filters.memberId}
                  onChange={val => dispatch(updateMainWalletFilters({ memberId: val }))}
                  placeholder="All / Select Member"
                />
              </div>
              <button className={styles.submitBtn} disabled={isLoading}
                onClick={() => loadHistory(filters)}>
                {isLoading ? 'Loading...' : 'Search'}
              </button>
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
        renderRow={(item, index) => (
          <tr key={item.id || index}>
            {/* # */}
            <td style={{ width: 40, color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center' }}>
              {(currentPage - 1) * rowsPerPage + index + 1}
            </td>

            {/* Member */}
            <td style={{ minWidth: 130 }}>
              <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{item.memberName || 'N/A'}</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.memberMobile || item.member || ''}</div>
            </td>

            {/* Service */}
            <td style={{ fontSize: '0.78rem', color: '#334155', whiteSpace: 'nowrap', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={item.serviceName}>
              {item.serviceName !== '-' ? (
                <span style={{ background: '#eff6ff', color: '#1756AA', borderRadius: 5, padding: '2px 7px', fontSize: '0.7rem', fontWeight: 600 }}>
                  {item.serviceName}
                </span>
              ) : <span style={{ color: '#cbd5e1' }}>—</span>}
            </td>

            {/* Operator */}
            <td style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={item.operatorName}>
              {item.operatorName !== '-' ? item.operatorName : <span style={{ color: '#cbd5e1' }}>—</span>}
            </td>

            {/* Opening */}
            <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>₹{item.opening}</td>

            {/* Amount — DR red, CR green */}
            <td style={{ whiteSpace: 'nowrap' }}>
              <span style={{
                fontWeight: 800, fontSize: '0.88rem',
                color: item.factor === 'CR' ? '#15803d' : '#dc2626',
              }}>
                {item.factor === 'CR' ? '+' : '-'}₹{item.amount}
              </span>
            </td>

            {/* CR / DR badge */}
            <td style={{ width: 60, textAlign: 'center' }}>
              <span style={{
                display: 'inline-block', padding: '2px 9px', borderRadius: 20,
                fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.5px',
                background: item.factor === 'CR' ? '#dcfce7' : '#fee2e2',
                color:      item.factor === 'CR' ? '#15803d' : '#991b1b',
                border:     item.factor === 'CR' ? '1px solid #86efac' : '1px solid #fca5a5',
              }}>{item.factor}</span>
            </td>

            {/* Surcharge / GST / TDS / Commission */}
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.surcharge}</td>
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.gst}</td>
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.tds}</td>
            <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.commission}</td>

            {/* Closing */}
            <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>₹{item.closing}</td>

            {/* Narration */}
            <td style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={item.narration}>{item.narration}</td>

            {/* Date */}
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
