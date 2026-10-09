import { apiService } from '../api/httpClient';

export const PipeMasterService = {
    // GET /PipeMaster/GetPipeMaster?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/PipeMaster/GetPipeMaster?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /PipeMaster/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/PipeMaster/GetByID/${id}`);
    },

    // POST /PipeMaster/Create
    create: async (data) => {
        return await apiService.post('/PipeMaster/Create', {
            id: data.id || 0,
            serviceId: data.serviceId ?? null,
            pipeName: data.pipeName || '',
            aliasName: data.aliasName ?? null,
            isActive: data.isActive === true,
        });
    },

    // PUT /PipeMaster/Update
    update: async (data) => {
        return await apiService.put('/PipeMaster/Update', {
            id: data.id || 0,
            serviceId: data.serviceId ?? null,
            pipeName: data.pipeName || '',
            aliasName: data.aliasName ?? null,
            isActive: data.isActive === true,
        });
    },

    // DELETE /PipeMaster/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/PipeMaster/Delete/${id}`);
    },
};
