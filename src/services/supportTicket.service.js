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
        return await apiService.get(url, getAuthConfig());
    },

    getById: async (id) => {
        return await apiService.get(`/SupportTicket/get-by-id/${id}`, getAuthConfig());
    },

    create: async (formData) => {
        // Get token explicitly and inject into postForm
        const raw = sessionStorage.getItem('access_token')
            || localStorage.getItem('access_token')
            || sessionStorage.getItem('admin_token')
            || localStorage.getItem('admin_token')
            || sessionStorage.getItem('member_token')
            || localStorage.getItem('member_token');

        let headers = {};
        if (raw && raw !== 'null' && raw !== 'undefined') {
            const token = raw.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
            headers['Authorization'] = `Bearer ${token}`;
        }
        return await apiService.postForm('/SupportTicket/create', formData, { headers });
    },

    update: async (formData) => {
        const raw = sessionStorage.getItem('access_token')
            || localStorage.getItem('access_token')
            || sessionStorage.getItem('admin_token')
            || localStorage.getItem('admin_token')
            || sessionStorage.getItem('member_token')
            || localStorage.getItem('member_token');

        let headers = {};
        if (raw && raw !== 'null' && raw !== 'undefined') {
            const token = raw.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
            headers['Authorization'] = `Bearer ${token}`;
        }
        return await apiService.postForm('/SupportTicket/update', formData, { headers });
    },

    delete: async (id) => {
        return await apiService.delete(`/SupportTicket/delete/${id}`, getAuthConfig());
    }
};
