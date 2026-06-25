import { apiService } from '../api/httpClient';
import { CompanyBankDetailRequestModel, CompanyBankDetailResponseModel } from '../models/companyBankDetailModel';

export const CompanyBankDetailService = {
    getAll: async () => {
        const res = await apiService.get('/CompanyBankDetail/GetCompanyBankDetail?PageNumber=1&PageSize=10000');
        return CompanyBankDetailResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/CompanyBankDetail/GetByID/${id}`);
        return CompanyBankDetailResponseModel(res);
    },

    create: async (data) => {
        const payload = CompanyBankDetailRequestModel(data);
        return await apiService.post('/CompanyBankDetail/Create', payload);
    },

    update: async (data) => {
        const payload = CompanyBankDetailRequestModel(data);
        return await apiService.put('/CompanyBankDetail/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/CompanyBankDetail/Delete/${id}`);
    }
};
