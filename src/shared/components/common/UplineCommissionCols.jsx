/**
 * UplineCommissionCols
 *
 * Shared component that renders grouped COMMISSION + UPLINE COMMISSION
 * header columns (2-row thead) and matching body cells.
 *
 * Usage — in thead row 1:
 *   <UplineCommissionCols.GroupHeader transactions={transactions} />
 *
 * Usage — in thead row 2 (sub-headers):
 *   <UplineCommissionCols.SubHeader transactions={transactions} />
 *
 * Usage — in tbody tr:
 *   <UplineCommissionCols.Cells txn={txn} transactions={transactions} onBreakdown={setBreakdownTxn} />
 */
import React from 'react';

const groupHeaderStyle = {
  textAlign: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  padding: '4px 10px',
  height: '20px',
  lineHeight: '1',
};

const uplineGroupStyle = {
  ...groupHeaderStyle,
  background: 'rgba(21,128,61,0.25)',
  borderLeft: '2px solid rgba(21,128,61,0.5)',
};

const subThBase = {
  fontSize: '0.65rem',
  padding: '4px 8px',
  height: '20px',
  lineHeight: '1',
};

/** Returns { roles, cols } from the first transaction that has uplineBreakdown */
export const getUplineShape = (transactions = []) => {
  const sample = transactions.find(t => Array.isArray(t.uplineBreakdown) && t.uplineBreakdown.length > 0);
  const roles  = sample ? sample.uplineBreakdown : [];
  const cols   = roles.length > 0 ? roles.length : 2;
  return { roles, cols };
};

/** Row-1 group headers: <th colSpan="2">COMMISSION</th> + UPLINE COMMISSION group */
export const GroupHeader = ({ transactions = [] }) => {
  const { cols } = getUplineShape(transactions);
  return (
    <>
      <th colSpan="2" style={groupHeaderStyle}>COMMISSION</th>
      <th colSpan={cols + 1} style={uplineGroupStyle}>UPLINE COMMISSION</th>
    </>
  );
};

/** Row-2 sub-headers: ADMIN | TDS | TOTAL | L1 | L2 … */
export const SubHeader = ({ transactions = [] }) => {
  const { roles, cols } = getUplineShape(transactions);
  return (
    <>
      <th style={{ ...subThBase, width: 70 }}>ADMIN</th>
      <th style={{ ...subThBase, width: 60 }}>TDS</th>
      <th style={{ ...subThBase, width: 80, background: 'rgba(21,128,61,0.2)', color: '#bbf7d0', borderLeft: '2px solid rgba(21,128,61,0.5)', fontWeight: 900 }}>TOTAL</th>
      {Array.from({ length: cols }, (_, i) => (
        <th key={i} style={{ ...subThBase, width: 80, background: 'rgba(21,128,61,0.15)', color: '#86efac', whiteSpace: 'nowrap' }}>
          {roles[i]?.roleName ? roles[i].roleName.toUpperCase() : `L${i + 1}`}
        </th>
      ))}
    </>
  );
};

/** Body cells: admin | TDS | upline total+ⓘ | per-role cells */
export const Cells = ({ txn, transactions = [], onBreakdown }) => {
  const { cols } = getUplineShape(transactions);
  const breakdown = txn.uplineBreakdown || [];
  const commission = parseFloat(txn.commission) || 0;
  const tds        = parseFloat(txn.tds)        || 0;
  const uplineTotal = txn.uplineCommission != null
    ? parseFloat(txn.uplineCommission)
    : breakdown.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const adminComm = Math.max(0, commission - uplineTotal);

  return (
    <>
      {/* ADMIN */}
      <td style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
        ₹{adminComm.toFixed(2)}
      </td>
      {/* TDS */}
      <td>
        <span style={{ color: '#991B1B', fontWeight: 800, background: '#FEE2E2', padding: '3px 6px', borderRadius: 4, fontSize: '0.75rem' }}>
          ₹{tds.toFixed(2)}
        </span>
      </td>
      {/* UPLINE TOTAL */}
      <td style={{ borderLeft: '2px solid rgba(21,128,61,0.3)', background: 'rgba(240,253,244,0.4)' }}>
        {txn.uplineCommission != null || breakdown.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>
              ₹{uplineTotal.toFixed(2)}
            </span>
            {breakdown.length > 0 && onBreakdown && (
              <button
                onClick={() => onBreakdown(txn)}
                title="View breakdown"
                style={{ width: 15, height: 15, borderRadius: '50%', border: 'none', background: '#1756AA', color: '#fff', fontSize: '0.5rem', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >i</button>
            )}
          </div>
        ) : <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>—</span>}
      </td>
      {/* Per-role cells */}
      {Array.from({ length: cols }, (_, i) => {
        const row = breakdown[i];
        return (
          <td key={i} style={{ background: 'rgba(240,253,244,0.2)', fontSize: '0.72rem' }}>
            {row ? (
              <div>
                <div style={{ fontWeight: 700, color: '#166534' }}>₹{Number(row.amount || 0).toFixed(2)}</div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 75 }} title={row.memberName}>{row.memberName || '—'}</div>
              </div>
            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
          </td>
        );
      })}
    </>
  );
};

export default { GroupHeader, SubHeader, Cells, getUplineShape };
