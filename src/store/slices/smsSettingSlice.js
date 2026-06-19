import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: [],
  loading: false,
  error: null,
};

const smsSettingSlice = createSlice({
  name: 'smsSetting',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setSettings, setLoading, setError } = smsSettingSlice.actions;
export default smsSettingSlice.reducer;
