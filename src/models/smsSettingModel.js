export const SmsSettingResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        url: item.url || "",
        sender: item.sender || "",
        country: item.country || "",
        route: item.route || "",
        param1Text: item.param1Text || "",
        param1Val: item.param1Val || "",
        param2Text: item.param2Text || "",
        param2Val: item.param2Val || "",
        param3Text: item.param3Text || "",
        param3Val: item.param3Val || "",
        routeText: item.routeText || "",
        countryText: item.countryText || "",
        dltText: item.dltText || "",
        senderText: item.senderText || "",
        isActive: item.isActive === true || item.isActive === 1,
        msrno: item.msrno || 0,
        companyMemberId: item.companyMemberId || 0,
        integrationtype: item.integrationtype || 0
    }));
};

export const SmsSettingRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        url: data.url || "",
        sender: data.sender || "",
        country: data.country || "",
        route: data.route || "",
        param1Text: data.param1Text || "",
        param1Val: data.param1Val || "",
        param2Text: data.param2Text || "",
        param2Val: data.param2Val || "",
        param3Text: data.param3Text || "",
        param3Val: data.param3Val || "",
        routeText: data.routeText || "",
        countryText: data.countryText || "",
        dltText: data.dltText || "",
        senderText: data.senderText || "",
        isActive: data.isActive === true || data.isActive === 1,
        msrno: parseInt(data.msrno) || 0,
        companyMemberId: parseInt(data.companyMemberId) || 0,
        integrationtype: parseInt(data.integrationtype) || 0
    };
};
