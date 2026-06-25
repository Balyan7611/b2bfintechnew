import { apiService } from '../api/httpClient';
import { MemberBankDetailRequestModel, MemberBankDetailResponseModel } from '../models/memberBankDetailModel';

export const MemberBankDetailService = {
    getAll: async () => {
        const res = await apiService.get('/MemberBankDetail/GetMemberBankDetail?PageNumber=1&PageSize=10000');
        return MemberBankDetailResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/MemberBankDetail/GetByID/${id}`);
        return MemberBankDetailResponseModel(res);
    },

    create: async (data) => {
        const payload = MemberBankDetailRequestModel(data);
        return await apiService.post('/MemberBankDetail/Create', payload);
    },

    update: async (data) => {
        const payload = MemberBankDetailRequestModel(data);
        return await apiService.put('/MemberBankDetail/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/MemberBankDetail/Delete/${id}`);
    }
};
