export const CompanyResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id,
        name: item.companyName || item.name || "",
        companyCode: item.companyCode || "",
        domain: item.domain || item.url || "",
        logo: item.logo || "",
        banner: item.banner || "",
        headerColor: item.headerColor || "",
        primaryColor: item.headerColor || "",
        socialLinks: {
            fb: item.faceBook || "",
            wa: item.whastApp || ""
        },
        faceBook: item.faceBook || "",
        whastApp: item.whastApp || "",
        isActive: item.status === true || item.status === 1 || item.isActive === true
    }));
};

export const CompanyRequestModel = (data) => {
    return {
        id: data.id || 0,
        companyName: data.name || "",
        companyCode: data.companyCode || "",
        domain: data.domain || "",
        logo: data.logo || "",
        banner: data.banner || "",
        headerColor: data.headerColor || data.primaryColor || "",
        faceBook: data.socialLinks?.fb || data.faceBook || "",
        whastApp: data.socialLinks?.wa || data.whastApp || "",
        status: data.isActive === true || data.status === 1
    };
};
