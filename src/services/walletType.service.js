import { apiService } from '../api/httpClient';
import { WalletTypeRequestModel, WalletTypeResponseModel } from '../models/walletTypeModel';

export const WalletTypeService = {
    getAll: async () => {
        const res = await apiService.get('/WalletType?PageNumber=1&PageSize=10000');
        return WalletTypeResponseModel(res);
    },
    
    getById: async (id) => {
        const res = await apiService.get(`/WalletType/${id}`);
        return WalletTypeResponseModel(res);
    },
    
    create: async (data) => {
        const payload = WalletTypeRequestModel(data);
        return await apiService.post('/WalletType', payload);
    },
    
    update: async (data) => {
        const payload = WalletTypeRequestModel(data);
        return await apiService.put('/WalletType', payload);
    }
};
