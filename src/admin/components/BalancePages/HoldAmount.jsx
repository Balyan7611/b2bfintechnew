import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaPlus, FaTimes,
  FaEdit, FaTrash
} from 'react-icons/fa';
import { addHoldAmount, deleteHoldAmount, updateHoldAmount } from '../../../store/slices/balanceSlice';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from './HoldAmount.module.css';
import { FiDatabase } from 'react-icons/fi';
import PopupModal, { usePopup } from '../../../shared/components/common/PopupModal';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { API } from '../../../api/endpoints';

const HoldAmount = () => {
  const dispatch = useDispatch();
  const { holdAmountList } = useSelector((s) => s.balance);
  const { popup, showPopup, closePopup } = usePopup();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);

    const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchMembers = async () => {
      try {
        const res = await API.member.search('');
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const list = raw.filter(m => {
          const role = (m.roleName || m.role || '').toLowerCase();
          const mid = (m.memberId || m.loginId || '').toUpperCase();
          return !role.includes('admin') && !mid.startsWith('AD');
        });
        if (!cancelled) setMembers(list);
      } catch (err) {
        console.error('HoldAmount: failed to fetch members', err);
      }
    };
    fetchMembers();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = () => {
    if (!selectedMember || !amount || !reason) {
      showPopup('warning', 'Missing Fields', 'Please fill all fields.');
      return;
    }

    if (isEditMode) {
      dispatch(updateHoldAmount({
        id: editingId,
        amount: parseFloat(amount).toFixed(2),
        reason: reason
      }));
    } else {
      dispatch(addHoldAmount({
        name: selectedMember.name,
        memberId: selectedMember.memberId,
        amount: parseFloat(amount).toFixed(2),
        reason: reason
      }));
    }

        setShowModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setSelectedMember(null);
    setAmount('');
    setReason('');
  };

  const handleEdit = (row) => {
    setIsEditMode(true);
    setEditingId(row.id);
    const matched = members.find(m => (m.memberId || m.loginId) === row.memberId);
    setSelectedMember(matched || { id: row.memberId, name: row.name, memberId: row.memberId });
    setAmount(row.amount);
    setReason(row.reason);
    setShowModal(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  const handleDelete = () => {
    dispatch(deleteHoldAmount(deleteModal.id));
    setDeleteModal({ open: false, id: null });
  };

    const filteredData = useMemo(() => {
    return holdAmountList.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.memberId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [holdAmountList, searchQuery]);

  const totalHoldAmount = useMemo(() => {
    return filteredData.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  }, [filteredData]);

    const totalPages = useMemo(() => Math.ceil(filteredData.length / rowsPerPage), [filteredData.length, rowsPerPage]);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = useMemo(() => filteredData.slice(startIndex, startIndex + rowsPerPage), [filteredData, startIndex, rowsPerPage]);

  return (
    <div className={styles.container}>
      
            {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{isEditMode ? 'Edit Hold Amount' : 'Member Hold Amount'}</h2>
              <button className={styles.closeBtn} onClick={() => {
                setShowModal(false);
                setIsEditMode(false);
                setEditingId(null);
                setSelectedMember(null);
                setAmount('');
                setReason('');
              }}>
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalForm}>
                                <div className={`${styles.formGroup} ${isEditMode ? styles.disabled : ''}`}>
                  <label>Select Member</label>
                  <SearchableSelect
                    disabled={isEditMode}
                    value={selectedMember?.id ?? ''}
                    onChange={(val) => {
                      const m = members.find(x => String(x.id) === String(val));
                      setSelectedMember(m || null);
                    }}
                    options={members.map(m => ({
                      value: m.id,
                      label: m.name,
                      meta: m.memberId || m.loginId || ''
                    }))}
                    placeholder="Select a member..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className={styles.inputControl} 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Reason</label>
                  <textarea 
                    className={`${styles.inputControl} ${styles.textArea}`} 
                    placeholder="Enter reason for holding amount..."
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  ></textarea>
                </div>
                
                <div className={styles.modalActionRow}>
                  <button className={styles.submitBtnLarge} onClick={handleSubmit}>
                    {isEditMode ? 'Update Hold Amount' : 'Submit Hold Amount'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {deleteModal.open && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal({ open: false, id: null })}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteIconBox}>
              <FaTrash />
            </div>
            <h3>Are you sure?</h3>
            <p>Do you really want to delete this record? This action cannot be undone.</p>
            <div className={styles.deleteActionBtns}>
              <button className={styles.cancelBtn} onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

            <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.pageTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Hold Amount List
          </h2>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <FaPlus /> Add Hold
          </button>
        </div>
        
                <div className={styles.topControls}>
          <div className={styles.rowsSelector}>
            <span>Show</span>
            <select 
              className={styles.selectInput}
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>rows</span>
          </div>

          <ExportButtons 
            headers={['S.No', 'Member Name', 'Member ID', 'Amount', 'Reason', 'Add Date']}
            rows={currentData.map((row, index) => [
              startIndex + index + 1, row.name, row.memberId, row.amount, row.reason, row.date
            ])}
            fileNamePrefix="hold_amount_report"
            sheetName="Hold Amounts"
          />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Member..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

                <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Member Detail</th>
                <th style={{ padding: '10px 16px' }}>
                  <div style={{ lineHeight: '1.2' }}>Amount</div>
                  <div style={{ 
                    fontSize: '0.6rem', 
                    fontWeight: 500, 
                    color: '#CBD5E0', 
                    textTransform: 'none', 
                    letterSpacing: '0.3px',
                    marginTop: '2px'
                  }}>
                    (Total: ₹{totalHoldAmount.toLocaleString()})
                  </div>
                </th>
                <th>Reason</th>
                <th>Add Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{startIndex + index + 1}</td>
                  <td className={styles.memberCell}>
                    <div className={styles.memberCell}>
                      <span className={styles.fwBold}>{row.name}</span>
                      <span className={styles.subText}>{row.memberId}</span>
                    </div>
                  </td>
                  <td className={styles.fwBold}>₹ {row.amount}</td>
                  <td>{row.reason}</td>
                  <td className={styles.subText}>{row.date}</td>
                  <td>
                    <div className={styles.actionIcons}>
                      <button className={styles.iconEdit} onClick={() => handleEdit(row)} title="Edit">
                        <FaEdit />
                      </button>
                      <button className={styles.iconDelete} onClick={() => confirmDelete(row.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
    
      <PopupModal show={popup.show} type={popup.type} title={popup.title} message={popup.message} onClose={closePopup} />
</div>
  );
};

export default HoldAmount;
