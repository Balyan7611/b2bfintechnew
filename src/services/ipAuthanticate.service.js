import { apiService } from '../api/httpClient';

export const IpAuthanticateService = {
    // GET /IpAuthanticate/GetAll?Search=&IsActive=true&UserId=1&Msrno=1&PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const search = params.search ?? '';
        const isActive = params.isActive ?? '';
        const userId = params.userId ?? '';
        const msrno = params.msrno ?? '';
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/IpAuthanticate/GetAll?Search=${encodeURIComponent(search)}&IsActive=${isActive}&UserId=${userId}&Msrno=${msrno}&PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /IpAuthanticate/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/IpAuthanticate/GetByID/${id}`);
    },

    // POST /IpAuthanticate/Create
    create: async (data) => {
        return await apiService.post('/IpAuthanticate/Create', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            ip: data.ip || '',
            token: data.token ?? null,
            isActive: data.isActive === true,
            userId: data.userId ?? null,
        });
    },

    // PUT /IpAuthanticate/Update
    update: async (data) => {
        return await apiService.put('/IpAuthanticate/Update', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            ip: data.ip || '',
            token: data.token ?? null,
            isActive: data.isActive === true,
            userId: data.userId ?? null,
        });
    },

    // DELETE /IpAuthanticate/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/IpAuthanticate/Delete/${id}`);
    },

    // POST /IpAuthanticate/SendIpWhitelistOtp
    sendIpWhitelistOtp: async (data) => {
        return await apiService.post('/IpAuthanticate/SendIpWhitelistOtp', {
            userId: data.userId || null,
            ip: data.ip || '',
        });
    },

    // POST /IpAuthanticate/VerifyAndWhitelistIp
    verifyAndWhitelistIp: async (data) => {
        return await apiService.post('/IpAuthanticate/VerifyAndWhitelistIp', {
            token: data.token || '',
            otp: data.otp || '',
            ip: data.ip || '',
            userId: data.userId || null,
        });
    },
};
