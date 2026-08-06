import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch } from 'react-icons/fi';
import {
  setAEPSWalletList,
  updateAEPSWalletFilters,
  setAEPSWalletSearchQuery,
  setAEPSWalletRowsPerPage,
  setAEPSWalletCurrentPage
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { API } from '../../../api/endpoints';
import { WalletLedgerResponseModel, formatLedgerDate } from '../../../models/walletLedgerModel';
import styles from './AEPSReport.module.css';

const AEPSWalletReport = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError,  setApiError]  = useState('');
  const [memberOptions, setMemberOptions] = useState([]);

  const { list, filters, searchQuery, rowsPerPage, currentPage } =
    useSelector(state => state.report.aepsWalletReport);

  // ── Member dropdown ──
  useEffect(() => {
    API.member.getAll({ pageNumber: 1, pageSize: 5000 })
      .then(res => {
        const raw   = res?.data?.items || res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
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
      .catch(err => console.warn('[AdminAEPSWallet] member list failed', err));
  }, []);

  // ── Fetch AEPS wallet ledger ──
  const loadHistory = useCallback(async (f = filters) => {
    setIsLoading(true);
    setApiError('');
    try {
      const params = {
        walletTypeId: 2,
        pageNumber: 1,
        pageSize: 1000,
        ...(f.memberId && { memberId: f.memberId }),
        ...(f.fromDate && { fromDate: f.fromDate }),
        ...(f.toDate   && { toDate:   f.toDate   }),
      };
      const res   = await API.walletLedger.getAepsLedger(params);
      const items = WalletLedgerResponseModel(res);
      if (items.length === 0) {
        setApiError('No AEPS wallet records found. Try changing date range or selecting a member.');
      }
      dispatch(setAEPSWalletList(items.map(r => ({
        ...r,
        member:     r.loginId    || '',
        name:       r.memberName || '',
        opening:    (r.openingBalance || 0).toFixed(2),
        amount:     (r.amount        || 0).toFixed(2),
        factor:     String(r.factor || '').toUpperCase().includes('CR') ? 'CR' : 'DR',
        commission: (r.commission || 0).toFixed(2),
        gst:        (r.gst        || 0).toFixed(2),
        tds:        (r.tds        || 0).toFixed(2),
        closing:    (r.balance    || 0).toFixed(2),
        date:       formatLedgerDate(r.createdDate),
        desc:       r.narration   || r.description || '-',
        status:     r.status      || 'SUCCESS',
      }))));
    } catch (err) {
      console.error('[AdminAEPSWallet] fetch failed:', err);
      const msg = err?.response?.data?.mess || err?.message || 'API error';
      setApiError(`Failed to load AEPS wallet: ${msg}`);
      dispatch(setAEPSWalletList([]));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  useEffect(() => { loadHistory(); }, []); // eslint-disable-line

  const lower = v => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.name).includes(lower(searchQuery)) ||
    lower(item.desc).includes(lower(searchQuery))
  );

  const columns = ['#', 'Member', 'Opening', 'Amount', 'CR/DR', 'Commission', 'GST', 'TDS', 'Closing', 'Narration', 'Date'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="AEPS EWALLET SUMMARY"
        icon={<FiFilter />}
        topContent={
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8EDF5' }}>
            <form onSubmit={e => { e.preventDefault(); loadHistory(filters); }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                <div className={styles.formGroup}>
                  <label>From Date</label>
                  <input type="date" className={styles.inputControl}
                    value={filters.fromDate}
                    onChange={e => dispatch(updateAEPSWalletFilters({ fromDate: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>To Date</label>
                  <input type="date" className={styles.inputControl}
                    value={filters.toDate}
                    onChange={e => dispatch(updateAEPSWalletFilters({ toDate: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Member</label>
                  <SearchableSelect
                    options={memberOptions}
                    value={filters.memberId}
                    onChange={val => dispatch(updateAEPSWalletFilters({ memberId: val || '' }))}
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
              <td style={{ minWidth: 140 }}>
                <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{item.name || 'N/A'}</div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.member || ''}</div>
              </td>
              <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>₹{item.opening}</td>
              <td>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isCr ? '#15803d' : '#dc2626' }}>
                  {isCr ? '+' : '-'}₹{item.amount}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: isCr ? '#D1FAE5' : '#FEE2E2', color: isCr ? '#065F46' : '#991B1B' }}>
                  {item.factor}
                </span>
              </td>
              <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.commission}</td>
              <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.gst}</td>
              <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.tds}</td>
              <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>₹{item.closing}</td>
              <td style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.desc}>{item.desc}</td>
              <td style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap' }}>{item.date}</td>
            </tr>
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={val => dispatch(setAEPSWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={val => { dispatch(setAEPSWalletRowsPerPage(val)); dispatch(setAEPSWalletCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={val => dispatch(setAEPSWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage) || 1}
      />
    </div>
  );
};

export default AEPSWalletReport;
