import { apiService } from '../api/httpClient';

export const LogsServiceDatumService = {
    // GET /LogsServiceDatum/get-all?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/LogsServiceDatum/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /LogsServiceDatum/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/LogsServiceDatum/get-by-id/${id}`);
    },

    // POST /LogsServiceDatum/create
    create: async (data) => {
        return await apiService.post('/LogsServiceDatum/create', {
            id: data.id || 0,
            serviceId: data.serviceId ?? null,
            apiid: data.apiid ?? null,
            transId: data.transId ?? null,
            requestData: data.requestData ?? null,
            responseData: data.responseData ?? null,
            createdBy: data.createdBy || null,
            modifiedBy: data.modifiedBy ?? null,
        });
    },

    // POST /LogsServiceDatum/update  (API uses POST per curl spec)
    update: async (data) => {
        return await apiService.post('/LogsServiceDatum/update', {
            id: data.id || 0,
            serviceId: data.serviceId ?? null,
            apiid: data.apiid ?? null,
            transId: data.transId ?? null,
            requestData: data.requestData ?? null,
            responseData: data.responseData ?? null,
            createdBy: data.createdBy || null,
            modifiedBy: data.modifiedBy ?? null,
        });
    },

    // DELETE /LogsServiceDatum/delete/1
    delete: async (id) => {
        return await apiService.delete(`/LogsServiceDatum/delete/${id}`);
    },
};
