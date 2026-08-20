import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import ReactDOM from 'react-dom';
import { Cells as UplineCells, getUplineShape } from '../../../../shared/components/common/UplineCommissionCols';
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
  const [breakdownTxn, setBreakdownTxn] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const { items: rawData } = normalizeTxnResponse(res);
      dispatch(setBBPSList(rawData));
    } catch (e) {
      console.error('[BBPSHistory.jsx] fetch error:', e);
      dispatch(setBBPSList([]));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status]);

  const filteredList = list.filter(item => item.consumer?.toLowerCase().includes(searchQuery.toLowerCase()) || item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()));

  const { roles: uplineRoles, cols: uplineCols } = getUplineShape(filteredList);
  const uplineColNames = Array.from({ length: uplineCols }, (_, i) => uplineRoles[i]?.roleName?.toUpperCase() || `L${i+1}`);
  const displayColumns = ['Receipt', 'SNO', 'Date Time', 'Recharge By', 'Operator', 'Number', 'Status', 'Opening Bal', 'Amount', 'Closing Bal', 'TXID', 'Operator Id', 'Remark', 'ADMIN', 'TDS', 'UPLINE TOTAL', ...uplineColNames];

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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={styles.submitBtn} onClick={fetchData}>Apply</button>
                <button
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
                  <FiRefreshCw size={14} /> Reset
                </button>
              </div>
            </div>
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        fileNamePrefix="bbps_history"
        exportData={filteredList.map((item, index) => {
          const breakdown = item.uplineBreakdown || [];
          const commission = parseFloat(item.commission) || 0;
          const tds = parseFloat(item.tds) || 0;
          const uplineTotal = item.uplineCommission != null
            ? parseFloat(item.uplineCommission)
            : breakdown.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
          const adminComm = Math.max(0, commission - uplineTotal);
          const uplineCells = Array.from({ length: uplineCols }, (_, i) => {
            const r = breakdown[i];
            return r ? `₹${Number(r.amount || 0).toFixed(2)} (${r.memberName || '—'})` : '—';
          });
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
            `₹${adminComm.toFixed(2)}`,
            `₹${tds.toFixed(2)}`,
            `₹${uplineTotal.toFixed(2)}`,
            ...uplineCells,
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
                <UplineCells txn={item} transactions={filteredList} onBreakdown={setBreakdownTxn} />
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
      {breakdownTxn && ReactDOM.createPortal(
        <>
          <div onClick={() => setBreakdownTxn(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: 'linear-gradient(135deg,#0D1B5E,#1a2f8a)', borderRadius: 16, padding: '24px 28px', minWidth: 'min(320px, 90vw)', maxWidth: 'min(440px, 95vw)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900 }}>UPLINE BREAKDOWN</div>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>TXN: {breakdownTxn.orderId || breakdownTxn.id || '—'}</p>
              </div>
              <button onClick={() => setBreakdownTxn(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Total Upline</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>₹{Number(breakdownTxn.uplineCommission || 0).toFixed(2)}</span>
            </div>
            {(breakdownTxn.uplineBreakdown || []).map((row, i) => {
              const colors = ['#1756AA','#7C3AED','#0891B2'];
              const bg = ['rgba(23,86,170,0.15)','rgba(124,58,237,0.15)','rgba(8,145,178,0.15)'];
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg[i]||bg[2], borderRadius: 8, padding: '10px 14px', marginBottom: 8, borderLeft: `3px solid ${colors[i]||colors[2]}` }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>{row.roleName || `L${i+1}`}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{row.memberName || '—'}</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4ade80' }}>₹{Number(row.amount || 0).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default BBPSHistory;
