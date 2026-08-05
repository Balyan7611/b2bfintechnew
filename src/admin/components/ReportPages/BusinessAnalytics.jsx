import React, { useState, useEffect } from 'react';
import {
  FaFilter, FaSpinner, FaChevronDown, FaRegLightbulb,
  FaUser, FaUsers, FaBolt, FaLayerGroup
} from 'react-icons/fa';
import { FiDownload, FiTrendingUp, FiActivity, FiDollarSign, FiZap } from 'react-icons/fi';
import { MdOutlineAccountBalanceWallet, MdPhoneAndroid, MdSwapHoriz } from 'react-icons/md';
import { apiService } from '../../../api/httpClient';
import { API } from '../../../api/endpoints';
import AdminTable from '../../../shared/components/common/AdminTable';
import styles from './BusinessAnalytics.module.css';

/* ── Date helpers ─────────────────────────────────────────── */
function toYMD(d) { return d.toISOString().slice(0, 10); }

function periodDates(period) {
  const today = new Date();
  const ymd = (d) => toYMD(d);
  const sub = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
  switch (period) {
    case 'today':     return { startDate: ymd(today), endDate: ymd(today) };
    case 'yesterday': { const y = sub(1); return { startDate: ymd(y), endDate: ymd(y) }; }
    case '7days':     return { startDate: ymd(sub(6)), endDate: ymd(today) };
    case '30days':    return { startDate: ymd(sub(29)), endDate: ymd(today) };
    case 'thisMonth': { const s = new Date(today.getFullYear(), today.getMonth(), 1); return { startDate: ymd(s), endDate: ymd(today) }; }
    case 'lastMonth': {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const e = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: ymd(s), endDate: ymd(e) };
    }
    default: return { startDate: ymd(sub(6)), endDate: ymd(today) };
  }
}

function relativeDate(isoStr) {
  if (!isoStr) return null;
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 86400000);
  if (diff === 0) return 'Last used today';
  if (diff === 1) return 'Last used yesterday';
  return `Last used ${diff} days ago`;
}

/* ── Service icon map ────────────────────────────────────── */
const SVC_ICON = {
  'MONEY TRANSFER':    <MdSwapHoriz size={13} />,
  'UPI TRANSFER':      <FiZap size={13} />,
  'AEPS':              <FiActivity size={13} />,
  'RECHARGE & BILLS':  <MdPhoneAndroid size={13} />,
  'SETTLEMENT - WALLET': <MdOutlineAccountBalanceWallet size={13} />,
};

/* ── Service mini-card ───────────────────────────────────── */
function SvcCard({ svc }) {
  const barW = Math.min(svc.percentageOfBusiness * 2, 100);
  return (
    <div style={{
      background: '#fff', border: '1px solid #E8EDF5', borderRadius: 12,
      padding: '16px 18px', flex: '1 1 180px', minWidth: 160,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5DB8', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        {SVC_ICON[svc.serviceName] || <FiZap size={13} />} {svc.serviceName}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', marginBottom: 6 }}>
        ₹ {Number(svc.businessValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
      <div style={{ height: 4, background: '#E8EDF5', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ width: `${barW}%`, height: '100%', background: '#4B5DB8', borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
        {svc.successfulTxns} of {svc.totalTxns} successful · {svc.percentageOfBusiness?.toFixed(1)}% of business
      </div>
      {svc.lastUsed && (
        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 2 }}>{relativeDate(svc.lastUsed)}</div>
      )}
    </div>
  );
}

const BusinessAnalytics = () => {
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [scope, setScope] = useState('Downline');
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState('');

  // API response data
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [dateRange, setDateRange] = useState('');

  useEffect(() => {
    API.member.search('').then(res => setMemberList(res || [])).catch(() => {});
  }, []);

  const handleAnalyse = async () => {
    if (!selectedMember) return alert('Please select a member.');
    setLoading(true); setAnalyzed(false); setError('');

    const { startDate, endDate } = periodDates(period);
    setDateRange(`${startDate} to ${endDate}`);

    try {
      const res = await apiService.get(
        `/Admin/BusinessAnalysis?memberId=${selectedMember}&scope=${scope}&startDate=${startDate}&endDate=${endDate}`
      );

      const data = res?.data || res;
      if (!data || res?.status === false) {
        setError(res?.mess || 'Failed to load analytics.');
        return;
      }

      setSummary(data.summary || {});
      setServices(data.services || []);
      setMembers(data.members || []);

      // Find member name from list for the header
      const mFound = memberList.find(m => String(m.id || m.memberId) === String(selectedMember));
      setMemberInfo({
        id: mFound?.memberID || mFound?.memberId || selectedMember,
        name: data.members?.[0]?.memberName || mFound?.name || 'Member',
        shop: data.members?.[0]?.shopName || mFound?.shopName || '',
      });

      setAnalyzed(true);
    } catch (err) {
      console.error(err);
      setError('API error: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Table columns: # | MEMBER | SHOP | AEPS | MONEY TRANSFER | RECHARGE & BILLS | SETTLEMENT · WALLET | UPI TRANSFER | TOTAL
  const TABLE_COLS = ['#', 'MEMBER', 'SHOP', 'AEPS', 'MONEY TRANSFER', 'RECHARGE & BILLS', 'SETTLEMENT · WALLET', 'UPI TRANSFER', 'TOTAL', 'TXNS', 'SUCCESS'];

  const fmt = (n) => n > 0
    ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : <span style={{ color: '#CBD5E1' }}>—</span>;

  return (
    <div className={styles.container}>

      {/* ── FILTERS ── */}
      <div className={styles.filterSection}>
        <div className={styles.filterHeader}><FaFilter className={styles.filterHeaderIcon} /><span>Choose what to look at</span></div>
        <div className={styles.filterGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Member <span className={styles.required}>*</span></label>
            <div className={styles.selectWrapper}>
              <select className={styles.select} value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                <option value="">Select Member</option>
                {memberList.map(m => (
                  <option key={m.id || m.memberId} value={m.id || m.memberId}>
                    {m.name} ({m.mobile}) - {m.memberId}
                  </option>
                ))}
              </select>
              <FaChevronDown className={styles.selectChevron} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Scope</label>
            <div className={styles.scopeToggle}>
              <button type="button" className={`${styles.scopeButton} ${scope === 'Self' ? styles.activeScope : ''}`} onClick={() => setScope('Self')}>This member only</button>
              <button type="button" className={`${styles.scopeButton} ${scope === 'Downline' ? styles.activeScope : ''}`} onClick={() => setScope('Downline')}>Member + full downline</button>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Period</label>
            <div className={styles.selectWrapper}>
              <select className={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
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
        </div>
        <div className={styles.filterActions}>
          <button className={styles.analyseButton} onClick={handleAnalyse} disabled={loading}>
            {loading ? <><FaSpinner className={styles.spinner} /> Analyzing...</> : 'Analyse'}
          </button>
          {analyzed && (
            <button className={styles.exportButton} onClick={() => {
              const hdrs = ['#', 'Member', 'Shop', 'AEPS', 'Money Transfer', 'Recharge & Bills', 'Settlement-Wallet', 'UPI Transfer', 'Total'];
              const rows = members.map((m, i) => [
                i + 1, m.memberName, m.shopName,
                m.aepsBusiness, m.moneyTransferBusiness, m.rechargeBillsBusiness,
                m.settlementBusiness, m.upiTransferBusiness, m.totalBusinessValue
              ]);
              const csv = 'data:text/csv;charset=utf-8,' + [hdrs, ...rows].map(r => r.join(',')).join('\n');
              const a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'business_analytics.csv'; a.click();
            }}>
              <FiDownload style={{ marginRight: 6 }} /> Export CSV
            </button>
          )}
        </div>
        {error && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: 8 }}>{error}</div>}
      </div>

      {/* ── RESULTS ── */}
      {analyzed && summary && (
        <div className={styles.resultsArea}>

          {/* Member header bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #E8EDF5', borderRadius: 10, padding: '12px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FaUser size={13} color="#4B5DB8" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0D1B3E' }}>
                {memberInfo?.id} — {memberInfo?.name}
              </span>
              {memberInfo?.shop && <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: 4 }}>· {memberInfo.shop}</span>}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{dateRange}</span>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              {
                icon: <FiDollarSign size={13} />, label: 'TOTAL BUSINESS',
                value: `₹ ${Number(summary.totalBusiness).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                sub: 'Successful transactions only.'
              },
              {
                icon: <FiTrendingUp size={13} />, label: 'TRANSACTIONS',
                value: Number(summary.totalTxns).toLocaleString(),
                sub: `${summary.successfulTxns} successful (${summary.successRate?.toFixed(1)}%)`
              },
              {
                icon: <FaLayerGroup size={13} />, label: 'SERVICES USED',
                value: `${summary.servicesUsedCount} of ${summary.totalServicesCount}`,
                sub: 'Active services in this period.'
              },
              {
                icon: <FaUsers size={13} />, label: 'MEMBERS COUNTED',
                value: Number(summary.membersCounted).toLocaleString(),
                sub: scope === 'Downline' ? 'Member + full downline.' : 'This member only.'
              },
            ].map(c => (
              <div key={c.label} style={{ flex: 1, minWidth: 160, background: '#fff', border: '1px solid #E8EDF5', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5DB8', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  {c.icon} {c.label}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0D1B3E', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 5 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Service by Service cards */}
          {services.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FiActivity size={14} color="#4B5DB8" />
                <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service by Service</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {services.map(s => <SvcCard key={s.serviceName} svc={s} />)}
              </div>
            </div>
          )}

          {/* Member × Service Table */}
          <AdminTable
            title="BUSINESS ANALYTICS"
            columns={TABLE_COLS}
            data={members}
            renderRow={(row, i) => (
              <tr key={row.memberId || i}>
                <td style={{ color: '#94A3B8', fontWeight: 700 }}>{i + 1}</td>
                <td style={{ fontWeight: 800, color: '#0D1B3E' }}>
                  <div>{row.memberName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>#{row.memberId}</div>
                </td>
                <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{row.shopName || '—'}</td>
                <td style={{ fontWeight: 600, color: row.aepsBusiness > 0 ? '#0369A1' : '#CBD5E1' }}>{fmt(row.aepsBusiness)}</td>
                <td style={{ fontWeight: 600, color: row.moneyTransferBusiness > 0 ? '#0369A1' : '#CBD5E1' }}>{fmt(row.moneyTransferBusiness)}</td>
                <td style={{ fontWeight: 600, color: row.rechargeBillsBusiness > 0 ? '#0369A1' : '#CBD5E1' }}>{fmt(row.rechargeBillsBusiness)}</td>
                <td style={{ fontWeight: 600, color: row.settlementBusiness > 0 ? '#0369A1' : '#CBD5E1' }}>{fmt(row.settlementBusiness)}</td>
                <td style={{ fontWeight: 600, color: row.upiTransferBusiness > 0 ? '#0369A1' : '#CBD5E1' }}>{fmt(row.upiTransferBusiness)}</td>
                <td style={{ fontWeight: 800, color: '#0D1B3E' }}>₹{Number(row.totalBusinessValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style={{ fontWeight: 600 }}>{row.totalTxns ?? '—'}</td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>{row.successfulTxns ?? '—'}</td>
              </tr>
            )}
            searchQuery=""
            onSearchChange={() => {}}
            rowsPerPage={members.length || 10}
            onRowsPerPageChange={() => {}}
            currentPage={1}
            onPageChange={() => {}}
            totalEntries={members.length}
            totalPages={1}
          />
        </div>
      )}

      {/* Legend */}
      <div className={styles.legendBlock}>
        <div className={styles.legendHeader}><FaRegLightbulb className={styles.legendHeaderIcon} /><span>How the numbers are worked out.</span></div>
        <ul className={styles.legendList}>
          <li><strong>Business</strong> counts successful transactions only. Failed and pending ones show in the counts but add nothing to the value.</li>
          <li>Service columns show the <strong>successful volume</strong> for that service. A dash (—) means no activity in the period.</li>
          <li>The downline walks the upline tree <strong>up to 12 levels</strong> and includes the selected member.</li>
        </ul>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
