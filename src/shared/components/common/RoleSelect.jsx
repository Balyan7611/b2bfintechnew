import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import SearchableSelect from './SearchableSelect';

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
    <SearchableSelect
      value={value || ""}
      onChange={onChange}
      options={[
        { label: 'All Roles', value: '' },
        ...roles.map(r => ({ label: r.name, value: r.id }))
      ]}
      placeholder={placeholder}
      style={{ height: '48px', ...style }}
    />
  );
};

export default RoleSelect;
