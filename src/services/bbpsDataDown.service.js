import { apiService } from '../api/httpClient';

export const BbpsDataDownService = {
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 10000;
        const fromDate = params.fromDate || '';
        const toDate = params.toDate || '';
        const status = params.status || '';
        const memberID = params.memberID || 0;
        const walletTypeId = params.walletTypeId || params.WalletTypeId || '';
        return await apiService.get(`/BbpsdataDown/GetBbpsdataDown?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(toDate)}&Status=${encodeURIComponent(status)}&MemberID=${memberID}&WalletTypeId=${encodeURIComponent(walletTypeId)}`);
    },

    getById: async (id) => {
        return await apiService.get(`/BbpsdataDown/GetByID/${id}`);
    },

    create: async (data) => {
        return await apiService.post('/BbpsdataDown/Create', {
            id: data.id || 0,
            spKey: data.spKey ?? null,
            index: data.index ?? null,
            labels: data.labels ?? null,
            fieldMinLen: data.fieldMinLen ?? null,
            fieldMaxLen: data.fieldMaxLen ?? null,
            isOptional: data.isOptional === true,
            values: data.values ?? null,
        });
    },

    update: async (data) => {
        return await apiService.put('/BbpsdataDown/Update', {
            id: data.id || 0,
            spKey: data.spKey ?? null,
            index: data.index ?? null,
            labels: data.labels ?? null,
            fieldMinLen: data.fieldMinLen ?? null,
            fieldMaxLen: data.fieldMaxLen ?? null,
            isOptional: data.isOptional === true,
            values: data.values ?? null,
        });
    },

    delete: async (id) => {
        return await apiService.delete(`/BbpsdataDown/Delete/${id}`);
    }
};
