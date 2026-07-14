import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRechargeList, 
  updateRechargeFilters, 
  setRechargeSearchQuery, 
  setRechargeRowsPerPage, 
  setRechargeCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const RechargeHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.rechargeReport);

  useEffect(() => {
    dispatch(setRechargeList([]));
  }, [dispatch]);

  const filteredList = list.filter(item => item.number.includes(searchQuery) || item.txnId.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={styles.container}>
      <AdminTable
        title="RECHARGE HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.filterRow}>
                <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateRechargeFilters({fromDate: e.target.value}))} /></div>
                <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateRechargeFilters({toDate: e.target.value}))} /></div>
              </div>
              <div className={styles.filterRow}>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select className={styles.inputControl} value={filters.status} onChange={(e) => dispatch(updateRechargeFilters({status: e.target.value}))}>
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
                  <button className={styles.submitBtn}>Apply Filters</button>
                </div>
              </div>
            </div>
          </div>
        }
        columns={['#', 'DATE & TIME', 'MOBILE NUMBER', 'OPERATOR', 'AMOUNT', 'COMMISSION', 'TXN ID', 'STATUS', 'RECEIPT']}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{item.date}</td>
            <td style={{ fontWeight: 700, color: '#1756AA' }}>{item.number}</td>
            <td>{item.operator}</td>
            <td style={{ fontWeight: 800 }}>₹{item.amount}</td>
            <td style={{ color: '#27AE60', fontWeight: 700 }}>₹{item.commission}</td>
            <td style={{ fontFamily: 'monospace' }}>{item.txnId}</td>
            <td><span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>{item.status}</span></td>
            <td><button style={{ background: '#F1F5F9', color: '#1756AA', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Receipt</button></td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setRechargeSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setRechargeRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setRechargeCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default RechargeHistory;
