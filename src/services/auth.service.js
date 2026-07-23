import { LoginRequestModel, LoginResponseModel, VerifyOtpRequestModel, ForgetPasswordRequestModel, VerifyForgetPasswordRequestModel, ForgetTpinRequestModel, VerifyForgetPinRequestModel } from '../models/authModel';
import { apiService } from '../api/httpClient';

export const AuthService = {
    login: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/LoginUser', data, LoginRequestModel);
        return LoginResponseModel(res);
    },

    // Step 2 of login when LoginUser responds with data.status === "OTP".
    // `data` = { token, otp } where token is the refreshToken returned by LoginUser.
    verifyLoginOtp: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/VerifyLoginOTP', data, VerifyOtpRequestModel);
        return LoginResponseModel(res);
    },

    // Step 2 of login when LoginUser responds with data.status === "TPIN".
    // `data` = { token, tpin } where token is the refreshToken returned by LoginUser.
    // NOTE: backend does not expose a separate TPIN verify endpoint - it reuses
    // /UserAuth/VerifyLoginOTP for both OTP and TPIN, just sending the code
    // (whatever the user typed) in the same "otp" field.
    verifyLoginTpin: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/VerifyLoginOTP', { token: data.token, otp: data.tpin, __presetLocation: data.__presetLocation }, VerifyOtpRequestModel);
        return LoginResponseModel(res);
    },

    // Step 1 of "forgot password": verify identity (loginId + aadharLast4 + pan),
    // triggers an OTP, returns a token used to complete the reset below.
    forgetPassword: async (data) => {
        const payload = ForgetPasswordRequestModel(data);
        return await apiService.post('/UserAuth/forget-password', payload);
    },

    // Step 2 of "forgot password": token + otp + newPassword + confirmPassword.
    verifyForgetPassword: async (data) => {
        const payload = VerifyForgetPasswordRequestModel(data);
        return await apiService.post('/UserAuth/verify-forget-password', payload);
    },

    // Step 1 of "forgot T-PIN": verify identity (loginId + aadharLast4 + pan),
    // triggers an OTP, returns a token used to complete the reset below.
    forgetTpin: async (data) => {
        const payload = ForgetTpinRequestModel(data);
        return await apiService.post('/UserAuth/forget-tpin', payload);
    },

    // Step 2 of "forgot T-PIN": token + otp + newPin + confirmPin.
    verifyForgetPin: async (data) => {
        const payload = VerifyForgetPinRequestModel(data);
        return await apiService.post('/UserAuth/verify-forget-pin', payload);
    },

    // Standard CRUD placeholders for future scaling
    getAll: async () => {},
    getById: async (id) => {},
    create: async (data) => {},
    update: async (id, data) => {},
    delete: async (id) => {}
};
