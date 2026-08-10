import React from 'react';
import { FiCheck, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const PopupModal = ({ show, type = 'success', title, message, onClose }) => {
  if (!show) return null;

  const config = {
    success: {
      bg: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
      iconBg: '#16A34A',
      titleColor: '#14532D',
      msgColor: '#166534',
      btnBg: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
      shadow: 'rgba(22,163,74,0.35)',
      icon: <FiCheck size={22} color="#fff" />,
    },
    error: {
      bg: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
      iconBg: '#EF4444',
      titleColor: '#7F1D1D',
      msgColor: '#991B1B',
      btnBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      shadow: 'rgba(239,68,68,0.35)',
      icon: <FiXCircle size={22} color="#fff" />,
    },
    warning: {
      bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEFCE8 100%)',
      iconBg: '#F59E0B',
      titleColor: '#78350F',
      msgColor: '#92400E',
      btnBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      shadow: 'rgba(245,158,11,0.35)',
      icon: <FiAlertCircle size={22} color="#fff" />,
    },
    info: {
      bg: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
      iconBg: '#3B82F6',
      titleColor: '#1E3A5F',
      msgColor: '#1E40AF',
      btnBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      shadow: 'rgba(59,130,246,0.35)',
      icon: <FiInfo size={22} color="#fff" />,
    },
  };

  const c = config[type] || config.success;

  return (
    <div
      onClick={onClose}
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
            {c.icon}
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: c.titleColor }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: c.msgColor, fontWeight: 500, lineHeight: 1.55 }}>
            {message}
          </p>
        </div>

                <div style={{ padding: '18px 28px 24px', textAlign: 'center', background: '#fff' }}>
          <button
            onClick={onClose}
            style={{
              background: c.btnBg,
              color: '#fff', border: 'none',
              borderRadius: '10px',
              padding: '11px 40px',
              fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${c.shadow}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${c.shadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${c.shadow}`; }}
          >
            OK, Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export const usePopup = () => {
  const [popup, setPopup] = React.useState({ show: false, type: 'success', title: '', message: '' });
  const showPopup = (type, title, message) => setPopup({ show: true, type, title, message });
  const closePopup = () => setPopup(p => ({ ...p, show: false }));
  return { popup, showPopup, closePopup };
};

export default PopupModal;
