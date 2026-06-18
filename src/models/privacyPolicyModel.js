// src/models/privacyPolicyModel.js

const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const PrivacyPolicyResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        name: item.name || "",
        description: item.description || "",
        image: item.image || null,
        isActive: mapBoolean(item.isActive),
        msrno: item.msrno || 0,
        companyMemberId: item.companyMemberId || 0,
        createdDate: item.createdDate || "",
        modifiedDate: item.modifiedDate || ""
    }));
};

export const PrivacyPolicyRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        name: data.name || "",
        description: data.description || "",
        image: data.image || null,
        msrno: parseInt(data.msrno) || 0,
        companyMemberId: parseInt(data.companyMemberId) || 0
    };
};
