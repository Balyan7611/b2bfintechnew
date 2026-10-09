import { apiService } from '../api/httpClient';

const buildPayload = (data) => ({
    id: data.id || 0,
    msrno: data.msrno ?? null,
    credentialType: data.credentialType || '',
    oldHash: data.oldHash || '',
    newHash: data.newHash || '',
    changedByUserId: data.changedByUserId ?? null,
    changeReason: data.changeReason || '',
    ipaddress: data.ipaddress ?? null,
    deviceInfo: data.deviceInfo ?? null,
});

export const UserCredentialHistoryService = {
    // GET /UserCredentialHistory/GetUserCredentialHistory?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/UserCredentialHistory/GetUserCredentialHistory?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /UserCredentialHistory/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/UserCredentialHistory/GetByID/${id}`);
    },

    // POST /UserCredentialHistory/Create
    create: async (data) => {
        return await apiService.post('/UserCredentialHistory/Create', buildPayload(data));
    },

    // PUT /UserCredentialHistory/Update
    update: async (data) => {
        return await apiService.put('/UserCredentialHistory/Update', buildPayload(data));
    },

    // DELETE /UserCredentialHistory/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/UserCredentialHistory/Delete/${id}`);
    },
};
