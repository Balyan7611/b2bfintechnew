import React, { useState, useRef } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useSelector, useDispatch } from 'react-redux';
import {
  addSupportEntry,
  updateSupportEntry,
  setAddSupportPage,
  setAddSupportRows,
  setAddSupportSearch,
  toggleSupportStatus,
} from '../../../store/slices/supportSlice';
import {
  FaArrowRight, FaEdit, FaSearch, FaCopy,
  FaFileExcel, FaFileCsv, FaFilePdf, FaPrint,
  FaChevronLeft, FaChevronRight, FaBold, FaItalic,
  FaUnderline, FaListUl, FaListOl, FaLink, FaHeading,
  FaCheck, FaSpinner, FaPlus, FaTimes, FaHeadset, FaInfoCircle, FaPowerOff
} from 'react-icons/fa';
import styles from './AddSupport.module.css';
import { sanitizeHTML } from '../../../utils/securityUtils';

const SupportMain = () => {
  const dispatch = useDispatch();
  const { manageSupportList, addSupportPage, addSupportRows, addSupportSearch } = useSelector(s => s.support);

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, row: null });
  const [savedSelection, setSavedSelection] = useState(null);
  const editorRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      setSavedSelection(sel.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
  };

  const execCmd = (cmd, value = null) => {
    restoreSelection();
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    saveSelection();
  };

  const insertLink = () => {
    const url = prompt('Enter URL (e.g., https://google.com):');
    if (!url) return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    const text = selection.toString() || url;
    execCmd('insertHTML', `<a href="${url}" target="_blank" style="color: #3B82F6; text-decoration: underline;">${text}</a>`);
  };

  const handleEdit = (entry) => {
    setName(entry.name);
    setEditingId(entry.id);
    setIsModalOpen(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = entry.description;
    }, 100);
  };

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setIsModalOpen(false);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleStatusToggle = () => {
    dispatch(toggleSupportStatus(statusModal.row.id));
    setStatusModal({ open: false, row: null });
    showToast('Status updated successfully!');
  };

  const handleSave = () => {
    const desc = editorRef.current?.innerHTML?.trim();
    if (!name.trim()) { showToast('Please enter Support Name.', 'error'); return; }
    if (!desc || desc === '<br>') { showToast('Please enter Description.', 'error'); return; }
    setLoading(true);
    setTimeout(() => {
      if (editingId) {
        dispatch(updateSupportEntry({ id: editingId, name: name.trim(), description: desc }));
        showToast('Support updated successfully!');
      } else {
        dispatch(addSupportEntry({ name: name.trim(), description: desc }));
        showToast('Support saved successfully!');
      }
      setLoading(false);
      resetForm();
    }, 900);
  };

  const filtered = (manageSupportList || []).filter(e =>
    e.name.toLowerCase().includes(addSupportSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / addSupportRows);
  const pageData = filtered.slice((addSupportPage - 1) * addSupportRows, addSupportPage * addSupportRows);

  return (
    <div className={styles.page} style={{ padding: '0 10px', maxWidth: '100%' }}>
      {/* ── TOAST ── */}
      {toast && (
        <div className={`global-toast ${toast.type === 'error' ? 'global-toast-error' : 'global-toast-success'}`}>
          <FaCheck /> {toast.msg}
        </div>
      )}

      {/* ── TABLE CARD ── */}
      <div
        className={styles.card}
        style={{
          width: '95%',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.cardIconBox}>
              <FaHeadset />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Support</h2>
              <p className={styles.cardSubtitle}>Manage support topics and help entries</p>
            </div>
          </div>
          <button
            className={styles.addBtn}
            onClick={() => { resetForm(); setIsModalOpen(true); }}
          >
            <FaPlus /> New Support
          </button>
        </div>

        {/* Controls Row */}
        <div className={styles.controls}>
          <div className={styles.rowsControl}>
            <span>Show</span>
            <select
              className={styles.select}
              value={addSupportRows}
              onChange={e => dispatch(setAddSupportRows(Number(e.target.value)))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>rows</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="supportmain_report" sheetName="Report" />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name..."
              className={styles.searchInput}
              value={addSupportSearch}
              onChange={e => dispatch(setAddSupportSearch(e.target.value))}
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper} style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Add Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length > 0 ? pageData.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ color: '#A0AEC0', fontWeight: 600 }}>{(addSupportPage - 1) * addSupportRows + i + 1}</td>
                  <td className={styles.nameCell}>{row.name}</td>
                  <td>
                    <div
                      className={styles.descCell}
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(row.description) }}
                    />
                  </td>
                  <td>
                    <button 
                      onClick={() => setStatusModal({ open: true, row: row })}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      <span className={`${styles.badge} ${row.status === 'Active' ? styles.badgeActive : styles.badgeInactive}`}>
                        <FaPowerOff style={{ marginRight: '4px', fontSize: '10px' }} />
                        {row.status}
                      </span>
                    </button>
                  </td>
                  <td className={styles.dateCell}>{row.addDate}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => handleEdit(row)}>
                      <FaEdit /> Edit
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: '12px' }}>
                      <FaInfoCircle style={{ fontSize: '2rem', color: '#CBD5E0' }} />
                      <span style={{ color: '#A0AEC0', fontWeight: 500, fontSize: '0.9rem' }}>No support entries found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {filtered.length === 0 ? 0 : (addSupportPage - 1) * addSupportRows + 1} to {Math.min(addSupportPage * addSupportRows, filtered.length)} of {filtered.length} entries
          </span>
          <div className={styles.pageBtns}>
            <button className={styles.pageBtn} disabled={addSupportPage === 1} onClick={() => dispatch(setAddSupportPage(addSupportPage - 1))}>
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                className={`${styles.pageBtn} ${addSupportPage === num ? styles.pageActive : ''}`}
                onClick={() => dispatch(setAddSupportPage(num))}
              >
                {num}
              </button>
            ))}
            <button className={styles.pageBtn} disabled={addSupportPage === totalPages || totalPages === 0} onClick={() => dispatch(setAddSupportPage(addSupportPage + 1))}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── STATUS CHANGE MODAL ── */}
      {statusModal.open && (
        <div className={styles.modalOverlay} onClick={() => setStatusModal({ open: false, row: null })}>
          <div className={styles.modalContainer} style={{ maxWidth: '380px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: statusModal.row.status === 'Active' ? '#FFF5F5' : '#F0FDF4', color: statusModal.row.status === 'Active' ? '#E53E3E' : '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <FaPowerOff />
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: '#1E293B' }}>Confirm Status</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#64748B' }}>Are you sure you want to change the status to <strong style={{ color: '#1E293B' }}>{statusModal.row.status === 'Active' ? 'InActive' : 'Active'}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className={styles.cancelFormBtn} onClick={() => setStatusModal({ open: false, row: null })}>Cancel</button>
              <button className={styles.saveBtn} style={{ background: statusModal.row.status === 'Active' ? '#E53E3E' : '#27AE60', minWidth: 'auto', padding: '0 20px' }} onClick={handleStatusToggle}>Yes, Change</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconBox}><FaHeadset /></div>
                <div>
                  <h2 className={styles.modalTitle}>
                    {editingId ? 'Edit Support Entry' : 'New Support Entry'}
                  </h2>
                  <span className={styles.modalSubtitle}>Fill in the details below</span>
                </div>
              </div>
              <button className={styles.closeModalBtn} onClick={resetForm}>
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Support Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Support Name <span className={styles.req}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Customer Support, Technical Help..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Rich Text Editor */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Description <span className={styles.req}>*</span></label>
                <div className={styles.editorToolbar}>
                  <button className={styles.toolBtn} type="button" onClick={() => execCmd('bold')} title="Bold"><FaBold /></button>
                  <button className={styles.toolBtn} type="button" onClick={() => execCmd('italic')} title="Italic"><FaItalic /></button>
                  <button className={styles.toolBtn} type="button" onClick={() => execCmd('underline')} title="Underline"><FaUnderline /></button>
                  <div className={styles.toolDivider} />
                  <input 
                    type="color" 
                    onChange={(e) => execCmd('foreColor', e.target.value)}
                    title="Text Color"
                    style={{ width: '28px', height: '28px', padding: '0', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <select 
                    onChange={(e) => execCmd('fontSize', e.target.value)} 
                    title="Font Size"
                    style={{ height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.8rem', padding: '0 4px', color: '#4E6080', outline: 'none', cursor: 'pointer', background: '#F8FAFF' }}
                  >
                    <option value="">Size</option>
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                  </select>
                  <div className={styles.toolDivider} />
                  <button className={styles.toolBtn} type="button" onClick={() => execCmd('formatBlock', 'h3')} title="Heading"><FaHeading /></button>
                  <button className={styles.toolBtn} type="button" onClick={() => execCmd('insertUnorderedList')} title="Bullet List"><FaListUl /></button>
                  <button className={styles.toolBtn} type="button" onClick={() => execCmd('insertOrderedList')} title="Numbered List"><FaListOl /></button>
                  <div className={styles.toolDivider} />
                  <button className={styles.toolBtn} type="button" onClick={insertLink} title="Insert Link"><FaLink /></button>
                </div>
                <div
                  ref={editorRef}
                  className={styles.editorArea}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Type your support description here..."
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  onMouseLeave={saveSelection}
                />
              </div>

              {/* Footer */}
              <div className={styles.formFooter}>
                <button className={styles.cancelFormBtn} onClick={resetForm}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <><FaSpinner className={styles.spinner} /> Saving...</>
                  ) : (
                    <>{editingId ? 'Update' : 'Save'} <FaArrowRight /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportMain;