import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
import styles from './AEPSReport.module.css';

const MainWalletHistory = () => {
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
  } = useSelector(state => state.report.mainWalletReport);

  // Loads the logged-in member's own Main wallet movements.
  const loadHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const memberId = await resolveMemberId();
      if (!memberId) {
        console.warn('MainWalletHistory: could not resolve member id');
        dispatch(setMainWalletList([]));
        return;
      }
      // WalletTypeId 1 = Main wallet ledger.
      const { items } = await API.walletLedger.getMainLedger({
        memberId,
        pageNumber: 1,
        pageSize: 500,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || ''
      });
      console.log('[MainWalletHistory] memberId', memberId, '->', items.length, 'ledger row(s)', items);

      // This is always the logged-in member's own ledger, so when the API
      // doesn't echo the member back, use the session's own name/login id
      // instead of showing a bare "Member #2".
      const session = getSession();
      const myName = session?.name || session?.fullName || '';
      const myLoginId = getLoginId();
      const meLabel = myName && myLoginId ? `${myName} (${myLoginId})`
        : myName || myLoginId || `Member #${memberId}`;

      dispatch(setMainWalletList(items.map(r => {
        const rowName = r.memberName || myName;
        const rowLoginId = r.loginId || myLoginId;
        const memberLabel = rowName && rowLoginId ? `${rowName} (${rowLoginId})`
          : rowName || rowLoginId || meLabel;

        return {
          id: r.id,
          member: memberLabel,
          opening: r.openingBalance.toFixed(2),
          amount: r.amount.toFixed(2),
          factor: r.isCredit ? 'Credit' : 'Debit',
          surcharge: r.surcharge.toFixed(2),
          gst: r.gst.toFixed(2),
          tds: r.tds.toFixed(2),
          commission: r.commission.toFixed(2),
          closing: r.balance.toFixed(2),
          narration: r.narration || r.description || '-',
          date: formatLedgerDate(r.createdDate)
        };
      })));
    } catch (err) {
      console.error('MainWalletHistory: failed to load', err);
      dispatch(setMainWalletList([]));
    } finally {
      setIsLoading(false);
    }
    // filters are read on demand via the Search button, not as deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const lower = (v) => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.narration).includes(lower(searchQuery)) ||
    lower(item.member).includes(lower(searchQuery))
  );

  const columns = [
    'SL', 'MEMBER DETAILS', 'OPENING AMOUNT', 'AMOUNT', 
    'FACTOR', 'SURCHARGE', 'GST', 'TDS', 'COMMISSION', 
    'CLOSING BALANCE', 'NARRATION', 'TRANSFER DATE'
  ];

  return (
    <div className={`${styles.container} ${styles.compactTableContainer}`}>
      <AdminTable
        title="E-WALLET HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updateMainWalletFilters({fromDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updateMainWalletFilters({toDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member ID :</label>
                <select className={styles.inputControl} name="memberId" value={filters.memberId} onChange={(e) => dispatch(updateMainWalletFilters({memberId: e.target.value}))}>
                  <option value="">Select Member</option>
                  <option value="RT1236">Sachin Balyan (RT1236)</option>
                </select>
              </div>
              <button className={styles.submitBtn} disabled={isLoading} onClick={loadHistory}>
                {isLoading ? 'Loading...' : 'Search History'}
              </button>
            </div>
          </div>
        }
        columns={columns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{fontWeight: 600, color: '#1756AA'}}>{item.member}</td>
            <td style={{fontWeight: 700}}>₹{item.opening}</td>
            <td style={{fontWeight: '800', color: item.factor === 'Credit' ? '#27ae60' : '#e74c3c'}}>
              {item.factor === 'Credit' ? '+' : '-'}{item.amount}
            </td>
            <td>
               <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: item.factor === 'Credit' ? '#DCFCE7' : '#FEE2E2', color: item.factor === 'Credit' ? '#16A34A' : '#DC2626' }}>
                {String(item.factor || '').toUpperCase()}
               </span>
            </td>
            <td>₹{item.surcharge}</td>
            <td>₹{item.gst}</td>
            <td>₹{item.tds}</td>
            <td style={{color: '#27AE60', fontWeight: 700}}>₹{item.commission}</td>
            <td style={{fontWeight: 800}}>₹{item.closing}</td>
            <td style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#718096'}} title={item.narration}>
              {item.narration}
            </td>
            <td style={{color: '#4E6080'}}>{item.date}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setMainWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setMainWalletRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setMainWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default MainWalletHistory;

