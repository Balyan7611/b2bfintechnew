import React, { useState, useMemo } from 'react';
import { 
  FiSearch, FiTrendingUp, FiActivity, FiArrowRight, FiPercent, FiBriefcase, FiDollarSign, FiCalendar, FiChevronLeft, FiChevronRight, FiGrid
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaRegMoneyBillAlt 
} from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';

const INITIAL_MOCK_DATA = [
  { id: 1, service: 'UPI Transfer', totalBusiness: 4500000.00, totalCommission: 45000.00, totalSurcharge: 15000.00, totalTds: 2250.00, totalCr: 4500000.00, totalDr: 4515000.00, success: 8500, pending: 15, failed: 85, refund: 50, totalTxn: 8650, totalProfit: 27750.00 },
  { id: 2, service: 'AEPS Cash Withdrawal', totalBusiness: 3200000.00, totalCommission: 38400.00, totalSurcharge: 0.00, totalTds: 1920.00, totalCr: 3238400.00, totalDr: 3200000.00, success: 4200, pending: 8, failed: 120, refund: 30, totalTxn: 4358, totalProfit: 36480.00 },
  { id: 3, service: 'DMT (Money Transfer)', totalBusiness: 2800000.00, totalCommission: 14000.00, totalSurcharge: 28000.00, totalTds: 700.00, totalCr: 2814000.00, totalDr: 2828000.00, success: 2800, pending: 12, failed: 95, refund: 40, totalTxn: 2947, totalProfit: 13300.00 },
  { id: 4, service: 'Mobile Recharge', totalBusiness: 850000.00, totalCommission: 25500.00, totalSurcharge: 0.00, totalTds: 1275.00, totalCr: 875500.00, totalDr: 850000.00, success: 3850, pending: 4, failed: 45, refund: 20, totalTxn: 3919, totalProfit: 24225.00 },
  { id: 5, service: 'BBPS Bill Payment', totalBusiness: 650000.00, totalCommission: 3250.00, totalSurcharge: 650.00, totalTds: 162.50, totalCr: 653900.00, totalDr: 650650.00, success: 1250, pending: 3, failed: 12, refund: 5, totalTxn: 1270, totalProfit: 2437.50 },
  { id: 6, service: 'Credit Card Bill Pay', totalBusiness: 350000.00, totalCommission: 1750.00, totalSurcharge: 3500.00, totalTds: 87.50, totalCr: 351750.00, totalDr: 353500.00, success: 180, pending: 1, failed: 8, refund: 2, totalTxn: 191, totalProfit: 1312.50 },
  { id: 7, service: 'NSDL PAN Card', totalBusiness: 100000.00, totalCommission: 5000.00, totalSurcharge: 0.00, totalTds: 250.00, totalCr: 105000.00, totalDr: 100000.00, success: 912, pending: 2, failed: 10, refund: 5, totalTxn: 929, totalProfit: 4750.00 },
];

const BusinessSummary = () => {
  const [dataList, setDataList] = useState(INITIAL_MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Filter logic
  const filteredData = useMemo(() => {
    return dataList.filter(item => 
      item.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dataList, searchQuery]);

  // Aggregate totals for KPI cards
  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => ({
      business: acc.business + item.totalBusiness,
      profit: acc.profit + item.totalProfit,
      commission: acc.commission + item.totalCommission,
      surcharge: acc.surcharge + item.totalSurcharge,
      txns: acc.txns + item.totalTxn,
      tds: acc.tds + item.totalTds,
      cr: acc.cr + item.totalCr,
      dr: acc.dr + item.totalDr,
      success: acc.success + item.success,
      pending: acc.pending + item.pending,
      failed: acc.failed + item.failed,
      refund: acc.refund + item.refund,
    }), { business: 0, profit: 0, commission: 0, surcharge: 0, txns: 0, tds: 0, cr: 0, dr: 0, success: 0, pending: 0, failed: 0, refund: 0 });
  }, [filteredData]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentEntries = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));

  // CSV/Excel exports header definition
  const tableHeaders = [
    'S.NO', 'SERVICE', 'TOTAL BUSINESS', 'TOTAL COMMISSION', 'TOTAL SURCHARGE', 'TOTAL TDS', 
    'TOTAL CR', 'TOTAL DR', 'SUCCESS', 'PENDING', 'FAILED', 'REFUND', 'TOTAL TXN', 'TOTAL PROFIT'
  ];

  const exportRows = useMemo(() => {
    return filteredData.map((item, idx) => [
      idx + 1,
      item.service,
      item.totalBusiness.toFixed(2),
      item.totalCommission.toFixed(2),
      item.totalSurcharge.toFixed(2),
      item.totalTds.toFixed(2),
      item.totalCr.toFixed(2),
      item.totalDr.toFixed(2),
      item.success,
      item.pending,
      item.failed,
      item.refund,
      item.totalTxn,
      item.totalProfit.toFixed(2)
    ]);
  }, [filteredData]);

  return (
    <div className={styles.container} style={{ padding: '5px 2px 60px 2px', maxWidth: '100%' }}>
      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin: 8px 8px 16px 8px;
        }
        .kpi-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
        }
        .kpi-title {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          margin: 2px 0 0;
          font-size: 0.88rem;
          font-weight: 850;
          color: #0F172A;
          white-space: nowrap;
        }
        .kpi-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -2px;
        }
        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      
      {/* ── KPI METRICS PANEL (5 premium transparent cards) ── */}
      <div className="kpi-grid">
        
        {/* Card 1: Total Business Volume */}
        <div className="kpi-card">
          <div>
            <span className="kpi-title">Total Business</span>
            <h3 className="kpi-value">₹{totals.business.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <FiBriefcase size={13} />
          </div>
        </div>

        {/* Card 2: Total Net Profit */}
        <div className="kpi-card">
          <div>
            <span className="kpi-title">Total Profit</span>
            <h3 className="kpi-value">₹{totals.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <FiTrendingUp size={13} />
          </div>
        </div>

        {/* Card 3: Total Commission */}
        <div className="kpi-card">
          <div>
            <span className="kpi-title">Total Commission</span>
            <h3 className="kpi-value">₹{totals.commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
            <FiPercent size={13} />
          </div>
        </div>

        {/* Card 4: Total Surcharge */}
        <div className="kpi-card">
          <div>
            <span className="kpi-title">Total Surcharge</span>
            <h3 className="kpi-value">₹{totals.surcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <FaRegMoneyBillAlt size={13} />
          </div>
        </div>

        {/* Card 5: Total Transactions */}
        <div className="kpi-card">
          <div>
            <span className="kpi-title">Total Txns</span>
            <h3 className="kpi-value">{totals.txns.toLocaleString('en-IN')}</h3>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6' }}>
            <FiActivity size={13} />
          </div>
        </div>

      </div>

      {/* ── MAIN BUSINESS DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ margin: '8px 8px 60px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px', background: '#fff' }}>
        
        {/* TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '15px 20px', borderBottom: 'none' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <ExportButtons
              headers={tableHeaders}
              rows={exportRows}
              fileNamePrefix="business_summary_report"
              sheetName="Business Summary"
            />
          </div>

          <div className="global-search-box" style={{ maxWidth: '300px' }}>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search by service name..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className={styles.tableWrapper} style={{ marginTop: '0px' }}>
          <table className={styles.table} style={{ width: '100%', minWidth: '1350px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px' }}>S.NO</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'left' }}>SERVICE NAME</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL BUSINESS</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL COMMISSION</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL SURCHARGE</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL TDS</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL CR</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL DR</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'center' }}>SUCCESS</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'center' }}>PENDING</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'center' }}>FAILED</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'center' }}>REFUND</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'center' }}>TOTAL TXN</th>
                <th style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '12px 14px', textAlign: 'right' }}>TOTAL PROFIT</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8', fontWeight: 600 }}>
                    No matching service statistics found.
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, idx) => (
                  <tr key={item.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.78rem', padding: '10px 14px' }}>{startIndex + idx + 1}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }}></span>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1E3A8A' }}>{item.service}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalBusiness.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10B981', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem', color: '#DC2626', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalSurcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem', color: '#EF4444', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalTds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem', color: '#2563EB', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalCr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.82rem', color: '#475569', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalDr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    
                    {/* Status counts styled beautifully as premium pill badges with borders */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {item.success}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ background: '#FFF9E6', color: '#B08D00', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {item.pending}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {item.failed}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {item.refund}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#1E293B' }}>{item.totalTxn}</td>
                    <td style={{ fontWeight: 850, fontSize: '0.85rem', color: '#059669', padding: '10px 14px', textAlign: 'right' }}>₹{item.totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
            
            {/* Table Footer with aggregated sums */}
            {filteredData.length > 0 && (
              <tfoot>
                <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
                  <td colSpan="2" style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.82rem', padding: '14px', textAlign: 'left' }}>TOTAL SUMMARY</td>
                  <td style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.82rem', padding: '14px', textAlign: 'right' }}>₹{totals.business.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: 900, color: '#16A34A', fontSize: '0.82rem', padding: '14px', textAlign: 'right' }}>₹{totals.commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: 900, color: '#DC2626', fontSize: '0.82rem', padding: '14px', textAlign: 'right' }}>₹{totals.surcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: 900, color: '#EF4444', fontSize: '0.82rem', padding: '14px', textAlign: 'right' }}>₹{totals.tds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: 900, color: '#2563EB', fontSize: '0.82rem', padding: '14px', textAlign: 'right' }}>₹{totals.cr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: 900, color: '#475569', fontSize: '0.82rem', padding: '14px', textAlign: 'right' }}>₹{totals.dr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  
                  {/* Totals of status counters */}
                  <td style={{ fontWeight: 900, color: '#059669', fontSize: '0.82rem', padding: '14px', textAlign: 'center' }}>
                    <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 900 }}>
                      {totals.success}
                    </span>
                  </td>
                  <td style={{ fontWeight: 900, color: '#B08D00', fontSize: '0.82rem', padding: '14px', textAlign: 'center' }}>
                    <span style={{ background: '#FFF9E6', color: '#B08D00', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 900 }}>
                      {totals.pending}
                    </span>
                  </td>
                  <td style={{ fontWeight: 900, color: '#EF4444', fontSize: '0.82rem', padding: '14px', textAlign: 'center' }}>
                    <span style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 900 }}>
                      {totals.failed}
                    </span>
                  </td>
                  <td style={{ fontWeight: 900, color: '#1D4ED8', fontSize: '0.82rem', padding: '14px', textAlign: 'center' }}>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 900 }}>
                      {totals.refund}
                    </span>
                  </td>
                  <td style={{ fontWeight: 900, color: '#1E293B', fontSize: '0.82rem', padding: '14px', textAlign: 'center' }}>{totals.txns}</td>
                  <td style={{ fontWeight: 950, color: '#059669', fontSize: '0.85rem', padding: '14px', textAlign: 'right' }}>₹{totals.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={handlePrev}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <FiChevronLeft />
            </button>
            <div style={{ width: '36px', height: '36px', background: '#1756AA', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {currentPage}
            </div>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages}
              onClick={handleNext}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BusinessSummary;
