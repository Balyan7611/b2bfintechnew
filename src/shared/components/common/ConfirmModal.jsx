import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText = 'Yes, I am sure', type = 'warning', details = null }) => {
  if (!show) return null;

  const isDanger = type === 'danger';
  const bgColors = {
    warning: { bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEFCE8 100%)', iconBg: '#F59E0B', shadow: 'rgba(245,158,11,0.35)', btn: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    danger: { bg: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)', iconBg: '#EF4444', shadow: 'rgba(239,68,68,0.35)', btn: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
    success: { bg: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)', iconBg: '#16A34A', shadow: 'rgba(22,163,74,0.35)', btn: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)' }
  };
  
  const c = bgColors[type] || bgColors.warning;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '20px',
          width: '380px',
          maxWidth: '92vw',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
      >
        <div style={{ background: c.bg, padding: '32px 28px 22px', textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: c.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${c.shadow}`,
          }}>
            <FiHelpCircle size={28} color="#fff" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', fontWeight: 500, lineHeight: 1.55 }}>
            {message}
          </p>
          
          {details && (
            <div style={{ marginTop: '16px', background: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>{key}:</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '18px 28px 24px', display: 'flex', gap: '12px', background: '#fff' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: '#F1F5F9', color: '#475569', border: 'none',
              borderRadius: '10px', padding: '11px 0', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: c.btn, color: '#fff', border: 'none',
              borderRadius: '10px', padding: '11px 0', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: `0 4px 14px ${c.shadow}`, transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${c.shadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${c.shadow}`; }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
