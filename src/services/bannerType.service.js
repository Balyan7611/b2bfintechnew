import { apiService } from '../api/httpClient';

export const BannerTypeService = {
    getAll: async (pageNumber = 1, pageSize = 10000) => {
        const fromDate = '2000-05-04T09:40:19.989Z';
        const toDate = '2050-05-04T09:40:19.989Z'; // Ensure future date to fetch all records
        return await apiService.get(`/BannerType/GetBannerType?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(toDate)}&Status=string&MemberID=9301`);
    },
    
    // GET /api/BannerType/GetByID/{id}
    getById: async (id) => {
        return await apiService.get(`/BannerType/GetByID/${id}`);
    },
    
    // POST /api/BannerType/Create
    create: async (data) => {
        return await apiService.post('/BannerType/Create', data);
    },
    
    // PUT /api/BannerType/Update
    update: async (data) => {
        return await apiService.put('/BannerType/Update', data);
    },

    // DELETE /api/BannerType/Delete/{id}
    delete: async (id) => {
        return await apiService.delete(`/BannerType/Delete/${id}`);
    }
};
