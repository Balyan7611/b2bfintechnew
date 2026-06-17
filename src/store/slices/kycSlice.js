import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kycForm: {
    documentName: '',
    side: '1'
  },
  kycList: [
    { id: 1, name: 'Selfie Photo', side: '1', addDate: '09/08/2022 12:32:09' },
    { id: 2, name: 'Pan Card', side: '1', addDate: '09/08/2022 12:32:14' },
    { id: 3, name: 'Aadhar Both Side', side: '2', addDate: '09/08/2022 12:32:21' },
    { id: 4, name: 'Shop Front Photo', side: '1', addDate: '09/08/2022 13:47:41' },
    { id: 5, name: 'Business proof', side: '1', addDate: '24/04/2024 16:50:56' },
    { id: 6, name: 'Bank Details', side: '1', addDate: '29/01/2025 12:49:05' },
    { id: 7, name: 'Driving License', side: '2', addDate: '05/06/2025 09:55:50' },
    { id: 8, name: 'Voter ID', side: '2', addDate: '05/06/2025 10:00:23' },
    { id: 9, name: 'Passport Front', side: '1', addDate: '10/06/2025 11:12:00' },
    { id: 10, name: 'Passport Back', side: '1', addDate: '10/06/2025 11:15:30' },
    { id: 11, name: 'Electricity Bill', side: '1', addDate: '11/06/2025 14:20:45' },
    { id: 12, name: 'Water Bill', side: '1', addDate: '12/06/2025 09:10:11' },
    { id: 13, name: 'Rent Agreement', side: '2', addDate: '15/06/2025 16:05:22' },
    { id: 14, name: 'GST Certificate', side: '1', addDate: '18/06/2025 10:45:30' },
    { id: 15, name: 'MSME Certificate', side: '1', addDate: '20/06/2025 13:22:15' },
    { id: 16, name: 'Cancelled Cheque', side: '1', addDate: '22/06/2025 15:30:50' },
    { id: 17, name: 'Passbook Front Page', side: '1', addDate: '25/06/2025 11:40:20' },
    { id: 18, name: 'ITR Copy', side: '2', addDate: '28/06/2025 09:15:10' },
    { id: 19, name: 'Property Tax Receipt', side: '1', addDate: '01/07/2025 14:50:35' },
    { id: 20, name: 'Trade License', side: '1', addDate: '05/07/2025 10:25:40' },
    { id: 21, name: 'Shop Inside Photo', side: '1', addDate: '08/07/2025 16:10:15' },
    { id: 22, name: 'Partnership Deed', side: '2', addDate: '10/07/2025 11:05:55' },
    { id: 23, name: 'Board Resolution', side: '2', addDate: '12/07/2025 13:40:25' },
    { id: 24, name: 'Company PAN', side: '1', addDate: '15/07/2025 15:20:30' },
    { id: 25, name: 'Director Aadhar', side: '2', addDate: '18/07/2025 09:55:45' }
  ],
  kycRequests: [
    { 
      id: 1, 
      memberId: 'MEM8472', 
      name: 'Rahul Sharma', 
      status: 'Pending', 
      reason: '-', 
      document: 'Aadhar Card', 
      docNumber: 'XXXX-XXXX-1234',
      addDate: '2026-05-01 10:20:15',
      approveDate: '-'
    },
    { 
      id: 2, 
      memberId: 'MEM9021', 
      name: 'Priya Singh', 
      status: 'Approved', 
      reason: 'Verified', 
      document: 'PAN Card', 
      docNumber: 'ABCDE1234F',
      addDate: '2026-04-28 14:15:30',
      approveDate: '2026-04-30 11:00:00'
    },
    { 
      id: 3, 
      memberId: 'MEM4521', 
      name: 'Amit Kumar', 
      status: 'Pending', 
      reason: '-', 
      document: 'Voter ID', 
      docNumber: 'VOT1234567',
      addDate: '2026-05-03 16:45:10',
      approveDate: '-'
    },
  ],
  selectedKyc: null,
  openActionMenu: null,
  isSubmitting: false,
  memberUpload: {
    uploadRows: [{ id: 1, document: '', file: null, number: '', status: 'idle' }],
    myDocuments: [
      { 
        id: 1, 
        documentName: 'Aadhar Card', 
        status: 'Approved', 
        reason: '-', 
        addDate: '01/05/2026',
        imageUrl: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=600'
      },
      { 
        id: 2, 
        documentName: 'PAN Card', 
        status: 'Pending', 
        reason: '-', 
        addDate: '05/05/2026',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'
      },
      { 
        id: 3, 
        documentName: 'Bank Details', 
        status: 'Rejected', 
        reason: 'Unclear Image', 
        addDate: '02/05/2026',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600'
      }
    ],
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
