import { apiService } from '../api/httpClient';
import { WalletTypeRequestModel, WalletTypeResponseModel } from '../models/walletTypeModel';

const getAuthConfig = (extra = {}) => {
    const raw = sessionStorage.getItem('access_token')
        || localStorage.getItem('access_token')
        || sessionStorage.getItem('admin_token')
        || localStorage.getItem('admin_token')
        || sessionStorage.getItem('member_token')
        || localStorage.getItem('member_token');

    if (!raw || raw === 'null' || raw === 'undefined') return extra;

    const token = raw.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
    return {
        ...extra,
        headers: {
            ...(extra.headers || {}),
            Authorization: `Bearer ${token}`
        }
    };
};

export const WalletTypeService = {
            getAll: async ({ pageNumber = 1, pageSize = 10000 } = {}) => {
        const url = `/WalletType?PageNumber=${pageNumber}&PageSize=${pageSize}`;

                                const res = await apiService.get(url, getAuthConfig({ hideLoader: true, ignoreError: true }));
        return WalletTypeResponseModel(res);
    },

            getActive: async ({ pageNumber = 1, pageSize = 10000 } = {}) => {
        const url = `/WalletType/GetActive?PageNumber=${pageNumber}&PageSize=${pageSize}`;
        const res = await apiService.get(url, getAuthConfig({ hideLoader: true, ignoreError: true }));
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
