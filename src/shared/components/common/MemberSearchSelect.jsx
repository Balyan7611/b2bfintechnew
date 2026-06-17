import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import { API } from '../../../api/endpoints';

const MemberSearchSelect = ({ value, onChange, placeholder = "Search or Select Member ID...", style = {} }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const dropdownRef = useRef(null);

  // Sync state if prop changes
  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Load all members initially
  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoadingAll(true);
      try {
        const results = await API.member.search("");
        if (results && Array.isArray(results)) {
          setAllMembers(results);
        }
      } catch (err) {
        console.error("Error loading initial members in shared select:", err);
      } finally {
        setIsLoadingAll(false);
      }
    };
    fetchInitial();
  }, []);

  // Search filter
  useEffect(() => {
    const performSearch = async () => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setMemberList([]);
        return;
      }
      // Avoid infinite loop if selected value matches search term
      if (value === trimmed) return;

      setIsSearching(true);
      try {
        const results = await API.member.search(trimmed);
        if (results && Array.isArray(results)) {
          setMemberList(results);
        }
      } catch (err) {
        console.error("Error searching members in shared select:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounce = setTimeout(performSearch, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (member) => {
    setSearchTerm(member.memberId || member.id);
    setShowDropdown(false);
    if (onChange) {
      onChange(member);
    }
  };

  const activeList = searchTerm.trim() && searchTerm.trim() !== value ? memberList : allMembers;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder={placeholder} 
          value={searchTerm}
          onChange={(e) => { 
            setSearchTerm(e.target.value); 
            setShowDropdown(true); 
            if(!e.target.value && onChange) onChange(null); 
          }}
          onClick={() => setShowDropdown(true)}
          style={{ width: '100%', padding: '0 35px 0 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#fff', height: '38px', boxSizing: 'border-box', ...style }}
        />
        <FiChevronDown 
          onClick={() => setShowDropdown(prev => !prev)}
          style={{ position: 'absolute', right: '12px', color: '#94A3B8', cursor: 'pointer' }} 
        />
      </div>
      {showDropdown && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #CBD5E1', borderRadius: '10px', marginTop: '5px', zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
          {(isSearching || isLoadingAll) ? (
            <div style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.85rem' }}>
              <FiRefreshCw className="global-spin" /> Loading...
            </div>
          ) : null}
          {activeList.length > 0 ? (
            activeList.map(m => (
              <div 
                key={m.memberId || m.id} 
                onClick={() => handleSelect(m)}
                style={{ padding: '10px 15px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{m.memberId || m.id}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.name} {m.mobile ? `(${m.mobile})` : ''}</span>
              </div>
            ))
          ) : (
            !(isSearching || isLoadingAll) && <div style={{ padding: '12px 15px', color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center' }}>No member found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberSearchSelect;
