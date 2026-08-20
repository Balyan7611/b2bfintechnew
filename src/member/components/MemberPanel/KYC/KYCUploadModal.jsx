import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUploadCloud, FiCheckCircle, FiPlus, FiTrash2, FiX, FiFileText, FiShield
} from 'react-icons/fi';
import {
  addUploadRow,
  updateUploadRow,
  removeUploadRow,
  resetUploadRows
} from '../../../../store/slices/kycSlice';
import { setNotification } from '../../../../store/slices/uiSlice';
import { KycDocumentService } from '../../../../services/kycDocument.service';
import axios from '../../../../api/httpClient';
import { resolveReportScopeId } from '../../../../utils/reportScope';
import styles from '../../../../admin/components/MemberPages/MemberPages.module.css';
import uploadStyles from './UploadKYC.module.css';

const API_BASE_URL = '/MemberKYCDocuments';

// Phone camera photos are routinely 5-15MB, and the backend rejects
// multipart uploads that exceed its form buffer with a 400 "Buffer limit
// exceeded" — there's no server-side knob we can reach from here, so we
// downscale/re-encode the image client-side before it ever gets attached to
// the FormData. Non-image files (e.g. a scanned PDF) pass through untouched.
const compressImage = (file, maxDim = 1600, quality = 0.72) => {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File(
            [blob],
            file.name.replace(/\.\w+$/, '.jpg'),
            { type: 'image/jpeg' }
          );
          resolve(compressed);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

const KYCUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const dispatch = useDispatch();
  const { uploadRows } = useSelector(state => state.kyc.memberUpload);

  // Document types (and how many sides each needs — 1 or 2) come from the
  // KYC Master admin has configured, not a hardcoded dummy list. e.g. admin
  // may mark PAN Card as 1-side and Aadhar Card as 2-side (front + back).
  const [masterDocs, setMasterDocs] = useState([]);

  // Redux only keeps the picked filename (for display) since File objects
  // aren't serializable. The real File blobs needed for the upload live here,
  // keyed by row id.
  const [fileBlobs, setFileBlobs] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const fetchMasterDocs = async () => {
      try {
        const res = await KycDocumentService.getKycdocumentsMaster({ PageNumber: 1, PageSize: 100 });
        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        const active = items.filter(d => d.isActive !== false && d.name);
        if (!cancelled) setMasterDocs(active);
      } catch (err) {
        console.error('KYCUploadModal: failed to load KYC master document types', err);
        if (!cancelled) setMasterDocs([]);
      }
    };
    fetchMasterDocs();
    return () => { cancelled = true; };
  }, [isOpen]);

  // side === 2 means admin requires both front & back images for this doc type.
  const getSideCount = (docName) => {
    const match = masterDocs.find(d => d.name === docName);
    return match?.side === 2 ? 2 : 1;
  };

  // Reopening the modal later should start clean, not show last session's
  // rows still marked "success" and locked/disabled — this used to leak
  // across opens since uploadRows lives in redux and was never reset.
  const handleClose = () => {
    dispatch(resetUploadRows());
    setFileBlobs({});
    setUploadingId(null);
    onClose?.();
  };

  const handleFileChange = async (e, id, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const finalFile = await compressImage(file);
    setFileBlobs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field === 'frontFile' ? 'front' : 'back']: finalFile }
    }));
    dispatch(updateUploadRow({ id, field, value: file.name }));
  };

  const handleDocumentChange = (id, value) => {
    dispatch(updateUploadRow({ id, field: 'document', value }));
    // Selecting a 1-side doc after having picked a 2-side one shouldn't leave
    // a stale "back" file hanging around attached to the row.
    if (getSideCount(value) === 1) {
      dispatch(updateUploadRow({ id, field: 'backFile', value: null }));
      setFileBlobs(prev => ({ ...prev, [id]: { ...prev[id], back: null } }));
    }
  };

  const handleUploadRow = async (row) => {
    const blobs = fileBlobs[row.id] || {};
    const sideCount = getSideCount(row.document);
    if (!row.document || !blobs.front || (sideCount === 2 && !blobs.back)) return;

    setUploadingId(row.id);
    try {
      const { id: scopeId, error: scopeError } = await resolveReportScopeId();
      if (!scopeId) {
        dispatch(setNotification({ type: 'error', message: scopeError || 'Could not determine your account.' }));
        return;
      }

      const matchedMaster = masterDocs.find(d => d.name === row.document);

      const formData = new FormData();
      formData.append('Msrno', scopeId);
      formData.append('DocID', matchedMaster?.id || '0');
      formData.append('DocName', row.document);
      formData.append('DocNumber', row.number || '');
      formData.append('EMPID', '0');
      formData.append('FrontImageFile', blobs.front);
      if (sideCount === 2 && blobs.back) {
        formData.append('BackImageFile', blobs.back);
      }

      const res = await axios.post(`${API_BASE_URL}/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.status) {
        dispatch(setNotification({ type: 'success', message: res.data?.mess || res.data?.message || 'Document uploaded successfully!' }));
        dispatch(updateUploadRow({ id: row.id, field: 'status', value: 'success' }));
        onUploaded?.();
      } else {
        dispatch(setNotification({ type: 'error', message: res.data?.mess || res.data?.message || 'Failed to upload document.' }));
      }
    } catch (err) {
      console.error('KYCUploadModal: upload failed', err);
      dispatch(setNotification({
        type: 'error',
        message: err.response?.data?.mess || err.response?.data?.message || err.message || 'Error uploading document.'
      }));
    } finally {
      setUploadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ padding: '16px 24px', background: '#ffffff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, rgba(23, 86, 170, 0.1) 0%, rgba(23, 86, 170, 0.2) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1756AA',
              flexShrink: 0
            }}>
              <FiShield size={20} />
            </div>
            <div className={styles.modalHeaderTitleGroup}>
              <h2 className={styles.modalTitle} style={{ color: '#0F172A', fontSize: '1.1rem' }}>Upload KYC Documents</h2>
              <p className={styles.modalSubtitle} style={{ color: '#64748B' }}>Submit your identification proofs for verification</p>
            </div>
          </div>
          <button
            className={styles.drawerCloseBtn}
            onClick={handleClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
          >
            <FiX size={18} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ padding: '24px', background: '#F8FAFC' }}>
          <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #EEF3FC', padding: '18px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
          <div className={uploadStyles.uploadTableWrapper} style={{ border: 'none', boxShadow: 'none' }}>
            <table className={uploadStyles.uploadTable}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Document</th>
                  <th style={{ width: '38%' }}>File</th>
                  <th style={{ width: '20%' }}>Number</th>
                  <th style={{ width: '20%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadRows.map((row) => {
                  const sideCount = row.document ? getSideCount(row.document) : 1;
                  const isDone = row.status === 'success';
                  const isUploading = uploadingId === row.id;
                  const readyToUpload = !!row.document && !!row.frontFile && (sideCount === 1 || !!row.backFile);
                  return (
                    <tr key={row.id}>
                      <td>
                        <select
                          className={uploadStyles.selectControl}
                          value={row.document}
                          onChange={(e) => handleDocumentChange(row.id, e.target.value)}
                          disabled={isDone}
                        >
                          <option value="">
                            {masterDocs.length === 0 ? '-- No document types configured --' : '-- Select Document --'}
                          </option>
                          {masterDocs.map(doc => (
                            <option key={doc.id} value={doc.name}>
                              {doc.name}{doc.side === 2 ? ' (Front + Back)' : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {!row.document ? (
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                            Select a document first
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className={uploadStyles.fileUploadZone}>
                              <label className={uploadStyles.fileInputLabel}>
                                <FiUploadCloud /> {row.frontFile ? (sideCount === 2 ? 'Change Front' : 'Change File') : (sideCount === 2 ? 'Choose Front' : 'Choose File')}
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className={uploadStyles.hiddenFileInput}
                                  onChange={(e) => handleFileChange(e, row.id, 'frontFile')}
                                  disabled={isDone}
                                />
                              </label>
                              {row.frontFile && (
                                <span className={uploadStyles.fileName} title={row.frontFile}>
                                  {row.frontFile}
                                </span>
                              )}
                            </div>
                            {sideCount === 2 && (
                              <div className={uploadStyles.fileUploadZone}>
                                <label className={uploadStyles.fileInputLabel}>
                                  <FiUploadCloud /> {row.backFile ? 'Change Back' : 'Choose Back'}
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className={uploadStyles.hiddenFileInput}
                                    onChange={(e) => handleFileChange(e, row.id, 'backFile')}
                                    disabled={isDone}
                                  />
                                </label>
                                {row.backFile && (
                                  <span className={uploadStyles.fileName} title={row.backFile}>
                                    {row.backFile}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Document Number"
                          className={uploadStyles.inputControl}
                          value={row.number}
                          onChange={(e) => dispatch(updateUploadRow({ id: row.id, field: 'number', value: e.target.value }))}
                          disabled={isDone}
                        />
                      </td>
                      <td>
                        <div className={uploadStyles.actionBtnBox}>
                          {isDone ? (
                            <FiCheckCircle className={uploadStyles.successTick} />
                          ) : (
                            <button
                              className={uploadStyles.uploadBtn}
                              onClick={() => handleUploadRow(row)}
                              disabled={!readyToUpload || isUploading}
                              style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', borderRadius: '10px' }}
                            >
                              {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                          )}

                          {uploadRows.length > 1 && !isDone && (
                            <button
                              className={uploadStyles.removeRowBtn}
                              onClick={() => dispatch(removeUploadRow(row.id))}
                              title="Remove Row"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            className={uploadStyles.addMoreBtn}
            onClick={() => dispatch(addUploadRow())}
            style={{ marginTop: '15px' }}
          >
            <FiPlus /> Add More Document
          </button>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.prevBtn} onClick={handleClose}>Close</button>
          <button
            className={styles.nextBtn}
            onClick={handleClose}
            style={{ background: '#1756AA' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCUploadModal;
