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

                                getMine: async ({ memberId = null, loginId = '' } = {}) => {
        const toArray = (res) => {
            if (Array.isArray(res?.data?.items)) return res.data.items;
            if (Array.isArray(res?.data)) return res.data;
            if (Array.isArray(res?.items)) return res.items;
            if (Array.isArray(res)) return res;
            return [];
        };

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

        getPendingRequests: async (params = {}) => {
        const { pageNumber = 1, pageSize = 50 } = params;
        return await apiService.get(`/MemberService/PendingRequests?PageNumber=${pageNumber}&PageSize=${pageSize}`);
    },

        approve: async (memberServiceId) => {
        return await apiService.post(`/MemberService/Approve/${memberServiceId}`, {});
    },

        reject: async (memberServiceId, reason = '') => {
        return await apiService.post(`/MemberService/Reject/${memberServiceId}?reason=${encodeURIComponent(reason)}`, {});
    },

        pause: async (id) => {
        return await apiService.post(`/MemberService/Pause/${id}`, {});
    },

        cancel: async (id) => {
        return await apiService.post(`/MemberService/Cancel/${id}`, {});
    }
};
