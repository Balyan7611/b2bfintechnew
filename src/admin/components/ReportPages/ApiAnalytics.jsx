import React, { useState, useEffect } from 'react';
import { 
  FaFilter, FaSpinner, FaChevronDown, FaCheckCircle, 
  FaTimesCircle, FaExclamationCircle, FaRegLightbulb,
  FaChartPie, FaRupeeSign, FaExclamationTriangle
} from 'react-icons/fa';
import { FiTrendingUp, FiDownload } from 'react-icons/fi';
import { MdApi } from 'react-icons/md';
import { API } from '../../../api/endpoints';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './ApiAnalytics.module.css';

const ApiAnalytics = () => {
  const [period, setPeriod] = useState('7days');
  const [showAs, setShowAs] = useState('Transactions');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  const [analyticsData, setAnalyticsData] = useState([]);
  const [kpis, setKpis] = useState({
    totalTxns: 0,
    totalBusiness: 0,
    providersUsed: 0,
    totalSuccess: 0,
    successRate: 0,
    weakestProvider: 'N/A',
    weakestRate: 0,
    weakestTxns: 0
  });

  const handleAnalyse = async () => {
    setLoading(true);
    setAnalyzed(false);

    try {
      const [res, apiRes] = await Promise.all([
        API.transaction.getAll({
          pageNumber: 1,
          pageSize: 5000,
        }),
        API.masterApi ? API.masterApi.getAll() : Promise.resolve([])
      ]);

      let rawData = [];
      if (res && res.status === true) {
        rawData = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      } else if (res && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (Array.isArray(res)) {
        rawData = res;
      } else if (res && res.items) {
        rawData = res.items;
      }

      let apiList = [];
      if (apiRes && Array.isArray(apiRes)) {
        apiList = apiRes;
      } else if (apiRes && Array.isArray(apiRes.data)) {
        apiList = apiRes.data;
      }

      const getApiName = (apiId, fallback) => {
        if (!apiId) return fallback || 'API Unknown';
        const found = apiList.find(a => String(a.id) === String(apiId));
        return found ? (found.apiname || found.apiName || found.name) : (fallback || `API ${apiId}`);
      };

      const stats = {};

      rawData.forEach(txn => {
        let status = (txn.status || '').toUpperCase();
        let amount = Number(txn.amount) || 0;
        let providerName = getApiName(txn.apiId, txn.apiName);
        
        // Treat blank as "no provider" or use generic name
        if (!providerName || providerName.trim() === '') {
          providerName = txn.apiId ? `API ${txn.apiId}` : 'No Provider';
        }

        if (!stats[providerName]) {
          stats[providerName] = { 
            provider: providerName, 
            successCount: 0, 
            failedCount: 0, 
            pendingCount: 0, 
            volume: 0, 
            totalTxns: 0 
          };
        }

        stats[providerName].totalTxns += 1;
        if (status === 'SUCCESS') {
          stats[providerName].successCount += 1;
          stats[providerName].volume += amount;
        } else if (status === 'FAILED') {
          stats[providerName].failedCount += 1;
        } else {
          stats[providerName].pendingCount += 1;
        }
      });

      const processed = Object.values(stats).map(item => {
        item.successRate = item.totalTxns > 0 ? (item.successCount / item.totalTxns) * 100 : 0;
        return item;
      });

      // KPI Calculations
      const totalTxns = processed.reduce((sum, item) => sum + item.totalTxns, 0);
      const totalSuccess = processed.reduce((sum, item) => sum + item.successCount, 0);
      const totalBusiness = processed.reduce((sum, item) => sum + item.volume, 0);
      const providersUsed = processed.length;
      const successRate = totalTxns > 0 ? (totalSuccess / totalTxns) * 100 : 0;

      // Find Weakest Provider (min 10 txns)
      let weakest = { provider: 'N/A', successRate: 100, totalTxns: 0 };
      processed.forEach(item => {
        if (item.totalTxns >= 10 && item.successRate < weakest.successRate) {
          weakest = item;
        }
      });

      setKpis({
        totalTxns,
        totalBusiness,
        providersUsed,
        totalSuccess,
        successRate,
        weakestProvider: weakest.provider !== 'N/A' ? weakest.provider : (processed[0]?.provider || 'N/A'),
        weakestRate: weakest.provider !== 'N/A' ? weakest.successRate : (processed[0]?.successRate || 0),
        weakestTxns: weakest.provider !== 'N/A' ? weakest.totalTxns : (processed[0]?.totalTxns || 0)
      });

      setAnalyticsData(processed);
      setAnalyzed(true);
    } catch (err) {
      console.error('Failed to fetch API analytics:', err);
      alert('Error fetching analytics. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analyzed || analyticsData.length === 0) {
      alert('Please run the analysis before exporting.');
      return;
    }

    const headers = ['Provider', 'Total Txns', 'Success Count', 'Failed Count', 'Pending Count', 'Success Rate (%)', 'Volume (Rs.)'];
    const rows = analyticsData.map(item => [
      item.provider,
      item.totalTxns,
      item.successCount,
      item.failedCount,
      item.pendingCount,
      item.successRate.toFixed(2),
      item.volume.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `API_Analytics_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const LegendBlock = (
    <div className={styles.legendBlock}>
      <div className={styles.legendHeader}>
        <span style={{ fontWeight: 800, color: '#1756AA' }}>How to read this.</span>
      </div>
      <ul className={styles.legendList}>
        <li>
          <strong>Success rate is the point of this page.</strong> A service that looks healthy overall can be one provider at 99% hiding another at 40% — and only this breakdown shows it.
        </li>
        <li>
          A rate on a handful of transactions means very little. The transaction count is shown beside every rate for that reason.
        </li>
        <li>
          An unknown id shows as <strong>API 7</strong> rather than blank. Blank would read as "no provider"; what it really means is a provider that is no longer configured in <code style={{ color: '#E53E3E', background: 'transparent' }}>tblRecharge_API</code>, which is worth knowing.
        </li>
        <li>
          <strong>Business value</strong> counts successful transactions only. Failed and pending ones are in the counts but add nothing to the value.
        </li>
      </ul>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconContainer}>
            <MdApi className={styles.mainIcon} />
          </div>
          <div>
            <h1 className={styles.title}>API analysis</h1>
            <p className={styles.subtitle}>
              Which provider is carrying each service, and which one is failing.
              <span className={styles.buildTag}>build 2026-07-31.1</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── FILTER SECTION ── */}
      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <FaFilter className={styles.filterHeaderIcon} />
          <span>Choose what to look at</span>
        </div>

        <div className={styles.filterGrid}>
          {/* Period Selector */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Period</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="thisMonth">This month</option>
                <option value="lastMonth">Last month</option>
              </select>
              <FaChevronDown className={styles.selectChevron} />
            </div>
          </div>

          {/* Show Cells As */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Show Cells As</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={showAs}
                onChange={(e) => setShowAs(e.target.value)}
              >
                <option value="Transactions">Transactions</option>
                <option value="Rates">Success Rates</option>
                <option value="Volume">Business Volume</option>
              </select>
              <FaChevronDown className={styles.selectChevron} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.analyseButton}
            onClick={handleAnalyse}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className={styles.spinner} />
                Analyzing...
              </>
            ) : (
              'Analyse'
            )}
          </button>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExportCSV}
            disabled={loading || !analyzed}
          >
            <FiDownload style={{ marginRight: '6px' }} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── EXPLANATORY NOTES LEGEND (Before Analysis) ── */}
      {!analyzed && LegendBlock}

      {/* ── ANALYSIS OUTPUT ── */}
      {analyzed && (
        <div className={styles.resultsArea}>
          {/* KPI Dashboard */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <FaChartPie className={styles.kpiIcon} /> <span className={styles.kpiTitle}>Transactions</span>
              </div>
              <span className={styles.kpiValue}>{kpis.totalTxns.toLocaleString()}</span>
              <span className={styles.kpiTrend}>{period} timeframe</span>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <FaRupeeSign className={styles.kpiIcon} /> <span className={styles.kpiTitle}>Business</span>
              </div>
              <span className={styles.kpiValue}>₹ {kpis.totalBusiness.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={styles.kpiTrend}>Successful transactions only.</span>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <MdApi className={styles.kpiIcon} /> <span className={styles.kpiTitle}>Providers Used</span>
              </div>
              <span className={styles.kpiValue}>{kpis.providersUsed}</span>
              <span className={styles.kpiTrend}>{kpis.totalSuccess.toLocaleString()} successful overall ({kpis.successRate.toFixed(1)}%)</span>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <FaExclamationTriangle className={styles.kpiIcon} style={{ color: '#E53E3E' }} /> <span className={styles.kpiTitle}>Weakest Provider</span>
              </div>
              <span className={styles.kpiValue}>{kpis.weakestProvider}</span>
              <span className={styles.kpiTrend}>{kpis.weakestRate.toFixed(1)}% success on {kpis.weakestTxns} transactions.</span>
            </div>
          </div>

          {/* Summary Table */}
          <div style={{ marginTop: '24px' }}>
            <AdminTable
              title="API PERFORMANCE"
              columns={[
                'PROVIDER', 
                'TOTAL TXNS', 
                'SUCCESS', 
                'FAILED', 
                'PENDING', 
                'SUCCESS RATE',
                <div key="vol" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  TOTAL VOLUME
                  <span style={{fontSize: '0.7rem', opacity: 0.8, fontWeight: 500, textTransform: 'none'}}>
                    (Total: ₹{kpis.totalBusiness.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </span>
                </div>
              ]}
              data={analyticsData}
              renderRow={(item, idx) => {
                const isZero = item.totalTxns === 0;
                return (
                  <tr key={item.key || idx} className={isZero ? styles.greyedRow : ''}>
                    <td className={styles.serviceName}>{item.provider}</td>
                    <td style={{ fontWeight: 600 }}>{item.totalTxns.toLocaleString()}</td>
                    <td>
                      {item.successCount > 0 ? (
                        <span className={styles.badgeSuccess}>
                          <FaCheckCircle style={{ marginRight: '4px', fontSize: '0.75rem' }} />
                          {item.successCount}
                        </span>
                      ) : '0'}
                    </td>
                    <td>
                      {item.failedCount > 0 ? (
                        <span className={styles.badgeFailed}>
                          <FaTimesCircle style={{ marginRight: '4px', fontSize: '0.75rem' }} />
                          {item.failedCount}
                        </span>
                      ) : '0'}
                    </td>
                    <td>
                      {item.pendingCount > 0 ? (
                        <span className={styles.badgePending}>
                          <FaExclamationCircle style={{ marginRight: '4px', fontSize: '0.75rem' }} />
                          {item.pendingCount}
                        </span>
                      ) : '0'}
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 700, 
                        color: item.successRate > 80 ? '#10B981' : item.successRate > 50 ? '#F59E0B' : '#EF4444' 
                      }}>
                        {item.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ fontWeight: 800 }}>
                      {item.volume > 0 ? (
                        `₹${item.volume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      ) : '₹0.00'}
                    </td>
                  </tr>
                );
              }}
              searchQuery=""
              onSearchChange={() => {}}
              rowsPerPage={10}
              onRowsPerPageChange={() => {}}
              currentPage={1}
              onPageChange={() => {}}
              totalEntries={analyticsData.length}
              totalPages={1}
            />
          </div>

          {/* ── EXPLANATORY NOTES LEGEND (After Analysis) ── */}
          <div style={{ marginTop: '10px' }}>
            {LegendBlock}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiAnalytics;
