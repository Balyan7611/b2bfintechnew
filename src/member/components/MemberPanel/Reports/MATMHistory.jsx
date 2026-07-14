import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setMATMList, 
  updateMATMFilters, 
  setMATMSearchQuery, 
  setMATMRowsPerPage, 
  setMATMCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const MATMHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.matmReport);

  useEffect(() => {
    dispatch(setMATMList([]));
  }, [dispatch]);

  const filteredList = list.filter(item => item.txnId.toLowerCase().includes(searchQuery.toLowerCase()) || item.cardNo.includes(searchQuery));

  return (
    <div className={styles.container}>
      <AdminTable
        title="MATM HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateMATMFilters({fromDate: e.target.value}))} /></div>
              <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateMATMFilters({toDate: e.target.value}))} /></div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.inputControl} value={filters.status} onChange={(e) => dispatch(updateMATMFilters({status: e.target.value}))}>
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <button className={styles.submitBtn}>Apply Filters</button>
            </div>
          </div>
        }
        columns={['#', 'DATE & TIME', 'DEVICE ID', 'TYPE', 'CARD NUMBER', 'AMOUNT', 'TXN ID', 'STATUS', 'RECEIPT']}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{item.date}</td>
            <td style={{ fontWeight: 700 }}>{item.deviceId}</td>
            <td>{item.type}</td>
            <td>{item.cardNo}</td>
            <td style={{ fontWeight: 800 }}>₹{item.amount}</td>
            <td style={{ fontFamily: 'monospace' }}>{item.txnId}</td>
            <td><span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>{item.status}</span></td>
            <td><button style={{ background: '#F1F5F9', color: '#1756AA', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>View</button></td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setMATMSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setMATMRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setMATMCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default MATMHistory;
