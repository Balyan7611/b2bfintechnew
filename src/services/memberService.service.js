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

    create: async (data) => {
        const payload = {
            memberId: parseInt(data.memberId || data.MemberId || 0),
            serviceId: parseInt(data.serviceId || data.ServiceId || 0),
            isActive: data.isActive ?? false,
            assignTypeId: data.assignTypeId ?? 1,
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
    }
};
