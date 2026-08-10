import { LoginRequestModel, LoginResponseModel, VerifyOtpRequestModel, ForgetPasswordRequestModel, VerifyForgetPasswordRequestModel, ForgetTpinRequestModel, VerifyForgetPinRequestModel } from '../models/authModel';
import { apiService } from '../api/httpClient';

export const AuthService = {
    login: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/LoginUser', data, LoginRequestModel);
        return LoginResponseModel(res);
    },

            verifyLoginOtp: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/VerifyLoginOTP', data, VerifyOtpRequestModel);
        return LoginResponseModel(res);
    },

                        verifyLoginTpin: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/VerifyLoginOTP', { token: data.token, otp: data.tpin, __presetLocation: data.__presetLocation }, VerifyOtpRequestModel);
        return LoginResponseModel(res);
    },

            forgetPassword: async (data) => {
        const payload = ForgetPasswordRequestModel(data);
        return await apiService.post('/UserAuth/forget-password', payload);
    },

        verifyForgetPassword: async (data) => {
        const payload = VerifyForgetPasswordRequestModel(data);
        return await apiService.post('/UserAuth/verify-forget-password', payload);
    },

            forgetTpin: async (data) => {
        const payload = ForgetTpinRequestModel(data);
        return await apiService.post('/UserAuth/forget-tpin', payload);
    },

        verifyForgetPin: async (data) => {
        const payload = VerifyForgetPinRequestModel(data);
        return await apiService.post('/UserAuth/verify-forget-pin', payload);
    },

        getAll: async () => {},
    getById: async (id) => {},
    create: async (data) => {},
    update: async (id, data) => {},
    delete: async (id) => {}
};
