import { createSlice } from '@reduxjs/toolkit';

const HOLD_DATA = [];

const BANK_DATA = [];

const MASTER_BANKS = [];

const MEMBER_BANK_DATA = [];

const FUND_REQUEST_DATA = [];

const TRANSFER_DATA = [];

const initialState = {
  holdAmountList: HOLD_DATA,
  companyBankList: BANK_DATA,
  addBankList: MASTER_BANKS,
  memberBankList: MEMBER_BANK_DATA,
  fundRequestList: FUND_REQUEST_DATA,
  transferList: TRANSFER_DATA,
  addBankSearchQuery: '',
  addBankSelectedBank: null,
  addBankIsPanelOpen: false,
  addBankIsActive: true,
};

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    toggleBankActive: (state, action) => {
      const bank = state.companyBankList.find(b => b.id === action.payload);
      if (bank) {
        bank.active = !bank.active;
      }
    },
    setAddBankSearchQuery: (state, action) => { state.addBankSearchQuery = action.payload; },
    setAddBankSelectedBank: (state, action) => { state.addBankSelectedBank = action.payload; },
    setAddBankIsPanelOpen: (state, action) => { state.addBankIsPanelOpen = action.payload; },
    setAddBankIsActive: (state, action) => { state.addBankIsActive = action.payload; },
    addHoldAmount: (state, action) => {
      state.holdAmountList.unshift({
        id: Date.now(),
        ...action.payload,
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')
      });
    },
    deleteHoldAmount: (state, action) => {
      state.holdAmountList = state.holdAmountList.filter(item => item.id !== action.payload);
    },
    updateHoldAmount: (state, action) => {
      const index = state.holdAmountList.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.holdAmountList[index] = {
          ...state.holdAmountList[index],
          ...action.payload
        };
      }
    },
    toggleMemberBankStatus: (state, action) => {
      const bank = state.memberBankList.find(b => b.id === action.payload);
      if (bank) {
        bank.status = bank.status === 'Active' ? 'InActive' : 'Active';
      }
    },
    updateFundRequestStatus: (state, action) => {
      const { id, status, reason, date } = action.payload;
      const req = state.fundRequestList.find(r => r.id === id);
      if (req) {
        req.status = status;
        req.reason = reason;
        req.approveRejectDate = date;
      }
    },
  },
});

export const { 
  toggleBankActive, 
  setAddBankSearchQuery, 
  setAddBankSelectedBank, 
  setAddBankIsPanelOpen, 
  setAddBankIsActive,
  addHoldAmount,
  deleteHoldAmount,
  updateHoldAmount,
  toggleMemberBankStatus,
  updateFundRequestStatus
} = balanceSlice.actions;
export default balanceSlice.reducer;
