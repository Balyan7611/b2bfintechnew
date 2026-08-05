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
import styles from './AEPSReport.module.css';

const AEPSWalletHistory = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);

  const { list, filters, searchQuery, rowsPerPage, currentPage } =
    useSelector(state => state.report.aepsWalletReport);

  // ── Load member dropdown (always) ──
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
      .catch(err => console.warn('AEPSWallet: member list failed', err));
  }, []);

  // ── Load AEPS wallet ledger ──
  const loadHistory = useCallback(async (overrideFilters) => {
    setIsLoading(true);
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
      let myLoginId = getLoginId() || queryMemberId || '';

      if (queryMemberId) {
        try {
          const res = await API.member.getById(queryMemberId);
          const m = res?.data?.data || res?.data || res || {};
          myName    = m.name || m.fullName || m.memberName || m.ownerName || myName;
          myLoginId = m.memberID || m.memberid || m.loginID || m.loginId || myLoginId;
        } catch (e) {}
      }

      dispatch(setAEPSWalletList(items.map(r => ({
        ...r,
        member:     r.loginId || myLoginId,
        name:       r.memberName || myName || '-',
        opening:    (r.openingBalance || 0).toFixed(2),
        amount:     (r.amount || 0).toFixed(2),
        factor:     r.isCredit ? 'Credit' : 'Debit',
        commission: (r.commission || 0).toFixed(2),
        gst:        (r.gst || 0).toFixed(2),
        tds:        (r.tds || 0).toFixed(2),
        charge:     (r.charge || 0).toFixed(2),
        closing:    (r.balance || 0).toFixed(2),
        date:       formatLedgerDate(r.createdDate),
        desc:       r.narration || r.description || '-',
        status:     r.status || 'SUCCESS'
      }))));
    } catch (err) {
      console.error('[AEPSWalletHistory] failed:', err);
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

  const displayColumns = ['SNO', 'Member', 'Opening', 'Amount', 'Factor', 'Commission', 'GST', 'TDS', 'Closing', 'Narration', 'Date'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="AEPS EWALLET SUMMARY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
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
                  onChange={val => dispatch(updateAEPSWalletFilters({ memberId: val }))}
                  placeholder="All / Select Member"
                />
              </div>
              <button className={styles.submitBtn} disabled={isLoading}
                onClick={() => loadHistory(filters)}>
                {isLoading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id || index}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td>{`${item.name || 'N/A'} (${item.member || 'N/A'})`}</td>
            <td>₹{item.opening}</td>
            <td>₹{item.amount}</td>
            <td>{item.factor}</td>
            <td>₹{item.commission}</td>
            <td>₹{item.gst}</td>
            <td>₹{item.tds}</td>
            <td>₹{item.closing}</td>
            <td>{item.desc}</td>
            <td>{item.date}</td>
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
