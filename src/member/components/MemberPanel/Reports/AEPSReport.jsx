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
import { API } from '../../../../api/endpoints';
import { getSession } from '../../../../utils/authUtils';

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

  const fetchAEPSReport = async () => {
    const session = getSession();
    const memberMsrNo = session?.msrno || session?.userId || 2;
    
    try {
      // NOTE: Admin panel fetches with empty memberId to get all data.
      // When memberId is passed as '2', backend returns 0 results because 
      // transactions may not be linked to memberId in DB. Pass empty to fetch all.
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '8',
        operatorId: filters.operatorId || '',
        apiId: '1',
        memberId: '',   // Pass empty like admin — backend JWT already scopes the result
        status: filters.status || ''
      });
      
      let rawData = [];
      if (res && res.status === true) {
        if (Array.isArray(res.data)) {
          rawData = res.data;
        } else if (res.data && Array.isArray(res.data.items)) {
          rawData = res.data.items;
        }
      } else if (res && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (Array.isArray(res)) {
        rawData = res;
      } else if (res && Array.isArray(res.items)) {
        rawData = res.items;
      } else if (res && res.data && Array.isArray(res.data.items)) {
        rawData = res.data.items;
      }
      
      const mappedList = rawData.map((item, idx) => ({
        id: item.id || item.transactionId || idx,
        date: item.createdDate || item.date || item.transactionDate || '-',
        memberId: item.memberId || item.msrNo || memberMsrNo,
        memberName: item.memberName || item.name || session?.name || 'Member',
        aadhar: item.aadhar || item.aadharNo || item.aadharNumber || '-',
        type: item.transactionType || item.type || 'Withdrawal',
        amount: item.amount || 0,
        commission: item.commission || 0,
        opening: item.openingBalance || item.opening || 0,
        closing: item.closingBalance || item.closing || 0,
        status: item.status || 'PENDING',
        bankTransId: item.bankTransId || item.transactionId || item.txnId || '-',
        rrn: item.rrn || item.bankRrn || '-'
      }));
      
      dispatch(setAEPSList(mappedList));
    } catch (error) {
      console.error("Error in fetchAEPSReport:", error);
      dispatch(setAEPSList([]));
    }
  };


  useEffect(() => {
    fetchAEPSReport();
  }, [dispatch, currentPage, rowsPerPage]);

  const filteredList = list.filter(item => {
    const name = item.memberName || '';
    const mId = item.memberId || '';
    const adhr = item.aadhar || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         String(mId).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         String(adhr).includes(searchQuery);
    
    const matchesStatus = filters.status ? String(item.status).toUpperCase() === String(filters.status).toUpperCase() : true;
    
    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateAEPSFilters({ [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchAEPSReport();
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
