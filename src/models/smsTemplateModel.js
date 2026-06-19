export const SmsTemplateResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        categoryId: item.categoryId || 0,
        template: item.template || "",
        templateId: item.templateId || "",
        emailTemplate: item.emailTemplate || "",
        whatsAppTemplate: item.whatsAppTemplate || "",
        isActive: item.isActive === true || item.isActive === 1,
        msrno: item.msrno || 0,
        companyMemberId: item.companyMemberId || 0,
        integrationType: item.integrationType || 0,
        isSms: item.isSms === true || item.isSms === 1,
        isEmail: item.isEmail === true || item.isEmail === 1,
        isWhatsApp: item.isWhatsApp === true || item.isWhatsApp === 1
    }));
};

export const SmsTemplateRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        categoryId: parseInt(data.categoryId) || 0,
        template: data.template || "",
        templateId: data.templateId || "",
        emailTemplate: data.emailTemplate || "",
        whatsAppTemplate: data.whatsAppTemplate || "",
        isActive: data.isActive === true || data.isActive === 1,
        msrno: parseInt(data.msrno) || 0,
        companyMemberId: parseInt(data.companyMemberId) || 0,
        integrationType: parseInt(data.integrationType) || 0,
        isSms: data.isSms === true || data.isSms === 1,
        isEmail: data.isEmail === true || data.isEmail === 1,
        isWhatsApp: data.isWhatsApp === true || data.isWhatsApp === 1
    };
};
