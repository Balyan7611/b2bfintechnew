import { createSlice } from '@reduxjs/toolkit';

const today = new Date().toISOString().split('T')[0];

const initialState = {
  aepsReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      status: '',
      memberId: '',
      search: ''
    },
    isFilterOpen: false,
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  dmtReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      status: '',
      memberId: '',
      search: ''
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  payoutReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      status: '',
      memberId: '',
      search: ''
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  matmReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      status: '',
      memberId: '',
      search: ''
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  rechargeReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      status: '',
      memberId: '',
      search: '',
      service: ''
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  bbpsReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      status: '',
      memberId: '',
      search: '',
      service: ''
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  businessSummary: {
    list: [],
    filters: {
      month: '',
      date: ''
    }
  },
  aepsWalletReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  },
  mainWalletReport: {
    list: [],
    filters: {
      fromDate: today,
      toDate: today,
      memberId: ''
    },
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  }
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setAEPSList: (state, action) => {
      state.aepsReport.list = action.payload;
    },
    updateAEPSFilters: (state, action) => {
      state.aepsReport.filters = { ...state.aepsReport.filters, ...action.payload };
    },
    toggleAEPSFilterPanel: (state) => {
      state.aepsReport.isFilterOpen = !state.aepsReport.isFilterOpen;
    },
    setAEPSSearchQuery: (state, action) => {
      state.aepsReport.searchQuery = action.payload;
    },
    setAEPSRowsPerPage: (state, action) => {
      state.aepsReport.rowsPerPage = action.payload;
      state.aepsReport.currentPage = 1;
    },
    setAEPSCurrentPage: (state, action) => {
      state.aepsReport.currentPage = action.payload;
    },
    // DMT Reducers
    setDMTList: (state, action) => {
      state.dmtReport.list = action.payload;
    },
    updateDMTFilters: (state, action) => {
      state.dmtReport.filters = { ...state.dmtReport.filters, ...action.payload };
    },
    setDMTSearchQuery: (state, action) => {
      state.dmtReport.searchQuery = action.payload;
    },
    setDMTRowsPerPage: (state, action) => {
      state.dmtReport.rowsPerPage = action.payload;
      state.dmtReport.currentPage = 1;
    },
    setDMTCurrentPage: (state, action) => {
      state.dmtReport.currentPage = action.payload;
    },
    // Payout Reducers
    setPayoutList: (state, action) => {
      state.payoutReport.list = action.payload;
    },
    updatePayoutFilters: (state, action) => {
      state.payoutReport.filters = { ...state.payoutReport.filters, ...action.payload };
    },
    setPayoutSearchQuery: (state, action) => {
      state.payoutReport.searchQuery = action.payload;
    },
    setPayoutRowsPerPage: (state, action) => {
      state.payoutReport.rowsPerPage = action.payload;
      state.payoutReport.currentPage = 1;
    },
    setPayoutCurrentPage: (state, action) => {
      state.payoutReport.currentPage = action.payload;
    },
    // MATM Reducers
    setMATMList: (state, action) => {
      state.matmReport.list = action.payload;
    },
    updateMATMFilters: (state, action) => {
      state.matmReport.filters = { ...state.matmReport.filters, ...action.payload };
    },
    setMATMSearchQuery: (state, action) => {
      state.matmReport.searchQuery = action.payload;
    },
    setMATMRowsPerPage: (state, action) => {
      state.matmReport.rowsPerPage = action.payload;
      state.matmReport.currentPage = 1;
    },
    setMATMCurrentPage: (state, action) => {
      state.matmReport.currentPage = action.payload;
    },
    // Recharge Reducers
    setRechargeList: (state, action) => {
      state.rechargeReport.list = action.payload;
    },
    updateRechargeFilters: (state, action) => {
      state.rechargeReport.filters = { ...state.rechargeReport.filters, ...action.payload };
    },
    setRechargeSearchQuery: (state, action) => {
      state.rechargeReport.searchQuery = action.payload;
    },
    setRechargeRowsPerPage: (state, action) => {
      state.rechargeReport.rowsPerPage = action.payload;
      state.rechargeReport.currentPage = 1;
    },
    setRechargeCurrentPage: (state, action) => {
      state.rechargeReport.currentPage = action.payload;
    },
    // BBPS Reducers
    setBBPSList: (state, action) => {
      state.bbpsReport.list = action.payload;
    },
    updateBBPSFilters: (state, action) => {
      state.bbpsReport.filters = { ...state.bbpsReport.filters, ...action.payload };
    },
    setBBPSSearchQuery: (state, action) => {
      state.bbpsReport.searchQuery = action.payload;
    },
    setBBPSRowsPerPage: (state, action) => {
      state.bbpsReport.rowsPerPage = action.payload;
      state.bbpsReport.currentPage = 1;
    },
    setBBPSCurrentPage: (state, action) => {
      state.bbpsReport.currentPage = action.payload;
    },
    // Business Summary Reducers
    setBusinessList: (state, action) => {
      state.businessSummary.list = action.payload;
    },
    updateBusinessFilters: (state, action) => {
      state.businessSummary.filters = { ...state.businessSummary.filters, ...action.payload };
    },
    // AEPS Wallet Reducers
    setAEPSWalletList: (state, action) => {
      state.aepsWalletReport.list = action.payload;
    },
    updateAEPSWalletFilters: (state, action) => {
      state.aepsWalletReport.filters = { ...state.aepsWalletReport.filters, ...action.payload };
    },
    setAEPSWalletSearchQuery: (state, action) => {
      state.aepsWalletReport.searchQuery = action.payload;
    },
    setAEPSWalletRowsPerPage: (state, action) => {
      state.aepsWalletReport.rowsPerPage = action.payload;
      state.aepsWalletReport.currentPage = 1;
    },
    setAEPSWalletCurrentPage: (state, action) => {
      state.aepsWalletReport.currentPage = action.payload;
    },
    // Main Wallet Reducers
    setMainWalletList: (state, action) => {
      state.mainWalletReport.list = action.payload;
    },
    updateMainWalletFilters: (state, action) => {
      state.mainWalletReport.filters = { ...state.mainWalletReport.filters, ...action.payload };
    },
    setMainWalletSearchQuery: (state, action) => {
      state.mainWalletReport.searchQuery = action.payload;
    },
    setMainWalletRowsPerPage: (state, action) => {
      state.mainWalletReport.rowsPerPage = action.payload;
      state.mainWalletReport.currentPage = 1;
    },
    setMainWalletCurrentPage: (state, action) => {
      state.mainWalletReport.currentPage = action.payload;
    }
  }
});

export const { 
  setAEPSList, 
  updateAEPSFilters, 
  toggleAEPSFilterPanel, 
  setAEPSSearchQuery, 
  setAEPSRowsPerPage, 
  setAEPSCurrentPage,
  setDMTList,
  updateDMTFilters,
  setDMTSearchQuery,
  setDMTRowsPerPage,
  setDMTCurrentPage,
  setPayoutList,
  updatePayoutFilters,
  setPayoutSearchQuery,
  setPayoutRowsPerPage,
  setPayoutCurrentPage,
  setMATMList,
  updateMATMFilters,
  setMATMSearchQuery,
  setMATMRowsPerPage,
  setMATMCurrentPage,
  setRechargeList,
  updateRechargeFilters,
  setRechargeSearchQuery,
  setRechargeRowsPerPage,
  setRechargeCurrentPage,
  setBBPSList,
  updateBBPSFilters,
  setBBPSSearchQuery,
  setBBPSRowsPerPage,
  setBBPSCurrentPage,
  setBusinessList,
  updateBusinessFilters,
  setAEPSWalletList,
  updateAEPSWalletFilters,
  setAEPSWalletSearchQuery,
  setAEPSWalletRowsPerPage,
  setAEPSWalletCurrentPage,
  setMainWalletList,
  updateMainWalletFilters,
  setMainWalletSearchQuery,
  setMainWalletRowsPerPage,
  setMainWalletCurrentPage
} = reportSlice.actions;

export default reportSlice.reducer;
