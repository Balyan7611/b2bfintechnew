import React, { useState, useEffect } from 'react';
import { 
  FaEdit, FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaTrash, FaPowerOff 
} from 'react-icons/fa';
import { FiDatabase, FiMoreVertical } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import styles from './CompanyBank.module.css';

const CompanyBank = () => {
  const [bankList, setBankList] = useState([]);
  const [bankMasterList, setBankMasterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('BANK');
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, row: null });
  const [confirmToggleRow, setConfirmToggleRow] = useState(null);

  const [formState, setFormState] = useState({
    id: 0,
    msrno: 1,
    bankid: 0,
    companyMemberId: 1,
    bankName: '',
    branchName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsccode: '',
    billinginfo: '',
    cashdepositecharge: 0,
    qrlogo: '',
    banklogo: '',
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [banksData, masterData] = await Promise.all([
        API.companyBankDetail.getAll().catch(() => []),
        API.bank.getAll().catch(() => [])
      ]);
      let parsedBanks = [];
      if (banksData) {
        if (Array.isArray(banksData)) parsedBanks = banksData;
        else if (Array.isArray(banksData.data)) parsedBanks = banksData.data;
        else if (banksData.data && Array.isArray(banksData.data.items)) parsedBanks = banksData.data.items;
        else if (Array.isArray(banksData.items)) parsedBanks = banksData.items;
      }
      setBankList(parsedBanks);

      let parsedMaster = [];
      if (masterData) {
        if (Array.isArray(masterData)) parsedMaster = masterData;
        else if (Array.isArray(masterData.data)) parsedMaster = masterData.data;
        else if (masterData.data && Array.isArray(masterData.data.items)) parsedMaster = masterData.data.items;
        else if (Array.isArray(masterData.items)) parsedMaster = masterData.items;
      }
      setBankMasterList(parsedMaster);
    } catch (error) {
      console.error('Failed to fetch company banks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow({ id: null, x: 0, y: 0, row: null });
      }
    };
    const handleScroll = (e) => {
      if (e.target.closest && e.target.closest('.action-dropdown-wrapper')) return;
      setActiveActionRow(prev => prev.row ? { id: null, x: 0, y: 0, row: null } : prev);
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
      msrno: 1,
      bankid: 0,
      companyMemberId: 1,
      bankName: '',
      branchName: '',
      accountHolderName: '',
      accountNumber: '',
      ifsccode: '',
      billinginfo: '',
      cashdepositecharge: 0,
      qrlogo: '',
      banklogo: '',
      isActive: true
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (bank) => {
    setFormState({
      id: bank.id,
      msrno: bank.msrno || 1,
      bankid: bank.bankid || 0,
      companyMemberId: bank.companyMemberId || 1,
      bankName: bank.bankName || '',
      branchName: bank.branchName || '',
      accountHolderName: bank.accountHolderName || '',
      accountNumber: bank.accountNumber || '',
      ifsccode: bank.ifsccode || '',
      billinginfo: bank.billinginfo || '',
      cashdepositecharge: bank.cashdepositecharge || 0,
      qrlogo: bank.qrlogo || '',
      banklogo: bank.banklogo || '',
      isActive: bank.isActive
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
        await API.companyBankDetail.update(formState);
      } else {
        await API.companyBankDetail.create(formState);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save company bank detail:', error);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId) {
      try {
        await API.companyBankDetail.delete(confirmDeleteId);
        setConfirmDeleteId(null);
        fetchData();
      } catch (error) {
        console.error('Failed to delete company bank detail:', error);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (confirmToggleRow) {
      try {
        const updated = { ...confirmToggleRow, isActive: !confirmToggleRow.isActive };
        await API.companyBankDetail.update(updated);
        setBankList(prev => prev.map(item => item.id === confirmToggleRow.id ? updated : item));
        setConfirmToggleRow(null);
      } catch (error) {
        console.error('Failed to toggle active status:', error);
      }
    }
  };

  // Filter Data
  const filteredData = bankList.filter(item => 
    (item.bankName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.accountNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.accountHolderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className={styles.container}>
      
      {/* ── MODAL POPUP ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <form className={styles.modalContainer} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className={styles.modalHeader}>
              <h2>{isEditing ? 'Edit Bank Details' : 'Add Company Bank Details'}</h2>
              <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>IFSC Code</label>
                  <input 
                    type="text" 
                    name="ifsccode"
                    className={styles.inputControl} 
                    placeholder="Enter IFSC" 
                    value={formState.ifsccode}
                    onChange={handleInputChange}
                    maxLength={11}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <select 
                    name="bankid"
                    className={styles.inputControl} 
                    value={formState.bankid}
                    onChange={(e) => {
                      const bid = parseInt(e.target.value);
                      const selected = bankMasterList.find(b => b.id === bid);
                      setFormState(prev => ({ 
                        ...prev, 
                        bankid: bid, 
                        bankName: selected ? selected.bankName || selected.name : '' 
                      }));
                    }}
                    required
                  >
                    <option value="">Select Bank Name</option>
                    {bankMasterList.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName || b.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Account Holder</label>
                  <input 
                    type="text" 
                    name="accountHolderName"
                    className={styles.inputControl} 
                    placeholder="Holder Name" 
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
                    placeholder="Account No" 
                    value={formState.accountNumber}
                    onChange={handleInputChange}
                    maxLength={18}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Billing Info</label>
                  <input 
                    type="text" 
                    name="billinginfo"
                    className={styles.inputControl} 
                    placeholder="Billing detail" 
                    value={formState.billinginfo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Cash Deposit Charge</label>
                  <input 
                    type="number" 
                    step="any"
                    name="cashdepositecharge"
                    className={styles.inputControl} 
                    placeholder="Charge amount" 
                    value={formState.cashdepositecharge}
                    onChange={handleInputChange}
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === '-') e.preventDefault();
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>MSR Serial No</label>
                    <input 
                      type="number" 
                      name="msrno"
                      className={styles.inputControl} 
                      value={formState.msrno}
                      onChange={handleInputChange}
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === '-') e.preventDefault();
                      }}
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Company Member ID</label>
                    <input 
                      type="number" 
                      name="companyMemberId"
                      className={styles.inputControl} 
                      value={formState.companyMemberId}
                      onChange={handleInputChange}
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === '-') e.preventDefault();
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className={styles.tabsWrapper}>
                <button 
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === 'BRANCH' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('BRANCH')}
                >
                  BRANCH
                </button>
                <button 
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === 'QR' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('QR')}
                >
                  QR LOGO
                </button>
                <button 
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === 'BANK' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('BANK')}
                >
                  BANK LOGO
                </button>
              </div>

              {/* Tab Content Area */}
              <div className={styles.tabContentArea}>
                {activeTab === 'BRANCH' && (
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
                )}
                
                {activeTab === 'QR' && (
                  <div className={styles.formGroup}>
                    <label>QR Logo URL / File Name</label>
                    <input 
                      type="text"
                      name="qrlogo"
                      className={styles.inputControl}
                      placeholder="QR Logo name or link"
                      value={formState.qrlogo}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {activeTab === 'BANK' && (
                  <div className={styles.formGroup}>
                    <label>Bank Logo URL / File Name</label>
                    <input 
                      type="text"
                      name="banklogo"
                      className={styles.inputControl}
                      placeholder="Bank Logo name or link"
                      value={formState.banklogo}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              {/* Action Row */}
              <div className={styles.actionRow}>
                <div className={styles.toggleContainer}>
                  <span className={styles.toggleLabel}>Active</span>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      name="isActive"
                      checked={formState.isActive} 
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <button type="submit" className={styles.submitBtn}>
                  {isEditing ? 'Update Details' : 'Submit Details'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.pageTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Bank Accounts List
          </h2>
          <button className={styles.addBtn} onClick={handleOpenAdd}>
            <FaPlus /> Add Bank
          </button>
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
            headers={['S.No', 'Status', 'Bank Name', 'Branch Name', 'Account Holder', 'Account Number', 'IFSC Code', 'Billing Info', 'Charge']}
            rows={currentData.map((row, index) => [
              startIndex + index + 1, row.isActive ? 'Active' : 'Inactive', row.bankName, row.branchName, row.accountHolderName, row.accountNumber, row.ifsccode, row.billinginfo, row.cashdepositecharge
            ])}
            fileNamePrefix="company_bank_report"
            sheetName="Company Banks"
          />

          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Bank or Account..." 
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
                <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
                <th>Bank Name</th>
                <th>Branch Name</th>
                <th>Account Holder</th>
                <th>Account Number</th>
                <th>IFSC Code</th>
                <th>Billing Info</th>
                <th>Charge</th>
                <th>QR</th>
                <th>Logo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontWeight: 600 }}>Loading company banks...</td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((row, index) => (
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
                              let dropY = rect.top;
                              if (dropX + 170 > window.innerWidth) dropX = rect.left - 175;
                              setActiveActionRow({ id: row.id, x: dropX, y: dropY, row: row });
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
                    <td className={styles.fwBold}>{row.bankName}</td>
                    <td>{row.branchName}</td>
                    <td>{row.accountHolderName}</td>
                    <td className={styles.fwBold}>{row.accountNumber}</td>
                    <td>{row.ifsccode}</td>
                    <td>{row.billinginfo}</td>
                    <td>{row.cashdepositecharge}</td>
                    <td>
                      {row.qrlogo ? (
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{row.qrlogo}</span>
                      ) : (
                        <span className={styles.placeholderImg}>QR</span>
                      )}
                    </td>
                    <td>
                      {row.banklogo ? (
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{row.banklogo}</span>
                      ) : (
                        <span className={styles.placeholderImg}>Logo</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
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
      {activeActionRow.row && (
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

      {/* ── STATUS CHANGE MODAL ── */}
      {confirmToggleRow && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 27, 62, 0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConfirmToggleRow(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: confirmToggleRow.isActive ? '#FFF5F5' : '#F0FDF4', color: confirmToggleRow.isActive ? '#E53E3E' : '#27AE60', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaPowerOff />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0D1B3E', margin: '0 0 8px 0' }}>Confirm Status Change</h3>
            <p style={{ fontSize: '0.85rem', color: '#4E6080', margin: '0 0 24px 0', lineHeight: '1.4' }}>Are you sure you want to change the status to <strong>{confirmToggleRow.isActive ? 'Inactive' : 'Active'}</strong> for {confirmToggleRow.bankName || 'this bank'}?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmToggleRow(null)} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleToggleStatus} style={{ flex: 1, padding: '10px', background: confirmToggleRow.isActive ? '#E53E3E' : '#27AE60', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Yes, Change it</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 27, 62, 0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConfirmDeleteId(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FFF5F5', color: '#E53E3E', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaTrash />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0D1B3E', margin: '0 0 8px 0' }}>Are you sure?</h3>
            <p style={{ fontSize: '0.85rem', color: '#4E6080', margin: '0 0 24px 0', lineHeight: '1.4' }}>Do you really want to delete this company bank record? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#E53E3E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyBank;
