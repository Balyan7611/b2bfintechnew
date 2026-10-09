import { apiService } from '../api/httpClient';

export const SmsLogService = {
    // POST /Smslog/get-logs — body-based filter
    getLogs: async (params = {}) => {
        return await apiService.post('/Smslog/get-logs', {
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

    // GET /Smslog/get-logs?PageNumber=1&PageSize=1&SearchTerm=&Channel=&CategoryId=1&IsSuccess=true&FromDate=&ToDate=
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
            `/Smslog/get-logs?PageNumber=${pageNumber}&PageSize=${pageSize}&SearchTerm=${searchTerm}&Channel=${channel}&CategoryId=${categoryId}&IsSuccess=${isSuccess}&FromDate=${fromDate}&ToDate=${toDate}`
        );
    },

    // GET /Smslog/1
    getById: async (id) => {
        return await apiService.get(`/Smslog/${id}`);
    },
};
