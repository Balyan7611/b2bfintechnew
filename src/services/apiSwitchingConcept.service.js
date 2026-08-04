import { apiService } from '../api/httpClient';

export const ApiSwitchingConceptService = {
  create: async (data) => {
    return await apiService.post('/APISwitchingConcept/Create', data);
  },
  
  getAll: async ({ pageNumber = 1, pageSize = 5000 } = {}) => {
    return await apiService.post('/APISwitchingConcept/GetAll', {
      pageNumber,
      pageSize
    });
  },

  getByOperator: async (opId) => {
    return await apiService.get(`/APISwitchingConcept/GetByOperator/${opId}`);
  },

  getById: async (id) => {
    return await apiService.get(`/APISwitchingConcept/GetById/${id}`);
  },

  update: async (data) => {
    return await apiService.put('/APISwitchingConcept/Update', data);
  },

  delete: async (id) => {
    return await apiService.delete(`/APISwitchingConcept/Delete/${id}`);
  }
};
