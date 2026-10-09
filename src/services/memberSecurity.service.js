import { apiService } from '../api/httpClient';

export const MemberSecurityService = {
    // GET /MemberSecurity/GetMemberSecurity?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/MemberSecurity/GetMemberSecurity?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /MemberSecurity/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/MemberSecurity/GetByID/${id}`);
    },

    // POST /MemberSecurity/Create
    create: async (data) => {
        return await apiService.post('/MemberSecurity/Create', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            twoWay: data.twoWay === true,
            isOtp: data.isOtp === true,
            isTpin: data.isTpin === true,
            isPattern: data.isPattern === true,
            isGoogleAuth: data.isGoogleAuth === true,
            authKey: data.authKey ?? null,
            isSeparateProfitWallet: data.isSeparateProfitWallet === true,
        });
    },

    // PUT /MemberSecurity/Update
    update: async (data) => {
        return await apiService.put('/MemberSecurity/Update', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            twoWay: data.twoWay === true,
            isOtp: data.isOtp === true,
            isTpin: data.isTpin === true,
            isPattern: data.isPattern === true,
            isGoogleAuth: data.isGoogleAuth === true,
            authKey: data.authKey ?? null,
            isSeparateProfitWallet: data.isSeparateProfitWallet === true,
        });
    },

    // DELETE /MemberSecurity/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/MemberSecurity/Delete/${id}`);
    },
};
