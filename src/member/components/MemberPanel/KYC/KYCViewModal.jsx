import React from 'react';
import { FiX, FiUser, FiActivity, FiAlertCircle } from 'react-icons/fi';
import styles from '../../../../admin/components/MemberPages/MemberPages.module.css';

const KYCViewModal = ({ isOpen, onClose, doc }) => {
  if (!isOpen || !doc) return null;

  const status = doc.status || 'Pending';
  const bg = status === 'Approved' ? '#ECFDF5' : status === 'Rejected' ? '#FEF2F2' : '#ffffff';
  const border = status === 'Approved' ? '1px solid #10B981' : status === 'Rejected' ? '1px solid #EF4444' : '1px solid #E2E8F0';
  const shadow = status === 'Approved' ? '0 10px 15px -3px rgba(16, 185, 129, 0.05)' : status === 'Rejected' ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)';

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={onClose}>
      <div className={styles.modalContainer} style={{ 
        width: '95%', 
        maxWidth: '1000px', 
        height: '95vh', 
        maxHeight: '900px',
        borderRadius: '24px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={styles.modalHeader} style={{ 
          padding: '16px 24px', 
          background: '#ffffff', 
          borderBottom: '1px solid #E2E8F0', 
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, rgba(23, 86, 170, 0.1) 0%, rgba(23, 86, 170, 0.2) 100%)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#1756AA' 
            }}>
              <FiUser size={20} />
            </div>
            <div>
              <h3 className={styles.modalTitle} style={{ fontSize: '1.15rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>KYC Document Details</h3>
              <p className={styles.modalSubtitle} style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>Reviewing uploaded proof</p>
            </div>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: '#F1F5F9', 
              border: 'none', 
              color: '#64748B', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody} style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#F8FAFC' }}>
          <div 
            style={{ 
              background: bg, 
              borderRadius: '20px', 
              border: border, 
              padding: '24px', 
              boxShadow: shadow, 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', flex: 1 }}>
                <div>
                  <small style={{ color: '#64748B', display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</small>
                  <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.95rem' }}>{doc.documentName}</span>
                </div>
                <div>
                  <small style={{ color: '#64748B', display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Number</small>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>XXXX-XXXX-1234</span>
                </div>
                <div>
                  <small style={{ color: '#64748B', display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Date</small>
                  <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>{doc.addDate}</span>
                </div>
              </div>
              <div>
                <span style={{
                  background: status === 'Approved' ? '#D1FAE5' : status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                  color: status === 'Approved' ? '#065F46' : status === 'Rejected' ? '#991B1B' : '#92400E',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {status}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  <FiActivity size={14} style={{ color: '#1756AA' }} /> Document Front
                </label>
                <div style={{ 
                  height: '240px', 
                  background: '#F8FAFF', 
                  borderRadius: '16px', 
                  border: '2px dashed #CBD5E1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {doc.imageUrl ? (
                    <img src={doc.imageUrl} alt="Document Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>[IMAGE PREVIEW]</span>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  <FiActivity size={14} style={{ color: '#1756AA' }} /> Document Back
                </label>
                <div style={{ 
                  height: '240px', 
                  background: '#F8FAFF', 
                  borderRadius: '16px', 
                  border: '2px dashed #CBD5E1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {doc.imageUrl ? (
                    <img src={doc.imageUrl} alt="Document Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>[IMAGE PREVIEW]</span>
                  )}
                </div>
              </div>
            </div>

            {status === 'Rejected' && doc.reason && doc.reason !== '-' && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#FEF2F2', borderRadius: '16px', borderLeft: '4px solid #EF4444', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <FiAlertCircle style={{ color: '#EF4444' }} size={20} />
                <div>
                  <small style={{ color: '#991B1B', fontWeight: 700, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</small>
                  <span style={{ fontSize: '0.9rem', color: '#7F1D1D', fontWeight: 500 }}>{doc.reason}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter} style={{ padding: '20px 24px', background: '#ffffff', borderTop: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              background: '#1756AA', 
              color: '#ffffff', 
              border: 'none', 
              padding: '10px 28px', 
              borderRadius: '10px', 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(23, 86, 170, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCViewModal;
