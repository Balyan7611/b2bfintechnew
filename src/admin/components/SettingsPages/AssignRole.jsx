import React, { useRef, useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import { FiChevronDown, FiRefreshCw, FiShield, FiCheck } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

import RoleSelect from '../../../shared/components/common/RoleSelect';

const AssignRole = () => {
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const [selectRole, setSelectRole] = useState('');
  const [downRole, setDownRole] = useState('');
  const [assignedList, setAssignedList] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const outerTimerRef = useRef(null);
  const msgTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (outerTimerRef.current) clearTimeout(outerTimerRef.current);
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    };
  }, []);

    useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const res = await API.getRoles();
        if (res && Array.isArray(res)) {
          setRoles(res);
        } else if (res && res.data && Array.isArray(res.data)) {
          setRoles(res.data);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

    const handleSelectRoleChange = (roleId) => {
    setSelectRole(roleId);
    setDownRole('');

        const selected = roles.find(r => String(r.id) === String(roleId));
    if (!selected) {
      setAssignedList([]);
      return;
    }

        const selectedIndex = roles.findIndex(r => String(r.id) === String(roleId));
    const below = roles.filter((r, idx) => {
      if (selected.typeRole !== undefined && r.typeRole !== undefined) {
        return r.typeRole > selected.typeRole;
      }
      return idx > selectedIndex;
    });

    setAssignedList(below);
  };

  const handleAssign = () => {
    if (!selectRole || !downRole) return;
    setIsAssigning(true);
        if (outerTimerRef.current) clearTimeout(outerTimerRef.current);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    outerTimerRef.current = setTimeout(() => {
      setIsAssigning(false);
      setSuccessMsg('Role assigned successfully!');
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
      msgTimerRef.current = setTimeout(() => setSuccessMsg(''), 3000);
    }, 1200);
  };

  const handleDeleteAssigned = (idToRemove) => {
    setAssignedList(prev => prev.filter(r => String(r.id) !== String(idToRemove)));
  };

  const selectedRoleObj = roles.find(r => String(r.id) === String(selectRole));

  return (
    <div className={styles.container} style={{ padding: '20px', maxWidth: '100%', background: '#F4F7FE', minHeight: '100vh' }}>

      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(13,27,94,0.07)',
        border: '1px solid #F1F5F9', overflow: 'hidden'
      }}>

                <div style={{
          padding: '14px 24px', borderBottom: '1px solid #F1F5F9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0D1B5E 0%, #1a2f8a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiShield size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Assign Down Role</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>
                Configure role hierarchy and assign sub-roles
              </p>
            </div>
          </div>
          {successMsg && (
            <div style={{
              background: '#DCFCE7', color: '#16A34A', padding: '7px 16px',
              borderRadius: '20px', fontSize: '0.83rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <FiCheck size={15} /> {successMsg}
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 640px) {
            .ar-left-panel { flex: 1 1 100% !important; border-right: none !important; padding: 18px 16px !important; }
            .ar-select-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
            .ar-select-grid label { font-size: 0.68rem !important; }
            .ar-select-grid [role="button"] { height: 38px !important; font-size: 0.78rem !important; padding: 0 10px !important; }
            .ar-assign-btn { width: 100% !important; justify-content: center !important; padding: 10px 16px !important; font-size: 0.8rem !important; }
          }
        `}</style>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>

                    <div className="ar-left-panel" style={{
            flex: '0 0 320px', padding: '28px 24px',
            borderRight: '1px solid #F1F5F9',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>

                        <div className="ar-select-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', letterSpacing: '0.02em' }}>
                  Select Role <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <RoleSelect
                  value={selectRole}
                  onChange={handleSelectRoleChange}
                  placeholder="Select Role"
                  style={{ padding: '11px 14px', height: '45px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', letterSpacing: '0.02em' }}>
                  Down Role <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <RoleSelect
                  value={downRole}
                  onChange={setDownRole}
                  placeholder="Select Down Role"
                  style={{
                    padding: '11px 14px',
                    height: '45px',
                    background: !selectRole ? '#F8FAFC' : '#fff',
                    cursor: !selectRole ? 'not-allowed' : 'pointer'
                  }}
                  disabled={!selectRole}
                />
                {!selectRole && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                    Please select a role first
                  </p>
                )}
              </div>
            </div>

                        <button
              className="ar-assign-btn"
              onClick={handleAssign}
              disabled={isAssigning || !selectRole || !downRole}
              style={{
                background: (isAssigning || !selectRole || !downRole)
                  ? '#CBD5E1'
                  : 'linear-gradient(135deg, #0D1B5E 0%, #1a2f8a 100%)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '12px 28px', fontSize: '0.9rem', fontWeight: 800,
                cursor: (isAssigning || !selectRole || !downRole) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: (!isAssigning && selectRole && downRole)
                  ? '0 4px 14px rgba(13,27,94,0.35)' : 'none',
                transition: 'all 0.2s',
                width: 'fit-content'
              }}
            >
              {isAssigning ? <FiRefreshCw className="global-spin" /> : <FiShield size={15} />}
              {isAssigning ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>

                    <div style={{ flex: 1, minWidth: '300px' }}>

                        <div style={{
              padding: '14px 24px', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                {selectedRoleObj
                  ? <>Down roles for <span style={{ color: '#0D1B5E' }}>{selectedRoleObj.name}</span></>
                  : 'Down Role List'}
              </span>
              {assignedList.length > 0 && (
                <span style={{
                  background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px',
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {assignedList.length} roles
                </span>
              )}
            </div>

                        <div style={{
              display: 'grid', gridTemplateColumns: '60px 60px 1fr',
              padding: '10px 24px', background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>S.No</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Del</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Name</div>
            </div>

                        {selectRole && assignedList.length > 0 ? (
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {assignedList.map((role, idx) => (
                  <div
                    key={role.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '60px 60px 1fr',
                      padding: '13px 24px', borderBottom: '1px solid #F1F5F9',
                      alignItems: 'center',
                      background: idx % 2 === 0 ? '#fff' : '#FAFBFF',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0F4FF'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFBFF'}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700 }}>{idx + 1}</div>
                    <div>
                      <button
                        onClick={() => handleDeleteAssigned(role.id)}
                        style={{
                          background: '#FEF2F2', border: '1px solid #FECACA',
                          borderRadius: '7px', width: '30px', height: '30px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.querySelector('svg').style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.querySelector('svg').style.color = '#EF4444'; }}
                        title="Remove"
                      >
                        <FaTrash style={{ color: '#EF4444', fontSize: '0.75rem', transition: 'color 0.2s' }} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 600 }}>
                      {role.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '50px 30px', textAlign: 'center',
                color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: '#F1F5F9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 14px'
                }}>
                  <FiShield size={24} color="#CBD5E1" />
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#64748B' }}>No down roles found</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                  {selectRole ? 'No sub-roles configured for this role.' : 'Select a parent role to see its down roles.'}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignRole;
