import { apiService } from '../api/httpClient';

export const SectionTypeService = {
    // POST /SectionType/get-all-sectiontype?isActive=null
    getAll: async (isActive = null) => {
        return await apiService.post(`/SectionType/get-all-sectiontype?isActive=${isActive}`);
    },

    // GET /SectionType/get-sectiontype-by-id/1
    getById: async (id) => {
        return await apiService.get(`/SectionType/get-sectiontype-by-id/${id}`);
    },

    // POST /SectionType/create-sectiontype
    create: async (data) => {
        return await apiService.post('/SectionType/create-sectiontype', {
            id: data.id || 0,
            name: data.name || '',
            isActive: data.isActive === true,
        });
    },

    // PUT /SectionType/update-sectiontype/{id}
    update: async (id, data) => {
        return await apiService.put(`/SectionType/update-sectiontype/${id}`, {
            id: data.id || 0,
            name: data.name || '',
            isActive: data.isActive === true,
        });
    },
};
