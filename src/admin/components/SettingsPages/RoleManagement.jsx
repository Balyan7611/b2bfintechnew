// src/components/RoleManagement.js
import { useCallback, useEffect, useState } from 'react';
import {
  FaCopy,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaPrint
} from 'react-icons/fa';
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiList,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';



const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [masterRoles, setMasterRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [dbServices, setDbServices] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    prefix: '',
    roleCode: '',
    startId: '',
    price: '0',
    status: true,
    outside: false,
    typeRole: '',
    menuStr: '1,2,3',
    packageId: 2,
    description: 'string',
    service: 'string'
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await API.getRoles();
      if (response && Array.isArray(response) && response.length > 0) {
        setRoles(response);
        setFilteredRoles(response);
        setErrorMsg('');
      } else if (response && !Array.isArray(response) && response.id) {
        setRoles([response]);
        setFilteredRoles([response]);
        setErrorMsg('');
      } else {
        setRoles([]);
        setFilteredRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setErrorMsg('Failed to connect to the roles API.');
      setRoles([]);
      setFilteredRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterRoles = async () => {
    try {
      const response = await API.getMasterRoles();
      if (response && response.data) {
        setMasterRoles(response.data);
      } else if (Array.isArray(response)) {
        setMasterRoles(response);
      }
    } catch (error) {
      console.error('Error fetching master roles:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await API.service.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        const activeServices = res.data.filter(s => s.isActive);
        setDbServices(activeServices);
      } else {
        const msg = res?.mess || res?.message || 'Failed to retrieve services from API.';
        setErrorMsg(`Services Load Error: ${msg}`);
      }
    } catch (err) {
      console.error("Error loading services for RoleManagement:", err);
      setErrorMsg(`Failed to connect to services API: ${err.message || 'Connection error'}`);
    }
  };

  useEffect(() => { 
    fetchRoles(); 
    fetchMasterRoles();
    fetchServices();
  }, []);

  const filterRoles = useCallback(() => {
    let filtered = [...roles];
    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.prefix?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRoles(filtered);
    setCurrentPage(1);
  }, [roles, searchTerm]);

  useEffect(() => {
    filterRoles();
  }, [filterRoles]);

  const getAssignedServices = (role) => {
    if (!role || !role.service || role.service === 'string' || !dbServices || dbServices.length === 0) return [];
    
    const ids = role.service.split(',').map(id => id.trim()).filter(Boolean);
    return ids.map(id => {
      const s = dbServices.find(service => service.id.toString() === id.toString());
      return s ? { id: s.id, name: s.name } : null;
    }).filter(Boolean);
  };

  const getModalServices = () => {
    if (!dbServices || dbServices.length === 0) return [];
    return dbServices.map(s => ({ id: s.id.toString(), name: s.name }));
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await API.deleteRole(showConfirmModal.id);
      if (response && response.status) {
        await fetchRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setLoading(false);
      setShowConfirmModal({ isOpen: false, id: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddClick = () => {
    setFormData({
      id: 0,
      name: '',
      prefix: '',
      roleCode: '',
      startId: '',
      price: '0',
      status: true,
      outside: false,
      typeRole: '',
      menuStr: '1,2,3',
      packageId: 2,
      description: 'string',
      service: 'string'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setFormData({
      id: role.id,
      name: role.name,
      prefix: role.prefix,
      roleCode: role.roleCode,
      startId: role.startId,
      price: role.price,
      status: role.status,
      outside: role.outside,
      typeRole: role.typeRole || 1,
      menuStr: role.menuStr || '1,2,3',
      packageId: role.packageId || 2,
      description: 'string',
      service: role.service || 'string'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.saveRole(formData);
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) { alert(err.message); }
  };

  const handleMouseEnter = (e, role) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      x: rect.right + 15,
      y: rect.top + window.scrollY + (rect.height / 2) - 100
    });
    setHoveredRole(role);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setHoveredRole(null);
    }, 200);
    setHideTimeout(timer);
  };

  const handlePopoverMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handlePopoverMouseLeave = () => {
    setHoveredRole(null);
  };

  const openAssignModal = (role) => {
    setAssignRole(role);
    const currentlyAssigned = (role.service && role.service !== 'string') 
      ? role.service.split(',').map(id => id.trim()).filter(Boolean) 
      : [];
    setSelectedServices(currentlyAssigned);
    setServiceSearch('');
    setIsAssignModalOpen(true);
    setHoveredRole(null);
  };

  const toggleServiceSelection = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  const handleSelectAllServices = () => {
    setSelectedServices(getModalServices().map(s => s.id));
  };

  const handleDeselectAllServices = () => {
    setSelectedServices([]);
  };

  const handleSaveAssignedServices = async (e) => {
    if (e) e.preventDefault();
    if (assignRole) {
      setLoading(true);
      try {
        const newServiceStr = selectedServices.join(',');
        const updatedRole = {
          ...assignRole,
          service: newServiceStr
        };
        await API.saveRole(updatedRole);
        setIsAssignModalOpen(false);
        fetchRoles();
      } catch (err) {
        console.error('Error saving assigned services:', err);
        alert(err.message || 'Failed to assign services.');
      } finally {
        setLoading(false);
      }
    }
  };

  const removeServiceFromRole = async (role, serviceIdToRemove) => {
    try {
      const ids = (role.service && role.service !== 'string') 
        ? role.service.split(',').map(id => id.trim()).filter(Boolean) 
        : [];
      const updatedIds = ids.filter(id => id.toString() !== serviceIdToRemove.toString());
      const updatedRole = {
        ...role,
        service: updatedIds.join(',')
      };
      await API.saveRole(updatedRole);
      fetchRoles();
    } catch (error) {
      console.error('Error removing service from role:', error);
      alert(error.message || 'Failed to remove service.');
    }
  };

  const handleExport = (type) => {
    const exportData = filteredRoles.map(role => ({
      'S.No': role.id,
      'Role Name': role.name,
      'Prefix': role.prefix,
      'Start ID': role.startId,
      'Price': role.price,
      'Status': role.status ? 'Active' : 'Inactive',
      'Add Date': role.addDate
    }));
    if (type === 'copy') {
      navigator.clipboard.writeText(JSON.stringify(exportData));
    } else if (type === 'csv') {
      const csv = exportData.map(row => Object.values(row).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'roles.csv';
      link.click();
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredRoles.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredRoles.length / entriesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 0px 2px', maxWidth: '100%' }}>
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 15px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>System Roles</h3>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }} onClick={handleAddClick}>
            <FiPlus size={16} /> <span>Add New Role</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '15px 20px 0 20px', padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <div className="global-table-toolbar" style={{ padding: '10px 15px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table" onClick={() => handleExport('copy')}><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel" onClick={() => handleExport('excel')}><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF" onClick={() => handleExport('pdf')}><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV" onClick={() => handleExport('csv')}><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table" onClick={() => window.print()}><FaPrint /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input
              type="text"
              placeholder="Search roles..."
              style={{ borderRadius: '10px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '950px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>S.NO</th>
                <th style={{ width: '90px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '300px' }}>ROLE IDENTITY</th>
                <th style={{ width: '120px', textAlign: 'left' }}>PREFIX</th>
                <th style={{ width: '120px', textAlign: 'left' }}>START ID</th>
                <th style={{ width: '120px', textAlign: 'left' }}>PRICE (₹)</th>
                <th style={{ width: '120px', textAlign: 'left' }}>STATUS</th>
                <th style={{ width: '150px', textAlign: 'left' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>Loading...</td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>No roles found</td>
                </tr>
              ) : (
                currentEntries.map((role, idx) => (
                  <tr key={role.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{indexOfFirstEntry + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className={styles.editBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', color: '#3B82F6', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => handleEdit(role)} title="Edit Role"><FiEdit /></button>
                        <button className={styles.deleteBtn} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FED7D7', cursor: 'pointer' }} title="Delete Role" onClick={() => setShowConfirmModal({ isOpen: true, id: role.id })}><FiTrash2 /></button>
                      </div>
                    </td>
                    <td style={{ cursor: 'pointer' }}>
                      <div
                        onMouseEnter={(e) => handleMouseEnter(e, role)}
                        onMouseLeave={handleMouseLeave}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content' }}
                      >
                        <div style={{ width: '36px', height: '36px', background: 'rgba(23, 86, 170, 0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1756AA' }}>
                          <FiUsers />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px dashed #1756AA' }}>
                            {role.name}
                          </span>
                          <small style={{ color: '#718096', fontWeight: 600 }}>Reg. Count: {role.regCount || role.startId}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {role.prefix}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left', fontWeight: 700, color: '#4E6080' }}>{role.startId}</td>
                    <td style={{ textAlign: 'left', fontWeight: 800, color: '#27AE60' }}>{role.price}</td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: role.status ? '#27AE60' : '#E53E3E', background: role.status ? 'rgba(39, 174, 96, 0.1)' : 'rgba(229, 62, 62, 0.1)', padding: '5px 12px', borderRadius: '50px', display: 'inline-block' }}>
                        ● {role.status ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left', color: '#718096', fontWeight: 700, fontSize: '0.85rem' }}>{role.addDate || new Date().toLocaleDateString('en-GB')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '25px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredRoles.length)} of {filteredRoles.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
              <FiChevronLeft />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '35px',
                  height: '35px',
                  background: currentPage === i + 1 ? '#1756AA' : '#F8FAFC',
                  color: currentPage === i + 1 ? 'white' : '#475569',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: currentPage === i + 1 ? 'none' : '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button className="global-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder Space for Future Card */}
      <div style={{ minHeight: '250px', width: '100%' }}></div>

      {hoveredRole && (
        <div 
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          style={{
            position: 'absolute',
            top: popoverPos.y,
            left: popoverPos.x,
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
          <div style={{
            position: 'absolute',
            left: '-6px',
            top: 'calc(50% - 5px)',
            width: '10px',
            height: '10px',
            background: '#ffffff',
            borderLeft: '1px solid #CBD5E1',
            borderBottom: '1px solid #CBD5E1',
            transform: 'rotate(45deg)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiList style={{ color: '#1756AA', fontSize: '1rem' }} />
              <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#0D1B3E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Services ({getAssignedServices(hoveredRole).length})
              </h4>
            </div>
            <button
              onClick={() => openAssignModal(hoveredRole)}
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
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {getAssignedServices(hoveredRole).length > 0 ? (
              getAssignedServices(hoveredRole).map((service, idx) => (
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
                      removeServiceFromRole(hoveredRole, service.id);
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

      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff' }}>
            <div className={styles.drawerHeader} style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <FiUsers size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>{formData.id !== 0 ? 'Edit Role' : 'Add New Role'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer' }}>
                <FiX size={16} />
              </button>
            </div>

            <div className={styles.drawerBody} style={{ padding: '25px', overflowY: 'auto' }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role Name</label>
                      <input type="text" name="name" className={styles.inputControl} value={formData.name} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prefix</label>
                      <input type="text" name="prefix" className={styles.inputControl} value={formData.prefix} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start ID</label>
                      <input type="number" name="startId" className={styles.inputControl} value={formData.startId} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package ID</label>
                      <input type="number" name="packageId" className={styles.inputControl} value={formData.packageId} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type Role</label>
                    <select name="typeRole" className={styles.inputControl} value={formData.typeRole} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '12px 16px', border: '2px solid #E2E8F0', background: '#ffffff', color: '#0F172A', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} required>
                      <option value="" disabled>Select Master Role</option>
                      {masterRoles && masterRoles.length > 0 ? (
                        masterRoles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>Loading...</option>
                      )}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role Code</label>
                    <input type="text" name="roleCode" className={styles.inputControl} value={formData.roleCode} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</label>
                      <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', height: '42px' }}>
                        <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outside</label>
                      <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', height: '42px' }}>
                        <input type="checkbox" name="outside" checked={formData.outside} onChange={handleInputChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</label>
                    <input type="number" name="price" className={styles.inputControl} value={formData.price} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                    <input type="text" name="description" className={styles.inputControl} value={formData.description} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                  <button type="button" style={{ padding: '12px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1.5, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                    Save Role <FiCheck size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', marginBottom: '16px' }}>
                <FiTrash2 style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Role</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this role? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => setShowConfirmModal({ isOpen: false, id: null })}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{ flex: 1, padding: '10px', background: '#E53E3E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && assignRole && (
        <div className={styles.modalOverlay} style={{ zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContainer} style={{ width: '700px', maxWidth: '95%', borderRadius: '16px', padding: '16px', background: '#fff', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiList style={{ color: '#1756AA', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0D1B3E', fontWeight: 800 }}>
                  Assign Services - {assignRole.name}
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
              <div className="global-search-box" style={{ maxWidth: '300px', margin: 0, flex: 1 }}>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  style={{ borderRadius: '10px', height: '36px' }}
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
              {getModalServices().length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                  {getModalServices().filter(service => 
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
                style={{ padding: '8px 20px', background: '#1756AA', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              >
                Save Changes <FiCheck />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;