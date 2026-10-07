import React from 'react';
import { FiX, FiUser, FiActivity, FiAlertCircle } from 'react-icons/fi';
import styles from '../../../../admin/components/MemberPages/MemberPages.module.css';

const maskDocNumber = (docName, docNumber) => {
  if (!docNumber) return '—';
  const nameLower = (docName || '').toLowerCase();
  const cleanNum = String(docNumber).replace(/[\s-]/g, '');
  if (nameLower.includes('aadhar') || nameLower.includes('pan') || nameLower.includes('adhar')) {
    if (cleanNum.length > 4) {
      const last4 = cleanNum.slice(-4);
      const maskedLength = cleanNum.length - 4;
      return `${'X'.repeat(maskedLength)}${last4}`;
    }
  }
  return docNumber;
};

// Backend field casing isn't consistent, and booleans/small numbers
// (isApproved, empid, etc.) can look like "valid" dates to a naive
// `new Date()` call — same fix applied on the admin KYC dossier and the
// member "My Documents" list, kept consistent here.
const isPlausibleDateValue = (val) => {
  if (val === null || val === undefined || val === '') return false;
  if (typeof val === 'boolean') return false;
  if (typeof val === 'number') return val >= 946684800000; // year 2000+ in ms
  if (typeof val !== 'string') return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && d.getFullYear() >= 2000;
};

const findDateByKeywords = (doc, keywords) => {
  if (!doc) return null;
  for (const key of Object.keys(doc)) {
    const lk = key.toLowerCase();
    if (keywords.some(kw => lk.includes(kw)) && isPlausibleDateValue(doc[key])) {
      return doc[key];
    }
  }
  return null;
};

const getUploadDate = (doc) => {
  const known = doc.entrydate || doc.entryDate || doc.createdDate || doc.createddate || doc.addedDate || doc.addeddate;
  if (isPlausibleDateValue(known)) return known;
  return findDateByKeywords(doc, ['entrydate', 'entry_date', 'createddate', 'created_date', 'createdon', 'addeddate', 'adddate', 'uploaddate', 'upload_date', 'insertdate']) || null;
};

// Same localStorage bridge used on the "My Documents" list — the admin KYC
// dossier records the exact approve/reject moment here since the backend
// doesn't return a real timestamp for it. Same origin, same key, so it's
// readable from this popup too.
const ACTION_DATE_STORE_KEY = 'kyc_doc_action_dates';

// Tries the doc.id key first, then falls back to the msrno/name/number
// composite key — the admin side now writes both keys on every approve/reject,
// so this catches the action date even if `id` isn't populated the same way
// across different fetches (admin dossier vs member/API-panel document list).
const getLocalActionDate = (doc, msrno) => {
  try {
    const raw = localStorage.getItem(ACTION_DATE_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (doc?.id !== undefined && doc?.id !== null && doc?.id !== '') {
      const byId = store[String(doc.id)];
      if (byId) return byId;
    }
    const compositeKey = `${msrno ?? ''}_${doc?.docName ?? ''}_${doc?.docNumber ?? ''}`;
    return store[compositeKey] || null;
  } catch (e) {
    return null;
  }
};

const getActionDate = (doc) => {
  const known = doc.statusdate || doc.statusDate || doc.approvedDate || doc.approveddate || doc.updatedDate || doc.updateddate;
  if (isPlausibleDateValue(known)) return known;
  const scanned = findDateByKeywords(doc, ['statusdate', 'status_date', 'approveddate', 'approved_date', 'updateddate', 'updated_date', 'actiondate', 'action_date', 'modifieddate', 'modified_date']);
  if (scanned) return scanned;
  return getLocalActionDate(doc, doc.msrno) || null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Same URL-building rule used by the admin KYC dossier view — the backend
// only sends a relative UploadedFiles path, so it has to be resolved to the
// real file server before it can be used as an <img src>.
const getImageUrl = (path) => {
  if (!path) return null;
  const normalizedPath = String(path).replace(/\\/g, '/');
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;

  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
  if (cleanPath.toLowerCase().startsWith('uploadedfiles/kycdocuments')) {
    const suffix = cleanPath.substring('uploadedfiles/kycdocuments'.length);
    const cleanSuffix = suffix.startsWith('/') ? suffix : '/' + suffix;
    return `https://b2b.bype.in/UploadedFiles/kycdocuments${cleanSuffix}`;
  }
  return `https://b2b.bype.in/UploadedFiles/kycdocuments/${cleanPath}`;
};

const KYCViewModal = ({ isOpen, onClose, doc }) => {
  if (!isOpen || !doc) return null;

  const status = doc.status || 'Pending';
  const bg = status === 'Approved' ? '#ECFDF5' : status === 'Rejected' ? '#FEF2F2' : '#ffffff';
  const border = status === 'Approved' ? '1px solid #10B981' : status === 'Rejected' ? '1px solid #EF4444' : '1px solid #E2E8F0';
  const shadow = status === 'Approved' ? '0 10px 15px -3px rgba(16, 185, 129, 0.05)' : status === 'Rejected' ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)';

  const frontImgUrl = getImageUrl(
    doc.docImage || doc.DocImage ||
    doc.frontImage || doc.FrontImage ||
    doc.frontImageFile || doc.FrontImageFile ||
    doc.frontImagePath || doc.FrontImagePath ||
    doc.frontImageName || doc.FrontImageName ||
    doc.frontDoc || doc.FrontDoc
  );
  const backImgUrl = getImageUrl(
    doc.docImageBack || doc.DocImageBack ||
    doc.backImage || doc.BackImage ||
    doc.backImageFile || doc.BackImageFile ||
    doc.backImagePath || doc.BackImagePath ||
    doc.backImageName || doc.BackImageName ||
    doc.backDoc || doc.BackDoc
  );

  const isTwoSided = doc.documentSide
    ? (parseInt(doc.documentSide) === 2)
    : (!!backImgUrl || (doc.docName && !doc.docName.toLowerCase().includes('pan')));

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={onClose}>
      <div className={styles.modalContainer} style={{
        width: '94%',
        maxWidth: '740px',
        maxHeight: '80vh',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>

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

        <div className={styles.modalBody} style={{ padding: '18px 20px', overflowY: 'auto', flex: 1, background: '#F8FAFC' }}>
          <div
            style={{
              background: bg,
              borderRadius: '18px',
              border: border,
              padding: '16px 18px',
              boxShadow: shadow,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <span style={{
                background: status === 'Approved' ? '#D1FAE5' : status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                color: status === 'Approved' ? '#065F46' : status === 'Rejected' ? '#991B1B' : '#92400E',
                fontWeight: 800,
                fontSize: '0.68rem',
                padding: '5px 12px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div style={{ minWidth: 0 }}>
                <small style={{ color: '#64748B', display: 'block', marginBottom: '4px', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Doc Type</small>
                <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{doc.docName || 'N/A'}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <small style={{ color: '#64748B', display: 'block', marginBottom: '4px', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Doc Number</small>
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{maskDocNumber(doc.docName, doc.docNumber)}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <small style={{ color: '#64748B', display: 'block', marginBottom: '4px', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Submitted</small>
                <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{formatDate(getUploadDate(doc))}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <small style={{ color: '#64748B', display: 'block', marginBottom: '4px', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Action Date</small>
                <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{formatDate(getActionDate(doc))}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isTwoSided ? 'repeat(auto-fit, minmax(230px, 1fr))' : '1fr', gap: '14px', marginBottom: '20px', maxWidth: isTwoSided ? '100%' : '380px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  <FiActivity size={14} style={{ color: '#1756AA' }} /> Document Front
                </label>
                <div style={{
                  height: '130px',
                  background: '#F8FAFF',
                  borderRadius: '16px',
                  border: '2px dashed #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {frontImgUrl ? (
                    <img src={frontImgUrl} alt="Document Front" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>No Front Image</span>
                  )}
                </div>
                {frontImgUrl && (
                  <a href={frontImgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.78rem', color: '#1756AA', fontWeight: 700, textDecoration: 'underline' }}>
                    Open Full Image ↗
                  </a>
                )}
              </div>
              {isTwoSided && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                    <FiActivity size={14} style={{ color: '#1756AA' }} /> Document Back
                  </label>
                  <div style={{
                    height: '130px',
                    background: '#F8FAFF',
                    borderRadius: '16px',
                    border: '2px dashed #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {backImgUrl ? (
                      <img src={backImgUrl} alt="Document Back" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>No Back Image</span>
                    )}
                  </div>
                  {backImgUrl && (
                    <a href={backImgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.78rem', color: '#1756AA', fontWeight: 700, textDecoration: 'underline' }}>
                      Open Full Image ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {status === 'Rejected' && doc.reason && doc.reason !== '-' && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#FEF2F2', borderRadius: '14px', borderLeft: '4px solid #EF4444', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiAlertCircle style={{ color: '#EF4444' }} size={18} />
                <div>
                  <small style={{ color: '#991B1B', fontWeight: 700, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rejection Reason</small>
                  <span style={{ fontSize: '0.82rem', color: '#7F1D1D', fontWeight: 500 }}>{doc.reason}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter} style={{ padding: '14px 24px', background: '#ffffff', borderTop: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
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
