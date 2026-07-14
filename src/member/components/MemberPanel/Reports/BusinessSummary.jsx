import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter } from 'react-icons/fi';
import { 
  setBusinessList, 
  updateBusinessFilters 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import styles from './AEPSReport.module.css';

const BusinessSummary = () => {
  const dispatch = useDispatch();
  const { list, filters } = useSelector(state => state.report.businessSummary);

  // Load dummy data
  useEffect(() => {
    dispatch(setBusinessList([]));
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateBusinessFilters({ [name]: value }));
  };

  const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
  const totalSurcharge = list.reduce((sum, item) => sum + item.surcharge, 0);
  const totalGst = list.reduce((sum, item) => sum + item.gst, 0);
  const totalTds = list.reduce((sum, item) => sum + item.tds, 0);
  const totalComm = list.reduce((sum, item) => sum + item.commission, 0);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredList = list.filter(item => 
    item.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const columns = [
    'SERVICE',
    <div key="amt">AMOUNT <br/><span style={{fontSize: '0.7rem', opacity: 0.8, fontWeight: 500}}>(Total: ₹{totalAmount.toFixed(2)})</span></div>,
    <div key="sur">SURCHARGE <br/><span style={{fontSize: '0.7rem', opacity: 0.8, fontWeight: 500}}>(Total: ₹{totalSurcharge.toFixed(2)})</span></div>,
    <div key="gst">GST <br/><span style={{fontSize: '0.7rem', opacity: 0.8, fontWeight: 500}}>(Total: ₹{totalGst.toFixed(2)})</span></div>,
    <div key="tds">TDS <br/><span style={{fontSize: '0.7rem', opacity: 0.8, fontWeight: 500}}>(Total: ₹{totalTds.toFixed(2)})</span></div>,
    <div key="comm">CASHBACK/COMMISSION <br/><span style={{fontSize: '0.7rem', opacity: 0.8, fontWeight: 500}}>(Total: ₹{totalComm.toFixed(2)})</span></div>
  ];

  return (
    <div className={styles.container}>
      <AdminTable
        title="BUSINESS SUMMARY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>Select Month:</label>
                <input 
                  type="month" 
                  className={styles.inputControl}
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Select Date:</label>
                <input 
                  type="date" 
                  className={styles.inputControl}
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                />
              </div>
              <button className={styles.submitBtn}>
                Filter Summary
              </button>
            </div>
          </div>
        }
        columns={columns}
        data={filteredList}
        renderRow={(item) => (
          <tr key={item.id}>
            <td style={{fontWeight: '700', color: '#1756AA'}}>{item.service}</td>
            <td style={{fontWeight: 700}}>₹{item.amount.toFixed(2)}</td>
            <td style={{color: '#E74C3C'}}>₹{item.surcharge.toFixed(2)}</td>
            <td>₹{item.gst.toFixed(2)}</td>
            <td>₹{item.tds.toFixed(2)}</td>
            <td style={{color: '#27AE60', fontWeight: 800}}>₹{item.commission.toFixed(2)}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />
    </div>
  );
};

export default BusinessSummary;
