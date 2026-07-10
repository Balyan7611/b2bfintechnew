import { apiService } from '../api/httpClient';

export const TicketConversationService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber);
        if (params.pageSize) queryParams.append('PageSize', params.pageSize);
        if (params.fromDate) queryParams.append('FromDate', params.fromDate);
        if (params.toDate) queryParams.append('ToDate', params.toDate);
        if (params.status) queryParams.append('Status', params.status);
        if (params.memberId) queryParams.append('MemberID', params.memberId);
        
        const queryString = queryParams.toString();
        const url = `/TicketConversation/get-all${queryString ? `?${queryString}` : ''}`;
        return await apiService.get(url);
    },
    
    getByTicketId: async (ticketId) => {
        return await apiService.get(`/TicketConversation/get-by-ticket-id/${ticketId}`);
    },

    create: async (data) => {
        return await apiService.post('/TicketConversation/create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/TicketConversation/update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/TicketConversation/delete/${id}`);
    }
};
