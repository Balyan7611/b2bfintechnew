import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Reusable Upline Commission Breakdown Portal
 * Renders via ReactDOM.createPortal into document.body to escape
 * any parent overflow/transform that would trap fixed positioning.
 *
 * Props:
 *   txn       — transaction object with uplineCommission & uplineBreakdown
 *   onClose   — function to close the modal
 */
const UplineBreakdownPortal = ({ txn, onClose }) => {
  if (!txn) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,20,50,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9500,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 9501,
        width: '100%', maxWidth: 480,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(10,20,50,0.28)',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#0A1428,#1756AA)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 800 }}>Upline Commission Breakdown</h3>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>
              TXN: {txn.orderId || txn.txnId || txn.transactionId || '—'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✕</button>
        </div>

        {/* Total */}
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>Total Upline Earning</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>
            ₹{Number(txn.uplineCommission || 0).toFixed(2)}
          </span>
        </div>

        {/* Breakdown list */}
        <div style={{ padding: '12px 20px 20px', maxHeight: 340, overflowY: 'auto' }}>
          {Array.isArray(txn.uplineBreakdown) && txn.uplineBreakdown.length > 0 ? (
            txn.uplineBreakdown.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 8, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                {/* Level badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: i === 0
                    ? 'linear-gradient(135deg,#1756AA,#0A1428)'
                    : i === 1
                    ? 'linear-gradient(135deg,#7c3aed,#4c1d95)'
                    : 'linear-gradient(135deg,#0891b2,#0e7490)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 900,
                }}>
                  L{row.levelNo || i + 1}
                </div>

                {/* Member info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.memberName || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                    {row.roleName || `Level ${row.levelNo || i + 1}`}
                    {row.memberMobile ? ` · ${row.memberMobile}` : ''}
                  </div>
                </div>

                {/* Amount + time */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d' }}>
                    +₹{Number(row.amount || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 1 }}>
                    {row.createdOn
                      ? new Date(row.createdOn).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '20px 0' }}>No breakdown data available</p>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default UplineBreakdownPortal;
