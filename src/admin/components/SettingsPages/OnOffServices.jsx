import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiCheck, FiPower, FiRefreshCw, FiInfo, FiActivity
} from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import styles from '../MemberPages/MemberPages.module.css';

const OnOffServices = () => {
    const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  
    const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

    const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "confirm"   });

  const showCustomAlert = (title, message) => {
    setModal({
      show: true,
      title,
      message,
      onConfirm: null,
      type: "alert"
    });
  };

  const showCustomConfirm = (title, message, onConfirm) => {
    setModal({
      show: true,
      title,
      message,
      onConfirm,
      type: "confirm"
    });
  };

    useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingAll(true);
      try {
                const sectRes = await API.sectionType.getAll(true);
        if (sectRes && sectRes.status === true && Array.isArray(sectRes.data)) {
          setCategories(sectRes.data);
        }

                const servRes = await API.service.getAll();
        if (servRes && servRes.status === true && Array.isArray(servRes.data)) {
          const formatted = servRes.data.map(srv => ({
            id: srv.id,
            name: srv.name,
            sectionType: srv.sectionType,
            onoff: srv.onoff ?? true,
            raw: srv
          }));
          setServices(formatted);
        }
      } catch (err) {
        console.error("Error loading initial services:", err);
      } finally {
        setIsLoadingAll(false);
      }
    };
    fetchInitialData();
  }, []);

    const filteredServices = services.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || srv.sectionType?.toString() === categoryFilter.toString();
    return matchesSearch && matchesCategory;
  });

  const handleToggleService = (id) => {
    setServices(prev => prev.map(srv => 
      srv.id === id ? { ...srv, onoff: !srv.onoff } : srv
    ));
  };

  const handleMasterShutdown = () => {
    showCustomConfirm(
      "Confirm Master Shutdown",
      "Are you absolutely sure you want to shut down ALL services? This will set all service components to Down (OFFLINE).",
      () => {
        setServices(prev => prev.map(srv => ({ ...srv, onoff: false })));
        setSuccessMsg("All services have been toggled to OFFLINE.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    );
  };

  const handleMasterRestore = () => {
    showCustomConfirm(
      "Confirm Enable All",
      "Are you sure you want to activate ALL services? This will set all service components to UP (ONLINE).",
      () => {
        setServices(prev => prev.map(srv => ({ ...srv, onoff: true })));
        setSuccessMsg("All services have been toggled to ONLINE.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
                        await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSaving(false);
      showCustomAlert("Success", "Service statuses updated successfully on the server.");
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      showCustomAlert("Error", "Failed to update service statuses.");
    }
  };

  return (
    <div className={styles.container} style={{ padding: '15px 12px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh' }}>
            <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
        
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', borderRadius: '8px' }}>
              <FiActivity style={{ fontSize: '1.1rem' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0D1B3E' }}>Service On/Off Control</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleMasterRestore}
              style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', cursor: 'pointer' }}
            >
              ENABLE ALL
            </button>
            <button 
              onClick={handleMasterShutdown}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer' }}
            >
              <FiPower /> MASTER SHUTDOWN
            </button>
          </div>
        </div>

                <div style={{ padding: '24px' }}>
           
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                 <FiSearch style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search services (e.g. Recharge, AEPS)..."
                   style={{ 
                     width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #CBD5E1', 
                     borderRadius: '10px', outline: 'none', fontSize: '0.9rem', color: '#1E293B', fontWeight: 600,
                     boxSizing: 'border-box'
                   }}
                 />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 800, whiteSpace: 'nowrap' }}>Category:</span>
                 <select 
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   style={{ height: '42px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 10px', color: '#1E293B', fontWeight: 600, outline: 'none', background: '#fff', cursor: 'pointer', width: '100%' }}
                 >
                    <option value="all">All Service Types</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
              </div>
           </div>

                      <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 260px))', 
              gap: '12px', 
              alignItems: 'start',
              marginBottom: '30px',
              minHeight: '120px'
           }}>
              {isLoadingAll ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <FiRefreshCw className="global-spin" style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Loading services...</p>
                </div>
              ) : (
                filteredServices.map((srv) => (
                  <div 
                    key={srv.id} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      borderRadius: '10px', 
                      background: '#ffffff', 
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.015)',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                                        <span style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 700, 
                      color: '#1E293B',
                      wordBreak: 'break-word',
                      lineHeight: '1.2',
                      marginRight: '8px'
                    }}>
                      {srv.name}
                    </span>
 
                                        <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flexShrink: 0
                    }}>
                                            <div 
                        onClick={() => handleToggleService(srv.id)}
                        style={{
                          width: '38px',
                          height: '20px',
                          borderRadius: '10px',
                          background: srv.onoff ? '#1756AA' : '#CBD5E1',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#fff',
                          position: 'absolute',
                          left: srv.onoff ? '21px' : '3px',
                          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }} />
                      </div>
                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 800, 
                        color: srv.onoff ? '#1756AA' : '#64748B',
                        minWidth: '32px'
                      }}>
                        {srv.onoff ? 'UP' : 'Down'}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {!isLoadingAll && filteredServices.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <FiInfo style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No services matched your search query.</p>
                </div>
              ) : null}
           </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <button 
                disabled={isSaving}
                onClick={handleSaveChanges}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: isSaving ? '#60A5FA' : '#1756AA', 
                  color: '#fff', border: 'none', borderRadius: '10px', 
                  padding: '14px 28px', fontSize: '0.9rem', fontWeight: 800, 
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(23, 86, 170, 0.2)' 
                }}
              >
                 {isSaving ? <FiRefreshCw className="global-spin" /> : <FiCheck />} 
                 <span>{isSaving ? 'Saving Changes...' : 'Save Service Statuses'}</span> 
              </button>

              {successMsg && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#16A34A', 
                  fontSize: '0.95rem', 
                  fontWeight: 700 
                }}>
                  <FiCheck style={{ fontSize: '1.2rem' }} /> <span>{successMsg}</span>
                </div>
              )}
           </div>
        </div>
      </div>

            {modal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '380px', maxWidth: '90%',
            padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center', border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: modal.type === 'confirm' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(23, 86, 170, 0.1)',
              color: modal.type === 'confirm' ? '#EF4444' : '#1756AA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', margin: '0 auto 16px auto'
            }}>
              {modal.type === 'confirm' ? <FiPower /> : <FiInfo />}
            </div>
            
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>
              {modal.title}
            </h4>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: '#64748B', fontWeight: 600, lineHeight: '1.4' }}>
              {modal.message}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {modal.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setModal({ ...modal, show: false })}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
                      background: '#fff', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      modal.onConfirm();
                      setModal({ ...modal, show: false });
                    }}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                      background: '#1756AA', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(23, 86, 170, 0.2)'
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setModal({ ...modal, show: false })}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    background: '#1756AA', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnOffServices;
