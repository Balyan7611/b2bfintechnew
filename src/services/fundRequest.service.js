import { apiService } from '../api/httpClient';
import {
    FundRequestRequestModel,
    FundRequestResponseModel,
    FUND_REQUEST_STATUS
} from '../models/fundRequestModel';

export const FundRequestService = {
    // Member submits a top-up request after transferring to a company bank.
    create: async (data) => {
        const payload = FundRequestRequestModel({
            ...data,
            status: FUND_REQUEST_STATUS.PENDING,
            isApprove: false,
            isDelete: false
        });
        return await apiService.post('/FundRequest/Create', payload);
    },

    update: async (data) => {
        return await apiService.put('/FundRequest/Update', FundRequestRequestModel(data));
    },

    getById: async (id) => {
        const res = await apiService.get(`/FundRequest/GetByID/${id}`);
        return FundRequestResponseModel(res)[0] || null;
    },

    delete: async (id) => {
        return await apiService.delete(`/FundRequest/Delete/${id}`);
    },

    // Returns a normalised array. The server-side filters are applied when
    // supplied, but callers that care about a single member should still verify
    // msrno themselves via getMine() below.
    getAll: async ({ pageNumber = 1, pageSize = 100, fromDate = '', toDate = '', status = '', memberId = '', silent = false } = {}) => {
        let url = `/FundRequest/GetFundRequest?PageNumber=${pageNumber}&PageSize=${pageSize}`;
        if (fromDate) url += `&FromDate=${encodeURIComponent(fromDate)}`;
        if (toDate) url += `&ToDate=${encodeURIComponent(toDate)}`;
        if (status) url += `&Status=${encodeURIComponent(status)}`;
        if (memberId) url += `&MemberID=${encodeURIComponent(memberId)}`;

        const config = silent ? { hideLoader: true, ignoreError: true } : {};
        const res = await apiService.get(url, config);
        return FundRequestResponseModel(res);
    },

    // One member's own requests, verified client-side so a server that ignores
    // the MemberID filter can't leak another member's rows into the panel.
    getMine: async (memberId, params = {}) => {
        if (!memberId) return [];
        const rows = await FundRequestService.getAll({ pageSize: 500, memberId, ...params });
        const mine = rows.filter(r => Number(r.msrno) === Number(memberId));
        if (rows.length && !mine.length) {
            console.warn('[fundRequest] server returned', rows.length,
                'row(s) but none matched msrno', memberId);
        }
        return mine;
    },

    // Admin: mark a request approved. Crediting the wallet is a separate call
    // (UserWalletBalance/Transfer) — see approveAndCredit in the admin page.
    approve: async (request, { remark = '' } = {}) => {
        return await FundRequestService.update({
            ...request,
            status: FUND_REQUEST_STATUS.APPROVE,
            isApprove: true,
            approveDate: new Date().toISOString().slice(0, 19),
            remark: remark || request.remark || 'Payment verified and approved'
        });
    },

    // Backend expects status "Rejected" (not "Reject") and carries the
    // rejection cause in its own `reason` field alongside `remark`.
    reject: async (request, reason = '') => {
        return await FundRequestService.update({
            ...request,
            status: FUND_REQUEST_STATUS.REJECTED,
            isApprove: false,
            reason: reason || 'Payment not received',
            remark: 'Rejected by admin'
        });
    }
};
