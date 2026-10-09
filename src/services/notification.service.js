import { apiService } from '../api/httpClient';

export const NotificationService = {
    // POST /Notification/send
    send: async (data) => {
        return await apiService.post('/Notification/send', {
            categoryId: data.categoryId ?? null,
            mobile: data.mobile ?? null,
            email: data.email ?? null,
            subject: data.subject ?? null,
            whatsAppNumber: data.whatsAppNumber ?? null,
            var0: data.var0 ?? null,
            var1: data.var1 ?? null,
            var2: data.var2 ?? null,
            var3: data.var3 ?? null,
            var4: data.var4 ?? null,
            var5: data.var5 ?? null,
            var6: data.var6 ?? null,
        });
    },

    // POST /Notification/logs  (body-based filter)
    getLogs: async (params = {}) => {
        return await apiService.post('/Notification/logs', {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 100,
            searchTerm: params.searchTerm ?? null,
            channel: params.channel ?? null,
            categoryId: params.categoryId ?? null,
            isSuccess: params.isSuccess ?? null,
            fromDate: params.fromDate ?? null,
            toDate: params.toDate ?? null,
        });
    },

    // GET /Notification/logs?PageNumber=1&PageSize=1&SearchTerm=&Channel=&CategoryId=1&IsSuccess=true&FromDate=&ToDate=
    getLogsQuery: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const searchTerm = params.searchTerm ?? '';
        const channel = params.channel ?? '';
        const categoryId = params.categoryId ?? '';
        const isSuccess = params.isSuccess ?? '';
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        return await apiService.get(
            `/Notification/logs?PageNumber=${pageNumber}&PageSize=${pageSize}&SearchTerm=${encodeURIComponent(searchTerm)}&Channel=${encodeURIComponent(channel)}&CategoryId=${categoryId}&IsSuccess=${isSuccess}&FromDate=${fromDate}&ToDate=${toDate}`
        );
    },

    // GET /Notification/logs/1
    getLogById: async (id) => {
        return await apiService.get(`/Notification/logs/${id}`);
    },
};
