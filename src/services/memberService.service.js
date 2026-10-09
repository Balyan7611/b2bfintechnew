import { apiService } from '../api/httpClient';

export const MemberServiceService = {
    // GET /MemberService/GetMemberService?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/MemberService/GetMemberService?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /MemberService/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/MemberService/GetByID/${id}`);
    },

    // POST /MemberService/Create
    create: async (data) => {
        return await apiService.post('/MemberService/Create', {
            id: data.id || 0,
            memberId: data.memberId ?? null,
            serviceId: data.serviceId ?? null,
            isActive: data.isActive === true,
            assignTypeId: data.assignTypeId ?? null,
            purchaseId: data.purchaseId ?? null,
            sourceReferenceId: data.sourceReferenceId ?? null,
            startDate: data.startDate ?? null,
            expiryDate: data.expiryDate ?? null,
            remark: data.remark ?? null,
        });
    },

    // PUT /MemberService/Update
    update: async (data) => {
        return await apiService.put('/MemberService/Update', {
            id: data.id || 0,
            memberId: data.memberId ?? null,
            serviceId: data.serviceId ?? null,
            isActive: data.isActive === true,
            assignTypeId: data.assignTypeId ?? null,
            purchaseId: data.purchaseId ?? null,
            sourceReferenceId: data.sourceReferenceId ?? null,
            startDate: data.startDate ?? null,
            expiryDate: data.expiryDate ?? null,
            remark: data.remark ?? null,
        });
    },

    // DELETE /MemberService/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/MemberService/Delete/${id}`);
    },

    // POST /MemberService/Request/1
    request: async (id) => {
        return await apiService.post(`/MemberService/Request/${id}`);
    },

    // GET /MemberService/PendingRequests?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getPendingRequests: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/MemberService/PendingRequests?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // POST /MemberService/Approve/1
    approve: async (id) => {
        return await apiService.post(`/MemberService/Approve/${id}`);
    },

    // POST /MemberService/Reject/1?reason=
    reject: async (id, reason = '') => {
        return await apiService.post(`/MemberService/Reject/${id}?reason=${encodeURIComponent(reason)}`);
    },

    // POST /MemberService/Pause/1
    pause: async (id) => {
        return await apiService.post(`/MemberService/Pause/${id}`);
    },

    // POST /MemberService/Cancel/1
    cancel: async (id) => {
        return await apiService.post(`/MemberService/Cancel/${id}`);
    },
};
