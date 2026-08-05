import React, { useState } from 'react';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setAEPSList, 
  updateAEPSFilters, 
  setAEPSSearchQuery, 
  setAEPSRowsPerPage, 
  setAEPSCurrentPage 
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const AEPSReport = () => {
  const dispatch = useDispatch();
  const [activeReceipt, setActiveReceipt] = useState(null);
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.aepsReport);

  // Data will be fetched from API when backend endpoints are ready
  // useEffect(() => { ... fetch AEPS data ... }, [filters]);

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
                </select>
              </div>
              <button className={styles.submitBtn} onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        }
        columns={['S.No', 'Actions', 'Date', 'Status', 'Amount', 'Member', 'Aadhaar', 'Mobile', 'Bank', 'Type', 'Op. bal', 'Cl. bal', 'Commission', 'TDS', 'UTR']}
        data={filteredList}
        renderRow={(item, index) => {
          let statusStyle = styles.statusPending;
          if (item.status === 'SUCCESS') statusStyle = styles.statusSuccess;
          if (item.status === 'FAILED') statusStyle = styles.statusFailed;

          return (
            <tr key={item.id}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>
                <button 
                  style={{ 
                    background: '#F1F5F9', 
                    color: '#1756AA', 
                    border: '1px solid #E2E8F0',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#1756AA'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#1756AA'; }}
                  onClick={() => setActiveReceipt(item)}
                >
                  Receipt
                </button>
              </td>
              <td>{item.date?.split('T')[0] || item.createdDate?.split('T')[0] || 'N/A'}</td>
              <td>
                <span className={`${styles.statusBadge} ${statusStyle}`}>
                  {item.status || 'PENDING'}
                </span>
              </td>
              <td>₹{item.amount || '0.00'}</td>
              <td>{`${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`}</td>
              <td>{item.aadhar || item.aadharNo || 'N/A'}</td>
              <td>{item.customerMobile || item.mobile || 'N/A'}</td>
              <td>{item.bankName || item.bank || 'N/A'}</td>
              <td>{item.type || item.transactionType || item.serviceName || 'N/A'}</td>
              <td>₹{item.openingBalance || '0.00'}</td>
              <td>₹{item.closingBalance || '0.00'}</td>
              <td>₹{item.commission || item.totalCommission || '0.00'}</td>
              <td>₹{item.tds || item.totalTds || '0.00'}</td>
              <td>{item.bankTransId || item.rrn || item.vendorId || item.txnId || 'N/A'}</td>
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

      {activeReceipt && (
        <TransactionReceipt 
          data={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
};

export default AEPSReport;
