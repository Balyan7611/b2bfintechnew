import { apiService } from '../api/httpClient';

export const CountryService = {
    // GET /Country/GetCountry?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Country/GetCountry?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Country/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/Country/GetByID/${id}`);
    },

    // POST /Country/Create
    create: async (data) => {
        return await apiService.post('/Country/Create', {
            id: data.id || 0,
            name: data.name || '',
            isDelete: data.isDelete === true,
            isActive: data.isActive === true,
        });
    },

    // PUT /Country/Update
    update: async (data) => {
        return await apiService.put('/Country/Update', {
            id: data.id || 0,
            name: data.name || '',
            isDelete: data.isDelete === true,
            isActive: data.isActive === true,
        });
    },

    // DELETE /Country/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/Country/Delete/${id}`);
    },
};
