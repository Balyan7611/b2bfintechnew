import { apiService } from '../api/httpClient';

export const UserLoginHistoryService = {
    getAll: async () => {
        return await apiService.get('/UserLoginHistory/GetUserLoginHistory?PageNumber=1&PageSize=10000', { hideLoader: true });
    },
    
    getById: async (id) => {
        return await apiService.get(`/UserLoginHistory/GetByID/${id}`);
    },
    
    create: async (data, config = {}) => {
        return await apiService.post('/UserLoginHistory/Create', data, config);
    },
    
    update: async (data) => {
        return await apiService.put('/UserLoginHistory/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/UserLoginHistory/Delete/${id}`);
    }
};
