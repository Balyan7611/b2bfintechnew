import { apiService } from '../api/httpClient';
import { TermsConditionRequestModel, TermsConditionResponseModel } from '../models/termsConditionModel';

export const TermsConditionService = {
    getAll: async () => {
        const res = await apiService.get('/TermsCondition/GetTermsCondition?PageNumber=1&PageSize=10000');
        return TermsConditionResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/TermsCondition/GetByID/${id}`);
        return TermsConditionResponseModel(res);
    },

    create: async (data) => {
        const payload = TermsConditionRequestModel(data);
        return await apiService.post('/TermsCondition/Create', payload);
    },

    update: async (data) => {
        const payload = TermsConditionRequestModel(data);
        return await apiService.put('/TermsCondition/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/TermsCondition/Delete/${id}`);
    }
};
