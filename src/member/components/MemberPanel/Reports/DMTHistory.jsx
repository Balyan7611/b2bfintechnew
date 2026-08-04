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

  // Dynamic Column logic
  const baseData = filteredList.length > 0 ? filteredList : list;
  let dynamicColumns = [];
  const allowedApiKeys = [
    'createdDate', 'orderId', 'vendorId', 'refid', 'rrn',
    'memberName', 'memberId', 'serviceName', 'operatorName', 'apiName', 'operator', 'api', 'service',
    'customerName', 'customerMobile', 'accountNo', 'ifsc', 'bankName', 'beniName', 'beniVerifyName',
    'openingBalance', 'amount', 'closingBalance',
    'surcharge', 'commission', 'serviceCharge', 'totalCommission', 'totalTds', 'cashback', 'gst', 'tds', 'vgst', 'vcs', 'vtds', 'padmin', 'pgst', 'tdsadmin',
    'mode', 'ip', 'fromChannel', 'message', 'status'
  ];

  if (baseData && baseData.length > 0) {
    const rawKeys = Object.keys(baseData[0]);
    dynamicColumns = allowedApiKeys.filter(key => {
      if (rawKeys.includes(key)) return true;
      if (key === 'operatorName' && (rawKeys.includes('operatorId') || rawKeys.includes('operator'))) return true;
      if (key === 'apiName' && (rawKeys.includes('apiId') || rawKeys.includes('api') || rawKeys.includes('apiid'))) return true;
      if (key === 'serviceName' && (rawKeys.includes('serviceId') || rawKeys.includes('service'))) return true;
      return false;
    });
  }
  
  const formatHeader = (key) => key.replace(/([A-Z])/g, ' $1').toUpperCase();
  const displayColumns = dynamicColumns.length > 0
    ? ['SNO', ...dynamicColumns.map(formatHeader)]
    : ['SNO', 'DATE & TIME', 'MEMBER DETAIL', 'SENDER MOBILE', 'ACCOUNT NO', 'BENE NAME', 'BANK', 'STATUS', 'AMOUNT', 'ACTION'];

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
          return (
            <tr key={item.id || index}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  {dynamicColumns.map((colKey, colIndex) => {
                    let val = item[colKey];
                    
                    if (colKey === 'operatorName' && !val) {
                      const opId = item.operatorId || item.operator;
                      if (opId) {
                         const op = masterOperators.find(o => String(o.id) === String(opId));
                         val = op ? op.name || op.operatorCode : opId;
                      } else val = 'N/A';
                    }
                    if (colKey === 'apiName' && !val) {
                      const aId = item.apiId || item.api || item.apiid;
                      if (aId) {
                         const api = masterApis.find(a => String(a.id) === String(aId) || String(a.apiid) === String(aId));
                         val = api ? api.apiname || api.name : aId;
                      } else val = 'N/A';
                    }
                    if (colKey === 'serviceName' && !val) {
                      const sId = item.serviceId || item.service;
                      if (sId) {
                         const svc = masterServices.find(s => String(s.id) === String(sId));
                         val = svc ? svc.name : sId;
                      } else val = 'N/A';
                    }
                    
                    // Status styling
                if (colKey.toLowerCase() === 'status') {
                   let statusStyle = styles.statusPending;
                   if (String(val).toUpperCase() === 'SUCCESS') statusStyle = styles.statusSuccess;
                   if (String(val).toUpperCase() === 'FAILED') statusStyle = styles.statusFailed;
                   return (
                     <td key={colIndex}>
                       <span className={`${styles.statusBadge} ${statusStyle}`}>
                         {val}
                       </span>
                     </td>
                   );
                }

                // Date styling (split top and bottom if contains 'T')
                if (String(val).includes('T') && String(val).length > 10) {
                  return (
                    <td key={colIndex}>
                      <div style={{ color: '#0D1B3E', fontWeight: '800', fontSize: '0.85rem' }}>{String(val).split('T')[0]}</div>
                      <div style={{ color: '#718096', fontSize: '0.75rem', fontWeight: '600', marginTop: '2px' }}>{String(val).split('T')[1]?.split('.')[0] || ''}</div>
                    </td>
                  );
                }

                return (
                  <td key={colIndex} style={{ fontSize: '0.8rem', color: '#4E6080' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </td>
                );
              })}
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
