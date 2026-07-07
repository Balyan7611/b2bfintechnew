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
        columns={['SNO', 'TRANSACTION DATE', 'MEMBER ID', 'MEMBER NAME', 'AADHARNUMBER', 'TRANSACTION TYPE', 'AMOUNT', 'BANK TRANSID', 'STATUS', 'VIEW RECEIPT']}
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
              <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.bankTransId || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()}</td>
              <td>
                <span className={`${styles.statusBadge} ${statusStyle}`}>
                  {item.status}
                </span>
              </td>
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
                  View Receipt
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

      {activeReceipt && (
        <TransactionReceipt 
          data={{
            mode: 'AEPS',
            amount: parseFloat(activeReceipt.amount) || 0,
            charge: 0,
            date: activeReceipt.date,
            customerName: activeReceipt.memberName,
            customerMobile: activeReceipt.memberId,
            beneficiary: activeReceipt.aadhar,
            bank: activeReceipt.type,
            accountNo: activeReceipt.bankTransId,
            total: parseFloat(activeReceipt.amount) || 0,
            chunks: [{ txnId: activeReceipt.bankTransId, amount: parseFloat(activeReceipt.amount) || 0 }]
          }}
          onClose={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
};

export default AEPSReport;
