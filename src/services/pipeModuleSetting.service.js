import { apiService } from '../api/httpClient';
import { PipeModuleSettingRequestModel, PipeModuleSettingResponseModel } from '../models/pipeModuleSettingModel';

export const PipeModuleSettingService = {
    getAll: async () => {
        const res = await apiService.get('/PipeModuleSetting/GetPipeModuleSetting?PageNumber=1&PageSize=10000&FromDate=&ToDate=&Status=&MemberID=');
        return PipeModuleSettingResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/PipeModuleSetting/GetByID/${id}`);
        return PipeModuleSettingResponseModel(res);
    },

    create: async (data) => {
        const payload = PipeModuleSettingRequestModel(data);
        return await apiService.post('/PipeModuleSetting/Create', payload);
    },

    update: async (data) => {
        const payload = PipeModuleSettingRequestModel(data);
        return await apiService.put('/PipeModuleSetting/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/PipeModuleSetting/Delete/${id}`);
    }
};
