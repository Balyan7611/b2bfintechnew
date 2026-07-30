import { apiService } from '../api/httpClient';
import { StateResponseModel } from '../models/stateModel';

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
            Authorization: `Bearer ${token}`,
            'accept': '*/*'
        }
    };
};

export const StateService = {
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 10000;
        const res = await apiService.get(`/State?PageNumber=${pageNumber}&PageSize=${pageSize}`, getAuthConfig());
        return StateResponseModel(res);
    }
};
