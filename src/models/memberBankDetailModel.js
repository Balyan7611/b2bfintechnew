export const MemberBankDetailResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data?.items ? res.data.items : (res.data ? [res.data] : []));
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        bankId: item.bankId || 0,
        name: item.name || "",
        ifsccode: item.ifsccode || "",
        accountNumber: item.accountNumber || "",
        accountHolderName: item.accountHolderName || "",
        branchName: item.branchName || "",
        isActive: item.isActive === true || item.isActive === 1,
        isDelete: item.isDelete === true || item.isDelete === 1,
        documentVerify: item.documentVerify === true || item.documentVerify === 1,
        beneId: item.beneId || 0,
        result: item.result || "",
        document: item.document || ""
    }));
};

export const MemberBankDetailRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        bankId: parseInt(data.bankId) || 0,
        name: data.name || "",
        IFSCCode: data.ifsccode || "",
        accountNumber: data.accountNumber || "",
        accountHolderName: data.accountHolderName || "",
        branchName: data.branchName || "",
        isActive: data.isActive === true || data.isActive === 1,
        isDelete: data.isDelete === true || data.isDelete === 1,
        documentVerify: data.documentVerify === true || data.documentVerify === 1,
        beneId: parseInt(data.beneId) || 0,
        result: data.result || "",
        document: data.document || ""
    };
};
