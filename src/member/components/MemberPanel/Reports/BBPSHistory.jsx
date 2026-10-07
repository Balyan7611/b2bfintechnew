import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
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
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';
import { resolveReportScopeId } from '../../../../utils/reportScope';

const BBPSHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.bbpsReport);

  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [bbpsServiceIds, setBbpsServiceIds] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Gate every transaction fetch on this: until bbpsServiceIds is loaded, a
  // fetch would go out with an empty serviceIds filter (only sectionType
  // sent), which isn't strict enough and can let non-BBPS rows leak in.
  const [mastersLoaded, setMastersLoaded] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const svcRes = await API.service.getAll();
        setMasterServices(Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : []);
        const allSvcs = Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : [];
        setBbpsServiceIds(allSvcs.filter(s => String(s.sectionType) === '2').map(s => String(s.id)));
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
      console.error('[BBPSHistory.jsx] %s', scopeError);
      dispatch(setBBPSList([]));
      return;
    }
    try {
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '',
        serviceIds: bbpsServiceIds,
        sectionType: '2',
        operatorId: filters.operatorId || '',
        memberId: scopeId,
        status: filters.status || ''
      });
      const { items: rawItems } = normalizeTxnResponse(res);
      // Wallet-transfer records (admin adding/deducting funds via Member
      // Control Center) get mistagged server-side with SectionType values
      // that leak into other reports — they reliably carry a "WT..." order
      // ID though. Filter those out as a stopgap.
      // Separately: plain Recharge transactions have also been seen leaking
      // in here under sectionType '2' (same mistagging bug, same fix already
      // applied to the admin BBPSTransaction.jsx) — they show up with a
      // mobile network instead of a real biller and no consumer/account
      // number at all. A genuine BBPS bill has a consumer/account number, so
      // require one.
      const rawData = rawItems.filter(t => {
        const isWt = String(t.orderId || t.vendorId || '').toUpperCase().startsWith('WT');
        const num = String(t.consumer || t.accountNo || t.number || '').trim();
        const hasConsumerNo = num && num.toUpperCase() !== 'N/A';
        return !isWt && hasConsumerNo;
      });
      dispatch(setBBPSList(rawData));
    } catch (e) {
      console.error('[BBPSHistory.jsx] fetch error:', e);
      dispatch(setBBPSList([]));
    }
  };

  useEffect(() => {
    if (!mastersLoaded) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status, mastersLoaded]);

  const filteredList = list.filter(item => item.consumer?.toLowerCase().includes(searchQuery.toLowerCase()) || item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Member/API panel: show only this account's own commission, not the
  // admin/upline commission ladder (same fix as AEPSReport.jsx).
  const displayColumns = ['Receipt', 'SNO', 'Date Time', 'Recharge By', 'Operator', 'Number', 'Status', 'Opening Bal', 'Amount', 'Closing Bal', 'TXID', 'Operator Id', 'Remark', 'Commission'];

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
                <SearchableSelect
                  value={filters.category}
                  onChange={(val) => dispatch(updateBBPSFilters({ category: val || '' }))}
                  options={[
                    { label: 'All Categories', value: '' },
                    { label: 'Electricity', value: 'Electricity' },
                    { label: 'Water', value: 'Water' },
                    { label: 'Gas', value: 'Gas' }
                  ]}
                  placeholder="All Categories"
                  style={{ height: '42px', minWidth: '150px' }}
                />
              </div>
              <div className={styles.aepsBtnRow} style={{ display: 'flex', gap: '8px' }}>
                <button className={styles.submitBtn} onClick={fetchData}>Apply</button>
                <button
                  className={styles.resetBtn}
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    dispatch(updateBBPSFilters({ fromDate: today, toDate: today, status: '', category: '' }));
                    dispatch(setBBPSSearchQuery(''));
                    dispatch(setBBPSCurrentPage(1));
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
        fileNamePrefix="bbps_history"
        exportData={filteredList.map((item, index) => {
          return [
            'VIEW',
            (currentPage - 1) * rowsPerPage + index + 1,
            item.createdDate || item.date || 'N/A',
            `${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`,
            item.operatorName || item.operatorId || 'N/A',
            item.consumer || item.number || item.accountNo || 'N/A',
            item.status || 'PENDING',
            item.openingBalance || '0.00',
            item.amount || '0.00',
            item.closingBalance || '0.00',
            item.orderId || item.txnId || item.transId || 'N/A',
            item.operatorId || 'N/A',
            item.remark || item.message || 'N/A',
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
                    onClick={() => { setSelectedTxn({ ...item, _type: 'bbps' }); setIsModalOpen(true); }}
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
                <td>₹{item.closingBalance || '0.00'}</td>
                <td>{item.orderId || item.txnId || item.transId || 'N/A'}</td>
                <td>{item.operatorName || item.operatorId || 'N/A'}</td>
                <td>{item.remark || item.message || 'N/A'}</td>
                <td style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                  ₹{(parseFloat(item.commission || item.totalCommission) || 0).toFixed(2)}
                </td>
              </tr>
            );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setBBPSSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { dispatch(setBBPSRowsPerPage(val)); dispatch(setBBPSCurrentPage(1)); }}
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
