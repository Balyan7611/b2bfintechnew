import { apiService } from '../api/httpClient';

export const MemberServiceService = {
    getAll: async (params = {}) => {
        const { PageNumber = 1, PageSize = 1000, MemberID = '' } = params;
        const queryParams = new URLSearchParams({
            PageNumber,
            PageSize
        });
        if (MemberID) queryParams.append('MemberID', MemberID);
        return await apiService.get(`/MemberService/GetMemberService?${queryParams.toString()}`);
    },

    getById: async (id) => {
        return await apiService.get(`/MemberService/GetByID/${id}`);
    },

    // Returns the logged-in user's own service rows as a plain array.
    //
    // Filtering by MemberID is only trustworthy when we actually have the real
    // numeric Member.Id. If that lookup fails, or the server ignores/mismatches
    // the filter and returns nothing, we pull the full table and match on
    // LoginId instead — that string always comes straight from the session, so
    // this path works even when the id is unknown.
    getMine: async ({ memberId = null, loginId = '' } = {}) => {
        const toArray = (res) => {
            if (Array.isArray(res?.data?.items)) return res.data.items;
            if (Array.isArray(res?.data)) return res.data;
            if (Array.isArray(res?.items)) return res.items;
            if (Array.isArray(res)) return res;
            return [];
        };

        // 1. Direct, server-side filter.
        if (memberId) {
            try {
                const res = await MemberServiceService.getAll({ MemberID: memberId });
                const rows = toArray(res);
                console.log('[getMine] MemberID=' + memberId + ' returned', rows.length, 'rows');
                if (rows.length > 0) return rows;
            } catch (err) {
                console.error('[getMine] filtered GetMemberService failed:', err);
            }
        }

        // 2. Fallback: whole table, matched client-side.
        try {
            const resAll = await MemberServiceService.getAll({ PageNumber: 1, PageSize: 5000 });
            const all = toArray(resAll);
            const wantedLogin = String(loginId || '').trim().toLowerCase();
            const rows = all.filter(r => {
                const rowMemberId = r.memberId ?? r.MemberId;
                if (memberId && Number(rowMemberId) === Number(memberId)) return true;
                const rowLogin = String(r.loginId || r.LoginId || r.memberLoginId || '').trim().toLowerCase();
                return !!wantedLogin && rowLogin === wantedLogin;
            });
            console.log('[getMine] fallback scanned', all.length, 'rows, matched', rows.length,
                '(memberId=' + memberId + ', loginId=' + loginId + ')');
            return rows;
        } catch (err) {
            console.error('[getMine] fallback GetMemberService failed:', err);
            return [];
        }
    },

    create: async (data) => {
        const payload = {
            memberId: parseInt(data.memberId || data.MemberId || 0),
            serviceId: parseInt(data.serviceId || data.ServiceId || 0),
            isActive: data.isActive ?? false,
            // If the caller didn't say, infer: active row = admin-assigned (1),
            // inactive row = a member request awaiting approval (2). Sending 1
            // for an inactive row would hide it from /PendingRequests.
            assignTypeId: data.assignTypeId ?? ((data.isActive ?? false) ? 1 : 2),
            purchaseId: data.purchaseId || '',
            sourceReferenceId: data.sourceReferenceId || '',
            startDate: data.startDate || new Date().toISOString(),
            expiryDate: data.expiryDate || null,
            remark: data.remark || 'Requested by Member'
        };
        return await apiService.post('/MemberService/Create', payload);
    },

    update: async (data) => {
        const payload = {
            id: data.id,
            memberId: parseInt(data.memberId || data.MemberId || 0),
            serviceId: parseInt(data.serviceId || data.ServiceId || 0),
            isActive: data.isActive ?? false,
            assignTypeId: data.assignTypeId ?? 1,
            purchaseId: data.purchaseId || '',
            sourceReferenceId: data.sourceReferenceId || '',
            startDate: data.startDate || new Date().toISOString(),
            expiryDate: data.expiryDate || null,
            remark: data.remark || ''
        };
        return await apiService.put('/MemberService/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/MemberService/Delete/${id}`);
    },

    // Member/API user requests activation of a locked/inactive service.
    // Backend creates a MemberService record with IsActive=0, AssignTypeId=2 (Pending).
    // memberId is optional — the backend reads MemberId from the JWT. It is only
    // used by the fallback below if /Request/{serviceId} isn't deployed yet.
    requestActivation: async (serviceId, memberId = null) => {
        try {
            return await apiService.post(`/MemberService/Request/${serviceId}`, {});
        } catch (err) {
            const httpStatus = err?.response?.status;
            const notImplemented = httpStatus === 404 || httpStatus === 405 || httpStatus === 501;
            if (!notImplemented || !memberId) throw err;

            console.warn('/MemberService/Request not available, falling back to /Create with AssignTypeId=2');
            return await apiService.post('/MemberService/Create', {
                memberId: parseInt(memberId),
                serviceId: parseInt(serviceId),
                isActive: false,
                assignTypeId: 2,
                purchaseId: '',
                sourceReferenceId: '',
                startDate: new Date().toISOString(),
                expiryDate: null,
                remark: 'Requested by member for activation'
            });
        }
    },

    // Admin: list of all pending (AssignTypeId=2) requests awaiting approval.
    getPendingRequests: async (params = {}) => {
        const { pageNumber = 1, pageSize = 50 } = params;
        return await apiService.get(`/MemberService/PendingRequests?PageNumber=${pageNumber}&PageSize=${pageSize}`);
    },

    // Admin: approve a pending request -> IsActive=1, AssignTypeId=3 (Approved).
    approve: async (memberServiceId) => {
        return await apiService.post(`/MemberService/Approve/${memberServiceId}`, {});
    },

    // Admin: reject a pending request with a reason -> IsActive=0, AssignTypeId=4 (Rejected).
    reject: async (memberServiceId, reason = '') => {
        return await apiService.post(`/MemberService/Reject/${memberServiceId}?reason=${encodeURIComponent(reason)}`, {});
    },

    // Pause service (IsActive=0, AssignTypeId=5)
    pause: async (id) => {
        return await apiService.post(`/MemberService/Pause/${id}`, {});
    },

    // Cancel service (IsActive=0, AssignTypeId=6)
    cancel: async (id) => {
        return await apiService.post(`/MemberService/Cancel/${id}`, {});
    }
};
