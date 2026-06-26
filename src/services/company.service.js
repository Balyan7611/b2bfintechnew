import { apiService } from '../api/httpClient';
import { CompanyResponseModel } from '../models/companyModel';

export const CompanyService = {

    getCompanyDetails: async (url) => {
        const response = await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
        const mapped = CompanyResponseModel(response);
        return mapped.length > 0 ? mapped[0] : null;
    },

    fetchCompanyData: async (url) => {
        try {
            const res = await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
            if (res && res.status === true && res.data) {
                const items = Array.isArray(res.data) ? res.data : [res.data];
                if (items.length > 0) return items[0];
            }
            const allRes = await apiService.get('/Company/get-all?PageNumber=1&PageSize=10000');
            if (allRes && allRes.status === true && Array.isArray(allRes.data) && allRes.data.length > 0) {
                return allRes.data[0];
            }
            return null;
        } catch (err) {
            console.error('Company fetch error:', err);
            try {
                const allRes = await apiService.get('/Company/get-all?PageNumber=1&PageSize=10000');
                if (allRes && allRes.status === true && Array.isArray(allRes.data) && allRes.data.length > 0) {
                    return allRes.data[0];
                }
            } catch (_) {}
            return null;
        }
    },

    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 10000;
        const fromDate = params.fromDate || '';
        const toDate = params.toDate || '';
        const status = params.status || '';
        const memberId = params.memberId || 0;
        return await apiService.get(`/Company/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberId}`);
    },

    getByMember: async (memberId) => {
        return await apiService.get(`/Company/get-by-member/${memberId}`);
    },

    getById: async (id) => {
        const res = await apiService.get(`/Company/get-by-id/${id}`);
        return CompanyResponseModel(res);
    },

    // POST multipart/form-data → /api/Company/create
    create: async (formData) => {
        return await apiService.post('/Company/create', formData);
    },

    // POST multipart/form-data → /api/Company/update
    update: async (formData) => {
        return await apiService.post('/Company/update', formData);
    },

    delete: async (id) => {
        return await apiService.delete(`/Company/delete/${id}`);
    },

    toggleStatus: async (id) => {
        return await apiService.patch(`/Company/toggle-status/${id}`, {});
    }
};