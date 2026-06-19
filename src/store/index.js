import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import testimonialsReducer from './slices/testimonialsSlice';
import registrationReducer from './slices/registrationSlice';
import loginReducer from './slices/loginSlice';
import dashboardReducer from './slices/dashboardSlice';
import supportReducer from './slices/supportSlice';
import balanceReducer from './slices/balanceSlice';
import memberReducer from './slices/memberSlice';
import commissionReducer from './slices/commissionSlice';
import kycReducer from './slices/kycSlice';
import legalReducer from './slices/legalSlice';
import walletReducer from './slices/walletSlice';
import rechargeReducer from './slices/rechargeSlice';
import reportReducer from './slices/reportSlice';
import memberPanelReducer from './slices/memberPanelSlice';
import smsCategoryReducer from './slices/smsCategorySlice';
import smsSettingReducer from './slices/smsSettingSlice';
import smsTemplateReducer from './slices/smsTemplateSlice';
import memberSecurityReducer from './slices/memberSecuritySlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    testimonials: testimonialsReducer,
    registration: registrationReducer,
    login: loginReducer,
    dashboard: dashboardReducer,
    support: supportReducer,
    balance: balanceReducer,
    member: memberReducer,
    commission: commissionReducer,
    kyc: kycReducer,
    legal: legalReducer,
    wallet: walletReducer,
    recharge: rechargeReducer,
    report: reportReducer,
    memberPanel: memberPanelReducer,
    smsCategory: smsCategoryReducer,
    smsSetting: smsSettingReducer,
    smsTemplate: smsTemplateReducer,
    memberSecurity: memberSecurityReducer,
  },
});

