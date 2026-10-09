import { apiService } from '../api/httpClient';

export const CommissionLedgerService = {
    // GET /CommissionLedger/GetCommissionLedger?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/CommissionLedger/GetCommissionLedger?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /CommissionLedger/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/CommissionLedger/GetByID/${id}`);
    },
};
