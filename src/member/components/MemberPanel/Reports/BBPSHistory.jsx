import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setBBPSList, 
  updateBBPSFilters, 
  setBBPSSearchQuery, 
  setBBPSRowsPerPage, 
  setBBPSCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const BBPSHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.bbpsReport);

  useEffect(() => {
    dispatch(setBBPSList([]));
  }, [dispatch]);

  const filteredList = list.filter(item => item.consumer.toLowerCase().includes(searchQuery.toLowerCase()) || item.txnId.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={styles.container}>
      <AdminTable
        title="BBPS HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateBBPSFilters({fromDate: e.target.value}))} /></div>
              <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateBBPSFilters({toDate: e.target.value}))} /></div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select className={styles.inputControl} value={filters.category} onChange={(e) => dispatch(updateBBPSFilters({category: e.target.value}))}>
                  <option value="">All Categories</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                </select>
              </div>
              <button className={styles.submitBtn}>Apply Filters</button>
            </div>
          </div>
        }
        columns={['#', 'DATE & TIME', 'CONSUMER NAME', 'CATEGORY', 'BILLER', 'AMOUNT', 'TXN ID', 'STATUS', 'RECEIPT']}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{item.date}</td>
            <td style={{ fontWeight: 700 }}>{item.consumer}</td>
            <td>{item.category}</td>
            <td>{item.biller}</td>
            <td style={{ fontWeight: 800 }}>₹{item.amount}</td>
            <td style={{ fontFamily: 'monospace' }}>{item.txnId}</td>
            <td><span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>{item.status}</span></td>
            <td><button style={{ background: '#F1F5F9', color: '#1756AA', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Receipt</button></td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setBBPSSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setBBPSRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setBBPSCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default BBPSHistory;
