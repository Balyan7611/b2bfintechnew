// src/models/companyBankDetailModel.js

const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const CompanyBankDetailResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        bankid: item.bankid || item.bankId || 0,
        companyMemberId: item.companyMemberId || 0,
        bankName: item.bankName || "",
        branchName: item.branchName || "",
        accountHolderName: item.accountHolderName || "",
        accountNumber: item.accountNumber || "",
        ifsccode: item.ifsccode || item.ifscCode || item.ifsc || "",
        billinginfo: item.billinginfo || item.billingInfo || "",
        cashdepositecharge: parseFloat(item.cashdepositecharge) || 0,
        qrlogo: item.qrlogo || item.qrLogo || "",
        banklogo: item.banklogo || item.bankLogo || "",
        isActive: mapBoolean(item.isActive),
        createdBy: item.createdBy || null,
        createdDate: item.createdDate || "",
        modifiedBy: item.modifiedBy || null,
        modifiedDate: item.modifiedDate || "",
        isDelete: mapBoolean(item.isDelete),
        rowVersion: item.rowVersion || ""
    }));
};

export const CompanyBankDetailRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        bankid: parseInt(data.bankid || data.bankId) || 0,
        companyMemberId: parseInt(data.companyMemberId) || 0,
        bankName: data.bankName || "",
        branchName: data.branchName || "",
        accountHolderName: data.accountHolderName || "",
        accountNumber: data.accountNumber || "",
        ifsccode: data.ifsccode || data.ifscCode || data.ifsc || "",
        billinginfo: data.billinginfo || data.billingInfo || "",
        cashdepositecharge: parseFloat(data.cashdepositecharge) || 0,
        qrlogo: data.qrlogo || data.qrLogo || "",
        banklogo: data.banklogo || data.bankLogo || "",
        isActive: mapBoolean(data.isActive),
        createdBy: data.createdBy || null,
        createdDate: data.createdDate || new Date().toISOString(),
        modifiedBy: data.modifiedBy || null,
        modifiedDate: data.modifiedDate || new Date().toISOString(),
        isDelete: mapBoolean(data.isDelete),
        rowVersion: data.rowVersion || ""
    };
};
