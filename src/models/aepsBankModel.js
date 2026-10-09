// AepsBankMaster Model
// Matches curl: POST /AepsBankMaster/Create & PUT /AepsBankMaster/Update
// Fields from API: id, bankCode, bankName, supportsFingerprint, supportsIris,
//                  supportsFace, supportsAeps, supportsCd, supportsAw, isActive

export const AepsBankRequestModel = (data) => ({
    id: data.id || 0,
    bankCode: data.bankCode || "",
    bankName: data.bankName || "",
    supportsFingerprint: data.supportsFingerprint === true,
    supportsIris: data.supportsIris === true,
    supportsFace: data.supportsFace === true,
    supportsAeps: data.supportsAeps === true,
    supportsCd: data.supportsCd === true,
    supportsAw: data.supportsAw === true,
    isActive: data.isActive === true,
});

export const AepsBankResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data)
        ? res.data
        : (res.data?.items ? res.data.items : (res.data ? [res.data] : []));
    return items.map(item => ({
        id: item.id,
        bankCode: item.bankCode || "",
        bankName: item.bankName || "",
        supportsFingerprint: item.supportsFingerprint === true,
        supportsIris: item.supportsIris === true,
        supportsFace: item.supportsFace === true,
        supportsAeps: item.supportsAeps === true,
        supportsCd: item.supportsCd === true,
        supportsAw: item.supportsAw === true,
        isActive: item.isActive === true,
    }));
};
