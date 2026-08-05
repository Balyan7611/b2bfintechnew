import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setRechargeList,
  updateRechargeFilters,
  setRechargeSearchQuery,
  setRechargeRowsPerPage,
  setRechargeCurrentPage
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';
import { FiFilter, FiSearch, FiDatabase } from 'react-icons/fi';
import { useState } from 'react';
import { API } from '../../../../api/endpoints';

const RechargeHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.rechargeReport);

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

    // Fetch Recharge transactions: serviceId=1,2,3, sectionType=1
    const fetchRecharge = async () => {
      try {
        const res = await API.transaction.getAll({
          pageNumber: currentPage,
          pageSize: rowsPerPage,
          fromDate: filters?.fromDate || '',
          toDate: filters?.toDate || '',
          serviceId: '',
          sectionType: '1',
          operatorId: filters?.operatorId || '',
          apiId: '',
          memberId: '',
          status: filters?.status || ''
        });
        let rawData = [];
        if (res && res.status === true) {
          rawData = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        } else if (Array.isArray(res)) rawData = res;
        else if (res?.data?.items) rawData = res.data.items;
        dispatch(setRechargeList(rawData));
      } catch (e) { console.error('RechargeHistory fetch error:', e); dispatch(setRechargeList([])); }
    };
    fetchRecharge();
  }, [dispatch, currentPage, rowsPerPage]);

  const filteredList = list.filter(item => item.number?.includes(searchQuery) || item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayColumns = ['Action', 'SNO', 'Date', 'Member Details', 'Operator', 'Number', 'Status', 'Message', 'Opening Bal', 'Amount', 'Commission', 'TDS', 'Closing Bal', 'TXID', 'Operator Id'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="RECHARGE HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateRechargeFilters({ fromDate: e.target.value }))} /></div>
              <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateRechargeFilters({ toDate: e.target.value }))} /></div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.inputControl} value={filters.status} onChange={(e) => dispatch(updateRechargeFilters({ status: e.target.value }))}>
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
                <button className={styles.submitBtn}>Apply Filters</button>
              </div>
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
                <td>
                  <button className={styles.actionBtn} title="View Receipt">
                    <FiSearch />
                  </button>
                </td>
                <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td>{item.createdDate || item.date || 'N/A'}</td>
                <td>{`${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`}</td>
                <td>{item.operatorName || item.operatorId || 'N/A'}</td>
                <td>{item.number || item.customerMobile || item.accountNo || 'N/A'}</td>
                <td>
                  <span className={`${styles.statusBadge} ${statusStyle}`}>
                    {item.status || 'PENDING'}
                  </span>
                </td>
                <td>{item.message || item.remark || 'N/A'}</td>
                <td>₹{item.openingBalance || '0.00'}</td>
                <td>₹{item.amount || '0.00'}</td>
                <td>₹{item.commission || item.totalCommission || '0.00'}</td>
                <td>₹{item.tds || item.totalTds || '0.00'}</td>
                <td>₹{item.closingBalance || '0.00'}</td>
                <td>{item.txnId || item.transId || item.orderId || 'N/A'}</td>
                <td>{item.operatorId || 'N/A'}</td>
              </tr>
            );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setRechargeSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setRechargeRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setRechargeCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default RechargeHistory;
