import { apiService } from '../api/httpClient';

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

export const UserLoginHistoryService = {
    getAll: async () => {
        return await apiService.get(
            '/UserLoginHistory/GetUserLoginHistory?PageNumber=1&PageSize=10000',
            getAuthConfig({ hideLoader: true, ignoreError: true })
        );
    },

    getById: async (id) => {
        return await apiService.get(`/UserLoginHistory/GetByID/${id}`, getAuthConfig({ ignoreError: true }));
    },

    create: async (data, config = {}) => {
        return await apiService.post('/UserLoginHistory/Create', data, getAuthConfig({ ...config, hideLoader: true, ignoreError: true }));
    },

    update: async (data) => {
        return await apiService.put('/UserLoginHistory/Update', data, getAuthConfig({ ignoreError: true }));
    },

    delete: async (id) => {
        return await apiService.delete(`/UserLoginHistory/Delete/${id}`, getAuthConfig({ ignoreError: true }));
    }
};
