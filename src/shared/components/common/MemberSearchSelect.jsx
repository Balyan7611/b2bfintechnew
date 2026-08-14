import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import SearchableSelect from './SearchableSelect';

const MemberSearchSelect = ({ value, onChange, roleId, placeholder = "Search or Select Member ID...", style = {} }) => {
  const [allMembers, setAllMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const results = await API.member.search("");
        if (results && Array.isArray(results)) {
          if (roleId) {
            setAllMembers(results.filter(m => m.roleId && parseInt(m.roleId) === parseInt(roleId)));
          } else {
            setAllMembers(results);
          }
        }
      } catch (err) {
        console.error("Error loading initial members in shared select:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, [roleId]);

  return (
    <SearchableSelect
      value={value || ""}
      onChange={(val, opt) => {
        if (onChange) {
          onChange(opt && opt.rawMember ? opt.rawMember : null);
        }
      }}
      options={[
        { label: 'Select Member', value: '', rawMember: null },
        ...allMembers.map(m => {
          const label = `${m.memberId || m.loginId || m.id} - ${m.name || m.userName || ''} [${m.mobile || ''}]`;
          const val = m.loginId || m.mobile || m.memberId || m.id;
          return { label, value: val, rawMember: m };
        })
      ]}
      placeholder={isLoading ? "Loading members..." : placeholder}
      style={{ height: '48px', ...style }}
    />
  );
};

export default MemberSearchSelect;
