import { createSlice } from '@reduxjs/toolkit';

const today = new Date().toISOString().split('T')[0];

const initialState = {
  filters: {
    fromDate: today,
    toDate: today,
    memberId: '',
    service: '',
    mode: ''
  },
  mainWalletData: [],
  aepsReportData: [],
  isLoading: false,
  entriesToShow: 10,
  searchTerm: ''
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setEntriesToShow: (state, action) => {
      state.entriesToShow = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

export const { updateFilters, setEntriesToShow, setSearchTerm, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
