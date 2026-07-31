export const MemberBankDetailResponseModel = (res) => {
    if (!res) return [];

    // GetMemberBankDetail returns the paginated wrapper { data: { items: [...] } }.
    // The old code only handled `data` being an array, so it wrapped the wrapper
    // object itself as a single row — producing one blank card with every field
    // showing "—". Handle every shape the API can return.
    let items = [];
    if (Array.isArray(res)) items = res;
    else if (Array.isArray(res.data?.items)) items = res.data.items;
    else if (Array.isArray(res.data)) items = res.data;
    else if (Array.isArray(res.items)) items = res.items;
    else if (res.data && typeof res.data === 'object' && (res.data.id || res.data.accountNumber)) items = [res.data];

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
        ifsccode: data.ifsccode || "",
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
