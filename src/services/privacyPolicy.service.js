import { apiService } from '../api/httpClient';
import { PrivacyPolicyRequestModel, PrivacyPolicyResponseModel } from '../models/privacyPolicyModel';

export const PrivacyPolicyService = {
    getAll: async () => {
        const res = await apiService.get('/PrivacyPolicy/GetPrivacyPolicy?PageNumber=1&PageSize=10000');
        return PrivacyPolicyResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/PrivacyPolicy/GetByID/${id}`);
        return PrivacyPolicyResponseModel(res);
    },

    create: async (data) => {
        const payload = PrivacyPolicyRequestModel(data);
        return await apiService.post('/PrivacyPolicy/Create', payload);
    },

    update: async (data) => {
        const payload = PrivacyPolicyRequestModel(data);
        return await apiService.put('/PrivacyPolicy/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/PrivacyPolicy/Delete/${id}`);
    }
};
