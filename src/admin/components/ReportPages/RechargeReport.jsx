import React, { useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setRechargeList, 
  updateRechargeFilters, 
  setRechargeSearchQuery, 
  setRechargeRowsPerPage, 
  setRechargeCurrentPage 
} from '../../../store/slices/reportSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const RechargeReport = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.rechargeReport);

  // Load dummy data
  useEffect(() => {
    const dummyData = [
      { id: 1, date: '2026-05-01 10:20', status: 'SUCCESS', rechargeBy: 'Sachin Balyan', txid: 'TXN1001', operator: 'Airtel', number: '9876543210', amount: 500.00, commission: 15.00, operatorId: 'OP123', receipt: 'REC001' },
      { id: 2, date: '2026-05-02 14:15', status: 'FAILED', rechargeBy: 'Sachin Balyan', txid: 'TXN1002', operator: 'Jio', number: '9876543211', amount: 249.00, commission: 0.00, operatorId: 'OP124', receipt: 'REC002' },
    ];
    dispatch(setRechargeList(dummyData));
  }, [dispatch]);

  const totalEntries = list.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateRechargeFilters({ [name]: value }));
  };

  const columns = [
    'SNO', 'DATE TIME', 'STATUS', 'ACTION', 'RECHARGE BY', 
    'TXID', 'OPERATOR', 'NUMBER', 'AMOUNT', 'COMMISSION', 
    'OPERATOR ID', 'RECEIPT'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="RECHARGE HISTORY"
        icon={<FiFilter />}
        topContent={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <label>Service</label>
                <select 
                  className={styles.inputControl}
                  name="service"
                  value={filters.service}
                  onChange={handleFilterChange}
                >
                  <option value="">Select Service</option>
                  <option value="Mobile">Mobile</option>
                  <option value="DTH">DTH</option>
                </select>
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
            </div>
            <div className={styles.filterRow}>
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
                  <option value="RT1236">Sachin Balyan (RT1236)</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
                <button className={styles.submitBtn}>Submit</button>
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={list}
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
              <td>
                <button className={styles.submitBtn} style={{height: '30px', padding: '0 10px', fontSize: '0.75rem'}}>Receipt</button>
              </td>
              <td>{item.rechargeBy}</td>
              <td>{item.txid}</td>
              <td>{item.operator}</td>
              <td>{item.number}</td>
              <td>{item.amount.toFixed(2)}</td>
              <td>{item.commission.toFixed(2)}</td>
              <td>{item.operatorId}</td>
              <td>{item.receipt}</td>
            </tr>
          );
        }}
        // Adding footer row logic manually since AdminTable might not support it directly
        // But I'll just add it as the last row of the table by injecting it into data or handling it in renderRow
        // Best: I'll add a separate footer style in AEPSReport.module.css
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setRechargeSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setRechargeRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setRechargeCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
      
      {/* Total Row - As per screenshot */}
      {list.length > 0 && (
        <div style={{
          display: 'flex', 
          justifyContent: 'flex-end', 
          padding: '15px 24px', 
          background: '#f8faff', 
          borderTop: '1px solid #edf2f7',
          fontWeight: '900',
          fontSize: '1rem',
          color: '#1a202c'
        }}>
          <span style={{marginRight: '120px'}}>Total</span>
          <span>{totalAmount.toFixed(2)}</span>
          <span style={{width: '240px'}}></span> {/* Spacer to align with columns */}
        </div>
      )}
    </div>
  );
};

export default RechargeReport;
