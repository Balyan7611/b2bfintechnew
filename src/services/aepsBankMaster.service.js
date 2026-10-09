import { apiService } from '../api/httpClient';
import { AepsBankRequestModel, AepsBankResponseModel } from '../models/aepsBankModel';

export const AepsBankMasterService = {
    // GET /AepsBankMaster/GetAepsBankMaster?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const {
            pageNumber = 1,
            pageSize = 100,
            fromDate = '',
            toDate = '',
            status = '',
            memberID = '',
            walletTypeId = ''
        } = params;
        let url = `/AepsBankMaster/GetAepsBankMaster?PageNumber=${pageNumber}&PageSize=${pageSize}`;
        if (fromDate) url += `&FromDate=${encodeURIComponent(fromDate)}`;
        if (toDate)   url += `&ToDate=${encodeURIComponent(toDate)}`;
        if (status)   url += `&Status=${encodeURIComponent(status)}`;
        if (memberID) url += `&MemberID=${encodeURIComponent(memberID)}`;
        if (walletTypeId) url += `&WalletTypeId=${encodeURIComponent(walletTypeId)}`;
        const res = await apiService.get(url);
        return AepsBankResponseModel(res);
    },

    // GET /AepsBankMaster/GetByID/1
    getById: async (id) => {
        const res = await apiService.get(`/AepsBankMaster/GetByID/${id}`);
        return AepsBankResponseModel(res);
    },

    // POST /AepsBankMaster/Create
    create: async (data) => {
        const payload = AepsBankRequestModel(data);
        return await apiService.post('/AepsBankMaster/Create', payload);
    },

    // PUT /AepsBankMaster/Update
    update: async (data) => {
        const payload = AepsBankRequestModel(data);
        return await apiService.put('/AepsBankMaster/Update', payload);
    },

    // DELETE /AepsBankMaster/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/AepsBankMaster/Delete/${id}`);
    }
};
