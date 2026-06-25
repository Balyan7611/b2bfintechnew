import { apiService } from '../api/httpClient';
import { GenderResponseModel } from '../models/genderModel';

export const GenderService = {
    getAll: async () => {
        const res = await apiService.get('/Gender?PageNumber=1&PageSize=10000');
        return GenderResponseModel(res);
    },
    
    getById: async (id) => {
        const res = await apiService.get(`/Gender/${id}`);
        return GenderResponseModel(res);
    }
};
