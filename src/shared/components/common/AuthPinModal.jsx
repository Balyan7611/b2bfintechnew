import React, { useState, useRef, useEffect } from 'react';
import { FaShieldAlt, FaTimes, FaLock, FaMobileAlt, FaSpinner } from 'react-icons/fa';

/**
 * AuthPinModal — Reusable TPIN / OTP confirmation modal.
 *
 * Props:
 *   isOpen        {boolean}   — show/hide
 *   onClose       {function}  — called on cancel / backdrop click
 *   onConfirm     {function(authMode, authCode) => Promise<void>}
 *   title         {string}    — modal heading
 *   description   {string}    — sub-heading / context text
 *   amount        {number}    — optional: highlight amount being transacted
 *   loading       {boolean}   — external loading flag (optional)
 */
const AuthPinModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Transaction',
  description = 'Enter your 4-digit TPIN or OTP to authorise this transaction.',
  amount = null,
  loading: externalLoading = false,
}) => {
  const [mode, setMode] = useState('TPIN'); // 'TPIN' | 'OTP'
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setMode('TPIN');
      setLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 120);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[idx] = digit;
    setPin(next);
    setError('');
    if (digit && idx < 3) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (pin[idx]) {
        const next = [...pin]; next[idx] = ''; setPin(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 3) inputRefs.current[idx + 1]?.focus();
  };

  // Handle paste — fill boxes from clipboard
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const next = ['', '', '', ''];
    text.split('').forEach((c, i) => { next[i] = c; });
    setPin(next);
    inputRefs.current[Math.min(text.length, 3)]?.focus();
  };

  const handleSubmit = async () => {
    const code = pin.join('');
    if (code.length < 4) { setError(`Please enter all 4 digits of your ${mode}`); return; }
    setError('');
    setLoading(true);
    try {
      await onConfirm(mode, code);
    } catch (err) {
      setError(err?.message || 'Authorization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => !isLoading && onClose()}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,20,50,0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 9000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9001,
        width: '100%', maxWidth: 420,
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 30px 80px rgba(10,20,50,0.28)',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A1428 0%, #1756AA 100%)',
          padding: '20px 24px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FaShieldAlt style={{ color: '#C9A84C', fontSize: '1.1rem' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>{title}</h3>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{description}</p>
          </div>
          <button onClick={() => !isLoading && onClose()} style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
            width: 30, height: 30, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
          }}>
            <FaTimes />
          </button>
        </div>

        {/* Amount highlight */}
        {amount != null && (
          <div style={{
            background: 'linear-gradient(90deg, #f0fdf4, #dcfce7)',
            borderBottom: '1px solid #bbf7d0',
            padding: '10px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>Transaction Amount</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d' }}>
              ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '24px 24px 20px' }}>

          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: '#f1f5f9', borderRadius: 10,
            padding: 4, marginBottom: 22, gap: 4,
          }}>
            {['TPIN', 'OTP'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setPin(['','','','']); setError(''); setTimeout(() => inputRefs.current[0]?.focus(), 80); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: mode === m ? '#1756AA' : 'transparent',
                  color: mode === m ? '#fff' : '#64748b',
                  boxShadow: mode === m ? '0 2px 8px rgba(23,86,170,0.3)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {m === 'TPIN' ? <FaLock style={{ fontSize: '0.72rem' }} /> : <FaMobileAlt style={{ fontSize: '0.72rem' }} />}
                {m}
              </button>
            ))}
          </div>

          {/* Label */}
          <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
            {mode === 'TPIN'
              ? 'Enter your 4-digit Transaction PIN'
              : 'Enter the 4-digit OTP sent to your registered mobile'}
          </p>

          {/* Pin boxes */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 6 }}>
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigit(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                onPaste={handlePaste}
                style={{
                  width: 54, height: 58,
                  textAlign: 'center', fontSize: '1.5rem', fontWeight: 900,
                  border: error ? '2px solid #ef4444' : digit ? '2px solid #1756AA' : '2px solid #e2e8f0',
                  borderRadius: 12, outline: 'none',
                  background: digit ? '#eff6ff' : '#f8fafc',
                  color: '#0A1428',
                  transition: 'all 0.15s',
                  caretColor: 'transparent',
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
              ⚠ {error}
            </p>
          )}

          {/* Confirm button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || pin.join('').length < 4}
            style={{
              width: '100%', marginTop: 20, padding: '13px 0',
              background: isLoading || pin.join('').length < 4
                ? '#94a3b8'
                : 'linear-gradient(135deg, #1756AA 0%, #0A1428 100%)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 800, fontSize: '0.92rem', cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: pin.join('').length === 4 && !isLoading ? '0 6px 18px rgba(23,86,170,0.35)' : 'none',
            }}
          >
            {isLoading
              ? <><FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying…</>
              : <><FaShieldAlt /> Confirm & Proceed</>}
          </button>

          <button
            onClick={() => !isLoading && onClose()}
            style={{
              width: '100%', marginTop: 10, padding: '10px 0',
              background: 'transparent', border: '1px solid #e2e8f0',
              borderRadius: 12, color: '#64748b', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
};

export default AuthPinModal;
