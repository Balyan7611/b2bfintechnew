import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import { 
  FiPackage, FiUserCheck, FiDollarSign, FiShield, FiEdit, FiSearch, FiCopy, FiPlus, FiX, FiCheck, FiChevronRight, FiChevronLeft, FiTrash2
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaRupeeSign } from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import RoleSelect from '../../../shared/components/common/RoleSelect';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import styles from '../MemberPages/MemberPages.module.css';

const PackageManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    role: '', name: '', price: '0', capping: '0', copySlab: '', status: true
  });

  const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, id: null });

  const [localPackages, setLocalPackages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination & Action Dropdown States
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, pkg: null });

  // Close action dropdown on outside click and scroll
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, pkg: null } : prev);
      }
    };
    const handleScroll = () => {
      setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, pkg: null } : prev);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await API.package.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        setLocalPackages(res.data.map(item => ({
          id: item.id,
          name: item.name,
          role: item.roleName || (item.roleId === 1 ? 'Admin' : item.roleId === 2 ? 'Retailer' : 'Distributor'),
          price: item.price !== undefined && item.price !== null ? item.price.toFixed(2) : '0.00',
          capping: item.capping || '0.00',
          copySlab: item.copySlabId ? item.copySlabId.toString() : '',
          status: item.isActive,
          addDate: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : '27/03/2025',
          ...item
        })));
        setErrorMsg('');
      } else {
        setErrorMsg('Failed to fetch packages from API.');
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setErrorMsg('Failed to connect to the package API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = () => {
    // Delete endpoint is not defined in spec, keep it local/mock
    setLocalPackages(localPackages.filter(p => p.id !== showConfirmModal.id));
    setShowConfirmModal({ isOpen: false, id: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({ role: '', name: '', price: '0', capping: '0', copySlab: '', status: true });
    setIsModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setFormData({ ...pkg, role: pkg.roleId || pkg.role });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        id: formData.id && !isNaN(formData.id) ? parseInt(formData.id) : 0,
        roleId: parseInt(formData.role) || 0,
        code: formData.code || formData.name.substring(0, 3).toUpperCase(),
        name: formData.name,
        description: formData.description || formData.name,
        price: parseFloat(formData.price) || 0,
        billingType: formData.billingType || 'OneTime',
        isActive: formData.status,
        copySlabId: parseInt(formData.copySlab) || 0
      };
      
      let res;
      if (formData.id && !isNaN(formData.id) && parseInt(formData.id) > 0) { // If ID exists and > 0, it's an update (PUT)
        res = await API.package.update(payload);
      } else {
        res = await API.package.create(payload);
      }
      
      fetchPackages();
    } catch (err) {
      console.error("Error saving package:", err);
      // Fallback local logic
      if (formData.id) {
        setLocalPackages(localPackages.map(p => p.id === formData.id ? { ...p, ...formData } : p));
      } else {
        const newPkg = { ...formData, id: Date.now(), addDate: new Date().toLocaleDateString('en-GB') };
        setLocalPackages([...localPackages, newPkg]);
      }
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 0px 2px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 15px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'nowrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Package List</h3>
          <PrimaryButton onClick={handleAddClick}>
            <FiPlus size={16} /> <span>Add New Package</span>
          </PrimaryButton>
        </div>

        {errorMsg && (
          <div style={{ margin: '15px 20px 0 20px', padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '10px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 8px', outline: 'none', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons 
            headers={['S.NO', 'PACKAGE NAME', 'ROLE', 'PRICE (₹)', 'CAPPING', 'STATUS', 'ADD DATE']}
            rows={localPackages.map((pkg, idx) => [
              idx + 1, pkg.name, pkg.role, pkg.price, pkg.capping, pkg.status ? 'ACTIVE' : 'INACTIVE', pkg.addDate
            ])}
            fileNamePrefix="package_report"
            sheetName="Packages"
          />

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <FiSearch color="#A0AEC0" />
            <input 
               type="text" 
               placeholder="Search packages..." 
               style={{ fontSize: '0.85rem', border: 'none', outline: 'none', background: 'transparent', width: '100%' }} 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '950px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>S.NO</th>
                <th style={{ width: '90px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '250px' }}>PACKAGE DETAILS</th>
                <th style={{ width: '120px' }}>ROLE</th>
                <th style={{ textAlign: 'left', width: '120px' }}>PRICE (₹)</th>
                <th style={{ textAlign: 'left', width: '100px' }}>CAPPING</th>
                <th style={{ textAlign: 'left', width: '120px' }}>STATUS</th>
                <th style={{ textAlign: 'left', width: '120px' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtered = localPackages.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.role?.toLowerCase().includes(searchQuery.toLowerCase()));
                const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
                const startIndex = (currentPage - 1) * rowsPerPage;
                const currentEntries = filtered.slice(startIndex, startIndex + rowsPerPage);
                
                if (isLoading) {
                  return (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading data...</span>
                      </td>
                    </tr>
                  );
                }
                
                if (currentEntries.length === 0) {
                  return (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <FiPackage style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data available in table</span></div></td>
                    </tr>
                  );
                }

                return currentEntries.map((pkg, idx) => (
                  <tr key={pkg.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{startIndex + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-dropdown-wrapper" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <button
                          className="action-dropdown-wrapper"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeActionRow.id === pkg.id) {
                              setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, pkg: null } : prev);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownHeight = 120;
                              const isUpward = (window.innerHeight - rect.bottom) < dropdownHeight;
                              
                              setActiveActionRow({ 
                                id: pkg.id, 
                                x: rect.right + 12, 
                                y: isUpward ? rect.bottom : rect.top, 
                                isUpward,
                                pkg 
                              });
                            }
                          }}
                          style={{ padding: '0 12px', height: '32px', borderRadius: '8px', background: activeActionRow.id === pkg.id ? '#D1FAE5' : '#10B981', color: activeActionRow.id === pkg.id ? '#059669' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s', boxShadow: activeActionRow.id === pkg.id ? 'none' : '0 2px 6px rgba(16,185,129,0.3)' }}
                          title="Actions"
                        >
                          Action <span style={{ fontSize: '1.1rem', marginTop: '-2px', fontWeight: 900 }}>⋮</span>
                        </button>
                      </div>
                    </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{pkg.name}</span>
                      <small style={{ color: '#718096', fontWeight: 600 }}>
                        Copy Slab: {localPackages.find(p => p.id.toString() === pkg.copySlab)?.name || 'None'}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: 'rgba(23, 86, 170, 0.08)', color: '#1756AA', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {pkg.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left', fontWeight: 800, color: '#27AE60' }}>₹{pkg.price}</td>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: '#4E6080' }}>{pkg.capping}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ background: pkg.status ? 'rgba(39, 174, 96, 0.1)' : 'rgba(229, 62, 62, 0.1)', color: pkg.status ? '#27AE60' : '#E53E3E', padding: '5px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 }}>
                      ● {pkg.status ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: '#718096', fontSize: '0.85rem' }}>{pkg.addDate}</td>
                </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {(() => {
          const filtered = localPackages.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.role?.toLowerCase().includes(searchQuery.toLowerCase()));
          const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
          const startIndex = (currentPage - 1) * rowsPerPage;
          
          return (
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
                Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} entries
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className={styles.pageBtn} 
                  style={{ width: '36px', height: '36px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                   if (i + 1 < currentPage - 2 || i + 1 > currentPage + 2) return null;
                   return (
                    <button
                      key={i}
                      className={currentPage === i + 1 ? styles.pageActive : styles.pageBtn}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                        background: currentPage === i + 1 ? '#1756AA' : '#fff', 
                        color: currentPage === i + 1 ? '#fff' : '#475569',
                        border: currentPage === i + 1 ? 'none' : '1px solid #E2E8F0', cursor: 'pointer'
                      }}
                    >
                      {i + 1}
                    </button>
                   )
                })}
                
                <button 
                  className={styles.pageBtn} 
                  style={{ width: '36px', height: '36px', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── ACTION DROPDOWN PORTAL (fixed position, never clipped) ── */}
      {activeActionRow.id && (
        <>
          <style>{`
            @keyframes dropdownFadeInSidePkg {
              from { opacity: 0; transform: translateX(-10px) ${activeActionRow.isUpward ? 'translateY(10px)' : 'translateY(-10px)'}; }
              to   { opacity: 1; transform: translateX(0) translateY(0); }
            }
          `}</style>
          <div
            className="action-dropdown-wrapper"
            style={{ 
              position: 'fixed', 
              top: activeActionRow.isUpward ? 'auto' : activeActionRow.y, 
              bottom: activeActionRow.isUpward ? (window.innerHeight - activeActionRow.y) : 'auto',
              left: activeActionRow.x, 
              background: '#fff', 
              borderRadius: '12px', 
              boxShadow: '0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)', 
              border: '1px solid #E2E8F0', 
              zIndex: 9999, 
              minWidth: '168px', 
              overflow: 'hidden', 
              animation: 'dropdownFadeInSidePkg 0.15s ease-out' 
            }}
          >
            <button
              onClick={() => { handleEdit(activeActionRow.pkg); setActiveActionRow({ id: null, x: 0, y: 0, pkg: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiEdit size={12} /></span>
              Edit Package
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setShowConfirmModal({ isOpen: true, id: activeActionRow.pkg.id }); setActiveActionRow({ id: null, x: 0, y: 0, pkg: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#E53E3E', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiTrash2 size={12} /></span>
              Delete Package
            </button>
          </div>
        </>
      )}

      {/* ── ADD/EDIT MODAL (DRAWER STYLE) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxWidth: '95%', background: '#fff' }}>
            <div className={styles.drawerHeader} style={{ padding: '20px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <FiPackage size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>{formData.id ? 'Edit Package' : 'Package Config'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={16} />
              </button>
            </div>
            
            <div className={styles.drawerBody} style={{ padding: '25px', overflowY: 'auto' }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiUserCheck size={14}/> Select Role</label>
                    <RoleSelect
                      value={formData.role || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                      placeholder="-- Select Role --"
                      style={{ height: '46px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem' }}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiPackage size={14}/> Package Name</label>
                    <input type="text" name="name" className={styles.inputControl} placeholder="e.g. Silver Pack" value={formData.name} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaRupeeSign size={12}/> Price</label>
                      <input type="number" name="price" className={styles.inputControl} value={formData.price} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiShield size={14}/> Capping</label>
                      <input type="number" name="capping" className={styles.inputControl} value={formData.capping} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }} required />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiCopy size={14}/> Copy Slab From</label>
                    <select name="copySlab" className={styles.inputControl} value={formData.copySlab} onChange={handleInputChange} style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }}>
                      <option value="">No Slab</option>
                      {localPackages.filter(p => p.id !== formData.id).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package Status</label>
                    <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: formData.status ? '#10B981' : '#E53E3E' }}>{formData.status ? 'ACTIVE' : 'INACTIVE'}</span>
                      <label className={styles.switch} style={{ transform: 'scale(0.8)' }}>
                        <input type="checkbox" checked={formData.status} onChange={(e) => setFormData({...formData, status: e.target.checked})} />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                  <button type="button" style={{ padding: '12px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <PrimaryButton type="submit" style={{ flex: 1.5 }} disabled={isLoading}>
                    {isLoading ? <div className={styles.spinner} style={{ width: '18px', height: '18px', borderTopColor: '#fff' }}></div> : <>Save Package <FiCheck size={16} /></>}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3600 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', marginBottom: '16px' }}>
                <FiTrash2 style={{ fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0D1B3E' }}>Delete Package</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' }}>
                Are you sure you want to delete this package? This action cannot be undone.
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
    </div>
  );
};

export default PackageManagement;
