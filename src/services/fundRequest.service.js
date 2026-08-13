import { apiService } from '../api/httpClient';
import {
    FundRequestRequestModel,
    FundRequestResponseModel,
    FUND_REQUEST_STATUS
} from '../models/fundRequestModel';

export const FundRequestService = {
                create: async (data) => {
        const { slipFile, ...rest } = data;
        const payload = FundRequestRequestModel({
            ...rest,
            status: FUND_REQUEST_STATUS.PENDING,
            isApprove: false,
            isDelete: false
        });

        // Server only accepts JSON — convert file to base64 if provided
        if (slipFile) {
            try {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        // Strip the "data:image/jpeg;base64," prefix, send raw base64
                        const result = reader.result;
                        const base64Data = result.includes(',') ? result.split(',')[1] : result;
                        resolve(base64Data);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(slipFile);
                });
                payload.cashslip = base64;
                payload.slipFile = base64;
                payload.slipFileName = slipFile.name;
                payload.slipFileType = slipFile.type;
            } catch (err) {
                console.warn('FundRequest: could not encode slip file, submitting without it', err);
            }
        }

        return await apiService.post('/FundRequest/Create', payload);
    },

    update: async (data) => {
        const payload = FundRequestRequestModel(data);
        const form = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
            if (val !== undefined && val !== null) form.append(key, val);
        });
        if (data.slipFile) {
            form.append('slipFile', data.slipFile);
        }
        return await apiService.putForm('/FundRequest/Update', form);
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
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;         const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
        return await FundRequestService.update({
            ...request,
            status: FUND_REQUEST_STATUS.APPROVE,
            isApprove: true,
            approveDate: localISOTime,
            remark: remark || request.remark || 'Payment verified and approved'
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
            reason: reason || 'Payment not received',
            remark: 'Rejected by admin'
        });
    }
};
