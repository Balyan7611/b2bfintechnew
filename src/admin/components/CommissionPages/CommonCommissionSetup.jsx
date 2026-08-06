import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiArrowRight, FiFilter, FiChevronDown
} from 'react-icons/fi';
import {
  setCommonService,
  setCommonSearchQuery,
  setCommonRowsPerPage,
  setCommonCurrentPage
} from '../../../store/slices/commissionSlice';
import AdminTable from '../../../shared/components/common/AdminTable';
import { API } from '../../../api/endpoints';
import styles from './CommonCommissionSetup.module.css';

const CommonCommissionSetup = () => {
  const dispatch = useDispatch();
  const {
    selectedService,
    list,
    searchQuery,
    rowsPerPage,
    currentPage
  } = useSelector(state => state.commission.commonCommission);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const [services, setServices] = useState([]);

  // Load services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await API.service.getAll();
        // Normalize — API may return array directly or wrapped in data/items
        const raw = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.data?.items) ? res.data.items
          : Array.isArray(res?.items) ? res.items
          : [];
        const mapped = raw.map(s => ({ id: s.id || s.Id, name: s.name || s.Name || s.serviceName || s.ServiceName || '' }))
          .filter(s => s.name);
        console.log('[CommissionSetup] services loaded:', mapped);
        setServices(mapped);
      } catch (err) {
        console.error('CommonCommissionSetup: failed to load services', err);
      }
    };
    loadServices();
  }, []);

  // Commission data will be fetched from API based on selected service

  // CLOSE DROPDOWN ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredList = list.filter(item => 
    item.opName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  return (
    <div className={styles.container}>
      
      {/* TABLE CARD WITH INLINE FILTERS */}
      <AdminTable
        title="Common Commission Setup"
        subtitle="View and manage operator-wise commission slabs"
        rightAction={
          <div className={styles.inlineFilterRow}>
            <div className={styles.customDropdown} ref={dropdownRef}>
              <div 
                className={`${styles.dropdownHeader} ${isDropdownOpen ? styles.active : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <FiGrid className={styles.inputIcon} />
                <span className={styles.selectedVal}>
                  {selectedService || 'Select Service'}
                </span>
                <FiChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.rotate : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className={styles.dropdownList}>
                  <div 
                    className={styles.dropdownItem}
                    onClick={() => {
                      dispatch(setCommonService(""));
                      setIsDropdownOpen(false);
                    }}
                  >
                    Select Service
                  </div>
                  {services.length === 0 && (
                    <div className={styles.dropdownItem} style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      Loading services…
                    </div>
                  )}
                  {services.map(s => (
                    <div
                      key={s.id || s.name}
                      className={`${styles.dropdownItem} ${selectedService === s.name ? styles.itemActive : ''}`}
                      onClick={() => {
                        dispatch(setCommonService(s.name));
                        setIsDropdownOpen(false);
                      }}
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className={styles.submitBtn}>
              SUBMIT <FiArrowRight />
            </button>
          </div>
        }
        columns={['SL', 'OPNAME', 'STARTVAL', 'ENDVAL', 'SLAB']}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>{item.opName}</td>
            <td>{item.startVal}</td>
            <td>{item.endVal}</td>
            <td>{item.slab}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setCommonSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setCommonRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setCommonCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default CommonCommissionSetup;
