import { apiService } from '../api/httpClient';

export const SmsCategoryService = {
    getAll: async () => {
        return await apiService.get('/Smscategory/GetSmscategory');
    },
    
    getById: async (id) => {
        return await apiService.get(`/Smscategory/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/Smscategory/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/Smscategory/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/Smscategory/Delete/${id}`);
    }
};
