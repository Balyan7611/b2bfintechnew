import React, { useEffect } from 'react';
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

  // Mock services list
  const services = [
    'Prepaid Mobile', 'Postpaid Mobile', 'DTH', 'Electricity', 
    'Gas', 'Water', 'Insurance', 'DMT', 'AEPS'
  ];

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
      
      {/* TABLE CARD WITH INLINE FILTERS */}
      <AdminTable
        title="Common Commission Setup"
        rightAction={
          <div className={styles.inlineFilterRow}>
            <div className={styles.inputWrap}>
              <FiGrid className={styles.inputIcon} />
              <select 
                className={styles.selectControl}
                value={selectedService}
                onChange={(e) => dispatch(setCommonService(e.target.value))}
              >
                <option value="">Select Service</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
        onRowsPerPageChange={(val) => dispatch(setCommonRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setCommonCurrentPage(val))}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default CommissionSetup;
