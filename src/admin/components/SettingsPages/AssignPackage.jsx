import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import { FiUserCheck, FiPackage, FiCheckSquare, FiChevronRight, FiCheck } from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';

const AssignPackage = () => {
  const [packages, setPackages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  
  const [selectedPackages, setSelectedPackages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await API.getRoles();
        if (rolesRes && Array.isArray(rolesRes)) setRoles(rolesRes);
        else if (rolesRes && rolesRes.data) setRoles(rolesRes.data);

        const pkgRes = await API.package.getAll();
        if (pkgRes && pkgRes.status === true && Array.isArray(pkgRes.data)) setPackages(pkgRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPackages(packages);
    } else {
      setSelectedPackages([]);
    }
  };

  const handleSelectPackage = (pkgId) => {
    if (selectedPackages.includes(pkgId)) {
      setSelectedPackages(selectedPackages.filter(p => p !== pkgId));
    } else {
      setSelectedPackages([...selectedPackages, pkgId]);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 0px 2px', maxWidth: '100%' }}>
      {/* ── MAIN REPOSITORY CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 15px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px', minHeight: '34px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Assign Package</h3>
        </div>

        <div style={{ padding: '0 25px 30px 25px' }}>
          {/* ROLE SELECT */}
          <div className={styles.formGroup} style={{ maxWidth: '600px', marginBottom: '35px' }}>
            <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiUserCheck size={14} /> Select Role</label>
            <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className={styles.inputControl} style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }}>
              <option value="">Select Role</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* PACKAGE SELECTION HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Packages</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <input
                type="checkbox"
                id="select-all"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                checked={selectedPackages.length === packages.length && packages.length > 0}
                onChange={handleSelectAll}
              />
              <label htmlFor="select-all" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, cursor: 'pointer', margin: 0 }}>Select All</label>
            </div>
          </div>

          {/* CHECKBOX GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '40px',
            background: '#F8FAFF',
            padding: '25px',
            borderRadius: '15px',
            border: '1.5px dashed rgba(23, 86, 170, 0.2)'
          }}>
            {packages.map((pkg, idx) => (
              <div key={pkg.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#ffffff',
                padding: '12px 15px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <input
                  type="checkbox"
                  id={`pkg-${pkg.id}`}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={selectedPackages.includes(pkg.id)}
                  onChange={() => handleSelectPackage(pkg.id)}
                />
                <label htmlFor={`pkg-${pkg.id}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4E6080', cursor: 'pointer', margin: 0, flex: 1 }}>
                  {pkg.name}
                </label>
              </div>
            ))}
          </div>

          {/* ACTION BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '12px 24px', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s'
            }}>
              <FiCheckSquare size={16} /> <span>Apply Assignment</span> <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPackage;
