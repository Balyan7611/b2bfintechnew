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

    // Best-effort: calls the backend LogoutUser endpoint which marks the
    // session record as logged-out (isActiveSession:false, logoutTime:now)
    // using the sessionId stored in bss_current_session.
    // NOTE: We no longer store bss_login_history_id because App.jsx stopped
    // creating a duplicate UserLoginHistory record. The backend's own
    // RecordLoginHistoryAsync already saved the record with the correct IP -
    // so we use the sessionId-based logout endpoint instead.
    closeActiveSession: async () => {
        try {
            const raw = sessionStorage.getItem('bss_current_session') || localStorage.getItem('bss_current_session');
            if (!raw) return;

            let sessionId = null;
            try {
                const parsed = JSON.parse(raw);
                sessionId = parsed?.sessionId;
            } catch (_) { }

            if (!sessionId) return;

            await apiService.post('/UserAuth/LogoutUser', { sessionId }, getAuthConfig({ hideLoader: true, ignoreError: true }));
        } catch (err) {
            console.error('Failed to close login history session:', err);
        } finally {
            sessionStorage.removeItem('bss_login_history_id');
        }
    }
};
