import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAEPSWalletList,
  updateAEPSWalletFilters,
  setAEPSWalletSearchQuery,
  setAEPSWalletRowsPerPage,
  setAEPSWalletCurrentPage
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import { API } from '../../../../api/endpoints';
import { resolveMemberId, getLoginId } from '../../../../utils/memberIdentity';
import { getSession } from '../../../../utils/authUtils';
import { formatLedgerDate } from '../../../../models/walletLedgerModel';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import { FiSearch } from 'react-icons/fi';
import styles from './AEPSReport.module.css';

const AEPSWalletHistory = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [memberOptions, setMemberOptions] = useState([]);

  const { list, filters, searchQuery, rowsPerPage, currentPage } =
    useSelector(state => state.report.aepsWalletReport);

  // ── Load member dropdown (always) ──
  useEffect(() => {
    API.member.getAll({ pageNumber: 1, pageSize: 5000 })
      .then(res => {
        const items = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setMemberOptions([
          { value: '', label: 'All Members' },
          ...(Array.isArray(items) ? items : []).map(m => {
            const name = m.name || m.fullName || m.memberName || m.ownerName || m.firmName || '';
            const loginId = m.memberID || m.memberid || m.loginID || m.loginId || m.username || String(m.id || m.msrno || '');
            return { value: String(m.id || m.msrno), label: name ? `${name} (${loginId})` : loginId };
          })
        ]);
      })
      .catch(err => console.warn('AEPSWallet: member list failed', err));
  }, []);

  // ── Load AEPS wallet ledger ──
  const loadHistory = useCallback(async (overrideFilters) => {
    setIsLoading(true);
    setApiError('');
    const f = overrideFilters || filters;
    try {
      const defaultMemberId = await resolveMemberId();
      const queryMemberId = f.memberId || defaultMemberId || undefined;
      console.log('[AEPSWalletHistory] memberId:', queryMemberId, 'filters:', f);

      const { items } = await API.walletLedger.getAepsLedger({
        memberId: queryMemberId,
        pageNumber: 1,
        pageSize: 1000,
        fromDate: f.fromDate || '',
        toDate:   f.toDate   || ''
      });

      console.log('[AEPSWalletHistory] rows received:', items.length);

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
        setApiError(`No AEPS wallet records found${queryMemberId ? ` for member ${queryMemberId}` : ''}. Try selecting a member or changing date range.`);
      }

      dispatch(setAEPSWalletList(items.map(r => {
        // Normalize factor: API sends CR/DR or isCredit bool
        const rawFactor = r.factor || (r.isCredit ? 'CR' : 'DR');
        const factor = String(rawFactor).toUpperCase().includes('CR') ? 'CR' : 'DR';
        return {
          ...r,
          member:     r.loginId || myLoginId,
          name:       r.memberName || myName || '-',
          opening:    (r.openingBalance || 0).toFixed(2),
          amount:     (r.amount || 0).toFixed(2),
          factor,
          commission: (r.commission || 0).toFixed(2),
          gst:        (r.gst || 0).toFixed(2),
          tds:        (r.tds || 0).toFixed(2),
          charge:     (r.charge || 0).toFixed(2),
          closing:    (r.balance || 0).toFixed(2),
          date:       formatLedgerDate(r.createdDate),
          desc:       r.narration || r.description || '-',
          status:     r.status || 'SUCCESS'
        };
      })));
    } catch (err) {
      console.error('[AEPSWalletHistory] failed:', err);
      const msg = err?.response?.data?.mess || err?.message || 'API error';
      setApiError(`Failed to load AEPS wallet: ${msg}`);
      dispatch(setAEPSWalletList([]));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  // Initial load
  useEffect(() => { loadHistory(); }, []); // eslint-disable-line

  const lower = v => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.name).includes(lower(searchQuery)) ||
    lower(item.desc).includes(lower(searchQuery))
  );

  const displayColumns = ['#', 'Member', 'Opening Bal', 'Amount', 'Cr / Dr', 'Commission', 'GST', 'TDS', 'Closing Bal', 'Narration', 'Date'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="AEPS EWALLET SUMMARY"
        topContent={
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8EDF5' }}>
            <form onSubmit={e => { e.preventDefault(); loadHistory(filters); }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>

                {/* From Date */}
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>From Date</label>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={filters.fromDate}
                    onChange={e => dispatch(updateAEPSWalletFilters({ fromDate: e.target.value }))}
                    onFocus={() => setFocusedField('fromDate')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingLeft: 12, paddingRight: 12, height: 38, borderRadius: 10, fontSize: '0.825rem', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23,86,170,0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }}
                  />
                </div>

                {/* To Date */}
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>To Date</label>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={filters.toDate}
                    onChange={e => dispatch(updateAEPSWalletFilters({ toDate: e.target.value }))}
                    onFocus={() => setFocusedField('toDate')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingLeft: 12, paddingRight: 12, height: 38, borderRadius: 10, fontSize: '0.825rem', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23,86,170,0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }}
                  />
                </div>

                {/* Member */}
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Member</label>
                  <SearchableSelect
                    options={memberOptions}
                    value={filters.memberId}
                    onChange={val => dispatch(updateAEPSWalletFilters({ memberId: val || '' }))}
                    placeholder="All Members"
                  />
                </div>

                {/* Search Button */}
                <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ width: '100%', height: 38, background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(23,86,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                  >
                    <FiSearch size={14} />
                    {isLoading ? 'Loading…' : 'Search'}
                  </button>
                </div>

              </div>
            </form>
            {apiError && (
              <div style={{ margin: '10px 0 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>
                ⚠️ {apiError}
              </div>
            )}
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id || index}>
            <td style={{ width: 40, color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem' }}>
              {(currentPage - 1) * rowsPerPage + index + 1}
            </td>
            <td style={{ minWidth: 140 }}>
              <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{item.name || 'N/A'}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.member || ''}</div>
            </td>
            <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>₹{item.opening}</td>
            <td style={{ fontWeight: 800, color: '#0D1B3E', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>₹{item.amount}</td>
            <td style={{ width: 70 }}>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                background: item.factor === 'Credit' ? '#D1FAE5' : '#FEE2E2',
                color: item.factor === 'Credit' ? '#065F46' : '#991B1B'
              }}>{item.factor}</span>
            </td>
            <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.commission}</td>
            <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.gst}</td>
            <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>₹{item.tds}</td>
            <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>₹{item.closing}</td>
            <td style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={item.desc}>{item.desc}</td>
            <td style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap' }}>{item.date}</td>
          </tr>
        )}
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

export default AEPSWalletHistory;
