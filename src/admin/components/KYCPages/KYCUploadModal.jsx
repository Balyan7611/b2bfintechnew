import React from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiUploadCloud, FiCheckCircle, FiPlus, FiEye, FiTrash2, FiDatabase, FiX, FiFileText
} from 'react-icons/fi';
import { 
  addUploadRow, 
  updateUploadRow, 
  removeUploadRow, 
  submitUploadRow
} from '../../../store/slices/kycSlice';
import styles from '../MemberPages/MemberPages.module.css';
import uploadStyles from './UploadKYC.module.css';

const KYCUploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { uploadRows } = useSelector(state => state.kyc.memberUpload);
  const { list: memberList } = useSelector(state => state.member?.manageMemberState || { list: [] });
  const [selectedMember, setSelectedMember] = React.useState('');

  const kycDocTypes = [
    'Aadhar Card Front',
    'Aadhar Card Back',
    'PAN Card',
    'Voter ID',
    'Driving License',
    'Passport',
    'Bank Passbook',
    'Shop Photo'
  ];

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(updateUploadRow({ id, field: 'file', value: file.name }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} style={{ width: '900px', maxWidth: '98vw' }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #1756AA 0%, #0D1B3E 100%)', color: '#fff', padding: '12px 24px' }}>
          <div className={styles.modalHeaderTitleGroup}>
            <h2 className={styles.modalTitle} style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>UPLOAD KYC DOCUMENTS</h2>
            <p className={styles.modalSubtitle} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '4px 0 0 0' }}>Submit your identification proofs for verification</p>
          </div>
          <button className={styles.drawerCloseBtn} onClick={onClose} style={{ top: '15px' }}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4E6080', marginBottom: '8px' }}>Select Member</label>
            <select 
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', color: '#0D1B3E', fontWeight: 500, backgroundColor: '#F8FAFF' }}
            >
              <option value="">-- Choose a Member --</option>
              {memberList && memberList.length > 0 ? (
                memberList.map(m => (
                  <option key={m.id} value={m.memberId}>{m.memberId} - {m.name}</option>
                ))
              ) : (
                <>
                  <option value="MEM8472">MEM8472 - Rahul Sharma</option>
                  <option value="MEM9021">MEM9021 - Priya Singh</option>
                  <option value="MEM4521">MEM4521 - Amit Kumar</option>
                </>
              )}
            </select>
          </div>

          <div className={uploadStyles.uploadTableWrapper} style={{ opacity: selectedMember ? 1 : 0.5, pointerEvents: selectedMember ? 'auto' : 'none' }}>
            <table className={uploadStyles.uploadTable}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>File</th>
                  <th>Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadRows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ width: '25%' }}>
                      <select 
                        className={uploadStyles.selectControl}
                        value={row.document}
                        onChange={(e) => dispatch(updateUploadRow({ id: row.id, field: 'document', value: e.target.value }))}
                        disabled={row.status === 'success'}
                      >
                        <option value="">-- Select Document --</option>
                        {kycDocTypes.map(doc => (
                          <option key={doc} value={doc}>{doc}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ width: '35%' }}>
                      <div className={uploadStyles.fileUploadZone}>
                        <label className={uploadStyles.fileInputLabel}>
                          <FiUploadCloud /> {row.file ? 'Change File' : 'Choose File'}
                          <input 
                            type="file" 
                            className={uploadStyles.hiddenFileInput}
                            onChange={(e) => handleFileChange(e, row.id)}
                            disabled={row.status === 'success'}
                          />
                        </label>
                        {row.file && (
                          <span className={uploadStyles.fileName} title={row.file}>
                            {row.file}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ width: '25%' }}>
                      <input 
                        type="text" 
                        placeholder="Document Number"
                        className={uploadStyles.inputControl}
                        value={row.number}
                        onChange={(e) => dispatch(updateUploadRow({ id: row.id, field: 'number', value: e.target.value }))}
                        disabled={row.status === 'success'}
                      />
                    </td>
                    <td style={{ width: '15%' }}>
                      <div className={uploadStyles.actionBtnBox}>
                        {row.status === 'success' ? (
                          <FiCheckCircle className={uploadStyles.successTick} />
                        ) : (
                          <button 
                            className={uploadStyles.uploadBtn}
                            onClick={() => dispatch(submitUploadRow(row.id))}
                            disabled={!row.document || !row.file}
                            style={{ background: '#1756AA', borderRadius: '8px' }}
                          >
                            Upload
                          </button>
                        )}
                        
                        {uploadRows.length > 1 && row.status !== 'success' && (
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
                ))}
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

        <div className={styles.modalFooter}>
          <button className={styles.prevBtn} onClick={onClose}>Close</button>
          <button 
            className={styles.nextBtn} 
            onClick={onClose}
            style={{ background: '#1756AA' }}
          >
            Submit All
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCUploadModal;
