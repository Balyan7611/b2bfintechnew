export const UserLoginHistoryResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        loginType: item.loginType || "",
        loginStatus: item.loginStatus || "",
        loginIpaddress: item.loginIpaddress || "",
        deviceId: item.deviceId || "",
        deviceName: item.deviceName || "",
        os: item.os || "",
        browser: item.browser || "",
        location: item.location || "",
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        loginTime: item.loginTime || "",
        logoutTime: item.logoutTime || "",
        sessionId: item.sessionId || "",
        isActiveSession: item.isActiveSession === true || item.isActiveSession === 1
    }));
};

export const UserLoginHistoryRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        loginType: data.loginType || "",
        loginStatus: data.loginStatus || "",
        loginIpaddress: data.loginIpaddress || "",
        deviceId: data.deviceId || "",
        deviceName: data.deviceName || "",
        os: data.os || "",
        browser: data.browser || "",
        location: data.location || "",
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        loginTime: data.loginTime || new Date().toISOString(),
        logoutTime: data.logoutTime || new Date().toISOString(),
        sessionId: data.sessionId || "",
        isActiveSession: data.isActiveSession === true || data.isActiveSession === 1
    };
};
