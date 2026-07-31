import { apiService } from '../api/httpClient';
import { WalletTypeRequestModel, WalletTypeResponseModel } from '../models/walletTypeModel';

// Explicitly attach whatever auth token is available (access_token / admin_token /
// member_token), same convention used by userLoginHistory.service.js, so a request
// never goes out without an Authorization header regardless of which panel is
// making the call (admin / member / api-panel all share the same token keys).
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
    // Backend contract confirmed: GET /api/WalletType?PageNumber=&PageSize= only.
    // (No FromDate/ToDate/Status/MemberID - those aren't accepted by this endpoint.)
    getAll: async ({ pageNumber = 1, pageSize = 10000 } = {}) => {
        const url = `/WalletType?PageNumber=${pageNumber}&PageSize=${pageSize}`;

        // hideLoader + ignoreError: this call backs a small header widget, it should
        // never pop the global loader or an error toast if it fails - the caller
        // (ApiHeader) already falls back gracefully when this errors out.
        const res = await apiService.get(url, getAuthConfig({ hideLoader: true, ignoreError: true }));
        return WalletTypeResponseModel(res);
    },

    // Dedicated endpoint that returns only Active wallet types (server-side
    // filtered) - GET /api/WalletType/GetActive?PageNumber=&PageSize=
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
