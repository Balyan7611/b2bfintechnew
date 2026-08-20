import React from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setMATMList, 
  updateMATMFilters, 
  setMATMSearchQuery, 
  setMATMRowsPerPage, 
  setMATMCurrentPage 
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const MATMReport = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.matmReport);

  const totalEntries = list.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateMATMFilters({ [name]: value }));
  };

  const columns = ['SNO', 'MEMBER', 'ADDDATE', 'AMOUNT', 'TRANSID', 'BANK RRN', 'CARD NO', 'STATUS', 'ACTION'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="MANAGE MATM"
        icon={<FiFilter />}
        topContent={
          <div className={styles.filterRow}>
            <div className={styles.formGroup}>
              <label>Search</label>
              <input 
                type="text" 
                className={styles.inputControl}
                placeholder="Search..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
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
                <option value="">Select Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Member ID :</label>
              <select 
                className={styles.inputControl}
                name="memberId"
                value={filters.memberId}
                onChange={handleFilterChange}
              >
                <option value="">Select Member</option>
              </select>
            </div>
            <button className={styles.submitBtn}>Submit</button>
          </div>
        }
        columns={columns}
        data={list}
        fileNamePrefix="admin_matm_report"
        exportData={list.map((item, index) => [
          (currentPage - 1) * rowsPerPage + index + 1,
          item.member || 'N/A',
          item.date || 'N/A',
          item.amount || '0.00',
          item.transId || 'N/A',
          item.rrn || 'N/A',
          item.card || 'N/A',
          item.status || 'PENDING',
          'VIEW',
        ])}
        renderRow={(item, index) => {
          let statusStyle = styles.statusPending;
          if (item.status === 'SUCCESS') statusStyle = styles.statusSuccess;
          if (item.status === 'FAILED') statusStyle = styles.statusFailed;

          return (
            <tr key={item.id}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>{item.member}</td>
              <td>{item.date}</td>
              <td>{item.amount}</td>
              <td>{item.transId}</td>
              <td>{item.rrn}</td>
              <td>{item.card}</td>
              <td>
                <span className={`${styles.statusBadge} ${statusStyle}`}>
                  {item.status}
                </span>
              </td>
              <td>
                <button className={styles.submitBtn} style={{height: '30px', padding: '0 10px', fontSize: '0.75rem'}}>View</button>
              </td>
            </tr>
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setMATMSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { dispatch(setMATMRowsPerPage(val)); dispatch(setMATMCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setMATMCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default MATMReport;
