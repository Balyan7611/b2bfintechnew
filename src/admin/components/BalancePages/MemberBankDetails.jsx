import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaEdit, FaTrash, FaPowerOff, 
  FaTimes, FaCheck, FaChevronDown, FaUser 
} from 'react-icons/fa';
import { FiDatabase, FiMoreVertical } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from './MemberBankDetails.module.css';
import { toggleMemberBankStatus } from '../../../store/slices/balanceSlice';

const MemberBankDetails = () => {
  const dispatch = useDispatch();
  const { memberBankList } = useSelector((s) => s.balance);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const dropdownRef = useRef(null);

  // Action Dropdown state
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, row: null });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Status Change Confirmation State
  const [statusModal, setStatusModal] = useState({ open: false, row: null });

  // Mock Members for dropdown
  const members = [
    { id: 'MDT8597', name: 'VIVEK VARSHNEY' },
    { id: 'Pay99DT5001', name: 'vivek' },
    { id: 'Pay99RT4003', name: 'vivek' },
    { id: 'Pay99RT4005', name: 'Rahul Sharma' },
  ];

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Filter Data
  const filteredData = memberBankList.filter(item => {
    const matchMember = !selectedMember || item.memberId === selectedMember.id;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.memberId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMember && matchSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow({ id: null, x: 0, y: 0, row: null });
      }
    };
    
    const handleScroll = (e) => {
      if (e.target.closest && e.target.closest('.action-dropdown-wrapper')) return;
      setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, row: null } : prev);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const openEditModal = (row) => {
    setEditingRow({...row});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRow(null);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  const handleDelete = () => {
    // Logic to delete the record (would normally dispatch a Redux action)
    console.log('Deleting member bank detail:', deleteModal.id);
    setDeleteModal({ open: false, id: null });
  };

  const confirmStatusChange = (row) => {
    setStatusModal({ open: true, row });
  };

  const handleStatusToggle = () => {
    dispatch(toggleMemberBankStatus(statusModal.row.id));
    setStatusModal({ open: false, row: null });
  };

  return (
    <div className={styles.container}>
      
      {/* ── MODAL POPUP ── */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Bank Account Details</h2>
              <button className={styles.closeBtn} onClick={closeEditModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.formGroup}>
                  <label>Member Name</label>
                  <input type="text" className={styles.inputControl} value={editingRow?.name || ''} readOnly style={{ background: '#F1F5F9' }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Member ID</label>
                  <input type="text" className={styles.inputControl} value={editingRow?.memberId || ''} readOnly style={{ background: '#F1F5F9' }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <input type="text" className={styles.inputControl} value={editingRow?.bankName || ''} />
                </div>
                <div className={styles.formGroup}>
                  <label>IFSC Code</label>
                  <input type="text" className={styles.inputControl} value={editingRow?.ifsc || ''} />
                </div>
                <div className={styles.formGroup}>
                  <label>Branch Name</label>
                  <input type="text" className={styles.inputControl} value={editingRow?.branch || ''} />
                </div>
                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <input type="text" className={styles.inputControl} value={editingRow?.accNo || ''} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeEditModal}>Cancel</button>
              <button className={styles.saveBtn} onClick={closeEditModal}>
                Update Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal.open && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal({ open: false, id: null })}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteIconBox}>
              <FaTrash />
            </div>
            <h3>Are you sure?</h3>
            <p>Do you really want to delete this bank record? This action cannot be undone.</p>
            <div className={styles.deleteActionBtns}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS CHANGE MODAL ── */}
      {statusModal.open && (
        <div className={styles.modalOverlay} onClick={() => setStatusModal({ open: false, row: null })}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteIconBox} style={{ background: statusModal.row.status === 'Active' ? '#FFF5F5' : '#F0FDF4', color: statusModal.row.status === 'Active' ? '#E53E3E' : '#27AE60' }}>
              <FaPowerOff />
            </div>
            <h3>Confirm Status Change</h3>
            <p>Are you sure you want to change the status to <strong>{statusModal.row.status === 'Active' ? 'InActive' : 'Active'}</strong> for {statusModal.row.name}?</p>
            <div className={styles.deleteActionBtns}>
              <button className={styles.cancelBtn} onClick={() => setStatusModal({ open: false, row: null })}>Cancel</button>
              <button className={styles.deleteBtn} style={{ background: statusModal.row.status === 'Active' ? '#E53E3E' : '#27AE60' }} onClick={handleStatusToggle}>Yes, Change it</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.pageTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Bank Details Management
          </h2>
          
          <div className={styles.headerFilters}>
            {/* Custom Searchable Dropdown */}
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
              <div 
                className={`${styles.headerDropdown} ${isDropdownOpen ? styles.dropdownActive : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className={styles.selectedMemberText}>
                  {selectedMember ? (
                    <span className={styles.fwBold}>
                      <FaUser className={styles.memberIcon} /> {selectedMember.id}
                    </span>
                  ) : (
                    <span className={styles.placeholder}>All Members</span>
                  )}
                </div>
                <FaChevronDown className={`${styles.arrowIcon} ${isDropdownOpen ? styles.arrowRotate : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownSearch}>
                    <FaSearch className={styles.innerSearchIcon} />
                    <input 
                      type="text" 
                      placeholder="Search member..." 
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className={styles.optionsList}>
                    <div 
                      className={styles.optionItem}
                      onClick={() => { setSelectedMember(null); setIsDropdownOpen(false); setMemberSearch(''); }}
                    >
                      All Members
                    </div>
                    {filteredMembers.map(m => (
                      <div 
                        key={m.id} 
                        className={`${styles.optionItem} ${selectedMember?.id === m.id ? styles.optionSelected : ''}`}
                        onClick={() => { setSelectedMember(m); setIsDropdownOpen(false); setMemberSearch(''); }}
                      >
                        <div className={styles.optionInfo}>
                          <span className={styles.optionName}>{m.name}</span>
                          <span className={styles.optionId}>{m.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
            headers={['S.No', 'Member Name', 'Member ID', 'Bank Name', 'IFSC', 'Branch', 'Account No', 'Added On']}
            rows={currentData.map((row, index) => [
              startIndex + index + 1, row.name, row.memberId, row.bankName, row.ifsc, row.branch, row.accNo, row.date
            ])}
            fileNamePrefix="member_bank_details"
            sheetName="Member Banks"
          />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Name or ID..." 
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
                <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
                <th>Member Details</th>
                <th>Bank Info</th>
                <th>Branch</th>
                <th>Account No</th>
                <th>Added On</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{startIndex + index + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-dropdown-wrapper" style={{ display: 'inline-block' }}>
                      <button 
                        className="action-dropdown-wrapper"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeActionRow.id === row.id) {
                            setActiveActionRow({ id: null, x: 0, y: 0, row: null });
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            let dropX = rect.right + 12;
                            if (dropX + 170 > window.innerWidth) dropX = rect.left - 175;
                            setActiveActionRow({ id: row.id, x: dropX, y: rect.top, row: row });
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
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles.fwBold}>{row.name}</span>
                      <span className={styles.subText}>{row.memberId}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles.fwBold}>{row.bankName}</span>
                      <span className={styles.subText}>{row.ifsc}</span>
                    </div>
                  </td>
                  <td>{row.branch}</td>
                  <td className={styles.fwBold}>{row.accNo}</td>
                  <td className={styles.subText}>{row.date}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
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

      {/* ── ACTION DROPDOWN POPUP ── */}
      {activeActionRow.id && (
        <div 
          className="action-dropdown-wrapper"
          style={{
            position: 'fixed',
            top: activeActionRow.y,
            left: activeActionRow.x,
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E2E8F0',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 9999,
            minWidth: '160px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155', borderRadius: '8px', textAlign: 'left', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              openEditModal(activeActionRow.row);
              setActiveActionRow({ id: null, x: 0, y: 0, row: null });
            }}
          >
            <FaEdit style={{ color: '#3B82F6' }} /> Edit Details
          </button>

          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155', borderRadius: '8px', textAlign: 'left', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              confirmStatusChange(activeActionRow.row);
              setActiveActionRow({ id: null, x: 0, y: 0, row: null });
            }}
          >
            <FaPowerOff style={{ color: activeActionRow.row?.status === 'Active' ? '#E53E3E' : '#22C55E' }} /> 
            {activeActionRow.row?.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>

          <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />

          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#E53E3E', borderRadius: '8px', textAlign: 'left', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              confirmDelete(activeActionRow.id);
              setActiveActionRow({ id: null, x: 0, y: 0, row: null });
            }}
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}

    </div>
  );
};

export default MemberBankDetails;

