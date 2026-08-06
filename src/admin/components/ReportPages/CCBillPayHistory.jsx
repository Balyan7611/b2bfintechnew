import React, { useState, useEffect, useCallback } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, 
  FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiActivity as FiSignal,
  FiUser, FiSmartphone, FiCpu, FiTrendingUp, FiShield, FiBarChart2
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';
import TransactionReceipt from '../../../member/components/MemberPanel/Services/TransactionReceipt';
import ActionMenu from '../../../shared/components/common/ActionMenu';
import ConfirmModal from '../../../shared/components/common/ConfirmModal';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import LogModal from '../../../shared/components/common/LogModal';
import StatsGrid from '../../../shared/components/common/StatsGrid';

const CCBillPayHistory = () => { 
  const [showStats, setShowStats] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const successCount = transactions.filter(t => t.status?.toLowerCase() === 'success').length;
  const pendingCount = transactions.filter(t => t.status?.toLowerCase() === 'pending').length;
  const failedCount = transactions.filter(t => t.status?.toLowerCase() === 'failed').length;
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [confirmData, setConfirmData] = useState({ show: false, action: null, txn: null });
  const [logModalData, setLogModalData] = useState({ show: false, txn: null });
  const { popup, showPopup, closePopup } = usePopup();
  const [focusedField, setFocusedField] = useState(null);
  const handleMenuAction = (actionName, txn) => {
    if (actionName === 'Force Fail' || actionName === 'Force Success' || actionName === 'Check Status') {
      setConfirmData({ show: true, action: actionName, txn });
    } else if (actionName === 'Get Logs') {
      setLogModalData({ show: true, txn });
    } else {
      showPopup('info', 'Action Triggered', `${actionName} triggered for txn ${txn.id || txn.orderId || 'N/A'}`);
    }
  };

  const handleConfirmAction = () => {
    const { action, txn } = confirmData;
    setConfirmData({ show: false, action: null, txn: null });
    
    setTimeout(() => {
      if (action === 'Check Status') {
        const status = txn && txn.status ? txn.status.toLowerCase() : 'pending';
        if (status === 'success') {
          showPopup('success', 'Status Checked', 'Congratulations! Status is Successful.');
        } else if (status === 'pending') {
          showPopup('warning', 'Status Checked', 'Transaction status is still Pending.');
        } else {
          showPopup('error', 'Status Checked', 'Transaction status is Failed / Rejected.');
        }
      } else {
        showPopup('success', 'Action Successful', `Successfully applied ${action} to the transaction.`);
      }
    }, 300);
  };

  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.member.search('');
        if (res && Array.isArray(res.data)) setMemberList(res.data);
        else if (Array.isArray(res)) setMemberList(res);
        else setMemberList([]);
      } catch (err) { console.error("Error fetching members:", err); }
    };
    fetchMembers();
  }, []);

  // ── Fetch BBPS / CC Bill Pay transactions ──
  const loadTransactions = useCallback(async (pg = 1) => {
    setIsLoading(true);
    try {
      const params = {
        sectionType: '2',   // BBPS
        pageNumber: pg,
        pageSize,
        ...(selectedMember && { memberId: selectedMember }),
        ...(fromDate        && { fromDate }),
        ...(toDate          && { toDate }),
        ...(searchKeyword.trim() && { keyword: searchKeyword.trim() }),
      };
      const res = await API.transaction.getAll(params);
      const data = res?.data?.data || res?.data || res || {};
      const items = Array.isArray(data.items) ? data.items
        : Array.isArray(data.data)  ? data.data
        : Array.isArray(data)       ? data
        : [];
      setTransactions(items);
      setTotalPages(data.totalPages || Math.ceil((data.totalCount || items.length) / pageSize) || 1);
      setPageNumber(pg);
    } catch (err) {
      console.error('[CCBillPay] fetch failed:', err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMember, fromDate, toDate, searchKeyword, pageSize]);

  // Initial load
  useEffect(() => { loadTransactions(1); }, []); // eslint-disable-line

  return (
    <div className={styles.container} style={{ padding: '20px' }}>
      {/* Dynamic Keyframe Animations for Button Rays */}
      <style>{`
        @keyframes successGlow {
          0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
          100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
        }
        @keyframes pendingGlow {
          0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(243, 156, 18, 0); }
          100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
        }
        @keyframes failedGlow {
          0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        padding: '12px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>Credit Card BillPay History</h3>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Stats Button */}
            <button 
              style={{
                background: '#0F172A',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
              onMouseOut={(e) => e.currentTarget.style.background = '#0F172A'}
              onClick={() => setShowStats(!showStats)}
            >
              <FiBarChart2 size={16} /> {showStats ? 'Hide Stats' : 'View Stats'}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); loadTransactions(1); }}>
          {/* Row 1: 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
              <input 
                type="date" 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                onFocus={() => setFocusedField('fromDate')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
              <input
                type="date"
                className={styles.inputControl}
                style={{
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  height: '38px',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1',
                  boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none',
                  transition: 'all 0.25s',
                  width: '100%',
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                onFocus={() => setFocusedField('toDate')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Select Member</label>
              <select 
                className={styles.inputControl} 
                style={{ 
                  paddingLeft: '12px', 
                  paddingRight: '12px',
                  height: '38px', 
                  borderRadius: '10px', 
                  fontSize: '0.825rem', 
                  border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                  boxShadow: focusedField === 'member' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                  transition: 'all 0.25s', 
                  width: '100%', 
                  background: '#FCFDFE',
                  color: '#334155',
                  fontWeight: 500
                }} 
                onFocus={() => setFocusedField('member')}
                onBlur={() => setFocusedField(null)}
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">All Members</option>
                {Array.isArray(memberList) && memberList.map((m) => (
                  <option key={m.id || m.memberId} value={m.id || m.memberId}>
                    {m.name || m.memberId} ({m.mobile})
                  </option>
                ))}
              </select>
            </div>
          
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Anything (Card No, Mobile, ID)</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <FiSearch size={14} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter keyword..." 
                  className={styles.inputControl} 
                  style={{ 
                    paddingLeft: '32px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    fontSize: '0.825rem', 
                    border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', 
                    boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', 
                    transition: 'all 0.25s', 
                    width: '100%', 
                    background: '#FCFDFE',
                    color: '#334155',
                    fontWeight: 500
                  }} 
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  onFocus={() => setFocusedField('search')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <button 
                type="submit" 
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  height: '38px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #24D366 0%, #17b350 100%)';
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(34, 197, 94, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)';
                }}
              >
                <FiSearch size={15} />
                {isLoading ? 'Loading…' : 'Search'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Credit Card BillPay History List</h3>
        </div>
        {/* TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '10px 15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="ccbillpayhistory_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search billpay logs..." />
          </div>
        </div>

        {/* ── STATS CARDS GRID ── */}
      <StatsGrid stats={{
        totalTxns: transactions.length,
        totalAmount: transactions.reduce((acc, curr) => acc + (parseFloat(curr.amount || curr.txnAmount) || 0), 0),
        successTxns: transactions.filter(t => t.status?.toLowerCase() === 'success').length,
        failedTxns: transactions.filter(t => t.status?.toLowerCase() === 'failed').length,
        pendingTxns: transactions.filter(t => t.status?.toLowerCase() === 'pending').length,
        totalCommission: 0,
        uplineCommission: 0,
        adminCommission: 0,
        totalTds: 0,
        adminProfit: 0,
        tdsPayable: 0,
        netPayable: 0
      }} showStats={showStats} />

      <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '2200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.No</th>
                <th style={{ textAlign: 'center' }}>Action</th>
                <th>Adddate</th>
                <th>User</th>
                <th>Name</th>
                <th>CardNumber</th>
                <th>MobileNo</th>
                <th>Op Bal.</th>
                <th>Amount</th>
                <th>Surcharge</th>
                <th>GST</th>
                <th>Cls Bal.</th>
                <th>TxnID</th>
                <th>Vendor ID</th>
                <th>NetWork</th>
                <th>Remark</th>
                <th>Source</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Message</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <tr key={txn.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <ActionMenu txn={txn} onViewReceipt={setActiveReceipt} onAction={handleMenuAction} alignUp={index >= transactions.length - 2 && transactions.length > 2} />
                    </td>
                    <td>{txn.createdDate || txn.date || 'N/A'}</td>
                    <td>{txn.userId || txn.memberId || 'N/A'}</td>
                    <td>{txn.customerName || txn.memberName || 'N/A'}</td>
                    <td>{txn.cardNumber || txn.accountNo || 'N/A'}</td>
                    <td>{txn.customerMobile || txn.mobile || 'N/A'}</td>
                    <td>₹{txn.openingBalance || txn.opBal || '0.00'}</td>
                    <td>₹{txn.amount || txn.txnAmount || '0.00'}</td>
                    <td>₹{txn.surcharge || '0'}</td>
                    <td>₹{txn.gst || '0'}</td>
                    <td>₹{txn.closingBalance || txn.clBal || '0.00'}</td>
                    <td>{txn.orderId || txn.txnId || txn.refid || 'N/A'}</td>
                    <td>{txn.vendorId || '-'}</td>
                    <td>{txn.network || txn.operatorName || '-'}</td>
                    <td>{txn.remark || '-'}</td>
                    <td>{txn.source || 'WEB'}</td>
                    <td style={{ textAlign: 'center' }}><span className={`${styles.statusBadge} ${txn.status?.toLowerCase() === 'success' ? styles.statusSuccess : txn.status?.toLowerCase() === 'failed' ? styles.statusFailed : styles.statusPending}`}>{txn.status || 'PENDING'}</span></td>
                    <td>{txn.message || '-'}</td>
                    <td>
                        <button onClick={() => setActiveReceipt(txn)} style={{ background: '#1756AA', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Receipt</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="20" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0', position: 'relative' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                         <FiDatabase size={24} color="#94A3B8" />
                       </div>
                       <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No billpay data found</span>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>Showing 0 to 0 of 0 entries</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">1</button>
            <button className="global-page-btn" disabled><FiChevronRight /></button>
          </div>
        </div>
      </div>
      {activeReceipt && (
        <TransactionReceipt 
          data={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      <ConfirmModal 
        show={confirmData.show} 
        title={confirmData.action === 'Check Status' ? 'Check Transaction Status' : `Confirm ${confirmData.action}`}
        message={confirmData.action === 'Check Status' ? 'Are you sure you want to check the status of this transaction?' : `Are you sure you want to apply ${confirmData.action} to this transaction?`}
        type={confirmData.action === 'Force Fail' ? 'danger' : confirmData.action === 'Check Status' ? 'warning' : 'success'}
        confirmText={confirmData.action === 'Check Status' ? 'Check Status' : 'Yes, I am sure'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmData({ show: false, action: null, txn: null })}
      />
      <PopupModal show={popup.show} type={popup.type} title={popup.title} message={popup.message} onClose={closePopup} />
      <LogModal 
        show={logModalData.show} 
        txn={logModalData.txn} 
        onClose={() => setLogModalData({ show: false, txn: null })} 
      />

    </div>
  );
};
export default CCBillPayHistory;
