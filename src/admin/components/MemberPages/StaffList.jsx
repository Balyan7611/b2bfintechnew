import React, { useState } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaPlus, FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaTimes, FaChevronLeft, FaChevronRight, FaCheck, FaCircle, FaUserPlus, FaUsers,
  FaUser, FaEnvelope, FaMobileAlt, FaUserTag, FaLock, FaMapMarkerAlt, FaCalendar, FaPowerOff
} from 'react-icons/fa';
import {
  HiOutlinePencilAlt, HiOutlineTrash, HiOutlineSearch, HiOutlineDocumentDownload, HiOutlinePrinter,
  HiOutlinePlus, HiOutlineX, HiOutlineCheckCircle, HiOutlineUserGroup
} from 'react-icons/hi';
import {
  toggleDrawer, setEditingStaff, updateStaffForm, toggleStaffStatus, deleteStaff,
  addStaff, updateStaff, resetStaffForm
} from '../../../store/slices/memberSlice';
import styles from './MemberPages.module.css';

const StaffList = () => {
  const dispatch = useDispatch();
  const { staffList = [], isDrawerOpen = false, editingStaff = null, staffForm = {} } = useSelector((s) => s.member || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, staff: null });

  const filteredStaff = staffList.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.memberId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!staffForm.name || !staffForm.mobile) {
      alert('Please fill at least Name and Mobile');
      return;
    }
    
    if (editingStaff) {
      dispatch(updateStaff({ ...staffForm }));
    } else {
      dispatch(addStaff({
        ...staffForm,
        memberId: staffForm.loginId || 'EMP' + Math.floor(1000 + Math.random() * 9000),
        doj: staffForm.doj || new Date().toLocaleDateString('en-GB')
      }));
    }
    dispatch(toggleDrawer(false));
    dispatch(resetStaffForm());
  };

  const triggerDelete = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      dispatch(deleteStaff(staffToDelete.id));
    }
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const confirmStatusToggle = () => {
    if (statusModal.staff) {
      dispatch(toggleStaffStatus(statusModal.staff.id));
    }
    setStatusModal({ open: false, staff: null });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader} style={{ padding: '8px 24px', borderBottom: '1px solid #EEF3FC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div>
              <h2 className={styles.cardTitle} style={{ margin: 0, fontSize: '1.2rem' }}>Staff List</h2>
            </div>
          </div>
          <button className={styles.saveBtn} onClick={() => {
            dispatch(resetStaffForm());
            dispatch(toggleDrawer(true));
          }} style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px', boxShadow: 'none' }}>
            <HiOutlinePlus style={{ fontSize: '1.1rem' }} /> Add Staff
          </button>
        </div>

        {/* Export & Search Controls */}
        <div className={styles.directoryHeader} style={{ marginBottom: '24px', background: '#F8FAFF', padding: '16px', borderRadius: '14px', border: '1px solid #EEF3FC' }}>
          <div className={styles.rowsSelector}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.inputControl} style={{ width: '80px', padding: '6px 10px', paddingLeft: '10px' }}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="stafflist_report" sheetName="Report" />

          <div className={styles.tableSearch} style={{ background: '#fff' }}>
            <HiOutlineSearch style={{ color: '#1756AA', fontSize: '1.2rem' }} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Modern Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.No</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '120px' }}>Actions</th>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Contact Details</th>
                <th>Joining Date</th>
                <th>System Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? filteredStaff.map((staff, index) => (
                <tr key={staff.id}>
                  <td style={{ color: '#718096', fontWeight: 600 }}>{String(index + 1).padStart(2, '0')}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${staff.active ? styles.bgActive : styles.bgInactive}`}
                      onClick={() => setStatusModal({ open: true, staff: staff })}
                      style={{ cursor: 'pointer' }}
                    >
                      <FaCircle style={{ fontSize: '7px' }} />
                      {staff.active ? 'Active' : 'InActive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={styles.editBtn} title="Edit Staff" onClick={() => dispatch(setEditingStaff(staff))}><HiOutlinePencilAlt /></button>
                      <button className={styles.deleteBtn} title="Delete Staff" onClick={() => triggerDelete(staff)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                  <td className={styles.fwBold} style={{ color: '#1756AA' }}>{staff.memberId}</td>
                  <td className={styles.fwBold}>{staff.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#0D1B3E', fontWeight: 600 }}>{staff.mobile}</span>
                      <span style={{ fontSize: '0.75rem', color: '#718096' }}>{staff.email}</span></div></td>
                  <td style={{ fontSize: '0.85rem', color: '#4E6080' }}>{staff.doj || 'N/A'}</td>
                  <td>
                    <span className={styles.directoryBadge} style={{ padding: '4px 12px', fontSize: '0.7rem' }}>
                      {staff.role || 'Staff'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineUserGroup style={{ fontSize: '2rem', color: '#E2E8F0' }} />
                      </div>
                      <p style={{ color: '#A0AEC0', margin: 0, fontWeight: 500 }}>No employee records found in directory</p></div></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination */}
        <div className={styles.directoryHeader} style={{ marginTop: '24px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
          <span className={styles.directorySubtitle}>Showing 1 to {filteredStaff.length} of {staffList.length} staff members</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={styles.pageBtn}><FaChevronLeft /></button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`}>1</button>
            <button className={styles.pageBtn}><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── STATUS CHANGE MODAL ── */}
      {statusModal.open && (
        <div className={styles.modalOverlay} onClick={() => setStatusModal({ open: false, staff: null })}>
          <div className={styles.modalContainer} style={{ maxWidth: '380px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: statusModal.staff.active ? '#FFF5F5' : '#F0FDF4', color: statusModal.staff.active ? '#E53E3E' : '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <FaPowerOff />
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: '#1E293B' }}>Confirm Status</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#64748B' }}>Are you sure you want to change the status to <strong style={{ color: '#1E293B' }}>{statusModal.staff.active ? 'InActive' : 'Active'}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className={styles.cancelFormBtn} onClick={() => setStatusModal({ open: false, staff: null })} style={{ background: '#EDF2F7', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', color: '#4E6080', fontWeight: 600 }}>Cancel</button>
              <button className={styles.saveBtn} style={{ background: statusModal.staff.active ? '#E53E3E' : '#27AE60', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }} onClick={confirmStatusToggle}>Yes, Change</button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Slide Drawer */}
      {isDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => dispatch(toggleDrawer(false))}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
            <div className={styles.drawerHeader} style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #fff 100%)', padding: '16px 24px', borderBottom: '1px solid #EEF3FC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={styles.directoryIconBox} style={{ width: '40px', height: '40px', background: editingStaff ? 'rgba(23, 86, 170, 0.1)' : 'rgba(39, 174, 96, 0.1)', color: editingStaff ? '#1756AA' : '#27AE60', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingStaff ? <HiOutlinePencilAlt size={20} /> : <HiOutlinePlus size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>
                    {editingStaff ? 'Update Staff Member' : 'Add New Employee'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#718096', fontWeight: 500 }}>
                    Configure system access and profile details
                  </p>
                </div>
              </div>
              <button
                className={styles.drawerCloseBtn}
                onClick={() => dispatch(toggleDrawer(false))}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#4E6080' }}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.drawerBody} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Legal Full Name</label>
                  <input
                    type="text"
                    autoComplete="off"
                    style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="e.g. John Doe"
                    value={staffForm.name || ''}
                    onChange={(e) => dispatch(updateStaffForm({ name: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Professional Email</label>
                    <input
                      type="email"
                      autoComplete="off"
                      style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="user@gmail.com"
                      value={staffForm.email || ''}
                      onChange={(e) => dispatch(updateStaffForm({ email: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Mobile Number</label>
                    <input
                      type="text"
                      autoComplete="off"
                      style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="+91"
                      value={staffForm.mobile || ''}
                      onChange={(e) => dispatch(updateStaffForm({ mobile: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Date of Birth</label>
                    <input
                      type="date"
                      style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', boxSizing: 'border-box' }}
                      value={staffForm.dob || ''}
                      onChange={(e) => dispatch(updateStaffForm({ dob: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>System Role</label>
                    <select
                      style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', boxSizing: 'border-box' }}
                      value={staffForm.role || ''}
                      onChange={(e) => dispatch(updateStaffForm({ role: e.target.value }))}
                    >
                      <option value="">Choose a Role</option>
                      <option value="Admin">Super Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Operations Staff</option>
                      <option value="Sales">Sales Executive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Portal Access PIN</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    style={{ width: '100%', height: '42px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '0 15px', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.2em' }}
                    placeholder="••••"
                    value={staffForm.loginPin || ''}
                    onChange={(e) => dispatch(updateStaffForm({ loginPin: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px', display: 'block' }}>Residential Address</label>
                  <textarea
                    style={{ width: '100%', minHeight: '80px', border: '1.5px solid #E2E8F0', background: '#F8FAFF', borderRadius: '10px', padding: '10px 15px', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }}
                    placeholder="Enter complete residential address details..."
                    value={staffForm.address || ''}
                    onChange={(e) => dispatch(updateStaffForm({ address: e.target.value }))}
                  ></textarea>
                </div>

                <div style={{ marginTop: '8px', padding: '12px 16px', background: 'rgba(23,86,170,0.03)', borderRadius: '10px', border: '1px solid #EEF3FC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0D1B3E', fontSize: '0.85rem' }}>Account Access</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (staffForm.active ?? true) ? '#27AE60' : '#E74C3C' }}>
                      {(staffForm.active ?? true) ? 'GRANTED' : 'RESTRICTED'}
                    </span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={staffForm.active ?? true}
                        onChange={(e) => dispatch(updateStaffForm({ active: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#F8FAFF', padding: '16px 24px', borderTop: '1px solid #EEF3FC' }}>
              <button
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#fff', color: '#4E6080', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => dispatch(toggleDrawer(false))}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                style={{ padding: '10px 24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(23, 86, 170, 0.2)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleSave}
              >
                <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> {editingStaff ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.deleteModal} style={{ background: '#fff', borderRadius: '20px', padding: '24px', textAlign: 'center', maxWidth: '320px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%', background: '#FDECEA', color: '#E74C3C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 16px'
            }}>
              <HiOutlineTrash />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#0D1B3E', margin: '0 0 8px 0', fontWeight: 800 }}>Delete Staff?</h3>
            <div style={{ padding: '0 10px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 6px 0', color: '#4E6080', fontSize: '0.85rem' }}>
                Remove <strong>{staffToDelete?.name}</strong>?
              </p>
              <div style={{ color: '#E74C3C', fontSize: '0.75rem', fontWeight: 600 }}>This action cannot be undone.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '10px', color: '#4E6080', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}
                onClick={cancelDelete}
                onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                Cancel
              </button>
              <button
                style={{ flex: 1, padding: '10px', background: '#E74C3C', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(231,76,60,0.2)', transition: 'all 0.2s', fontSize: '0.85rem' }}
                onClick={confirmDelete}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
