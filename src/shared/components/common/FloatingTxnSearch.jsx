import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { API } from '../../../api/endpoints';
import ReceiptModal from './ReceiptModal';
import styles from './FloatingTxnSearch.module.css';

const FloatingTxnSearch = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTxnId, setSearchTxnId] = useState('');
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnResult, setTxnResult] = useState(null);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close search expand on outside click
  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    };
    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutsideSearch);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, [isSearchExpanded]);

  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleTxnSearchSubmit = async () => {
    const trimmedId = searchTxnId.trim();
    if (!trimmedId) return;
    
    try {
      const res = await API.transaction.search({
        searchTerm: trimmedId,
        pageNumber: 1,
        pageSize: 1
      });
      
      if (res && res.status !== false) {
        const payload = res.data || res;
        const item = payload.items && payload.items[0];
        if (item) {
          setTxnResult(item);
          setTxnModalOpen(true);
        } else {
          alert('No transaction found with this ID.');
        }
      } else {
        alert('No transaction found with this ID.');
      }
    } catch (err) {
      console.error('Floating Transaction Search error:', err);
      alert('Error performing transaction search.');
    } finally {
      setIsSearchExpanded(false);
      setSearchTxnId('');
    }
  };

  return (
    <>
      <div 
        ref={searchContainerRef}
        className={`${styles.searchFloatingContainer} ${isSearchExpanded ? styles.expanded : ''}`}
        onClick={() => {
          if (!isSearchExpanded) {
            setIsSearchExpanded(true);
          }
        }}
      >
        <div className={styles.searchIconWrapper}>
          <FaSearch className={styles.searchIconLiquid} />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Enter TXN ID..."
          value={searchTxnId}
          onChange={(e) => setSearchTxnId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTxnSearchSubmit();
            } else if (e.key === 'Escape') {
              setIsSearchExpanded(false);
            }
          }}
          className={styles.searchBarInput}
          style={{
            opacity: isSearchExpanded ? 1 : 0,
            width: isSearchExpanded ? '200px' : '0px',
            transition: 'opacity 0.2s ease, width 0.3s ease',
            pointerEvents: isSearchExpanded ? 'auto' : 'none'
          }}
        />

        {isSearchExpanded && (
          <button 
            className={styles.searchCloseBtn} 
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchExpanded(false);
              setSearchTxnId('');
            }}
          >
            <FaTimes />
          </button>
        )}
      </div>

      <ReceiptModal 
        isOpen={txnModalOpen} 
        onClose={() => setTxnModalOpen(false)} 
        data={txnResult} 
      />
    </>
  );
};

export default FloatingTxnSearch;
