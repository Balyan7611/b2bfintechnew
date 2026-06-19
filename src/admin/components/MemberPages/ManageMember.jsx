import React, { useState, useEffect } from 'react';
import { FiDatabase, FiList, FiX, FiSearch, FiCheck } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import RoleSelect from '../../../shared/components/common/RoleSelect';
import MemberSearchSelect from '../../../shared/components/common/MemberSearchSelect';
import { API } from '../../../api/endpoints';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaEllipsisV, FaCog, FaEdit, FaEye, 
  FaUserLock, FaTrash, FaCheck, FaExclamationCircle, FaFilter,
  FaCalendarAlt, FaUserTag, FaIdCard, FaMobileAlt, FaHandHoldingUsd, FaArrowRight,
  FaUsersCog, FaUserFriends, FaEnvelope, FaSms, FaVideo, FaTimes, FaUserPlus,
  FaCheckCircle, FaExclamationTriangle, FaShieldAlt
} from 'react-icons/fa';
import { updateMemberDirect, deleteMember } from '../../../store/slices/memberSlice';
import { MemberService } from '../../../services/member.service';
import styles from './MemberPages.module.css';
import MemberControlPage from './MemberControlPage';
import MemberRegistration from './MemberRegistration';

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    style={{
      width: '32px', height: '18px', background: checked ? '#27AE60' : '#CBD5E0',
      borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'
    }}
  >
    <div style={{
      width: '14px', height: '14px', background: '#fff', borderRadius: '50%',
      position: 'absolute', top: '2px', left: checked ? '16px' : '2px', transition: '0.3s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }} />
  </div>
);

const MaskedInfo = ({ value, type }) => {
  const [isMasked, setIsMasked] = React.useState(true);

  if (!value || value === 'N/A' || value === '—') return <span>—</span>;

  const handleDoubleClick = () => {
    setIsMasked(!isMasked);
  };

  const getMaskedValue = () => {
    const clean = value.replace(/[\s-]/g, '');
    if (type === 'aadhar') {
      if (clean.length >= 12) {
        return `•••• •••• ${clean.slice(-4)}`;
      }
      return '•••• •••• ' + clean.slice(-Math.min(4, clean.length));
    } else if (type === 'pan') {
      if (clean.length >= 10) {
        return `••••••${clean.slice(-4)}`;
      }
      return '••••••' + clean.slice(-Math.min(4, clean.length));
    }
    return value;
  };

  return (
    <span 
      onDoubleClick={handleDoubleClick} 
      title="Double tap to reveal / mask"
      style={{ 
        cursor: 'pointer', 
        fontFamily: 'monospace', 
        letterSpacing: '1px',
        userSelect: 'none',
        background: isMasked ? '#F8FAFC' : 'transparent',
        padding: isMasked ? '2px 6px' : '0',
        borderRadius: '4px',
        border: isMasked ? '1px dashed #cbd5e1' : 'none'
      }}
    >
      {isMasked ? getMaskedValue() : value}
    </span>
  );
};

const ManageMember = () => {
  const dispatch = useDispatch();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [holdInputs, setHoldInputs] = useState({});
  const [confirmHold, setConfirmHold] = useState(null);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ── MEMBER SERVICES STATE & HELPERS ──────────────────────────────────────
  const [allServices, setAllServices] = useState([]);
  const [memberServices, setMemberServices] = useState({}); // format: { [memberId]: [serviceId1, serviceId2, ...] }
  const [openServicesMember, setOpenServicesMember] = useState(null);
  const [isAssigningServices, setIsAssigningServices] = useState(false);
  const [servicesSuccess, setServicesSuccess] = useState('');
  
  // Assign modal state (exact same as Role page)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [assignMember, setAssignMember] = useState(null);

  // Fetch all services from master API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        if (res && res.status === true && Array.isArray(res.data)) {
          setAllServices(res.data);
        }
      } catch (err) {
        console.error("Error loading services in ManageMember:", err);
      }
    };
    fetchServices();
  }, []);

  const handleOpenServices = (m) => {
    setOpenServicesMember(m);
    if (!memberServices[m.id] && allServices.length > 0) {
      // Simulate some initial services checked (e.g. index % 3 === 0)
      const initial = allServices
        .filter((_, idx) => idx % 3 === 0)
        .map(s => s.id);
      setMemberServices(prev => ({ ...prev, [m.id]: initial }));
    }
  };

  const getAssignedServices = (member) => {
    if (!member || !memberServices[member.id] || allServices.length === 0) return [];
    return memberServices[member.id].map(id => {
      const s = allServices.find(service => service.id.toString() === id.toString());
      return s ? { id: s.id, name: s.name } : null;
    }).filter(Boolean);
  };

  const removeServiceFromMember = (member, serviceIdToRemove) => {
    setMemberServices(prev => {
      const current = prev[member.id] || [];
      const updated = current.filter(id => id.toString() !== serviceIdToRemove.toString());
      return { ...prev, [member.id]: updated };
    });
  };

  const openAssignModal = (member) => {
    setAssignMember(member);
    const currentlyAssigned = memberServices[member.id] || [];
    setSelectedServices(currentlyAssigned);
    setServiceSearch('');
    setIsAssignModalOpen(true);
    setOpenServicesMember(null); // close popover
  };

  const toggleServiceSelection = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  const handleSelectAllServices = () => {
    setSelectedServices(allServices.map(s => s.id));
  };

  const handleDeselectAllServices = () => {
    setSelectedServices([]);
  };

  const handleSaveAssignedServices = (e) => {
    if (e) e.preventDefault();
    if (assignMember) {
      setIsAssigningServices(true);
      setServicesSuccess('');
      setTimeout(() => {
        setMemberServices(prev => ({ ...prev, [assignMember.id]: selectedServices }));
        setIsAssigningServices(false);
        setIsAssignModalOpen(false);
        setActiveDropdown(null);
      }, 1000);
    }
  };

  // ── TABLE & FILTER STATE (API-driven) ───────────────────────────────────
  const [members, setMembers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterRoleId, setFilterRoleId] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberType, setMemberType] = useState('All'); // 'Active', 'DeActive', 'All'
  const [kycStatus, setKycStatus] = useState('All');   // 'KYC', 'Non-KYC', 'All'
  
  // ── PAGINATION ──
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPageNumber, setTotalPageNumber] = useState(1);

  // ── FETCH METHOD ──
  const fetchMembers = async (pg = pageNumber, ps = rowsPerPage, search = searchQuery, roleId = filterRoleId, mType = memberType, kStatus = kycStatus, fDate = fromDate, tDate = toDate) => {
    setIsFetching(true);
    try {
      let isActive = null;
      if (mType === 'Active') isActive = true;
      if (mType === 'DeActive') isActive = false;

      let isKycApproved = null;
      if (kStatus === 'KYC') isKycApproved = true;
      if (kStatus === 'Non-KYC') isKycApproved = false;

      const res = await MemberService.getAll({ 
        pageNumber: pg, 
        pageSize: ps, 
        search, 
        roleId, 
        isActive, 
        isKycApproved, 
        fromDate: fDate, 
        toDate: tDate 
      });
      if (res && res.status === true && res.data) {
        const d = res.data;
        setMembers(Array.isArray(d.items) ? d.items : []);
        setTotalItems(d.totalItems || 0);
        setPageNumber(d.pageNumber || pg);
        setTotalPageNumber(d.totalPageNumber || d.TotalPageNumber || Math.ceil((d.totalItems || 0) / ps) || 1);
      } else {
        setMembers([]);
        setTotalItems(0);
        setTotalPageNumber(1);
      }
    } catch (err) {
      console.error('Error fetching members in ManageMember:', err);
      setMembers([]);
    } finally {
      setIsFetching(false);
    }
  };

  // ── AUTO-TRIGGER FETCH ON FILTER CHANGE ──
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(1, rowsPerPage, searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate, rowsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPageNumber) return;
    setPageNumber(newPage);
    fetchMembers(newPage, rowsPerPage, searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate);
  };

  const handleDropdownToggle = (e, mId) => {
    if (activeDropdown === mId) {
      setActiveDropdown(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const left = Math.min(rect.right + 12, window.innerWidth - 280);
      
      const cardHeight = 360;
      const top = (rect.bottom + cardHeight > window.innerHeight)
        ? Math.max(10, rect.top - cardHeight + 20)
        : (rect.top - 10);

      setDropdownPos({ top, left });
      setActiveDropdown(mId);
    }
  };

  const handleSearchClick = () => {
    setIsSearching(true);
    fetchMembers(1, rowsPerPage, searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate).then(() => {
      setPageNumber(1);
      setIsSearching(false);
    });
  };

  const handleToggle = (field, m) => {
    dispatch(updateMemberDirect({ id: m.id, updates: { [field]: !m[field] } }));
    // Optimistic / local state toggle update
    setMembers(prev => prev.map(item => item.id === m.id ? { ...item, [field]: !item[field] } : item));
  };

  const handleActionClick = (action, m) => {
    setActiveDropdown(null);
    if (action === 'Edit') {
      setEditMember({ ...m, initialEdit: true });
    } else {
      setPendingAction({ action, member: m });
    }
  };

  const getPaginationPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, pageNumber - delta);
    const right = Math.min(totalPageNumber - 1, pageNumber + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPageNumber - 1) pages.push('...');
    if (totalPageNumber > 1) pages.push(totalPageNumber);
    return pages;
  };

  if (editMember) {
    return (
      <MemberControlPage 
        activeMemberData={editMember} 
        initialEdit={editMember.initialEdit}
        backLabel=""
        onClose={() => {
          setEditMember(null);
          fetchMembers(pageNumber, rowsPerPage, searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate);
        }} 
      />
    );
  }

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      
      {/* ── DROPDOWN OVERLAY ── */}
      {(activeDropdown || openServicesMember) && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
          onClick={() => { setActiveDropdown(null); setOpenServicesMember(null); }}
        />
      )}

      {/* ── ENHANCED FILTER CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', padding: '6px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUserFriends style={{ color: '#1756AA' }} /> Member Directory
            </h2>
            <p className={styles.directorySubtitle} style={{ fontSize: '0.65rem', margin: '0' }}>Manage and monitor network members</p>
          </div>
          <button 
            onClick={() => setShowRegistrationModal(true)}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #1756AA, #124d96)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(23, 86, 170, 0.15)',
              transition: 'all 0.2s'
            }}
          >
            <FaUserPlus /> New Registration
          </button>
        </div>
        
        <div className={styles.formGrid4} style={{ marginTop: '20px', overflow: 'visible' }}>
          {/* MOBILE DATE ROW */}
          <div style={{ display: 'flex', gap: '12px', gridColumn: 'span 2' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem' }}>From Date</label>
              <div className={styles.inputWrap}>
                <input type="date" name="fromDate" className={styles.inputControl} style={{ paddingLeft: '12px', fontSize: '0.85rem', height: '38px', boxSizing: 'border-box' }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label} style={{ fontSize: '0.75rem' }}>To Date</label>
              <div className={styles.inputWrap}>
                <input type="date" name="toDate" className={styles.inputControl} style={{ paddingLeft: '12px', fontSize: '0.85rem', height: '38px', boxSizing: 'border-box' }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={styles.formGroup} style={{ position: 'relative' }}>
            <label className={styles.label} style={{ fontSize: '0.75rem' }}>Role</label>
            <RoleSelect 
              value={filterRoleId} 
              onChange={setFilterRoleId} 
              placeholder="Select Role" 
              style={{ height: '38px', fontSize: '0.85rem' }} 
            />
          </div>
          
          <div className={styles.formGroup} style={{ position: 'relative', zIndex: 99 }}>
            <label className={styles.label} style={{ fontSize: '0.75rem' }}>Search Member</label>
            <MemberSearchSelect 
              value={searchQuery} 
              onChange={(m) => setSearchQuery(m ? (m.memberId || m.loginId || m.id) : '')} 
              placeholder="Search Member..." 
              style={{ height: '38px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div className={styles.formGrid3} style={{ marginTop: '24px', alignItems: 'flex-end' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Member Type</label>
            <div className={styles.pillRow}>
              {['Active', 'DeActive', 'All'].map(t => (
                <button 
                  key={t}
                  className={`${styles.pillTab} ${memberType === t ? styles.pillTabActive : ''}`}
                  onClick={() => setMemberType(t)}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>KYC Status</label>
            <div className={styles.pillRow}>
              {['KYC', 'Non-KYC', 'All'].map(k => (
                <button 
                  key={k}
                  className={`${styles.pillTab} ${kycStatus === k ? styles.pillTabActive : ''}`}
                  onClick={() => setKycStatus(k)}
                >{k}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={styles.searchBtnRed} style={{ background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.25)' }} onClick={handleSearchClick} disabled={isSearching || isFetching}>
              {isSearching ? <div className={styles.spinner}></div> : <FaSearch />} 
              {isSearching ? 'Searching...' : 'Search Member'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select 
              className={styles.selectEntries} 
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons 
            headers={['S.No', 'Member ID', 'Name', 'Role', 'Package', 'Mobile', 'Email', 'Shop Name', 'City', 'Date Joined']} 
            rows={members.map((m, idx) => [
              (pageNumber - 1) * rowsPerPage + idx + 1,
              m.loginId || m.id || '',
              m.name || '',
              m.roleName || '',
              m.packageName || '',
              m.mobile || '',
              m.email || '',
              m.shopName || '',
              m.postOffice || m.city || '',
              m.createdDate ? new Date(m.createdDate).toLocaleDateString('en-GB') : ''
            ])} 
            fileNamePrefix="managemember_report" 
            sheetName="Report" 
          />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px' }}>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1800px', width: '100%', marginBottom: 0 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ color: '#fff' }}>S.No</th>
                <th style={{ color: '#fff' }}>Action</th>
                <th style={{ color: '#fff' }}>Member Name</th>
                <th style={{ color: '#fff' }}>City / District</th>
                <th style={{ color: '#fff' }}>Role & Package</th>
                <th style={{ color: '#fff' }}>Mobile</th>
                <th style={{ color: '#fff' }}>Main Balance</th>
                <th style={{ color: '#fff' }}>AEPS Balance</th>
                <th style={{ color: '#fff' }}>Hold Amount</th>
                <th style={{ color: '#fff' }}>AEPS Status</th>
                <th style={{ color: '#fff' }}>Email</th>
                <th style={{ color: '#fff' }}>Alt Mobile</th>
                <th style={{ color: '#fff' }}>Shop Name</th>
                <th style={{ color: '#fff' }}>Aadhar</th>
                <th style={{ color: '#fff' }}>PAN</th>
                <th style={{ color: '#fff' }}>DOB</th>
                <th style={{ color: '#fff' }}>DOJ</th>
                <th style={{ color: '#fff' }}>Joined By</th>
                <th style={{ color: '#fff' }}>Password</th>
                <th style={{ color: '#fff' }}>LoginPin</th>
                <th style={{ color: '#fff' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan="21" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTop: '3px solid #1756AA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading members...</span></div></td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="21" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '0.9rem' }}>
                    No data available in table
                  </td>
                </tr>
              ) : (
                members.map((m, i) => (
                  <tr key={m.id}>
                    <td>{(pageNumber - 1) * rowsPerPage + i + 1}</td>
                    <td style={{ position: 'relative', zIndex: activeDropdown === m.id ? 1001 : 1 }}>
                      <div style={{ position: 'relative' }}>
                        <button 
                          className={styles.actionBtnGreen}
                          onClick={(e) => handleDropdownToggle(e, m.id)}
                        >
                          Action <FaEllipsisV />
                        </button>
                        {activeDropdown === m.id && (
                          <div 
                            className={styles.actionMenu} 
                            style={{ 
                              top: dropdownPos.top, 
                              left: dropdownPos.left,
                              width: '260px',
                              background: '#fff',
                              borderRadius: '16px',
                              boxShadow: '0 20px 40px rgba(13, 27, 62, 0.25)',
                              border: '1px solid #EEF3FC',
                              padding: '0px',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Header */}
                            <div style={{ padding: '12px 16px', borderBottom: '1.5px solid #F1F5F9', fontSize: '0.8rem', fontWeight: 800, color: '#0D1B3E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaCog style={{ color: '#1756AA' }} /> MEMBER CONTROLS
                            </div>

                            {/* Toggles */}
                            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaVideo style={{ color: '#1756AA', fontSize: '1rem' }} /> Video KYC</div>
                              <ToggleSwitch checked={m.videoKyc} onChange={() => setPendingToggle({ field: 'videoKyc', member: m, nextValue: !m.videoKyc })} />
                            </div>

                            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaUserLock style={{ color: '#EAA21F', fontSize: '1rem' }} /> Acct Active</div>
                              <ToggleSwitch checked={m.isActive !== false} onChange={() => setPendingToggle({ field: 'isActive', member: m, nextValue: m.isActive === false })} />
                            </div>

                            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaHandHoldingUsd style={{ color: '#E53E3E', fontSize: '1rem' }} /> Hold Acct</div>
                              <ToggleSwitch checked={m.isHold} onChange={() => setPendingToggle({ field: 'isHold', member: m, nextValue: !m.isHold })} />
                            </div>

                            {/* Service Assignment Trigger */}
                            <button 
                              onClick={() => handleOpenServices(m)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: openServicesMember?.id === m.id ? '#EDF4FF' : 'transparent',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: openServicesMember?.id === m.id ? '#1756AA' : '#4E6080',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderBottom: '1px solid #F1F5F9',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => { 
                                if (openServicesMember?.id !== m.id) {
                                  e.currentTarget.style.background = 'rgba(23, 86, 170, 0.05)'; 
                                  e.currentTarget.style.color = '#1756AA'; 
                                }
                              }}
                              onMouseLeave={(e) => { 
                                if (openServicesMember?.id !== m.id) {
                                  e.currentTarget.style.background = 'transparent'; 
                                  e.currentTarget.style.color = '#4E6080'; 
                                }
                              }}
                            >
                              <FaUsersCog style={{ color: '#EAA21F', fontSize: '1rem' }} />
                              <span>Assign Services</span>
                            </button>

                            {/* Action Buttons */}
                            <button 
                              onClick={() => handleActionClick('Send Email', m)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#4E6080',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderBottom: '1px solid #F1F5F9',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(23, 86, 170, 0.05)'; e.currentTarget.style.color = '#1756AA'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4E6080'; }}
                            >
                              <FaEnvelope style={{ color: '#27AE60', fontSize: '1rem' }} />
                              <span>Send Gmail</span>
                            </button>

                            <button 
                              onClick={() => handleActionClick('Send SMS', m)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#4E6080',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderBottom: '1px solid #F1F5F9',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(23, 86, 170, 0.05)'; e.currentTarget.style.color = '#1756AA'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4E6080'; }}
                            >
                              <FaSms style={{ color: '#3182CE', fontSize: '1rem' }} />
                              <span>Send SMS</span>
                            </button>

                            <button 
                              onClick={() => handleActionClick('Edit', m)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#4E6080',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderBottom: '1px solid #F1F5F9',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(23, 86, 170, 0.05)'; e.currentTarget.style.color = '#1756AA'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4E6080'; }}
                            >
                              <FaEdit style={{ color: '#1756AA', fontSize: '1rem' }} />
                              <span>Edit Details</span>
                            </button>

                            <button 
                              onClick={() => handleActionClick('Re-KYC', m)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#4E6080',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(23, 86, 170, 0.05)'; e.currentTarget.style.color = '#1756AA'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4E6080'; }}
                            >
                              <FaIdCard style={{ color: '#718096', fontSize: '1rem' }} />
                              <span>Re-KYC</span>
                            </button>

                          </div>
                        )}


                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={styles.fwBold}>{m.name}</span>
                        <span style={{ fontSize: '0.68rem', color: '#718096', fontWeight: 700 }}>ID: {m.loginId || m.id}</span></div></td>
                    <td>{m.city || m.postOffice || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={styles.roleTag} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{m.roleName}</span>
                        <span style={{ fontSize: '0.68rem', color: '#718096', fontWeight: 700 }}>{m.packageName}</span></div></td>
                    <td>{m.mobile}</td>
                    <td className={styles.fwBold} style={{ color: '#27AE60' }}>₹ {m.balance || m.mainBal || 0}</td>
                    <td className={styles.fwBold} style={{ color: '#1756AA' }}>₹ {m.aepsBalance || m.aepsBal || 0}</td>
                    <td>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        background: '#fff',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        width: '140px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1756AA'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                      >
                        <span style={{ paddingLeft: '8px', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>₹</span>
                        <input 
                          type="number" 
                          style={{ 
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            padding: '6px 4px', 
                            fontSize: '0.82rem',
                            color: '#0D1B3E',
                            fontWeight: '600',
                            background: 'transparent'
                          }} 
                          value={holdInputs[m.id] !== undefined ? holdInputs[m.id] : (m.holdAmt || m.holdAmount || 0)} 
                          onChange={(e) => setHoldInputs({ ...holdInputs, [m.id]: e.target.value })} 
                        />
                        <button 
                          onClick={() => setConfirmHold({ member: m, amount: holdInputs[m.id] !== undefined ? holdInputs[m.id] : (m.holdAmt || m.holdAmount || 0) })}
                          style={{ 
                            background: Number(m.holdAmt || m.holdAmount || 0) > 0 ? '#C53030' : '#1756AA', 
                            color: '#fff',
                            border: 'none',
                            outline: 'none',
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: (holdInputs[m.id] !== undefined ? holdInputs[m.id] : (m.holdAmt || m.holdAmount || 0)) === '' ? 0.5 : 1
                          }}
                          disabled={(holdInputs[m.id] !== undefined ? holdInputs[m.id] : (m.holdAmt || m.holdAmount || 0)) === ''}
                        >
                          {Number(m.holdAmt || m.holdAmount || 0) > 0 ? 'Update' : 'Hold'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${m.aepsStatus === 'Registered' ? styles.badge_green : styles.badge_red}`}>
                        {m.aepsStatus === 'Registered' ? <FaCheck /> : <FaExclamationCircle />} {m.aepsStatus || 'Registered'}
                      </span>
                    </td>
                    <td>{m.email}</td>
                    <td>{m.alterNativeMobileNumber || m.whatsapp || 'N/A'}</td>
                    <td>{m.shopName || m.shop || 'N/A'}</td>
                    <td><MaskedInfo value={m.aadhar} type="aadhar" /></td>
                    <td><MaskedInfo value={m.pan} type="pan" /></td>
                    <td>{m.dob || 'N/A'}</td>
                    <td>{m.createdDate ? new Date(m.createdDate).toLocaleDateString('en-GB') : (m.doj || 'N/A')}</td>
                    <td>{m.joinedBy || 'N/A'}</td>
                    <td style={{ color: '#A0AEC0', fontStyle: 'italic', fontSize: '0.75rem' }}>{m.password || '****'}</td>
                    <td className={styles.fwBold}>{m.pin || 'N/A'}</td>
                    <td><span className={styles.badge} style={{ background: '#F1F5F9', color: '#4E6080' }}>{m.source || 'Web'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {totalItems === 0 ? 0 : (pageNumber - 1) * rowsPerPage + 1} to{' '}
            {Math.min(pageNumber * rowsPerPage, totalItems)} of {totalItems} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1 || isFetching}
            >
              <FaChevronLeft />
            </button>
            
            {getPaginationPages().map((p, idx) => 
              p === '...' ? (
                <span key={`ell-${idx}`} style={{ width: '36px', textAlign: 'center', color: '#A0AEC0' }}>...</span>
              ) : (
                <button
                  key={p}
                  className={p === pageNumber ? styles.pageActive : styles.pageBtn}
                  style={{ 
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', background: p === pageNumber ? '#1756AA' : '#fff', color: p === pageNumber ? '#fff' : '#1756AA', fontSize: '0.9rem', fontWeight: 600
                  }}
                  onClick={() => handlePageChange(p)}
                  disabled={isFetching}
                >
                  {p}
                </button>
              )
            )}

            <button 
              className={styles.pageBtn} 
              style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPageNumber || isFetching}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {viewMember && (
        <div className={styles.drawerOverlay} onClick={() => setViewMember(null)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()} style={{ width: '400px', background: '#fff', borderRadius: '12px', padding: '24px', margin: 'auto', alignSelf: 'center', height: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#0D1B3E' }}>Member Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#4E6080' }}>
              <p style={{ margin: 0 }}><strong>Name:</strong> {viewMember.name}</p>
              <p style={{ margin: 0 }}><strong>Mobile:</strong> {viewMember.mobile}</p>
              <p style={{ margin: 0 }}><strong>Email:</strong> {viewMember.email}</p>
              <p style={{ margin: 0 }}><strong>Shop:</strong> {viewMember.shopName || viewMember.shop}</p>
              <p style={{ margin: 0 }}><strong>City:</strong> {viewMember.city || viewMember.postOffice}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> {viewMember.aepsStatus || 'Registered'}</p>
            </div>
            <button onClick={() => setViewMember(null)} style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#1756AA', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}



      {/* ── HOLD CONFIRM MODAL ── */}
      {confirmHold && (
        <div className={styles.drawerOverlay} onClick={() => setConfirmHold(null)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()} style={{ width: '340px', background: '#fff', borderRadius: '20px', padding: '30px 24px', margin: 'auto', alignSelf: 'center', height: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', textAlign: 'center', animation: 'premiumFadeIn 0.3s ease' }}>
            <div style={{ width: '60px', height: '60px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px', boxShadow: '0 4px 10px rgba(229, 62, 62, 0.15)' }}>
              <FaHandHoldingUsd />
            </div>
            <h3 style={{ margin: '0 0 12px', color: '#0D1B3E', fontSize: '1.3rem', fontWeight: 800 }}>Confirm Hold Amount</h3>
            <p style={{ margin: '0 0 28px', color: '#4E6080', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Are you sure you want to hold <strong style={{ color: '#E53E3E', fontSize: '1rem' }}>₹{confirmHold.amount || 0}</strong> for <strong>{confirmHold.member.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => {
                dispatch(updateMemberDirect({ id: confirmHold.member.id, updates: { holdAmt: confirmHold.amount || '0' } }));
                setHoldInputs({ ...holdInputs, [confirmHold.member.id]: undefined });
                setConfirmHold(null);
                fetchMembers(pageNumber, rowsPerPage, searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate);
              }} style={{ padding: '12px', background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)', color: '#fff', border: 'none', borderRadius: '10px', flex: 1, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.25)' }}>Confirm</button>
              <button onClick={() => setConfirmHold(null)} style={{ padding: '12px', background: '#F1F5F9', color: '#4E6080', border: 'none', borderRadius: '10px', flex: 1, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN SERVICES POPOVER (Symmetrical to RoleManagement.jsx) ── */}
      {openServicesMember && (
        <div 
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: (dropdownPos.left + 275 + 320 > window.innerWidth) ? (dropdownPos.left - 330) : (dropdownPos.left + 275),
            background: '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
            zIndex: 9999,
            width: '320px',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Popover arrow */}
          <div style={{
            position: 'absolute',
            left: (dropdownPos.left + 275 + 320 > window.innerWidth) ? 'auto' : '-6px',
            right: (dropdownPos.left + 275 + 320 > window.innerWidth) ? '-6px' : 'auto',
            top: '25px',
            width: '10px',
            height: '10px',
            background: '#ffffff',
            borderLeft: (dropdownPos.left + 275 + 320 > window.innerWidth) ? 'none' : '1px solid #CBD5E1',
            borderRight: (dropdownPos.left + 275 + 320 > window.innerWidth) ? '1px solid #CBD5E1' : 'none',
            borderBottom: (dropdownPos.left + 275 + 320 > window.innerWidth) ? 'none' : '1px solid #CBD5E1',
            borderTop: (dropdownPos.left + 275 + 320 > window.innerWidth) ? '1px solid #CBD5E1' : 'none',
            transform: 'rotate(45deg)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiList style={{ color: '#1756AA', fontSize: '1rem' }} />
              <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#0D1B3E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Services ({getAssignedServices(openServicesMember).length})
              </h4>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => openAssignModal(openServicesMember)}
                style={{
                  background: '#1756AA',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#114084'}
                onMouseLeave={(e) => e.target.style.background = '#1756AA'}
              >
                Assign
              </button>
              <button 
                onClick={() => setOpenServicesMember(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 4px' }}
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {getAssignedServices(openServicesMember).length > 0 ? (
              getAssignedServices(openServicesMember).map((service, idx) => (
                <span key={idx} style={{
                  background: '#F0F7FF',
                  color: '#1756AA',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid rgba(23, 86, 170, 0.08)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {service.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeServiceFromMember(openServicesMember, service.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#E53E3E',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}
                    title="Remove Service"
                  >
                    <FiX size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#718096', fontStyle: 'italic' }}>
                No active services assigned
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── ASSIGN SERVICES MODAL OVERLAY ── */}
      {isAssignModalOpen && assignMember && (
        <div className={styles.modalOverlay} style={{ zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContainer} style={{ width: '700px', maxWidth: '95%', borderRadius: '16px', padding: '16px', background: '#fff', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiList style={{ color: '#1756AA', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0D1B3E', fontWeight: 800 }}>
                  Assign Services - {assignMember.name}
                </h3>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FiX />
              </button>
            </div>

            {/* Toolbar: Search & Select All */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', maxWidth: '300px', flex: 1 }}>
                <FiSearch style={{ position: 'absolute', left: '10px', top: '11px', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  style={{ 
                    borderRadius: '10px', 
                    height: '36px', 
                    width: '100%', 
                    paddingLeft: '32px', 
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllServices}
                  style={{ padding: '6px 14px', background: '#F0F7FF', color: '#1756AA', border: '1px solid rgba(23, 86, 170, 0.15)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllServices}
                  style={{ padding: '6px 14px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid rgba(229, 62, 62, 0.15)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Services Grid (Scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
              {allServices.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                  {allServices.filter(service => 
                    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
                  ).map((service, idx) => {
                    const isChecked = selectedServices.includes(service.id);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleServiceSelection(service.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          background: isChecked ? '#F0F7FF' : '#ffffff',
                          border: isChecked ? '1px solid #1756AA' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '2px solid #CBD5E1',
                          background: isChecked ? '#1756AA' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isChecked && <FiCheck style={{ color: '#fff', fontSize: '0.7rem', strokeWidth: 4 }} />}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isChecked ? '#0D1B3E' : '#4E6080' }}>
                          {service.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#718096', fontSize: '0.85rem' }}>
                  No services available
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignedServices}
                disabled={isAssigningServices}
                style={{ padding: '8px 20px', background: '#1756AA', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              >
                {isAssigningServices ? 'Saving...' : 'Save Changes'} <FiCheck />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showRegistrationModal && (
        <MemberRegistration 
          isModal={true} 
          onClose={() => {
            setShowRegistrationModal(false);
            fetchMembers(pageNumber, rowsPerPage, searchQuery, filterRoleId, memberType, kycStatus, fromDate, toDate);
          }} 
        />
      )}

      {/* Confirmation Modal for Member Controls Toggles */}
      {pendingToggle && (
        <div className={styles.modalOverlay} style={{ zIndex: 4000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContainer} style={{ width: '360px', borderRadius: '16px', padding: '24px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                background: pendingToggle.nextValue ? '#E6F4EA' : '#FDECEA', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: pendingToggle.nextValue ? '#1E7E34' : '#D93025', 
                marginBottom: '16px',
                boxShadow: pendingToggle.nextValue ? '0 4px 10px rgba(30,126,52,0.15)' : '0 4px 10px rgba(217,48,37,0.15)'
              }}>
                {pendingToggle.nextValue ? (
                  <FaCheckCircle style={{ fontSize: '1.6rem' }} />
                ) : (
                  <FaExclamationTriangle style={{ fontSize: '1.5rem' }} />
                )}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#0D1B3E', fontWeight: 800 }}>
                {pendingToggle.nextValue ? 'Enable' : 'Disable'} Status?
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                Are you sure you want to turn <strong style={{ color: pendingToggle.nextValue ? '#1E7E34' : '#D93025' }}>{pendingToggle.nextValue ? 'ON' : 'OFF'}</strong> the <strong>{
                  pendingToggle.field === 'videoKyc' ? 'Video KYC' :
                  pendingToggle.field === 'isActive' ? 'Account Active' :
                  'Hold Account'
                }</strong> status for <strong>{pendingToggle.member.name}</strong>?
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => setPendingToggle(null)}
                  style={{ flex: 1, padding: '10px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleToggle(pendingToggle.field, pendingToggle.member);
                    setPendingToggle(null);
                  }}
                  style={{ 
                    flex: 1, 
                    padding: '10px 16px', 
                    background: pendingToggle.nextValue ? 'linear-gradient(135deg, #27AE60, #1E7E34)' : 'linear-gradient(135deg, #E53E3E, #D93025)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    fontSize: '0.85rem',
                    boxShadow: pendingToggle.nextValue ? '0 4px 10px rgba(39,174,96,0.2)' : '0 4px 10px rgba(229,62,62,0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Action Confirmation Modal (Email, SMS, Re-KYC) */}
      {pendingAction && (
        <div className={styles.modalOverlay} style={{ zIndex: 4000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                background: '#EDF4FF', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#1756AA', 
                marginBottom: '16px',
                boxShadow: '0 4px 10px rgba(23,86,170,0.15)'
              }}>
                {pendingAction.action === 'Send Email' ? (
                  <FaEnvelope style={{ fontSize: '1.5rem', color: '#27AE60' }} />
                ) : pendingAction.action === 'Send SMS' ? (
                  <FaSms style={{ fontSize: '1.5rem', color: '#1756AA' }} />
                ) : (
                  <FaShieldAlt style={{ fontSize: '1.5rem', color: '#EAA21F' }} />
                )}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#0D1B3E', fontWeight: 800 }}>
                {pendingAction.action}
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                {pendingAction.action === 'Send Email' ? (
                  <>Are you sure you want to send a Gmail message to <strong>{pendingAction.member.email}</strong>?</>
                ) : pendingAction.action === 'Send SMS' ? (
                  <>Are you sure you want to send an SMS to <strong>{pendingAction.member.mobile}</strong>?</>
                ) : (
                  <>Are you sure you want to initiate Re-KYC for <strong>{pendingAction.member.name}</strong>?</>
                )}
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => setPendingAction(null)}
                  style={{ flex: 1, padding: '10px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const actionType = pendingAction.action;
                    const name = pendingAction.member.name;
                    const target = actionType === 'Send Email' ? pendingAction.member.email : actionType === 'Send SMS' ? pendingAction.member.mobile : name;
                    
                    setPendingAction(null);
                    
                    if (actionType === 'Send Email') {
                      setSuccessMessage(`Gmail sent successfully to ${target}!`);
                    } else if (actionType === 'Send SMS') {
                      setSuccessMessage(`SMS sent successfully to ${target}!`);
                    } else {
                      setSuccessMessage(`Re-KYC process initiated successfully for ${target}!`);
                    }
                  }}
                  style={{ flex: 1, padding: '10px 16px', background: 'linear-gradient(135deg, #1756AA, #124d96)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(23,86,170,0.2)' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div className={styles.modalOverlay} style={{ zIndex: 4001, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContainer} style={{ width: '340px', borderRadius: '16px', padding: '24px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                background: '#E6F4EA', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#1E7E34', 
                marginBottom: '16px',
                boxShadow: '0 4px 10px rgba(30,126,52,0.15)'
              }}>
                <FaCheckCircle style={{ fontSize: '1.6rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#0D1B3E', fontWeight: 800 }}>Success</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                {successMessage}
              </p>
              <button
                onClick={() => setSuccessMessage(null)}
                style={{ width: '100%', padding: '10px 16px', background: 'linear-gradient(135deg, #27AE60, #1E7E34)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(39,174,96,0.2)' }}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMember;
