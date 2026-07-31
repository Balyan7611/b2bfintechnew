import { apiService } from '../api/httpClient';
import { MemberBankDetailRequestModel, MemberBankDetailResponseModel } from '../models/memberBankDetailModel';

export const MemberBankDetailService = {
    getAll: async (params = {}) => {
        const { PageNumber = 1, PageSize = 1000, FromDate = '', ToDate = '', Status = '', MemberID = '' } = params;
        const query = `?PageNumber=${PageNumber}&PageSize=${PageSize}&FromDate=${FromDate}&ToDate=${ToDate}&Status=${Status}&MemberID=${MemberID}`;
        const res = await apiService.get('/MemberBankDetail/GetMemberBankDetail' + query);
        return MemberBankDetailResponseModel(res);
    },

    getById: async (id) => {
        const res = await apiService.get(`/MemberBankDetail/GetByID/${id}`);
        return MemberBankDetailResponseModel(res);
    },

    // One member's own accounts, verified client-side so a server that ignores
    // the MemberID filter can't leak another member's bank rows into the panel.
    // Soft-deleted rows are dropped.
    getMine: async (memberId) => {
        if (!memberId) return [];
        const rows = await MemberBankDetailService.getAll({ MemberID: memberId });
        const mine = rows.filter(r => Number(r.msrno) === Number(memberId) && !r.isDelete);
        console.log('[memberBankDetail] msrno', memberId, '-> server sent', rows.length,
            'row(s), matched', mine.length);
        return mine;
    },

    create: async (data) => {
        const payload = MemberBankDetailRequestModel(data);
        return await apiService.post('/MemberBankDetail/Create', payload);
    },

    update: async (data) => {
        const payload = MemberBankDetailRequestModel(data);
        return await apiService.put('/MemberBankDetail/Update', payload);
    },

    delete: async (id) => {
        return await apiService.delete(`/MemberBankDetail/Delete/${id}`);
    }
};
