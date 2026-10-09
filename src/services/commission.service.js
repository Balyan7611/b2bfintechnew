import { apiService } from '../api/httpClient';

export const CommissionService = {
    // GET /Commission/GetRoles
    getRoles: async () => {
        return await apiService.get('/Commission/GetRoles');
    },

    // GET /Commission/GetDynamicMatrix?packageId=1&serviceId=1&opId=1
    getDynamicMatrix: async (params = {}) => {
        const { packageId, serviceId, opId } = params;
        return await apiService.get(
            `/Commission/GetDynamicMatrix?packageId=${packageId}&serviceId=${serviceId}&opId=${opId}`
        );
    },

    // POST /Commission/SaveDynamicMatrix
    saveDynamicMatrix: async (data) => {
        return await apiService.post('/Commission/SaveDynamicMatrix', {
            packageId: data.packageId || null,
            serviceId: data.serviceId || null,
            opId: data.opId || null,
            levels: Array.isArray(data.levels) ? data.levels : [],
            slabs: Array.isArray(data.slabs) ? data.slabs.map(slab => ({
                id: slab.id || 0,
                startVal: slab.startVal ?? null,
                endVal: slab.endVal ?? null,
                slabSurcharge: slab.slabSurcharge ? {
                    id: slab.slabSurcharge.id || 0,
                    isComSur: slab.slabSurcharge.isComSur === true,
                    isPF: slab.slabSurcharge.isPF === true,
                    sc: slab.slabSurcharge.sc ?? null,
                } : null,
                values: Array.isArray(slab.values) ? slab.values.map(v => ({
                    id: v.id || 0,
                    isComSur: v.isComSur === true,
                    isPF: v.isPF === true,
                    sc: v.sc ?? null,
                })) : [],
            })) : [],
        });
    },

    // POST /Commission/GetCommissionReport
    getCommissionReport: async (params = {}) => {
        return await apiService.post('/Commission/GetCommissionReport', {
            pageNumber: params.pageNumber || 1,
            pageSize: params.pageSize || 100,
            packageId: params.packageId ?? null,
            serviceId: params.serviceId ?? null,
            opId: params.opId ?? null,
            searchQuery: params.searchQuery ?? null,
        });
    },

    // POST /Commission/ToggleActive/1
    toggleActive: async (id) => {
        return await apiService.post(`/Commission/ToggleActive/${id}`);
    },

    // DELETE /Commission/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/Commission/Delete/${id}`);
    },
};
