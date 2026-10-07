import { apiService } from '../api/httpClient';
import {
    FundRequestRequestModel,
    FundRequestResponseModel,
    FUND_REQUEST_STATUS
} from '../models/fundRequestModel';

export const FundRequestService = {
                create: async (data) => {
        if (data instanceof FormData) {
            return await apiService.postForm('/FundRequest/Create', data);
        }

        const file = data.slipFile || data.CashslipFile || data.cashslipFile || (data.cashslip instanceof File || data.cashslip instanceof Blob ? data.cashslip : null);

        if (file instanceof File || file instanceof Blob) {
            const formData = new FormData();
            const model = FundRequestRequestModel({
                ...data,
                status: data.status || FUND_REQUEST_STATUS.PENDING,
                isApprove: false,
                isDelete: false
            });

            Object.keys(model).forEach(key => {
                if (model[key] !== undefined && model[key] !== null) {
                    // Send PascalCase key for .NET model binder
                    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                    formData.append(pascalKey, model[key]);
                }
            });

            // Only 'CashslipFile' key — as per backend curl spec
            formData.append('CashslipFile', file);

            return await apiService.postForm('/FundRequest/Create', formData);
        }

        const payload = FundRequestRequestModel({
            ...data,
            status: data.status || FUND_REQUEST_STATUS.PENDING,
            isApprove: false,
            isDelete: false
        });

        return await apiService.post('/FundRequest/Create', payload);
    },

    update: async (data) => {
        if (data instanceof FormData) {
            return await apiService.putForm('/FundRequest/Update', data);
        }

        const formData = new FormData();
        const model = FundRequestRequestModel(data);

        Object.keys(model).forEach(key => {
            if (model[key] !== undefined && model[key] !== null) {
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                formData.append(pascalKey, model[key]);
            }
        });

        const file = data.slipFile || data.CashslipFile || data.cashslipFile || (data.cashslip instanceof File || data.cashslip instanceof Blob ? data.cashslip : null);
        if (file instanceof File || file instanceof Blob) {
            formData.append('CashslipFile', file);
        }

        return await apiService.putForm('/FundRequest/Update', formData);
    },

    getById: async (id) => {
        const res = await apiService.get(`/FundRequest/GetByID/${id}`);
        return FundRequestResponseModel(res)[0] || null;
    },

    delete: async (id) => {
        return await apiService.delete(`/FundRequest/Delete/${id}`);
    },

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

    approve: async (request, { remark = '' } = {}) => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
        return await FundRequestService.update({
            ...request,
            status: FUND_REQUEST_STATUS.APPROVE,
            isApprove: true,
            approveDate: localISOTime,
            companyMemberId: request.companyMemberId || request.CompanyMemberId || request.msrno || request.Msrno || 1,
            remark: remark || request.remark || 'Approved by Admin - Wallet Credited'
        });
    },

    reject: async (request, reason = '') => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
        return await FundRequestService.update({
            ...request,
            status: FUND_REQUEST_STATUS.REJECTED,
            isApprove: false,
            approveDate: localISOTime,
            reason: reason || request.reason || 'Invalid UTR or payment slip',
            remark: request.remark || 'Rejected by Admin'
        });
    }
};
