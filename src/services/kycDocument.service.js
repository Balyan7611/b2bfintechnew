import { apiService } from '../api/httpClient';

export const KycDocumentService = {
    // GET /KycdocumentsMaster/GetKycdocumentsMaster?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/KycdocumentsMaster/GetKycdocumentsMaster?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /KycdocumentsMaster/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/KycdocumentsMaster/GetByID/${id}`);
    },

    // POST /KycdocumentsMaster/Create
    create: async (data) => {
        return await apiService.post('/KycdocumentsMaster/Create', {
            id: data.id || 0,
            name: data.name || '',
            side: data.side ?? null,
            isActive: data.isActive === true,
        });
    },

    // PUT /KycdocumentsMaster/Update
    update: async (data) => {
        return await apiService.put('/KycdocumentsMaster/Update', {
            id: data.id || 0,
            name: data.name || '',
            side: data.side ?? null,
            isActive: data.isActive === true,
        });
    },

    // DELETE /KycdocumentsMaster/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/KycdocumentsMaster/Delete/${id}`);
    },
};
