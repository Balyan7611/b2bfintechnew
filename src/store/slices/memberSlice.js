import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staffList: [],
  staffForm: {
    role: '', name: '', age: '', email: '', mobile: '', loginId: '',
    loginPin: '', password: '', pan: '', aadhar: '', address: '', pincode: '', active: true
  },
  isDrawerOpen: false,
  editingStaff: null,
  changePassword: {
    member: '',
    newPass: '',
    confirmPass: '',
  },
  tpinState: {
    member: '',
    tpin: ['', '', '', ''],
    confirmTpin: ['', '', '', ''],
  },
  securityState: {
    globalToggles: { twoWay: true, otp: true, tpin: false },
    memberList: []
  },
  creditLimitState: {
    form: { memberId: '', amount: '0', narration: '', mode: '' },
    list: []
  },
  manageMemberState: {
    filters: { fromDate: '', toDate: '', role: '', search: '', memberType: 'All', kycStatus: 'All' },
    list: []
  },
  registrationState: {
    currentStep: 1,
    form: {
      role: '', upline: '', packageId: '',
      title: 'Mr', gender: 'Male', name: '', aadhar: '', pan: '', dob: '', mobile: '', whatsapp: '', email: '',
      address1: '', pincode: '', postOffice: '', city: '', state: '',
      businessName: '', bizAddress: '', bizPincode: '', bizPostOffice: '', bizCity: '', bizState: ''
    }
  },
  tidState: {
    form: { member: '', status: '', aepsid: '', mobile: '0', pin: '0', lat: '0.00', lng: '0.00' },
    list: [],
    isDrawerOpen: false,
    selectedTid: null
  }
};

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    toggleDrawer: (state, action) => {
      state.isDrawerOpen = action.payload;
      if (!action.payload) state.editingStaff = null;
    },
    setEditingStaff: (state, action) => {
      state.editingStaff = action.payload;
      if (action.payload) {
        state.staffForm = { ...action.payload };
      }
      state.isDrawerOpen = true;
    },
    updateStaffForm: (state, action) => {
      state.staffForm = { ...state.staffForm, ...action.payload };
    },
    resetStaffForm: (state) => {
      state.staffForm = { ...initialState.staffForm, loginId: 'EMP' + Math.floor(Math.random()*9000 + 1000) };
    },
    addStaff: (state, action) => {
      state.staffList.unshift({
        id: Date.now(),
        ...action.payload,
        doj: new Date().toLocaleDateString('en-GB')
      });
    },
    updateStaff: (state, action) => {
      const index = state.staffList.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staffList[index] = { ...state.staffList[index], ...action.payload };
      }
    },
    deleteStaff: (state, action) => {
      state.staffList = state.staffList.filter(s => s.id !== action.payload);
    },
    updateChangePassword: (state, action) => {
      state.changePassword = { ...state.changePassword, ...action.payload };
    },
    toggleStaffStatus: (state, action) => {
      const staff = state.staffList.find(s => s.id === action.payload);
      if (staff) staff.active = !staff.active;
    },
    updateTpin: (state, action) => {
      state.tpinState = { ...state.tpinState, ...action.payload };
    },
    updateSecurityToggle: (state, action) => {
      const { id, field } = action.payload;
      if (id === 'global') {
        const toggles = state.securityState.globalToggles;
        if (field === 'twoWay') {
          toggles.twoWay = !toggles.twoWay;
          if (toggles.twoWay) {
            toggles.otp = true;
            toggles.tpin = false;
            state.securityState.memberList.forEach(member => {
              member.twoWay = true;
              member.otp = true;
              member.tpin = false;
            });
          } else {
            toggles.otp = false;
            toggles.tpin = false;
            state.securityState.memberList.forEach(member => {
              member.twoWay = false;
              member.otp = false;
              member.tpin = false;
            });
          }
        } else if (toggles.twoWay) {
          if (field === 'otp' || field === 'tpin') {
            toggles.otp = !toggles.otp;
            toggles.tpin = !toggles.tpin;
            state.securityState.memberList.forEach(member => {
              if (member.twoWay) {
                member.otp = toggles.otp;
                member.tpin = toggles.tpin;
              }
            });
          }
        }
      } else {
        const member = state.securityState.memberList.find(m => String(m.id) === String(id));
        if (member) {
          if (field === 'twoWay') {
            member.twoWay = !member.twoWay;
            if (member.twoWay) {
              member.otp = true;
              member.tpin = false;
            } else {
              member.otp = false;
              member.tpin = false;
            }
          } else if (member.twoWay) {
            if (field === 'otp' || field === 'tpin') {
              member.otp = !member.otp;
              member.tpin = !member.tpin;
            }
          }
        }
      }
    },
    updateCreditLimitForm: (state, action) => {
      state.creditLimitState.form = { ...state.creditLimitState.form, ...action.payload };
    },
    addCreditLimit: (state, action) => {
      state.creditLimitState.list.unshift({
        id: Date.now(),
        ...action.payload,
        date: new Date().toLocaleDateString('en-GB')
      });
      state.creditLimitState.form = { memberId: '', amount: '0', narration: '', mode: '' };
    },
    updateRegistrationForm: (state, action) => {
      state.registrationState.form = { ...state.registrationState.form, ...action.payload };
    },
    setRegStep: (state, action) => {
      state.registrationState.currentStep = action.payload;
    },
    addMember: (state, action) => {
      state.manageMemberState.list.unshift({
        id: Date.now(),
        ...action.payload,
        doj: new Date().toLocaleString('en-GB'),
        mainBal: '0.00',
        aepsBal: '0.00',
        holdAmt: '0'
      });
      state.registrationState.form = initialState.registrationState.form;
      state.registrationState.currentStep = 1;
    },
    updateManageMemberFilters: (state, action) => {
      state.manageMemberState.filters = { ...state.manageMemberState.filters, ...action.payload };
    },
    updateTidForm: (state, action) => {
      state.tidState.form = { ...state.tidState.form, ...action.payload };
    },
    toggleTidDrawer: (state, action) => {
      state.tidState.isDrawerOpen = action.payload;
    },
    setEditingTid: (state, action) => {
      state.tidState.selectedTid = action.payload;
      state.tidState.isDrawerOpen = true;
    },
    deleteTid: (state, action) => {
      state.tidState.list = state.tidState.list.filter(t => t.id !== action.payload);
    },
    updateMemberDirect: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.manageMemberState.list.findIndex(m => m.id === id);
      if (index !== -1) {
        state.manageMemberState.list[index] = {
          ...state.manageMemberState.list[index],
          ...updates
        };
      }
    },
    deleteMember: (state, action) => {
      state.manageMemberState.list = state.manageMemberState.list.filter(m => m.id !== action.payload);
    }
  }
});

export const { 
  toggleDrawer, setEditingStaff, updateStaffForm, 
  resetStaffForm, addStaff, updateStaff, deleteStaff, updateChangePassword, toggleStaffStatus,
  updateTpin, updateSecurityToggle, updateCreditLimitForm, addCreditLimit,
  updateRegistrationForm, setRegStep, addMember, updateManageMemberFilters,
  updateTidForm, toggleTidDrawer, setEditingTid, deleteTid, updateMemberDirect, deleteMember
} = memberSlice.actions;

export default memberSlice.reducer;
