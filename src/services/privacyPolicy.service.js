import { apiService } from '../api/httpClient';

export const PrivacyPolicyService = {
    // GET /PrivacyPolicy/GetPrivacyPolicy?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/PrivacyPolicy/GetPrivacyPolicy?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /PrivacyPolicy/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/PrivacyPolicy/GetByID/${id}`);
    },

    // POST /PrivacyPolicy/Create
    create: async (data) => {
        return await apiService.post('/PrivacyPolicy/Create', {
            id: data.id || 0,
            name: data.name || '',
            description: data.description ?? null,
            image: data.image ?? null,
            msrno: data.msrno ?? null,
            companyMemberId: data.companyMemberId ?? null,
        });
    },

    // PUT /PrivacyPolicy/Update
    update: async (data) => {
        return await apiService.put('/PrivacyPolicy/Update', {
            id: data.id || 0,
            name: data.name || '',
            description: data.description ?? null,
            image: data.image ?? null,
            msrno: data.msrno ?? null,
            companyMemberId: data.companyMemberId ?? null,
        });
    },

    // DELETE /PrivacyPolicy/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/PrivacyPolicy/Delete/${id}`);
    },
};
