import { apiService } from '../api/httpClient';

export const SmsSettingService = {
    getAll: async () => {
        return await apiService.get('/Smssetting/GetSmssetting?PageNumber=1&PageSize=10000');
    },
    
    getById: async (id) => {
        return await apiService.get(`/Smssetting/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/Smssetting/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/Smssetting/Update', data);
    },

    delete: async (id) => {
        // Assuming delete is standard, though curl not provided, usually it's /Delete/{id}
        return await apiService.delete(`/Smssetting/Delete/${id}`);
    }
};
