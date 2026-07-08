import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiAlertTriangle, FiCheckCircle, FiActivity, FiFileText, FiFile, FiSettings } from 'react-icons/fi';

const ActionMenu = ({ txn, onViewReceipt, onAction, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const menuRef = useRef(null);
  const portalRef = useRef(null);

  const [menuCoords, setMenuCoords] = useState(null);

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };

    const handleMouseDown = (e) => {
      if (portalRef.current && portalRef.current.contains(e.target)) {
        return; // Let the onClick handler of the item take care of it
      }
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return; // Button click will be handled by toggleMenu
      }
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
      const isTop = spaceBelow < 240;
      
      setDropdownPosition(isTop ? 'top' : 'bottom');
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
    } else if (onAction) {
      onAction(actionName, txn);
    } else {
      alert(`${actionName} triggered for transaction ${txn.id || txn.orderId || 'N/A'}`);
    }
  };

  const menuActions = actions || [
    { name: 'Force Fail', icon: <FiAlertTriangle size={14} color="#EF4444" />, className: 'danger', value: 'Force Fail' },
    { name: 'Force Success', icon: <FiCheckCircle size={14} color="#22C55E" />, className: 'success', value: 'Force Success' },
    { name: 'Check Status', icon: <FiActivity size={14} color="#3B82F6" />, value: 'Check Status' },
    { name: 'Get Logs', icon: <FiFileText size={14} color="#6366F1" />, value: 'Get Logs' },
    { name: 'View Receipt', icon: <FiFile size={14} color="#8B5CF6" />, value: 'receipt' }
  ];

  const isTop = dropdownPosition === 'top';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      <button
        onClick={toggleMenu}
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          padding: '5px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)';
        }}
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
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 16px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          minWidth: '175px',
          zIndex: 999999,
          overflow: 'visible',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          animation: isTop ? 'fadeInMenuTop 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'fadeInMenuBottom 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: isTop ? 'auto' : '-5px',
            bottom: isTop ? '-5px' : 'auto',
            left: '30%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: 'white',
            // Border sides based on position
            borderLeft: isTop ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
            borderTop: isTop ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
            borderRight: isTop ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
            borderBottom: isTop ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
            zIndex: -1
          }} />

          <style>{`
            @keyframes fadeInMenuBottom {
              from { opacity: 0; transform: translate(-30%, -8px) scale(0.95); }
              to { opacity: 1; transform: translate(-30%, 0) scale(1); }
            }
            @keyframes fadeInMenuTop {
              from { opacity: 0; transform: translate(-30%, 8px) scale(0.95); }
              to { opacity: 1; transform: translate(-30%, 0) scale(1); }
            }
            .action-menu-item {
              padding: 10px 14px;
              font-size: 0.8rem;
              font-weight: 600;
              color: #475569;
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: all 0.2s ease;
              border-bottom: 1px solid rgba(241, 245, 249, 0.8);
              text-align: left;
            }
            .action-menu-item:first-child {
              border-top-left-radius: 12px;
              border-top-right-radius: 12px;
            }
            .action-menu-item:last-child {
              border-bottom: none;
              border-bottom-left-radius: 12px;
              border-bottom-right-radius: 12px;
            }
            .action-menu-item:hover {
              background: #F8FAFC;
              color: #0F172A;
              padding-left: 16px;
            }
            .action-menu-item.danger:hover {
              background: #FEF2F2;
              color: #DC2626;
            }
            .action-menu-item.success:hover {
              background: #F0FDF4;
              color: #16A34A;
            }
          `}</style>
          
          {menuActions.map((action, index) => (
            <div 
              key={index}
              className={`action-menu-item ${action.className || ''}`} 
              onClick={() => handleActionClick(action.value)}
            >
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
  );
};

export default ActionMenu;