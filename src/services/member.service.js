import { apiService } from '../api/httpClient';
import { MemberRequestModel } from '../models/memberModel';
import { MemberSearchResponseModel } from '../models/memberSearchModel';

export const MemberService = {
    createMember: async (data) => {
        const payload = MemberRequestModel(data);
        return await apiService.post('/Member/create-member', payload);
    },

    searchMember: async (searchQuery, isActive = '') => {
        const res = await apiService.get(`/Member/MemberSearch?isActive=${isActive}&Search=${searchQuery}`);
        return MemberSearchResponseModel(res);
    },

    search: async (searchQuery, isActive = '') => {
        return await MemberService.searchMember(searchQuery, isActive);
    },

    // Paginated get-all with filters
    getAll: async ({ pageNumber = 1, pageSize = 10, search = '', roleId = 0, isActive = null, isKycApproved = null, fromDate = '', toDate = '' } = {}) => {
        const payload = {
            pageNumber,
            pageSize,
            roleId: (search && search.trim() !== '') ? 0 : (roleId ? parseInt(roleId) : 0),
            search: search || '',
        };
        if (isActive !== null) payload.isActive = isActive;
        if (isKycApproved !== null) payload.isKycApproved = isKycApproved;
        if (fromDate) payload.fromDate = fromDate;
        if (toDate) payload.toDate = toDate;
        
        let res = await apiService.post('/Member/get-all-members', payload);
        
        // Workaround for backend bug: if both search and roleId were requested, we fetched roleId=0 and now filter locally.
        if (search && search.trim() !== '' && roleId && roleId !== "0" && roleId !== 0) {
            const targetRole = parseInt(roleId);
            if (res && res.status === true && res.data && Array.isArray(res.data.items)) {
                res.data.items = res.data.items.filter(m => {
                    const rId = m.roleId || m.roleID || m.RoleID || m.role_id;
                    if (rId == null) return true; // Safety check if raw data lacks role ID
                    return parseInt(rId) === targetRole;
                });
                res.data.totalItems = res.data.items.length;
                res.data.totalPageNumber = Math.ceil(res.data.totalItems / pageSize) || 1;
            }
        }
        return res;
    },

    updateMember: async (id, data) => {
        return await apiService.put(`/Member/update-member/${id}`, data);
    },

    changePassword: async (data) => {
        return await apiService.post('/Member/change-password', {
            memberId: parseInt(data.memberId) || 0,
            newPassword: data.newPassword || ""
        });
    },

    changePin: async (data) => {
        return await apiService.post('/Member/change-pin', {
            memberId: parseInt(data.memberId) || 0,
            newPin: data.newPin || ""
        });
    }
};
