import { apiService } from '../api/httpClient';

export const MemberBankDetailService = {
    // GET /MemberBankDetail/GetMemberBankDetail?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/MemberBankDetail/GetMemberBankDetail?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /MemberBankDetail/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/MemberBankDetail/GetByID/${id}`);
    },

    // POST /MemberBankDetail/Create
    create: async (data) => {
        return await apiService.post('/MemberBankDetail/Create', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            bankId: data.bankId ?? null,
            name: data.name ?? null,
            ifsccode: data.ifsccode ?? null,
            accountNumber: data.accountNumber ?? null,
            accountHolderName: data.accountHolderName ?? null,
            branchName: data.branchName ?? null,
            isActive: data.isActive === true,
            isDelete: data.isDelete ?? false,
            documentVerify: data.documentVerify ?? false,
            beneId: data.beneId ?? null,
            result: data.result ?? null,
            document: data.document ?? null,
        });
    },

    // PUT /MemberBankDetail/Update
    update: async (data) => {
        return await apiService.put('/MemberBankDetail/Update', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            bankId: data.bankId ?? null,
            name: data.name ?? null,
            ifsccode: data.ifsccode ?? null,
            accountNumber: data.accountNumber ?? null,
            accountHolderName: data.accountHolderName ?? null,
            branchName: data.branchName ?? null,
            isActive: data.isActive === true,
            isDelete: data.isDelete ?? false,
            documentVerify: data.documentVerify ?? false,
            beneId: data.beneId ?? null,
            result: data.result ?? null,
            document: data.document ?? null,
        });
    },

    // DELETE /MemberBankDetail/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/MemberBankDetail/Delete/${id}`);
    },
};
