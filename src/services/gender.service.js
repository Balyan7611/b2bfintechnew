import { apiService } from '../api/httpClient';

export const GenderService = {
    // GET /Gender?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Gender?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Gender/1
    getById: async (id) => {
        return await apiService.get(`/Gender/${id}`);
    },

    // POST /Gender
    create: async (data) => {
        return await apiService.post('/Gender', {
            id: data.id || 0,
            name: data.name || '',
        });
    },

    // PUT /Gender
    update: async (data) => {
        return await apiService.put('/Gender', {
            id: data.id || 0,
            name: data.name || '',
        });
    },
};
