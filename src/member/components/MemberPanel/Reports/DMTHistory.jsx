import React, { useEffect, useState, useRef } from 'react';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch, FiDatabase, FiRefreshCw } from 'react-icons/fi';
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
import styles from './AEPSReport.module.css'; import { API } from '../../../../api/endpoints';
import { normalizeTxnResponse } from '../../../../services/transaction.service';
import { resolveReportScopeId } from '../../../../utils/reportScope';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    // Fail closed: never query with a blank memberId (that returns every
    // account's rows). If we can't resolve who we are, load nothing.
    const { id: scopeId, error: scopeError } = await resolveReportScopeId();
    if (!scopeId) {
      console.error('[DMTHistory.jsx] %s', scopeError);
      dispatch(setDMTList([]));
      return;
    }
    try {
      const res = await API.transaction.getAll({
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        serviceId: '16',
        sectionType: '7',
        operatorId: filters.operatorId || '',
        memberId: scopeId,
        status: filters.status || ''
      });
      const { items: rawItems } = normalizeTxnResponse(res);
      // Wallet-transfer records (admin adding/deducting funds via Member
      // Control Center) get mistagged server-side with SectionType values
      // that leak into other reports — they reliably carry a "WT..." order
      // ID though. Filter those out as a stopgap.
      // Separately: plain Recharge/wallet transactions have also been seen
      // leaking into other reports under the same mistagging bug (same fix
      // already applied to the admin DMTHistory.jsx). A genuine DMT transfer
      // always has a beneficiary bank account number captured at initiation
      // (it has to be chosen before the transfer can even be attempted), so
      // require one — this is the same field this table's own "Account No"
      // column already reads from.
      const rawData = rawItems.filter(t => {
        const isWt = String(t.orderId || t.vendorId || '').toUpperCase().startsWith('WT');
        const hasAccount = String(t.accountNo || '').trim() && String(t.accountNo || '').trim().toUpperCase() !== 'N/A';
        return !isWt && hasAccount;
      });
      dispatch(setDMTList(rawData));
    } catch (e) {
      console.error('[DMTHistory.jsx] fetch error:', e);
      dispatch(setDMTList([]));
    }
  };

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

  // Member/API panel: show only this account's own commission, not the
  // admin/upline commission ladder (same fix as AEPSReport.jsx).
  const displayColumns = ['S.No', 'AddDate', 'Member Details', 'Sender Mobile No.', 'Beni Name', 'BankName', 'Account No', 'IFSC', 'Opening Bal', 'Amount', 'Charge', 'CashBack', 'TDS', 'Closing Bal', 'TransID', 'GST', 'Reference', 'Vendore ID', 'Mode', 'Source', 'Status', 'Receipt', 'Remark', 'Commission'];

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
                  style={{ height: '42px', minWidth: '150px' }}
                />
              </div>
              <div className={styles.aepsBtnRow} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minWidth: '220px' }}>
                <button className={styles.submitBtn} onClick={fetchData} style={{ flex: '1 1 120px', minWidth: '120px' }}>Apply</button>
                <button
                  className={styles.resetBtn}
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    dispatch(updateDMTFilters({ fromDate: today, toDate: today, status: '' }));
                    dispatch(setDMTSearchQuery(''));
                    dispatch(setDMTCurrentPage(1));
                  }}
                  style={{ background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: '10px', height: '42px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 100px', minWidth: '100px' }}
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
        fileNamePrefix="dmt_history"
        exportData={filteredList.map((item, index) => {
          return [
            (currentPage - 1) * rowsPerPage + index + 1,
            item.createdDate || item.date || 'N/A',
            `${item.memberName || 'N/A'} (${item.memberId || 'N/A'})`,
            item.customerMobile || item.senderMobile || 'N/A',
            item.beniName || item.beneficiaryName || 'N/A',
            item.bankName || 'N/A',
            item.accountNo || 'N/A',
            item.ifsc || 'N/A',
            item.openingBalance || '0.00',
            item.amount || '0.00',
            item.serviceCharge || item.charge || '0.00',
            item.cashback || '0.00',
            item.tds || item.totalTds || '0.00',
            item.closingBalance || '0.00',
            item.orderId || item.txnId || item.transId || 'N/A',
            item.gst || '0.00',
            item.refid || item.rrn || item.reference || 'N/A',
            item.vendorId || 'N/A',
            item.mode || 'N/A',
            item.ip || item.source || item.fromChannel || 'N/A',
            item.status || 'PENDING',
            'VIEW',
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
                      onClick={() => { setSelectedTxn({ ...item, _type: 'dmt' }); setIsModalOpen(true); }}
                      style={{ background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color:'#fff', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}
                    >VIEW</button>
                  </td>
                  <td>{item.remark || item.message || 'N/A'}</td>
                  <td style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                    ₹{(parseFloat(item.commission || item.totalCommission) || 0).toFixed(2)}
                  </td>
                </tr>
              );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setDMTSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { dispatch(setDMTRowsPerPage(val)); dispatch(setDMTCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setDMTCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedTxn} />
    </div>
  );
};

export default DMTHistory;
