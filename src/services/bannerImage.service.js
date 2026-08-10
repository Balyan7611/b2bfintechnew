import { apiService } from '../api/httpClient';

export const BannerImageService = {
        getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 1000;
        const fromDate = params.fromDate || '';
        const toDate = params.toDate || '';
        const status = params.status !== undefined ? params.status : '';
        const memberId = params.memberId || 1;
        return await apiService.get(`/BannerImage/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(toDate)}&Status=${encodeURIComponent(status)}&MemberID=${memberId}`);
    },

        getById: async (id) => {
        return await apiService.get(`/BannerImage/get-by-id/${id}`);
    },

            create: async (formData) => {
        return await apiService.post('/BannerImage/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

            update: async (formData) => {
        return await apiService.post('/BannerImage/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

        delete: async (id) => {
        return await apiService.delete(`/BannerImage/delete/${id}`);
    },

        toggleStatus: async (id) => {
        return await apiService.patch(`/BannerImage/toggle-status/${id}`);
    }
};
