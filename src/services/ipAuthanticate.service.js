import { apiService } from '../api/httpClient';

export const IpAuthanticateService = {
  getAll: async (params = {}) => {
    const search = params.search !== undefined ? params.search : '';
    const isActive = params.isActive !== undefined ? params.isActive : '';
    const userId = params.userId !== undefined ? params.userId : '';
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 1000;

    let url = `/IpAuthanticate/GetAll?Search=${encodeURIComponent(search)}&PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (isActive !== '' && isActive !== null && isActive !== undefined) {
      url += `&IsActive=${isActive}`;
    }
    if (userId) {
      url += `&UserId=${userId}`;
    }
    return await apiService.get(url);
  },

  getById: async (id) => {
    return await apiService.get(`/IpAuthanticate/GetByID/${id}`);
  },

  create: async (data) => {
    return await apiService.post('/IpAuthanticate/Create', data);
  },

  update: async (data) => {
    return await apiService.put('/IpAuthanticate/Update', data);
  },

  delete: async (id) => {
    return await apiService.delete(`/IpAuthanticate/Delete/${id}`);
  },

  sendIpWhitelistOtp: async (data) => {
    return await apiService.post('/IpAuthanticate/SendIpWhitelistOtp', data);
  },

  verifyAndWhitelistIp: async (data) => {
    return await apiService.post('/IpAuthanticate/VerifyAndWhitelistIp', data);
  }
};

