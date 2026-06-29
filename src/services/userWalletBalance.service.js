import { apiService } from '../api/httpClient';
import { UserWalletBalanceRequestModel, UserWalletBalanceResponseModel, UserWalletBalanceTransferRequestModel } from '../models/userWalletBalanceModel';

export const UserWalletBalanceService = {
    create: async (data) => {
        const payload = UserWalletBalanceRequestModel(data);
        return await apiService.post('/UserWalletBalance/Create', payload);
    },

    update: async (data) => {
        const payload = UserWalletBalanceRequestModel(data);
        return await apiService.put('/UserWalletBalance/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/UserWalletBalance/Delete/${id}`);
    },

    transfer: async (data) => {
        const payload = UserWalletBalanceTransferRequestModel(data);
        return await apiService.post('/UserWalletBalance/Transfer', payload);
    },

    getById: async (id) => {
        return await apiService.get(`/UserWalletBalance/GetByID/${id}`);
    },

    getAll: async ({ pageNumber = 1, pageSize = 10, fromDate = '', toDate = '', status = '', memberId = '' } = {}) => {
        let url = `/UserWalletBalance/GetUserWalletBalances?PageNumber=${pageNumber}&PageSize=${pageSize}`;
        if (fromDate) url += `&FromDate=${encodeURIComponent(fromDate)}`;
        if (toDate) url += `&ToDate=${encodeURIComponent(toDate)}`;
        if (status) url += `&Status=${encodeURIComponent(status)}`;
        if (memberId) url += `&MemberID=${encodeURIComponent(memberId)}`;
        
        const res = await apiService.get(url);
        console.log('UserWalletBalanceService getAll raw res:', res);
        const mappedData = UserWalletBalanceResponseModel(res);
        console.log('UserWalletBalanceService getAll mappedData:', mappedData);
        
        return {
            ...res,
            data: mappedData
        };
    }
};
