import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiCheckCircle, FiLayout
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import PrimaryButton from '../../../shared/components/common/PrimaryButton';
import styles from '../MemberPages/MemberPages.module.css';

const DesignService = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '', boxColor: '#ffffff', textColor: '#333333', serviceType: '', bannerImage: null
  });
  
  const [selectedServices, setSelectedServices] = useState({});
  const [designsList, setDesignsList] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, design: null });
  const [toggleConfirmModal, setToggleConfirmModal] = useState({ isOpen: false, design: null });

  // Close action dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow({ id: null, x: 0, y: 0, design: null });
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Load section types and services from API and merge them dynamically
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const sectRes = await API.sectionType.getAll(null); // Get both active/inactive
      const servRes = await API.service.getAll();
      
      let loadedSections = [];
      let loadedServices = [];
      
      if (sectRes && sectRes.status === true && Array.isArray(sectRes.data)) {
        loadedSections = sectRes.data;
        setSectionTypes(sectRes.data);
      }

      if (servRes && servRes.status === true && Array.isArray(servRes.data)) {
        loadedServices = servRes.data;
        setServices(servRes.data);
      }

      // Map dynamic services to sections
      const matchedDesigns = loadedSections.map((sect) => {
        const matchingServices = loadedServices
          .filter(s => String(s.sectionType) === String(sect.id))
          .map(s => s.id);
          
        return {
          id: sect.id,
          name: sect.name,
          service: matchingServices.length > 0 ? ',' + matchingServices.join(',') : '—',
          position: sect.orderBy || sect.position || 0,
          status: sect.isActive !== false
        };
      });

      setDesignsList(matchedDesigns);
    } catch (err) {
      console.error("Error fetching initial data in DesignService", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const toggleService = (srvId) => {
    setSelectedServices(prev => ({ ...prev, [srvId]: !prev[srvId] }));
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setDesignsList(prev => prev.filter(d => d.id !== deleteId));
    setShowDeleteModal(false);
  };

  const handleToggleStatus = (id) => {
    setDesignsList(prev => prev.map(d => d.id === id ? { ...d, status: !d.status } : d));
  };

  const handleEdit = (design) => {
    setFormData({
      id: design.id,
      name: design.name, 
      boxColor: '#ffffff', 
      textColor: '#333333', 
      serviceType: String(design.id), // Bind to selected section type ID
      bannerImage: null
    });
    
    // Parse services assigned to this design
    const serviceIds = (design.service || '').split(',').map(s => s.trim()).filter(Boolean);
    const selections = {};
    serviceIds.forEach(id => {
      selections[id] = true;
    });
    setSelectedServices(selections);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    const targetSectionId = formData.serviceType;
    if (!targetSectionId || targetSectionId === 'Banner') {
      alert("Please select a target Section Type!");
      return;
    }
    
    setIsSaving(true);
    try {
      const promises = [];
      
      services.forEach(srv => {
        const isCurrentlySelected = selectedServices[srv.id];
        const isPreviouslyAssigned = String(srv.sectionType) === String(targetSectionId);
        
        if (isCurrentlySelected && !isPreviouslyAssigned) {
          // Assign service to this section
          const payload = {
            ...srv,
            sectionType: targetSectionId
          };
          promises.push(API.service.update(payload));
        } else if (!isCurrentlySelected && isPreviouslyAssigned) {
          // Unassign service from this section
          const payload = {
            ...srv,
            sectionType: '0'
          };
          promises.push(API.service.update(payload));
        }
      });

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      alert("Design service section updated successfully!");
      setIsModalOpen(false);
      fetchInitialData(); // Reload list to reflect changes
    } catch (err) {
      console.error("Error saving design service", err);
      alert("Failed to save design service");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.container} style={{ padding: '20px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh' }}>
        {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>Design Service</h3>
          <PrimaryButton onClick={() => {
            setFormData({ name: '', boxColor: '#ffffff', textColor: '#333333', serviceType: '', bannerImage: null });
            setSelectedServices({});
            setIsModalOpen(true);
          }}>
            <FiPlus size={16} /> <span>Create Service</span>
          </PrimaryButton>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table"><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search services..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>S.NO</th>
                <th style={{ width: '80px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '250px' }}>NAME</th>
                <th style={{ width: '400px', textAlign: 'left' }}>SERVICE</th>
                <th style={{ width: '100px', textAlign: 'center' }}>POSITION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontWeight: 600 }}>
                    ⏳ Loading design services...
                  </td>
                </tr>
              ) : designsList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    
                      <span style={{ fontWeight: 600 }}>No design layouts found</span></td>
                </tr>
              ) : designsList.map((design, idx) => (
                <tr key={design.id} className={styles.hoverRow} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{idx + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-dropdown-wrapper" style={{ display: 'inline-block' }}>
                      <button
                        className="action-dropdown-wrapper"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeActionRow.id === design.id) {
                            setActiveActionRow({ id: null, x: 0, y: 0, design: null });
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActiveActionRow({ id: design.id, x: rect.left + rect.width / 2, y: rect.bottom + 6, design });
                          }
                        }}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', background: activeActionRow.id === design.id ? '#D1FAE5' : '#10B981', color: activeActionRow.id === design.id ? '#059669' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, transition: 'all 0.15s', letterSpacing: '1px', boxShadow: activeActionRow.id === design.id ? 'none' : '0 2px 6px rgba(16,185,129,0.3)' }}
                        title="Actions"
                      >
                        ⋯
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#1E293B', fontSize: '0.9rem', fontWeight: 600 }}>{design.name}</span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                     <div style={{ color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                       {design.service}
                     </div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#0F172A', fontWeight: 700, fontSize: '0.9rem' }}>{design.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="global-pagination" style={{ padding: '20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing 1 to {designsList.length} of {designsList.length} records
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#3B82F6', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* ── ADD MODAL (PREMIUM FULL-PAGE DRAWER) ── */}
      {isModalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '1100px', maxWidth: '100%', maxHeight: '90vh', background: '#fff', borderRadius: '20px', transform: 'none', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            {/* Header */}
            <div style={{ padding: '12px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '20px 20px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiLayout size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Create Service Section</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>
                <FiX size={16} />
              </button>
            </div>
            
            {/* Body */}
            <div style={{ padding: '30px', overflowY: 'auto', flex: 1, background: '#F8FAFC' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
                
                {/* Top Form Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</label>
                    <input type="text" placeholder="Enter service name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.95rem', background: '#F8FAFC', color: '#0F172A', outline: 'none' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Box Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <input type="color" value={formData.boxColor} onChange={e => setFormData({...formData, boxColor: e.target.value})} style={{ width: '30px', height: '30px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }} />
                      <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>{formData.boxColor}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Text Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <input type="color" value={formData.textColor} onChange={e => setFormData({...formData, textColor: e.target.value})} style={{ width: '30px', height: '30px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }} />
                      <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>{formData.textColor}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Type / Section</label>
                    <select style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.95rem', background: '#F8FAFC', color: '#0F172A', outline: 'none', cursor: 'pointer' }} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
                      <option value="">-- Select Section Type --</option>
                      {sectionTypes.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                      <option value="Banner">Banner</option>
                    </select>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '20px 0' }} />

                {formData.serviceType === 'Banner' ? (
                  <div style={{ display: 'flex', gap: '30px', background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Upload Banner Image</h4>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '150px', border: '2px dashed #CBD5E1', borderRadius: '10px', background: '#fff', cursor: 'pointer' }}>
                        <FiPlus size={24} color="#64748B" style={{ marginBottom: '10px' }} />
                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Click to browse image</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const url = URL.createObjectURL(e.target.files[0]);
                            setFormData({...formData, bannerImage: url});
                          }
                        }} />
                      </label>
                    </div>
                    {formData.bannerImage && (
                      <div style={{ width: '250px' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Banner Preview</h4>
                        <div style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                          <img src={formData.bannerImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Services Checkbox Grid */}
                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Assign Services</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
                          <input 
                            type="checkbox"
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            checked={services.length > 0 && services.every(s => selectedServices[s.id])}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newSelections = {};
                              services.forEach(s => {
                                newSelections[s.id] = checked;
                              });
                              setSelectedServices(newSelections);
                            }}
                          />
                          Select All
                        </label>
                        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, background: '#F1F5F9', padding: '4px 12px', borderRadius: '20px' }}>
                          {Object.values(selectedServices).filter(Boolean).length} Selected
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                      {services.map((srv) => (
                        <label key={srv.id} style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', 
                          background: selectedServices[srv.id] ? 'rgba(59, 130, 246, 0.05)' : '#fff', 
                          border: selectedServices[srv.id] ? '1px solid #3B82F6' : '1px solid #E2E8F0', 
                          borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: selectedServices[srv.id] ? '0 4px 10px rgba(59, 130, 246, 0.1)' : 'none'
                        }}>
                          <div style={{ 
                            width: '20px', height: '20px', borderRadius: '6px', 
                            border: selectedServices[srv.id] ? 'none' : '2px solid #CBD5E1', 
                            background: selectedServices[srv.id] ? '#3B82F6' : 'transparent', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            {selectedServices[srv.id] && <FiCheck size={14} color="#fff" />}
                          </div>
                          <input type="checkbox" checked={!!selectedServices[srv.id]} onChange={() => toggleService(srv.id)} style={{ display: 'none' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: selectedServices[srv.id] ? 700 : 600, color: selectedServices[srv.id] ? '#1E293B' : '#475569' }}>
                            {srv.name}
                          </span>
                        </label>
                      ))}
                      {services.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '10px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                          No services available.
                        </div>
                      )}
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '15px 25px', borderTop: '1px solid #F1F5F9', background: '#fff', borderRadius: '0 0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 700, cursor: 'pointer' }} disabled={isSaving}>Cancel</button>
              <PrimaryButton 
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className={styles.spinner} style={{ width: '16px', height: '16px', borderTopColor: '#fff', borderLeftColor: 'transparent', margin: 0 }}></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={16} /> <span>Assign Section</span>
                  </>
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
            
      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteModal && (
        <div className={styles.drawerOverlay} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', width: '360px', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#FEF2F2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <FiTrash2 size={28} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5' }}>
              Are you sure you want to delete this design layout? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '10px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTION DROPDOWN PORTAL ── */}
      {activeActionRow.id && (
        <>
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          <div
            className="action-dropdown-wrapper"
            style={{ position: 'fixed', top: activeActionRow.y, left: activeActionRow.x, transform: 'translateX(-50%)', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', zIndex: 9999, minWidth: '180px', overflow: 'hidden', animation: 'dropdownFadeIn 0.15s ease-out' }}
          >
            <button
              onClick={() => { handleEdit(activeActionRow.design); setActiveActionRow({ id: null, x: 0, y: 0, design: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiEdit size={12} /></span>
              Edit
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setToggleConfirmModal({ isOpen: true, design: activeActionRow.design }); setActiveActionRow({ id: null, x: 0, y: 0, design: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                  <input type="checkbox" checked={activeActionRow.design.status === true} readOnly />
                  <span className={styles.slider}></span>
                </label>
              </div>
              Toggle Status
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { confirmDelete(activeActionRow.design.id); setActiveActionRow({ id: null, x: 0, y: 0, design: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#E53E3E', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiTrash2 size={12} /></span>
              Delete
            </button>
          </div>
        </>
      )}

      {/* ── CONFIRM TOGGLE ── */}
      {toggleConfirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
          <div className={styles.modalContainer} style={{ width: '380px', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0D1B3E' }}>Confirm Status Change</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#718096', lineHeight: 1.5 }}>
              Are you sure you want to toggle the <strong>Status</strong> for design layout "{toggleConfirmModal.design?.name}"?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setToggleConfirmModal({ isOpen: false, design: null })} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                handleToggleStatus(toggleConfirmModal.design.id);
                setToggleConfirmModal({ isOpen: false, design: null });
              }} style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default DesignService;
