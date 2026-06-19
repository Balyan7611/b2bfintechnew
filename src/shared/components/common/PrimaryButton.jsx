import React from 'react';

const PrimaryButton = ({ children, onClick, disabled, style, className, type = 'button', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: disabled ? '#64748B' : 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 18px',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(30, 58, 138, 0.2)',
        transition: 'all 0.3s ease',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
