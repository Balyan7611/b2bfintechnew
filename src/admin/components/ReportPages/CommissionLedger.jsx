import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../api/httpClient';
import { API } from '../../../api/endpoints';
import AdminTable from '../../../shared/components/common/AdminTable';
import StatsGrid from '../../../shared/components/common/StatsGrid';
import { FiBarChart2, FiSearch } from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';

/* ── Date helpers ─────────────────────────────────── */
const today = new Date().toISOString().split('T')[0];

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function fmtAmt(n) {
  return '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

/* ── Type badge ───────────────────────────────────── */
function TypeBadge({ isComSur }) {
  const label = isComSur ? 'Surcharge' : 'Commission';
  const bg    = isComSur ? '#FEF3C7' : '#D1FAE5';
  const color = isComSur ? '#B45309' : '#065F46';
  return (
    <span style={{ background: bg, color, fontWeight: 700, fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

const CommissionLedger = () => {
  const [loading, setLoading]     = useState(false);
  const [items, setItems]         = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize]   = useState(25);
  const [fromDate, setFromDate]   = useState(today);
  const [toDate, setToDate]       = useState(today);
  const [memberId, setMemberId]   = useState('');
  const [memberOptions, setMemberOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  /* ── Load member dropdown ─────────────────────── */
  useEffect(() => {
    API.member.search('').then(res => {
      const list = Array.isArray(res) ? res : (res?.data?.items || res?.data || []);
      console.log('[CommissionLedger] members loaded:', list.length);
      setMemberOptions([
        { value: '', label: 'All Members' },
        ...(Array.isArray(list) ? list : []).map(m => {
          const name    = m.name || m.fullName || m.ownerName || m.firmName || '';
          const loginId = m.memberID || m.memberid || m.loginID || m.loginId || String(m.id || m.msrno || '');
          return { value: String(m.id || m.msrno), label: name ? `${name} (${loginId})` : loginId };
        })
      ]);
    }).catch(() => {
      // fallback to getAll
      API.member.getAll({ pageNumber: 1, pageSize: 5000 }).then(res => {
        const list = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        setMemberOptions([
          { value: '', label: 'All Members' },
          ...(Array.isArray(list) ? list : []).map(m => {
            const name    = m.name || m.fullName || m.ownerName || m.firmName || '';
            const loginId = m.memberID || m.memberid || m.loginID || m.loginId || String(m.id || m.msrno || '');
            return { value: String(m.id || m.msrno), label: name ? `${name} (${loginId})` : loginId };
          })
        ]);
      }).catch(() => {});
    });
  }, []);

  /* ── Fetch ledger ─────────────────────────────── */
  const fetchData = useCallback(async (pg = pageNumber, ps = pageSize) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ PageNumber: pg, PageSize: ps });
      if (memberId) params.append('MemberID', memberId);
      if (fromDate) params.append('FromDate', `${fromDate}T00:00:00Z`);
      if (toDate)   params.append('ToDate',   `${toDate}T23:59:59Z`);

      const res = await apiService.get(`/CommissionLedger/GetCommissionLedger?${params}`);
      const data = res?.data || res;
      const rows  = data?.items || data?.data?.items || [];
      const total = data?.totalItems ?? data?.data?.totalItems ?? rows.length;
      setItems(rows);
      setTotalItems(total);
    } catch (e) {
      console.error('[CommissionLedger] fetch error:', e);
      setItems([]); setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, memberId, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Stats ────────────────────────────────────── */
  const totalAmt        = items.reduce((s, r) => s + (r.amount || 0), 0);
  const commissionTotal = items.filter(r => !r.isComSur).reduce((s, r) => s + (r.amount || 0), 0);
  const surchargeTotal  = items.filter(r => r.isComSur).reduce((s, r) => s + (r.amount || 0), 0);
  const stats = {
    totalTxns: totalItems,
    totalAmount: totalAmt,
    successTxns: items.filter(r => !r.isComSur).length,
    failedTxns: items.filter(r => r.isComSur).length,
    pendingTxns: 0,
    totalCommission: commissionTotal,
    uplineCommission: commissionTotal * 0.6,
    adminCommission: commissionTotal * 0.4,
    totalTds: 0,
    adminProfit: commissionTotal * 0.15,
    tdsPayable: 0,
    netPayable: totalAmt,
  };

  /* ── Client-side search ──────────────────────── */
  const filtered = items.filter(r => {
    const q = searchQuery.toLowerCase();
    return !q ||
      (r.transactionOrderId || '').toLowerCase().includes(q) ||
      (r.beneficiaryMemberName || '').toLowerCase().includes(q) ||
      (r.roleName || '').toLowerCase().includes(q) ||
      (r.packageName || '').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className={styles.container}>
      <StatsGrid stats={stats} showStats={showStats} />

      <AdminTable
        title="COMMISSION LEDGER"
        topContent={
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8EDF5' }}>
            {/* Header row: title area + View Stats button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                onClick={() => setShowStats(s => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#1E293B,#0F172A)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.2s' }}
              >
                <FiBarChart2 size={15} />
                {showStats ? 'Hide Stats' : 'View Stats'}
              </button>
            </div>

            {/* Filter grid */}
            <form onSubmit={e => { e.preventDefault(); setPageNumber(1); fetchData(1, pageSize); }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>

                {/* From Date */}
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    onFocus={() => setFocusedField('fromDate')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingLeft: 12, paddingRight: 12, height: 38, borderRadius: 10, fontSize: '0.825rem', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23,86,170,0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }}
                  />
                </div>

                {/* To Date */}
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    onFocus={() => setFocusedField('toDate')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingLeft: 12, paddingRight: 12, height: 38, borderRadius: 10, fontSize: '0.825rem', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23,86,170,0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }}
                  />
                </div>

                {/* Member Dropdown */}
                <div className={styles.formGroup}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Member</label>
                  <SearchableSelect
                    options={memberOptions}
                    value={memberId}
                    onChange={val => setMemberId(val || '')}
                    placeholder="All Members"
                  />
                </div>

                {/* Search keyword */}
                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                      <FiSearch size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by TXN ID, Member, Role..."
                      className={styles.inputControl}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => setFocusedField('search')}
                      onBlur={() => setFocusedField(null)}
                      style={{ paddingLeft: 32, paddingRight: 12, height: 38, borderRadius: 10, fontSize: '0.825rem', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23,86,170,0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', height: 38, background: 'linear-gradient(135deg,#1756AA,#1E3A8A)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(23,86,170,0.2)', transition: 'all 0.2s' }}
                  >
                    {loading ? 'Loading…' : 'Search'}
                  </button>
                </div>

              </div>
            </form>
          </div>
        }
        columns={['#', 'DATE & TIME', 'TRANSACTION ID', 'BENEFICIARY', 'ROLE', 'PACKAGE', 'LEVEL', 'TYPE', 'AMOUNT']}
        data={filtered}
        renderRow={(row, i) => (
          <tr key={row.id || i}>
            <td style={{ color: '#94A3B8', fontWeight: 700 }}>{(pageNumber - 1) * pageSize + i + 1}</td>
            <td style={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>{fmtDate(row.createdOn)}</td>
            <td style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.82rem' }}>{row.transactionOrderId || '—'}</td>
            <td>
              <div style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.85rem' }}>{row.beneficiaryMemberName || '—'}</div>
              {row.beneficiaryMemberMobile && (
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{row.beneficiaryMemberMobile}</div>
              )}
            </td>
            <td style={{ fontSize: '0.82rem', color: '#334155' }}>{row.roleName || '—'}</td>
            <td style={{ fontSize: '0.82rem', color: '#334155' }}>{row.packageName || '—'}</td>
            <td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>{row.levelNo ?? '—'}</td>
            <td><TypeBadge isComSur={row.isComSur} /></td>
            <td style={{ fontWeight: 800, color: '#0D1B3E', whiteSpace: 'nowrap' }}>{fmtAmt(row.amount)}</td>
          </tr>
        )}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        rowsPerPage={pageSize}
        onRowsPerPageChange={val => { setPageSize(val); setPageNumber(1); fetchData(1, val); }}
        currentPage={pageNumber}
        onPageChange={val => { setPageNumber(val); fetchData(val, pageSize); }}
        totalEntries={totalItems}
        totalPages={totalPages}
      />
    </div>
  );
};

export default CommissionLedger;
