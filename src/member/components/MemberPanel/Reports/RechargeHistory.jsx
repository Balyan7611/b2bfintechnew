import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import { useDispatch, useSelector } from 'react-redux';
import {
  setRechargeList,
  updateRechargeFilters,
  setRechargeSearchQuery,
  setRechargeRowsPerPage,
  setRechargeCurrentPage
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import StatsGrid from '../../../../shared/components/common/StatsGrid';
import { FiBarChart2 } from 'react-icons/fi';
import styles from './AEPSReport.module.css';
import { FiFilter, FiSearch, FiDatabase, FiRefreshCw } from 'react-icons/fi';
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';
import { resolveReportScopeId } from '../../../../utils/reportScope';

const RechargeHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.rechargeReport);

  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [rechargeServiceIds, setRechargeServiceIds] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Gate every transaction fetch on this: until rechargeServiceIds is loaded,
  // a fetch would go out with an empty serviceIds filter (only sectionType
  // sent), which isn't strict enough and can let non-Recharge rows leak in.
  const [mastersLoaded, setMastersLoaded] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const svcRes = await API.service.getAll();
        setMasterServices(Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : []);
        const allSvcs = Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : [];
        setRechargeServiceIds(allSvcs.filter(s => String(s.sectionType) === '1').map(s => String(s.id)));
      } catch (e) {}
      try {
        const opRes = await API.operator.getAll({ pageSize: 1000 });
        setMasterOperators(Array.isArray(opRes?.data?.items) ? opRes.data.items : Array.isArray(opRes?.data) ? opRes.data : Array.isArray(opRes) ? opRes : []);
      } catch (e) {}
      try {
        const apiRes = await API.masterApi.getAll({ pageSize: 500 });
        setMasterApis(Array.isArray(apiRes?.data?.items) ? apiRes.data.items : Array.isArray(apiRes?.data) ? apiRes.data : Array.isArray(apiRes) ? apiRes : []);
      } catch (e) {}
      setMastersLoaded(true);
    };
    fetchMasters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    // Fail closed: never query with a blank memberId (that returns every
    // account's rows). If we can't resolve who we are, load nothing.
    const { id: scopeId, error: scopeError } = await resolveReportScopeId();
    if (!scopeId) {
      console.error('[RechargeHistory.jsx] %s', scopeError);
      dispatch(setRechargeList([]));
      return;
    }
    try {
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '',
        serviceIds: rechargeServiceIds,
        sectionType: '1',
        operatorId: filters.operatorId || '',
        memberId: scopeId,
        status: filters.status || ''
      });
      const { items: rawItems } = normalizeTxnResponse(res);
      // Wallet-transfer records (admin adding/deducting funds via Member
      // Control Center) get mistagged server-side with SectionType values
      // that leak into other reports — they reliably carry a "WT..." order
      // ID though. Filter those out as a stopgap.
      const rawData = rawItems.filter(t => !String(t.orderId || t.vendorId || '').toUpperCase().startsWith('WT'));
      dispatch(setRechargeList(rawData));
    } catch (e) {
      console.error('[RechargeHistory.jsx] fetch error:', e);
      dispatch(setRechargeList([]));
    }
  };

  useEffect(() => {
    if (!mastersLoaded) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status, mastersLoaded]);

  const filteredList = list.filter(item => item.number?.includes(searchQuery) || item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Member/API panel: show only this account's own commission, not the
  // admin/upline commission ladder (same fix as AEPSReport.jsx).
  const displayColumns = ['Receipt', 'SNO', 'Date', 'Member Details', 'Operator', 'Number', 'Status', 'Message', 'Opening Bal', 'Amount', 'Closing Bal', 'TXID', 'Operator Id', 'Commission'];

  const totalAmount = filteredList.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);
  const totalCommission = filteredList.reduce((a, t) => a + (parseFloat(t.commission || t.totalCommission) || 0), 0);
  const stats = {
    totalTxns: filteredList.length,
    totalAmount,
    successTxns: filteredList.filter(t => String(t.status).toUpperCase() === 'SUCCESS').length,
    failedTxns: filteredList.filter(t => String(t.status).toUpperCase() === 'FAILED').length,
    pendingTxns: filteredList.filter(t => String(t.status).toUpperCase() === 'PENDING').length,
    totalCommission,
  };

  return (
    <div className={styles.container}>
      <StatsGrid stats={stats} showStats={showStats} showAdminBreakdown={false} />
      <AdminTable
        title="RECHARGE HISTORY"
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
              <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} value={filters.fromDate} onChange={(e) => dispatch(updateRechargeFilters({ fromDate: e.target.value }))} /></div>
              <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} value={filters.toDate} onChange={(e) => dispatch(updateRechargeFilters({ toDate: e.target.value }))} /></div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <SearchableSelect
                  value={filters.status}
                  onChange={(val) => dispatch(updateRechargeFilters({ status: val || '' }))}
                  options={[
                    { label: 'All Status', value: '' },
                    { label: 'Success', value: 'SUCCESS' },
                    { label: 'Pending', value: 'PENDING' },
                    { label: 'Failed', value: 'FAILED' }
                  ]}
                  placeholder="All Status"
                  style={{ height: '42px', minWidth: '150px' }}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.aepsBtnRow}`} style={{ flex: '0 0 auto', alignSelf: 'flex-end', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <button className={styles.submitBtn} onClick={fetchData}>Apply</button>
                <button
                  className={styles.resetBtn}
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    dispatch(updateRechargeFilters({ fromDate: today, toDate: today, status: '' }));
                    dispatch(setRechargeSearchQuery(''));
                    dispatch(setRechargeCurrentPage(1));
                  }}
                  style={{ background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: '10px', height: '42px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.color = '#1756AA'; e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#fff'; }}
                >
                  <FiRefreshCw size={14} /><span className={styles.resetText}> Reset</span>
                </button>
              </div>
            </div>
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        fileNamePrefix="recharge_history"
        exportData={filteredList.map((item, index) => {
          return [
            'VIEW',
            (currentPage - 1) * rowsPerPage + index + 1,
            item.createdDate || item.date || 'N/A',
            `${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`,
            item.operatorName || item.operatorId || 'N/A',
            item.number || item.customerMobile || item.accountNo || 'N/A',
            item.status || 'PENDING',
            item.message || item.remark || 'N/A',
            item.openingBalance || '0.00',
            item.amount || '0.00',
            item.closingBalance || '0.00',
            item.orderId || item.txnId || item.transId || 'N/A',
            item.operatorId || 'N/A',
            `₹${(parseFloat(item.commission || item.totalCommission) || 0).toFixed(2)}`,
          ];
        })}
        renderRow={(item, index) => {
            let statusStyle = styles.statusPending;
            if (String(item.status).toUpperCase() === 'SUCCESS') statusStyle = styles.statusSuccess;
            if (String(item.status).toUpperCase() === 'FAILED' || String(item.status).toUpperCase() === 'REJECTED') statusStyle = styles.statusFailed;

            return (
              <tr key={item.id || index}>
                <td>
                  <button
                    onClick={() => { setSelectedTxn({ ...item, _type: 'recharge' }); setIsModalOpen(true); }}
                    style={{ background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color:'#fff', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}
                  >VIEW</button>
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
                <td>₹{item.closingBalance || '0.00'}</td>
                <td>{item.orderId || item.txnId || item.transId || 'N/A'}</td>
                <td>{item.operatorName || item.operatorId || 'N/A'}</td>
                <td style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                  ₹{(parseFloat(item.commission || item.totalCommission) || 0).toFixed(2)}
                </td>
              </tr>
            );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setRechargeSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { dispatch(setRechargeRowsPerPage(val)); dispatch(setRechargeCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setRechargeCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedTxn} />
    </div>
  );
};

export default RechargeHistory;
