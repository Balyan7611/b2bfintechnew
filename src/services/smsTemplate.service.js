import { apiService } from '../api/httpClient';

export const SmsTemplateService = {
    getAll: async (params = {}) => {
        const queryParams = [];
        const pageNumber = params.pageNumber || params.PageNumber || 1;
        const pageSize = params.pageSize || params.PageSize || 10000;
        
        queryParams.push(`PageNumber=${pageNumber}`);
        queryParams.push(`PageSize=${pageSize}`);
        
        const fromDate = params.fromDate || params.FromDate;
        if (fromDate) queryParams.push(`FromDate=${encodeURIComponent(fromDate)}`);
        
        const toDate = params.toDate || params.ToDate;
        if (toDate) queryParams.push(`ToDate=${encodeURIComponent(toDate)}`);
        
        const status = params.status || params.Status;
        if (status) queryParams.push(`Status=${encodeURIComponent(status)}`);
        
        const memberID = params.memberID || params.MemberID;
        if (memberID) queryParams.push(`MemberID=${encodeURIComponent(memberID)}`);
        
        const queryString = queryParams.join('&');
        return await apiService.get(`/Smstemplate/GetSmstemplate?${queryString}`);
    },
    
    getById: async (id) => {
        return await apiService.get(`/Smstemplate/GetByID/${id}`);
    },
    
    create: async (data) => {
        return await apiService.post('/Smstemplate/Create', data);
    },
    
    update: async (data) => {
        return await apiService.put('/Smstemplate/Update', data);
    },

    delete: async (id) => {
        return await apiService.delete(`/Smstemplate/Delete/${id}`);
    }
};
