import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiGrid, FiArrowRight
} from 'react-icons/fi';
import { 
  setCommonService, 
  setCommonSearchQuery, 
  setCommonRowsPerPage, 
  setCommonCurrentPage,
  setCommonCommissionList
} from '../../../../store/slices/commissionSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import { API } from '../../../../api/endpoints';
import styles from './CommissionSetup.module.css';

const CommissionSetup = () => {
  const dispatch = useDispatch();
  const { 
    selectedService, 
    list, 
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.commission.commonCommission);

  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        const raw = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.data?.items) ? res.data.items
          : Array.isArray(res?.items) ? res.items
          : [];
        const mapped = raw.map(s => ({ id: s.id || s.Id, name: s.name || s.Name || s.serviceName || s.ServiceName || '' })).filter(s => s.name);
        setServices(mapped);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    dispatch(setCommonCommissionList([]));
  }, [dispatch]);

  const filteredList = list.filter(item => 
    item.opName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  return (
    <div className={styles.container}>
      
            <AdminTable
        title="Common Commission Setup"
        rightAction={
          <div className={styles.inlineFilterRow}>
            <div className={styles.inputWrap}>
              <FiGrid className={styles.inputIcon} />
              <SearchableSelect
                value={selectedService}
                onChange={(val) => dispatch(setCommonService(val || ''))}
                options={[
                  { label: 'Select Service', value: '' },
                  ...services.map(s => ({ label: s.name, value: s.id }))
                ]}
                placeholder="Select Service"
                style={{ height: '40px', minWidth: '220px', borderRadius: '8px', padding: '0 12px 0 42px' }}
              />
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
            <td style={{fontWeight: 700, color: '#1756AA'}}>{item.opName}</td>
            <td>{item.startVal}</td>
            <td>{item.endVal}</td>
            <td style={{fontWeight: 800, color: '#27AE60'}}>{item.slab}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setCommonSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { dispatch(setCommonRowsPerPage(val)); dispatch(setCommonCurrentPage(1)); }}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setCommonCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default CommissionSetup;
