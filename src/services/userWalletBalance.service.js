import { apiService } from '../api/httpClient';
import { UserWalletBalanceRequestModel, UserWalletBalanceResponseModel, UserWalletBalanceTransferRequestModel } from '../models/userWalletBalanceModel';

// Explicitly attach whatever auth token is available (access_token / admin_token /
// member_token) so background/header calls never go out without an Authorization
// header, regardless of which panel (admin / member / api-panel) is calling.
const getAuthConfig = (extra = {}) => {
    const raw = sessionStorage.getItem('access_token')
        || localStorage.getItem('access_token')
        || sessionStorage.getItem('admin_token')
        || localStorage.getItem('admin_token')
        || sessionStorage.getItem('member_token')
        || localStorage.getItem('member_token');

    if (!raw || raw === 'null' || raw === 'undefined') return extra;

    const token = raw.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
    return {
        ...extra,
        headers: {
            ...(extra.headers || {}),
            Authorization: `Bearer ${token}`
        }
    };
};

export const UserWalletBalanceService = {
    create: async (data) => {
        const payload = UserWalletBalanceRequestModel(data);
        return await apiService.post('/UserWalletBalance/Create', payload);
    },

    update: async (data) => {
        const payload = UserWalletBalanceRequestModel(data);
        return await apiService.put('/UserWalletBalance/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/UserWalletBalance/Delete/${id}`);
    },

    transfer: async (data) => {
        const payload = UserWalletBalanceTransferRequestModel(data);
        return await apiService.post('/UserWalletBalance/Transfer', payload);
    },

    getById: async (id) => {
        return await apiService.get(`/UserWalletBalance/GetByID/${id}`);
    },

    // Returns ONE member's balances, verified client-side.
    //
    // Why: GetUserWalletBalances was being called with PageSize=1 and a MemberID
    // filter. If the server ignores/mismatches that filter it simply returns the
    // first row of the whole table — which is how another user's balance
    // (e.g. an API user's 10,000) ended up rendering in the member header.
    // Here we pull a page and only accept a row whose msrno/memberId actually
    // matches; anything else yields zeros.
    getForMember: async (memberId, { silent = true } = {}) => {
        const zero = { mainBalance: 0, aepsBalance: 0, commissionBalance: 0 };
        if (!memberId) return zero;

        const res = await UserWalletBalanceService.getAll({
            pageNumber: 1,
            pageSize: 200,
            memberId,
            silent
        });

        const rows = Array.isArray(res?.data) ? res.data : [];
        const mine = rows.find(r =>
            Number(r.msrno) === Number(memberId) || Number(r.memberId) === Number(memberId)
        );

        if (!mine) {
            console.warn('[wallet] no balance row for member', memberId,
                '- server returned', rows.length, 'row(s):', rows.map(r => r.msrno));
            return zero;
        }

        return {
            mainBalance: parseFloat(mine.mainBalance) || 0,
            aepsBalance: parseFloat(mine.aepsBalance) || 0,
            commissionBalance: parseFloat(mine.commissionBalance) || 0
        };
    },

    getAll: async ({ pageNumber = 1, pageSize = 10, fromDate = '', toDate = '', status = '', memberId = '', silent = false } = {}) => {
        let url = `/UserWalletBalance/GetUserWalletBalances?PageNumber=${pageNumber}&PageSize=${pageSize}`;
        if (fromDate) url += `&FromDate=${encodeURIComponent(fromDate)}`;
        if (toDate) url += `&ToDate=${encodeURIComponent(toDate)}`;
        if (status) url += `&Status=${encodeURIComponent(status)}`;
        if (memberId) url += `&MemberID=${encodeURIComponent(memberId)}`;

        // silent=true (used by header widgets polling in the background) skips the
        // global loader/error toast and still guarantees the Authorization header
        // is attached explicitly instead of relying on ambient axios defaults.
        const config = silent ? getAuthConfig({ hideLoader: true, ignoreError: true }) : getAuthConfig();
        const res = await apiService.get(url, config);
        const mappedData = UserWalletBalanceResponseModel(res);

        return {
            ...res,
            data: mappedData
        };
    }
};
