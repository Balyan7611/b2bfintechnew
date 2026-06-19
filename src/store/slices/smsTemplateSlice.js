import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

const smsTemplateSlice = createSlice({
  name: 'smsTemplate',
  initialState,
  reducers: {
    setTemplates: (state, action) => {
      state.templates = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setTemplates, setLoading, setError } = smsTemplateSlice.actions;
export default smsTemplateSlice.reducer;
