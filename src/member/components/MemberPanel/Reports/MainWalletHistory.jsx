import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  setMainWalletList, 
  updateMainWalletFilters, 
  setMainWalletSearchQuery, 
  setMainWalletRowsPerPage, 
  setMainWalletCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const MainWalletHistory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');
  const { 
    list, 
    filters,
    searchQuery, 
    rowsPerPage, 
    currentPage 
  } = useSelector(state => state.report.mainWalletReport);

  useEffect(() => {
    const dummyData = [
      { id: 1, member: 'RT1236 (Sachin Balyan)', opening: '1000.00', amount: '500.00', factor: 'Credit', surcharge: '0.00', gst: '0.00', tds: '0.00', commission: '10.00', closing: '1510.00', narration: 'Fund Transferred', date: '2026-05-05 10:20' },
      { id: 2, member: 'RT1236 (Sachin Balyan)', opening: '1510.00', amount: '200.00', factor: 'Debit', surcharge: '0.00', gst: '0.00', tds: '0.00', commission: '0.00', closing: '1310.00', narration: 'Recharge Deduction', date: '2026-05-05 14:15' },
    ];
    dispatch(setMainWalletList(dummyData));
  }, [dispatch]);

  const filteredList = list.filter(item => 
    item.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.member.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    'SL', 'MEMBER DETAILS', 'OPENING AMOUNT', 'AMOUNT', 
    'FACTOR', 'SURCHARGE', 'GST', 'TDS', 'COMMISSION', 
    'CLOSING BALANCE', 'NARRATION', 'TRANSFER DATE'
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="E-WALLET HISTORY"
        topContent={
          !isApiPanel ? (
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updateMainWalletFilters({fromDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updateMainWalletFilters({toDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member ID :</label>
                <select className={styles.inputControl} name="memberId" value={filters.memberId} onChange={(e) => dispatch(updateMainWalletFilters({memberId: e.target.value}))}>
                  <option value="">Select Member</option>
                  <option value="RT1236">Sachin Balyan (RT1236)</option>
                </select>
              </div>
              <button className={styles.submitBtn}>Search History</button>
            </div>
          </div>
          ) : null
        }
        columns={columns}
        data={filteredList}
        renderRow={(item, index) => (
          <tr key={item.id}>
            <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
            <td style={{fontWeight: 600, color: '#1756AA'}}>{item.member}</td>
            <td style={{fontWeight: 700}}>₹{item.opening}</td>
            <td style={{fontWeight: '800', color: item.factor === 'Credit' ? '#27ae60' : '#e74c3c'}}>
              {item.factor === 'Credit' ? '+' : '-'}{item.amount}
            </td>
            <td>
               <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: item.factor === 'Credit' ? '#DCFCE7' : '#FEE2E2', color: item.factor === 'Credit' ? '#16A34A' : '#DC2626' }}>
                {item.factor.toUpperCase()}
               </span>
            </td>
            <td>₹{item.surcharge}</td>
            <td>₹{item.gst}</td>
            <td>₹{item.tds}</td>
            <td style={{color: '#27AE60', fontWeight: 700}}>₹{item.commission}</td>
            <td style={{fontWeight: 800}}>₹{item.closing}</td>
            <td style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#718096'}} title={item.narration}>
              {item.narration}
            </td>
            <td style={{fontSize: '0.8rem', color: '#4E6080'}}>{item.date}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setMainWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setMainWalletRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setMainWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default MainWalletHistory;

