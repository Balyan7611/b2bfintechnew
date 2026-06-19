import { apiService } from '../api/httpClient';

export const MemberSecurityService = {
    getAll: async () => {
        return await apiService.get('/MemberSecurity/GetMemberSecurity');
    },
    
    getById: async (id) => {
        return await apiService.get(`/MemberSecurity/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/MemberSecurity/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/MemberSecurity/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/MemberSecurity/Delete/${id}`);
    }
};
