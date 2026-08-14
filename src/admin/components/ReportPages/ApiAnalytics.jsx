import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { FaFilter, FaSpinner, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { FiDownload, FiBarChart2 } from 'react-icons/fi';
import { MdApi } from 'react-icons/md';
import { apiService } from '../../../api/httpClient';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './ApiAnalytics.module.css';

function toYMD(d) { return d.toISOString().slice(0, 10); }
function periodDates(period) {
  const today = new Date();
  const sub = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
  switch (period) {
    case 'today':     return { startDate: toYMD(today), endDate: toYMD(today) };
    case 'yesterday': { const y = sub(1); return { startDate: toYMD(y), endDate: toYMD(y) }; }
    case '7days':     return { startDate: toYMD(sub(6)), endDate: toYMD(today) };
    case '30days':    return { startDate: toYMD(sub(29)), endDate: toYMD(today) };
    case 'thisMonth': { const s = new Date(today.getFullYear(), today.getMonth(), 1); return { startDate: toYMD(s), endDate: toYMD(today) }; }
    case 'lastMonth': {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const e = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: toYMD(s), endDate: toYMD(e) };
    }
    default: return { startDate: toYMD(sub(6)), endDate: toYMD(today) };
  }
}

function RateBar({ rate }) {
  const color = rate >= 90 ? '#22C55E' : rate >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(rate, 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color, minWidth: 38 }}>{Number(rate).toFixed(1)}%</span>
    </div>
  );
}

function KpiCard({ icon, title, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
      padding: '20px 24px', flex: 1, minWidth: 180,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

const ApiAnalytics = () => {
  const [period, setPeriod]   = useState('7days');
  const [showAs, setShowAs]   = useState('Transactions');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError]     = useState('');

  const [summary, setSummary]         = useState(null);
  const [providerRows, setProviderRows] = useState([]);
  const [serviceGrid, setServiceGrid]   = useState([]);     const [providerNames, setProviderNames] = useState([]);   const [dateRange, setDateRange]       = useState('');

  const handleAnalyse = async () => {
    setLoading(true); setAnalyzed(false); setError('');
    const { startDate, endDate } = periodDates(period);
    setDateRange(`${startDate} to ${endDate}`);
    try {
      const res = await apiService.get(`/Admin/ApiAnalysis?startDate=${startDate}&endDate=${endDate}`);
      const data = res?.data || res;

      if (!data || res?.status === false) {
        setError(res?.mess || 'Failed to load analytics.');
        return;
      }

      setSummary(data.summary || {});

      const providers = data.providers || [];
      setProviderRows(providers);
            setProviderNames(providers.map((p, i) => p.providerName || p.apiName || p.name || `Provider ${p.apiId || i + 1}`));

      setServiceGrid(data.serviceGrid || []);
      setAnalyzed(true);
    } catch (err) {
      console.error('ApiAnalytics error:', err);
      setError('API error: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
            <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconContainer}><MdApi className={styles.mainIcon} /></div>
          <div>
            <h1 className={styles.title}>API analysis</h1>
            <p className={styles.subtitle}>
              Which provider is carrying each service, and which one is failing.
              <span className={styles.buildTag}>build 2026-08-05.1</span>
            </p>
          </div>
        </div>
      </div>

            <div className={styles.filterSection}>
        <div className={styles.filterHeader}><FaFilter className={styles.filterHeaderIcon} /><span>Choose what to look at</span></div>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Period</label>
            <SearchableSelect
              value={period}
              onChange={val => setPeriod(val || 'today')}
              options={[
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: 'Last 7 days', value: '7days' },
                { label: 'Last 30 days', value: '30days' },
                { label: 'This month', value: 'thisMonth' },
                { label: 'Last month', value: 'lastMonth' }
              ]}
              placeholder="Today"
              style={{ height: '44px', borderRadius: '10px' }}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Show Cells As</label>
            <SearchableSelect
              value={showAs}
              onChange={val => setShowAs(val || 'Transactions')}
              options={[
                { label: 'Transactions', value: 'Transactions' },
                { label: 'Business value (₹)', value: 'Business' },
                { label: 'Success rate (%)', value: 'Rates' }
              ]}
              placeholder="Transactions"
              style={{ height: '44px', borderRadius: '10px' }}
            />
          </div>
        </div>
        <div className={styles.filterActions}>
          <button className={styles.analyseButton} onClick={handleAnalyse} disabled={loading}>
            {loading ? <><FaSpinner className={styles.spinner} /> Analyzing...</> : 'Analyse'}
          </button>
          {analyzed && (
            <button className={styles.exportButton} onClick={() => {
              const headers = ['Provider', 'Txns', 'Success', 'Failed', 'Pending', 'Rate%', 'Business'];
              const rows = providerRows.map(r => [r.providerName, r.txns, r.success, r.failed, r.pending, Number(r.successRate).toFixed(2), Number(r.businessAmount).toFixed(2)]);
              const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(r => r.join(',')).join('\n');
              const a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'api_analytics.csv'; a.click();
            }}>
              <FiDownload style={{ marginRight: 6 }} /> Export CSV
            </button>
          )}
        </div>
        {error && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: 8 }}>{error}</div>}
      </div>

            {!analyzed && (
        <div className={styles.legendBlock}>
          <div className={styles.legendHeader}><span style={{ fontWeight: 800, color: '#1756AA' }}>How to read this.</span></div>
          <ul className={styles.legendList}>
            <li><strong>Success rate is the point of this page.</strong> A service that looks healthy overall can be one provider at 99% hiding another at 40% — and only this breakdown shows it.</li>
            <li>A rate on a handful of transactions means very little. The transaction count is shown beside every rate for that reason.</li>
            <li><strong>Business value</strong> counts successful transactions only. Failed and pending ones are in the counts but add nothing to the value.</li>
          </ul>
        </div>
      )}

            {analyzed && summary && (
        <div className={styles.resultsArea}>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <KpiCard
              icon={<FiBarChart2 size={14} />}
              title="Transactions"
              value={Number(summary.totalTxns).toLocaleString('en-IN')}
              sub={dateRange}
            />
            <KpiCard
              icon={<span style={{ fontSize: 13 }}>₹</span>}
              title="Business"
              value={`₹ ${Number(summary.totalBusinessAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              sub="Successful transactions only."
            />
            <KpiCard
              icon={<MdApi size={14} />}
              title="Providers Used"
              value={summary.activeProvidersUsed}
              sub={`${Number(summary.totalSuccessfulTxns).toLocaleString()} successful overall (${Number(summary.overallSuccessRate).toFixed(1)}%)`}
            />
            <KpiCard
              icon={<FaExclamationTriangle size={13} style={{ color: '#EF4444' }} />}
              title="Weakest Provider"
              value={summary.weakestProvider?.providerName || 'N/A'}
              sub={`${Number(summary.weakestProvider?.successRate || 0).toFixed(1)}% success on ${Number(summary.weakestProvider?.totalTxns || 0).toLocaleString()} transactions.`}
            />
          </div>

          {/* ── Provider by Provider table ── */}
          <div style={{ marginBottom: 24 }}>
            <AdminTable
              title="PROVIDER BY PROVIDER"
              fileNamePrefix="api_analytics_providers"
              rightAction={<span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Ranked by transactions</span>}
              columns={['#', 'PROVIDER', 'TXNS', 'SUCCESS', 'FAILED', 'PENDING', 'BUSINESS', 'SUCCESS RATE', 'SERVICES']}
              data={providerRows}
              exportData={providerRows.map((row, i) => [
                i + 1,
                row.providerName || row.apiName || row.name || `Provider ${row.apiId || i + 1}`,
                Number(row.txns).toLocaleString(),
                Number(row.success).toLocaleString(),
                Number(row.failed).toLocaleString(),
                Number(row.pending).toLocaleString(),
                `₹${Number(row.businessAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                `${Number(row.successRate).toFixed(1)}%`,
                Array.isArray(row.servicesCarried) ? row.servicesCarried.join(', ') : row.servicesCarried || '—',
              ])}
              renderRow={(row, i) => (
                <tr key={row.apiId || row.providerName}>
                  <td style={{ color: '#94A3B8', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ fontWeight: 800, color: '#0D1B3E' }}>{row.providerName || row.apiName || row.name || `Provider ${row.apiId || i + 1}`}</td>
                  <td style={{ fontWeight: 600 }}>{Number(row.txns).toLocaleString()}</td>
                  <td style={{ color: '#16A34A', fontWeight: 700 }}>{Number(row.success).toLocaleString()}</td>
                  <td style={{ color: row.failed > 0 ? '#DC2626' : '#94A3B8', fontWeight: 700 }}>{Number(row.failed).toLocaleString()}</td>
                  <td style={{ color: '#B45309', fontWeight: 600 }}>{Number(row.pending).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: '#0369A1' }}>₹{Number(row.businessAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ minWidth: 200 }}><RateBar rate={Number(row.successRate)} /></td>
                  <td style={{ color: '#1756AA', fontSize: '0.78rem' }}>
                    {Array.isArray(row.servicesCarried) ? row.servicesCarried.join(', ') : row.servicesCarried || '—'}
                  </td>
                </tr>
              )}
              searchQuery=""
              onSearchChange={() => {}}
              rowsPerPage={providerRows.length || 10}
              onRowsPerPageChange={() => {}}
              currentPage={1}
              onPageChange={() => {}}
              totalEntries={providerRows.length}
              totalPages={1}
            />
          </div>

          {/* ── Service × Provider crosswalk table ── */}
          <div style={{ marginBottom: 24 }}>
            <AdminTable
              title="SERVICE × PROVIDER"
              fileNamePrefix="api_analytics_service_provider"
              rightAction={<span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>{showAs === 'Rates' ? 'Showing success rates' : showAs === 'Business' ? 'Showing business value (₹)' : 'Showing transaction counts'}</span>}
              columns={['#', 'SERVICE', ...providerNames, 'TOTAL']}
              data={[...serviceGrid, '__total__']}
              exportData={serviceGrid.map((row, i) => [
                i + 1,
                row.serviceName,
                ...providerNames.map(p => {
                  const cell = row.providerCells?.[p];
                  if (showAs === 'Business') return cell?.businessValue > 0 ? `₹${Number(cell.businessValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';
                  if (showAs === 'Rates') return cell?.txns > 0 ? `${Number(cell.successRate).toFixed(1)}%` : '—';
                  return cell?.txns > 0 ? String(cell.txns) : '—';
                }),
                showAs === 'Business'
                  ? (row.totalBusiness > 0 ? `₹${Number(row.totalBusiness).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—')
                  : showAs === 'Rates'
                    ? (row.totalTxns > 0 ? `${Number(row.overallSuccessRate).toFixed(1)}%` : '—')
                    : (row.totalTxns > 0 ? String(row.totalTxns) : '—'),
              ])}
              renderRow={(row, i) => {
                if (row === '__total__') {
                  return (
                    <tr key="total" style={{ background: '#F8FAFC', fontWeight: 800 }}>
                      <td style={{ color: '#94A3B8', fontWeight: 700, padding: '10px 16px', textAlign: 'center', verticalAlign: 'middle' }}>—</td>
                      <td style={{ fontWeight: 800, color: '#0D1B3E', padding: '10px 16px', verticalAlign: 'middle' }}>Total</td>
                      {providerNames.map(p => {
                        let colTotal;
                        if (showAs === 'Business') {
                          colTotal = serviceGrid.reduce((s, r) => s + (r.providerCells?.[p]?.businessValue || 0), 0);
                          return <td key={p} style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E', padding: '10px 16px', verticalAlign: 'middle' }}>{colTotal > 0 ? `₹${Number(colTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</td>;
                        } else if (showAs === 'Rates') {
                          const totalTxns = serviceGrid.reduce((s, r) => s + (r.providerCells?.[p]?.txns || 0), 0);
                          const totalSuccess = serviceGrid.reduce((s, r) => s + (r.providerCells?.[p]?.successTxns || 0), 0);
                          const avgRate = totalTxns > 0 ? ((totalSuccess / totalTxns) * 100).toFixed(1) : 0;
                          return <td key={p} style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E', padding: '10px 16px', verticalAlign: 'middle' }}>{totalTxns > 0 ? `${avgRate}%` : '—'}</td>;
                        } else {
                          colTotal = serviceGrid.reduce((s, r) => s + (r.providerCells?.[p]?.txns || 0), 0);
                          return <td key={p} style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E', padding: '10px 16px', verticalAlign: 'middle' }}>{colTotal > 0 ? colTotal.toLocaleString() : '—'}</td>;
                        }
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#1756AA', padding: '10px 16px', verticalAlign: 'middle' }}>
                        {showAs === 'Business'
                          ? `₹${Number(serviceGrid.reduce((s, r) => s + (r.totalBusiness || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : showAs === 'Rates'
                            ? (() => { const t = serviceGrid.reduce((s, r) => s + (r.totalTxns || 0), 0); const sc = serviceGrid.reduce((s, r) => s + (r.totalSuccessTxns || 0), 0); return t > 0 ? `${((sc / t) * 100).toFixed(1)}%` : '—'; })()
                            : serviceGrid.reduce((s, r) => s + (r.totalTxns || 0), 0).toLocaleString()
                        }
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={row.serviceName}>
                    <td style={{ color: '#94A3B8', fontWeight: 700, padding: '10px 16px', textAlign: 'center', verticalAlign: 'middle' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700, color: '#334155', padding: '10px 16px', verticalAlign: 'middle' }}>{row.serviceName}</td>
                    {providerNames.map(p => {
                      const cell = row.providerCells?.[p];
                      let display;
                      if (showAs === 'Business') {
                        display = (cell?.businessValue > 0)
                          ? <span style={{ fontWeight: 600, color: '#0369A1' }}>₹{Number(cell.businessValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          : <span style={{ color: '#CBD5E1' }}>—</span>;
                      } else if (showAs === 'Rates') {
                        display = (cell?.txns > 0)
                          ? <span style={{ color: cell.successRate >= 90 ? '#16A34A' : cell.successRate >= 70 ? '#B45309' : '#DC2626', fontWeight: 700 }}>{Number(cell.successRate).toFixed(1)}%</span>
                          : <span style={{ color: '#CBD5E1' }}>—</span>;
                      } else {
                        display = (cell?.txns > 0)
                          ? <span style={{ fontWeight: 600 }}>{cell.txns.toLocaleString()}</span>
                          : <span style={{ color: '#CBD5E1' }}>—</span>;
                      }
                      return (
                        <td key={p} style={{ textAlign: 'left', padding: '10px 16px', verticalAlign: 'middle' }}>
                          {display}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#0D1B3E', padding: '10px 16px', verticalAlign: 'middle' }}>
                      {showAs === 'Business'
                        ? (row.totalBusiness > 0 ? `₹${Number(row.totalBusiness).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—')
                        : showAs === 'Rates'
                          ? (row.totalTxns > 0 ? `${Number(row.overallSuccessRate).toFixed(1)}%` : '—')
                          : (row.totalTxns > 0 ? row.totalTxns.toLocaleString() : '—')
                      }
                    </td>
                  </tr>
                );
              }}
              searchQuery=""
              onSearchChange={() => {}}
              rowsPerPage={(serviceGrid.length + 1) || 10}
              onRowsPerPageChange={() => {}}
              currentPage={1}
              onPageChange={() => {}}
              totalEntries={serviceGrid.length}
              totalPages={1}
            />
          </div>

          {/* Legend after analysis */}
          <div className={styles.legendBlock}>
            <div className={styles.legendHeader}><span style={{ fontWeight: 800, color: '#1756AA' }}>How to read this.</span></div>
            <ul className={styles.legendList}>
              <li><strong>Success rate is the point of this page.</strong> A service that looks healthy overall can be one provider at 99% hiding another at 40% — and only this breakdown shows it.</li>
              <li>A rate on a handful of transactions means very little. The transaction count is shown beside every rate for that reason.</li>
              <li><strong>Business value</strong> counts successful transactions only. Failed and pending ones are in the counts but add nothing to the value.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiAnalytics;
