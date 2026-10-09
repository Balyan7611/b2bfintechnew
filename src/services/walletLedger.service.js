import { apiService } from '../api/httpClient';
import {
    WalletLedgerResponseModel,
    WalletLedgerTotalCount,
    WALLET_TYPE_ID
} from '../models/walletLedgerModel';

export const WalletLedgerService = {
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
        // A bare date (e.g. "2026-08-21") is parsed by the backend as
        // midnight — so ToDate without a time component excludes every
        // transaction from that day itself (today's records included).
        // Same fix already used in LoginHistory.jsx / CommissionLedger.jsx.
        if (fromDate) query.append('FromDate', fromDate.includes('T') ? fromDate : `${fromDate}T00:00:00`);
        if (toDate) query.append('ToDate', toDate.includes('T') ? toDate : `${toDate}T23:59:59`);

        const config = silent ? { hideLoader: true, ignoreError: true } : {};
        const res = await apiService.get(`/WalletLedger/GetWalletLedger?${query.toString()}`, config);

        return {
            items: WalletLedgerResponseModel(res),
            totalItems: WalletLedgerTotalCount(res)
        };
    },

        getMainLedger: async (params = {}) =>
        WalletLedgerService.getAll({ ...params, walletTypeId: WALLET_TYPE_ID.MAIN }),

    getAepsLedger: async (params = {}) =>
        WalletLedgerService.getAll({ ...params, walletTypeId: WALLET_TYPE_ID.AEPS }),

    // GET /WalletLedger/GetByID/{id}
    getById: async (id) => {
        return await apiService.get(`/WalletLedger/GetByID/${id}`);
    },

    // POST /WalletLedger/Create
    create: async (data) => {
        return await apiService.post('/WalletLedger/Create', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            byMsrno: data.byMsrno ?? null,
            serviceId: data.serviceId ?? null,
            operatorId: data.operatorId ?? null,
            transactionId: data.transactionId || '',
            walletTypeId: data.walletTypeId ?? null,
            openingBalance: data.openingBalance ?? null,
            amount: data.amount ?? null,
            commission: data.commission ?? null,
            surcharge: data.surcharge ?? null,
            gst: data.gst ?? null,
            tds: data.tds ?? null,
            finalAmount: data.finalAmount ?? null,
            balance: data.balance ?? null,
            factor: data.factor || '',
            narration: data.narration ?? null,
            description: data.description ?? null,
            isActive: data.isActive === true,
            isDelete: data.isDelete === true,
            isReversed: data.isReversed === true,
        });
    },

    // PUT /WalletLedger/Update
    update: async (data) => {
        return await apiService.put('/WalletLedger/Update', {
            id: data.id || 0,
            msrno: data.msrno ?? null,
            byMsrno: data.byMsrno ?? null,
            serviceId: data.serviceId ?? null,
            operatorId: data.operatorId ?? null,
            transactionId: data.transactionId || '',
            walletTypeId: data.walletTypeId ?? null,
            openingBalance: data.openingBalance ?? null,
            amount: data.amount ?? null,
            commission: data.commission ?? null,
            surcharge: data.surcharge ?? null,
            gst: data.gst ?? null,
            tds: data.tds ?? null,
            finalAmount: data.finalAmount ?? null,
            balance: data.balance ?? null,
            factor: data.factor || '',
            narration: data.narration ?? null,
            description: data.description ?? null,
            isActive: data.isActive === true,
            isDelete: data.isDelete === true,
            isReversed: data.isReversed === true,
        });
    },

    // DELETE /WalletLedger/Delete/{id}
    delete: async (id) => {
        return await apiService.delete(`/WalletLedger/Delete/${id}`);
    },
};

export { WALLET_TYPE_ID };
