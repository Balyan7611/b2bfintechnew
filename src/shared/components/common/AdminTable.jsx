import React from 'react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../store/slices/uiSlice';
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
  topContent,
  exportData,         // optional: array of arrays (pre-formatted rows for export)
  fileNamePrefix,     // optional: filename prefix for downloads
}) => {
  const dispatch = useDispatch();

  /**
   * Rows actually rendered in <tbody>.
   *
   * Some callers pass the FULL filtered list and rely on AdminTable to paginate;
   * others pre-slice the page themselves before passing `data`. We auto-detect:
   * a pre-sliced page can never be longer than rowsPerPage, so slicing only when
   * data.length > rowsPerPage is safe for both styles and never double-slices.
   */
  const pageRows = (() => {
    if (!rowsPerPage || !currentPage) return data;
    if (data.length <= rowsPerPage) return data;   // already sliced (or single page)
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  })();

  const getExportRows = () => {
    if (exportData && exportData.length > 0) return exportData;
    // fallback: extract primitive values from data objects (skip functions/arrays/objects)
    return data.map(item => {
      const vals = Object.values(item).filter(v => typeof v !== 'function' && !Array.isArray(v) && typeof v !== 'object');
      return vals.slice(0, columns.length).map(v => v === null || v === undefined ? '' : String(v));
    });
  };

  const getFileName = () => {
    const prefix = fileNamePrefix || (title ? title.toLowerCase().replace(/\s+/g, '_') : 'report');
    const d = new Date();
    return `${prefix}_${d.getDate().toString().padStart(2,'0')}_${(d.getMonth()+1).toString().padStart(2,'0')}_${d.getFullYear()}`;
  };

  const handleExport = (type) => {
    const headers = columns;
    const rows = getExportRows();
    const fileName = getFileName();

    if (type === 'copy') {
      const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
      navigator.clipboard.writeText(tsv)
        .then(() => dispatch(setNotification({ type: 'success', message: 'Table data copied to clipboard!' })))
        .catch(() => dispatch(setNotification({ type: 'error', message: 'Failed to copy data.' })));

    } else if (type === 'csv') {
      const csv = [headers.join(','), ...rows.map(r =>
        r.map(v => { const s = String(v); return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s; }).join(',')
      )].join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      link.download = `${fileName}.csv`;
      link.click();
      dispatch(setNotification({ type: 'success', message: 'CSV downloaded successfully!' }));

    } else if (type === 'excel') {
      let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">`;
      html += `<tr style="background-color:#0D1B5E;color:#FFFFFF;font-weight:bold;">${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
      rows.forEach(r => { html += `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`; });
      html += `</table></body></html>`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([html], { type: 'application/vnd.ms-excel' }));
      link.download = `${fileName}.xls`;
      link.click();
      dispatch(setNotification({ type: 'success', message: 'Excel downloaded successfully!' }));

    } else if (type === 'print' || type === 'pdf') {
      const pw = window.open('', '_blank', 'width=900,height=700');
      if (!pw) return;
      const rowsHtml = rows.map(r =>
        `<tr>${r.map((v, ci) => {
          const s = String(v); const lo = s.toLowerCase();
          let st = ''; let html = s;
          if (lo === 'success' || lo === 'active') { st = 'color:#27AE60;font-weight:bold;'; html = s.toUpperCase(); }
          else if (lo === 'failed' || lo === 'rejected' || lo === 'inactive') { st = 'color:#E53E3E;font-weight:bold;'; html = s.toUpperCase(); }
          else if (lo === 'pending' || lo === 'processing') { st = 'color:#D97706;font-weight:bold;'; html = s.toUpperCase(); }
          else if (s.startsWith('₹')) { st = 'color:#27AE60;font-weight:bold;'; }
          else if (ci === 1) { st = 'font-weight:600;color:#1756AA;'; }
          return `<td style="${st}">${html}</td>`;
        }).join('')}</tr>`
      ).join('');
      pw.document.write(`<!DOCTYPE html><html><head><title>${fileName}</title><style>
        body{font-family:'Segoe UI',sans-serif;margin:20px;color:#333}
        h2{color:#0D1B5E;border-bottom:2px solid #0D1B5E;padding-bottom:8px;text-transform:capitalize}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th,td{border:1px solid #E2E8F0;padding:8px 10px;text-align:left;font-size:13px}
        th{background:#0D1B5E;color:#fff;font-weight:bold}
        tr:nth-child(even){background:#F8FAFC}
        @media print{th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      </style></head><body>
        <h2>${(fileNamePrefix || title || 'Report').replace(/_/g,' ')}</h2>
        <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rowsHtml}</tbody></table>
        <script>window.onload=function(){window.print();window.close();}<\/script>
      </body></html>`);
      pw.document.close();
      dispatch(setNotification({ type: 'success', message: `${type.toUpperCase()} export opened!` }));
    }
  };

  return (
    <div className={styles.card}>
      
      {topContent && (
        <div className={styles.topContent}>
          {topContent}
        </div>
      )}
      
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

            {filtersPanel && (
        <div className={styles.filterPanelWrapper}>
          {filtersPanel}
        </div>
      )}

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
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_copy}`} title="Copy" onClick={() => handleExport('copy')}><FiCopy /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_excel}`} title="Excel" onClick={() => handleExport('excel')}><FaFileExcel /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_csv}`} title="CSV" onClick={() => handleExport('csv')}><FaFileCsv /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_pdf}`} title="PDF" onClick={() => handleExport('pdf')}><FaFilePdf /></button>
          <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_print}`} title="Print" onClick={() => handleExport('print')}><FaPrint /></button>
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
            {pageRows.length > 0 ? (
              pageRows.map((item, index) => renderRow(item, index))
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

            <div className={styles.paginationRow}>
        <div className={styles.paginationInfo}>
          {totalEntries === 0
            ? "Showing 0 entries"
            : `Showing ${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, totalEntries)} of ${totalEntries} entries | Page ${currentPage} of ${totalPages || 1}`
          }
        </div>
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <FiChevronLeft />
          </button>
          {(() => {
            const delta = 2;
            const left = currentPage - delta;
            const right = currentPage + delta;
            const pages = [];
            let prev = null;
            for (let i = 1; i <= (totalPages || 1); i++) {
              if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                if (prev !== null && i - prev > 1) pages.push('...');
                pages.push(i);
                prev = i;
              }
            }
            return pages.map((pg, i) =>
              pg === '...'
                ? <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '36px' }}>…</span>
                : <button
                    key={pg}
                    className={`${styles.pageBtn} ${pg === currentPage ? styles.activePage : ''}`}
                    onClick={() => onPageChange(pg)}
                  >{pg}</button>
            );
          })()}
          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminTable;
