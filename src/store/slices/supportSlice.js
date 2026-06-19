import { createSlice } from '@reduxjs/toolkit';
import { SITE_CONFIG } from '../../config/siteConfig';

const SAMPLE_DATA = [];

const MANAGE_SUPPORT_SAMPLE = [];

const getFormattedDate = () => {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const initialState = {
  complainList: SAMPLE_DATA,
  currentPage: 1,
  rowsPerPage: 10,
  searchQuery: '',
  filterStatus: 'All',

  // Manage Support (Add Support page)
  manageSupportList: MANAGE_SUPPORT_SAMPLE,
  addSupportPage: 1,
  addSupportRows: 10,
  addSupportSearch: '',

  // Chat Popup
  isChatOpen: false,
  activeChatTicket: null,
  chatMessages: {},   // keyed by ticket id: { [id]: [{sender, text, time}] }
  chatInput: '',
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    // Complain List reducers
    setCurrentPage: (state, action) => { state.currentPage = action.payload; },
    setRowsPerPage: (state, action) => { state.rowsPerPage = action.payload; state.currentPage = 1; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; state.currentPage = 1; },
    setFilterStatus: (state, action) => { state.filterStatus = action.payload; state.currentPage = 1; },
    updateTicketStatus: (state, action) => {
      const { id, status } = action.payload;
      const ticket = state.complainList.find(t => t.id === id);
      if (ticket) {
        ticket.status = status;
        if (status === 'Approved' || status === 'Rejected') {
          const today = new Date();
          ticket.approveDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        }
      }
    },

    // Manage Support reducers
    addSupportEntry: (state, action) => {
      const newEntry = {
        id: Date.now(),
        name: action.payload.name,
        description: action.payload.description,
        status: 'Active',
        addDate: getFormattedDate(),
      };
      state.manageSupportList.unshift(newEntry);
    },
    updateSupportEntry: (state, action) => {
      const { id, name, description } = action.payload;
      const entry = state.manageSupportList.find(e => e.id === id);
      if (entry) {
        entry.name = name;
        entry.description = description;
      }
    },
    deleteSupportEntry: (state, action) => {
      state.manageSupportList = state.manageSupportList.filter(e => e.id !== action.payload);
    },
    toggleSupportStatus: (state, action) => {
      const entry = state.manageSupportList.find(e => e.id === action.payload);
      if (entry) {
        entry.status = entry.status === 'Active' ? 'InActive' : 'Active';
      }
    },
    setAddSupportPage: (state, action) => { state.addSupportPage = action.payload; },
    setAddSupportRows: (state, action) => { state.addSupportRows = action.payload; state.addSupportPage = 1; },
    setAddSupportSearch: (state, action) => { state.addSupportSearch = action.payload; state.addSupportPage = 1; },

    // Chat reducers
    openChat: (state, action) => {
      const ticket = action.payload;
      state.isChatOpen = true;
      state.activeChatTicket = ticket;
      state.chatInput = '';
      // Seed default messages if none exist for this ticket
      if (!state.chatMessages[ticket.id]) {
        state.chatMessages[ticket.id] = [];
      }
    },
    closeChat: (state) => {
      state.isChatOpen = false;
      state.activeChatTicket = null;
      state.chatInput = '';
    },
    sendChatMessage: (state, action) => {
      const { ticketId, text } = action.payload;
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const time = `${hours % 12 || 12}:${mins} ${ampm}`;
      if (!state.chatMessages[ticketId]) state.chatMessages[ticketId] = [];
      state.chatMessages[ticketId].push({ sender: 'admin', text, time });
      state.chatInput = '';
    },
    setChatInput: (state, action) => { state.chatInput = action.payload; },
  },
});

export const {
  setCurrentPage, setRowsPerPage, setSearchQuery, setFilterStatus, updateTicketStatus,
  addSupportEntry, updateSupportEntry, deleteSupportEntry, toggleSupportStatus,
  setAddSupportPage, setAddSupportRows, setAddSupportSearch,
  openChat, closeChat, sendChatMessage, setChatInput,
} = supportSlice.actions;

export default supportSlice.reducer;
