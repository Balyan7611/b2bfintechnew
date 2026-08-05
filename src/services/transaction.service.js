import { apiService } from '../api/httpClient';

export const TransactionService = {
  // get-all endpoint for general transaction reports
  getAll: async ({ pageNumber = 1, pageSize = 10, fromDate = '', toDate = '', serviceId = '', sectionType = '', operatorId = '', apiId = '', memberId = '', status = '' }) => {
    const params = new URLSearchParams({
      PageNumber: pageNumber,
      PageSize: pageSize,
    });
    if (fromDate)    params.append('FromDate',    fromDate);
    if (toDate)      params.append('ToDate',      toDate);
    if (serviceId)   params.append('ServiceId',   serviceId);
    if (sectionType) params.append('SectionType', sectionType);
    if (operatorId)  params.append('OperatorId',  operatorId);
    if (apiId)       params.append('ApiId',       apiId);
    if (memberId)    params.append('MemberId',    memberId);
    if (status)      params.append('Status',      status);
    return await apiService.get(`/Transaction/get-all?${params.toString()}`);
  },
  search: async ({ searchTerm = '', pageNumber = 1, pageSize = 10 }) => {
    const query = `?searchTerm=${encodeURIComponent(searchTerm)}&PageNumber=${pageNumber}&PageSize=${pageSize}`;
    return await apiService.get(`/Transaction/search${query}`);
  }
};
