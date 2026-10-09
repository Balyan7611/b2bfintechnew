import { apiService } from '../api/httpClient';

export const ApiSwitchingConceptService = {
    // POST /APISwitchingConcept/GetAll
    getAll: async (params = {}) => {
        const {
            pageNumber = 1,
            pageSize = 5000,
            fromDate = null,
            toDate = null,
            status = null,
            memberID = null,
            walletTypeId = null,
        } = params;
        return await apiService.post('/APISwitchingConcept/GetAll', {
            pageNumber,
            pageSize,
            fromDate,
            toDate,
            status,
            memberID,
            walletTypeId,
        });
    },

    // GET /APISwitchingConcept/GetById/1
    getById: async (id) => {
        return await apiService.get(`/APISwitchingConcept/GetById/${id}`);
    },

    // GET /APISwitchingConcept/GetByOperator/1
    getByOperator: async (opId) => {
        return await apiService.get(`/APISwitchingConcept/GetByOperator/${opId}`);
    },

    // POST /APISwitchingConcept/Create
    create: async (data) => {
        return await apiService.post('/APISwitchingConcept/Create', {
            id: data.id || 0,
            opId: data.opId || null,
            startVal: data.startVal ?? null,
            endVal: data.endVal ?? null,
            activeApi: data.activeApi || null,
            activeAmount: data.activeAmount ?? null,
            msrno: data.msrno ?? null,
            packageId: data.packageId ?? null,
            multipleSwitch: data.multipleSwitch ?? null,
            switchType: data.switchType ?? null,
            empId: data.empId ?? null,
            slab: data.slab ?? null,
            billFetch: data.billFetch ?? null,
            blockSlab: data.blockSlab ?? null,
        });
    },

    // PUT /APISwitchingConcept/Update
    update: async (data) => {
        return await apiService.put('/APISwitchingConcept/Update', {
            id: data.id || 0,
            opId: data.opId || null,
            startVal: data.startVal ?? null,
            endVal: data.endVal ?? null,
            activeApi: data.activeApi || null,
            activeAmount: data.activeAmount ?? null,
            msrno: data.msrno ?? null,
            packageId: data.packageId ?? null,
            multipleSwitch: data.multipleSwitch ?? null,
            switchType: data.switchType ?? null,
            empId: data.empId ?? null,
            slab: data.slab ?? null,
            billFetch: data.billFetch ?? null,
            blockSlab: data.blockSlab ?? null,
        });
    },

    // DELETE /APISwitchingConcept/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/APISwitchingConcept/Delete/${id}`);
    },
};
