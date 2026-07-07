import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: '',
  generatedOtp: '',
  enteredOtp: '',
  password: '',
  isStep1Done: false,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setUserId: (state, action) => { state.userId = action.payload; },
    proceedToStep2: (state) => {
      state.generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      state.isStep1Done = true;
    },
    setPassword: (state, action) => { state.password = action.payload; },
    backToStep1: (state) => { state.isStep1Done = false; },
    resetLogin: () => ({ ...initialState }),
  },
});

export const { setUserId, proceedToStep2, setPassword, backToStep1, resetLogin } = loginSlice.actions;
export default loginSlice.reducer;
