import React, { useState, useMemo } from 'react';
import { FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, FaPrint, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './DynamicTable.module.css';

const DynamicTable = ({ 
  title = "Table Data", 
  columns = [], 
  data = [], 
  actions = null 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Search Filter Logic
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [data, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className={styles.tableCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {actions && <div className={styles.cardActions}>{actions}</div>}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.entriesControl}>
          <span>Show</span>
          <select 
            value={rowsPerPage} 
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.selectInput}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className={styles.exportButtons}>
          <button className={`${styles.btnExport} ${styles.btnCopy}`} title="Copy"><FaCopy /></button>
          <button className={`${styles.btnExport} ${styles.btnExcel}`} title="Excel"><FaFileExcel /></button>
          <button className={`${styles.btnExport} ${styles.btnPdf}`} title="PDF"><FaFilePdf /></button>
          <button className={`${styles.btnExport} ${styles.btnCsv}`} title="CSV"><FaFileCsv /></button>
          <button className={`${styles.btnExport} ${styles.btnPrint}`} title="Print"><FaPrint /></button>
        </div>

        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table Wrapper */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>No records found</td>
              </tr>
            ) : (
              currentData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={styles.paginationFooter}>
        <span className={styles.paginationInfo}>
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className={styles.paginationControls}>
          <button 
            className={styles.pageBtn} 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          <span className={styles.pageNumber}>{currentPage}</span>
          <button 
            className={styles.pageBtn} 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
