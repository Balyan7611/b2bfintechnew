import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch } from 'react-icons/fi';
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
import { useState } from 'react';
import { API } from '../../../../api/endpoints';
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
  }, []);

  const fetchAEPSReport = async () => {
    const session = getSession();
    const memberMsrNo = session?.msrno || session?.userId || 2;
    
    try {
      // NOTE: Admin panel fetches with empty memberId to get all data.
      // When memberId is passed as '2', backend returns 0 results because 
      // transactions may not be linked to memberId in DB. Pass empty to fetch all.
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '',
        sectionType: '9,10',
        operatorId: filters.operatorId || '',
        apiId: '',
        memberId: '',   // Pass empty like admin — backend JWT already scopes the result
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
      
      // Gather unique member IDs
      const uniqueMsrnos = [...new Set(rawData.map(i => i.memberId || i.msrNo || memberMsrNo).filter(Boolean))];
      const memberMap = {};
      
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


  useEffect(() => {
    fetchAEPSReport();
  }, [dispatch, currentPage, rowsPerPage]);

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
  
  const displayColumns = ['SNO', 'Transaction Date', 'Member Id', 'Member Name', 'AadharNumber', 'Bank Name', 'Transaction Type', 'Opening Bal', 'Amount', 'Commission', 'Closing Bal', 'Bank TransID', 'Status', 'View Receipt', 'Remark'];

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
                    <label>Status</label>
                    <select 
                      className={styles.inputControl}
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="SUCCESS">Success</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  <button className={styles.submitBtn} onClick={fetchAEPSReport}>
                    Apply Filters
                  </button>
                </div>
              </div>
            }
            columns={displayColumns}
            data={filteredList}
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
                  <td>{item.memberId || 'N/A'}</td>
                  <td>{item.memberName || 'N/A'}</td>
                  <td>{item.aadhar || item.aadharNo || 'N/A'}</td>
                  <td>{item.bankName || 'N/A'}</td>
                  <td>{item.transactionType || item.mode || item.serviceName || 'N/A'}</td>
                  <td>₹{item.openingBalance || '0.00'}</td>
                  <td>₹{item.amount || '0.00'}</td>
                  <td>₹{item.commission || item.totalCommission || '0.00'}</td>
                  <td>₹{item.closingBalance || '0.00'}</td>
                  <td>{item.rrn || item.vendorId || item.bankTransId || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusStyle}`}>
                      {item.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => handleViewReceipt(item)}
                      title="View Receipt"
                    >
                      <FiSearch />
                    </button>
                  </td>
                  <td>{item.remark || item.message || 'N/A'}</td>
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
    </div>
  );
};

export default AEPSReport;
