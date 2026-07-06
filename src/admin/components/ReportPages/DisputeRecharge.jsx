import React, { useState } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import ReceiptModal from '../../../shared/components/common/ReceiptModal';
import { 
  FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiActivity, FiDatabase, FiAlertCircle, FiXCircle, FiMoreVertical, FiFileText, FiCheck, FiX, FiCornerUpLeft
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaExclamationTriangle, FaArrowRight, FaGavel
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const DisputeRecharge = () => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', txid: null });
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [disputeData, setDisputeData] = useState([
    { sno: 1, api: 'SoniTechno', txid: '9694935907', op: 'Jio', num: '9990167317', amt: '349.00', status: 'Success', opid: 'BR000C3CFHMW', by: 'Pay99RT4291 Suhail', date: '17/04/2025 18:45:58' },
    { sno: 2, api: 'SoniTechno', txid: '5744464283', op: 'Airtel', num: '7289054316', amt: '22.00', status: 'Success', opid: '3104235732', by: 'Pay99RT4097 Brijesh Kumar', date: '15/04/2025 19:39:13' },
  ]);

  const handleAction = (type, txid) => {
    if (type === 'accept') {
      setDisputeData(prev => prev.map(row => row.txid === txid ? { ...row, status: 'Accepted' } : row));
    } else {
      setDisputeData(prev => prev.map(row => row.txid === txid ? { ...row, status: 'Cancelled' } : row));
    }
    setConfirmModal({ isOpen: false, type: '', txid: null });
  };

  const filteredData = disputeData.filter(row => {
    const term = searchTerm.toLowerCase();
    return (
      row.api.toLowerCase().includes(term) ||
      row.txid.toLowerCase().includes(term) ||
      row.num.toLowerCase().includes(term) ||
      row.op.toLowerCase().includes(term) ||
      row.by.toLowerCase().includes(term) ||
      row.opid.toLowerCase().includes(term)
    );
  });

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '12px', maxWidth: '100%' }}>
      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(23, 86, 170, 0.04), 0 1px 8px rgba(0, 0, 0, 0.02)',
        border: '1px solid #E2E8F0',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        {/* CARD TOP: TITLE */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>Dispute Recharge Report</h2>
        </div>

        {/* CARD BOTTOM: FILTERS */}
        <div style={{ padding: '24px 28px', background: '#FAFBFC' }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>From Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>
              
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>To Date</label>
                <input type="date" className={styles.inputControl} style={{ height: '42px', fontSize: '0.85rem', width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '0 12px', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#1756AA'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
              </div>
              
              <div>
                <button type="submit" style={{ height: '42px', width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.2)'; }}>
                   <FiSearch /> Search Logs
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        {/* CARD INTERNAL HEADER / TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '12px 20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              value={rowsPerPage} 
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="disputerecharge_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search dispute logs..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper} style={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', overflowY: 'hidden', minHeight: 'auto' }}>
          <table className={styles.table} style={{ minWidth: '1800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '80px', textAlign: 'center' }}>ACTION</th>
                <th style={{ textAlign: 'center', width: '120px' }}>STATUS</th>
                <th>API NAME</th>
                <th>TXID</th>
                <th>OPERATOR</th>
                <th>NUMBER</th>
                <th>AMOUNT</th>
                <th>OPERATOR ID</th>
                <th>RECHARGE BY</th>
                <th>DATE & TIME</th>
                <th style={{ textAlign: 'center' }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <>
                  <tr style={{ height: '50px', background: '#F8FAFC' }}>
                    <td style={{ textAlign: 'center', color: '#CBD5E1' }}>-</td>
                    <td style={{ textAlign: 'center', color: '#CBD5E1' }}>-</td>
                    <td style={{ textAlign: 'center', color: '#CBD5E1' }}>-</td>
                    <td colSpan="8" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 500 }}>
                      <FiDatabase style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }} /> No dispute recharge records found
                    </td>
                    <td style={{ textAlign: 'center', color: '#CBD5E1' }}>-</td>
                  </tr>
                  <tr style={{ height: '50px', background: '#FFFFFF' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <td key={i} style={{ textAlign: 'center', color: '#E2E8F0' }}>-</td>
                    ))}
                  </tr>
                </>
              ) : (
                currentRows.map((row, idx) => (
                  <tr key={row.txid} style={{ position: 'relative' }}>
                    <td>{indexOfFirstRow + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => row.status !== 'Accepted' && setConfirmModal({ isOpen: true, type: 'accept', txid: row.txid })}
                          title="Accept"
                          disabled={row.status === 'Accepted'}
                          style={
                            row.status === 'Accepted'
                              ? { width: '30px', height: '30px', borderRadius: '8px', background: '#16A34A', color: '#fff', border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                              : row.status === 'Cancelled'
                              ? { width: '30px', height: '30px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
                              : { width: '30px', height: '30px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
                          }
                          onMouseOver={(e) => { 
                            if (row.status !== 'Accepted') {
                              e.currentTarget.style.background = '#16A34A'; 
                              e.currentTarget.style.color = '#fff'; 
                              e.currentTarget.style.opacity = '1';
                            }
                          }}
                          onMouseOut={(e) => { 
                            if (row.status !== 'Accepted') {
                              e.currentTarget.style.background = '#F0FDF4'; 
                              e.currentTarget.style.color = '#16A34A'; 
                              if (row.status === 'Cancelled') e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                        >
                          <FiCheck size={16} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => row.status !== 'Cancelled' && setConfirmModal({ isOpen: true, type: 'cancel', txid: row.txid })}
                          title="Cancel"
                          disabled={row.status === 'Cancelled'}
                          style={
                            row.status === 'Cancelled'
                              ? { width: '30px', height: '30px', borderRadius: '8px', background: '#DC2626', color: '#fff', border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                              : row.status === 'Accepted'
                              ? { width: '30px', height: '30px', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
                              : { width: '30px', height: '30px', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
                          }
                          onMouseOver={(e) => { 
                            if (row.status !== 'Cancelled') {
                              e.currentTarget.style.background = '#DC2626'; 
                              e.currentTarget.style.color = '#fff'; 
                              e.currentTarget.style.opacity = '1';
                            }
                          }}
                          onMouseOut={(e) => { 
                            if (row.status !== 'Cancelled') {
                              e.currentTarget.style.background = '#FEF2F2'; 
                              e.currentTarget.style.color = '#DC2626'; 
                              if (row.status === 'Accepted') e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                        >
                          <FiX size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        background: row.status === 'Accepted' 
                          ? '#DEF7EC' 
                          : row.status === 'Cancelled' 
                          ? '#FDE8E8' 
                          : '#FEF9C3',
                        color: row.status === 'Accepted' 
                          ? '#03543F' 
                          : row.status === 'Cancelled' 
                          ? '#9B1C1C' 
                          : '#713F12',
                        border: row.status === 'Accepted' 
                          ? '1px solid #BCF0DA' 
                          : row.status === 'Cancelled' 
                          ? '1px solid #F8B4B4' 
                          : '1px solid #FEF08A'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.api}</td>
                    <td>{row.txid}</td>
                    <td>{row.op}</td>
                    <td>{row.num}</td>
                    <td style={{ fontWeight: 800, color: '#0D1B3E' }}>₹{row.amt}</td>
                    <td>{row.opid}</td>
                    <td>{row.by}</td>
                    <td style={{ fontSize: '0.8rem', color: '#4E6080' }}>{row.date}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setActiveReceipt(row)}
                        style={{ 
                          background: 'rgba(231, 76, 60, 0.1)', border: 'none', color: '#E74C3C', 
                          padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, 
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' 
                        }}
                      >
                        <FiFileText /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {totalRows > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, totalRows)} of {totalRows} entries
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="global-page-btn" 
              onClick={() => handlePageChange('prev')} 
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`global-page-btn ${currentPage === page ? 'global-page-active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="global-page-btn" 
              onClick={() => handlePageChange('next')} 
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', padding: '20px 24px', borderRadius: '20px', width: '90%', maxWidth: '340px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)', textAlign: 'center', position: 'relative',
            border: '1px solid #E2E8F0', transform: 'scale(1)', transition: 'transform 0.2s'
          }}>
            <button 
              onClick={() => setConfirmModal({ isOpen: false, type: '', txid: null })}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#F8FAFC', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = '#F8FAFC'}
            >
              <FiX size={16} strokeWidth={3} />
            </button>
            
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', margin: '10px auto 16px auto',
              background: confirmModal.type === 'accept' ? '#E8F5E9' : '#FFEBEE',
              color: confirmModal.type === 'accept' ? '#2E7D32' : '#C62828',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: confirmModal.type === 'accept' ? '0 4px 10px rgba(46, 125, 50, 0.15)' : '0 4px 10px rgba(198, 40, 40, 0.15)'
            }}>
              {confirmModal.type === 'accept' ? <FiCheck size={28} strokeWidth={3} /> : <FaExclamationTriangle size={24} />}
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
              {confirmModal.type === 'accept' ? 'Accept Dispute?' : 'Cancel Dispute?'}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5' }}>
              Do you want to {confirmModal.type === 'accept' ? 'accept' : 'cancel'} the dispute for transaction ID <strong style={{ color: '#0F172A' }}>{confirmModal.txid}</strong>?
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: '', txid: null })}
                style={{ padding: '10px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
              >
                Go Back
              </button>
              <button 
                onClick={() => handleAction(confirmModal.type, confirmModal.txid)}
                style={{ padding: '10px', background: confirmModal.type === 'accept' ? '#2E7D32' : '#C62828', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECEIPT MODAL ── */}
      <ReceiptModal 
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        data={activeReceipt ? {
          amount: parseFloat(activeReceipt.amt),
          charge: 0,
          date: activeReceipt.date,
          customerName: activeReceipt.by ? activeReceipt.by.split(' ').slice(1).join(' ') : 'Guest User',
          customerMobile: activeReceipt.num,
          beneficiary: activeReceipt.by || 'Agent User',
          bank: activeReceipt.api,
          accountNo: activeReceipt.opid || activeReceipt.txid,
          mode: 'Recharge Dispute',
          total: parseFloat(activeReceipt.amt),
          bankTransId: activeReceipt.txid,
          id: activeReceipt.txid
        } : null}
      />
    </div>
  );
};

export default DisputeRecharge;
