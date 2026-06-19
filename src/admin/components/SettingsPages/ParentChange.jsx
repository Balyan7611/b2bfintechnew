import React, { useState, useEffect } from 'react';
import { 
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiCheck, FiUser, FiSearch
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import { API } from '../../../api/endpoints';
import MemberSearchSelect from '../../../shared/components/common/MemberSearchSelect';
import RoleSelect from '../../../shared/components/common/RoleSelect';
import styles from '../MemberPages/MemberPages.module.css';

const ParentChange = () => {
  const [fetchedMember, setFetchedMember] = useState(null);
  const [fetchedParent, setFetchedParent] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roles, setRoles] = useState([]);

  // Saving & Status
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // List of Parent Changes
  const [changesList, setChangesList] = useState([]);

  // Load Roles on Mount (for name mapping in handleSave)
  const fetchData = async () => {
    try {
      const rolesRes = await API.getRoles();
      if (rolesRes && Array.isArray(rolesRes)) setRoles(rolesRes);
      else if (rolesRes && rolesRes.data) setRoles(rolesRes.data);

      const parentChangesRes = await API.parentChangeInformation.getAll();
      if (parentChangesRes && parentChangesRes.data) {
        setChangesList(parentChangesRes.data);
      } else if (Array.isArray(parentChangesRes)) {
        setChangesList(parentChangesRes);
      }
    } catch (err) {
      console.error("Error fetching data in ParentChange", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectMember = (m) => {
    if (!m) {
      setFetchedMember(null);
      setSelectedRoleId("");
      return;
    }
    setFetchedMember(m);
    
    // Auto-detect role
    if (m.roleId) {
      setSelectedRoleId(m.roleId.toString());
    } else {
      const matchedRole = roles.find(r => r.name.toLowerCase() === (m.role || "").toLowerCase());
      if (matchedRole) {
        setSelectedRoleId(matchedRole.id.toString());
      } else {
        setSelectedRoleId("");
      }
    }
  };

  const handleSelectParent = (p) => {
    setFetchedParent(p);
  };

  const handleSave = async () => {
    if (!fetchedMember) return;
    setIsSaving(true);
    
    try {
      const payload = {
        id: 0,
        msrno: parseInt(fetchedMember.id || 0),
        previousRoleId: parseInt(fetchedMember.roleId || 0),
        currentRoleId: parseInt(selectedRoleId || 0),
        previousParentId: parseInt(fetchedMember.parentId || 0),
        currentParentId: fetchedParent ? parseInt(fetchedParent.id || 0) : 0,
        isDelete: false
      };

      await API.parentChangeInformation.create(payload);
      
      setSuccessMsg("Parent change updated successfully!");
      fetchData(); // Refresh list from backend
      
      setTimeout(() => setSuccessMsg(""), 3000);
      
      // Reset form
      setFetchedMember(null);
      setFetchedParent(null);
      setSelectedRoleId("");
    } catch (error) {
      console.error("Error saving parent change:", error);
      alert("Failed to save parent change. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '15px 10px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh' }}>
      
      {/* ── FORM CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 25px rgba(0,0,0,0.03)', borderRadius: '16px', marginBottom: '20px', background: '#fff' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>Parent Change</h3>
        </div>

        <div style={{ padding: '15px 20px' }}>
           {/* 4 Fields Grid - Single Row on Large Screen */}
           <div className={styles.formGrid4} style={{ gap: '20px', marginBottom: '20px', alignItems: 'end' }}>
              
              {/* Member ID searchable dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>MemberID</label>
                 <MemberSearchSelect 
                   value={fetchedMember ? (fetchedMember.memberId || fetchedMember.id) : ""}
                   onChange={handleSelectMember}
                   placeholder="Search or Select Member ID..."
                   style={{ height: '42px' }}
                 />
              </div>

              {/* Current Parent ID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Current ParentID</label>
                 <div style={{ 
                   padding: '0 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', 
                   borderRadius: '10px', color: '#64748B', fontSize: '0.95rem', fontWeight: 600, 
                   height: '42px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' 
                 }}>
                   {fetchedMember ? (fetchedMember.parent || 'No Parent') : 'No member selected'}
                 </div>
              </div>

              {/* Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Role</label>
                 <RoleSelect 
                   value={selectedRoleId}
                   onChange={setSelectedRoleId}
                   placeholder="Select Role"
                   style={{ height: '42px' }}
                 />
              </div>

              {/* Parent ID searchable dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>New ParentID</label>
                 <MemberSearchSelect 
                   value={fetchedParent ? (fetchedParent.memberId || fetchedParent.id) : ""}
                   onChange={handleSelectParent}
                   placeholder="Search or Select Parent ID..."
                   style={{ height: '42px' }}
                 />
              </div>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <style>{`
                @keyframes parentChangeSpin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <button 
                onClick={handleSave}
                disabled={isSaving || !fetchedMember}
                style={{ 
                  background: (isSaving || !fetchedMember) ? '#6EE7B7' : '#059669', color: '#fff', border: 'none', 
                  padding: '12px 35px', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, 
                  cursor: (isSaving || !fetchedMember) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
                  boxShadow: (isSaving || !fetchedMember) ? 'none' : '0 6px 16px rgba(5, 150, 105, 0.25)'
                }}
                onMouseOver={e => { if (!isSaving && fetchedMember) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={e => { if (!isSaving && fetchedMember) e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {isSaving && (
                  <div style={{ 
                    width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', 
                    borderTop: '3px solid #fff', borderRadius: '50%', animation: 'parentChangeSpin 0.8s linear infinite' 
                  }} />
                )}
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
              
              {successMsg && (
                <div style={{ 
                  background: '#F0FDF4', color: '#16A34A', padding: '10px 16px', borderRadius: '8px', 
                  fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
                  animation: 'dropdownFadeIn 0.3s ease-out'
                }}>
                  <div style={{ width: '22px', height: '22px', background: '#16A34A', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCheck size={14} />
                  </div>
                  {successMsg}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* ── LIST CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 25px rgba(0,0,0,0.03)', borderRadius: '16px', background: '#fff' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>Parent Change List</h3>
        </div>

        {/* TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '10px 20px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '6px 10px' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box" style={{ maxWidth: '250px' }}>
            <FiSearch />
            <input type="text" placeholder="Search..." style={{ borderRadius: '8px', padding: '8px 12px 8px 35px' }} />
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ width: '100%', minWidth: '1100px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '80px', padding: '15px', textAlign: 'center', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>S. No.</th>
                <th style={{ width: '220px', padding: '15px', textAlign: 'left', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>Member</th>
                <th style={{ width: '150px', padding: '15px', textAlign: 'left', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>Role</th>
                <th style={{ width: '180px', padding: '15px', textAlign: 'left', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>Role After Change</th>
                <th style={{ width: '220px', padding: '15px', textAlign: 'left', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>Parent</th>
                <th style={{ width: '220px', padding: '15px', textAlign: 'left', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>Parent After Change</th>
                <th style={{ width: '150px', padding: '15px', textAlign: 'left', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>AddDate</th>
              </tr>
            </thead>
            <tbody>
              {changesList.length > 0 ? (
                changesList.map((item, idx) => (
                  <tr key={item.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#64748B', padding: '15px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '15px', color: '#1E293B', fontWeight: 700 }}>{item.member}</td>
                    <td style={{ padding: '15px', color: '#64748B', fontWeight: 600 }}>{item.role}</td>
                    <td style={{ padding: '15px', color: '#1756AA', fontWeight: 700 }}>{item.roleAfter}</td>
                    <td style={{ padding: '15px', color: '#64748B', fontWeight: 600 }}>{item.parent}</td>
                    <td style={{ padding: '15px', color: '#1E293B', fontWeight: 700 }}>{item.parentAfter}</td>
                    <td style={{ padding: '15px', color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>{item.addDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '0.95rem', fontWeight: 600 }}>
                    <FiUser size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <br />
                    No parent changes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="global-pagination" style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {changesList.length > 0 ? `1 to ${changesList.length}` : '0 to 0'} of {changesList.length} entries
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#0D1B5E', color: '#fff', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem' }}>
              {changesList.length > 0 ? '1' : '0'}
            </div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentChange;
