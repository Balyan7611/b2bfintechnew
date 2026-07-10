import { apiService } from '../api/httpClient';

export const MasterApiService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber);
        if (params.pageSize) queryParams.append('PageSize', params.pageSize);
        if (params.fromDate) queryParams.append('FromDate', params.fromDate);
        if (params.toDate) queryParams.append('ToDate', params.toDate);
        if (params.status) queryParams.append('Status', params.status);
        if (params.memberId) queryParams.append('MemberID', params.memberId);
        
        const queryString = queryParams.toString();
        const url = `/MasterApi/get-all${queryString ? `?${queryString}` : ''}`;
        return await apiService.get(url);
    },

    getById: async (id) => {
        return await apiService.get(`/MasterApi/get-by-id/${id}`);
    },

    create: async (data) => {
        return await apiService.post('/MasterApi/create', data);
    },

    update: async (data) => {
        return await apiService.put('/MasterApi/update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/MasterApi/delete/${id}`);
    }
};
