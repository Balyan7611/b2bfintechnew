import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setAEPSList, 
  updateAEPSFilters, 
  setAEPSSearchQuery, 
  setAEPSRowsPerPage, 
  setAEPSCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import styles from './AEPSReport.module.css';
import { useState } from 'react';

const AEPSReport = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.aepsReport);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailMode, setViewDetailMode] = useState(false);

  // Load dummy data for display
  useEffect(() => {
    const dummyData = [
      { id: 1, date: '2026-05-01 10:20', memberId: 'RT1236', memberName: 'Sachin Balyan', aadhar: 'XXXX XXXX 1234', type: 'Withdrawal', opening: '1000.00', amount: '500.00', commission: '5.00', closing: '505.00', status: 'SUCCESS', bankTransId: 'BETA84920381', rrn: '847291038472' },
      { id: 2, date: '2026-05-02 14:15', memberId: 'RT1236', memberName: 'Sachin Balyan', aadhar: 'XXXX XXXX 5678', type: 'Balance Inquiry', opening: '505.00', amount: '0.00', commission: '0.00', closing: '505.00', status: 'SUCCESS', bankTransId: 'BETA92837461', rrn: '928374615243' },
      { id: 3, date: '2026-05-03 09:45', memberId: 'RT1236', memberName: 'Sachin Balyan', aadhar: 'XXXX XXXX 9012', type: 'Withdrawal', opening: '505.00', amount: '100.00', commission: '1.00', closing: '406.00', status: 'FAILED', bankTransId: 'BETA10293847', rrn: '102938475638' },
    ];
    dispatch(setAEPSList(dummyData));
  }, [dispatch]);

  const filteredList = list.filter(item => {
    const matchesSearch = item.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.aadhar.includes(searchQuery);
    
    const matchesStatus = filters.status ? item.status === filters.status : true;
    const matchesMember = filters.memberId ? item.memberId === filters.memberId : true;
    
    return matchesSearch && matchesStatus && matchesMember;
  });

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateAEPSFilters({ [name]: value }));
  };

  const handleApplyFilters = () => {
    // Fetches would go here
    console.log('Filters applied');
  };

  return (
    <div className={styles.container}>
      {!viewDetailMode ? (
        <>
          <AdminTable
            title="MANAGE AEPS"
            topContent={
              <div className={styles.filterSection}>
                <div className={styles.filterRow}>
                  <div className={styles.formGroup}>
                    <label>From Date</label>
                    <input 
                      type="date" 
                      className={styles.inputControl}
                      name="fromDate"
                      value={filters.fromDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>To Date</label>
                    <input 
                      type="date" 
                      className={styles.inputControl}
                      name="toDate"
                      value={filters.toDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select 
                      className={styles.inputControl}
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="SUCCESS">Success</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Member</label>
                    <select 
                      className={styles.inputControl}
                      name="memberId"
                      value={filters.memberId}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Members</option>
                      <option value="RT1236">Sachin Balyan (RT1236)</option>
                    </select>
                  </div>
                  <button className={styles.submitBtn} onClick={handleApplyFilters}>
                    Apply Filters
                  </button>
                </div>
              </div>
            }
            columns={['SNO', 'TRANSACTION DATE', 'MEMBER ID', 'MEMBER NAME', 'AADHARNUMBER', 'TRANSACTION TYPE', 'AMOUNT', 'BANK TRANSID', 'STATUS', 'ACTION']}
            data={filteredList}
            renderRow={(item, index) => {
              let statusStyle = styles.statusPending;
              if (item.status === 'SUCCESS') statusStyle = styles.statusSuccess;
              if (item.status === 'FAILED') statusStyle = styles.statusFailed;

              return (
                <tr key={item.id}>
                  <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td style={{ fontSize: '0.85rem', color: '#4E6080' }}>{item.date}</td>
                  <td style={{ fontWeight: 700, color: '#1756AA' }}>{item.memberId}</td>
                  <td style={{ fontWeight: 600, color: '#2D3748' }}>{item.memberName}</td>
                  <td>{item.aadhar}</td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568' }}>{item.type}</td>
                  <td style={{ fontWeight: 800, color: '#2D3748' }}>₹{item.amount}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.bankTransId}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusStyle}`}>
                      {item.status}
                    </span>
                  </td>
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
              );
            }}
            searchQuery={searchQuery}
            onSearchChange={(val) => dispatch(setAEPSSearchQuery(val))}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => dispatch(setAEPSRowsPerPage(val))}
            currentPage={currentPage}
            onPageChange={(val) => dispatch(setAEPSCurrentPage(val))}
            totalEntries={totalEntries}
            totalPages={totalPages}
          />
          <ReceiptModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={selectedTxn} 
          />
        </>
      ) : (
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <button className={styles.backBtn} onClick={() => setViewDetailMode(false)}>
              &larr; Back to History
            </button>
            <h2 className={styles.detailTitle}>Transaction Details</h2>
            <button 
              className={styles.printBtn}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Print Receipt
            </button>
          </div>
          
          {selectedTxn && (
            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction ID</span>
                <span className={styles.detailValue}>{selectedTxn.bankTransId || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>RRN Number</span>
                <span className={styles.detailValue}>{selectedTxn.rrn || '-'}</span>
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
                <span className={styles.detailValue}>{selectedTxn.memberName || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Aadhar Number</span>
                <span className={styles.detailValue}>{selectedTxn.aadhar || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Type</span>
                <span className={styles.detailValue}>{selectedTxn.type || '-'}</span>
              </div>
              
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Amount</span>
                <span className={styles.detailValue} style={{fontSize: '1.2rem', fontWeight: 800}}>₹{selectedTxn.amount || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Commission Earned</span>
                <span className={styles.detailValue} style={{color: '#10b981'}}>₹{selectedTxn.commission || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Opening Balance</span>
                <span className={styles.detailValue}>₹{selectedTxn.opening || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Closing Balance</span>
                <span className={styles.detailValue}>₹{selectedTxn.closing || '0.00'}</span>
              </div>
            </div>
          )}
          
          <ReceiptModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={selectedTxn} 
          />
        </div>
      )}
    </div>
  );
};

export default AEPSReport;
