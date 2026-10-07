import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import SearchableSelect from '../../../shared/components/common/SearchableSelect';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../../../api/httpClient';
import {
  FiSearch, FiEye, FiUser, FiUsers, FiCalendar, FiCheckCircle, FiCheck, FiAlertCircle,
  FiX, FiXCircle, FiClock, FiFileText, FiDownload, FiInfo, FiLayers, FiActivity, FiDatabase, FiShield, FiChevronLeft, FiChevronRight, FiFilter, FiCopy,
  FiRotateCw, FiZoomIn, FiZoomOut, FiMaximize2
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaTimes, FaCheck
} from 'react-icons/fa';
import { setNotification } from '../../../store/slices/uiSlice';
import { MemberService } from '../../../services/member.service';
import styles from '../MemberPages/MemberPages.module.css';

const API_BASE_URL = '/MemberKYCDocuments';

// The KYC API doesn't return a real "when was this approved/rejected" timestamp
// for each document, so Action Date shows blank straight from the backend. We
// record the exact moment an admin approves/rejects a doc locally (keyed by
// document id, persisted in localStorage) and use that as the Action Date —
// it reflects the true action time and survives page reloads.
const ACTION_DATE_STORE_KEY = 'kyc_doc_action_dates';

const readActionDateStore = () => {
  try {
    const raw = localStorage.getItem(ACTION_DATE_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// Written under BOTH the doc.id key and the msrno/name/number composite key,
// so a read that ends up preferring a different key than the write still finds
// it — this is a redundancy fix for cases where `id` is present on one side of
// a refetch but a stale/mismatched value on the other (e.g. API panel vs admin
// vs member fetching the same document through different endpoints/paging).
const writeActionDate = (doc, msrno, isoDate) => {
  try {
    const store = readActionDateStore();
    if (doc?.id !== undefined && doc?.id !== null && doc?.id !== '') {
      store[String(doc.id)] = isoDate;
    }
    const compositeKey = `${msrno ?? ''}_${doc?.docName ?? ''}_${doc?.docNumber ?? ''}`;
    store[compositeKey] = isoDate;
    localStorage.setItem(ACTION_DATE_STORE_KEY, JSON.stringify(store));
  } catch (e) {
    // localStorage unavailable — non-fatal, just won't persist across reloads
  }
};

const getLocalActionDate = (doc, msrno) => {
  try {
    const store = readActionDateStore();
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

const maskDocNumber = (docName, docNumber) => {
  if (!docNumber) return '—';
  const nameLower = (docName || '').toLowerCase();
  const cleanNum = docNumber.replace(/[\s-]/g, '');
  if (nameLower.includes('aadhar') || nameLower.includes('pan') || nameLower.includes('adhar')) {
    if (cleanNum.length > 4) {
      const last4 = cleanNum.slice(-4);
      const maskedLength = cleanNum.length - 4;
      return `${'X'.repeat(maskedLength)}${last4}`;
    }
  }
  return docNumber;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr || '—';
  }
};

// Fields like isApproved/isDelete/empid are booleans or tiny numbers — new Date(true)
// or new Date(0) both "successfully" parse to 01 Jan 1970, which is how the bogus
// 1970 dates were sneaking in. Only treat a value as a real date if it's a string
// that looks like a date, or a numeric epoch large enough to be year 2000+.
const isPlausibleDateValue = (val) => {
  if (val === null || val === undefined || val === '') return false;
  if (typeof val === 'boolean') return false;
  if (typeof val === 'number') {
    // epoch ms for year 2000-01-01 is 946684800000; anything smaller is not a real date
    return val >= 946684800000;
  }
  if (typeof val !== 'string') return false;
  const d = new Date(val);
  if (isNaN(d.getTime())) return false;
  return d.getFullYear() >= 2000;
};

// Backend field casing for these dates isn't consistent across responses, so
// beyond the known aliases we also scan the doc's own keys for anything that
// looks like a date field matching the given keywords — this keeps the page
// working even if the API renames/re-cases a field.
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

const getStatusDate = (doc, msrno) => {
  const known = doc.statusdate || doc.statusDate || doc.approvedDate || doc.approveddate || doc.updatedDate || doc.updateddate;
  if (isPlausibleDateValue(known)) return known;
  const scanned = findDateByKeywords(doc, ['statusdate', 'status_date', 'approveddate', 'approved_date', 'updateddate', 'updated_date', 'actiondate', 'action_date', 'modifieddate', 'modified_date']);
  if (scanned) return scanned;
  // Backend doesn't send this field at all — fall back to our own locally
  // recorded approve/reject timestamp (tries doc.id key, then the msrno/name/number composite key).
  return getLocalActionDate(doc, msrno) || null;
};

const KYCDetails = () => {
  const dispatch = useDispatch();
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', item: null, label: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [kycDetails, setKycDetails] = useState([]);
  // Only open/close state lives in the big KYCDetails component. All the
  // zoom/pan/rotate/download state and logic live inside the isolated
  // <KycImageLightbox> component below — that's the actual fix for the
  // "zoom is slow" complaint: previously the zoom state lived HERE, so every
  // wheel-tick re-rendered the entire KYC table + dossier (potentially
  // hundreds of rows) along with the image, causing visible lag. Moving it
  // into its own component means a zoom tick only re-renders that small tree.
  const [lightbox, setLightbox] = useState({ isOpen: false, url: '', title: '' });
  const openLightbox = (url, title) => {
    if (!url) return;
    setLightbox({ isOpen: true, url, title });
  };
  const closeLightbox = () => setLightbox({ isOpen: false, url: '', title: '' });

  const fetchMembers = async () => {
    try {
      const res = await MemberService.search("");
      if (Array.isArray(res)) {
        setMemberList(res);
      } else {
        setMemberList([]);
      }
    } catch (err) {
      console.error("Error fetching member list:", err);
      setMemberList([]);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/get-all`, {
        params: {
          PageNumber: currentPage,
          PageSize: rowsPerPage
        }
      });
      if (res.data && res.data.status && res.data.data) {
        const rawItems = res.data.data.items || [];
        const mappedItems = rawItems.map(item => {
          const docs = (item.documents || []).filter(d => !d.isDelete);
          if (docs.length > 0) {
          }
          const latestTime = docs.reduce((max, d) => {
            const raw = getStatusDate(d) || getUploadDate(d);
            const t = raw ? new Date(raw).getTime() : 0;
            return !isNaN(t) && t > max ? t : max;
          }, 0);
          return {
            msrno: item.msrno,
            empid: item.empid,
            documents: docs,
            id: docs.length > 0 ? docs[0].id : null,
            status: docs.some(d => d.status === 'Pending') ? 'Pending' : (docs.some(d => d.status === 'Rejected') ? 'Rejected' : 'Approved'),
            isApproved: docs.length > 0 && docs.every(d => d.isApproved),
            reason: docs.map(d => `${d.docName}: ${d.reason || '-'}`).join(' | '),
            latestTime
          };
        }).filter(item => item.documents.length > 0)
          .sort((a, b) => b.latestTime - a.latestTime);
        setKycDetails(mappedItems);
        setTotalItems(res.data.data.totalItems || 0);
      } else {
        setKycDetails([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching KYC details:', err);
      dispatch(setNotification({ 
        type: 'error', 
        message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Failed to fetch KYC records.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchDocuments();
      }, [currentPage, rowsPerPage]);

  const handleView = (item) => {
    setViewingItem(item);
    setShowModal(true);
  };

  const handleApproveDoc = (item) => {
    setConfirmModal({ isOpen: true, type: 'APPROVE_DOC', item, label: item.docName });
  };

  const handleRejectDoc = (item) => {
    setRejectReason('');
    setConfirmModal({ isOpen: true, type: 'REJECT_DOC', item, label: item.docName });
  };

  const handleToggleApproved = (item, currentVal) => {
    if (!currentVal) {
      setConfirmModal({ isOpen: true, type: 'APPROVE_DOC', item, label: item.docName });
    } else {
      setConfirmModal({ isOpen: true, type: 'PENDING_DOC', item, label: item.docName });
    }
  };

  const confirmAction = async () => {
    if (!confirmModal.item) return;
    setIsSubmitting(true);
    try {
      const isApprove = confirmModal.type === 'APPROVE_DOC';
      const isPending = confirmModal.type === 'PENDING_DOC';
      
      const formData = new FormData();
      formData.append('Id', confirmModal.item.id);
      formData.append('DocName', confirmModal.item.docName);
      formData.append('DocNumber', confirmModal.item.docNumber);
      formData.append('EMPID', confirmModal.item.empid || '0');
      
      if (isApprove) {
        formData.append('IsApproved', true);
        formData.append('Status', 'Approved');
        formData.append('Reason', 'Verified successfully');
      } else if (isPending) {
        formData.append('IsApproved', false);
        formData.append('Status', 'Pending');
        formData.append('Reason', 'Pending verification');
      } else {
                formData.append('IsApproved', false);
        formData.append('Status', 'Rejected');
        formData.append('Reason', rejectReason || 'Invalid Document Proof');
      }

      const res = await axios.post(`${API_BASE_URL}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.status) {
        let successMsg = 'Operation completed successfully!';
        if (isApprove) successMsg = 'Document approved successfully!';
        else if (isPending) successMsg = 'Document set to pending successfully!';
        else successMsg = 'Document rejected successfully!';

        // Backend doesn't return an action timestamp, so record the exact
        // moment of this approve/reject locally to power the Action Date column.
        writeActionDate(confirmModal.item, viewingItem?.msrno, new Date().toISOString());

        dispatch(setNotification({
          type: 'success',
          message: res.data?.mess || res.data?.message || successMsg
        }));
        setConfirmModal({ isOpen: false, type: '', item: null, label: '' });
        setShowModal(false);
        fetchDocuments();
      } else {
        dispatch(setNotification({ 
          type: 'error', 
          message: res.data?.mess || res.data?.message || 'Failed to complete operation.' 
        }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ 
        type: 'error', 
        message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error during operation.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = kycDetails.filter(item => {
    const matchesMember = selectedMember ? (String(item.msrno) === selectedMember || String(item.empid) === selectedMember) : true;

    const matchesStatus = statusFilter
      ? (item.documents || []).some(d => (d.status || 'Pending') === statusFilter)
      : true;

    const docMatches = (item.documents || []).some(d =>
      (d.docName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.docNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const memberMatches = String(item.msrno || '').toLowerCase().includes(searchTerm.toLowerCase());

    return (docMatches || memberMatches) && matchesMember && matchesStatus;
  });

  // Global counts across EVERY member's KYC records (not affected by the
  // member filter or search box above) — a top-level snapshot of the whole
  // KYC pipeline.
  const globalStats = kycDetails.reduce((acc, item) => {
    acc.totalMembers += 1;
    (item.documents || []).forEach(d => {
      acc.totalDocs += 1;
      const st = d.status || 'Pending';
      if (st === 'Approved') acc.approved += 1;
      else if (st === 'Rejected') acc.rejected += 1;
      else acc.pending += 1;
    });
    return acc;
  }, { totalMembers: 0, totalDocs: 0, approved: 0, rejected: 0, pending: 0 });

  const statCards = [
    { label: 'Total Members', value: globalStats.totalMembers, icon: FiUsers, color: '#1756AA', gradient: 'linear-gradient(135deg, #1756AA 0%, #0D3B7A 100%)' },
    { label: 'Total Documents', value: globalStats.totalDocs, icon: FiFileText, color: '#7C3AED', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' },
    { label: 'Approved', value: globalStats.approved, icon: FiCheckCircle, color: '#10B981', gradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)' },
    { label: 'Rejected', value: globalStats.rejected, icon: FiXCircle, color: '#EF4444', gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)' },
    { label: 'Pending', value: globalStats.pending, icon: FiClock, color: '#D97706', gradient: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)' },
  ];

  return (
    <div className={`${styles.container} kycdetails-page`} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      {/* `.directoryTitle`/`.directorySubtitle` are shared MemberPages.module.css
          classes reused across ~20 other admin list pages, so they're overridden
          here scoped to `.kycdetails-page` instead of editing the shared module,
          which would change those other pages' layout too. The stat-card grid
          and filter control widths below are local inline styles, so they get
          page-local class names to target directly. */}
      <style>{`
        @media (max-width: 640px) {
          .kycdetails-page .${styles.directoryTitle} {
            font-size: 0.95rem !important;
          }
          .kycdetails-page .${styles.directorySubtitle} {
            font-size: 0.65rem !important;
          }
          .kycdetails-page .kyc-stat-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .kycdetails-page .kyc-member-select,
          .kycdetails-page .kyc-status-select {
            width: 47% !important;
          }
          .kycdetails-page .kyc-search-box {
            width: 100% !important;
          }
        }
      `}</style>
      <div className="kyc-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid #EEF3FC',
                borderRadius: '16px',
                padding: '16px 18px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: card.gradient,
              }} />
              <div style={{
                width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
                background: card.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: `0 6px 14px ${card.color}33`,
              }}>
                <Icon size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{card.label}</span>
                <span style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

            <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.directoryTitle} style={{ fontSize: '1.2rem' }}>KYC Member Report</h2>
            <p className={styles.directorySubtitle} style={{ fontSize: '0.75rem' }}>Tracking history of identification verification</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="kyc-member-select" style={{ position: 'relative', width: '190px' }}>
              <SearchableSelect
                value={selectedMember}
                onChange={(val) => setSelectedMember(val)}
                options={[
                  { label: 'All Members', value: '' },
                  ...(memberList || []).map(m => ({ label: `${m.memberId} - ${m.name}`, value: m.id }))
                ]}
                placeholder="All Members"
                style={{ height: '38px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.83rem' }}
              />
            </div>

            {selectedMember && (
              <button
                onClick={() => setSelectedMember('')}
                title="Clear member filter"
                style={{ background: '#FFF5F5', color: '#E53E3E', border: '1.5px solid #FED7D7', padding: '0 14px', height: '38px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiX size={13} /> Clear
              </button>
            )}

            <div className="kyc-status-select" style={{ position: 'relative', width: '160px' }}>
              <SearchableSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: 'All Status', value: '' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Rejected', value: 'Rejected' },
                  { label: 'Pending', value: 'Pending' },
                ]}
                placeholder="All Status"
                style={{ height: '38px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.83rem' }}
              />
            </div>

            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                title="Clear status filter"
                style={{ background: '#FFF5F5', color: '#E53E3E', border: '1.5px solid #FED7D7', padding: '0 14px', height: '38px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiX size={13} /> Clear
              </button>
            )}

            <div className="kyc-search-box" style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '260px',
              background: '#F8FAFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 10px 0 34px',
              height: '38px',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}>
              <FiSearch style={{ position: 'absolute', left: '12px', color: '#A0AEC0', fontSize: '0.9rem' }} />
              <input
                type="text"
                placeholder="Search report..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  height: '100%',
                  fontSize: '0.85rem',
                  color: '#0D1B3E',
                  fontWeight: 500
                }}
              />
            </div>
          </div>
        </div>

                <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ textAlign: 'center', width: '60px' }}>VIEW</th>
                <th>MEMBER IDENTITY</th>
                <th>CONTACT NUMBER</th>
                <th>DOCUMENT DETAILS</th>
                <th style={{ textAlign: 'center' }}>REASON / REMARK</th>
                <th style={{ textAlign: 'center', width: '90px' }}>STATUS / APPROVED</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan="7" style={{ padding: 0, background: '#fff' }}>
                     <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', color: '#A0AEC0' }}>
                       
                       <div style={{ fontSize: '0.85rem' }}>No records match selection</div></div></td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.msrno} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className={styles.editBtn} 
                        style={{ background: '#F8FAFF', color: '#1756AA', border: '1.5px solid #1756AA', width: 'auto', padding: '0 12px', height: '32px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }} 
                        onClick={() => handleView(item)} 
                        title="View Details"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                    <td>
                      {(() => {
                        const member = memberList.find(m => String(m.id) === String(item.msrno));
                        return member ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem' }}>{member.memberId}</span>
                            <small style={{ color: '#0D1B3E', fontWeight: 600, fontSize: '0.75rem' }}>{member.name}</small>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#A0AEC0', fontSize: '0.85rem' }}>Unknown Member</span>
                            <small style={{ color: '#A0AEC0', fontSize: '0.7rem' }}>MSR: {item.msrno}</small>
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const member = memberList.find(m => String(m.id) === String(item.msrno));
                        return (
                          <div style={{ fontSize: '0.8rem', color: '#0D1B3E', fontWeight: 600 }}>
                            {member ? member.mobile : '—'}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <div>
                        {item.documents.map((doc, idx) => (
                          <div key={idx} style={{ fontSize: '0.7rem', color: '#0D1B3E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                            <span>• {doc.docName} ({maskDocNumber(doc.docName, doc.docNumber)})</span>
                            <span style={{ 
                              fontSize: '0.62rem', 
                              padding: '1px 5px', 
                              borderRadius: '4px',
                              background: doc.status === 'Approved' ? '#ECFDF5' : doc.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                              color: doc.status === 'Approved' ? '#10B981' : doc.status === 'Rejected' ? '#EF4444' : '#D97706'
                            }}>{doc.status || 'Pending'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {item.documents.map((doc, idx) => (
                          <div key={idx}><strong>{doc.docName}</strong>: {doc.reason || '—'}</div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(() => {
                        const approvedCount = item.documents.filter(d => d.status === 'Approved').length;
                        const rejectedCount = item.documents.filter(d => d.status === 'Rejected').length;
                        const pendingCount = item.documents.filter(d => (d.status || 'Pending') === 'Pending').length;
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                            {approvedCount > 0 && (
                              <span style={{ background: '#ECFDF5', color: '#10B981', fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                                ✓ {approvedCount} Approved
                              </span>
                            )}
                            {rejectedCount > 0 && (
                              <span style={{ background: '#FEF2F2', color: '#EF4444', fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                                ✕ {rejectedCount} Rejected
                              </span>
                            )}
                            {pendingCount > 0 && (
                              <span style={{ background: '#FFFBEB', color: '#D97706', fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                                ⏳ {pendingCount} Pending
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

                <div className="global-pagination">
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing {totalItems} records
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">{currentPage}</button>
            <button className="global-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * rowsPerPage >= totalItems}><FiChevronRight /></button>
          </div>
        </div>
      </div>

            {showModal && viewingItem && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} style={{ 
            width: '95%', 
            maxWidth: '900px', 
            height: '90vh', 
            maxHeight: '850px',
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            
            <div className={styles.modalHeader} style={{ 
              padding: '12px 24px', 
              background: '#ffffff', 
              borderBottom: '1px solid #E2E8F0', 
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'linear-gradient(135deg, rgba(23, 86, 170, 0.1) 0%, rgba(23, 86, 170, 0.2) 100%)', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#1756AA' 
                }}>
                  <FiUser size={18} />
                </div>
                {(() => {
                  const member = memberList.find(m => String(m.id) === String(viewingItem.msrno));
                  return (
                    <div>
                      <h3 className={styles.modalTitle} style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>
                        KYC Dossier: {member ? `${member.name} (${member.memberId})` : `MSRNO ${viewingItem.msrno}`}
                      </h3>
                      <p className={styles.modalSubtitle} style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, marginTop: '1px' }}>
                        Total Documents: <span style={{ fontWeight: 600, color: '#1756AA' }}>{viewingItem.documents?.length || 0}</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setShowModal(false)} 
                style={{ 
                  width: '28px', 
                  height: '28px', 
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
              >
                <FiX size={16} />
              </button>
            </div>

            <div className={styles.modalBody} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               {viewingItem.documents && [...viewingItem.documents].sort((a, b) => {
                  // Newest upload first — a member re-uploading a rejected/pending
                  // doc should see (and admin should review) that fresh copy at
                  // the top, not buried below older approved/rejected entries.
                  const ta = new Date(getUploadDate(a) || 0).getTime() || 0;
                  const tb = new Date(getUploadDate(b) || 0).getTime() || 0;
                  if (tb !== ta) return tb - ta;
                  return (Number(b.id) || 0) - (Number(a.id) || 0);
                }).map((doc, idx) => {
                  const status = doc.status || 'Pending';
                  const bg = status === 'Approved' ? '#ECFDF5' : status === 'Rejected' ? '#FEF2F2' : '#ffffff';
                  const border = status === 'Approved' ? '1px solid #10B981' : status === 'Rejected' ? '1px solid #EF4444' : '1px solid #E2E8F0';
                  const shadow = status === 'Approved' ? '0 10px 15px -3px rgba(16, 185, 129, 0.05)' : status === 'Rejected' ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)';

                  const getImageUrl = (path) => {
                     if (!path) return null;
                     const normalizedPath = path.replace(/\\/g, '/');
                     if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;
                     
                     const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
                     if (cleanPath.toLowerCase().startsWith('uploadedfiles/kycdocuments')) {
                       const suffix = cleanPath.substring('uploadedfiles/kycdocuments'.length);
                       const cleanSuffix = suffix.startsWith('/') ? suffix : '/' + suffix;
                       return `https://b2b.bype.in/UploadedFiles/kycdocuments${cleanSuffix}`;
                     }
                     return `https://b2b.bype.in/UploadedFiles/kycdocuments/${cleanPath}`;
                  };

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

                  const isTwoSided = doc.documentSide ? (parseInt(doc.documentSide) === 2) : (doc.docName && !doc.docName.toLowerCase().includes('pan'));

                  return (
                    <div 
                      key={doc.id || idx}
                      style={{ 
                        background: bg, 
                        borderRadius: '16px', 
                        border: border, 
                        padding: '20px', 
                        boxShadow: shadow, 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', flex: 1 }}>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</small>
                                <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.85rem' }}>{doc.docName}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Number</small>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>{maskDocNumber(doc.docName, doc.docNumber)}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uploaded Date</small>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.78rem' }}>{formatDate(getUploadDate(doc))}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Date</small>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.78rem' }}>{formatDate(getStatusDate(doc, viewingItem.msrno))}</span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member ID</small>
                                <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                  {(memberList.find(m => String(m.id) === String(viewingItem.msrno))?.memberId) || '—'}
                                </span>
                              </div>
                              <div>
                                <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</small>
                                <span style={{
                                  background: status === 'Approved' ? '#D1FAE5' : status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                                  color: status === 'Approved' ? '#065F46' : status === 'Rejected' ? '#991B1B' : '#92400E',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  display: 'inline-block'
                                }}>
                                  {status}
                                </span>
                              </div>
                           </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isTwoSided ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: '16px', maxWidth: isTwoSided ? '100%' : '480px' }}>
                           <div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                                <FiActivity size={12} style={{ color: '#1756AA' }} /> Document Front
                              </label>
                              <div
                                role={frontImgUrl ? 'button' : undefined}
                                tabIndex={frontImgUrl ? 0 : undefined}
                                onClick={() => frontImgUrl && openLightbox(frontImgUrl, `${doc.docName || 'Document'} - Front`)}
                                onMouseEnter={(e) => { if (frontImgUrl) e.currentTarget.querySelector('.zoomBadge').style.opacity = '1'; }}
                                onMouseLeave={(e) => { if (frontImgUrl) e.currentTarget.querySelector('.zoomBadge').style.opacity = '0'; }}
                                style={{
                                position: 'relative',
                                height: '180px',
                                background: '#F8FAFF',
                                borderRadius: '12px',
                                border: '1.5px dashed #CBD5E1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                cursor: frontImgUrl ? 'zoom-in' : 'default'
                              }}>
                                {frontImgUrl ? (
                                  <>
                                    <img src={frontImgUrl} alt="Front Document" style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }} />
                                    <span className="zoomBadge" style={{
                                      position: 'absolute', top: '8px', right: '8px',
                                      width: '30px', height: '30px', borderRadius: '50%',
                                      background: 'rgba(15,23,42,0.65)', color: '#fff',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      opacity: 0, transition: 'opacity 0.15s ease', pointerEvents: 'none'
                                    }}>
                                      <FiZoomIn size={15} />
                                    </span>
                                  </>
                                ) : (
                                  <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>No Front Image</span>
                                )}
                              </div>
                           </div>
                           {isTwoSided && (
                             <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                                  <FiActivity size={12} style={{ color: '#1756AA' }} /> Document Back
                                </label>
                                <div
                                  role={backImgUrl ? 'button' : undefined}
                                  tabIndex={backImgUrl ? 0 : undefined}
                                  onClick={() => backImgUrl && openLightbox(backImgUrl, `${doc.docName || 'Document'} - Back`)}
                                  onMouseEnter={(e) => { if (backImgUrl) e.currentTarget.querySelector('.zoomBadge').style.opacity = '1'; }}
                                  onMouseLeave={(e) => { if (backImgUrl) e.currentTarget.querySelector('.zoomBadge').style.opacity = '0'; }}
                                  style={{
                                  position: 'relative',
                                  height: '180px',
                                  background: '#F8FAFF',
                                  borderRadius: '12px',
                                  border: '1.5px dashed #CBD5E1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  cursor: backImgUrl ? 'zoom-in' : 'default'
                                }}>
                                  {backImgUrl ? (
                                    <>
                                      <img src={backImgUrl} alt="Back Document" style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }} />
                                      <span className="zoomBadge" style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: 'rgba(15,23,42,0.65)', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.15s ease', pointerEvents: 'none'
                                      }}>
                                        <FiZoomIn size={15} />
                                      </span>
                                    </>
                                  ) : (
                                    <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>No Back Image</span>
                                  )}
                                </div>
                             </div>
                           )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '12px', flexWrap: 'wrap' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {status === 'Rejected' && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}>
                                    <FiAlertCircle size={14} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Reason: {doc.reason || 'Invalid Document Proof'}</span>
                                 </div>
                              )}
                              {status === 'Approved' && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
                                    <FiCheck size={14} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Remarks: {doc.reason || 'Verified successfully'}</span>
                                 </div>
                              )}
                           </div>

                           <div style={{ display: 'flex', gap: '12px' }}>
                              <button
                                type="button"
                                disabled={status === 'Rejected'}
                                onClick={() => handleRejectDoc(doc)}
                                style={{
                                  background: status === 'Rejected' ? '#F1F5F9' : '#FFF5F5',
                                  color: status === 'Rejected' ? '#94A3B8' : '#EF4444',
                                  border: status === 'Rejected' ? '1.5px solid #E2E8F0' : '1.5px solid #EF4444',
                                  width: 'auto',
                                  padding: '0 12px',
                                  height: '28px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '6px',
                                  cursor: status === 'Rejected' ? 'not-allowed' : 'pointer',
                                  opacity: status === 'Rejected' ? 0.7 : 1
                                }}
                              >
                                <FiX size={14} /> {status === 'Rejected' ? 'Rejected' : 'Reject'}
                              </button>
                              <button
                                type="button"
                                disabled={status === 'Approved'}
                                onClick={() => handleApproveDoc(doc)}
                                style={{
                                  background: status === 'Approved' ? '#F1F5F9' : '#ECFDF5',
                                  color: status === 'Approved' ? '#94A3B8' : '#10B981',
                                  border: status === 'Approved' ? '1.5px solid #E2E8F0' : '1.5px solid #10B981',
                                  width: 'auto',
                                  padding: '0 12px',
                                  height: '28px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '6px',
                                  cursor: status === 'Approved' ? 'not-allowed' : 'pointer',
                                  opacity: status === 'Approved' ? 0.7 : 1
                                }}
                              >
                                <FiCheck size={14} /> {status === 'Approved' ? 'Approved' : 'Accept'}
                              </button>
                           </div>
                        </div>
                    </div>
                  );
               })}
            </div>
            <div className={styles.modalFooter} style={{ padding: '10px 24px', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFF', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <button className={styles.pageBtn} style={{ padding: '0 20px', width: 'auto', height: '36px' }} onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

            {confirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div className={styles.modalContainer} style={{ width: '90%', maxWidth: '400px', borderRadius: '24px', padding: '32px', textAlign: 'center', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(0,0,0,0.05)', animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: confirmModal.type.startsWith('APPROVE') ? '#D1FAE5' : '#FEE2E2', 
              color: confirmModal.type.startsWith('APPROVE') ? '#10B981' : '#EF4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '36px', 
              margin: '0 auto 24px',
              boxShadow: confirmModal.type.startsWith('APPROVE') ? '0 10px 15px -3px rgba(16, 185, 129, 0.2)' : '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
            }}>
              {confirmModal.type.startsWith('APPROVE') ? <FiCheck /> : <FiAlertCircle />}
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '12px', fontWeight: 800 }}>
              {confirmModal.type.startsWith('APPROVE') ? 'Approve Document?' : 'Reject Document?'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6', fontWeight: 500 }}>
              Are you sure you want to {confirmModal.type.startsWith('APPROVE') ? 'approve' : 'reject'} <strong style={{ color: '#0F172A', fontWeight: 750 }}>{confirmModal.label}</strong>? This action will update the status immediately.
            </p>

            {confirmModal.type.startsWith('REJECT') && (
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</label>
                <textarea
                  placeholder="E.g., Document image is blurry, invalid details..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: '', item: null, label: '' })}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '14px', 
                  border: '1.5px solid #E2E8F0', 
                  background: '#ffffff', 
                  color: '#475569', 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  cursor: 'pointer', 
                  transition: 'all 0.2s' 
                }}
                onMouseOver={(e) => e.target.style.background = '#F8FAFC'}
                onMouseOut={(e) => e.target.style.background = '#ffffff'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                disabled={isSubmitting}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  background: confirmModal.type.startsWith('APPROVE') ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
                  color: '#ffffff', 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  cursor: 'pointer', 
                  boxShadow: confirmModal.type.startsWith('APPROVE') ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                {isSubmitting ? 'Processing...' : `Yes, ${confirmModal.type.startsWith('APPROVE') ? 'Approve' : 'Reject'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox.isOpen && (
        <KycImageLightbox url={lightbox.url} title={lightbox.title} onClose={closeLightbox} />
      )}
    </div>
  );
};

// Isolated on purpose: all zoom/pan/rotate/download state lives in this small
// standalone component instead of inside KYCDetails. That's the actual fix
// for the reported "zoom is slow" — before, the zoom state lived inside the
// big KYCDetails component, so every wheel-tick re-rendered the whole KYC
// table + dossier (hundreds of DOM nodes) along with the image, which is what
// caused the visible lag. Now a wheel-tick only re-renders this component.
const KycImageLightbox = ({ url, title, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  const zoomOut = () => setZoom(z => {
    const nz = Math.max(0.3, +(z - 0.25).toFixed(2));
    if (nz <= 1) setPos({ x: 0, y: 0 });
    return nz;
  });
  const zoomIn = () => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)));
  const reset = () => { setZoom(1); setRotation(0); setPos({ x: 0, y: 0 }); };
  const rotate = () => setRotation(r => (r + 90) % 360);

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.15, 4));
    } else {
      setZoom(prev => {
        const newZoom = Math.max(prev - 0.15, 0.3);
        if (newZoom <= 1) setPos({ x: 0, y: 0 });
        return newZoom;
      });
    }
  };
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    }
  };
  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = async () => {
    if (!url || isDownloading) return;
    setIsDownloading(true);
    const fileName = (title || 'kyc-document').replace(/\s+/g, '_') + '.jpg';
    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  const iconBtnStyle = { width: '38px', height: '38px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '92%', maxWidth: '900px', marginBottom: '12px'
        }}
      >
        <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.9rem' }}>{title}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={zoomOut} title="Zoom Out" style={iconBtnStyle}><FiZoomOut size={17} /></button>
          <button type="button" onClick={zoomIn} title="Zoom In" style={iconBtnStyle}><FiZoomIn size={17} /></button>
          <button type="button" onClick={reset} title="Reset" style={iconBtnStyle}><FiMaximize2 size={16} /></button>
          <button type="button" onClick={rotate} title="Rotate" style={iconBtnStyle}><FiRotateCw size={17} /></button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download"
            style={{ ...iconBtnStyle, cursor: isDownloading ? 'wait' : 'pointer', opacity: isDownloading ? 0.6 : 1 }}
          >
            <FiDownload size={17} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            style={{ ...iconBtnStyle, background: 'rgba(239, 68, 68, 0.85)' }}
          >
            <FiX size={19} />
          </button>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        style={{
          width: '92%', maxWidth: '900px', height: '72vh',
          background: 'rgba(255,255,255,0.06)', borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative'
        }}
      >
        <span style={{
          position: 'absolute', top: '10px', left: '16px',
          background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.72rem',
          padding: '5px 12px', borderRadius: '20px', pointerEvents: 'none', zIndex: 1
        }}>
          Scroll to Zoom · Drag to Pan
        </span>
        <div
          style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={url}
            alt={title}
            draggable={false}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transformOrigin: 'center center',
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              userSelect: 'none',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KYCDetails;
