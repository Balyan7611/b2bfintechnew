import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setMATMList, 
  updateMATMFilters, 
  setMATMSearchQuery, 
  setMATMRowsPerPage, 
  setMATMCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';
import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { API } from '../../../../api/endpoints';

const MATMHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.matmReport);

  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const svcRes = await API.service.getAll();
        setMasterServices(Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : []);
      } catch (e) {}
      try {
        const opRes = await API.operator.getAll({ pageSize: 1000 });
        setMasterOperators(Array.isArray(opRes?.data?.items) ? opRes.data.items : Array.isArray(opRes?.data) ? opRes.data : Array.isArray(opRes) ? opRes : []);
      } catch (e) {}
      try {
        const apiRes = await API.masterApi.getAll({ pageSize: 500 });
        setMasterApis(Array.isArray(apiRes?.data?.items) ? apiRes.data.items : Array.isArray(apiRes?.data) ? apiRes.data : Array.isArray(apiRes) ? apiRes : []);
      } catch (e) {}
    };
    fetchMasters();
    
    dispatch(setMATMList([]));
  }, [dispatch]);

  const filteredList = list.filter(item => item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()) || item.cardNo?.includes(searchQuery));

  const displayColumns = ['SNO', 'Date', 'Member', 'Operator', 'Card No', 'Opening Bal', 'Amount', 'Commission', 'TDS', 'Closing Bal', 'TransID', 'Bank RRN', 'Status', 'Remark', 'Receipt'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="MATM HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateMATMFilters({fromDate: e.target.value}))} /></div>
              <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateMATMFilters({toDate: e.target.value}))} /></div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.inputControl} value={filters.status} onChange={(e) => dispatch(updateMATMFilters({status: e.target.value}))}>
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <button className={styles.submitBtn}>Apply Filters</button>
            </div>
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        renderRow={(item, index) => {
              let statusStyle = styles.statusPending;
              if (String(item.status).toUpperCase() === 'SUCCESS') statusStyle = styles.statusSuccess;
              if (String(item.status).toUpperCase() === 'FAILED' || String(item.status).toUpperCase() === 'REJECTED') statusStyle = styles.statusFailed;

              return (
                <tr key={item.id || index}>
                  <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{item.createdDate || item.date || 'N/A'}</td>
                  <td>{`${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`}</td>
                  <td>{item.operatorName || item.operatorId || 'N/A'}</td>
                  <td>{item.accountNo || item.cardNumber || 'N/A'}</td>
                  <td>₹{item.openingBalance || '0.00'}</td>
                  <td>₹{item.amount || '0.00'}</td>
                  <td>₹{item.commission || item.totalCommission || '0.00'}</td>
                  <td>₹{item.tds || item.totalTds || '0.00'}</td>
                  <td>₹{item.closingBalance || '0.00'}</td>
                  <td>{item.txnId || item.transId || item.orderId || 'N/A'}</td>
                  <td>{item.rrn || item.refid || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusStyle}`}>
                      {item.status || 'PENDING'}
                    </span>
                  </td>
                  <td>{item.remark || item.message || 'N/A'}</td>
                  <td>
                    <button className={styles.actionBtn} title="View Receipt">
                      <FiSearch />
                    </button>
                  </td>
                </tr>
              );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setMATMSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setMATMRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setMATMCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default MATMHistory;
