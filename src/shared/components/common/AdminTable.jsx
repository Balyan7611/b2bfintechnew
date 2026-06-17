import React from 'react';
import { 
  FiSearch, FiCopy, FiChevronLeft, FiChevronRight, FiDatabase 
} from 'react-icons/fi';
import { FaFileCsv, FaPrint, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import styles from './AdminTable.module.css';
import sharedStyles from './SharedTable.module.css';

const AdminTable = ({
  title,
  subtitle,
  icon,
  rightAction,
  filtersPanel,
  columns = [],
  data = [],
  renderRow,
  searchQuery,
  onSearchChange,
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  onPageChange,
  totalEntries,
  totalPages,
  topContent
}) => {

  return (
    <div className={styles.card}>
      
      {topContent && (
        <div className={styles.topContent}>
          {topContent}
        </div>
      )}
      
      {/* TITLE ROW */}
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          {icon && (
            <div className={styles.iconBox}>
              {icon}
            </div>
          )}
          <div className={styles.titleGroup}>
            <h2 className={styles.premiumTitle}>{title}</h2>
            {subtitle && <span className={styles.titleSubtitle}>{subtitle}</span>}
          </div>
        </div>
        {rightAction && (
          <div className={styles.titleRight}>
            {rightAction}
          </div>
        )}
      </div>

      {/* FILTER PANEL */}
      {filtersPanel && (
        <div className={styles.filterPanelWrapper}>
          {filtersPanel}
        </div>
      )}

      {/* CONTROLS ROW */}
      <div className={styles.controlsRow}>
        <div className={styles.entries}>
          Show 
          <select 
            value={rowsPerPage} 
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          entries
        </div>

        <div className={sharedStyles.exportGroup} style={{ margin: 0, width: 'auto' }}>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_copy}`} title="Copy"><FiCopy /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_excel}`} title="Excel"><FaFileExcel /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_csv}`} title="CSV"><FaFileCsv /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_pdf}`} title="PDF"><FaFilePdf /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_print}`} title="Print"><FaPrint /></button>
        </div>

        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search reports..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE - Using Shared Styles */}
      <div className={sharedStyles.tableWrapper} style={{ marginTop: 0 }}>
        <table className={sharedStyles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIconBox}>
                      <FiDatabase />
                    </div>
                    <div>
                      <h3>No records found discovered</h3>
                      <p>Try adjusting your filters or search terms</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className={styles.paginationRow}>
        <div className={styles.paginationInfo}>
          {totalEntries === 0 
            ? "Showing 0 entries" 
            : `Showing ${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, totalEntries)} of ${totalEntries} entries`
          }
        </div>
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <button className={`${styles.pageBtn} ${styles.activePage}`}>{currentPage}</button>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminTable;
