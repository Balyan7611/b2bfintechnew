import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaTimes, FaUserAlt, FaCheck 
} from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from './Transfer.module.css';

const Transfer = () => {
  const { transferList } = useSelector((s) => s.balance);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter Data
  const filteredData = (transferList || []).filter(item => 
    (item.userText || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.mobile || '').includes(searchQuery)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const openModal = (actionName, user) => {
    setModalTitle(actionName);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const totalWallet = filteredData.reduce((acc, item) => acc + (parseFloat(item.bal) || 0), 0);
  const totalAeps = filteredData.reduce((acc, item) => acc + (parseFloat(item.aepsBal) || 0), 0);
  const totalCredit = filteredData.reduce((acc, item) => acc + (parseFloat(item.creditLimit) || 0), 0);

  return (
    <div className={styles.container}>
      {/* Main Card */}
      <div className={styles.card}>
        <h2 className={styles.pageTitle}>Balance Transfer (Credit / Debit)</h2>
        
        {/* Top Controls */}
        <div className={styles.topControls}>
          <div className={styles.rowsSelector}>
            <span>Show</span>
            <select 
              className={styles.selectInput}
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>rows</span>
          </div>

          <ExportButtons 
            headers={['S.No', 'User', 'Mobile', 'Wallet Bal', 'AEPS Bal', 'Credit Limit']}
            rows={currentData.map((row, index) => [
              startIndex + index + 1, row.userText, row.mobile, row.bal, row.aepsBal, row.creditLimit
            ])}
            fileNamePrefix="balance_transfer_report"
            sheetName="Transfers"
          />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search User or Mobile..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Wrapper */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User Details</th>
                <th className={styles.centerAlign}>
                  <div className={styles.headerContent}>
                    <span>Wallet Bal</span>
                    <span className={styles.totalSubtext}>(Total: ₹{totalWallet.toLocaleString()})</span>
                  </div>
                </th>
                <th className={styles.centerAlign}>
                  <div className={styles.headerContent}>
                    <span>AEPS Bal</span>
                    <span className={styles.totalSubtext}>(Total: ₹{totalAeps.toLocaleString()})</span>
                  </div>
                </th>
                <th className={styles.centerAlign}>
                  <div className={styles.headerContent}>
                    <span>Credit Limit</span>
                    <span className={styles.totalSubtext}>(Total: ₹{totalCredit.toLocaleString()})</span>
                  </div>
                </th>
                <th className={styles.centerAlign}>Wallet Ops</th>
                <th className={styles.centerAlign}>AEPS Ops</th>
                <th className={styles.centerAlign}>Quick Login</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{startIndex + index + 1}</td>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.userName}><FaUserAlt style={{ fontSize: '0.75rem', color: '#1756AA' }} /> {row.userText}</span>
                      <span className={styles.userMobile}>{row.mobile}</span></div></td>
                  <td className={styles.balanceText}>₹ {row.bal}</td>
                  <td className={styles.balanceText}>₹ {row.aepsBal}</td>
                  <td className={styles.balanceText}>₹ {row.creditLimit}</td>
                  <td className={styles.centerAlign}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className={`${styles.pillBtn} ${styles.addBtn}`} onClick={() => openModal('Add Balance', row)}>Add</button>
                      <button className={`${styles.pillBtn} ${styles.revertBtn}`} onClick={() => openModal('Revert Balance', row)}>Revert</button>
                    </div>
                  </td>
                  <td className={styles.centerAlign}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className={`${styles.pillBtn} ${styles.addBtn}`} onClick={() => openModal('AEPS Add', row)}>Add</button>
                      <button className={`${styles.pillBtn} ${styles.revertBtn}`} onClick={() => openModal('AEPS Revert', row)}>Revert</button>
                    </div>
                  </td>
                  <td className={styles.centerAlign}>
                    <button className={`${styles.pillBtn} ${styles.loginBtn}`}>Login</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationRow}>
          <div className={styles.pageInfo}>
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num}
                className={`${styles.pageBtn} ${currentPage === num ? styles.pageActive : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modalTitle} - {selectedUser?.userText}</h2>
              <button className={styles.closeBtn} onClick={closeModal}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Transaction Amount</label>
                <input type="number" className={styles.inputControl} placeholder="0.00" autoFocus />
              </div>
              <div className={styles.formGroup}>
                <label>Transaction Remark</label>
                <input type="text" className={styles.inputControl} placeholder="Enter remark here..." />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.confirmBtn} onClick={closeModal}>
                <FaCheck /> Confirm {modalTitle.includes('Add') ? 'Addition' : 'Reversion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;

