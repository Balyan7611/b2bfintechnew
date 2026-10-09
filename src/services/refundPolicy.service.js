import { apiService } from '../api/httpClient';

export const RefundPolicyService = {
    // GET /RefundPolicy/GetRefundPolicy?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/RefundPolicy/GetRefundPolicy?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /RefundPolicy/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/RefundPolicy/GetByID/${id}`);
    },

    // POST /RefundPolicy/Create
    create: async (data) => {
        return await apiService.post('/RefundPolicy/Create', {
            id: data.id || 0,
            name: data.name || '',
            description: data.description ?? null,
            image: data.image ?? null,
            msrno: data.msrno ?? null,
            companyMemberId: data.companyMemberId ?? null,
        });
    },

    // PUT /RefundPolicy/Update
    update: async (data) => {
        return await apiService.put('/RefundPolicy/Update', {
            id: data.id || 0,
            name: data.name || '',
            description: data.description ?? null,
            image: data.image ?? null,
            msrno: data.msrno ?? null,
            companyMemberId: data.companyMemberId ?? null,
        });
    },

    // DELETE /RefundPolicy/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/RefundPolicy/Delete/${id}`);
    },
};
