import React from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setPayoutList, 
  updatePayoutFilters, 
  setPayoutSearchQuery, 
  setPayoutRowsPerPage, 
  setPayoutCurrentPage 
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const PayoutReport = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.payoutReport);

  const totalEntries = list.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePayoutFilters({ [name]: value }));
  };

  const columns = [
    'SNO', 'ADD DATE', 'TYPE', 'ORDERID', 'BANK DETAILS', 'STATUS', 
    'RRN', 'MEMBER ID', 'NAME', 'AMOUNT', 'CHARGE', 'TRANSACTION MODE', 
    'AEPS APPROVE AMOUNT', 'REQUEST ID', 'TRANSACTION ID', 'APPROVE DATE'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="PAYOUT HISTORY"
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
        fileNamePrefix="admin_payout_report"
        exportData={list.map((item, index) => [
          (currentPage - 1) * rowsPerPage + index + 1,
          item.date || 'N/A',
          item.type || 'N/A',
          item.orderId || 'N/A',
          item.bank || 'N/A',
          item.status || 'PENDING',
          item.rrn || 'N/A',
          item.memberId || 'N/A',
          item.name || 'N/A',
          item.amount || '0.00',
          item.charge || '0.00',
          item.mode || 'N/A',
          item.appAmount || '0.00',
        ])}
        renderRow={(item, index) => {
          let statusStyle = styles.statusPending;
          if (item.status === 'SUCCESS') statusStyle = styles.statusSuccess;
          if (item.status === 'FAILED') statusStyle = styles.statusFailed;

          return (
            <tr key={item.id}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.orderId}</td>
              <td>{item.bank}</td>
              <td>
                <span className={`${styles.statusBadge} ${statusStyle}`}>
                  {item.status}
                </span>
              </td>
              <td>{item.rrn}</td>
              <td>{item.memberId}</td>
              <td>{item.name}</td>
              <td>{item.amount}</td>
              <td>{item.charge}</td>
              <td>{item.mode}</td>
              <td>{item.appAmount}</td>
              <td>{item.reqId}</td>
              <td>{item.transId}</td>
              <td>{item.appDate}</td>
            </tr>
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setPayoutSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { dispatch(setPayoutRowsPerPage(val)); dispatch(setPayoutCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setPayoutCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default PayoutReport;
