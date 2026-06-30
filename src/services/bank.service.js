import { apiService } from '../api/httpClient';
import { BankRequestModel, BankResponseModel } from '../models/bankModel';

export const BankService = {
    getAll: async (params = {}) => {
        const payload = {
            pageNumber: params.pageNumber || 1,
            pageSize: params.pageSize || 100,
            fromDate: params.fromDate || null,
            toDate: params.toDate || null,
            status: params.status || null,
            memberID: params.memberID || null
        };
        const res = await apiService.post('/BankMaster/AllBankMaster', payload);
        return BankResponseModel(res);
    },
    
    getById: async (id) => {
        const res = await apiService.get(`/BankMaster/${id}`);
        return BankResponseModel(res);
    },
    
    create: async (data) => {
        const payload = BankRequestModel(data);
        return await apiService.post('/BankMaster', payload);
    },
    
    update: async (data) => {
        const payload = BankRequestModel(data);
        return await apiService.put('/BankMaster', payload);
    },
    
    delete: async (id) => {
        return await apiService.delete(`/BankMaster/Delete/${id}`);
    }
};
