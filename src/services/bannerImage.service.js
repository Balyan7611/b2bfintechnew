import { apiService } from '../api/httpClient';

export const BannerImageService = {
    // GET /api/BannerImage/get-all
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber || 1;
        const pageSize = params.pageSize || 1000;
        const fromDate = params.fromDate || '';
        const toDate = params.toDate || '';
        const status = params.status !== undefined ? params.status : '';
        const memberId = params.memberId || 1;
        return await apiService.get(`/BannerImage/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${encodeURIComponent(fromDate)}&ToDate=${encodeURIComponent(toDate)}&Status=${encodeURIComponent(status)}&MemberID=${memberId}`);
    },

    // GET /api/BannerImage/get-by-id/{id}
    getById: async (id) => {
        return await apiService.get(`/BannerImage/get-by-id/${id}`);
    },

    // POST /api/BannerImage/create
    // FormData: BannerTypeId (string/number), FileImage (file object)
    create: async (formData) => {
        return await apiService.post('/BannerImage/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // POST /api/BannerImage/update
    // FormData: Id, BannerTypeId, FileImage (optional if not changing image)
    update: async (formData) => {
        return await apiService.post('/BannerImage/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // DELETE /api/BannerImage/delete/{id}
    delete: async (id) => {
        return await apiService.delete(`/BannerImage/delete/${id}`);
    },

    // PATCH /api/BannerImage/toggle-status/{id}
    toggleStatus: async (id) => {
        return await apiService.patch(`/BannerImage/toggle-status/${id}`);
    }
};
