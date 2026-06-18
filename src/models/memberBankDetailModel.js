// src/models/memberBankDetailModel.js

const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const MemberBankDetailResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        bankId: item.bankId || item.bankid || 0,
        name: item.name || "",
        ifsccode: item.ifsccode || item.ifscCode || item.ifsc || "",
        accountNumber: item.accountNumber || "",
        accountHolderName: item.accountHolderName || "",
        branchName: item.branchName || "",
        isActive: mapBoolean(item.isActive),
        isDelete: mapBoolean(item.isDelete),
        documentVerify: mapBoolean(item.documentVerify),
        beneId: item.beneId || 0,
        result: item.result || "",
        document: item.document || "",
        createdBy: item.createdBy || null,
        createdDate: item.createdDate || "",
        modifiedBy: item.modifiedBy || null,
        modifiedDate: item.modifiedDate || "",
        rowVersion: item.rowVersion || ""
    }));
};

export const MemberBankDetailRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        bankId: parseInt(data.bankId || data.bankid) || 0,
        name: data.name || "",
        ifsccode: data.ifsccode || data.ifscCode || data.ifsc || "",
        accountNumber: data.accountNumber || "",
        accountHolderName: data.accountHolderName || "",
        branchName: data.branchName || "",
        isActive: mapBoolean(data.isActive),
        isDelete: mapBoolean(data.isDelete),
        documentVerify: mapBoolean(data.documentVerify),
        beneId: parseInt(data.beneId) || 0,
        result: data.result || "",
        document: data.document || "",
        createdBy: data.createdBy || null,
        createdDate: data.createdDate || new Date().toISOString(),
        modifiedBy: data.modifiedBy || null,
        modifiedDate: data.modifiedDate || new Date().toISOString(),
        rowVersion: data.rowVersion || ""
    };
};
