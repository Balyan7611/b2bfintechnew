import { apiService } from '../api/httpClient';
import { MemberRequestModel } from '../models/memberModel';
import { MemberSearchResponseModel } from '../models/memberSearchModel';

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

export const MemberService = {
    getById: async (id) => {
        return await apiService.get(`/Member/get-member-by-id/${id}`);
    },

                getByIdRaw: async (id) => {
        return await apiService.get(`/Member/GetByID/${id}`, getAuthConfig({ hideLoader: true, ignoreError: true }));
    },

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

        getAll: async ({ pageNumber = 1, pageSize = 10, search = '', roleId = 0, isActive = null, isKycApproved = null, fromDate = '', toDate = '' } = {}) => {
        if (search && search.trim() !== '') {
            try {
                let searchedMembers = await MemberService.searchMember(search.trim());
                
                if (roleId && roleId !== "0" && roleId !== 0) {
                    const targetRole = parseInt(roleId);
                    searchedMembers = searchedMembers.filter(m => {
                        const rId = m.roleId || m.roleID || m.RoleID || m.role_id;
                        if (!rId) return true;                         return parseInt(rId) === targetRole;
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
        
        const res = await apiService.post('/Member/get-all-members', payload);
        if (res?.data?.items && Array.isArray(res.data.items)) {
            res.data.items = MemberSearchResponseModel({ data: res.data.items });
        }
        return res;
    },

    updateMember: async (id, data) => {
        return await apiService.put(`/Member/update-member/${id}`, data);
    },

    resetLocationHistory: async (memberId) => {
        return await apiService.post(`/Member/reset-location-history/${memberId}`, {});
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
