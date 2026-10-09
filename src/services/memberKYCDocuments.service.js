import { apiService } from '../api/httpClient';

export const MemberKYCDocumentsService = {
    // GET /MemberKYCDocuments/get-all?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/MemberKYCDocuments/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /MemberKYCDocuments/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/MemberKYCDocuments/get-by-id/${id}`);
    },

    // DELETE /MemberKYCDocuments/delete/1
    delete: async (id) => {
        return await apiService.delete(`/MemberKYCDocuments/delete/${id}`);
    },

    // PATCH /MemberKYCDocuments/toggle-status/1
    toggleStatus: async (id) => {
        return await apiService.patch(`/MemberKYCDocuments/toggle-status/${id}`);
    },
};
