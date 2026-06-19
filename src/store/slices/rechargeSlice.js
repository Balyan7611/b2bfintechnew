import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  apiList: [],
  apiBalances: [],
  isLoading: false
};

const rechargeSlice = createSlice({
  name: 'recharge',
  initialState,
  reducers: {
    toggleApiStatus: (state, action) => {
      const api = state.apiList.find(a => a.id === action.payload);
      if (api) api.status = !api.status;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

export const { toggleApiStatus, setLoading } = rechargeSlice.actions;
export default rechargeSlice.reducer;
