import { apiService } from '../api/httpClient';

const buildMemberPayload = (data) => ({
    roleId: data.roleId ?? null,
    titleId: data.titleId ?? null,
    packageId: data.packageId ?? null,
    parentId: data.parentId ?? null,
    name: data.name || '',
    email: data.email ?? null,
    mobile: data.mobile ?? null,
    alterNativeMobileNumber: data.alterNativeMobileNumber ?? null,
    genderId: data.genderId ?? null,
    dob: data.dob ?? null,
    pic: data.pic ?? null,
    loginOnOff: data.loginOnOff === true,
    deviceId: data.deviceId ?? null,
    appToken: data.appToken ?? null,
    macAddress: data.macAddress ?? null,
    deviceRegister: data.deviceRegister ?? null,
    fromChannel: data.fromChannel ?? null,
    time: data.time ?? 1,
    aadhar: data.aadhar ?? null,
    pan: data.pan ?? null,
    address: data.address ?? null,
    pinCode: data.pinCode ?? null,
    stateId: data.stateId ?? null,
    cityId: data.cityId ?? null,
    parentStr: data.parentStr ?? null,
    shopName: data.shopName ?? null,
    shopAddress: data.shopAddress ?? null,
    shopPinCode: data.shopPinCode ?? null,
    shopStateId: data.shopStateId ?? null,
    shopCityId: data.shopCityId ?? null,
    postOffice: data.postOffice ?? null,
    businessPostOffice: data.businessPostOffice ?? null,
});

export const MemberService = {
    // POST /Member/get-active-members
    getActiveMembers: async (params = {}) => {
        return await apiService.post('/Member/get-active-members', {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 100,
            roleId: params.roleId ?? null,
            isKycApproved: params.isKycApproved ?? null,
            pinCode: params.pinCode ?? null,
            fromDate: params.fromDate ?? null,
            toDate: params.toDate ?? null,
            isActive: params.isActive ?? null,
            search: params.search ?? null,
        });
    },

    // POST /Member/get-all-members
    getAll: async (params = {}) => {
        return await apiService.post('/Member/get-all-members', {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 100,
            roleId: params.roleId ?? null,
            isKycApproved: params.isKycApproved ?? null,
            pinCode: params.pinCode ?? null,
            fromDate: params.fromDate ?? null,
            toDate: params.toDate ?? null,
            isActive: params.isActive ?? null,
            search: params.search ?? null,
        });
    },

    // GET /Member/MemberSearch?PageNumber=1&PageSize=1&RoleId=1&IsKycApproved=true&PinCode=&FromDate=&ToDate=&IsActive=true&Search=
    memberSearch: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const roleId = params.roleId ?? '';
        const isKycApproved = params.isKycApproved ?? '';
        const pinCode = params.pinCode ?? '';
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const isActive = params.isActive ?? '';
        const search = params.search ?? '';
        return await apiService.get(
            `/Member/MemberSearch?PageNumber=${pageNumber}&PageSize=${pageSize}&RoleId=${roleId}&IsKycApproved=${isKycApproved}&PinCode=${pinCode}&FromDate=${fromDate}&ToDate=${toDate}&IsActive=${isActive}&Search=${encodeURIComponent(search)}`
        );
    },

    // GET /Member/get-member-by-id/1
    getById: async (id) => {
        return await apiService.get(`/Member/get-member-by-id/${id}`);
    },

    // POST /Member/create-member
    create: async (data) => {
        return await apiService.post('/Member/create-member', buildMemberPayload(data));
    },

    // PUT /Member/update-member/1
    update: async (id, data) => {
        return await apiService.put(`/Member/update-member/${id}`, buildMemberPayload(data));
    },

    // POST /Member/change-password
    changePassword: async (data) => {
        return await apiService.post('/Member/change-password', {
            memberId: data.memberId ?? null,
            newPassword: data.newPassword || '',
        });
    },

    // POST /Member/change-pin
    changePin: async (data) => {
        return await apiService.post('/Member/change-pin', {
            memberId: data.memberId ?? null,
            newPin: data.newPin || '',
        });
    },

    // POST /Member/reset-location-history/1
    resetLocationHistory: async (id) => {
        return await apiService.post(`/Member/reset-location-history/${id}`);
    },
};
