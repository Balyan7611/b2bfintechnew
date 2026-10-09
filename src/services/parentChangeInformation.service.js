import { apiService } from '../api/httpClient';

export const ParentChangeInformationService = {
    // GET /ParentChangeInformation/GetParentChangeInformation?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/ParentChangeInformation/GetParentChangeInformation?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /ParentChangeInformation/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/ParentChangeInformation/GetByID/${id}`);
    },

    // POST /ParentChangeInformation/Create
    create: async (data) => {
        return await apiService.post('/ParentChangeInformation/Create', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            previousRoleId: data.previousRoleId ?? null,
            currentRoleId: data.currentRoleId ?? null,
            previousParentId: data.previousParentId ?? null,
            currentParentId: data.currentParentId ?? null,
            isDelete: data.isDelete ?? false,
        });
    },

    // PUT /ParentChangeInformation/Update
    update: async (data) => {
        return await apiService.put('/ParentChangeInformation/Update', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            previousRoleId: data.previousRoleId ?? null,
            currentRoleId: data.currentRoleId ?? null,
            previousParentId: data.previousParentId ?? null,
            currentParentId: data.currentParentId ?? null,
            isDelete: data.isDelete ?? false,
        });
    },

    // DELETE /ParentChangeInformation/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/ParentChangeInformation/Delete/${id}`);
    },
};
