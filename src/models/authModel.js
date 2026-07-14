// src/models/authModel.js
export const LoginRequestModel = (data, security) => {
    if (!data.loginID || data.loginID.length < 3) throw new Error("Invalid Login ID");
    if (!data.password) throw new Error("Password is required");
    
    if (!security.location.allowed) {
        const errorMsg = security.location.error || "Location access is required for login. Please enable location access.";
        throw new Error(errorMsg);
    }
    
    return {
        loginID: data.loginID,
        password: data.password,
        ip: security.ip,
        deviceInfo: security.deviceInfo,
        location: {
            latitude: security.location.latitude,
            longitude: security.location.longitude,
            accuracy: security.location.accuracy
        }
    };
};

export const LoginResponseModel = (res) => {
    if (!res || !res.status) {
        throw new Error(res?.mess || "Login Failed");
    }
    
    const token = (typeof res.data === 'string' ? res.data : null) || res.data?.token || res.data?.accessToken || res.data?.refreshToken || res.token || res.accessToken || res.data;
    
    if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('admin_token', token);
    }
    
    return {
        status: res.status,
        code: res.code,
        mess: res.mess,
        token: token,
        accessToken: token,
        refreshToken: token,
        data: res.data
    };
};