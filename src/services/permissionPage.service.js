import { apiService } from '../api/httpClient';

export const PermissionPageService = {
    // GET /PermissionPage/get-all?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/PermissionPage/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /PermissionPage/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/PermissionPage/get-by-id/${id}`);
    },

    // POST /PermissionPage/create
    create: async (data) => {
        return await apiService.post('/PermissionPage/create', {
            id: data.id || 0,
            pageId: data.pageId ?? null,
            roleId: data.roleId ?? null,
            active: data.active === true,
            delete: data.delete === true,
            edit: data.edit === true,
            addFund: data.addFund === true,
            deductFund: data.deductFund === true,
            submit: data.submit === true,
            checkStatus: data.checkStatus === true,
            forceFailed: data.forceFailed === true,
            forceSuccess: data.forceSuccess === true,
        });
    },

    // POST /PermissionPage/update  (API uses POST per curl spec)
    update: async (data) => {
        return await apiService.post('/PermissionPage/update', {
            id: data.id || 0,
            pageId: data.pageId ?? null,
            roleId: data.roleId ?? null,
            active: data.active === true,
            delete: data.delete === true,
            edit: data.edit === true,
            addFund: data.addFund === true,
            deductFund: data.deductFund === true,
            submit: data.submit === true,
            checkStatus: data.checkStatus === true,
            forceFailed: data.forceFailed === true,
            forceSuccess: data.forceSuccess === true,
        });
    },

    // DELETE /PermissionPage/delete/1
    delete: async (id) => {
        return await apiService.delete(`/PermissionPage/delete/${id}`);
    },

    // PATCH /PermissionPage/toggle-status/1
    toggleStatus: async (id) => {
        return await apiService.patch(`/PermissionPage/toggle-status/${id}`);
    },
};
