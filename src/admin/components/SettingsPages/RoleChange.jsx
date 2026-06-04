import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiDatabase, FiX, FiCheck, FiUser, FiRefreshCw, FiArrowRight, FiChevronDown
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';

const RoleChange = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchedMember, setFetchedMember] = useState(null);
  
  const [roles, setRoles] = useState([]);
  const [packages, setPackages] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    roleId: '',
    packageId: '',
    idChange: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await API.getRoles();
        if (rolesRes && Array.isArray(rolesRes)) setRoles(rolesRes);
        else if (rolesRes && rolesRes.data) setRoles(rolesRes.data);

        const pkgRes = await API.package.getAll();
        if (pkgRes && pkgRes.status === true && Array.isArray(pkgRes.data)) setPackages(pkgRes.data);
      } catch (err) {
        console.error("Error fetching roles/packages", err);
      }
    };
    fetchData();
  }, []);

  const mockMembers = [
    { id: 'Pay99RT4002', name: 'vipin soni', parent: 'vivek varshney MDT8597', role: 'Retailer' },
    { id: 'Pay99RT5005', name: 'rahul kumar', parent: 'admin ADM001', role: 'Distributor' }
  ];

  const filteredMembers = mockMembers.filter(m => m.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectMember = (member) => {
    setSearchTerm(member.id);
    setFetchedMember(member);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (e.target.value === '') {
      setFetchedMember(null);
    }
  };

  const handleChangeRole = () => {
    if (!fetchedMember || !formData.roleId) return;
    
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setFetchedMember(prev => ({
        ...prev,
        role: roles.find(r => r.id.toString() === formData.roleId)?.name || 'Updated Role'
      }));
      setIsLoading(false);
      setSuccessMessage('Role changed successfully!');
      
      // Clear message after 3 seconds
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
        <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            
            {/* Member ID Autocomplete */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Member ID :</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Search Member ID..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  style={{ width: '100%', padding: '10px 35px 10px 15px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', color: '#334155', boxSizing: 'border-box' }}
                />
                <FiChevronDown style={{ position: 'absolute', right: '12px', color: '#64748B', pointerEvents: 'none' }} />
              </div>
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', marginTop: '4px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => handleSelectMember(m)}
                        style={{ padding: '10px 15px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{m.id}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.name}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '10px 15px', color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center' }}>No member found</div>
                  )}
                </div>
              )}
            </div>

            {/* Role Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Role</label>
              <select 
                value={formData.roleId}
                onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', color: '#334155', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">Select Role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Package Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Package</label>
              <select 
                value={formData.packageId}
                onChange={(e) => setFormData({...formData, packageId: e.target.value})}
                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', color: '#334155', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">Select Package</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* ID Change Checkbox */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>ID Change(Yes/No)</label>
              <div style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', height: '42px', boxSizing: 'border-box' }}>
                <input 
                  type="checkbox" 
                  checked={formData.idChange}
                  onChange={(e) => setFormData({...formData, idChange: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

          </div>

          <div>
            <button 
              onClick={handleChangeRole}
              disabled={isLoading || !fetchedMember || !formData.role}
              style={{ 
                background: (isLoading || !fetchedMember || !formData.role) ? '#FCA5A5' : '#EF4444', 
                color: '#fff', border: 'none', borderRadius: '8px', 
                padding: '10px 24px', fontSize: '0.95rem', fontWeight: 700, 
                cursor: (isLoading || !fetchedMember || !formData.role) ? 'not-allowed' : 'pointer',
                boxShadow: (isLoading || !fetchedMember || !formData.role) ? 'none' : '0 4px 10px rgba(239, 68, 68, 0.3)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <FiRefreshCw className="global-spin" /> Changing...
                </>
              ) : (
                'ChangeRole'
              )}
            </button>
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
            rows={fetchedMember ? [[1, fetchedMember.id, fetchedMember.name, fetchedMember.role, fetchedMember.parent.replace(/\s+/g, ' ')]] : []}
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
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9', fontWeight: 700 }}>{fetchedMember.id}</td>
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9' }}>{fetchedMember.name}</td>
                  <td style={{ padding: '15px', color: '#3B82F6', fontSize: '0.9rem', borderRight: '1px solid #F1F5F9', fontWeight: 800 }}>
                    <span style={{ background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>{fetchedMember.role}</span>
                  </td>
                  <td style={{ padding: '15px', color: '#334155', fontSize: '0.9rem' }}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                       {fetchedMember.parent.split(' ').map((p, i) => <div key={i}>{p}</div>)}
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
        <div style={{ padding: '15px 25px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            Showing {fetchedMember ? '1 to 1 of 1' : '0 to 0 of 0'} entries
          </div>
          <div style={{ display: 'flex', gap: '5px', fontSize: '0.9rem', color: '#3B82F6', cursor: 'pointer' }}>
             <span>Previous</span>
             <span style={{ margin: '0 5px' }}>{fetchedMember ? '1' : '0'}</span>
             <span>Next</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleChange;
