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
            const res = await apiService.get(`/Company/get-by-url?url=${encodeURIComponent(url)}`);
            if (!res.status) throw new Error("Branding fetch failed");
            const mapped = CompanyResponseModel(res);
            if (mapped.length > 0) {
                return mapped[0];
            }
            return null;
        } catch (err) {
            console.error("Company fetch error:", err);
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