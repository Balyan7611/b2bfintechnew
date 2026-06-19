import React, { useState, useRef, useEffect } from 'react';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaEdit, FaTrash, FaPowerOff, 
  FaTimes, FaCheck, FaChevronDown, FaUser, FaPlus, FaBuilding, FaIdCard, FaTag
} from 'react-icons/fa';
import { FiDatabase, FiMoreVertical } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import styles from './MemberBankDetails.module.css';

const MemberBankDetails = () => {
  const [bankList, setBankList] = useState([]);
  const [bankMasterList, setBankMasterList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Header filter Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Action Dropdown state
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, row: null });

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmToggleRow, setConfirmToggleRow] = useState(null);

  // Form state
  const [formState, setFormState] = useState({
    id: 0,
    msrno: 0,
    bankId: 0,
    name: '',
    ifsccode: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
    isActive: true,
    isDelete: false,
    documentVerify: false,
    beneId: 0,
    result: '',
    document: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [banksData, masterData] = await Promise.all([
        API.memberBankDetail.getAll().catch(() => []),
        API.bank.getAll().catch(() => [])
      ]);
      setBankList(banksData || []);
      setBankMasterList(masterData || []);
    } catch (error) {
      console.error('Failed to fetch member bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchMembers = async (query) => {
    try {
      const res = await API.member.search(query || '');
      setMemberList(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    handleSearchMembers('');
  }, []);

  useEffect(() => {
    if (memberSearchQuery !== undefined) {
      const delayDebounce = setTimeout(() => {
        handleSearchMembers(memberSearchQuery);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [memberSearchQuery]);

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

  const handleOpenAdd = () => {
    setFormState({
      id: 0,
      msrno: 0,
      bankId: 0,
      name: '',
      ifsccode: '',
      accountNumber: '',
      accountHolderName: '',
      branchName: '',
      isActive: true,
      isDelete: false,
      documentVerify: false,
      beneId: 0,
      result: '',
      document: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setFormState({
      id: row.id,
      msrno: row.msrno || 0,
      bankId: row.bankId || 0,
      name: row.name || '',
      ifsccode: row.ifsccode || '',
      accountNumber: row.accountNumber || '',
      accountHolderName: row.accountHolderName || '',
      branchName: row.branchName || '',
      isActive: row.isActive,
      isDelete: row.isDelete || false,
      documentVerify: row.documentVerify || false,
      beneId: row.beneId || 0,
      result: row.result || '',
      document: row.document || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.memberBankDetail.update(formState);
      } else {
        await API.memberBankDetail.create(formState);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save member bank detail:', error);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId) {
      try {
        await API.memberBankDetail.delete(confirmDeleteId);
        setConfirmDeleteId(null);
        fetchData();
      } catch (error) {
        console.error('Failed to delete member bank detail:', error);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (confirmToggleRow) {
      try {
        const updated = { ...confirmToggleRow, isActive: !confirmToggleRow.isActive };
        await API.memberBankDetail.update(updated);
        setConfirmToggleRow(null);
        fetchData();
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  // Filter Data
  const filteredData = bankList.filter(item => {
    const matchMember = !selectedMemberFilter || item.msrno === parseInt(selectedMemberFilter.id) || item.name === selectedMemberFilter.name;
    const matchSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.accountNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchMember && matchSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className={styles.container}>
      
      {/* ── MODAL POPUP ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <form className={styles.modalContainer} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isEditing ? 'Edit Bank Account Details' : 'Add Bank Account Details'}</h2>
              <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.formGroup}>
                  <label>Select Member</label>
                  <select 
                    name="msrno"
                    className={styles.inputControl}
                    value={formState.msrno}
                    onChange={(e) => {
                      const msrVal = parseInt(e.target.value);
                      const selected = memberList.find(m => parseInt(m.id) === msrVal || m.uniqueID === e.target.value);
                      setFormState(prev => ({
                        ...prev,
                        msrno: msrVal,
                        name: selected ? selected.name : ''
                      }));
                    }}
                    required
                  >
                    <option value="">Choose Member</option>
                    {memberList.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.memberId || m.id})</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Select Bank</label>
                  <select 
                    name="bankId"
                    className={styles.inputControl}
                    value={formState.bankId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose Bank</option>
                    {bankMasterList.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName || b.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Account Holder Name</label>
                  <input 
                    type="text" 
                    name="accountHolderName" 
                    className={styles.inputControl} 
                    placeholder="Enter Account Holder Name"
                    value={formState.accountHolderName} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <input 
                    type="text" 
                    name="accountNumber" 
                    className={styles.inputControl} 
                    placeholder="Enter Account Number"
                    value={formState.accountNumber} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>IFSC Code</label>
                  <input 
                    type="text" 
                    name="ifsccode" 
                    className={styles.inputControl} 
                    placeholder="Enter IFSC"
                    value={formState.ifsccode} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Branch Name</label>
                  <input 
                    type="text" 
                    name="branchName" 
                    className={styles.inputControl} 
                    placeholder="Enter Branch Name"
                    value={formState.branchName} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Beneficiary ID (Optional)</label>
                  <input 
                    type="number" 
                    name="beneId" 
                    className={styles.inputControl} 
                    placeholder="Enter Bene ID"
                    value={formState.beneId} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Document (Optional)</label>
                  <input 
                    type="text" 
                    name="document" 
                    className={styles.inputControl} 
                    placeholder="Document URL or Name"
                    value={formState.document} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #e2e8f0', marginTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Active</label>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formState.isActive} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Document Verified</label>
                  <input 
                    type="checkbox" 
                    name="documentVerify" 
                    checked={formState.documentVerify} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>
                {isEditing ? 'Update Details' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.pageTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Bank Details Management
          </h2>
          
          <div className={styles.headerFilters} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Custom Searchable Dropdown */}
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
              <div 
                className={`${styles.headerDropdown} ${isDropdownOpen ? styles.dropdownActive : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className={styles.selectedMemberText}>
                  {selectedMemberFilter ? (
                    <span className={styles.fwBold}>
                      <FaUser className={styles.memberIcon} /> {selectedMemberFilter.name}
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
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className={styles.optionsList}>
                    <div 
                      className={styles.optionItem}
                      onClick={() => { setSelectedMemberFilter(null); setIsDropdownOpen(false); setMemberSearchQuery(''); }}
                    >
                      All Members
                    </div>
                    {memberList.map(m => (
                      <div 
                        key={m.id} 
                        className={`${styles.optionItem} ${selectedMemberFilter?.id === m.id ? styles.optionSelected : ''}`}
                        onClick={() => { setSelectedMemberFilter(m); setIsDropdownOpen(false); setMemberSearchQuery(''); }}
                      >
                        <div className={styles.optionInfo}>
                          <span className={styles.optionName}>{m.name}</span>
                          <span className={styles.optionId}>{m.memberId || m.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className={styles.addBtn} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleOpenAdd}>
              <FaPlus /> Add Member Bank
            </button>
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
            headers={['S.No', 'Member Name', 'Bank Name', 'IFSC', 'Branch', 'Account No', 'Verified', 'Status']}
            rows={currentData.map((row, index) => {
              const bankObj = bankMasterList.find(b => b.id === row.bankId);
              return [
                startIndex + index + 1, row.name, bankObj ? bankObj.bankName || bankObj.name : `Bank #${row.bankId}`, row.ifsccode, row.branchName, row.accountNumber, row.documentVerify ? 'Yes' : 'No', row.isActive ? 'Active' : 'Inactive'
              ];
            })}
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
                <th>Holder Name</th>
                <th>Verified</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontWeight: 600 }}>Loading member banks...</td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((row, index) => {
                  const bankObj = bankMasterList.find(b => b.id === row.bankId);
                  return (
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
                          <span className={styles.subText}>MSR: {row.msrno}</span></div></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles.fwBold}>{bankObj ? bankObj.bankName || bankObj.name : `Bank #${row.bankId}`}</span>
                          <span className={styles.subText}>{row.ifsccode}</span></div></td>
                      <td>{row.branchName}</td>
                      <td className={styles.fwBold}>{row.accountNumber}</td>
                      <td>{row.accountHolderName}</td>
                      <td>
                        <span className={row.documentVerify ? styles.badgeActive : styles.badgeInactive} style={{ background: row.documentVerify ? '#F0FDF4' : '#FFF5F5', color: row.documentVerify ? '#27AE60' : '#E53E3E', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {row.documentVerify ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>
                        <span className={row.isActive ? styles.badgeActive : styles.badgeInactive} style={{ background: row.isActive ? '#F0FDF4' : '#FFF5F5', color: row.isActive ? '#27AE60' : '#E53E3E', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
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
              handleOpenEdit(activeActionRow.row);
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
              setConfirmToggleRow(activeActionRow.row);
              setActiveActionRow({ id: null, x: 0, y: 0, row: null });
            }}
          >
            <FaPowerOff style={{ color: activeActionRow.row?.isActive ? '#E53E3E' : '#22C55E' }} /> 
            {activeActionRow.row?.isActive ? 'Deactivate' : 'Activate'}
          </button>

          <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />

          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#E53E3E', borderRadius: '8px', textAlign: 'left', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              setConfirmDeleteId(activeActionRow.id);
              setActiveActionRow({ id: null, x: 0, y: 0, row: null });
            }}
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {confirmDeleteId && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteIconBox}>
              <FaTrash />
            </div>
            <h3>Are you sure?</h3>
            <p>Do you really want to delete this bank record? This action cannot be undone.</p>
            <div className={styles.deleteActionBtns}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS CHANGE MODAL ── */}
      {confirmToggleRow && (
        <div className={styles.modalOverlay} onClick={() => setConfirmToggleRow(null)}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteIconBox} style={{ background: confirmToggleRow.isActive ? '#FFF5F5' : '#F0FDF4', color: confirmToggleRow.isActive ? '#E53E3E' : '#27AE60' }}>
              <FaPowerOff />
            </div>
            <h3>Confirm Status Change</h3>
            <p>Are you sure you want to change the status to <strong>{confirmToggleRow.isActive ? 'Inactive' : 'Active'}</strong> for {confirmToggleRow.name}?</p>
            <div className={styles.deleteActionBtns}>
              <button className={styles.cancelBtn} onClick={() => setConfirmToggleRow(null)}>Cancel</button>
              <button className={styles.deleteBtn} style={{ background: confirmToggleRow.isActive ? '#E53E3E' : '#27AE60' }} onClick={handleToggleStatus}>Yes, Change it</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberBankDetails;
