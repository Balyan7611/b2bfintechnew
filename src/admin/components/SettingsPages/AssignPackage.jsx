import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import { FiUserCheck, FiPackage, FiCheckSquare, FiChevronRight, FiCheck, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';

// ── Premium Popup Modal Component ──────────────────────────────────────────────
const PopupModal = ({ show, type, title, message, onClose }) => {
  if (!show) return null;

  const config = {
    success: {
      bg: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
      iconBg: '#16A34A',
      titleColor: '#14532D',
      msgColor: '#166534',
      btnBg: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
      btnShadow: 'rgba(22,163,74,0.35)',
      icon: <FiCheck size={22} color="#fff" />,
    },
    error: {
      bg: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
      iconBg: '#EF4444',
      titleColor: '#7F1D1D',
      msgColor: '#991B1B',
      btnBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      btnShadow: 'rgba(239,68,68,0.35)',
      icon: <FiXCircle size={22} color="#fff" />,
    },
    warning: {
      bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEFCE8 100%)',
      iconBg: '#F59E0B',
      titleColor: '#78350F',
      msgColor: '#92400E',
      btnBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      btnShadow: 'rgba(245,158,11,0.35)',
      icon: <FiAlertCircle size={22} color="#fff" />,
    },
  };

  const c = config[type] || config.success;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        width: '380px',
        maxWidth: '92vw',
        boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Coloured top strip */}
        <div style={{ background: c.bg, padding: '28px 28px 20px', textAlign: 'center' }}>
          {/* Icon circle */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: c.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: `0 8px 20px ${c.btnShadow}`
          }}>
            {c.icon}
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800, color: c.titleColor }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: c.msgColor, fontWeight: 500, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        {/* Action button */}
        <div style={{ padding: '16px 28px 22px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: c.btnBg,
              color: '#fff', border: 'none',
              borderRadius: '10px',
              padding: '11px 36px',
              fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${c.btnShadow}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            OK, Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AssignPackage = () => {
  const [packages, setPackages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '' });

  const showPopup = (type, title, message) => setPopup({ show: true, type, title, message });
  const closePopup = () => setPopup(p => ({ ...p, show: false }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await API.getRoles();
        if (rolesRes && Array.isArray(rolesRes)) setRoles(rolesRes);
        else if (rolesRes && rolesRes.data) setRoles(rolesRes.data);

        const pkgRes = await API.package.getAll();
        if (pkgRes && pkgRes.status === true && pkgRes.data) {
          const items = Array.isArray(pkgRes.data.items) ? pkgRes.data.items : (Array.isArray(pkgRes.data) ? pkgRes.data : []);
          setPackages(items);
        } else if (Array.isArray(pkgRes)) {
          setPackages(pkgRes);
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  // Sync selected packages when role or packages change
  useEffect(() => {
    if (selectedRoleId) {
      const matchingIds = packages
        .filter(p => String(p.roleId) === String(selectedRoleId))
        .map(p => p.id);
      setSelectedPackages(matchingIds);
    } else {
      setSelectedPackages([]);
    }
  }, [selectedRoleId, packages]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedPackages(packages.map(p => p.id));
    else setSelectedPackages([]);
  };

  const handleSelectPackage = (pkgId) => {
    if (selectedPackages.includes(pkgId)) {
      setSelectedPackages(selectedPackages.filter(id => id !== pkgId));
    } else {
      setSelectedPackages([...selectedPackages, pkgId]);
    }
  };

  const handleApply = async () => {
    if (!selectedRoleId) {
      showPopup('warning', 'Role Not Selected', 'Please select a role before applying the assignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const promises = [];

      packages.forEach(pkg => {
        const isCurrentlySelected = selectedPackages.includes(pkg.id);
        const isPreviouslyAssigned = String(pkg.roleId) === String(selectedRoleId);

        if (isCurrentlySelected && !isPreviouslyAssigned) {
          promises.push(API.package.update({ ...pkg, roleId: parseInt(selectedRoleId) }));
        } else if (!isCurrentlySelected && isPreviouslyAssigned) {
          promises.push(API.package.update({ ...pkg, roleId: 0 }));
        }
      });

      if (promises.length > 0) {
        await Promise.all(promises);

        // Refresh packages list
        const pkgRes = await API.package.getAll();
        if (pkgRes && pkgRes.status === true && pkgRes.data) {
          const items = Array.isArray(pkgRes.data.items) ? pkgRes.data.items : (Array.isArray(pkgRes.data) ? pkgRes.data : []);
          setPackages(items);
        } else if (Array.isArray(pkgRes)) {
          setPackages(pkgRes);
        }
      }

      showPopup('success', 'Assignment Applied!', 'Package assignments have been saved successfully.');
    } catch (err) {
      console.error("Error applying package assignment", err);
      showPopup('error', 'Assignment Failed', 'Something went wrong while applying the package assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container} style={{ padding: '5px 2px 0px 2px', maxWidth: '100%' }}>

      {/* ── POPUP MODAL ── */}
      <PopupModal
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />

      {/* ── MAIN CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 15px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>
        {/* CARD HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px', minHeight: '34px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Assign Package</h3>
        </div>

        <div style={{ padding: '0 25px 30px 25px' }}>
          {/* ROLE SELECT */}
          <div className={styles.formGroup} style={{ maxWidth: '600px', marginBottom: '35px' }}>
            <label className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUserCheck size={14} /> Select Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className={styles.inputControl}
              style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.9rem' }}
            >
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
                disabled={packages.length === 0}
              />
              <label htmlFor="select-all" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, cursor: 'pointer', margin: 0 }}>Select All</label>
            </div>
          </div>

          {/* CHECKBOX GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '15px', marginBottom: '40px',
            background: '#F8FAFF', padding: '25px',
            borderRadius: '15px', border: '1.5px dashed rgba(23,86,170,0.2)'
          }}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: selectedPackages.includes(pkg.id) ? '#EFF6FF' : '#ffffff',
                  padding: '12px 15px', borderRadius: '10px',
                  border: selectedPackages.includes(pkg.id) ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                  boxShadow: selectedPackages.includes(pkg.id) ? '0 2px 8px rgba(59,130,246,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                <input
                  type="checkbox"
                  id={`pkg-${pkg.id}`}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3B82F6' }}
                  checked={selectedPackages.includes(pkg.id)}
                  onChange={() => {}}
                />
                <label
                  htmlFor={`pkg-${pkg.id}`}
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedPackages.includes(pkg.id) ? '#1D4ED8' : '#4E6080', cursor: 'pointer', margin: 0, flex: 1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {pkg.name}
                </label>
              </div>
            ))}
            {packages.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '10px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                No packages available.
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={handleApply}
              disabled={isSubmitting || !selectedRoleId}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: isSubmitting || !selectedRoleId
                  ? '#CBD5E1'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '12px 24px', fontSize: '0.9rem', fontWeight: 700,
                cursor: isSubmitting || !selectedRoleId ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitting || !selectedRoleId ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} style={{ width: '18px', height: '18px', borderTopColor: '#fff', borderLeftColor: 'transparent', margin: '0px 6px 0px 0px' }}></div>
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <FiCheckSquare size={16} /> <span>Apply Assignment</span> <FiChevronRight />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPackage;
