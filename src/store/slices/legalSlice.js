import { createSlice } from '@reduxjs/toolkit';
import { SITE_CONFIG } from '../../config/siteConfig';

const initialState = {
  legalForm: {
    newsName: '',
    description: ''
  },
  privacyForm: {
    newsName: '',
    description: ''
  },
  refundForm: {
    newsName: '',
    description: ''
  },
  securityForm: {
    newsName: '',
    description: ''
  },
  termsList: [],
  privacyList: [],
  refundList: [],
  securityList: [],
  expandedRow: null,
  privacyExpandedRow: null,
  refundExpandedRow: null,
  securityExpandedRow: null,
  isSubmitting: false
};

const legalSlice = createSlice({
  name: 'legal',
  initialState,
  reducers: {
    updateLegalForm: (state, action) => {
      const { name, value } = action.payload;
      state.legalForm[name] = value;
    },
    updatePrivacyForm: (state, action) => {
      const { name, value } = action.payload;
      state.privacyForm[name] = value;
    },
    updateRefundForm: (state, action) => {
      const { name, value } = action.payload;
      state.refundForm[name] = value;
    },
    updateSecurityForm: (state, action) => {
      const { name, value } = action.payload;
      state.securityForm[name] = value;
    },
    addTerm: (state) => {
      const newTerm = {
        id: Date.now(),
        name: state.legalForm.newsName,
        description: state.legalForm.description
      };
      state.termsList.unshift(newTerm);
      state.legalForm = { newsName: '', description: '' };
    },
    addPrivacy: (state) => {
      const newPrivacy = {
        id: Date.now(),
        name: state.privacyForm.newsName,
        description: state.privacyForm.description
      };
      state.privacyList.unshift(newPrivacy);
      state.privacyForm = { newsName: '', description: '' };
    },
    addRefund: (state) => {
      const newRefund = {
        id: Date.now(),
        name: state.refundForm.newsName,
        description: state.refundForm.description
      };
      state.refundList.unshift(newRefund);
      state.refundForm = { newsName: '', description: '' };
    },
    addSecurity: (state) => {
      const newSecurity = {
        id: Date.now(),
        name: state.securityForm.newsName,
        description: state.securityForm.description
      };
      state.securityList.unshift(newSecurity);
      state.securityForm = { newsName: '', description: '' };
    },
    deleteTerm: (state, action) => {
      state.termsList = state.termsList.filter(term => term.id !== action.payload);
    },
    deletePrivacy: (state, action) => {
      state.privacyList = state.privacyList.filter(p => p.id !== action.payload);
    },
    deleteRefund: (state, action) => {
      state.refundList = state.refundList.filter(r => r.id !== action.payload);
    },
    deleteSecurity: (state, action) => {
      state.securityList = state.securityList.filter(s => s.id !== action.payload);
    },
    toggleRowExpansion: (state, action) => {
      state.expandedRow = state.expandedRow === action.payload ? null : action.payload;
    },
    togglePrivacyExpansion: (state, action) => {
      state.privacyExpandedRow = state.privacyExpandedRow === action.payload ? null : action.payload;
    },
    toggleRefundExpansion: (state, action) => {
      state.refundExpandedRow = state.refundExpandedRow === action.payload ? null : action.payload;
    },
    toggleSecurityExpansion: (state, action) => {
      state.securityExpandedRow = state.securityExpandedRow === action.payload ? null : action.payload;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    }
  }
});

export const { 
  updateLegalForm, 
  updatePrivacyForm,
  updateRefundForm,
  updateSecurityForm,
  addTerm, 
  addPrivacy,
  addRefund,
  addSecurity,
  deleteTerm,
  deletePrivacy,
  deleteRefund,
  deleteSecurity,
  toggleRowExpansion, 
  togglePrivacyExpansion,
  toggleRefundExpansion,
  toggleSecurityExpansion,
  setIsSubmitting 
} = legalSlice.actions;

export default legalSlice.reducer;
