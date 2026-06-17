import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import { 
  FiChevronLeft, FiChevronRight, FiCheck, FiUser, FiRefreshCw, FiSearch
} from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import MemberSearchSelect from '../../../shared/components/common/MemberSearchSelect';
import RoleSelect from '../../../shared/components/common/RoleSelect';
import PackageSelect from '../../../shared/components/common/PackageSelect';
import styles from '../MemberPages/MemberPages.module.css';

const RoleChange = () => {
  const [fetchedMember, setFetchedMember] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    roleId: '',
    packageId: '',
    idChange: false
  });

  // Fetch roles list initially for mapping in detectRole
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesRes = await API.getRoles();
        if (rolesRes && Array.isArray(rolesRes)) setRoles(rolesRes);
        else if (rolesRes && rolesRes.data) setRoles(rolesRes.data);
      } catch (err) {
        console.error("Error loading roles in RoleChange:", err);
      }
    };
    fetchRoles();
  }, []);

  const detectRole = (member, rolesList) => {
    if (!member) return { roleName: '', roleId: '' };
    
    // 1. If we already have a matched role in rolesList via member.roleId
    if (member.roleId) {
      const found = rolesList.find(r => r.id.toString() === member.roleId.toString());
      if (found) return { roleName: found.name, roleId: found.id };
    }

    // 2. If member has a roleName/role string, let's find it in rolesList
    const roleStr = member.role || member.roleName;
    if (roleStr && rolesList.length > 0) {
      const found = rolesList.find(r => r.name.toLowerCase() === roleStr.toLowerCase());
      if (found) return { roleName: found.name, roleId: found.id };
    }

    // 3. Fallback to parsing memberId prefix
    const mid = (member.memberId || member.id || '').toUpperCase();
    let detectedRoleName = '';
    if (mid.includes('RT')) {
      detectedRoleName = 'Retailer';
    } else if (mid.includes('MDT')) {
      detectedRoleName = 'Master Distributor';
    } else if (mid.includes('DT')) {
      detectedRoleName = 'Distributor';
    } else if (mid.includes('API')) {
      detectedRoleName = 'API User';
    } else {
      detectedRoleName = 'Retailer'; // Default fallback
    }

    if (rolesList.length > 0) {
      const found = rolesList.find(r => r.name.toLowerCase().replace(/\s+/g, '') === detectedRoleName.toLowerCase().replace(/\s+/g, ''));
      if (found) return { roleName: found.name, roleId: found.id };
    }

    return { roleName: detectedRoleName, roleId: '' };
  };

  const handleSelectMember = (member) => {
    if (!member) {
      setFetchedMember(null);
      setFormData({ roleId: '', packageId: '', idChange: false });
      return;
    }
    const detected = detectRole(member, roles);
    const updatedMember = {
      ...member,
      role: detected.roleName,
      roleId: detected.roleId || member.roleId
    };
    setFetchedMember(updatedMember);
    setFormData({
      roleId: detected.roleId ? detected.roleId.toString() : '',
      packageId: member.packageId ? member.packageId.toString() : '',
      idChange: false
    });
  };

  const handleChangeRole = () => {
    if (!fetchedMember || !formData.roleId) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const newRoleName = roles.find(r => r.id.toString() === formData.roleId.toString())?.name || 'Updated Role';
      setFetchedMember(prev => ({
        ...prev,
        role: newRoleName,
        roleId: formData.roleId
      }));
      setIsLoading(false);
      setSuccessMessage('Role changed successfully!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className={styles.container} style={{ padding: '20px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh' }}>
      
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#fff' }}>
        {/* HEADER */}
        <div style={{ padding: '6px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '34px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Role Change</h3>
          {successMessage && (
            <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCheck size={16} /> {successMessage}
            </div>
          )}
        </div>

        {/* TOP FORM */}
        <div style={{ padding: '20px 25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'flex-end' }}>
            
            {/* Member ID Autocomplete */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Member ID :</label>
              <MemberSearchSelect 
                value={fetchedMember ? (fetchedMember.memberId || fetchedMember.id) : ""} 
                onChange={handleSelectMember} 
                placeholder="Search Member ID..."
                style={{ height: '42px' }}
              />
            </div>

            {/* Role Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Role</label>
              <RoleSelect 
                value={formData.roleId} 
                onChange={(val) => setFormData({...formData, roleId: val})}
                placeholder="Select Role"
                style={{ padding: '0 15px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', color: '#334155', background: '#fff', cursor: 'pointer', height: '42px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Package Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Package</label>
              <PackageSelect 
                value={formData.packageId}
                onChange={(val) => setFormData({...formData, packageId: val})}
                placeholder="Select Package"
                style={{ padding: '0 15px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', color: '#334155', background: '#fff', cursor: 'pointer', height: '42px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* ID Change Checkbox */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>ID Change(Yes/No)</label>
              <div style={{ padding: '0 15px', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', height: '42px', width: '100%', boxSizing: 'border-box', background: '#fff' }}>
                <input 
                  type="checkbox" 
                  checked={formData.idChange}
                  onChange={(e) => setFormData({...formData, idChange: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <button 
                onClick={handleChangeRole}
                disabled={isLoading || !fetchedMember || !formData.roleId}
                style={{ 
                  background: (isLoading || !fetchedMember || !formData.roleId) ? '#94A3B8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                  color: '#fff', border: 'none', borderRadius: '8px', 
                  padding: '0 24px', fontSize: '0.9rem', fontWeight: 700, 
                  cursor: (isLoading || !fetchedMember || !formData.roleId) ? 'not-allowed' : 'pointer',
                  boxShadow: (isLoading || !fetchedMember || !formData.roleId) ? 'none' : '0 4px 10px rgba(34, 197, 94, 0.3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  height: '42px', width: '100%', transition: 'all 0.3s', boxSizing: 'border-box'
                }}
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="global-spin" /> Changing...
                  </>
                ) : (
                  'Change Role'
                )}
              </button>
            </div>

          </div>
        </div>

        {/* TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '15px 25px', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>Show</span>
            <select className={styles.selectEntries} style={{ borderRadius: '6px', border: '1px solid #CBD5E1', padding: '4px 8px' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>rows</span>
          </div>

          <ExportButtons 
            headers={['SL', 'MemberID', 'Name', 'Role', 'ParentID']}
            rows={fetchedMember ? [[1, fetchedMember.memberId || fetchedMember.id, fetchedMember.name, fetchedMember.role, (fetchedMember.parent || '').replace(/\s+/g, ' ')]] : []}
            fileNamePrefix="role_change_report"
            sheetName="Role Change"
          />

          <div className="global-search-box" style={{ maxWidth: '300px', margin: 0 }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search..." 
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper} style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <table className={styles.table} style={{ width: '100%', minWidth: '800px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '80px', padding: '15px', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>SL</th>
                <th style={{ width: '220px', padding: '15px', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.1)' }}>MemberID</th>
                <th style={{ width: '220px', padding: '15px', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Name</th>
                <th style={{ width: '150px', padding: '15px', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Role</th>
                <th style={{ padding: '15px', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left' }}>ParentID</th>
              </tr>
            </thead>
            <tbody>
              {fetchedMember ? (
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9' }}>1</td>
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9', fontWeight: 700 }}>{fetchedMember.memberId || fetchedMember.id}</td>
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9' }}>{fetchedMember.name}</td>
                  <td style={{ padding: '15px', color: '#3B82F6', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9', fontWeight: 800 }}>
                    <span style={{ background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>{fetchedMember.role}</span>
                  </td>
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem' }}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                       {(fetchedMember.parent || '').split(' ').map((p, i) => <div key={i}>{p}</div>)}
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '0.95rem', fontWeight: 600 }}>
                    <FiUser size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <br />
                    Please search and select a member to view details.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="global-pagination" style={{ padding: '15px 25px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            Showing {fetchedMember ? '1 to 1 of 1' : '0 to 0 of 0'} entries
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiChevronLeft />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#0D1B5E', color: '#fff', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
              {fetchedMember ? '1' : '0'}
            </div>
            <button className="global-page-btn" disabled style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiChevronRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleChange;
