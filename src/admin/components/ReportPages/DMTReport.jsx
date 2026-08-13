import React from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setDMTList, 
  updateDMTFilters, 
  setDMTSearchQuery, 
  setDMTRowsPerPage, 
  setDMTCurrentPage 
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const DMTReport = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.dmtReport);

  const totalEntries = list.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateDMTFilters({ [name]: value }));
  };

  const columns = [
    'S.NO', 'ADDDATE', 'STATUS', 'RECEIPT', 'FULL RECEIPT', 
    'SENDER MOBILE NO.', 'BENI NAME', 'BANKNAME', 'ACCOUNT NO', 
    'IFSC', 'AMOUNT', 'CHARGE', 'CASHBACK', 'TDS', 
    'TRANSID', 'VENDORE ID', 'SOURCE', 'STATUS'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="DMT HISTORY"
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
        fileNamePrefix="admin_dmt_report"
        exportData={list.map((item, index) => [
          (currentPage - 1) * rowsPerPage + index + 1,
          item.date || 'N/A',
          item.status || 'PENDING',
          item.receipt || 'N/A',
          '',
          item.sender || 'N/A',
          item.beni || 'N/A',
          item.bank || 'N/A',
          item.account || 'N/A',
          item.ifsc || 'N/A',
          item.amount || '0.00',
          item.charge || '0.00',
          '0.00',
          item.mode || 'N/A',
          item.txnId || item.orderId || 'N/A',
          item.rrn || 'N/A',
          item.commission || '0.00',
          item.tds || '0.00',
          item.memberId || 'N/A',
          item.memberName || 'N/A',
        ])}
        renderRow={(item, index) => {
          let statusStyle = styles.statusPending;
          if (item.status === 'SUCCESS') statusStyle = styles.statusSuccess;
          if (item.status === 'FAILED') statusStyle = styles.statusFailed;

          return (
            <tr key={item.id}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td>{item.date}</td>
              <td>
                <span className={`${styles.statusBadge} ${statusStyle}`}>
                  {item.status}
                </span>
              </td>
              <td>{item.receipt}</td>
              <td>-</td>
              <td>{item.sender}</td>
              <td>{item.beni}</td>
              <td>{item.bank}</td>
              <td>{item.account}</td>
              <td>{item.ifsc}</td>
              <td>{item.amount}</td>
              <td>{item.charge}</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>{item.transid}</td>
              <td>{item.vendor}</td>
              <td>{item.source}</td>
              <td>
                <span className={`${styles.statusBadge} ${statusStyle}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          );
        }}
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

export default DMTReport;
