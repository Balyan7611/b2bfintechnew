import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kycForm: {
    documentName: '',
    side: '1'
  },
  kycList: [],
  kycRequests: [],
  selectedKyc: null,
  openActionMenu: null,
  isSubmitting: false,
  memberUpload: {
    uploadRows: [{ id: 1, document: '', file: null, number: '', status: 'idle' }],
    myDocuments: [],
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  }
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    updateKycForm: (state, action) => {
      const { name, value } = action.payload;
      state.kycForm[name] = value;
    },
    setOpenActionMenu: (state, action) => {
      state.openActionMenu = action.payload;
    },
    setSelectedKyc: (state, action) => {
      state.selectedKyc = action.payload;
    },
    approveKyc: (state, action) => {
      const request = state.kycRequests.find(r => r.id === action.payload);
      if (request) {
        request.status = 'Approved';
        request.reason = 'Verified by Admin';
        request.approveDate = new Date().toLocaleString('en-GB');
      }
    },
    rejectKyc: (state, action) => {
      const payloadObj = action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)
        ? action.payload
        : { id: action.payload, reason: 'Invalid Document Proof' };
      const request = state.kycRequests.find(r => r.id === payloadObj.id);
      if (request) {
        request.status = 'Rejected';
        request.reason = payloadObj.reason || 'Invalid Document Proof';
        request.approveDate = new Date().toLocaleString('en-GB');
      }
    },
    addKycDocument: (state) => {
      const newDoc = {
        id: Date.now(),
        name: state.kycForm.documentName,
        side: state.kycForm.side,
        addDate: new Date().toLocaleString()
      };
      state.kycList.unshift(newDoc);
      state.kycForm = { documentName: '', side: '1' };
    },
    deleteKycDocument: (state, action) => {
      state.kycList = state.kycList.filter(doc => doc.id !== action.payload);
      state.openActionMenu = null;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    addUploadRow: (state) => {
      const newId = state.memberUpload.uploadRows.length ? Math.max(...state.memberUpload.uploadRows.map(r => r.id)) + 1 : 1;
      state.memberUpload.uploadRows.push({ id: newId, document: '', file: null, number: '', status: 'idle' });
    },
    updateUploadRow: (state, action) => {
      const { id, field, value } = action.payload;
      const row = state.memberUpload.uploadRows.find(r => r.id === id);
      if (row) {
        row[field] = value;
      }
    },
    removeUploadRow: (state, action) => {
      state.memberUpload.uploadRows = state.memberUpload.uploadRows.filter(r => r.id !== action.payload);
    },
    submitUploadRow: (state, action) => {
      const row = state.memberUpload.uploadRows.find(r => r.id === action.payload);
      if (row && row.document && row.file) {
        row.status = 'success';
        state.memberUpload.myDocuments.unshift({
          id: Date.now(),
          documentName: row.document,
          status: 'Pending',
          reason: '-',
          addDate: new Date().toLocaleDateString('en-GB')
        });
      }
    },
    setMemberUploadSearch: (state, action) => {
      state.memberUpload.searchQuery = action.payload;
    },
    setMemberUploadRowsPerPage: (state, action) => {
      state.memberUpload.rowsPerPage = action.payload;
      state.memberUpload.currentPage = 1;
    },
    setMemberUploadCurrentPage: (state, action) => {
      state.memberUpload.currentPage = action.payload;
    }
  }
});

export const { 
  updateKycForm, 
  setOpenActionMenu, 
  addKycDocument, 
  deleteKycDocument,
  setIsSubmitting,
  setSelectedKyc,
  approveKyc,
  rejectKyc,
  addUploadRow,
  updateUploadRow,
  removeUploadRow,
  submitUploadRow,
  setMemberUploadSearch,
  setMemberUploadRowsPerPage,
  setMemberUploadCurrentPage
} = kycSlice.actions;

export default kycSlice.reducer;
