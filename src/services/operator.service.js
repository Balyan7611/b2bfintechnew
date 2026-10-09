import { apiService } from '../api/httpClient';

export const OperatorService = {
    // POST /Operator/Alloperator
    getAll: async (params = {}) => {
        return await apiService.post('/Operator/Alloperator', {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 100,
            fromDate: params.fromDate ?? null,
            toDate: params.toDate ?? null,
            status: params.status ?? null,
            memberID: params.memberID ?? null,
            walletTypeId: params.walletTypeId ?? null,
        });
    },

    // GET /Operator/1
    getById: async (id) => {
        return await apiService.get(`/Operator/${id}`);
    },

    // POST /Operator/create  (multipart/form-data)
    create: async (data) => {
        const formData = new FormData();
        formData.append('Id', data.Id ?? 0);
        formData.append('ServiceId', data.ServiceId ?? '');
        formData.append('OperatorCode', data.OperatorCode ?? '');
        formData.append('Name', data.Name ?? '');
        if (data.File) formData.append('File', data.File);
        formData.append('MinVal', data.MinVal ?? '');
        formData.append('MaxVal', data.MaxVal ?? '');
        formData.append('Commission', data.Commission ?? '');
        formData.append('IsActive', data.IsActive === true ? 'true' : 'false');
        formData.append('IsPending', data.IsPending === true ? 'true' : 'false');
        formData.append('IsOffLine', data.IsOffLine === true ? 'true' : 'false');
        return await apiService.postForm('/Operator/create', formData);
    },

    // PUT /Operator/update  (multipart/form-data)
    update: async (data) => {
        const formData = new FormData();
        formData.append('Id', data.Id ?? 0);
        formData.append('ServiceId', data.ServiceId ?? '');
        formData.append('OperatorCode', data.OperatorCode ?? '');
        formData.append('Name', data.Name ?? '');
        if (data.File) formData.append('File', data.File);
        formData.append('MinVal', data.MinVal ?? '');
        formData.append('MaxVal', data.MaxVal ?? '');
        formData.append('Commission', data.Commission ?? '');
        formData.append('IsActive', data.IsActive === true ? 'true' : 'false');
        formData.append('IsPending', data.IsPending === true ? 'true' : 'false');
        formData.append('IsOffLine', data.IsOffLine === true ? 'true' : 'false');
        return await apiService.putForm('/Operator/update', formData);
    },

    // POST /Operator/import-csv
    importCsv: async (file) => {
        const formData = new FormData();
        if (file) formData.append('File', file);
        return await apiService.postForm('/Operator/import-csv', formData);
    },
};
