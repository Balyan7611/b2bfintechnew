import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch } from 'react-icons/fi';
import {
  setMainWalletList,
  updateMainWalletFilters,
  setMainWalletSearchQuery,
  setMainWalletRowsPerPage,
  setMainWalletCurrentPage
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { API } from '../../../api/endpoints';
import { WalletLedgerResponseModel, formatLedgerDate } from '../../../models/walletLedgerModel';
import styles from './AEPSReport.module.css';

const MainWalletReport = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading]   = useState(false);
  const [apiError,  setApiError]    = useState('');
  const [memberOptions, setMemberOptions] = useState([]);

  const { list, filters, searchQuery, rowsPerPage, currentPage } =
    useSelector(state => state.report.mainWalletReport);

  // ── Member dropdown ──
  useEffect(() => {
    API.member.getAll({ pageNumber: 1, pageSize: 5000 })
      .then(res => {
        const raw = res?.data?.items || res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        const items = Array.isArray(raw) ? raw : [];
        setMemberOptions([
          { value: '', label: 'All Members' },
          ...items.map(m => {
            const name    = m.name || m.fullName || m.memberName || m.ownerName || m.firmName || '';
            const loginId = m.memberID || m.memberid || m.loginID || m.loginId || m.username || String(m.id || m.msrno || '');
            return { value: String(m.id || m.msrno || ''), label: name ? `${name} (${loginId})` : loginId };
          })
        ]);
      })
      .catch(err => console.warn('[AdminMainWallet] member list failed', err));
  }, []);

  // ── Fetch wallet ledger ──
  const loadHistory = useCallback(async (f = filters) => {
    setIsLoading(true);
    setApiError('');
    try {
      const params = {
        walletTypeId: 1,   // Main Wallet
        pageNumber: 1,
        pageSize: 1000,
        ...(f.memberId && { memberId: f.memberId }),
        ...(f.fromDate && { fromDate: f.fromDate }),
        ...(f.toDate   && { toDate:   f.toDate   }),
      };

      const res   = await API.walletLedger.getMainLedger(params);
      const items = WalletLedgerResponseModel(res);

      if (items.length === 0) {
        setApiError('No records found. Try changing date range or selecting a member.');
      }

      dispatch(setMainWalletList(items.map(r => ({
        ...r,
        member:         r.loginId   || '',
        memberName:     r.memberName || '',
        memberMobile:   r.memberMobile || '',
        opening:        (r.openingBalance || 0).toFixed(2),
        amount:         (r.amount        || 0).toFixed(2),
        factor:         String(r.factor || '').toUpperCase().includes('CR') ? 'CR' : 'DR',
        serviceName:    r.serviceName  || r.service  || '-',
        operatorName:   r.operatorName || r.operator || '-',
        surcharge:      (r.surcharge  || 0).toFixed(2),
        gst:            (r.gst        || 0).toFixed(2),
        tds:            (r.tds        || 0).toFixed(2),
        commission:     (r.commission || 0).toFixed(2),
        closing:        (r.balance    || 0).toFixed(2),
        narration:      r.narration   || r.description || '-',
        date:           formatLedgerDate(r.createdDate),
      }))));
    } catch (err) {
      console.error('[AdminMainWallet] fetch failed:', err);
      const msg = err?.response?.data?.mess || err?.message || 'API error';
      setApiError(`Failed to load wallet: ${msg}`);
      dispatch(setMainWalletList([]));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  useEffect(() => { loadHistory(); }, []); // eslint-disable-line

  const lower = v => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.memberName).includes(lower(searchQuery)) ||
    lower(item.member).includes(lower(searchQuery))     ||
    lower(item.narration).includes(lower(searchQuery))
  );

  const columns = [
    '#', 'Member', 'Service', 'Operator',
    'Opening', 'Amount', 'CR/DR',
    'Surcharge', 'GST', 'TDS', 'Commission',
    'Closing', 'Narration', 'Date'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="E-WALLET HISTORY"
        icon={<FiFilter />}
        topContent={
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8EDF5' }}>
            <form onSubmit={e => { e.preventDefault(); loadHistory(filters); }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
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
                    onChange={val => dispatch(updateMainWalletFilters({ memberId: val || '' }))}
                    placeholder="All Members"
                  />
                </div>
                <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" disabled={isLoading}
                    style={{ width: '100%', height: 38, background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <FiSearch size={14} />
                    {isLoading ? 'Loading…' : 'Search'}
                  </button>
                </div>
              </div>
            </form>
            {apiError && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                ⚠️ {apiError}
              </div>
            )}
          </div>
        }
        columns={columns}
        data={filteredList}
        renderRow={(item, index) => {
          const isCr = item.factor === 'CR';
          return (
            <tr key={item.id || index}>
              <td style={{ width: 40, color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center' }}>
                {(currentPage - 1) * rowsPerPage + index + 1}
              </td>
              <td style={{ minWidth: 130 }}>
                <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{item.memberName || 'N/A'}</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.member || ''}</div>
              </td>
              <td>
                {item.serviceName !== '-'
                  ? <span style={{ background: '#eff6ff', color: '#1756AA', borderRadius: 5, padding: '2px 7px', fontSize: '0.7rem', fontWeight: 600 }}>{item.serviceName}</span>
                  : <span style={{ color: '#cbd5e1' }}>—</span>}
              </td>
              <td style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap' }}>
                {item.operatorName !== '-' ? item.operatorName : <span style={{ color: '#cbd5e1' }}>—</span>}
              </td>
              <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>₹{item.opening}</td>
              <td>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isCr ? '#15803d' : '#dc2626' }}>
                  {isCr ? '+' : '-'}₹{item.amount}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800, background: isCr ? '#dcfce7' : '#fee2e2', color: isCr ? '#15803d' : '#991b1b', border: isCr ? '1px solid #86efac' : '1px solid #fca5a5' }}>
                  {item.factor}
                </span>
              </td>
              <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.surcharge}</td>
              <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.gst}</td>
              <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.tds}</td>
              <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.commission}</td>
              <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>₹{item.closing}</td>
              <td style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.narration}>{item.narration}</td>
              <td style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>{item.date}</td>
            </tr>
          );
        }}
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

export default MainWalletReport;
