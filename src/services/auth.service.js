import { LoginRequestModel, LoginResponseModel } from '../models/authModel';
import { apiService } from '../api/httpClient';

export const AuthService = {
    login: async (data) => {
        const res = await apiService.postWithSecurity('/UserAuth/LoginUser', data, LoginRequestModel);
        return LoginResponseModel(res);
    },

    forgetPassword: async (data) => {
        return await apiService.post('/UserAuth/forget-password', data);
    },

    forgetTpin: async (data) => {
        return await apiService.post('/UserAuth/forget-tpin', data);
    },

    // Standard CRUD placeholders for future scaling
    getAll: async () => {},
    getById: async (id) => {},
    create: async (data) => {},
    update: async (id, data) => {},
    delete: async (id) => {}
};
