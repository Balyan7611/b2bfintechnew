import React, { useState, useRef, useEffect } from 'react';
import {
  FiGlobe, FiCheckCircle, FiXCircle, FiClock,
  FiRefreshCw, FiSave, FiRotateCcw, FiSettings, FiZap,
  FiRupeeSign, FiBarChart2, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import styles from '../MemberPages/MemberPages.module.css';

// ─── ACCORDION SECTION (moved OUTSIDE the parent component) ───────────
// This was the root cause of every glitch: when a component is defined
// INSIDE another component's function body, React treats it as a brand
// new component type on every re-render (every keystroke, every state
// change). That forces React to unmount + remount the whole subtree —
// which is why fields "jumped"/scrolled and why opening a dropdown wiped
// out data in other fields. Defining it here, once, fixes all of that.
const Section = ({ id, label, icon, isOpen, onToggle, sectionRef, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState('0px');

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isOpen, children]);

  return (
    <div
      ref={sectionRef}
      style={{
        marginBottom: '12px',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
        scrollMarginTop: '20px',
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '14px 20px',
          background: '#F9FAFC',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: '#1756AA',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#F9FAFC')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon} {label}
        </span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>

      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: height,
        }}
      >
        <div ref={contentRef} style={{ padding: '20px 20px 24px', background: '#fff' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── TOAST (also moved outside) ────────────────────────────────────────
const Toast = ({ show, message }) =>
  show && (
    <div
      style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        background: '#10B981', color: '#fff', padding: '15px 25px',
        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600,
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <FiCheckCircle size={20} /> {message}
    </div>
  );

// ─── CONFIRM MODAL (also moved outside) ────────────────────────────────
const ConfirmModal = ({ show, onCancel, onConfirm }) =>
  show && (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff', padding: '30px', borderRadius: '15px',
          width: '90%', maxWidth: '400px', textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'scaleIn 0.2s ease-out',
        }}
      >
        <div
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: '#FEE2E2', color: '#EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '1.8rem',
          }}
        >
          <FiRotateCcw />
        </div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>
          Reset Form?
        </h3>
        <p style={{ margin: '0 0 25px 0', color: '#64748B', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Are you sure you want to clear all the fields? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0',
              background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer', flex: 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: '#EF4444', color: '#fff', fontWeight: 600, cursor: 'pointer', flex: 1,
            }}
          >
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  );

const initialFormState = {
  apiType: '',
  apiName: '',
  splitter: '',
  rechargeUrl: '',
  format: '',
  version: '',
  param3: '',
  param4: '',
  param5: '',
  param6: '',
  param7: '',
  param8: '',
  txIdPos: '',
  statusPos: '',
  opRefPos: '',
  successMsg: '',
  failedMsg: '',
  pendingMsg: '',
  balanceUrl: '',
  balanceUid: '',
  balancePin: '',
  balancePos: '',
  statusUrl: '',
  statusUid: '',
  statusPin: '',
  statusPosField: '',
  apiTxnPos: '',
  opRefPosStatus: '',
  statusParam3: '',
  statusParam4: '',
};

const AddAPI = () => {
  // ─── ALL FORM STATE ──────────────────────────────
  const [form, setForm] = useState(initialFormState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '' });
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── ACCORDION STATE ──────────────────────────────
  const [open, setOpen] = useState({
    general: true,
    recharge: false,
    balance: false,
    status: false,
  });

  const generalRef = useRef(null);
  const rechargeRef = useRef(null);
  const balanceRef = useRef(null);
  const statusRef = useRef(null);

  const sectionRefs = { general: generalRef, recharge: rechargeRef, balance: balanceRef, status: statusRef };

  const prevOpen = useRef(open);
  const firstRender = useRef(true);

  // ─── AUTO-SCROLL ON OPEN ──────────────────────────
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      prevOpen.current = open;
      return;
    }
    const prev = prevOpen.current;
    const opened = Object.keys(open).find((k) => open[k] === true && prev[k] === false);
    if (opened && sectionRefs[opened]?.current) {
      sectionRefs[opened].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    prevOpen.current = open;
  }, [open]);

  const toggle = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── HANDLERS ──────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast({ show: true, message: '✅ API Integration Submitted!' });
      setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
      console.log('Submitted Data:', form);
    }, 1500);
  };

  const handleReset = () => {
    setShowConfirm(true);
  };

  const confirmReset = () => {
    setForm(initialFormState);
    setShowConfirm(false);
    setOpen({ general: true, recharge: false, balance: false, status: false });
  };

  const spinStyle = { animation: 'spin 1s linear infinite' };

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <Toast show={showToast.show} message={showToast.message} />
      <ConfirmModal show={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={confirmReset} />

      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', borderBottom: '1px solid #F1F5F9', marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>API Integration</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 25px 30px 25px' }}>

          {/* ─── GENERAL ──────────────────────────── */}
          <Section id="general" label="General Information" icon={<FiSettings />} isOpen={open.general} onToggle={toggle} sectionRef={generalRef}>
            <div className={styles.formGrid3} style={{ marginBottom: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>API Type *</label>
                <select name="apiType" value={form.apiType} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }}>
                  <option value="">-- Select API Type --</option>
                  <option value="get">GET</option>
                  <option value="post">POST</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>API Name *</label>
                <input type="text" name="apiName" value={form.apiName} onChange={handleChange} placeholder="Enter API Name" className={styles.inputControl} style={{ height: '42px' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Splitter *</label>
                <input type="text" name="splitter" value={form.splitter} onChange={handleChange} placeholder="e.g. | or ," className={styles.inputControl} style={{ height: '42px' }} />
              </div>
            </div>
            <div className={styles.formGrid3}>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.label}>Recharge URL *</label>
                <div className={styles.inputWrap}>
                  <FiGlobe className={styles.inputIcon} />
                  <input type="text" name="rechargeUrl" value={form.rechargeUrl} onChange={handleChange} placeholder="Enter Recharge URL" className={styles.inputControl} style={{ height: '42px', paddingLeft: '40px' }} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Format / Version</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" name="format" value={form.format} onChange={handleChange} placeholder="format" className={styles.inputControl} style={{ height: '42px' }} />
                  <input type="text" name="version" value={form.version} onChange={handleChange} placeholder="version" className={styles.inputControl} style={{ height: '42px' }} />
                </div>
              </div>
            </div>
          </Section>

          {/* ─── RECHARGE ─────────────────────────── */}
          <Section id="recharge" label="Recharge API Parameters" icon={<FiZap />} isOpen={open.recharge} onToggle={toggle} sectionRef={rechargeRef}>
            <div className={styles.formGrid3} style={{ marginBottom: '20px' }}>
              {[3, 4, 5, 6, 7, 8].map((num) => (
                <div key={num} className={styles.formGroup}>
                  <label className={styles.label}>Parameter {num} *</label>
                  <input type="text" name={`param${num}`} value={form[`param${num}`]} onChange={handleChange} placeholder={`Param ${num}`} className={styles.inputControl} style={{ height: '42px' }} />
                </div>
              ))}
            </div>
            <div className={styles.formGrid3} style={{ marginBottom: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>TxID Position</label>
                <input type="text" name="txIdPos" value={form.txIdPos} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Status Position</label>
                <input type="text" name="statusPos" value={form.statusPos} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Op. Ref Position</label>
                <input type="text" name="opRefPos" value={form.opRefPos} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }} />
              </div>
            </div>
            <div className={styles.formGrid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}><FiCheckCircle color="#27AE60" /> Status Msg (Success)</label>
                <input type="text" name="successMsg" value={form.successMsg} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><FiXCircle color="#E53E3E" /> Status Msg (Failed)</label>
                <input type="text" name="failedMsg" value={form.failedMsg} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><FiClock color="#F6AD55" /> Status Msg (Pending)</label>
                <input type="text" name="pendingMsg" value={form.pendingMsg} onChange={handleChange} className={styles.inputControl} style={{ height: '42px' }} />
              </div>
            </div>
          </Section>

        {/* ─── BALANCE ──────────────────────────── */}
          <Section
            id="balance"
            label="Balance API Parameters"
            icon={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹</span>}
            isOpen={open.balance}
            onToggle={toggle}
            sectionRef={balanceRef}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Balance URL</label>
                <input type="text" name="balanceUrl" value={form.balanceUrl} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className={styles.formGroup}><label className={styles.label}>UID</label><input type="text" name="balanceUid" value={form.balanceUid} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
                <div className={styles.formGroup}><label className={styles.label}>PIN</label><input type="text" name="balancePin" value={form.balancePin} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
              </div>
              <div className={styles.formGroup}><label className={styles.label}>Balance Position</label><input type="text" name="balancePos" value={form.balancePos} onChange={handleChange} className={styles.inputControl} style={{ height: '40px', width: '100%' }} /></div>
            </div>
          </Section>

          {/* ─── STATUS ───────────────────────────── */}
          <Section id="status" label="Status API Parameters" icon={<FiBarChart2 />} isOpen={open.status} onToggle={toggle} sectionRef={statusRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Status URL</label>
                <input type="text" name="statusUrl" value={form.statusUrl} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className={styles.formGroup}><label className={styles.label}>UID</label><input type="text" name="statusUid" value={form.statusUid} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
                <div className={styles.formGroup}><label className={styles.label}>PIN</label><input type="text" name="statusPin" value={form.statusPin} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className={styles.formGroup}><label className={styles.label}>Status Pos.</label><input type="text" name="statusPosField" value={form.statusPosField} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
                <div className={styles.formGroup}><label className={styles.label}>API TXN Pos.</label><input type="text" name="apiTxnPos" value={form.apiTxnPos} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Op. Ref Pos.</label><input type="text" name="opRefPosStatus" value={form.opRefPosStatus} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className={styles.formGroup}><label className={styles.label}>Parameter 3</label><input type="text" name="statusParam3" value={form.statusParam3} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Parameter 4</label><input type="text" name="statusParam4" value={form.statusParam4} onChange={handleChange} className={styles.inputControl} style={{ height: '40px' }} /></div>
              </div>
            </div>
          </Section>

          {/* ─── BUTTONS ───────────────────────────── */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: isSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.2)',
                minWidth: '150px', justifyContent: 'center',
              }}
            >
              {isSubmitting ? <FiRefreshCw style={spinStyle} /> : <FiSave />}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Integration'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#F1F5F9', color: '#4E6080', minWidth: '150px',
                border: 'none', borderRadius: '10px', padding: '12px 32px',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                justifyContent: 'center',
              }}
            >
              <FiRotateCcw /> Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAPI;