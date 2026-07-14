import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch, FiDatabase } from 'react-icons/fi';
import { 
  setDMTList, 
  updateDMTFilters, 
  setDMTSearchQuery, 
  setDMTRowsPerPage, 
  setDMTCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css'; // Reusing common report styles

const DMTHistory = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.dmtReport);

  useEffect(() => {
    dispatch(setDMTList([]));
  }, [dispatch]);

  const filteredList = (list || []).filter(item => {
    const name = item.userName || '';
    const bene = item.beneName || '';
    const account = item.accNo || '';

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         bene.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.includes(searchQuery);
    
    const matchesStatus = filters.status ? item.status === filters.status : true;

    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateDMTFilters({ [name]: value }));
  };

  return (
    <div className={styles.container}>
      <AdminTable
        title="DMT HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={handleFilterChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.inputControl} name="status" value={filters.status} onChange={handleFilterChange}>
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
        columns={['#', 'DATE & TIME', 'USER NAME', 'USER MOBILE', 'SENDER MOBILE', 'ACCOUNT NO', 'BENE NAME', 'BANK', 'STATUS', 'AMOUNT', 'ACTION']}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{item.date}</td>
            <td style={{ fontWeight: 600 }}>{item.userName}</td>
            <td>{item.userMobile}</td>
            <td>{item.senderMobile}</td>
            <td style={{ fontWeight: 700 }}>{item.accNo}</td>
            <td>{item.beneName}</td>
            <td>{item.beneBank}</td>
            <td>
              <span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>
                {item.status}
              </span>
            </td>
            <td style={{ fontWeight: 800 }}>₹{item.amount}</td>
            <td>
               <button style={{ background: '#F1F5F9', color: '#1756AA', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Receipt</button>
            </td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setDMTSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setDMTRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setDMTCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default DMTHistory;
