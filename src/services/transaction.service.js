import { apiService } from '../api/httpClient';

export const TransactionService = {
  // get-all endpoint for general transaction reports
  getAll: async ({ pageNumber = 1, pageSize = 10, fromDate = '', toDate = '', serviceId = '', operatorId = '', apiId = '', memberId = '', status = '' }) => {
    const query = `?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&ServiceId=${serviceId}&OperatorId=${operatorId}&ApiId=${apiId}&MemberId=${memberId}&Status=${status}`;
    return await apiService.get(`/Transaction/get-all${query}`);
  },
  search: async ({ searchTerm = '', pageNumber = 1, pageSize = 10 }) => {
    const query = `?searchTerm=${encodeURIComponent(searchTerm)}&PageNumber=${pageNumber}&PageSize=${pageSize}`;
    return await apiService.get(`/Transaction/search${query}`);
  }
};
