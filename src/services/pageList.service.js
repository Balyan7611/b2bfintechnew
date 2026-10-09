import { apiService } from '../api/httpClient';

export const PageListService = {
    // GET /PageList/get-all?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/PageList/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /PageList/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/PageList/get-by-id/${id}`);
    },

    // POST /PageList/create
    create: async (data) => {
        return await apiService.post('/PageList/create', {
            id: data.id || 0,
            name: data.name || '',
        });
    },

    // POST /PageList/update  (API uses POST per curl spec)
    update: async (data) => {
        return await apiService.post('/PageList/update', {
            id: data.id || 0,
            name: data.name || '',
        });
    },

    // DELETE /PageList/delete/1
    delete: async (id) => {
        return await apiService.delete(`/PageList/delete/${id}`);
    },

    // PATCH /PageList/toggle-status/1
    toggleStatus: async (id) => {
        return await apiService.patch(`/PageList/toggle-status/${id}`);
    },
};
