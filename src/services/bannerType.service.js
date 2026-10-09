import { apiService } from '../api/httpClient';

export const BannerTypeService = {
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 10000;
        const fromDate = params.fromDate || '';
        const toDate = params.toDate || '';
        const status = params.status !== undefined ? params.status : '';
        const memberID = params.memberID || params.memberId || '';
        const walletTypeId = params.walletTypeId || params.WalletTypeId || '';
        return await apiService.get(`/BannerType/GetBannerType?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(toDate)}&Status=${encodeURIComponent(status)}&MemberID=${memberID}&WalletTypeId=${encodeURIComponent(walletTypeId)}`);
    },
    
        getById: async (id) => {
        return await apiService.get(`/BannerType/GetByID/${id}`);
    },
    
        create: async (data) => {
        return await apiService.post('/BannerType/Create', data);
    },
    
        update: async (data) => {
        return await apiService.put('/BannerType/Update', data);
    },

        delete: async (id) => {
        return await apiService.delete(`/BannerType/Delete/${id}`);
    }
};
