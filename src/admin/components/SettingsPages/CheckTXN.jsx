import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  FiSearch, FiRefreshCw, FiInfo, FiActivity, FiFileText, FiChevronLeft, FiChevronRight,
  FiMoreVertical, FiX, FiCheckCircle, FiXCircle, FiCornerUpLeft, FiRefreshCcw
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaPrint 
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const CheckTXN = () => {
  const dispatch = useDispatch();

  const [txnId, setTxnId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, txn: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, actionTitle: "", actionColor: "", txnId: "", onConfirm: null });

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow({ id: null, x: 0, y: 0, txn: null });
      }
    };
    const handleScroll = (e) => {
      if (e.target.closest && e.target.closest('.action-dropdown-wrapper')) return;
      setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, txn: null } : prev);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!txnId.trim()) {
      setErrorMsg("Invalid Transaction ID. Please enter a valid Transaction ID.");
      setSearchResult(null);
      setHasSearched(false);
      return;
    }

    setErrorMsg("");
    setHasSearched(true);
    // Simulating gateway response with entered TXN ID
    setSearchResult({
      txnId: txnId.trim().toUpperCase(),
      member: "Ram Prasad (MEM88392)",
      amount: "₹ 1,500.00",
      gateway: "ICICI DMT GATEWAY",
      status: "PENDING",
      date: new Date().toLocaleString('en-GB')
    });
  };

  const handleActionClick = (actionName, color) => {
    const currentTxnId = activeActionRow.txn?.txnId;
    setActiveActionRow({ id: null, x: 0, y: 0, txn: null }); // Close dropdown immediately
    
    setConfirmModal({
      isOpen: true,
      actionTitle: actionName,
      actionColor: color,
      txnId: currentTxnId,
      onConfirm: () => {
        setConfirmModal({ isOpen: false, actionTitle: "", actionColor: "", txnId: "", onConfirm: null });
        setSearchResult(prev => prev ? { ...prev, status: actionName === 'Force Success' ? 'SUCCESS' : actionName === 'Re-hit' ? 'PENDING' : 'FAILED' } : null);
        // Dispatch action/API call here
      }
    });
  };

  const handleClear = () => {
    setTxnId("");
    setSearchResult(null);
    setHasSearched(false);
    setErrorMsg("");
  };

  return (
    <>
    <div className={styles.container} style={{ padding: '8px 6px', maxWidth: '100%' }}>
      {/* ── SINGLE MAIN CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
        
        {/* CARD INTERNAL HEADER (Polished & Highly Compact) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderBottom: '1px solid #F1F5F9', minHeight: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', borderRadius: '5px' }}>
            <FiActivity style={{ fontSize: '0.8rem' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0D1B3E', lineHeight: '1.2' }}>Check Transaction Status</h3>
        </div>

        {/* CONTENT AREA (Maximized width with minimal left/right padding) */}
        <div style={{ padding: '12px 10px' }}>
          
          {/* SEARCH BAR (Label and field aligned horizontally) */}
          <form onSubmit={handleSearch} style={{ background: '#F8FAFC', padding: '10px 15px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 800, color: '#4E6080', fontSize: '0.85rem', whiteSpace: 'nowrap', margin: 0 }}>
              Transaction ID:
            </label>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <FiFileText style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.9rem' }} />
              <input 
                type="text" 
                value={txnId}
                onChange={(e) => {
                  setTxnId(e.target.value);
                  if (errorMsg) setErrorMsg(""); // Clear error message when user starts typing
                }}
                placeholder="" 
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', color: '#1E293B', fontWeight: 600, fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="submit"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1756AA', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(23, 86, 170, 0.15)' }}
              >
                <FiSearch /> <span>Search Status</span>
              </button>
              <button 
                type="button"
                onClick={handleClear}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', color: '#4E6080', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <FiRefreshCw /> <span>Clear</span>
              </button>
            </div>
          </form>

          {/* INLINE ERROR MESSAGE (Shows below search fields instead of popup) */}
          {errorMsg && (
            <div style={{ color: '#E53E3E', fontSize: '0.8rem', fontWeight: 700, marginTop: '-8px', marginBottom: '12px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiInfo style={{ fontSize: '0.9rem' }} /> <span>{errorMsg}</span>
            </div>
          )}

          {/* TOOLBAR */}
          <div className="global-table-toolbar" style={{ padding: '0 0 15px 0', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
            <div className={styles.pillRow} style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
              <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '6px 10px', height: '36px' }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
              <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
              <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
              <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
              <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
            </div>

            <div className="global-search-box" style={{ maxWidth: '250px' }}>
              <FiSearch />
              <input type="text" placeholder="Search..." style={{ borderRadius: '8px', padding: '8px 12px 8px 35px' }} />
            </div>
          </div>

          {/* ── DATA TABLE ── */}
          <div className={styles.tableWrapper} style={{ border: '1px solid #E2E8F0', borderRadius: '10px 10px 0 0', borderBottom: 'none', overflowX: 'auto' }}>
            <table className={styles.table} style={{ width: '100%', minWidth: '800px', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                  <th style={{ width: '80px', textAlign: 'center' }}>S.NO</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>ACTION</th>
                  <th style={{ width: '220px', textAlign: 'left' }}>TRANSACTION ID</th>
                  <th style={{ width: '220px', textAlign: 'left' }}>MEMBER DETAILS</th>
                  <th style={{ width: '150px', textAlign: 'left' }}>AMOUNT</th>
                  <th style={{ width: '200px', textAlign: 'left' }}>GATEWAY / SERVICE</th>
                  <th style={{ width: '140px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ width: '180px', textAlign: 'left' }}>DATE & TIME</th>
                </tr>
              </thead>
              <tbody>
                {hasSearched && searchResult ? (
                  <tr className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0', textAlign: 'center' }}>1</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-dropdown-wrapper" style={{ display: 'inline-block' }}>
                        <button 
                          className="action-dropdown-wrapper"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeActionRow.id === searchResult.txnId) {
                              setActiveActionRow({ id: null, x: 0, y: 0, txn: null });
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              let dropX = rect.right + 12;
                              if (dropX + 170 > window.innerWidth) dropX = rect.left - 175;
                              setActiveActionRow({ id: searchResult.txnId, x: dropX, y: rect.top - 10, txn: searchResult });
                            }
                          }}
                          style={{ 
                            height: '32px', 
                            padding: '0 12px',
                            borderRadius: '8px', 
                            background: '#22c55e', 
                            color: '#ffffff', 
                            border: 'none', 
                            cursor: 'pointer', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '6px',
                            transition: 'all 0.15s', 
                            margin: '0 auto', 
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                          title="Actions"
                        >
                          Action <FiMoreVertical style={{ marginRight: '-4px' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: '#1E293B' }}>{searchResult.txnId}</td>
                    <td style={{ fontWeight: 700, color: '#1756AA' }}>{searchResult.member}</td>
                    <td style={{ fontWeight: 800, color: '#2D3748' }}>{searchResult.amount}</td>
                    <td style={{ fontWeight: 700, color: '#4A5568' }}>{searchResult.gateway}</td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ background: searchResult.status === 'PENDING' ? '#FEF3C7' : '#E6FFFA', color: searchResult.status === 'PENDING' ? '#D97706' : '#319795', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {searchResult.status}
                      </span>
                    </td>
                    <td style={{ color: '#718096', fontWeight: 700, fontSize: '0.85rem' }}>{searchResult.date}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      <FiInfo style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                        No records found. Please enter a Transaction ID and click Search.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          <div className="global-pagination" style={{ padding: '15px', border: '1px solid #E2E8F0', borderRadius: '0 0 10px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
              Showing {hasSearched && searchResult ? 1 : 0} to {hasSearched && searchResult ? 1 : 0} of {hasSearched && searchResult ? 1 : 0} records
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
              <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
            </div>
          </div>

        </div>
        </div>
      </div>

      {/* ── ACTION DROPDOWN PORTAL ── */}
      {activeActionRow.id && (
        <>
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            className="action-dropdown-wrapper"
            style={{ position: 'fixed', top: activeActionRow.y, left: activeActionRow.x, background: '#fff', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', zIndex: 9999, minWidth: '160px', overflow: 'hidden', animation: 'dropdownFadeIn 0.15s ease-out' }}
          >
            {activeActionRow.txn.status === 'PENDING' ? (
              <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => handleActionClick('Force Success', '#10B981')}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1FAE5', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#10B981', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#10B981'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#D1FAE5'; }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiCheckCircle size={14} /></span>
                  Force Success
                </button>
                <button
                  onClick={() => handleActionClick('Force Failed', '#EF4444')}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #FEE2E2', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#EF4444'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#FEE2E2'; }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiXCircle size={14} /></span>
                  Force Failed
                </button>
                <button
                  onClick={() => handleActionClick('Fail & Refund', '#9333EA')}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #F3E8FF', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#9333EA', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#FAF5FF'; e.currentTarget.style.borderColor = '#9333EA'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#F3E8FF'; }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiCornerUpLeft size={14} /></span>
                  Fail & Refund
                </button>
                <button
                  onClick={() => handleActionClick('Re-hit', '#3B82F6')}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #DBEAFE', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#3B82F6', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#3B82F6'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#DBEAFE'; }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#DBEAFE', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiRefreshCcw size={14} /></span>
                  Re-hit
                </button>
                <button
                  onClick={() => handleActionClick('Check Status', '#0EA5E9')}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #E0F2FE', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#0EA5E9', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#F0F9FF'; e.currentTarget.style.borderColor = '#0EA5E9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E0F2FE'; }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#E0F2FE', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiSearch size={14} /></span>
                  Check Status
                </button>
              </div>
            ) : (
              <div style={{ padding: '15px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                No actions available<br />for this status.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CONFIRMATION MODAL ── */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', background: `${confirmModal.actionColor}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: confirmModal.actionColor, margin: '0 auto 16px' }}>
              <FiActivity size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0D1B3E' }}>Confirm Action</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to perform <strong style={{ color: confirmModal.actionColor }}>{confirmModal.actionTitle}</strong> on transaction <strong>{confirmModal.txnId}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '10px', background: confirmModal.actionColor, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckTXN;
