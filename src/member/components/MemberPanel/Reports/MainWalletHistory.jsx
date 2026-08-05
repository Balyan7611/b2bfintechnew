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
      let myLoginId = getLoginId() || queryMemberId || '';

      if (queryMemberId) {
        try {
          const res = await API.member.getById(queryMemberId);
          const m = res?.data?.data || res?.data || res || {};
          myName    = m.name || m.fullName || m.memberName || m.ownerName || myName;
          myLoginId = m.memberID || m.memberid || m.loginID || m.loginId || myLoginId;
        } catch (e) {}
      }

      dispatch(setMainWalletList(items.map(r => ({
        ...r,
        member:    r.loginId || myLoginId,
        memberName: r.memberName || myName,
        opening:   (r.openingBalance || 0).toFixed(2),
        amount:    (r.amount || 0).toFixed(2),
        factor:    r.isCredit ? 'Credit' : 'Debit',
        surcharge: (r.surcharge || 0).toFixed(2),
        gst:       (r.gst || 0).toFixed(2),
        tds:       (r.tds || 0).toFixed(2),
        commission:(r.commission || 0).toFixed(2),
        closing:   (r.balance || 0).toFixed(2),
        narration: r.narration || r.description || '-',
        date:      formatLedgerDate(r.createdDate)
      }))));
    } catch (err) {
      console.error('[MainWalletHistory] failed:', err);
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

  const displayColumns = ['SL', 'Member Details', 'Opening', 'Amount', 'Factor', 'Surcharge', 'GST', 'TDS', 'Commission', 'Closing', 'Narration', 'Date'];

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
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id || index}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td>{`${item.memberName || 'N/A'} (${item.member || 'N/A'})`}</td>
            <td>₹{item.opening}</td>
            <td>₹{item.amount}</td>
            <td>{item.factor}</td>
            <td>₹{item.surcharge}</td>
            <td>₹{item.gst}</td>
            <td>₹{item.tds}</td>
            <td>₹{item.commission}</td>
            <td>₹{item.closing}</td>
            <td>{item.narration}</td>
            <td>{item.date}</td>
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
