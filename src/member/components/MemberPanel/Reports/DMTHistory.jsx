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
import { useState } from 'react';
import { API } from '../../../../api/endpoints';

const DMTHistory = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.dmtReport);

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

    // Fetch DMT transactions: serviceId=16, sectionType=7
    const fetchDMT = async () => {
      try {
        const res = await API.transaction.getAll({
          pageNumber: currentPage,
          pageSize: rowsPerPage,
          fromDate: filters?.fromDate || '',
          toDate: filters?.toDate || '',
          serviceId: '16',
          sectionType: '7',
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
        dispatch(setDMTList(rawData));
      } catch (e) { console.error('DMTHistory fetch error:', e); dispatch(setDMTList([])); }
    };
    fetchDMT();
  }, [dispatch, currentPage, rowsPerPage]);

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

  const displayColumns = ['S.No', 'AddDate', 'Member Details', 'Sender Mobile No.', 'Beni Name', 'BankName', 'Account No', 'IFSC', 'Opening Bal', 'Amount', 'Charge', 'CashBack', 'TDS', 'Closing Bal', 'TransID', 'GST', 'Reference', 'Vendore ID', 'Mode', 'Source', 'Status', 'Receipt', 'Remark'];

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
                  <td>{item.customerMobile || item.senderMobile || 'N/A'}</td>
                  <td>{item.beniName || item.beneficiaryName || 'N/A'}</td>
                  <td>{item.bankName || 'N/A'}</td>
                  <td>{item.accountNo || 'N/A'}</td>
                  <td>{item.ifsc || 'N/A'}</td>
                  <td>₹{item.openingBalance || '0.00'}</td>
                  <td>₹{item.amount || '0.00'}</td>
                  <td>₹{item.serviceCharge || item.charge || item.commission || '0.00'}</td>
                  <td>₹{item.cashback || '0.00'}</td>
                  <td>₹{item.tds || item.totalTds || '0.00'}</td>
                  <td>₹{item.closingBalance || '0.00'}</td>
                  <td>{item.txnId || item.transId || item.orderId || 'N/A'}</td>
                  <td>₹{item.gst || '0.00'}</td>
                  <td>{item.refid || item.rrn || item.reference || 'N/A'}</td>
                  <td>{item.vendorId || 'N/A'}</td>
                  <td>{item.mode || 'N/A'}</td>
                  <td>{item.ip || item.source || item.fromChannel || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusStyle}`}>
                      {item.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn} title="View Receipt">
                      <FiSearch />
                    </button>
                  </td>
                  <td>{item.remark || item.message || 'N/A'}</td>
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

export default DMTHistory;
