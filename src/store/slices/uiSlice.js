import { createSlice } from '@reduxjs/toolkit';

// Read saved theme from localStorage, use app-specific key to avoid localhost conflicts
const savedTheme = localStorage.getItem('bss_theme') || 'light';
// Apply immediately to avoid flash
document.documentElement.setAttribute('data-theme', savedTheme);

const initialState = {
  isNavScrolled: false,
  isMobileMenuOpen: false,
  isDarkMode: savedTheme === 'dark',
  globalLoading: false,
  globalNotification: null, // { type: 'success' | 'error', message: 'string' }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNavScrolled: (state, action) => {
      state.isNavScrolled = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      const theme = state.isDarkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('bss_theme', theme);
    },
    showLoader: (state) => {
      state.globalLoading = true;
    },
    hideLoader: (state) => {
      state.globalLoading = false;
    },
    setNotification: (state, action) => {
      state.globalNotification = action.payload;
    },
    clearNotification: (state) => {
      state.globalNotification = null;
    },
  },
});

export const { 
  setNavScrolled, 
  toggleMobileMenu, 
  setMobileMenuOpen, 
  toggleDarkMode,
  showLoader,
  hideLoader,
  setNotification,
  clearNotification
} = uiSlice.actions;
export default uiSlice.reducer;
