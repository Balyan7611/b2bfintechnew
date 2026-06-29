// src/models/memberModel.js

export const MemberRequestModel = (form) => {
    return {
        roleId: parseInt(form.role) || 0,
        titleId: form.title === 'Mr' ? 1 : form.title === 'Mrs' ? 2 : 3,
        packageId: parseInt(form.packageId) || 0,
        parentId: form.parentId || (form.upline === 'Admin' ? 1 : 1),
        name: form.name || "",
        email: form.email || "",
        mobile: form.mobile || "",
        alterNativeMobileNumber: form.whatsapp || "",
        genderId: form.gender === 'Female' ? 2 : form.gender === 'Other' ? 3 : 1,
        dob: form.dob || "",
        pic: form.pic || "",
        loginOnOff: form.loginOnOff ?? true,
        deviceId: form.deviceId || "",
        appToken: form.appToken || "",
        macAddress: form.macAddress || "",
        deviceRegister: form.deviceRegister || "",
        fromChannel: form.fromChannel || "",
        time: parseInt(form.time) || 0,
        aadhar: form.aadhar || "",
        pan: form.pan || "",
        address: form.address1 || "",
        pinCode: form.pincode || "",
        stateId: parseInt(form.state) || 1,
        cityId: parseInt(form.cityId) || 2,
        parentStr: form.parentStr || "",
        shopName: form.businessName || "",
        shopAddress: form.bizAddress || "",
        shopPinCode: form.bizPincode || "",
        shopStateId: parseInt(form.bizState) || 1,
        shopCityId: parseInt(form.bizCityId) || 2,
        postOffice: form.postOffice || form.city || "",
        businessPostOffice: form.bizPostOffice || form.bizCity || ""
    };
};

export const MemberResponseModel = (item) => {
    if (!item) return null;
    return {
        id: item.id,
        msrno: item.msrno || item.id,
        memberId: item.memberID || item.username || `MEM${item.id}`,
        name: item.name || "",
        email: item.email || "",
        mobile: item.mobile || "",
        whatsapp: item.alterNativeMobileNumber || item.mobile || "",
        dob: item.dob ? item.dob.split('T')[0] : "",
        gender: item.genderId === 2 ? 'Female' : item.genderId === 3 ? 'Other' : 'Male',
        title: item.titleId === 2 ? 'Mrs' : item.titleId === 3 ? 'Miss' : 'Mr',
        pan: item.pan || "",
        aadhar: item.aadhar || "",
        address1: item.address || "",
        pincode: item.pinCode || "",
        state: item.stateId || "",
        city: item.postOffice || "",
        businessName: item.shopName || "",
        bizAddress: item.shopAddress || "",
        bizPincode: item.shopPinCode || "",
        bizState: item.shopStateId || "",
        bizCity: item.businessPostOffice || "",
        role: item.roleName || (item.roleId === 2 ? 'Retailer' : 'Admin'),
        packageId: item.packageId || "",
        doj: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        mainWallet: item.mainWallet || 0,
        aepsWallet: item.aepsWallet || 0,
        commissionWallet: item.commissionWallet || 0
    };
};
