import { apiService } from '../api/httpClient';

export const BannerTypeService = {
    getAll: async (pageNumber = 1, pageSize = 10000) => {
        const fromDate = '2000-05-04T09:40:19.989Z';
        const toDate = '2050-05-04T09:40:19.989Z';         return await apiService.get(`/BannerType/GetBannerType?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(toDate)}&Status=string&MemberID=9301`);
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
