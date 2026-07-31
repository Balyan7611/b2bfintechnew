import { createSlice } from '@reduxjs/toolkit';

const storedNotifs = JSON.parse(localStorage.getItem('local_notifications')) || [];

const initialState = {
  isDarkMode: false,
  user: { name: 'Member User', role: 'Retailer (RT1001)', id: 'RT1001', avatar: '/avatar.png' },
  wallets: { main: 1000.00, aeps: 0.00, testDemo: 0.00 },
  selectedDate: new Date().toISOString().split('T')[0],
  activeTab: 'Recharge',
  serviceCards: [
    { id: 1, name: 'DMT', stat1Label: 'Surcharge', stat1Value: '0.00', color: '#8E24AA' },
    { id: 2, name: 'Recharge', stat1Label: 'Commission', stat1Value: '0.00', color: '#1E88E5' },
    { id: 3, name: 'AEPS', stat1Label: 'Commission', stat1Value: '0', color: '#43A047' },
    { id: 4, name: 'Payout', stat1Label: 'Surcharge', stat1Value: '0.00', color: '#E53935' },
    { id: 5, name: 'Wallet 2 Wallet', stat1Label: 'Processing', stat1Value: '0', color: '#FB8C00' },
    { id: 6, name: 'Aadharpay', stat1Label: 'Surcharge', stat1Value: '0.00', color: '#00897B' },
    { id: 7, name: 'UPI Cash Out', stat1Label: 'Surcharge', stat1Value: '0.00', color: '#1A237E' },
    { id: 8, name: 'UPI', stat1Label: 'Surcharge', stat1Value: '0', color: '#4CAF50' },
    { id: 9, name: 'Pan', stat1Label: 'Processing', stat1Value: '0', color: '#D81B60' },
    { id: 10, name: 'Virtual Account', stat1Label: 'Processing', stat1Value: '0', color: '#5E35B1' },
    { id: 11, name: 'Fund Request', stat1Label: 'Processing', stat1Value: '0', color: '#F4511E' },
    { id: 12, name: 'Shopping', stat1Label: 'Processing', stat1Value: '0', color: '#7CB342' },
    { id: 13, name: 'DTH', stat1Label: 'Commission', stat1Value: '0.00', color: '#1abc9c' },
    { id: 14, name: 'Electricity', stat1Label: 'Commission', stat1Value: '0.00', color: '#f1c40f' },
    { id: 15, name: 'Water', stat1Label: 'Commission', stat1Value: '0.00', color: '#3498db' },
    { id: 16, name: 'Gas', stat1Label: 'Commission', stat1Value: '0.00', color: '#e67e22' },
    { id: 17, name: 'Insurance', stat1Label: 'Commission', stat1Value: '0.00', color: '#2ecc71' },
    { id: 18, name: 'Fastag', stat1Label: 'Commission', stat1Value: '0.00', color: '#1c3b72' },
    { id: 19, name: 'Cable TV', stat1Label: 'Commission', stat1Value: '0.00', color: '#e67e22' },
    { id: 20, name: 'Municipal Tax', stat1Label: 'Commission', stat1Value: '0.00', color: '#1abc9c' },
  ],
  transactions: [],
  isProfileDropdownOpen: false,
  isSidebarOpen: true,
  isMobile: false,
  isUpgradePopupOpen: false,
  selectedPlan: null,
  isMailOpen: false,
  isNotifOpen: false,
  unreadMail: 5,
  unreadNotif: storedNotifs.length,
  mailList: [
    { id: 1, name: 'Paul Molive', time: '10 min ago', text: "I'm sorry but i'm not sure how...", initial: 'PM', color: '#6366f1' },
    { id: 2, name: 'Sahar Dary', time: '13 min ago', text: "All set! Now, time to get to you now......", initial: 'SD', color: '#ec4899' },
    { id: 3, name: 'Khadija Mehr', time: '20 min ago', text: "Are you ready to pickup your Delivery...", initial: 'KM', color: '#10b981' },
    { id: 4, name: 'Barney Cull', time: '30 min ago', text: "Here are some products...", initial: 'BC', color: '#f59e0b' },
    { id: 5, name: 'Sachin Balyan', time: '35 min ago', text: "Hey, how are you doing...", initial: 'SB', color: 'var(--color-primary)' }
  ],
  notifList: storedNotifs,
  searchTerm: ''
};

const memberPanelSlice = createSlice({
  name: 'memberPanel',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    // Replaces the (initially hardcoded/dummy) service tiles with the live,
    // active-only service list fetched from the backend Service master table.
    setServiceCards: (state, action) => {
      state.serviceCards = Array.isArray(action.payload) ? action.payload : [];
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setProfileDropdown: (state, action) => {
      state.isProfileDropdownOpen = action.payload;
      if (action.payload) { state.isMailOpen = false; state.isNotifOpen = false; }
    },
    toggleProfileDropdown: (state) => {
      state.isProfileDropdownOpen = !state.isProfileDropdownOpen;
      if (state.isProfileDropdownOpen) { state.isMailOpen = false; state.isNotifOpen = false; }
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    setUpgradePopup: (state, action) => {
      state.isUpgradePopupOpen = action.payload;
    },
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    toggleMailOpen: (state) => {
      state.isMailOpen = !state.isMailOpen;
      if (state.isMailOpen) { state.isNotifOpen = false; state.isProfileDropdownOpen = false; }
    },
    toggleNotifOpen: (state) => {
      state.isNotifOpen = !state.isNotifOpen;
      if (state.isNotifOpen) { state.isMailOpen = false; state.isProfileDropdownOpen = false; }
    },
    setMailOpen: (state, action) => {
      state.isMailOpen = action.payload;
    },
    setNotifOpen: (state, action) => {
      state.isNotifOpen = action.payload;
    },
    markAllMailRead: (state) => {
      state.unreadMail = 0;
    },
    markAllNotifRead: (state) => {
      state.unreadNotif = 0;
    },
    addNotification: (state, action) => {
      const newNotif = {
        id: Date.now(),
        title: action.payload.title || 'Admin Broadcast',
        text: action.payload.text,
        time: action.payload.time,
        type: 'broadcast',
        color: 'var(--color-primary)',
        image: action.payload.image,
        isPdf: action.payload.isPdf,
        fileName: action.payload.fileName,
        icon: action.payload.icon
      };

      // Always fetch latest from localStorage to avoid reviving deleted messages from other tabs
      const currentStorage = localStorage.getItem('local_notifications');
      if (currentStorage) {
         state.notifList = JSON.parse(currentStorage);
      } else {
         state.notifList = [];
      }

      state.notifList.unshift(newNotif);
      state.unreadNotif += 1;
      localStorage.setItem('local_notifications', JSON.stringify(state.notifList));
    },
    clearAllNotifications: (state) => {
      state.notifList = [];
      state.unreadNotif = 0;
      localStorage.removeItem('local_notifications');
    },
    syncNotifications: (state, action) => {
      const newList = action.payload;
      // If we are getting new items that aren't in our current list, increase unread
      if (newList.length > state.notifList.length) {
         state.unreadNotif += (newList.length - state.notifList.length);
      } else if (newList.length === 0) {
         state.unreadNotif = 0;
      }
      state.notifList = newList;
    }
  }
});

export const { 
  toggleDarkMode, 
  setSelectedDate,
  setSearchTerm,
  setServiceCards,
  setActiveTab,
  setProfileDropdown, 
  toggleProfileDropdown,
  toggleSidebar,
  setSidebarOpen,
  setIsMobile,
  setUpgradePopup,
  setSelectedPlan,
  toggleMailOpen,
  toggleNotifOpen,
  setMailOpen,
  setNotifOpen,
  markAllMailRead,
  markAllNotifRead,
  addNotification,
  clearAllNotifications,
  syncNotifications
} = memberPanelSlice.actions;
export default memberPanelSlice.reducer;