import { apiService } from '../api/httpClient';

const getAuthConfig = (extra = {}) => {
    const raw = sessionStorage.getItem('access_token')
        || localStorage.getItem('access_token')
        || sessionStorage.getItem('admin_token')
        || localStorage.getItem('admin_token')
        || sessionStorage.getItem('member_token')
        || localStorage.getItem('member_token');

    if (!raw || raw === 'null' || raw === 'undefined') return extra;

    const token = raw.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
    return {
        ...extra,
        headers: {
            ...(extra.headers || {}),
            Authorization: `Bearer ${token}`
        }
    };
};

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
        return await apiService.get(url, getAuthConfig());
    },

    getByTicketId: async (ticketId) => {
        return await apiService.get(`/TicketConversation/get-by-ticket-id/${ticketId}`, getAuthConfig());
    },

    create: async (data) => {
        return await apiService.post('/TicketConversation/create', data, getAuthConfig());
    },

    update: async (data) => {
        return await apiService.put('/TicketConversation/update', data, getAuthConfig());
    },

    delete: async (id) => {
        return await apiService.delete(`/TicketConversation/delete/${id}`, getAuthConfig());
    }
};
