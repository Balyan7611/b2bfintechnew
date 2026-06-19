import { apiService } from '../api/httpClient';

export const ParentChangeInformationService = {
    getAll: async () => {
        return await apiService.get('/ParentChangeInformation/GetParentChangeInformation');
    },
    
    getById: async (id) => {
        return await apiService.get(`/ParentChangeInformation/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/ParentChangeInformation/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/ParentChangeInformation/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/ParentChangeInformation/Delete/${id}`);
    }
};
