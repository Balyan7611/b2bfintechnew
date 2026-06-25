import { apiService } from '../api/httpClient';

export const PackageService = {
    getAll: async () => {
        return await apiService.get('/Package?PageNumber=1&PageSize=10000');
    },
    
    getById: async (id) => {
        return await apiService.get(`/Package/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/Package', data);
    },
    
    update: async (data) => {
        return await apiService.put('/Package', data);
    }
};
