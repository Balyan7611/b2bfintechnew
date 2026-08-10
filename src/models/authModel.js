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
        Ip: security.ip,
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

                    const authStatus = res.data?.status; 
    const token = (typeof res.data === 'string' ? res.data : null) || res.data?.token || res.data?.accessToken || res.data?.refreshToken || res.token || res.accessToken || res.data;

    const isFinalLogin = !authStatus || authStatus === 'Login';

    if (isFinalLogin && token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('admin_token', token);
    }

    return {
        status: res.status,
        code: res.code,
        mess: res.mess,
        authStatus,
        token: token,
        accessToken: token,
        refreshToken: token,
        data: res.data
    };
};

export const VerifyOtpRequestModel = (data, security) => {
    if (!data.token) throw new Error("Verification session expired. Please login again.");
    if (!data.otp || String(data.otp).trim().length < 4) throw new Error("Please enter a valid OTP");

    return {
        token: data.token,
        otp: data.otp,
        ip: security.ip,
        Ip: security.ip,
        deviceInfo: security.deviceInfo,
        location: {
            latitude: security.location.latitude,
            longitude: security.location.longitude,
            accuracy: security.location.accuracy
        }
    };
};

export const VerifyTpinRequestModel = (data, security) => {
    if (!data.token) throw new Error("Verification session expired. Please login again.");
    if (!data.tpin || String(data.tpin).trim().length < 4) throw new Error("Please enter a valid T-PIN");

    return {
        token: data.token,
        tpin: data.tpin,
        ip: security.ip,
        Ip: security.ip,
        deviceInfo: security.deviceInfo,
        location: {
            latitude: security.location.latitude,
            longitude: security.location.longitude,
            accuracy: security.location.accuracy
        }
    };
};

export const ForgetPasswordRequestModel = (data) => {
    if (!data.loginId || String(data.loginId).trim().length < 3) throw new Error("Login ID is required");
    if (!data.aadharLast4 || String(data.aadharLast4).trim().length !== 4) throw new Error("Aadhar last 4 digits are required");
    if (!data.pan || String(data.pan).trim().length < 5) throw new Error("PAN is required");

    return {
        loginId: data.loginId,
        aadharLast4: data.aadharLast4,
        pan: data.pan
    };
};

export const VerifyForgetPasswordRequestModel = (data) => {
    if (!data.token) throw new Error("Verification session expired. Please start again.");
    if (!data.otp || String(data.otp).trim().length < 4) throw new Error("Please enter a valid OTP");
    if (!data.newPassword) throw new Error("New password is required");
    if (data.newPassword !== data.confirmPassword) throw new Error("Passwords do not match");

    return {
        token: data.token,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
    };
};

export const ForgetTpinRequestModel = (data) => {
    if (!data.loginId || String(data.loginId).trim().length < 3) throw new Error("Login ID is required");
    if (!data.aadharLast4 || String(data.aadharLast4).trim().length !== 4) throw new Error("Aadhar last 4 digits are required");
    if (!data.pan || String(data.pan).trim().length < 5) throw new Error("PAN is required");

    return {
        loginId: data.loginId,
        aadharLast4: data.aadharLast4,
        pan: data.pan
    };
};

export const VerifyForgetPinRequestModel = (data) => {
    if (!data.token) throw new Error("Verification session expired. Please start again.");
    if (!data.otp || String(data.otp).trim().length < 4) throw new Error("Please enter a valid OTP");
    if (!data.newPin) throw new Error("New T-PIN is required");
    if (data.newPin !== data.confirmPin) throw new Error("T-PINs do not match");

    return {
        token: data.token,
        otp: data.otp,
        newPin: data.newPin,
        confirmPin: data.confirmPin
    };
};
