import { apiService } from '../api/httpClient';
import { PipeMasterRequestModel, PipeMasterResponseModel } from '../models/pipeMasterModel';

export const PipeMasterService = {
    getAll: async () => {
        const res = await apiService.get('/PipeMaster/GetPipeMaster');
        return PipeMasterResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/PipeMaster/GetByID/${id}`);
        return PipeMasterResponseModel(res);
    },

    create: async (data) => {
        const payload = PipeMasterRequestModel(data);
        return await apiService.post('/PipeMaster/Create', payload);
    },

    update: async (data) => {
        const payload = PipeMasterRequestModel(data);
        return await apiService.put('/PipeMaster/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/PipeMaster/Delete/${id}`);
    }
};
