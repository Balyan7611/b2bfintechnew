import { apiService } from '../api/httpClient';
import { CompanyRequestModel, CompanyResponseModel } from '../models/companyModel';

export const CompanyService = {
    getCompanyDetails: async (url) => {
        const response = await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
        const mapped = CompanyResponseModel(response);
        return mapped.length > 0 ? mapped[0] : null;
    },

    fetchCompanyData: async (url) => {
        try {
            // Try get-by-url first; returns raw item (all fields) for updateSiteConfig
            const res = await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
            if (res && res.status === true && res.data) {
                const items = Array.isArray(res.data) ? res.data : [res.data];
                if (items.length > 0) return items[0]; // raw item — all 30+ fields
            }
            // Fallback: load first company from get-all
            const allRes = await apiService.get('/Company/get-all');
            if (allRes && allRes.status === true && Array.isArray(allRes.data) && allRes.data.length > 0) {
                return allRes.data[0]; // raw item — all 30+ fields
            }
            return null;
        } catch (err) {
            console.error("Company fetch error:", err);
            // Last resort fallback
            try {
                const allRes = await apiService.get('/Company/get-all');
                if (allRes && allRes.status === true && Array.isArray(allRes.data) && allRes.data.length > 0) {
                    return allRes.data[0];
                }
            } catch (_) {}
            return null;
        }
    },

    // Standard CRUD
    getAll: async () => {
        return await apiService.get('/Company/get-all');
    },
    getById: async (id) => {
        const res = await apiService.get(`/Company/get-by-id/${id}`);
        return CompanyResponseModel(res);
    },
    create: async (formData) => {
        return await apiService.post('/Company', formData);
    },
    update: async (formData) => {
        return await apiService.put('/Company', formData);
    },
    delete: async (id) => {
        return await apiService.delete(`/Company/delete/${id}`);
    },
    toggleStatus: async (id) => {
        return await apiService.patch(`/Company/toggle-status/${id}`, {});
    }
};