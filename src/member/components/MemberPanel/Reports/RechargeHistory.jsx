import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Cells as UplineCells, getUplineShape } from '../../../../shared/components/common/UplineCommissionCols';
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
import { FiFilter, FiSearch, FiDatabase } from 'react-icons/fi';
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';

const RechargeHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.rechargeReport);

  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [breakdownTxn, setBreakdownTxn] = useState(null);

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
        sectionType: '1',
        operatorId: filters.operatorId || '',
        memberId: '',
        status: filters.status || ''
      });
      const { items: rawData } = normalizeTxnResponse(res);
      console.log('[RechargeHistory.jsx] rows:', rawData.length);
      dispatch(setRechargeList(rawData));
    } catch (e) {
      console.error('[RechargeHistory.jsx] fetch error:', e);
      dispatch(setRechargeList([]));
    }
  };

  // Auto-fetch on mount and when filters/page change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status]);

  const filteredList = list.filter(item => item.number?.includes(searchQuery) || item.txnId?.toLowerCase().includes(searchQuery.toLowerCase()));

  const { roles: uplineRoles, cols: uplineCols } = getUplineShape(list);
  const uplineColNames = Array.from({ length: uplineCols }, (_, i) => uplineRoles[i]?.roleName?.toUpperCase() || `L${i+1}`);
  const displayColumns = ['Receipt', 'SNO', 'Date', 'Member Details', 'Operator', 'Number', 'Status', 'Message', 'Opening Bal', 'Amount', 'Closing Bal', 'TXID', 'Operator Id', 'ADMIN', 'TDS', 'UPLINE TOTAL', ...uplineColNames];

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
                <select className={styles.inputControl} value={filters.status} onChange={(e) => dispatch(updateRechargeFilters({ status: e.target.value }))}>
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
                <button className={styles.submitBtn} onClick={fetchData}>Apply Filters</button>
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
                  <button
                    onClick={() => { setSelectedTxn(item); setIsModalOpen(true); }}
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
                <UplineCells txn={item} transactions={list} onBreakdown={setBreakdownTxn} />
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
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedTxn} />

      {/* ── Upline Commission Breakdown Modal — rendered via Portal to escape parent transforms ── */}
      {breakdownTxn && ReactDOM.createPortal(
        <>
          <div
            onClick={() => setBreakdownTxn(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,0.55)', backdropFilter: 'blur(4px)', zIndex: 8000 }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 8001, width: '100%', maxWidth: 480,
            background: '#fff', borderRadius: 16,
            boxShadow: '0 24px 64px rgba(10,20,50,0.28)',
            overflow: 'hidden', fontFamily: 'Arial, sans-serif',
          }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0A1428, #1756AA)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 800 }}>Upline Commission Breakdown</h3>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>
                  TXN: {breakdownTxn.orderId || breakdownTxn.txnId || '—'}
                </p>
              </div>
              <button onClick={() => setBreakdownTxn(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Total */}
            <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>Total Upline Earning</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>
                ₹{Number(breakdownTxn.uplineCommission).toFixed(2)}
              </span>
            </div>

            {/* Breakdown list */}
            <div style={{ padding: '12px 20px 20px', maxHeight: 340, overflowY: 'auto' }}>
              {(breakdownTxn.uplineBreakdown || []).map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', marginBottom: 8,
                  background: '#f8fafc', borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}>
                  {/* Level badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'linear-gradient(135deg,#1756AA,#0A1428)' : 'linear-gradient(135deg,#7c3aed,#4c1d95)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 900,
                  }}>
                    L{row.levelNo || i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.memberName || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                      {row.roleName || `Level ${row.levelNo || i + 1}`}
                      {row.memberMobile ? ` · ${row.memberMobile}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d' }}>
                      +₹{Number(row.amount || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 1 }}>
                      {row.createdOn ? new Date(row.createdOn).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default RechargeHistory;
