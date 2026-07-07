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
        if (search && search.trim() !== '') {
            try {
                let searchedMembers = await MemberService.searchMember(search.trim());
                
                if (roleId && roleId !== "0" && roleId !== 0) {
                    const targetRole = parseInt(roleId);
                    searchedMembers = searchedMembers.filter(m => {
                        const rId = m.roleId || m.roleID || m.RoleID || m.role_id;
                        if (!rId) return true; // Safety check: if raw search response lacks role ID, don't filter it out
                        return parseInt(rId) === targetRole;
                    });
                }
                
                return {
                    status: true,
                    data: {
                        items: searchedMembers,
                        totalItems: searchedMembers.length,
                        pageNumber: 1,
                        pageSize: searchedMembers.length || 10,
                        totalPageNumber: 1
                    }
                };
            } catch (err) {
                console.error("Error in fallback search:", err);
            }
        }

        const payload = {
            pageNumber,
            pageSize,
            roleId: roleId ? parseInt(roleId) : 0,
            search: search || '',
        };
        if (isActive !== null) payload.isActive = isActive;
        if (isKycApproved !== null) payload.isKycApproved = isKycApproved;
        if (fromDate) payload.fromDate = fromDate;
        if (toDate) payload.toDate = toDate;
        
        return await apiService.post('/Member/get-all-members', payload);
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
