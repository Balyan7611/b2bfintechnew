import { apiService } from '../api/httpClient';

export const UserLoginHistoryService = {
    getAll: async () => {
        return await apiService.get('/UserLoginHistory/GetUserLoginHistory');
    },
    
    getById: async (id) => {
        return await apiService.get(`/UserLoginHistory/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/UserLoginHistory/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/UserLoginHistory/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/UserLoginHistory/Delete/${id}`);
    }
};
