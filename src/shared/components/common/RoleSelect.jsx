import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';

const RoleSelect = ({ value, onChange, placeholder = "Select Role", style = {} }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await API.getRoles();
        if (res && Array.isArray(res)) setRoles(res);
        else if (res && res.data) setRoles(res.data);
      } catch (err) {
        console.error("Error loading roles in RoleSelect component:", err);
      }
    };
    fetchRoles();
  }, []);

  return (
    <select 
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ 
        width: '100%', padding: '0 16px', borderRadius: '10px', 
        border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', 
        background: '#fff', height: '48px', cursor: 'pointer', 
        color: '#1E293B', fontWeight: 600, ...style 
      }}
    >
      <option value="">All Roles</option>
      {roles.map(r => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  );
};

export default RoleSelect;
