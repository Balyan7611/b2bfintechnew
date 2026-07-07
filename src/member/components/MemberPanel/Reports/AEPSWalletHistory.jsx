import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  setAEPSWalletList, 
  updateAEPSWalletFilters, 
  setAEPSWalletSearchQuery, 
  setAEPSWalletRowsPerPage, 
  setAEPSWalletCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const AEPSWalletHistory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api');
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.aepsWalletReport);

  useEffect(() => {
    const dummyData = [
      { id: 1, member: 'RT1236', name: 'Sachin Balyan', opening: '5000.00', amount: '1000.00', factor: 'Credit', commission: '10.00', tds: '0.50', charge: '0.00', closing: '6009.50', date: '2026-05-05 10:20', desc: 'AEPS Commission', status: 'SUCCESS' },
      { id: 2, member: 'RT1236', name: 'Sachin Balyan', opening: '6009.50', amount: '2000.00', factor: 'Debit', commission: '0.00', tds: '0.00', charge: '5.00', closing: '4004.50', date: '2026-05-05 14:15', desc: 'Wallet Withdrawal', status: 'SUCCESS' },
    ];
    dispatch(setAEPSWalletList(dummyData));
  }, [dispatch]);

  const filteredList = list.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    'SNO', 'MEMBER ID', 'MEMBER NAME', 'OPENING BALANCE', 'AMOUNT', 
    'FACTOR', 'COMMISSION', 'TDS', 'CHARGE', 'CLOSING BALANCE', 
    'DATE', 'DESCRIPTION', 'STATUS'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="AEPS EWALLET SUMMARY"
        topContent={
          !isApiPanel ? (
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updateAEPSWalletFilters({fromDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updateAEPSWalletFilters({toDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member ID :</label>
                <select className={styles.inputControl} name="memberId" value={filters.memberId} onChange={(e) => dispatch(updateAEPSWalletFilters({memberId: e.target.value}))}>
                  <option value="">Select Member</option>
                  <option value="RT1236">Sachin Balyan (RT1236)</option>
                </select>
              </div>
              <button className={styles.submitBtn}>Filter Records</button>
            </div>
          </div>
          ) : null
        }
        columns={columns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{fontWeight: 700, color: '#1756AA'}}>{item.member}</td>
            <td style={{fontWeight: 600}}>{item.name}</td>
            <td>₹{item.opening}</td>
            <td style={{fontWeight: '800', color: item.factor === 'Credit' ? '#27ae60' : '#e74c3c'}}>
              {item.factor === 'Credit' ? '+' : '-'}{item.amount}
            </td>
            <td>
               <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: item.factor === 'Credit' ? '#DCFCE7' : '#FEE2E2', color: item.factor === 'Credit' ? '#16A34A' : '#DC2626' }}>
                {item.factor.toUpperCase()}
               </span>
            </td>
            <td style={{color: '#27AE60', fontWeight: 700}}>₹{item.commission}</td>
            <td>₹{item.tds}</td>
            <td>₹{item.charge}</td>
            <td style={{fontWeight: 800}}>₹{item.closing}</td>
            <td style={{fontSize: '0.8rem', color: '#4E6080'}}>{item.date}</td>
            <td style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#718096'}} title={item.desc}>
              {item.desc}
            </td>
            <td>
              <span className={`${styles.statusBadge} ${item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}`}>
                {item.status}
              </span>
            </td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setAEPSWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setAEPSWalletRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setAEPSWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default AEPSWalletHistory;
