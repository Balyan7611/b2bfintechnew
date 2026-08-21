import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setPayoutList, 
  updatePayoutFilters, 
  setPayoutSearchQuery, 
  setPayoutRowsPerPage, 
  setPayoutCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import StatsGrid from '../../../../shared/components/common/StatsGrid';
import { FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import styles from './AEPSReport.module.css';
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';
import { resolveReportScopeId } from '../../../../utils/reportScope';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';

const PayoutHistory = () => {
  const dispatch = useDispatch();
  const { list, filters, searchQuery, rowsPerPage, currentPage } = useSelector(state => state.report.payoutReport);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [viewDetailMode, setViewDetailMode] = useState(false);
  // Working receipt modal (same pattern as DMTHistory.jsx) — Payout's receipt
  // should be the exact same DMT-style receipt, everywhere. _type: 'dmt' routes
  // it through the shared generic ReceiptBody instead of the AEPS layout.
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [payoutServiceIds, setPayoutServiceIds] = useState([]);
  // Gate every transaction fetch on this: until payoutServiceIds is loaded,
  // a fetch would go out with an empty serviceIds filter (only sectionType
  // sent), which isn't strict enough and can let non-Payout rows leak in.
  const [mastersLoaded, setMastersLoaded] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const svcRes = await API.service.getAll();
        setMasterServices(Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : []);
        const allSvcs = Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : [];
        setPayoutServiceIds(allSvcs.filter(s => String(s.sectionType) === '3').map(s => String(s.id)));
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

  }, [dispatch]);

  const fetchData = async () => {
    // Fail closed: never query with a blank memberId (that returns every
    // account's rows). If we can't resolve who we are, load nothing.
    const { id: scopeId, error: scopeError } = await resolveReportScopeId();
    if (!scopeId) {
      console.error('[PayoutHistory.jsx] %s', scopeError);
      dispatch(setPayoutList([]));
      return;
    }
    try {
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '',
        serviceIds: payoutServiceIds,
        sectionType: '3',
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
      dispatch(setPayoutList(rawData));
    } catch (e) {
      console.error('[PayoutHistory.jsx] fetch error:', e);
      dispatch(setPayoutList([]));
    }
  };

      useEffect(() => {
        if (!mastersLoaded) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status, mastersLoaded]);

  const filteredList = list.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.accNo?.includes(searchQuery));

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
  
  // Member/API panel: show only this account's own commission, not the
  // admin/upline commission ladder (same fix as AEPSReport.jsx).
  const formatHeader = (key) => key.replace(/([A-Z])/g, ' $1').toUpperCase();
  const displayColumns = dynamicColumns.length > 0
    ? ['SNO', ...dynamicColumns.map(formatHeader), 'RECEIPT', 'COMMISSION']
    : ['SNO', 'DATE & TIME', 'MEMBER DETAIL', 'BANK NAME', 'ACCOUNT NO', 'AMOUNT', 'CHARGES', 'TOTAL', 'STATUS', 'RECEIPT', 'COMMISSION'];

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
      {!viewDetailMode ? (
        <>
        <StatsGrid stats={stats} showStats={showStats} showAdminBreakdown={false} />
      <AdminTable
          title="PAYOUT HISTORY"
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
                <div className={styles.formGroup}><label>From Date</label><input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updatePayoutFilters({fromDate: e.target.value}))} /></div>
                <div className={styles.formGroup}><label>To Date</label><input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updatePayoutFilters({toDate: e.target.value}))} /></div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <SearchableSelect
                    value={filters.status}
                    onChange={(val) => dispatch(updatePayoutFilters({ status: val || '' }))}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={styles.submitBtn} onClick={fetchData}>Apply</button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      dispatch(updatePayoutFilters({ fromDate: today, toDate: today, status: '' }));
                      dispatch(setPayoutSearchQuery(''));
                      dispatch(setPayoutCurrentPage(1));
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
          fileNamePrefix="payout_history"
          exportData={filteredList.map((item, index) => [
            (currentPage - 1) * rowsPerPage + index + 1,
            ...dynamicColumns.map(colKey => {
              const v = item[colKey];
              if (v === null || v === undefined) return 'N/A';
              if (typeof v === 'object') return JSON.stringify(v);
              if (String(v).includes('T') && String(v).length > 10) return String(v).split('T')[0];
              return String(v);
            }),
            `₹${(parseFloat(item.commission || item.totalCommission) || 0).toFixed(2)}`,
          ])}
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
                <td>
                  <button
                    onClick={() => { setSelectedTxn({ ...item, _type: 'dmt' }); setIsModalOpen(true); }}
                    style={{ background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color: '#fff', border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >VIEW</button>
                </td>
                <td style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                  ₹{(parseFloat(item.commission || item.totalCommission) || 0).toFixed(2)}
                </td>
              </tr>
            );
          }}
          searchQuery={searchQuery}
          onSearchChange={(val) => dispatch(setPayoutSearchQuery(val))}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => { dispatch(setPayoutRowsPerPage(val)); dispatch(setPayoutCurrentPage(1)); }}
          currentPage={currentPage}
          onPageChange={(val) => dispatch(setPayoutCurrentPage(val))}
          totalEntries={filteredList.length}
          totalPages={Math.ceil(filteredList.length / rowsPerPage)}
        />
        </>
      ) : (
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <button className={styles.backBtn} onClick={() => setViewDetailMode(false)}>
              &larr; Back to History
            </button>
            <h2 className={styles.detailTitle}>Payout Details</h2>
            <button className={styles.printBtn} onClick={() => window.print()}>
              Print Receipt
            </button>
          </div>
          
          {selectedTxn && (
            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction ID</span>
                <span className={styles.detailValue}>{selectedTxn.txnId || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>UTR / Ref Number</span>
                <span className={styles.detailValue}>{selectedTxn.utr || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Date</span>
                <span className={styles.detailValue}>{selectedTxn.date || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Status</span>
                <span className={`${styles.statusBadge} ${selectedTxn.status === 'SUCCESS' ? styles.statusSuccess : selectedTxn.status === 'FAILED' ? styles.statusFailed : styles.statusPending}`}>
                  {selectedTxn.status || 'PENDING'}
                </span>
              </div>
              
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Member ID</span>
                <span className={styles.detailValue} style={{color: '#1756AA'}}>{selectedTxn.memberId || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Member Name</span>
                <span className={styles.detailValue}>{selectedTxn.name || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Bank Name</span>
                <span className={styles.detailValue}>{selectedTxn.bank || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Account Number</span>
                <span className={styles.detailValue}>{selectedTxn.accNo || '-'}</span>
              </div>
              
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Payout Amount</span>
                <span className={styles.detailValue} style={{fontSize: '1.2rem', fontWeight: 800}}>₹{selectedTxn.amount || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Charges</span>
                <span className={styles.detailValue} style={{color: '#E74C3C'}}>₹{selectedTxn.charges || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Total Deducted</span>
                <span className={styles.detailValue}>₹{selectedTxn.total || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Remarks</span>
                <span className={styles.detailValue}>{selectedTxn.remarks || '-'}</span>
              </div>
            </div>
          )}
        </div>
      )}
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedTxn} />
    </div>
  );
};

export default PayoutHistory;
