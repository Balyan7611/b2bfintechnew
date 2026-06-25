import { apiService } from '../api/httpClient';

export const BbpsDataDownService = {
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 10000;
        const fromDate = params.fromDate || '';
        const toDate = params.toDate || '';
        const status = params.status || '';
        const memberID = params.memberID || 0;
        return await apiService.get(`/BbpsdataDown/GetBbpsdataDown?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}`);
    },

    getById: async (id) => {
        return await apiService.get(`/BbpsdataDown/GetByID/${id}`);
    },

    create: async (data) => {
        return await apiService.post('/BbpsdataDown/Create', data);
    },

    update: async (data) => {
        return await apiService.put('/BbpsdataDown/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/BbpsdataDown/Delete/${id}`);
    }
};
