import { createSlice } from '@reduxjs/toolkit';

const initialSlab = { general: 0, amountType: 'COM', valueType: 'PER' };

const initialApiForm = {
  apiName: '',
  apiUrl: '',
  apiKey: '',
  serviceType: '',
  commissionPct: 0,
  surchargePct: 0,
};

const initialApiCommForm = {
  apiName: '',
  service: '',
  operator: '',
  startValue: 0,
  endValue: 0,
  general: 0,
  amountType: 'COM',
  valueType: 'PER',
  details: ''
};

const initialState = {
  form: {
    package: '',
    service: '',
    operator: '',
    startValue: 0,
    endValue: 0,
    details: '',
    slabs: {
      slabCharges: { ...initialSlab },
      retailer: { ...initialSlab },
      distributer: { ...initialSlab },
      superDistributer: { ...initialSlab },
      client: { ...initialSlab }
    }
  },
  list: [],
  apiCommForm: { ...initialApiCommForm },
  apiCommList: [],
  apiForm: { ...initialApiForm },
  apiList: [],
  commonCommission: {
    selectedService: '',
    list: [],
    searchQuery: '',
    rowsPerPage: 10,
    currentPage: 1
  }
};

const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form[name] = value;
    },
    updateSlabField: (state, action) => {
      const { slabName, field, value } = action.payload;
      if (state.form.slabs[slabName]) {
        state.form.slabs[slabName][field] = value;
      }
    },
    addCommission: (state) => {
      const newEntry = {
        id: Date.now().toString(),
        ...state.form,
        isActive: true
      };
      state.list.unshift(newEntry);
      state.form.startValue = 0;
      state.form.endValue = 0;
      state.form.details = '';
      state.form.slabs = {
        slabCharges: { ...initialSlab },
        retailer: { ...initialSlab },
        distributer: { ...initialSlab },
        superDistributer: { ...initialSlab },
        client: { ...initialSlab }
      };
    },
    setFormData: (state, action) => {
      state.form = action.payload;
    },
    updateCommission: (state, action) => {
      const index = state.list.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...state.form };
      }
      state.form = {
        package: '',
        service: '',
        operator: '',
        startValue: 0,
        endValue: 0,
        details: '',
        slabs: {
          slabCharges: { ...initialSlab },
          retailer: { ...initialSlab },
          distributer: { ...initialSlab },
          superDistributer: { ...initialSlab },
          client: { ...initialSlab }
        }
      };
    },
    toggleCommissionStatus: (state, action) => {
      const id = action.payload;
      const index = state.list.findIndex(item => item.id === id);
      if (index !== -1) state.list[index].isActive = !state.list[index].isActive;
    },
    deleteCommission: (state, action) => {
      state.list = state.list.filter(item => item.id !== action.payload);
    },
    saveMatrix: (state, action) => {
      const { package: pkg, service, operator, slabs } = action.payload;
      state.list = state.list.filter(item => 
        !(item.package === pkg && item.service === service && item.operator === operator)
      );
      slabs.forEach((slab, index) => {
        state.list.unshift({
          id: Date.now().toString() + '-' + index,
          package: pkg,
          service: service,
          operator: operator,
          startValue: slab.startValue,
          endValue: slab.endValue,
          details: slab.details || '',
          slabs: slab.slabs,
          isActive: true
        });
      });
    },
    // ── API COMMISSION RANGE reducers ──
    updateApiCommForm: (state, action) => {
      const { name, value } = action.payload;
      state.apiCommForm[name] = value;
    },
    addApiCommEntry: (state) => {
      const newEntry = {
        id: Date.now().toString(),
        ...state.apiCommForm,
        isActive: true
      };
      state.apiCommList.unshift(newEntry);
      state.apiCommForm = { ...initialApiCommForm };
    },
    setApiCommForm: (state, action) => {
      state.apiCommForm = action.payload;
    },
    updateApiCommEntry: (state, action) => {
      const index = state.apiCommList.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.apiCommList[index] = { ...state.apiCommList[index], ...state.apiCommForm };
      }
      state.apiCommForm = { ...initialApiCommForm };
    },
    toggleApiCommStatus: (state, action) => {
      const index = state.apiCommList.findIndex(item => item.id === action.payload);
      if (index !== -1) state.apiCommList[index].isActive = !state.apiCommList[index].isActive;
    },
    deleteApiCommEntry: (state, action) => {
      state.apiCommList = state.apiCommList.filter(item => item.id !== action.payload);
    },
    // ── COMMISSION API SETUP reducers ──
    updateApiForm: (state, action) => {
      const { name, value } = action.payload;
      state.apiForm[name] = value;
    },
    addApiEntry: (state) => {
      const newEntry = {
        id: Date.now().toString(),
        ...state.apiForm,
        isActive: true
      };
      state.apiList.unshift(newEntry);
      state.apiForm = { ...initialApiForm };
    },
    setApiForm: (state, action) => {
      state.apiForm = action.payload;
    },
    updateApiEntry: (state, action) => {
      const index = state.apiList.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.apiList[index] = { ...state.apiList[index], ...state.apiForm };
      }
      state.apiForm = { ...initialApiForm };
    },
    toggleApiStatus: (state, action) => {
      const index = state.apiList.findIndex(item => item.id === action.payload);
      if (index !== -1) state.apiList[index].isActive = !state.apiList[index].isActive;
    },
    deleteApiEntry: (state, action) => {
      state.apiList = state.apiList.filter(item => item.id !== action.payload);
    },
    // ── COMMON COMMISSION reducers ──
    setCommonService: (state, action) => {
      state.commonCommission.selectedService = action.payload;
    },
    setCommonSearchQuery: (state, action) => {
      state.commonCommission.searchQuery = action.payload;
    },
    setCommonRowsPerPage: (state, action) => {
      state.commonCommission.rowsPerPage = action.payload;
      state.commonCommission.currentPage = 1;
    },
    setCommonCurrentPage: (state, action) => {
      state.commonCommission.currentPage = action.payload;
    },
    setCommonCommissionList: (state, action) => {
      state.commonCommission.list = action.payload;
    }
  }
});

export const { 
  updateFormField, 
  updateSlabField, 
  addCommission, 
  setFormData,
  updateCommission,
  toggleCommissionStatus, 
  deleteCommission,
  saveMatrix,
  updateApiCommForm,
  addApiCommEntry,
  setApiCommForm,
  updateApiCommEntry,
  toggleApiCommStatus,
  deleteApiCommEntry,
  updateApiForm,
  addApiEntry,
  setApiForm,
  updateApiEntry,
  toggleApiStatus,
  deleteApiEntry,
  setCommonService,
  setCommonSearchQuery,
  setCommonRowsPerPage,
  setCommonCurrentPage,
  setCommonCommissionList
} = commissionSlice.actions;

export default commissionSlice.reducer;
