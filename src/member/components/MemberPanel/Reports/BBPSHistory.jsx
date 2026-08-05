import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setBBPSList, 
  updateBBPSFilters, 
  setBBPSSearchQuery, 
  setBBPSRowsPerPage, 
  setBBPSCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import StatsGrid from '../../../../shared/components/common/StatsGrid';
import { FiBarChart2 } from 'react-icons/fi';
import styles from './AEPSReport.module.css';
import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { API } from '../../../../api/endpoints';

const BBPSHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.bbpsReport);

  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status]);


  const fetchData = async () => {
    try {
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '',
        sectionType: '2',
        operatorId: filters.operatorId || '',
        memberId: '',
        status: filters.status || ''
      });
      let rawData = [];
      if (res?.status === true) rawData = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      else if (Array.isArray(res?.data)) rawData = res.data;
      else if (Array.isArray(res?.data?.items)) rawData = res.data.items;
      else if (Array.isArray(res)) rawData = res;
      console.log('[BBPSHistory.jsx] rows:', rawData.length);
      dispatch(setBBPSList(rawData));
    } catch (e) {
      console.error('[BBPSHistory.jsx] fetch error:', e);
      dispatch(setBBPSList([]));
    }
  };

  // Auto-fetch on mount and when filters/page change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status]);

  const filteredList = list.filter(item => item.consumer?.toLowerCase().includes(searchQuery.toLowerCase()) || item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayColumns = ['Receipt', 'SNO', 'Date Time', 'Recharge By', 'Operator', 'Number', 'Status', 'Opening Bal', 'Amount', 'Commission', 'TDS', 'Closing Bal', 'TXID', 'Operator Id', 'Remark'];

  const totalAmount = filteredList.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);
  const totalCommission = filteredList.reduce((a, t) => a + (parseFloat(t.commission || t.totalCommission) || 0), 0);
  const totalTds = filteredList.reduce((a, t) => a + (parseFloat(t.tds || t.totalTds) || 0), 0);
  const stats = {
    totalTxns: filteredList.length,
    totalAmount,
    successTxns: filteredList.filter(t => String(t.status).toUpperCase() === 'SUCCESS').length,
    failedTxns: filteredList.filter(t => String(t.status).toUpperCase() === 'FAILED').length,
    pendingTxns: filteredList.filter(t => String(t.status).toUpperCase() === 'PENDING').length,
    totalCommission,
    uplineCommission: totalCommission * 0.6,
    adminCommission: totalCommission * 0.4,
    totalTds,
    adminProfit: totalCommission * 0.15,
    tdsPayable: totalTds * 0.95,
    netPayable: totalAmount - totalCommission,
  };

  return (
    <div className={styles.container}>
      <StatsGrid stats={stats} showStats={showStats} />
      <AdminTable
        title="BBPS HISTORY"
        rightAction={
        <button
          onClick={() => setShowStats(!showStats)}
          style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff', border: 'none', borderRadius: '10px', height: '36px', padding: '0 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FiBarChart2 size={14} /> {showStats ? 'HIDE STATS' : 'VIEW STATS'}
        </button>
      }
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateBBPSFilters({fromDate: e.target.value}))} /></div>
              <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateBBPSFilters({toDate: e.target.value}))} /></div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select className={styles.inputControl} value={filters.category} onChange={(e) => dispatch(updateBBPSFilters({category: e.target.value}))}>
                  <option value="">All Categories</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                </select>
              </div>
              <button className={styles.submitBtn} onClick={fetchData}>Apply Filters</button>
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
                  <button
                    onClick={() => { setSelectedTxn(item); setIsModalOpen(true); }}
                    style={{ background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color:'#fff', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}
                  >VIEW</button>
                </td>
                <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td>{item.createdDate || item.date || 'N/A'}</td>
                <td>{`${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`}</td>
                <td>{item.operatorName || item.operatorId || 'N/A'}</td>
                <td>{item.consumer || item.number || item.accountNo || 'N/A'}</td>
                <td>
                  <span className={`${styles.statusBadge} ${statusStyle}`}>
                    {item.status || 'PENDING'}
                  </span>
                </td>
                <td>₹{item.openingBalance || '0.00'}</td>
                <td>₹{item.amount || '0.00'}</td>
                <td>₹{item.commission || item.totalCommission || '0.00'}</td>
                <td>₹{item.tds || item.totalTds || '0.00'}</td>
                <td>₹{item.closingBalance || '0.00'}</td>
                <td>{item.txnId || item.transId || item.orderId || 'N/A'}</td>
                <td>{item.operatorId || 'N/A'}</td>
                <td>{item.remark || item.message || 'N/A'}</td>
              </tr>
            );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setBBPSSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setBBPSRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setBBPSCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedTxn} />
    </div>
  );
};

export default BBPSHistory;
