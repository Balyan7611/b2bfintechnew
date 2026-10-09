import { apiService } from '../api/httpClient';

const buildSmsSettingPayload = (data) => ({
    id: data.id || 0,
    url: data.url || '',
    sender: data.sender ?? null,
    country: data.country ?? null,
    route: data.route ?? null,
    param1Text: data.param1Text ?? null,
    param1Val: data.param1Val ?? null,
    param2Text: data.param2Text ?? null,
    param2Val: data.param2Val ?? null,
    param3Text: data.param3Text ?? null,
    param3Val: data.param3Val ?? null,
    routeText: data.routeText ?? null,
    countryText: data.countryText ?? null,
    dltText: data.dltText ?? null,
    senderText: data.senderText ?? null,
    isActive: data.isActive === true,
    msrno: data.msrno ?? null,
    companyMemberId: data.companyMemberId ?? null,
    integrationtype: data.integrationtype ?? null,
});

export const SmsSettingService = {
    // GET /Smssetting/GetSmssetting?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Smssetting/GetSmssetting?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Smssetting/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/Smssetting/GetByID/${id}`);
    },

    // POST /Smssetting/Create
    create: async (data) => {
        return await apiService.post('/Smssetting/Create', buildSmsSettingPayload(data));
    },

    // PUT /Smssetting/Update
    update: async (data) => {
        return await apiService.put('/Smssetting/Update', buildSmsSettingPayload(data));
    },

    // DELETE /Smssetting/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/Smssetting/Delete/${id}`);
    },
};
