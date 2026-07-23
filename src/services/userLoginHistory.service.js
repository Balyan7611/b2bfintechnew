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

export const UserLoginHistoryService = {
    // Matches GET /UserLoginHistory/GetUserLoginHistory?PageNumber=&PageSize=&FromDate=&ToDate=&Status=&MemberID=
    getAll: async (params = {}) => {
        const {
            pageNumber = 1,
            pageSize = 10000,
            fromDate,
            toDate,
            status,
            memberID
        } = params;

        const query = new URLSearchParams();
        query.set('PageNumber', pageNumber);
        query.set('PageSize', pageSize);
        if (fromDate) query.set('FromDate', fromDate);
        if (toDate) query.set('ToDate', toDate);
        if (status) query.set('Status', status);
        if (memberID !== undefined && memberID !== null && memberID !== '') query.set('MemberID', memberID);

        return await apiService.get(
            `/UserLoginHistory/GetUserLoginHistory?${query.toString()}`,
            getAuthConfig({ hideLoader: true, ignoreError: true })
        );
    },

    getById: async (id) => {
        return await apiService.get(`/UserLoginHistory/GetByID/${id}`, getAuthConfig({ ignoreError: true }));
    },

    create: async (data, config = {}) => {
        return await apiService.post('/UserLoginHistory/Create', data, getAuthConfig({ ...config, hideLoader: true, ignoreError: true }));
    },

    update: async (data, config = {}) => {
        return await apiService.put('/UserLoginHistory/Update', data, getAuthConfig({ ...config, ignoreError: true }));
    },

    delete: async (id) => {
        return await apiService.delete(`/UserLoginHistory/Delete/${id}`, getAuthConfig({ ignoreError: true }));
    },

    // Best-effort: marks the current session's login-history record as
    // logged out (isActiveSession:false, logoutTime:now). The record id is
    // captured at login time in sessionStorage (see App.jsx registerSessionOnBackend).
    closeActiveSession: async () => {
        try {
            const id = sessionStorage.getItem('bss_login_history_id');
            if (!id) return;

            const res = await apiService.get(`/UserLoginHistory/GetByID/${id}`, getAuthConfig({ hideLoader: true, ignoreError: true }));
            const record = res?.data || res;
            if (!record || !record.id) return;

            await apiService.put('/UserLoginHistory/Update', {
                ...record,
                isActiveSession: false,
                logoutTime: new Date().toISOString()
            }, getAuthConfig({ hideLoader: true, ignoreError: true }));
        } catch (err) {
            console.error('Failed to close login history session:', err);
        } finally {
            sessionStorage.removeItem('bss_login_history_id');
        }
    }
};
