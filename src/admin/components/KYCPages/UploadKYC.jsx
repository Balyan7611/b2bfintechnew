import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { 
  FiUploadCloud, FiCheckCircle, FiPlus, FiEye, FiTrash2, FiEdit2, FiX, FiCheck
} from 'react-icons/fi';
import { FaTrash, FaEdit } from 'react-icons/fa';
import AdminTable from '../../../shared/components/common/AdminTable';
import { setNotification } from '../../../store/slices/uiSlice';
import { KycDocumentService } from '../../../services/kycDocument.service';
import { MemberService } from '../../../services/member.service';
import styles from '../MemberPages/MemberPages.module.css';

const API_BASE_URL = 'https://api.sahayatamoney.in/api/MemberKYCDocuments';

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

const getUploadDate = (doc) => {
  return doc.entrydate || doc.entryDate || doc.createdDate || doc.createddate || doc.addedDate || doc.addeddate || null;
};

const getStatusDate = (doc) => {
  return doc.statusdate || doc.statusDate || doc.approvedDate || doc.approveddate || doc.updatedDate || doc.updateddate || null;
};

const UploadKYC = () => {
  const dispatch = useDispatch();

  // Data State
  const [documents, setDocuments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loaded Dropdown Data
  const [memberList, setMemberList] = useState([]);
  const [masterDocs, setMasterDocs] = useState([]);
  const [selectedDocSide, setSelectedDocSide] = useState(null); // Side of the currently selected doc in Add Form
  const [editDocSide, setEditDocSide] = useState(null); // Side of the currently selected doc in Edit Form

  // Pagination & Filters State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

  // Add Form State
  const [addForm, setAddForm] = useState({
    Msrno: '',
    DocID: '',
    DocName: '',
    DocNumber: '',
    EMPID: '0',
    FrontImageFile: null,
    BackImageFile: null
  });

  const fetchDropdownData = async () => {
    try {
      console.log("UploadKYC: Fetching members via search...");
      const membersRes = await MemberService.search("");
      console.log("UploadKYC: Member Search Response:", membersRes);
      
      if (Array.isArray(membersRes)) {
        setMemberList(membersRes);
      } else if (membersRes && Array.isArray(membersRes.data)) {
        setMemberList(membersRes.data);
      } else {
        setMemberList([]);
      }

      console.log("UploadKYC: Fetching master documents...");
      const masterRes = await KycDocumentService.getKycdocumentsMaster({ PageNumber: 1, PageSize: 100 });
      console.log("UploadKYC: Master Doc API Response:", masterRes);
      
      if (masterRes) {
        const dataPayload = masterRes.data;
        if (dataPayload) {
          if (Array.isArray(dataPayload.items)) {
            setMasterDocs(dataPayload.items);
          } else if (Array.isArray(dataPayload)) {
            setMasterDocs(dataPayload);
          }
        } else if (Array.isArray(masterRes)) {
          setMasterDocs(masterRes);
        }
      }
    } catch (err) {
      console.error("Error loading dropdown data for UploadKYC:", err);
    }
  };

  // Fetch Documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/get-all`, {
        params: {
          PageNumber: 1,
          PageSize: 10000,
          FromDate: '',
          ToDate: '',
          Status: '',
          MemberID: '0'
        }
      });
      if (res.data && res.data.status) {
        setDocuments(res.data.data.items || []);
        setTotalItems(res.data.data.totalItems || 0);
      } else {
        setDocuments([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching member KYC documents:', err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Failed to fetch KYC documents.' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setAddForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setAddForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.Msrno || !addForm.DocName || !addForm.DocNumber.trim()) {
      dispatch(setNotification({ type: 'error', message: 'Member, Document Name and Number are required.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Msrno', addForm.Msrno);
      formData.append('DocID', addForm.DocID || '0');
      formData.append('DocName', addForm.DocName);
      formData.append('DocNumber', addForm.DocNumber);
      formData.append('EMPID', addForm.EMPID);
      if (addForm.FrontImageFile) formData.append('FrontImageFile', addForm.FrontImageFile);
      if (selectedDocSide === 2 && addForm.BackImageFile) {
        formData.append('BackImageFile', addForm.BackImageFile);
      }

      const res = await axios.post(`${API_BASE_URL}/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data && res.data.status) {
        dispatch(setNotification({ type: 'success', message: res.data?.mess || res.data?.message || 'Document uploaded successfully!' }));
        setIsAddModalOpen(false);
        setAddForm({ Msrno: '', DocID: '', DocName: '', DocNumber: '', EMPID: '0', FrontImageFile: null, BackImageFile: null });
        setSelectedDocSide(null);
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.data?.mess || res.data?.message || 'Failed to upload document.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error uploading document.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      setEditModal(prev => ({
        ...prev,
        data: { ...prev.data, [name]: files[0] }
      }));
    } else {
      setEditModal(prev => ({
        ...prev,
        data: { ...prev.data, [name]: type === 'checkbox' ? checked : value }
      }));
    }
  };

  const handleOpenEdit = (item) => {
    const matchedMaster = masterDocs.find(d => d.name === item.docName);
    setEditDocSide(matchedMaster ? matchedMaster.side : 2);
    setEditModal({ isOpen: true, data: { ...item } });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.data.docName?.trim() || !editModal.data.docNumber?.trim()) {
      dispatch(setNotification({ type: 'error', message: 'Document Name and Number are required.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Id', editModal.data.id);
      formData.append('DocName', editModal.data.docName);
      formData.append('DocNumber', editModal.data.docNumber);
      formData.append('IsApproved', editModal.data.isApproved || false);
      formData.append('Status', editModal.data.status || 'Pending');
      formData.append('EMPID', editModal.data.empid || '0');
      formData.append('Reason', editModal.data.reason || '');
      if (editModal.data.FrontImageFile) formData.append('FrontImageFile', editModal.data.FrontImageFile);
      if (editDocSide === 2 && editModal.data.BackImageFile) {
        formData.append('BackImageFile', editModal.data.BackImageFile);
      }

      const res = await axios.post(`${API_BASE_URL}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data && res.data.status) {
        dispatch(setNotification({ type: 'success', message: res.data?.mess || res.data?.message || 'Document updated successfully!' }));
        setEditModal({ isOpen: false, data: null });
        setEditDocSide(null);
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.data?.mess || res.data?.message || 'Failed to update document.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error updating document.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/toggle-status/${item.id}`);
      if (res.data && res.data.status) {
        dispatch(setNotification({ type: 'success', message: res.data?.mess || res.data?.message || 'Status toggled successfully!' }));
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.data?.mess || res.data?.message || 'Failed to toggle status.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error toggling status.' }));
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/delete/${deleteModal.id}`);
      if (res.status === 200 || res.status === 204 || (res.data && (res.data.status || res.data.success))) {
        dispatch(setNotification({ type: 'success', message: res.data?.mess || res.data?.message || 'Document deleted successfully!' }));
        setDeleteModal({ isOpen: false, id: null });
        fetchDocuments();
      } else {
        dispatch(setNotification({ type: 'error', message: res.data?.mess || res.data?.message || 'Failed to delete.' }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setNotification({ type: 'error', message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error deleting document.' }));
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (doc.isDelete === true) return false;
    const member = memberList.find(m => String(m.id) === String(doc.msrno));
    const memberName = member ? member.name : '';
    const memberId = member ? member.memberId : '';
    return (doc.docName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.docNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const groupedDocs = [];
  const groupMap = new Map();
  filteredDocs.forEach(item => {
    const key = item.msrno;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key).push(item);
  });
  groupMap.forEach((docs, msrno) => {
    groupedDocs.push({
      msrno,
      documents: docs,
      id: docs[0].id,
      empid: docs[0].empid,
      status: docs.some(d => d.status === 'Pending') ? 'Pending' : (docs.some(d => d.status === 'Rejected') ? 'Rejected' : 'Approved'),
      isApproved: docs.every(d => d.isApproved),
      reason: docs.map(d => `${d.docName}: ${d.reason || '-'}`).join(' | ')
    });
  });

  const totalGroupedItems = groupedDocs.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentGroupedDocs = groupedDocs.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
      
      {/* KYC DOCUMENTS LIST */}
      <AdminTable
        title="MEMBER KYC UPLOAD"
        subtitle="Manage and track member submitted identification documents"
        rightAction={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}
          >
            <FiUploadCloud /> UPLOAD NEW
          </button>
        }
        columns={['SNO', 'MEMBER IDENTITY', 'DOCUMENT NAME', 'DOC NUMBER', 'STATUS', 'REASON', 'ACTIONS']}
        data={currentGroupedDocs}
        renderRow={(item, index) => {
          const firstDoc = item.documents[0] || item;
          return (
            <tr key={item.msrno}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.documents.map((doc, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1756AA' }}>
                      • {doc.docName}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.documents.map((doc, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', color: '#0D1B3E', fontWeight: 600 }}>
                      {maskDocNumber(doc.docName, doc.docNumber)}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.documents.map((doc, idx) => {
                    let badgeClass = styles.badgePending;
                    if (doc.status === 'Approved') badgeClass = styles.badgeApproved;
                    if (doc.status === 'Rejected') badgeClass = styles.badgeRejected;
                    return (
                      <span key={idx} className={`${styles.badge} ${badgeClass}`} style={{ fontSize: '0.62rem', padding: '1px 5px', alignSelf: 'flex-start' }}>
                        {doc.status || 'Pending'}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.documents.map((doc, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', color: '#4E6080' }}>
                      {doc.reason || '—'}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className={styles.viewBtn} 
                    title="View Document"
                    onClick={() => setViewModal({ isOpen: true, data: item })}
                  >
                    <FiEye />
                  </button>
                  <button 
                    style={{ background: 'transparent', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '1.1rem', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                    onClick={() => handleOpenEdit(firstDoc)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.1rem', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                    onClick={() => setDeleteModal({ isOpen: true, id: firstDoc.id })}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalEntries={totalGroupedItems}
        totalPages={Math.max(1, Math.ceil(totalGroupedItems / rowsPerPage))}
      />

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90%' }}>
            <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #1756AA 0%, #0D1B3E 100%)', padding: '16px 24px' }}>
              <div className={styles.modalHeaderTitleGroup}>
                <h2 className={styles.modalTitle} style={{ color: '#fff', margin: 0 }}>Upload KYC Document</h2>
                <p className={styles.modalSubtitle} style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>Add a new member document proof</p>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setIsAddModalOpen(false)} style={{ top: '15px' }}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className={styles.modalBody} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Select Member</label>
                <select 
                  name="Msrno"
                  value={addForm.Msrno}
                  onChange={handleAddInputChange}
                  style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  required
                >
                  <option value="">-- Select Member --</option>
                  {memberList.map(m => (
                    <option key={m.id} value={m.id}>{m.memberId} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Document Name</label>
                <select 
                  name="DocID"
                  value={addForm.DocID}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const doc = masterDocs.find(d => String(d.id) === String(selectedId));
                    if (doc) {
                      setAddForm(prev => ({
                        ...prev,
                        DocID: selectedId,
                        DocName: doc.name
                      }));
                      setSelectedDocSide(doc.side);
                    } else {
                      setAddForm(prev => ({
                        ...prev,
                        DocID: '',
                        DocName: ''
                      }));
                      setSelectedDocSide(null);
                    }
                  }}
                  style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  required
                >
                  <option value="">-- Select Document Type --</option>
                  {masterDocs.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Document Number</label>
                <input 
                  type="text" 
                  name="DocNumber"
                  value={addForm.DocNumber}
                  onChange={handleAddInputChange}
                  placeholder="e.g. 1234-5678-9012"
                  style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: selectedDocSide === 2 ? '1fr 1fr' : '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Front Image</label>
                  <input 
                    type="file" 
                    name="FrontImageFile"
                    onChange={handleAddInputChange}
                    accept="image/*,.pdf"
                    style={{ fontSize: '0.85rem', padding: '8px', border: '1px dashed #A0AEC0', borderRadius: '8px', background: '#fff' }}
                  />
                </div>
                {selectedDocSide === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Back Image</label>
                    <input 
                      type="file" 
                      name="BackImageFile"
                      onChange={handleAddInputChange}
                      accept="image/*,.pdf"
                      style={{ fontSize: '0.85rem', padding: '8px', border: '1px dashed #A0AEC0', borderRadius: '8px', background: '#fff' }}
                    />
                  </div>
                )}
              </div>

              <div className={styles.modalFooter} style={{ marginTop: '10px' }}>
                <button type="button" className={styles.pageBtn} onClick={() => setIsAddModalOpen(false)} style={{ padding: '0 20px', width: 'auto' }}>Cancel</button>
                <button type="submit" style={{ height: '40px', padding: '0 24px', background: '#1756AA', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editModal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => { setEditModal({ isOpen: false, data: null }); setEditDocSide(null); }}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90%' }}>
            <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #1756AA 0%, #0D1B3E 100%)', padding: '16px 24px' }}>
              <div className={styles.modalHeaderTitleGroup}>
                <h2 className={styles.modalTitle} style={{ color: '#fff', margin: 0 }}>Edit Document</h2>
                <p className={styles.modalSubtitle} style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>Update document details</p>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => { setEditModal({ isOpen: false, data: null }); setEditDocSide(null); }} style={{ top: '15px' }}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className={styles.modalBody} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Document Name</label>
                <select 
                  name="docName"
                  value={editModal.data.docName || ''}
                  onChange={(e) => {
                    const docName = e.target.value;
                    const doc = masterDocs.find(d => d.name === docName);
                    setEditModal(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        docName,
                        docID: doc ? doc.id : prev.data.docID
                      }
                    }));
                    setEditDocSide(doc ? doc.side : null);
                  }}
                  style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  required
                >
                  <option value="">-- Select Document Type --</option>
                  {masterDocs.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Document Number</label>
                <input 
                  type="text" 
                  name="docNumber"
                  value={editModal.data.docNumber || ''}
                  onChange={handleEditInputChange}
                  style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Status</label>
                  <select 
                    name="status" 
                    value={editModal.data.status || 'Pending'} 
                    onChange={handleEditInputChange}
                    style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Reason</label>
                  <input 
                    type="text" 
                    name="reason"
                    value={editModal.data.reason || ''}
                    onChange={handleEditInputChange}
                    placeholder="e.g. Verified successfully"
                    style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #E2E8F0', padding: '0 14px', outline: 'none', background: '#F8FAFF', color: '#0D1B3E', fontWeight: 500 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: editDocSide === 2 ? '1fr 1fr' : '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Update Front Image</label>
                  <input 
                    type="file" 
                    name="FrontImageFile"
                    onChange={handleEditInputChange}
                    accept="image/*,.pdf"
                    style={{ fontSize: '0.85rem', padding: '8px', border: '1px dashed #A0AEC0', borderRadius: '8px', background: '#fff' }}
                  />
                </div>
                {editDocSide === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E6080' }}>Update Back Image</label>
                    <input 
                      type="file" 
                      name="BackImageFile"
                      onChange={handleEditInputChange}
                      accept="image/*,.pdf"
                      style={{ fontSize: '0.85rem', padding: '8px', border: '1px dashed #A0AEC0', borderRadius: '8px', background: '#fff' }}
                    />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  name="isApproved"
                  checked={editModal.data.isApproved || false}
                  onChange={handleEditInputChange}
                  style={{ width: '18px', height: '18px', accentColor: '#1756AA' }}
                />
                <label style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#0D1B3E' }}>Is Approved</label>
              </div>

              <div className={styles.modalFooter} style={{ marginTop: '10px' }}>
                <button type="button" className={styles.pageBtn} onClick={() => setEditModal({ isOpen: false, data: null })} style={{ padding: '0 20px', width: 'auto' }}>Cancel</button>
                <button type="submit" style={{ height: '40px', padding: '0 24px', background: '#1756AA', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div className={styles.modalContainer} style={{ width: '90%', maxWidth: '400px', borderRadius: '24px', padding: '32px', textAlign: 'center', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(0,0,0,0.05)', animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: '#FEE2E2', 
              color: '#EF4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '36px', 
              margin: '0 auto 24px',
              boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
            }}>
              <FiTrash2 />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '12px', fontWeight: 800 }}>Delete Document?</h3>
            <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.6', fontWeight: 500 }}>
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
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
                onClick={confirmDelete}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
                  color: '#ffffff', 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  cursor: 'pointer', 
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {viewModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={() => setViewModal({ isOpen: false, data: null })}>
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
                  <FiUploadCloud size={18} />
                </div>
                {(() => {
                  const member = memberList.find(m => String(m.id) === String(viewModal.data.msrno));
                  return (
                    <div>
                      <h3 className={styles.modalTitle} style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>
                        KYC Uploads: {member ? `${member.name} (${member.memberId})` : `MSRNO ${viewModal.data.msrno}`}
                      </h3>
                      <p className={styles.modalSubtitle} style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, marginTop: '1px' }}>
                        Total Documents: <span style={{ fontWeight: 600, color: '#1756AA' }}>{viewModal.data.documents?.length || 0}</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setViewModal({ isOpen: false, data: null })} style={{ top: '15px' }}>
                <FiX size={16} />
              </button>
            </div>
            
            <div className={styles.modalBody} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {viewModal.data.documents && viewModal.data.documents.map((doc, idx) => {
                const status = doc.status || 'Pending';
                const bg = status === 'Approved' ? '#ECFDF5' : status === 'Rejected' ? '#FEF2F2' : '#ffffff';
                const border = status === 'Approved' ? '1px solid #10B981' : status === 'Rejected' ? '1px solid #EF4444' : '1px solid #E2E8F0';
                const shadow = status === 'Approved' ? '0 10px 15px -3px rgba(16, 185, 129, 0.05)' : status === 'Rejected' ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)';

                const getImageUrl = (path) => {
                  if (!path) return null;
                  const normalizedPath = path.replace(/\\/g, '/');
                  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;
                  
                  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
                  if (cleanPath.startsWith('UploadedFiles/Kycdocuments')) {
                    return `https://api.sahayatamoney.in/${cleanPath}`;
                  }
                  return `https://api.sahayatamoney.in/UploadedFiles/Kycdocuments/${cleanPath}`;
                };

                const frontImgUrl = getImageUrl(doc.frontImage || doc.frontImageFile || doc.frontImagePath || doc.frontImageName || doc.frontDoc);
                const backImgUrl = getImageUrl(doc.backImage || doc.backImageFile || doc.backImagePath || doc.backImageName || doc.backDoc);

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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', flex: 1 }}>
                        <div>
                          <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</small>
                          <span style={{ fontWeight: 700, color: '#1756AA', fontSize: '0.9rem' }}>{doc.docName}</span>
                        </div>
                        <div>
                          <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Number</small>
                          <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{doc.docNumber}</span>
                        </div>
                        <div>
                          <small style={{ color: '#64748B', display: 'block', marginBottom: '2px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</small>
                          <span style={{
                            background: status === 'Approved' ? '#D1FAE5' : status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                            color: status === 'Approved' ? '#065F46' : status === 'Rejected' ? '#991B1B' : '#92400E',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Front Image</label>
                        <div style={{ 
                          height: '180px', 
                          background: '#F8FAFF', 
                          borderRadius: '12px', 
                          border: '1.5px dashed #CBD5E1', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          overflow: 'hidden'
                        }}>
                          {frontImgUrl ? (
                            <img src={frontImgUrl} alt="Front Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>No Front Image</span>
                          )}
                        </div>
                        {frontImgUrl && (
                          <a href={frontImgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: '#1756AA', fontWeight: 700, textDecoration: 'underline' }}>
                            Open Front Image ↗
                          </a>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4E6080', marginBottom: '6px' }}>Back Image</label>
                        <div style={{ 
                          height: '180px', 
                          background: '#F8FAFF', 
                          borderRadius: '12px', 
                          border: '1.5px dashed #CBD5E1', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          overflow: 'hidden'
                        }}>
                          {backImgUrl ? (
                            <img src={backImgUrl} alt="Back Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>No Back Image</span>
                          )}
                        </div>
                        {backImgUrl && (
                          <a href={backImgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: '#1756AA', fontWeight: 700, textDecoration: 'underline' }}>
                            Open Back Image ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {doc.reason && (
                          <span style={{ fontSize: '0.8rem', color: '#4E6080', fontWeight: 600 }}>Remarks: {doc.reason}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className={styles.editBtn}
                          style={{
                            background: '#F0F9FF',
                            color: '#0284C7',
                            border: '1.5px solid #0284C7',
                            width: 'auto',
                            padding: '0 12px',
                            height: '28px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setViewModal({ isOpen: false, data: null });
                            handleOpenEdit(doc);
                          }}
                          title="Edit Document"
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          style={{
                            background: '#FFF5F5',
                            color: '#E53E3E',
                            border: '1.5px solid #E53E3E',
                            width: 'auto',
                            padding: '0 12px',
                            height: '28px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setViewModal({ isOpen: false, data: null });
                            setDeleteModal({ isOpen: true, id: doc.id });
                          }}
                          title="Delete Document"
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.modalFooter} style={{ padding: '10px 24px', minHeight: 'auto', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFF', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <button className={styles.pageBtn} style={{ padding: '0 20px', width: 'auto', height: '36px' }} onClick={() => setViewModal({ isOpen: false, data: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadKYC;
