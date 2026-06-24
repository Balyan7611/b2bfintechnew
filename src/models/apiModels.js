const mapBoolean = (val) => val === true || val === String(true) || val === 1;

export const AepsBankMasterResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const AepsBankMasterRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const BannerTypeResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const BannerTypeRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const BbpsdataDownResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const BbpsdataDownRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const ClientCredentialResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const ClientCredentialRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const CompanyBankDetailResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const CompanyBankDetailRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const CountryResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const CountryRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const DeviceListResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const DeviceListRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const KycdocumentsMasterResponseModel = (res) => { 
  if (!res || !res.status) return []; 
  const items = Array.isArray(res.data) ? res.data : (res.data && res.data.items ? res.data.items : (res.data ? [res.data] : [])); 
  return items.map(item => ({ 
    id: item.id || 0, 
    name: item.name || '', 
    side: item.side !== undefined && item.side !== null ? parseInt(item.side) : null,
    isActive: mapBoolean(item.isActive) 
  })); 
};

export const KycdocumentsMasterRequestModel = (data) => ({ 
  id: parseInt(data.id) || 0, 
  name: data.name || '',
  side: data.side !== undefined && data.side !== null && data.side !== 'null' ? parseInt(data.side) : null,
  isActive: mapBoolean(data.isActive) 
});

export const MemberBankDetailResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const MemberBankDetailRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const MemberSecurityResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const MemberSecurityRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const MemberServiceResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const MemberServiceRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const MenuResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const MenuRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const ParentChangeInformationResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const ParentChangeInformationRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const PipeMasterResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const PipeMasterRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const PipeModuleSettingResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const PipeModuleSettingRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const PrivacyPolicyResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const PrivacyPolicyRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const RefundPolicyResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const RefundPolicyRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const SmscategoryResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const SmscategoryRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const SmssettingResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const SmssettingRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const SmstemplateResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const SmstemplateRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const TermsConditionResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const TermsConditionRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const UserCredentialHistoryResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const UserCredentialHistoryRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const UserLoginHistoryResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, name: item.name || item.title || item.bankName || item.deviceName || item.providerName || item.templateName || String(), isActive: mapBoolean(item.isActive) })); };

export const UserLoginHistoryRequestModel = (data) => ({ id: parseInt(data.id) || 0, isActive: mapBoolean(data.isActive) });

export const FundRequestResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, memberId: item.memberId || 0, amount: item.amount || 0, paymentMode: item.paymentMode || String(), transactionId: item.transactionId || String(), status: item.status || String(), createdDate: item.createdDate || String() })); };

export const FundRequestRequestModel = (data) => ({ id: parseInt(data.id) || 0, memberId: parseInt(data.memberId) || 0, amount: parseFloat(data.amount) || 0, paymentMode: data.paymentMode || String(), transactionId: data.transactionId || String(), status: data.status || String('Pending'), createdDate: data.createdDate || new Date().toISOString() });

export const WalletLedgerResponseModel = (res) => { if (!res || !res.status) return []; const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []); return items.map(item => ({ id: item.id || 0, memberId: item.memberId || 0, openingBalance: item.openingBalance || 0, transactionAmount: item.transactionAmount || 0, closingBalance: item.closingBalance || 0, remarks: item.remarks || String(), createdDate: item.createdDate || String() })); };

export const WalletLedgerRequestModel = (data) => ({ id: parseInt(data.id) || 0, memberId: parseInt(data.memberId) || 0, openingBalance: parseFloat(data.openingBalance) || 0, transactionAmount: parseFloat(data.transactionAmount) || 0, closingBalance: parseFloat(data.closingBalance) || 0, remarks: data.remarks || String(), createdDate: data.createdDate || new Date().toISOString() });