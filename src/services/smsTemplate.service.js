import { apiService } from '../api/httpClient';

export const SmsTemplateService = {
    getAll: async () => {
        return await apiService.get('/Smstemplate/GetSmstemplate');
    },
    
    getById: async (id) => {
        return await apiService.get(`/Smstemplate/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/Smstemplate/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/Smstemplate/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/Smstemplate/Delete/${id}`);
    }
};
