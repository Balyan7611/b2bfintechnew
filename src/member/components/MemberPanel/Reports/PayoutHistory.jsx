import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setPayoutList, 
  updatePayoutFilters, 
  setPayoutSearchQuery, 
  setPayoutRowsPerPage, 
  setPayoutCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const PayoutHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.payoutReport);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [viewDetailMode, setViewDetailMode] = useState(false);

  useEffect(() => {
    const dummyData = [
      { id: 1, date: '2026-05-01 12:30', memberId: 'RT1236', name: 'Sachin Balyan', bank: 'HDFC', accNo: '501000123456', amount: '2000.00', charges: '10.00', total: '2010.00', status: 'SUCCESS', txnId: 'TXN847294819', utr: 'HDF102938475', remarks: 'IMPS Payout' },
    ];
    dispatch(setPayoutList(dummyData));
  }, [dispatch]);

  const filteredList = list.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.accNo.includes(searchQuery));

  return (
    <div className={styles.container}>
      {!viewDetailMode ? (
        <AdminTable
          title="PAYOUT HISTORY"
          topContent={
            <div className={styles.filterSection}>
              <div className={styles.filterRow}>
                <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updatePayoutFilters({fromDate: e.target.value}))} /></div>
                <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updatePayoutFilters({toDate: e.target.value}))} /></div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select className={styles.inputControl} name="status" value={filters.status} onChange={(e) => dispatch(updatePayoutFilters({status: e.target.value}))}>
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <button className={styles.submitBtn}>Apply Filters</button>
              </div>
            </div>
          }
          columns={['#', 'DATE & TIME', 'MEMBER NAME', 'BANK NAME', 'ACCOUNT NO', 'AMOUNT', 'CHARGES', 'TOTAL', 'STATUS', 'RECEIPT']}
          data={filteredList}
          renderRow={(item, index) => (
            <tr key={item.id}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{item.date}</td>
              <td style={{ fontWeight: 600 }}>{item.name}</td>
              <td>{item.bank}</td>
              <td style={{ fontWeight: 700 }}>{item.accNo}</td>
              <td style={{ fontWeight: 700 }}>₹{item.amount}</td>
              <td style={{ color: '#E74C3C' }}>₹{item.charges}</td>
              <td style={{ fontWeight: 800 }}>₹{item.total}</td>
              <td><span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>{item.status}</span></td>
              <td>
                <button 
                  className={styles.viewReceiptBtn}
                  onClick={() => {
                    setSelectedTxn(item);
                    setViewDetailMode(true);
                  }}
                >
                  View Detail
                </button>
              </td>
            </tr>
          )}
          searchQuery={searchQuery}
          onSearchChange={(val) => dispatch(setPayoutSearchQuery(val))}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => dispatch(setPayoutRowsPerPage(val))}
          currentPage={currentPage}
          onPageChange={(val) => dispatch(setPayoutCurrentPage(val))}
          totalEntries={filteredList.length}
          totalPages={Math.ceil(filteredList.length / rowsPerPage)}
        />
      ) : (
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <button className={styles.backBtn} onClick={() => setViewDetailMode(false)}>
              &larr; Back to History
            </button>
            <h2 className={styles.detailTitle}>Payout Details</h2>
            <button className={styles.printBtn} onClick={() => window.print()}>
              Print Receipt
            </button>
          </div>
          
          {selectedTxn && (
            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction ID</span>
                <span className={styles.detailValue}>{selectedTxn.txnId || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>UTR / Ref Number</span>
                <span className={styles.detailValue}>{selectedTxn.utr || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Date</span>
                <span className={styles.detailValue}>{selectedTxn.date || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Status</span>
                <span className={`${styles.statusBadge} ${selectedTxn.status === 'SUCCESS' ? styles.statusSuccess : selectedTxn.status === 'FAILED' ? styles.statusFailed : styles.statusPending}`}>
                  {selectedTxn.status || 'PENDING'}
                </span>
              </div>
              
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Member ID</span>
                <span className={styles.detailValue} style={{color: '#1756AA'}}>{selectedTxn.memberId || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Member Name</span>
                <span className={styles.detailValue}>{selectedTxn.name || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Bank Name</span>
                <span className={styles.detailValue}>{selectedTxn.bank || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Account Number</span>
                <span className={styles.detailValue}>{selectedTxn.accNo || '-'}</span>
              </div>
              
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Payout Amount</span>
                <span className={styles.detailValue} style={{fontSize: '1.2rem', fontWeight: 800}}>₹{selectedTxn.amount || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Charges</span>
                <span className={styles.detailValue} style={{color: '#E74C3C'}}>₹{selectedTxn.charges || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Total Deducted</span>
                <span className={styles.detailValue}>₹{selectedTxn.total || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Remarks</span>
                <span className={styles.detailValue}>{selectedTxn.remarks || '-'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayoutHistory;
