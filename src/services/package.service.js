import { apiService } from '../api/httpClient';

export const PackageService = {
    // GET /Package?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Package?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Package/1
    getById: async (id) => {
        return await apiService.get(`/Package/${id}`);
    },

    // POST /Package
    create: async (data) => {
        return await apiService.post('/Package', {
            id: data.id || 0,
            roleId: data.roleId ?? null,
            code: data.code ?? null,
            name: data.name || '',
            description: data.description ?? null,
            price: data.price ?? null,
            billingType: data.billingType || '',
            isActive: data.isActive === true,
            copySlabId: data.copySlabId ?? null,
        });
    },

    // PUT /Package
    update: async (data) => {
        return await apiService.put('/Package', {
            id: data.id || 0,
            roleId: data.roleId ?? null,
            code: data.code ?? null,
            name: data.name || '',
            description: data.description ?? null,
            price: data.price ?? null,
            billingType: data.billingType || '',
            isActive: data.isActive === true,
            copySlabId: data.copySlabId ?? null,
        });
    },
};
