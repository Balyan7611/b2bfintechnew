import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
import styles from './AEPSReport.module.css';

const AEPSWalletHistory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    list,
    filters,
    searchQuery,
    rowsPerPage,
    currentPage
  } = useSelector(state => state.report.aepsWalletReport);

  // Loads the logged-in member's own AEPS wallet movements.
  const loadHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const memberId = await resolveMemberId();
      if (!memberId) {
        console.warn('AEPSWalletHistory: could not resolve member id');
        dispatch(setAEPSWalletList([]));
        return;
      }
      // WalletTypeId 2 = AEPS wallet ledger.
      const { items } = await API.walletLedger.getAepsLedger({
        memberId,
        pageNumber: 1,
        pageSize: 500,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || ''
      });
      console.log('[AEPSWalletHistory] memberId', memberId, '->', items.length, 'ledger row(s)', items);

      // Always the logged-in member's own ledger — fall back to the session's
      // name/login id when the API doesn't echo the member back.
      const session = getSession();
      const myName = session?.name || session?.fullName || '';
      const myLoginId = getLoginId();

      // This table uses member/name/desc/charge/status column names.
      dispatch(setAEPSWalletList(items.map(r => ({
        id: r.id,
        member: r.loginId || myLoginId || r.msrno || memberId,
        name: r.memberName || myName || r.loginId || myLoginId || '-',
        opening: r.openingBalance.toFixed(2),
        amount: r.amount.toFixed(2),
        factor: r.isCredit ? 'Credit' : 'Debit',
        commission: r.commission.toFixed(2),
        tds: r.tds.toFixed(2),
        charge: r.charge.toFixed(2),
        closing: r.balance.toFixed(2),
        date: formatLedgerDate(r.createdDate),
        desc: r.description || r.narration || '-',
        status: r.status || 'SUCCESS'
      }))));
    } catch (err) {
      console.error('AEPSWalletHistory: failed to load', err);
      dispatch(setAEPSWalletList([]));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const lower = (v) => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.name).includes(lower(searchQuery)) ||
    lower(item.desc).includes(lower(searchQuery))
  );

  const columns = [
    'SNO', 'MEMBER ID', 'MEMBER NAME', 'OPENING BALANCE', 'AMOUNT', 
    'FACTOR', 'COMMISSION', 'TDS', 'CHARGE', 'CLOSING BALANCE', 
    'DATE', 'DESCRIPTION', 'STATUS'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="AEPS EWALLET SUMMARY"
        topContent={
          !isApiPanel ? (
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updateAEPSWalletFilters({fromDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updateAEPSWalletFilters({toDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member ID :</label>
                <select className={styles.inputControl} name="memberId" value={filters.memberId} onChange={(e) => dispatch(updateAEPSWalletFilters({memberId: e.target.value}))}>
                  <option value="">Select Member</option>
                  <option value="RT1236">Sachin Balyan (RT1236)</option>
                </select>
              </div>
              <button className={styles.submitBtn} disabled={isLoading} onClick={loadHistory}>{isLoading ? 'Loading...' : 'Filter Records'}</button>
            </div>
          </div>
          ) : null
        }
        columns={columns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{fontWeight: 700, color: '#1756AA'}}>{item.member}</td>
            <td style={{fontWeight: 600}}>{item.name}</td>
            <td>₹{item.opening}</td>
            <td style={{fontWeight: '800', color: item.factor === 'Credit' ? '#27ae60' : '#e74c3c'}}>
              {item.factor === 'Credit' ? '+' : '-'}{item.amount}
            </td>
            <td>
               <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: item.factor === 'Credit' ? '#DCFCE7' : '#FEE2E2', color: item.factor === 'Credit' ? '#16A34A' : '#DC2626' }}>
                {String(item.factor || '').toUpperCase()}
               </span>
            </td>
            <td style={{color: '#27AE60', fontWeight: 700}}>₹{item.commission}</td>
            <td>₹{item.tds}</td>
            <td>₹{item.charge}</td>
            <td style={{fontWeight: 800}}>₹{item.closing}</td>
            <td style={{fontSize: '0.8rem', color: '#4E6080'}}>{item.date}</td>
            <td style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#718096'}} title={item.desc}>
              {item.desc}
            </td>
            <td>
              <span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>
                {item.status}
              </span>
            </td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setAEPSWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setAEPSWalletRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setAEPSWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default AEPSWalletHistory;

