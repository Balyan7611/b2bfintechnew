import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Cells as UplineCells, getUplineShape } from '../../../../shared/components/common/UplineCommissionCols';
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
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import StatsGrid from '../../../../shared/components/common/StatsGrid';
import { FiBarChart2 } from 'react-icons/fi';
import styles from './AEPSReport.module.css'; // Reusing common report styles
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';

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
  const [showStats, setShowStats] = useState(false);
  const [breakdownTxn, setBreakdownTxn] = useState(null);
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
        serviceId: '16',
        sectionType: '7',
        operatorId: filters.operatorId || '',
        memberId: '',
        status: filters.status || ''
      });
      const { items: rawData } = normalizeTxnResponse(res);
      console.log('[DMTHistory.jsx] rows:', rawData.length);
      dispatch(setDMTList(rawData));
    } catch (e) {
      console.error('[DMTHistory.jsx] fetch error:', e);
      dispatch(setDMTList([]));
    }
  };

  // Auto-fetch on mount and when filters/page change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status]);

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

  const { roles: uplineRoles, cols: uplineCols } = getUplineShape(list);
  const uplineColNames = Array.from({ length: uplineCols }, (_, i) => uplineRoles[i]?.roleName?.toUpperCase() || `L${i+1}`);
  const displayColumns = ['S.No', 'AddDate', 'Member Details', 'Sender Mobile No.', 'Beni Name', 'BankName', 'Account No', 'IFSC', 'Opening Bal', 'Amount', 'Charge', 'CashBack', 'TDS', 'Closing Bal', 'TransID', 'GST', 'Reference', 'Vendore ID', 'Mode', 'Source', 'Status', 'Receipt', 'Remark', 'ADMIN', 'UPLINE TOTAL', ...uplineColNames];

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
        title="DMT HISTORY"
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
                  <td>{item.orderId || item.txnId || item.transId || 'N/A'}</td>
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
                    <button
                      onClick={() => { setSelectedTxn(item); setIsModalOpen(true); }}
                      style={{ background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color:'#fff', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}
                    >VIEW</button>
                  </td>
                  <td>{item.remark || item.message || 'N/A'}</td>
                  <UplineCells txn={item} transactions={list} onBreakdown={setBreakdownTxn} />
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
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedTxn} />
      {breakdownTxn && ReactDOM.createPortal(
        <>
          <div onClick={() => setBreakdownTxn(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: 'linear-gradient(135deg,#0D1B5E,#1a2f8a)', borderRadius: 16, padding: '24px 28px', minWidth: 320, maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', color: '#fff' }}>
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

export default DMTHistory;
