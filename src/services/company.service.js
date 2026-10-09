import { apiService } from '../api/httpClient';

export const CompanyService = {
    // GET /Company/get-all?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Company/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Company/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/Company/get-by-id/${id}`);
    },

    // GET /Company/get-by-member/1
    getByMember: async (memberId) => {
        return await apiService.get(`/Company/get-by-member/${memberId}`);
    },

    // GET /Company/get-by-url?url=
    getByUrl: async (url = '') => {
        return await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
    },

    // DELETE /Company/delete/1
    delete: async (id) => {
        return await apiService.delete(`/Company/delete/${id}`);
    },

    // PATCH /Company/toggle-status/1
    toggleStatus: async (id) => {
        return await apiService.patch(`/Company/toggle-status/${id}`);
    },

    // Used in endpoints.js as API.getCompanyDetails
    getCompanyDetails: async (id = 1) => {
        return await apiService.get(`/Company/get-by-id/${id}`);
    },

    // Used in endpoints.js as fetchCompanyData
    fetchCompanyData: async (url = '') => {
        return await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
    },
};
