import React, { useState, useEffect } from 'react';
import { 
  FiCheck, FiSettings, FiGrid, FiArrowRight, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import MemberSearchSelect from '../../../shared/components/common/MemberSearchSelect';
import ServiceSelectionGrid from '../../../shared/components/common/ServiceSelectionGrid';
import styles from '../MemberPages/MemberPages.module.css';

const AssignService = () => {
  // Master Lists loaded from API
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  
  // Loading & Updating States
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [fetchedMember, setFetchedMember] = useState(null);

  // Filters & Modal
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "alert"
  });

  const showCustomAlert = (title, message) => {
    setModal({
      show: true,
      title,
      message,
      onConfirm: null,
      type: "alert"
    });
  };

  // Fetch categories and services on mount
  useEffect(() => {
    const fetchData = async () => {
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
            checked: false
          }));
          setServices(formatted);
        }
      } catch (err) {
        console.error("Error loading initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleSelectMember = (m) => {
    if (!m) {
      setFetchedMember(null);
      setServices(prev => prev.map(srv => ({ ...srv, checked: false })));
      return;
    }
    setFetchedMember(m);

    // Simulate different assigned services per user
    setServices(prev => prev.map((srv, index) => ({
      ...srv,
      checked: index % 3 === 0
    })));
  };

  const handleToggleService = (id) => {
    setServices(prev => prev.map(srv => 
      srv.id === id ? { ...srv, checked: !srv.checked } : srv
    ));
  };

  // Toggle all filtered services
  const handleSelectAllToggle = () => {
    const filtered = services.filter(srv => {
      if (categoryFilter === "all") return true;
      return srv.sectionType?.toString() === categoryFilter.toString();
    });
    const allFilteredChecked = filtered.length > 0 && filtered.every(srv => srv.checked);
    const targetState = !allFilteredChecked;

    setServices(prev => prev.map(srv => {
      const isFiltered = categoryFilter === "all" || srv.sectionType?.toString() === categoryFilter.toString();
      if (isFiltered) {
        return { ...srv, checked: targetState };
      }
      return srv;
    }));
  };

  const handleUpdate = () => {
    if (!fetchedMember) {
      showCustomAlert("Validation Error", "Please select a Member ID / Username before updating services.");
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccessMsg("Services assigned successfully!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    }, 1500);
  };

  return (
    <div className={styles.container} style={{ padding: '15px 12px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh' }}>
      
      {/* ── MAIN CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(23, 86, 170, 0.1)', color: '#1756AA', borderRadius: '8px' }}>
              <FiSettings style={{ fontSize: '1.1rem' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0D1B3E' }}>Assign Services to Member</h3>
          </div>
        </div>

        {/* CONTENT VIEW AREA */}
        <div style={{ padding: '24px' }}>
           
           {/* CONFIG SECTION */}
           <div className={styles.formGridTwo} style={{ gap: '24px', marginBottom: '30px' }}>
              {/* Member ID searchable dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4E6080', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   <FiCheck style={{ color: '#1756AA' }} /> Member ID / Username *
                 </label>
                 <MemberSearchSelect 
                   value={fetchedMember ? (fetchedMember.memberId || fetchedMember.id) : ""} 
                   onChange={handleSelectMember} 
                   placeholder="Search or Select Member ID..."
                   style={{ height: '44px', width: '100%', borderRadius: '10px' }}
                 />
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4E6080', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   <FiGrid style={{ color: '#1756AA' }} /> Filter Service Category
                 </label>
                 <select 
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   style={{ height: '44px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 16px', color: '#1E293B', fontWeight: 600, outline: 'none', background: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                 >
                    <option value="all">All Services (Show All)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* SERVICES SELECTION GRID */}
           <ServiceSelectionGrid 
             services={services} 
             categoryFilter={categoryFilter} 
             onToggleService={handleToggleService} 
             onSelectAllToggle={handleSelectAllToggle}
           />

           {/* ACTIONS BUTTONS AND MESSAGES */}
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <button 
                disabled={isUpdating}
                onClick={handleUpdate}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: isUpdating ? '#60A5FA' : '#1756AA', 
                  color: '#fff', border: 'none', borderRadius: '10px', 
                  padding: '14px 28px', fontSize: '0.9rem', fontWeight: 800, 
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(23, 86, 170, 0.2)' 
                }}
              >
                 {isUpdating ? <FiRefreshCw className="global-spin" /> : <FiCheck />} 
                 <span>{isUpdating ? 'Updating...' : 'Update Assigned Services'}</span> 
                 {!isUpdating && <FiArrowRight />}
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

      {/* ── CUSTOM PREMIUM POPUP MODAL ── */}
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
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', margin: '0 auto 16px auto'
            }}>
              <FiInfo />
            </div>
            
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>
              {modal.title}
            </h4>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: '#64748B', fontWeight: 600, lineHeight: '1.4' }}>
              {modal.message}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setModal({ ...modal, show: false })}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: '#1756AA', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                }}
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

export default AssignService;
