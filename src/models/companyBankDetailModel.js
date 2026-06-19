export const CompanyBankDetailResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        bankid: item.bankid || 0,
        companyMemberId: item.companyMemberId || 0,
        bankName: item.bankName || "",
        branchName: item.branchName || "",
        accountHolderName: item.accountHolderName || "",
        accountNumber: item.accountNumber || "",
        ifsccode: item.ifsccode || "",
        billinginfo: item.billinginfo || "",
        cashdepositecharge: parseFloat(item.cashdepositecharge) || 0,
        qrlogo: item.qrlogo || "",
        banklogo: item.banklogo || "",
        isActive: item.isActive === true || item.isActive === 1,
        isDelete: item.isDelete === true || item.isDelete === 1
    }));
};

export const CompanyBankDetailRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        bankid: parseInt(data.bankid) || 0,
        companyMemberId: parseInt(data.companyMemberId) || 0,
        bankName: data.bankName || "",
        branchName: data.branchName || "",
        accountHolderName: data.accountHolderName || "",
        accountNumber: data.accountNumber || "",
        ifsccode: data.ifsccode || "",
        billinginfo: data.billinginfo || "",
        cashdepositecharge: parseFloat(data.cashdepositecharge) || 0,
        qrlogo: data.qrlogo || "",
        banklogo: data.banklogo || "",
        isActive: data.isActive === true || data.isActive === 1,
        isDelete: data.isDelete === true || data.isDelete === 1
    };
};
