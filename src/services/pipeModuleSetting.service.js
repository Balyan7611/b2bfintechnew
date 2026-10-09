import { apiService } from '../api/httpClient';

export const PipeModuleSettingService = {
    // GET /PipeModuleSetting/GetPipeModuleSetting?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/PipeModuleSetting/GetPipeModuleSetting?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /PipeModuleSetting/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/PipeModuleSetting/GetByID/${id}`);
    },

    // POST /PipeModuleSetting/Create
    create: async (data) => {
        return await apiService.post('/PipeModuleSetting/Create', {
            id: data.id || 0,
            serviceId: data.serviceId ?? null,
            pipe: data.pipe ?? null,
            moduleName: data.moduleName ?? null,
            isRequired: data.isRequired === true,
            isface: data.isface === true,
            isfinger: data.isfinger === true,
            isIris: data.isIris === true,
            isOtp: data.isOtp === true,
            isTpin: data.isTpin === true,
            wadhFace: data.wadhFace ?? null,
            wadhFinger: data.wadhFinger ?? null,
            wadhIris: data.wadhIris ?? null,
        });
    },

    // PUT /PipeModuleSetting/Update
    update: async (data) => {
        return await apiService.put('/PipeModuleSetting/Update', {
            id: data.id || 0,
            serviceId: data.serviceId ?? null,
            pipe: data.pipe ?? null,
            moduleName: data.moduleName ?? null,
            isRequired: data.isRequired === true,
            isface: data.isface === true,
            isfinger: data.isfinger === true,
            isIris: data.isIris === true,
            isOtp: data.isOtp === true,
            isTpin: data.isTpin === true,
            wadhFace: data.wadhFace ?? null,
            wadhFinger: data.wadhFinger ?? null,
            wadhIris: data.wadhIris ?? null,
        });
    },

    // DELETE /PipeModuleSetting/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/PipeModuleSetting/Delete/${id}`);
    },
};
