import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  securities: [],
  loading: false,
  error: null,
};

const memberSecuritySlice = createSlice({
  name: 'memberSecurity',
  initialState,
  reducers: {
    setSecurities: (state, action) => {
      state.securities = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setSecurities, setLoading, setError } = memberSecuritySlice.actions;
export default memberSecuritySlice.reducer;
