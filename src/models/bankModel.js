// src/models/bankModel.js
export const BankResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data?.items ? res.data.items : (res.data ? [res.data] : []));
    return items.map(item => ({
        id: item.id,
        bankCode: item.bankCode || "",
        bankName: item.bankName || "",
        ifscCode: item.ifscCode || item.ifsccode || item.ifsc || "",
        ifscrequired: item.ifscrequired === true,
        supportsImps: item.supportsImps === true,
        supportsNeft: item.supportsNeft === true,
        supportsRtgs: item.supportsRtgs === true,
        supportsPayout: item.supportsPayout === true,
        supportsVa: item.supportsVa === true,
        isHighSpeedEnabled: item.isHighSpeedEnabled === true,
        maxTpsallowed: item.maxTpsallowed || 0,
        dailyLimit: item.dailyLimit || 0,
        perTransactionLimit: item.perTransactionLimit || 0,
        isRbirestricted: item.isRbirestricted === true,
        restrictionReason: item.restrictionReason || "",
        isActive: item.isActive === true,
        priorityOrder: item.priorityOrder || 0
    }));
};

export const BankRequestModel = (data) => {
    return {
        id: data.id || 0,
        bankCode: data.bankCode || "",
        bankName: data.bankName || "",
        ifscrequired: data.ifscrequired === true,
        supportsImps: data.supportsImps === true,
        supportsNeft: data.supportsNeft === true,
        supportsRtgs: data.supportsRtgs === true,
        supportsPayout: data.supportsPayout === true,
        supportsVa: data.supportsVa === true,
        isHighSpeedEnabled: data.isHighSpeedEnabled === true,
        maxTpsallowed: parseInt(data.maxTpsallowed) || 0,
        dailyLimit: data.dailyLimit !== undefined && data.dailyLimit !== null ? parseFloat(data.dailyLimit) : null,
        perTransactionLimit: data.perTransactionLimit !== undefined && data.perTransactionLimit !== null ? parseFloat(data.perTransactionLimit) : null,
        isRbirestricted: data.isRbirestricted === true,
        restrictionReason: data.restrictionReason || null,
        isActive: data.isActive === true,
        priorityOrder: parseInt(data.priorityOrder) || 0
    };
};
