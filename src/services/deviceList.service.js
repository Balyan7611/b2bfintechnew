import { apiService } from '../api/httpClient';

export const DeviceListService = {
    // GET /DeviceList/GetDeviceList?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/DeviceList/GetDeviceList?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /DeviceList/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/DeviceList/GetByID/${id}`);
    },

    // POST /DeviceList/Create
    create: async (data) => {
        return await apiService.post('/DeviceList/Create', {
            id: data.id || 0,
            name: data.name || '',
            package: data.package ?? null,
        });
    },

    // PUT /DeviceList/Update
    update: async (data) => {
        return await apiService.put('/DeviceList/Update', {
            id: data.id || 0,
            name: data.name || '',
            package: data.package ?? null,
        });
    },

    // DELETE /DeviceList/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/DeviceList/Delete/${id}`);
    },
};
