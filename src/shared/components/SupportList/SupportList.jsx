import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setCurrentPage, 
  setRowsPerPage, 
  setSearchQuery, 
  updateTicketStatus,
  openChat,
} from '../../../store/slices/supportSlice';
import { 
  FaSearch, FaCommentDots, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaUserCircle 
} from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../common/ExportButtons';
import styles from './SupportList.module.css';
import ChatPopup from './ChatPopup';
import { FaTimesCircle } from 'react-icons/fa';

const SupportList = () => {
  const dispatch = useDispatch();
  const { complainList, currentPage, rowsPerPage, searchQuery } = useSelector((s) => s.support);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = React.useState({ open: false, row: null, action: '' });

  // Filter Data
  const filteredData = complainList.filter(item => 
    item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.loginId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleStatusChangeClick = (row, action) => {
    setConfirmModal({ open: true, row, action });
  };

  const handleConfirmAction = () => {
    if (confirmModal.row && confirmModal.action) {
      dispatch(updateTicketStatus({ id: confirmModal.row.id, status: confirmModal.action }));
      setConfirmModal({ open: false, row: null, action: '' });
    }
  };

  const handleChatOpen = (row) => {
    dispatch(openChat({
      id: row.id,
      name: row.name,
      ticketId: row.ticketId,
      loginId: row.loginId,
      status: row.status,
      message: row.message,
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableCard}>
        <h2 className={styles.pageTitle}>Complaint List</h2>
        {/* Top Controls */}
        <div className={styles.topControls}>
          <div className={styles.rowsSelector}>
            <span>Show</span>
            <select 
              className={styles.selectInput}
              value={rowsPerPage} 
              onChange={(e) => dispatch(setRowsPerPage(Number(e.target.value)))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>rows</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="complain_report" sheetName="Report" />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
          </div>
        </div>

        {/* Table Wrapper */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.NO</th>
                <th>Action</th>
                <th>Ticket ID</th>
                <th>Login ID</th>
                <th>Name</th>
                <th>Service</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Approve Date</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{startIndex + index + 1}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        className={`${styles.actionBtn} ${styles.btnChat}`}
                        style={{ padding: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Chat"
                        onClick={() => handleChatOpen(row)}
                      >
                        <FaCommentDots />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.btnApprove} ${row.status === 'Approved' ? styles.btnDisabled : ''}`}
                        style={{ padding: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Approve"
                        onClick={() => handleStatusChangeClick(row, 'Approved')}
                        disabled={row.status === 'Approved'}
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.btnReject} ${row.status === 'Rejected' ? styles.btnDisabled : ''}`}
                        style={{ padding: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Reject"
                        onClick={() => handleStatusChangeClick(row, 'Rejected')}
                        disabled={row.status === 'Rejected'}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                  <td className={styles.fwBold}>{row.ticketId}</td>
                  <td>{row.loginId}</td>
                  <td className={styles.fwBold}>{row.name}</td>
                  <td>{row.service}</td>
                  <td className={styles.msgCol}>{row.message}</td>
                  <td>{row.date}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${row.status}`]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.approveDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FiDatabase style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className={styles.paginationRow}>
          <div className={styles.pageInfo}>
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            >
              <FaChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num}
                className={`${styles.pageBtn} ${currentPage === num ? styles.pageActive : ''}`}
                onClick={() => dispatch(setCurrentPage(num))}
              >
                {num}
              </button>
            ))}

            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {confirmModal.open && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal({ open: false, row: null, action: '' })}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Ticket {confirmModal.action}</h2>
              <button className={styles.closeBtn} onClick={() => setConfirmModal({ open: false, row: null, action: '' })}>
                <FaTimesCircle />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.confirmContent}>
                <div className={`${styles.confirmIconBox} ${confirmModal.action === 'Approved' ? styles.bgSuccess : styles.bgDanger}`}>
                  {confirmModal.action === 'Approved' ? <FaCheck /> : <FaTimes />}
                </div>
                
                <div className={styles.userSection}>
                  <FaUserCircle className={styles.profileIcon} />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{confirmModal.row?.name}</span>
                    <span className={styles.userRole}>Support Ticket Request</span>
                  </div>
                </div>

                <p className={styles.confirmText}>
                  Are you sure you want to <strong>{confirmModal.action.toLowerCase()}</strong> this ticket?
                </p>
                
                <div className={styles.ticketDetailsCompact}>
                  <div className={styles.compactRow}>
                    <span className={styles.label}>ID:</span>
                    <span className={styles.value}>{confirmModal.row?.ticketId}</span>
                  </div>
                  <div className={styles.compactRow}>
                    <span className={styles.label}>Service:</span>
                    <span className={styles.value}>{confirmModal.row?.service}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setConfirmModal({ open: false, row: null, action: '' })}>
                No, Cancel
              </button>
              <button 
                className={styles.confirmBtn} 
                style={{ background: confirmModal.action === 'Approved' ? '#27AE60' : '#E74C3C' }}
                onClick={handleConfirmAction}
              >
                Yes, {confirmModal.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Popup — rendered here so it sits inside the dashboard layout */}
      <ChatPopup />
    </div>
  );
};

export default SupportList;

