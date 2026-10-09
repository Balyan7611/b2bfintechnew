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

    // GET /TicketConversation/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/TicketConversation/get-by-id/${id}`, getAuthConfig());
    },

    getByTicketId: async (ticketId) => {
        return await apiService.get(`/TicketConversation/get-by-ticket-id/${ticketId}`, getAuthConfig());
    },

    // POST /TicketConversation/create
    create: async (data) => {
        return await apiService.post('/TicketConversation/create', {
            id: data.id || 0,
            ticketId: data.ticketId || '',
            senderType: data.senderType || '',
            senderId: data.senderId || '',
            message: data.message || '',
            createdBy: data.createdBy ?? null,
            modifiedBy: data.modifiedBy ?? null,
        }, getAuthConfig());
    },

    // POST /TicketConversation/update  (POST — not PUT per curl spec)
    update: async (data) => {
        return await apiService.post('/TicketConversation/update', {
            id: data.id || 0,
            ticketId: data.ticketId || '',
            senderType: data.senderType || '',
            senderId: data.senderId || '',
            message: data.message || '',
            createdBy: data.createdBy ?? null,
            modifiedBy: data.modifiedBy ?? null,
        }, getAuthConfig());
    },

    // DELETE /TicketConversation/delete/1
    delete: async (id) => {
        return await apiService.delete(`/TicketConversation/delete/${id}`, getAuthConfig());
    }
};
