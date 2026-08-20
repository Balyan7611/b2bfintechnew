import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  FiUploadCloud, FiEye, FiTrash2, FiAlertTriangle
} from 'react-icons/fi';
import AdminTable from '../../../../shared/components/common/AdminTable';
import KYCUploadModal from './KYCUploadModal';
import KYCViewModal from './KYCViewModal';
import axios from '../../../../api/httpClient';
import { resolveReportScopeId } from '../../../../utils/reportScope';
import { setNotification } from '../../../../store/slices/uiSlice';
import styles from './UploadKYC.module.css';

const API_BASE_URL = '/MemberKYCDocuments';

// Backend field casing for these dates isn't consistent, and booleans/small
// numbers (isApproved, empid, etc.) can masquerade as "valid" dates if we
// just throw everything at `new Date()` — same issue fixed on the admin KYC
// dossier view. Only accept values that actually look like a real date.
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

// The backend doesn't currently return a real approve/reject timestamp for
// each document, so the admin KYC dossier view records the exact moment of
// every approve/reject into localStorage under this same key. Since admin
// and member both run on the same origin (same app/domain), this is
// readable from here too — same key + same fallback-id scheme as
// admin/components/KYCPages/KYCDetails.jsx, kept in sync deliberately.
const ACTION_DATE_STORE_KEY = 'kyc_doc_action_dates';

// Tries the doc.id key first, then falls back to the msrno/name/number
// composite key — admin now writes both keys on every approve/reject, so this
// still finds the date even if `id` isn't populated identically across
// different fetches (admin dossier vs member panel vs API panel).
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

const formatDateTimeStacked = (dateStr) => {
  if (!dateStr) return { date: '—', time: '' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: String(dateStr), time: '' };
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  };
};

const UploadKYC = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, doc: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Real documents this member has submitted — fetched from the same
  // backend the admin KYC panel reads from, scoped to just this member's
  // own msrno so nobody else's documents show up here.
  const fetchMyDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { id: scopeId, error: scopeError } = await resolveReportScopeId();
      if (!scopeId) {
        dispatch(setNotification({ type: 'error', message: scopeError || 'Could not determine your account.' }));
        setDocuments([]);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/get-all`, {
        // If the backend ever ignores MemberID server-side and just returns
        // page 1 of everyone's records, a small PageSize could cut this
        // member's own entry off the page entirely. A generous PageSize
        // here is cheap insurance against that.
        params: { PageNumber: 1, PageSize: 1000, MemberID: scopeId }
      });

      if (res.data && res.data.status && res.data.data) {
        const rawItems = res.data.data.items || [];
        const mine = rawItems.filter(it => String(it.msrno) === String(scopeId));
        const flat = mine.flatMap(it =>
          (it.documents || [])
            .filter(d => !d.isDelete)
            .map(d => ({ ...d, msrno: it.msrno }))
        );
        setDocuments(flat);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('UploadKYC: failed to fetch my documents', err);
      dispatch(setNotification({ type: 'error', message: 'Failed to load your KYC documents.' }));
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchMyDocuments(); }, [fetchMyDocuments]);

  // Only let a member delete a document that admin hasn't already Approved —
  // once verified it's part of the official record and shouldn't be
  // self-service removable. Pending/Rejected (e.g. a wrong file mistakenly
  // uploaded) can be cleaned up freely.
  const canDelete = (item) => (item.status || 'Pending') !== 'Approved';

  const handleConfirmDelete = async () => {
    const doc = deleteModal.doc;
    if (!doc) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/delete/${doc.id}`);
      if (res.status === 200 || res.status === 204 || (res.data && (res.data.status || res.data.success))) {
        dispatch(setNotification({ type: 'success', message: res.data?.mess || res.data?.message || 'Document deleted successfully!' }));
        setDeleteModal({ open: false, doc: null });
        fetchMyDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.data?.mess || res.data?.message || 'Failed to delete document.' }));
      }
    } catch (err) {
      console.error('UploadKYC: delete failed', err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error deleting document.' }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter(doc =>
    (doc.docName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredDocs.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;

  const currentData = filteredDocs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className={styles.container}>

      <AdminTable
        title="KYC DOCUMENTS"
        subtitle=""
        rightAction={
          <button
            className={styles.uploadTriggerBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <FiUploadCloud /> UPLOAD
          </button>
        }
        columns={['SNO', 'DOCUMENT NAME', 'STATUS', 'REASON', 'VIEW', 'ADD DATE', 'ACTION DATE', 'ACTION']}
        data={currentData}
        renderRow={(item, index) => {
          const status = item.status || 'Pending';
          let badgeClass = styles.badgePending;
          if (status === 'Approved') badgeClass = styles.badgeApproved;
          if (status === 'Rejected') badgeClass = styles.badgeRejected;

          const added = formatDateTimeStacked(getUploadDate(item));
          const actioned = formatDateTimeStacked(getActionDate(item));

          return (
            <tr key={item.id || index}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
              <td style={{ fontWeight: 700, color: '#1756AA' }}>{item.docName || 'N/A'}</td>
              <td>
                <span className={`${styles.badge} ${badgeClass}`}>
                  {status}
                </span>
              </td>
              <td>{item.reason || '-'}</td>
              <td>
                <button
                  className={styles.viewBtn}
                  title="View Document"
                  onClick={() => setSelectedDoc(item)}
                >
                  <FiEye />
                </button>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{added.date}</span>
                  {added.time && <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{added.time}</span>}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{actioned.date}</span>
                  {actioned.time && <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{actioned.time}</span>}
                </div>
              </td>
              <td>
                {canDelete(item) ? (
                  <button
                    className={styles.removeRowBtn}
                    title="Delete this document"
                    onClick={() => setDeleteModal({ open: true, doc: item })}
                    style={{ width: '32px', height: '32px', border: '1px solid #FECACA', background: '#FEF2F2' }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic' }}>—</span>
                )}
              </td>
            </tr>
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalEntries={totalEntries}
        totalPages={totalPages}
      />

      <KYCUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={fetchMyDocuments}
      />

      <KYCViewModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        doc={selectedDoc}
      />

      {deleteModal.open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => !isDeleting && setDeleteModal({ open: false, doc: null })}
        >
          <div
            style={{ width: '90%', maxWidth: '380px', background: '#fff', borderRadius: '20px', padding: '28px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '28px' }}>
              <FiAlertTriangle />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Delete this document?</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 22px', lineHeight: 1.5 }}>
              <strong style={{ color: '#0F172A' }}>{deleteModal.doc?.docName}</strong> will be permanently removed. This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ open: false, doc: null })}
                disabled={isDeleting}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadKYC;
