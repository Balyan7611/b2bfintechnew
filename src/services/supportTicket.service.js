import { apiService } from '../api/httpClient';

export const SupportTicketService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber);
        if (params.pageSize) queryParams.append('PageSize', params.pageSize);
        if (params.fromDate) queryParams.append('FromDate', params.fromDate);
        if (params.toDate) queryParams.append('ToDate', params.toDate);
        if (params.status) queryParams.append('Status', params.status);
        if (params.memberId) queryParams.append('MemberID', params.memberId);
        
        const queryString = queryParams.toString();
        const url = `/SupportTicket/get-all${queryString ? `?${queryString}` : ''}`;
        return await apiService.get(url);
    },

    getById: async (id) => {
        return await apiService.get(`/SupportTicket/get-by-id/${id}`);
    },

    create: async (formData) => {
        // formData must be an instance of FormData to be processed as multipart/form-data
        return await apiService.postForm('/SupportTicket/create', formData);
    },

    update: async (formData) => {
        // formData must be an instance of FormData to be processed as multipart/form-data
        return await apiService.putForm('/SupportTicket/update', formData);
    },

    delete: async (id) => {
        return await apiService.delete(`/SupportTicket/delete/${id}`);
    }
};
