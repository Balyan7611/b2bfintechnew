import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import ReactDOM from 'react-dom';
import { Cells as UplineCells, getUplineShape } from '../../../../shared/components/common/UplineCommissionCols';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { 
  setAEPSList, 
  updateAEPSFilters, 
  setAEPSSearchQuery, 
  setAEPSRowsPerPage, 
  setAEPSCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import StatsGrid from '../../../../shared/components/common/StatsGrid';
import { FiBarChart2 } from 'react-icons/fi';
import ReceiptModal from '../../../../shared/components/common/ReceiptModal';
import styles from './AEPSReport.module.css';
import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';
import { resolveReportScopeId } from '../../../../utils/reportScope';
import { isApiPanel } from '../../../../utils/memberIdentity';
import { getSession } from '../../../../utils/authUtils';

const AEPSReport = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.aepsReport);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailMode, setViewDetailMode] = useState(false);
  
  const handleViewReceipt = (txn) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };
  
  const [masterServices, setMasterServices] = useState([]);
  const [masterOperators, setMasterOperators] = useState([]);
  const [masterApis, setMasterApis] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [aepsServiceIds, setAepsServiceIds] = useState([]);
  const [breakdownTxn, setBreakdownTxn] = useState(null);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const svcRes = await API.service.getAll();
        const allSvcs = Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : [];
        const aepsSvcs = allSvcs.filter(s => String(s.sectionType) === '10' || String(s.sectionType) === '9');
        setMasterServices(aepsSvcs);
        setAepsServiceIds(aepsSvcs.map(s => String(s.id)));
      } catch (e) { console.error('AEPSReport: services fetch failed', e); }
      try {
        const opRes = await API.operator.getAll({ pageSize: 1000 });
        setMasterOperators(Array.isArray(opRes?.data?.items) ? opRes.data.items : Array.isArray(opRes?.data) ? opRes.data : Array.isArray(opRes) ? opRes : []);
      } catch (e) { console.error('AEPSReport: operators fetch failed', e); }
      try {
        const apiRes = await API.masterApi.getAll({ pageSize: 500 });
        setMasterApis(Array.isArray(apiRes?.data?.items) ? apiRes.data.items : Array.isArray(apiRes?.data) ? apiRes.data : Array.isArray(apiRes) ? apiRes : []);
      } catch (e) { console.error('AEPSReport: APIs fetch failed', e); }
    };
    fetchMasters();
  }, []);

  const fetchAEPSReport = async () => {
    const session = getSession();
    const memberMsrNo = session?.msrno || session?.userId || 2;

    // Fail closed: never query with a blank memberId (that returns every
    // account's rows). If we can't resolve who we are, load nothing.
    const { id: scopeId, error: scopeError } = await resolveReportScopeId();
    if (!scopeId) {
      console.error('[AEPSReport.jsx]', scopeError);
      dispatch(setAEPSList([]));
      return;
    }

    try {
                        const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: filters.serviceId || '',
        serviceIds: filters.serviceId ? [] : aepsServiceIds,
        sectionType: '9,10',
        operatorId: filters.operatorId || '',
        apiId: '',
        memberId: scopeId,
        status: filters.status || ''
      });
      
      let rawData = [];
      if (res && res.status === true) {
        if (Array.isArray(res.data)) {
          rawData = res.data;
        } else if (res.data && Array.isArray(res.data.items)) {
          rawData = res.data.items;
        }
      } else if (res && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (Array.isArray(res)) {
        rawData = res;
      } else if (res && Array.isArray(res.items)) {
        rawData = res.items;
      } else if (res && res.data && Array.isArray(res.data.items)) {
        rawData = res.data.items;
      }
      
            const uniqueMsrnos = [...new Set(rawData.map(i => i.memberId || i.msrNo || memberMsrNo).filter(Boolean))];
      const memberMap = {};

      // Upline/downline commission hierarchy is a Member-panel concept; API
      // accounts aren't in the Member table, and any generic numeric id from
      // their rows can coincidentally match an unrelated Member — so skip
      // this name-enrichment lookup entirely on the API panel.
      if (!isApiPanel()) {
        await Promise.allSettled(
          uniqueMsrnos.map(async (msrno) => {
            try {
              const res = await API.member.getById(msrno);
              const m = res?.data?.data || res?.data || res || {};

              const name = m.name || m.fullName || m.memberName || m.ownerName || m.firstName || m.firmName || '';
              const loginId = m.memberID || m.memberid || m.loginID || m.loginId || m.username || String(msrno);

              if (name || loginId) {
                memberMap[String(msrno)] = { name, loginId };
              }
            } catch (err) {
              console.error(`Failed to fetch member details for msrno ${msrno}`, err);
            }
          })
        );
      }

      const mappedList = rawData.map((item, idx) => {
        const msrno = String(item.memberId || item.msrNo || memberMsrNo);
        let resolvedName = item.memberName || item.customerName || item.name || session?.name || 'Member';
        let resolvedLoginId = msrno;

        if (memberMap[msrno]) {
           resolvedName = memberMap[msrno].name || resolvedName;
           resolvedLoginId = memberMap[msrno].loginId || resolvedLoginId;
        }
        
        return {
          ...item,
          memberName: resolvedName,
          memberId: resolvedLoginId,
        };
      });
      
      dispatch(setAEPSList(mappedList));
    } catch (error) {
      console.error("Error in fetchAEPSReport:", error);
      dispatch(setAEPSList([]));
    }
  };

  const fetchData = async () => {
    // Fail closed: never query with a blank memberId (that returns every
    // account's rows). If we can't resolve who we are, load nothing.
    const { id: scopeId, error: scopeError } = await resolveReportScopeId();
    if (!scopeId) {
      console.error('[AEPSReport.jsx]', scopeError);
      dispatch(setAEPSList([]));
      return;
    }
    try {
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: filters.serviceId || '',
        serviceIds: filters.serviceId ? [] : aepsServiceIds,
        sectionType: '9,10',
        operatorId: filters.operatorId || '',
        memberId: scopeId,
        status: filters.status || ''
      });
      const { items: rawData } = normalizeTxnResponse(res);
      dispatch(setAEPSList(rawData));
    } catch (e) {
      console.error('[AEPSReport.jsx] fetch error:', e);
      dispatch(setAEPSList([]));
    }
  };

      useEffect(() => { fetchData(); }, [dispatch, currentPage, rowsPerPage, filters.fromDate, filters.toDate, filters.status, filters.serviceId]);

  const filteredList = list.filter(item => {
    const name = item.memberName || '';
    const mId = item.memberId || '';
    const adhr = item.aadhar || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         String(mId).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         String(adhr).includes(searchQuery);
    
    const matchesStatus = filters.status ? String(item.status).toUpperCase() === String(filters.status).toUpperCase() : true;
    
    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateAEPSFilters({ [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchAEPSReport();
  };
  
  const { roles: uplineRoles, cols: uplineCols } = getUplineShape(list);
  const uplineColNames = Array.from({ length: uplineCols }, (_, i) => uplineRoles[i]?.roleName?.toUpperCase() || `L${i+1}`);
  const displayColumns = ['#', 'Date & Time', 'BC Code', 'BC Name', 'Bank', 'Aadhaar No', 'Mobile', 'Amount', 'Txn ID', 'Bank RRN', 'Type', 'Status', 'Receipt', 'Remark', 'ADMIN', 'TDS', 'UPLINE TOTAL', ...uplineColNames];

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
      {!viewDetailMode ? (
        <>
          <StatsGrid stats={stats} showStats={showStats} />
      <AdminTable
            title="AEPS REPORT"
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
                    <input 
                      type="date" 
                      className={styles.inputControl}
                      name="fromDate"
                      value={filters.fromDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>To Date</label>
                    <input 
                      type="date" 
                      className={styles.inputControl}
                      name="toDate"
                      value={filters.toDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                                    <div className={styles.formGroup}>
                    <label>Service</label>
                    <SearchableSelect
                      value={filters.serviceId || ''}
                      onChange={(val) => handleFilterChange({ target: { name: 'serviceId', value: val || '' } })}
                      options={[
                        { label: 'All Services', value: '' },
                        ...masterServices.map(s => ({
                          label: s.name || s.serviceName || s.title || s.id,
                          value: s.id || s.serviceId
                        }))
                      ]}
                      placeholder="All Services"
                      style={{ height: '42px', minWidth: '150px', fontSize: '0.85rem' }}
                    />
                  </div>

                                    <div className={styles.formGroup}>
                    <label>Status</label>
                    <SearchableSelect
                      value={filters.status}
                      onChange={(val) => handleFilterChange({ target: { name: 'status', value: val || '' } })}
                      options={[
                        { label: 'All Status', value: '' },
                        { label: 'Success', value: 'SUCCESS' },
                        { label: 'Pending', value: 'PENDING' },
                        { label: 'Failed', value: 'FAILED' }
                      ]}
                      placeholder="All Status"
                      style={{ height: '42px', minWidth: '150px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px' }}>
                    <button className={styles.submitBtn} onClick={fetchData} style={{ width: '140px', boxSizing: 'border-box', flexShrink: 0 }}>
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        dispatch(updateAEPSFilters({ fromDate: today, toDate: today, status: '', serviceId: '' }));
                        dispatch(setAEPSSearchQuery(''));
                        dispatch(setAEPSCurrentPage(1));
                      }}
                      style={{ background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: '10px', height: '42px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '120px', boxSizing: 'border-box', flexShrink: 0 }}
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
            fileNamePrefix="aeps_report"
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
                (currentPage - 1) * rowsPerPage + index + 1,
                item.createdDate || item.date || 'N/A',
                item.memberId || item.loginId || 'N/A',
                item.memberName || 'N/A',
                item.bankName || 'N/A',
                item.aadhar || item.aadharNo || 'N/A',
                item.mobile || item.mobileNumber || item.customerMobile || item.number || 'N/A',
                item.amount || '0.00',
                item.bankTransId || item.orderId || item.transId || 'N/A',
                item.rrn || item.vendorId || 'N/A',
                item.transactionType || item.mode || item.serviceName || 'N/A',
                item.status || 'PENDING',
                'VIEW',
                item.remark || item.message || 'N/A',
                `₹${adminComm.toFixed(2)}`,
                `₹${tds.toFixed(2)}`,
                `₹${uplineTotal.toFixed(2)}`,
                ...uplineCells,
              ];
            })}
            searchQuery={searchQuery}
            onSearchChange={(val) => dispatch(setAEPSSearchQuery(val))}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => {
              dispatch(setAEPSRowsPerPage(val));
              dispatch(setAEPSCurrentPage(1));
            }}
            currentPage={currentPage}
            onPageChange={(val) => dispatch(setAEPSCurrentPage(val))}
            totalEntries={totalEntries}
            totalPages={totalPages}
            renderRow={(item, index) => {
              let statusStyle = styles.statusPending;
              if (String(item.status).toUpperCase() === 'SUCCESS') statusStyle = styles.statusSuccess;
              if (String(item.status).toUpperCase() === 'FAILED' || String(item.status).toUpperCase() === 'REJECTED') statusStyle = styles.statusFailed;

              return (
                <tr key={item.id || index}>
                  <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{item.createdDate || item.date || 'N/A'}</td>
                  <td>{item.memberId || item.loginId || 'N/A'}</td>
                  <td>{item.memberName || 'N/A'}</td>
                  <td>{item.bankName || 'N/A'}</td>
                  <td>{item.aadhar || item.aadharNo || 'N/A'}</td>
                  <td>{item.mobile || item.mobileNumber || item.customerMobile || item.number || 'N/A'}</td>
                  <td>₹{item.amount || '0.00'}</td>
                  <td>{item.bankTransId || item.orderId || item.transId || 'N/A'}</td>
                  <td>{item.rrn || item.vendorId || 'N/A'}</td>
                  <td>{item.transactionType || item.mode || item.serviceName || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusStyle}`}>
                      {item.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewReceipt(item)}
                      style={{ background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color:'#fff', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}
                    >VIEW</button>
                  </td>
                  <td>{item.remark || item.message || 'N/A'}</td>
                  <UplineCells txn={item} transactions={list} onBreakdown={setBreakdownTxn} />
                </tr>
              );
            }}
          />
          <ReceiptModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={selectedTxn} 
          />
        </>
      ) : (
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <button className={styles.backBtn} onClick={() => setViewDetailMode(false)}>
              &larr; Back to History
            </button>
            <h2 className={styles.detailTitle}>Transaction Details</h2>
            <button 
              className={styles.printBtn}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Print Receipt
            </button>
          </div>
          
          {selectedTxn && (
            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction ID</span>
                <span className={styles.detailValue}>{selectedTxn.bankTransId || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>RRN Number</span>
                <span className={styles.detailValue}>{selectedTxn.rrn || '-'}</span>
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
                <span className={styles.detailValue}>{selectedTxn.memberName || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Aadhar Number</span>
                <span className={styles.detailValue}>{selectedTxn.aadhar || '-'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Type</span>
                <span className={styles.detailValue}>{selectedTxn.type || '-'}</span>
              </div>
              
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Transaction Amount</span>
                <span className={styles.detailValue} style={{fontSize: '1.2rem', fontWeight: 800}}>₹{selectedTxn.amount || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Commission Earned</span>
                <span className={styles.detailValue} style={{color: '#10b981'}}>₹{selectedTxn.commission || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Opening Balance</span>
                <span className={styles.detailValue}>₹{selectedTxn.opening || '0.00'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Closing Balance</span>
                <span className={styles.detailValue}>₹{selectedTxn.closing || '0.00'}</span>
              </div>
            </div>
          )}
          
          <ReceiptModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={selectedTxn} 
          />
        </div>
      )}
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

export default AEPSReport;
