import { apiService } from '../api/httpClient';
import {
    WalletLedgerResponseModel,
    WalletLedgerTotalCount,
    WALLET_TYPE_ID
} from '../models/walletLedgerModel';

export const WalletLedgerService = {
    // Raw paginated fetch. Returns { items, totalItems }.
    getAll: async ({
        memberId,
        walletTypeId = WALLET_TYPE_ID.MAIN,
        pageNumber = 1,
        pageSize = 100,
        fromDate = '',
        toDate = '',
        silent = false
    } = {}) => {
        const query = new URLSearchParams({
            WalletTypeId: walletTypeId,
            PageNumber: pageNumber,
            PageSize: pageSize
        });
        if (memberId) query.append('MemberID', memberId);
        if (fromDate) query.append('FromDate', fromDate);
        if (toDate) query.append('ToDate', toDate);

        const config = silent ? { hideLoader: true, ignoreError: true } : {};
        const res = await apiService.get(`/WalletLedger/GetWalletLedger?${query.toString()}`, config);

        return {
            items: WalletLedgerResponseModel(res),
            totalItems: WalletLedgerTotalCount(res)
        };
    },

    // Convenience wrappers so screens don't have to remember the type ids.
    getMainLedger: async (params = {}) =>
        WalletLedgerService.getAll({ ...params, walletTypeId: WALLET_TYPE_ID.MAIN }),

    getAepsLedger: async (params = {}) =>
        WalletLedgerService.getAll({ ...params, walletTypeId: WALLET_TYPE_ID.AEPS })
};

export { WALLET_TYPE_ID };
