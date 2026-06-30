import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  setAddBankSearchQuery, 
  setAddBankSelectedBank, 
  setAddBankIsPanelOpen, 
  setAddBankIsActive 
} from '../../../store/slices/balanceSlice';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaEdit, FaTrash,
  FaCheck, FaSpinner
} from 'react-icons/fa';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from './AddBank.module.css';

const AddBank = () => {
  const dispatch = useDispatch();
  const { 
    addBankList, 
    addBankSearchQuery, 
    addBankSelectedBank, 
    addBankIsPanelOpen, 
    addBankIsActive 
  } = useSelector((s) => s.balance);
  
  // Use local state for the list to demonstrate 'Add' functionality
  const [localBankList, setLocalBankList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fetchBanks = async () => {
    try {
      const res = await API.bank.getAll();
      if (Array.isArray(res)) {
        setLocalBankList(res.map(item => ({
          id: item.id,
          name: item.bankName || item.bankCode,
          ifsc: item.ifscCode || item.ifsc || 'N/A',
          status: item.isActive ? 'Active' : 'InActive',
          date: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
          ...item
        })));
        setErrorMsg('');
      } else {
        setErrorMsg('Failed to fetch banks from API.');
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
      setErrorMsg('Failed to connect to the bank API.');
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);
  
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  // Local State
  const [manualBankName, setManualBankName] = useState('');
  const [manualIfsc, setManualIfsc] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // NEW dedicated state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [showSmartPanel, setShowSmartPanel] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null }); // Local panel control

  // Bank master configurations
  const [dailyLimit, setDailyLimit] = useState(1000000.00);
  const [perTransactionLimit, setPerTransactionLimit] = useState(200000.00);
  const [isRbirestricted, setIsRbirestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState('');
  const [supportsImps, setSupportsImps] = useState(true);
  const [supportsNeft, setSupportsNeft] = useState(true);
  const [supportsRtgs, setSupportsRtgs] = useState(true);
  const [supportsPayout, setSupportsPayout] = useState(true);
  const [supportsVa, setSupportsVa] = useState(false);
  const [isHighSpeedEnabled, setIsHighSpeedEnabled] = useState(true);
  const [maxTpsallowed, setMaxTpsallowed] = useState(10);
  const [priorityOrder, setPriorityOrder] = useState(1);

  // Filter banks based on search query for the Smart Panel
  const filteredBanks = addBankList.filter(bank => 
    bank.name.toLowerCase().includes(addBankSearchQuery.toLowerCase()) || 
    bank.ifsc.toLowerCase().includes(addBankSearchQuery.toLowerCase())
  );

  // Filter for Table
  const tableFilteredData = localBankList.filter(item => 
    item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    item.ifsc.toLowerCase().includes(tableSearch.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(tableFilteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableFilteredData.slice(startIndex, startIndex + rowsPerPage);

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current && !panelRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)
      ) {
        setShowSmartPanel(false);
      }
    };
    if (showSmartPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSmartPanel]);

  const handleSelectBank = (bank) => {
    dispatch(setAddBankSelectedBank(bank));
    setManualBankName(bank.name);
    setManualIfsc(bank.ifsc);
    dispatch(setAddBankSearchQuery(''));
    setShowSmartPanel(false);
  };

  const handleInputFocus = () => {
    setShowSmartPanel(true);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setManualBankName(val);
    dispatch(setAddBankSearchQuery(val));
    if (!showSmartPanel) setShowSmartPanel(true);
    // Clear selection if typing manually to allow custom bank
    if (addBankSelectedBank && val !== addBankSelectedBank.name) {
      dispatch(setAddBankSelectedBank(null));
      setManualIfsc('');
    }
  };

  const handleRegisterBank = async () => {
    if (!manualBankName || !manualIfsc) {
      alert("Please fill in both Bank Name and IFSC Code.");
      return;
    }

    try {
      const payload = {
        id: editingBank ? editingBank.id : 0,
        bankCode: manualBankName.substring(0, 4).toUpperCase(),
        bankName: manualBankName,
        ifscrequired: manualIfsc ? true : false,
        supportsImps,
        supportsNeft,
        supportsRtgs,
        supportsPayout,
        supportsVa,
        isHighSpeedEnabled,
        maxTpsallowed,
        dailyLimit,
        perTransactionLimit,
        isRbirestricted,
        restrictionReason: isRbirestricted ? restrictionReason : null,
        isActive: addBankIsActive,
        priorityOrder
      };
      
      if (editingBank) {
        await API.bank.update(payload);
      } else {
        await API.bank.create(payload);
      }
      fetchBanks();
    } catch (err) {
      console.error("Error registering bank:", err);
      // Fallback local logic
      if (editingBank) {
        const updatedList = localBankList.map(b => 
          b.id === editingBank.id ? { ...b, name: manualBankName, ifsc: manualIfsc } : b
        );
        setLocalBankList(updatedList);
      } else {
        const newBank = {
          id: Date.now(),
          name: manualBankName,
          ifsc: manualIfsc,
          status: addBankIsActive ? 'Active' : 'InActive',
          date: new Date().toLocaleDateString('en-GB')
        };
        setLocalBankList([newBank, ...localBankList]);
      }
    }
    closeModals();
  };

  const confirmDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  const handleDeleteBank = async () => {
    try {
      await API.bank.delete(deleteModal.id);
      fetchBanks();
    } catch (err) {
      console.error("Error deleting bank:", err);
      const updatedList = localBankList.filter(b => b.id !== deleteModal.id);
      setLocalBankList(updatedList);
    }
    setDeleteModal({ open: false, id: null });
  };

  const openAddModal = () => {
    setManualBankName('');
    setManualIfsc('');
    dispatch(setAddBankSelectedBank(null));
    
    // Reset configs to defaults
    setDailyLimit(1000000.00);
    setPerTransactionLimit(200000.00);
    setIsRbirestricted(false);
    setRestrictionReason('');
    setSupportsImps(true);
    setSupportsNeft(true);
    setSupportsRtgs(true);
    setSupportsPayout(true);
    setSupportsVa(false);
    setIsHighSpeedEnabled(true);
    setMaxTpsallowed(10);
    setPriorityOrder(1);

    setIsAddModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingBank(null);
    setShowSmartPanel(false);
  };

  return (
    <div className={styles.container}>
      
      {/* ── ADD/EDIT MODAL ── */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingBank ? 'Update Bank Detail' : 'Insert Bank Detail'}
              </h2>
              <button className={styles.closeBtn} onClick={closeModals}>
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                {/* Bank Name Input */}
                <div className={styles.formGroup}>
                  <label><FaSearch className={styles.labelIcon} /> Bank Name</label>
                  <input 
                    type="text" 
                    className={styles.inputControl}
                    placeholder="Enter Bank Name"
                    value={manualBankName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* IFSC Code */}
                <div className={styles.formGroup}>
                  <label><FaSpinner className={styles.labelIcon} /> IFSC Code</label>
                  <input 
                    type="text" 
                    className={styles.inputControl}
                    value={manualIfsc}
                    onChange={(e) => setManualIfsc(e.target.value)}
                    placeholder="Enter IFSC manually"
                    required
                  />
                </div>

                {/* Priority Order */}
                <div className={styles.formGroup}>
                  <label>Priority Order</label>
                  <input 
                    type="number" 
                    className={styles.inputControl}
                    value={priorityOrder}
                    onChange={(e) => setPriorityOrder(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Max TPS Allowed */}
                <div className={styles.formGroup}>
                  <label>Max TPS Allowed</label>
                  <input 
                    type="number" 
                    className={styles.inputControl}
                    value={maxTpsallowed}
                    onChange={(e) => setMaxTpsallowed(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Daily Limit */}
                <div className={styles.formGroup}>
                  <label>Daily Limit (₹)</label>
                  <input 
                    type="number" 
                    className={styles.inputControl}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Per Transaction Limit */}
                <div className={styles.formGroup}>
                  <label>Per Transaction Limit (₹)</label>
                  <input 
                    type="number" 
                    className={styles.inputControl}
                    value={perTransactionLimit}
                    onChange={(e) => setPerTransactionLimit(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Feature checkboxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={supportsImps} onChange={(e) => setSupportsImps(e.target.checked)} />
                  Supports IMPS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={supportsNeft} onChange={(e) => setSupportsNeft(e.target.checked)} />
                  Supports NEFT
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={supportsRtgs} onChange={(e) => setSupportsRtgs(e.target.checked)} />
                  Supports RTGS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={supportsPayout} onChange={(e) => setSupportsPayout(e.target.checked)} />
                  Supports Payout
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={supportsVa} onChange={(e) => setSupportsVa(e.target.checked)} />
                  Supports VA
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isHighSpeedEnabled} onChange={(e) => setIsHighSpeedEnabled(e.target.checked)} />
                  High Speed Enabled
                </label>
              </div>

              {/* RBI Restriction Row */}
              <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '8px' }}>
                  <input type="checkbox" checked={isRbirestricted} onChange={(e) => setIsRbirestricted(e.target.checked)} />
                  <span className={styles.fwBold} style={{ color: '#E53E3E' }}>RBI Restricted</span>
                </label>
                {isRbirestricted && (
                  <div className={styles.formGroup}>
                    <input 
                      type="text" 
                      className={styles.inputControl}
                      placeholder="Enter RBI Restriction Reason"
                      value={restrictionReason}
                      onChange={(e) => setRestrictionReason(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Status Row */}
              <div className={styles.statusRow}>
                <div className={styles.statusLabel}>
                  <span className={styles.fwBold}>Account Status</span>
                  <span className={styles.subText}>Enable or disable this bank account</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={addBankIsActive}
                    onChange={() => dispatch(setAddBankIsActive(!addBankIsActive))}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModals}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleRegisterBank}>
                <FaCheck /> {editingBank ? 'Update Bank Details' : 'Register New Bank'}
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
            <p>Do you really want to delete this bank? This action cannot be undone.</p>
            <div className={styles.deleteActionBtns}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDeleteBank}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Full List Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.pageTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Bank List Management
          </h2>
          <button className={styles.addBtn} onClick={openAddModal}>
            <FaPlus /> Add Bank
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '15px 20px', padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

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
            headers={['S.No', 'Bank Name', 'IFSC Code', 'Status']}
            rows={currentData.map((row, index) => [
              startIndex + index + 1, row.name, row.ifsc, 'Active'
            ])}
            fileNamePrefix="add_bank_report"
            sheetName="Added Banks"
          />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Bank..." 
              className={styles.searchInput}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Bank Name</th>
                <th>IFSC Code</th>
                <th>Status</th>
                <th className={styles.centerAlign}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{startIndex + index + 1}</td>
                  <td className={styles.fwBold}>{row.name}</td>
                  <td className={styles.ifscText}>{row.ifsc}</td>
                  <td>
                    <span className={styles.badgeActive}>Active</span>
                  </td>
                  <td className={styles.centerAlign}>
                    <div className={styles.actionRow}>
                      <button 
                        className={styles.editBtn} 
                        title="Edit Bank"
                        onClick={() => {
                          setEditingBank(row);
                          setManualBankName(row.bankName || row.name);
                          setManualIfsc(row.ifscrequired ? 'Required' : '');
                          
                          setDailyLimit(row.dailyLimit || 1000000.00);
                          setPerTransactionLimit(row.perTransactionLimit || 200000.00);
                          setIsRbirestricted(row.isRbirestricted || false);
                          setRestrictionReason(row.restrictionReason || '');
                          setSupportsImps(row.supportsImps !== false);
                          setSupportsNeft(row.supportsNeft !== false);
                          setSupportsRtgs(row.supportsRtgs !== false);
                          setSupportsPayout(row.supportsPayout !== false);
                          setSupportsVa(row.supportsVa || false);
                          setIsHighSpeedEnabled(row.isHighSpeedEnabled !== false);
                          setMaxTpsallowed(row.maxTpsallowed || 10);
                          setPriorityOrder(row.priorityOrder || 1);

                          setIsEditModalOpen(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        title="Delete Bank"
                        onClick={() => confirmDelete(row.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationRow}>
          <div className={styles.pageInfo}>
            Showing {tableFilteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, tableFilteredData.length)} of {tableFilteredData.length} entries
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

    </div>
  );
};

export default AddBank;

