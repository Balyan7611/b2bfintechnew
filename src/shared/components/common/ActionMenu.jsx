import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiAlertTriangle, FiCheckCircle, FiActivity, FiFileText, FiFile, FiSettings, FiX } from 'react-icons/fi';

/* ── UTR / Reason input popup ─────────────────────────────────── */
const ForceActionModal = ({ action, onConfirm, onCancel }) => {
  const [utr, setUtr]       = useState('');
  const [reason, setReason] = useState('');
  const isSuccess = action === 'Force Success';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSuccess && !utr.trim()) return;
    if (!reason.trim()) return;
    onConfirm({ utr: utr.trim(), reason: reason.trim() });
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999999,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}
      onClick={onCancel}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '28px 28px 24px',
        width: '90%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        position: 'relative'
      }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: isSuccess ? '#DCFCE7' : '#FEE2E2',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {isSuccess
              ? <FiCheckCircle size={18} color="#16A34A" />
              : <FiAlertTriangle size={18} color="#DC2626" />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{action}</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
              {isSuccess ? 'Enter UTR and reason to mark as success' : 'Enter reason to mark as failed'}
            </p>
          </div>
          <button onClick={onCancel} style={{
            marginLeft: 'auto', border: 'none', background: '#F1F5F9',
            borderRadius: '8px', width: '30px', height: '30px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiX size={14} color="#64748B" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSuccess && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                UTR Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={utr}
                onChange={e => setUtr(e.target.value.replace(/\s/g, '').toUpperCase())}
                placeholder="Enter UTR / Reference Number"
                autoFocus
                required
                style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid #CBD5E1',
                  borderRadius: '8px', outline: 'none', fontSize: '0.9rem',
                  fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px',
                  boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = '#1756AA')}
                onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Reason <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={isSuccess ? 'Reason for marking success…' : 'Reason for marking failed…'}
              required
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #CBD5E1',
                borderRadius: '8px', outline: 'none', fontSize: '0.88rem', resize: 'vertical',
                fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              onFocus={e => (e.target.style.borderColor = '#1756AA')}
              onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #E2E8F0',
              background: '#F8FAFC', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
            }}>Cancel</button>
            <button type="submit" style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: isSuccess ? 'linear-gradient(135deg,#16A34A,#15803D)' : 'linear-gradient(135deg,#DC2626,#B91C1C)',
              color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              boxShadow: isSuccess ? '0 4px 12px rgba(22,163,74,0.3)' : '0 4px 12px rgba(220,38,38,0.3)'
            }}>
              Confirm {action}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

/* ── Main ActionMenu ──────────────────────────────────────────── */
const ActionMenu = ({ txn, onViewReceipt, onAction, actions }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const [menuCoords, setMenuCoords] = useState(null);
  const [forceModal, setForceModal] = useState(null); // { action: 'Force Success' | 'Force Fail' }

  const menuRef   = useRef(null);
  const portalRef = useRef(null);

  const txnStatus = String(txn?.status || '').toLowerCase();
  const isPending = txnStatus === 'pending' || txnStatus === '';

  useEffect(() => {
    const handleScrollOrResize = () => { if (isOpen) setIsOpen(false); };
    const handleMouseDown = (e) => {
      if (portalRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      document.addEventListener('mousedown', handleMouseDown);
    }
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 240 ? 'top' : 'bottom');
      setMenuCoords({
        top: rect.bottom + 8,
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left + (rect.width / 2)
      });
    }
    setIsOpen(!isOpen);
  };

  const handleActionClick = (actionName) => {
    setIsOpen(false);
    if (actionName === 'receipt' && onViewReceipt) {
      onViewReceipt(txn);
    } else if (actionName === 'Force Success' || actionName === 'Force Fail') {
      setForceModal({ action: actionName });
    } else if (onAction) {
      onAction(actionName, txn);
    }
  };

  const handleForceConfirm = ({ utr, reason }) => {
    const { action } = forceModal;
    setForceModal(null);
    if (onAction) onAction(action, txn, { utr, reason });
  };

  // Build action list — hide Force Success/Fail for non-pending txns
  const defaultActions = [
    ...( isPending ? [
      { name: 'Force Fail',    icon: <FiAlertTriangle size={14} color="#EF4444" />, className: 'danger',  value: 'Force Fail' },
      { name: 'Force Success', icon: <FiCheckCircle   size={14} color="#22C55E" />, className: 'success', value: 'Force Success' },
    ] : []),
    { name: 'Check Status', icon: <FiActivity  size={14} color="#3B82F6" />, value: 'Check Status' },
    { name: 'Get Logs',     icon: <FiFileText  size={14} color="#6366F1" />, value: 'Get Logs' },
    { name: 'View Receipt', icon: <FiFile      size={14} color="#8B5CF6" />, value: 'receipt' }
  ];
  const menuActions = actions || defaultActions;

  const isTop = dropdownPosition === 'top';

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
        <button
          onClick={toggleMenu}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white', border: 'none', padding: '5px 12px',
            borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 6px -1px rgba(16,185,129,0.2)',
            transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Action
          <FiChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>

        {isOpen && menuCoords && createPortal(
          <div
            ref={portalRef}
            style={{
              position: 'fixed',
              top: isTop ? 'auto' : `${menuCoords.top}px`,
              bottom: isTop ? `${menuCoords.bottom}px` : 'auto',
              left: `${menuCoords.left}px`,
              transform: 'translateX(-30%)',
              background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
              minWidth: '175px', zIndex: 999999, border: '1px solid rgba(226,232,240,0.8)',
              animation: isTop ? 'fadeInMenuTop 0.2s' : 'fadeInMenuBottom 0.2s'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              position: 'absolute', top: isTop ? 'auto' : '-5px', bottom: isTop ? '-5px' : 'auto',
              left: '30%', transform: 'translateX(-50%) rotate(45deg)',
              width: '10px', height: '10px', background: 'white', zIndex: -1,
              borderLeft: isTop ? 'none' : '1px solid rgba(226,232,240,0.8)',
              borderTop: isTop ? 'none' : '1px solid rgba(226,232,240,0.8)',
              borderRight: isTop ? '1px solid rgba(226,232,240,0.8)' : 'none',
              borderBottom: isTop ? '1px solid rgba(226,232,240,0.8)' : 'none',
            }} />

            <style>{`
              @keyframes fadeInMenuBottom { from { opacity:0; transform:translate(-30%,-8px) scale(0.95); } to { opacity:1; transform:translate(-30%,0) scale(1); } }
              @keyframes fadeInMenuTop    { from { opacity:0; transform:translate(-30%, 8px) scale(0.95); } to { opacity:1; transform:translate(-30%,0) scale(1); } }
              .action-menu-item { padding:10px 14px; font-size:0.8rem; font-weight:600; color:#475569; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 0.2s ease; border-bottom:1px solid rgba(241,245,249,0.8); text-align:left; }
              .action-menu-item:first-child { border-top-left-radius:12px; border-top-right-radius:12px; }
              .action-menu-item:last-child  { border-bottom:none; border-bottom-left-radius:12px; border-bottom-right-radius:12px; }
              .action-menu-item:hover { background:#F8FAFC; color:#0F172A; padding-left:16px; }
              .action-menu-item.danger:hover  { background:#FEF2F2; color:#DC2626; }
              .action-menu-item.success:hover { background:#F0FDF4; color:#16A34A; }
            `}</style>

            {menuActions.map((action, i) => (
              <div key={i} className={`action-menu-item ${action.className || ''}`} onClick={() => handleActionClick(action.value)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', minWidth: '16px' }}>
                  {action.icon || <FiSettings size={14} color="#64748B" />}
                </span>
                <span>{action.name}</span>
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>

      {forceModal && (
        <ForceActionModal
          action={forceModal.action}
          onConfirm={handleForceConfirm}
          onCancel={() => setForceModal(null)}
        />
      )}
    </>
  );
};

export default ActionMenu;
