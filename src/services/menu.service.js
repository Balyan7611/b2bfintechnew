import { apiService } from '../api/httpClient';

export const MenuService = {
    // GET /Menu/GetMenu?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Menu/GetMenu?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Menu/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/Menu/GetByID/${id}`);
    },

    // POST /Menu/Create
    create: async (data) => {
        return await apiService.post('/Menu/Create', {
            id: data.id || 0,
            menuType: data.menuType ?? null,
            name: data.name || '',
            link: data.link ?? null,
            icon: data.icon ?? null,
            class: data.class ?? null,
            parentId: data.parentId ?? null,
            level: data.level ?? null,
            parentStr: data.parentStr ?? null,
            position: data.position ?? null,
            showPosition: data.showPosition ?? null,
            isActive: data.isActive === true,
            serviceid: data.serviceid ?? null,
        });
    },

    // PUT /Menu/Update
    update: async (data) => {
        return await apiService.put('/Menu/Update', {
            id: data.id || 0,
            menuType: data.menuType ?? null,
            name: data.name || '',
            link: data.link ?? null,
            icon: data.icon ?? null,
            class: data.class ?? null,
            parentId: data.parentId ?? null,
            level: data.level ?? null,
            parentStr: data.parentStr ?? null,
            position: data.position ?? null,
            showPosition: data.showPosition ?? null,
            isActive: data.isActive === true,
            serviceid: data.serviceid ?? null,
        });
    },

    // DELETE /Menu/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/Menu/Delete/${id}`);
    },
};
