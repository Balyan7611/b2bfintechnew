import { apiService } from '../api/httpClient';
import { RefundPolicyRequestModel, RefundPolicyResponseModel } from '../models/refundPolicyModel';

export const RefundPolicyService = {
    getAll: async () => {
        const res = await apiService.get('/RefundPolicy/GetRefundPolicy');
        return RefundPolicyResponseModel(res);
    },

    create: async (data) => {
        const payload = RefundPolicyRequestModel(data);
        return await apiService.post('/RefundPolicy/Create', payload);
    },

    update: async (data) => {
        const payload = RefundPolicyRequestModel(data);
        return await apiService.put('/RefundPolicy/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/RefundPolicy/Delete/${id}`);
    }
};
