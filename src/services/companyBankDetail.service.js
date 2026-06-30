import { apiService } from '../api/httpClient';
import { CompanyBankDetailRequestModel, CompanyBankDetailResponseModel } from '../models/companyBankDetailModel';

export const CompanyBankDetailService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams({
            PageNumber: params.pageNumber || 1,
            PageSize: params.pageSize || 1000,
            ...(params.fromDate && { FromDate: params.fromDate }),
            ...(params.toDate && { ToDate: params.toDate }),
            ...(params.status && { Status: params.status }),
            ...(params.memberId && { MemberID: params.memberId })
        }).toString();
        const res = await apiService.get(`/CompanyBankDetail/GetCompanyBankDetail?${queryParams}`);
        return CompanyBankDetailResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/CompanyBankDetail/GetByID/${id}`);
        return CompanyBankDetailResponseModel(res);
    },

    create: async (data) => {
        const payload = data instanceof FormData ? data : CompanyBankDetailRequestModel(data);
        return await apiService.post('/CompanyBankDetail/Create', payload);
    },

    update: async (data) => {
        const payload = data instanceof FormData ? data : CompanyBankDetailRequestModel(data);
        return await apiService.put('/CompanyBankDetail/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/CompanyBankDetail/Delete/${id}`);
    }
};
