// src/services/kycDocument.service.js
import { apiService } from '../api/httpClient';
import { 
  KycdocumentsMasterResponseModel, 
  KycdocumentsMasterRequestModel 
} from '../models/apiModels';

export const KycDocumentService = {
  getKycdocumentsMaster: async (params = {}) => {
    try {
      const { 
        PageNumber = 1, 
        PageSize = 10, 
        FromDate = '', 
        ToDate = '', 
        Status = '', 
        MemberID = '' 
      } = params;

      const queryParams = new URLSearchParams({
        PageNumber,
        PageSize,
        FromDate,
        ToDate,
        Status,
        MemberID
      }).toString();

      const response = await apiService.get(`/KycdocumentsMaster/GetKycdocumentsMaster?${queryParams}`);
      if (response && response.status && response.data) {
        response.data.items = KycdocumentsMasterResponseModel(response);
      }
      return response;
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/KycdocumentsMaster/GetByID/${id}`);
      if (response && response.status && response.data) {
        const mapped = KycdocumentsMasterResponseModel(response);
        response.data = mapped.length ? mapped[0] : null;
      }
      return response;
    } catch (error) {
      console.error(`Error fetching KYC document by ID (${id}):`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const payload = KycdocumentsMasterRequestModel(data);
      const response = await apiService.post('/KycdocumentsMaster/Create', payload);
      return response;
    } catch (error) {
      console.error('Error creating KYC document:', error);
      throw error;
    }
  },

  update: async (data) => {
    try {
      const payload = KycdocumentsMasterRequestModel(data);
      const response = await apiService.put('/KycdocumentsMaster/Update', payload);
      return response;
    } catch (error) {
      console.error('Error updating KYC document:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/KycdocumentsMaster/Delete/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting KYC document (${id}):`, error);
      throw error;
    }
  }
};
