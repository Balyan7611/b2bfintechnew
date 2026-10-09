import { apiService } from '../api/httpClient';

export const CompanyBankDetailService = {
    // GET /CompanyBankDetail/GetCompanyBankDetail?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/CompanyBankDetail/GetCompanyBankDetail?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /CompanyBankDetail/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/CompanyBankDetail/GetByID/${id}`);
    },

    // POST /CompanyBankDetail/Create
    create: async (data) => {
        return await apiService.post('/CompanyBankDetail/Create', {
            id: data.id || 0,
            msrno: data.msrno || null,
            bankid: data.bankid || null,
            companyMemberId: data.companyMemberId ?? null,
            bankName: data.bankName ?? null,
            branchName: data.branchName ?? null,
            accountHolderName: data.accountHolderName ?? null,
            accountNumber: data.accountNumber ?? null,
            ifsccode: data.ifsccode ?? null,
            billinginfo: data.billinginfo ?? null,
            cashdepositecharge: data.cashdepositecharge ?? null,
            qrlogo: data.qrlogo ?? null,
            banklogo: data.banklogo ?? null,
            isActive: data.isActive === true,
            isDelete: data.isDelete === true,
        });
    },

    // PUT /CompanyBankDetail/Update
    update: async (data) => {
        return await apiService.put('/CompanyBankDetail/Update', {
            id: data.id || 0,
            msrno: data.msrno || null,
            bankid: data.bankid || null,
            companyMemberId: data.companyMemberId ?? null,
            bankName: data.bankName ?? null,
            branchName: data.branchName ?? null,
            accountHolderName: data.accountHolderName ?? null,
            accountNumber: data.accountNumber ?? null,
            ifsccode: data.ifsccode ?? null,
            billinginfo: data.billinginfo ?? null,
            cashdepositecharge: data.cashdepositecharge ?? null,
            qrlogo: data.qrlogo ?? null,
            banklogo: data.banklogo ?? null,
            isActive: data.isActive === true,
            isDelete: data.isDelete === true,
        });
    },

    // DELETE /CompanyBankDetail/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/CompanyBankDetail/Delete/${id}`);
    },
};
