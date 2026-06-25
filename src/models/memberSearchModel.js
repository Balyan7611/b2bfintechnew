// src/models/memberSearchModel.js

export const MemberSearchResponseModel = (res) => {
    console.log("MemberSearchResponseModel raw response:", res);
    if (!res) {
        console.warn("MemberSearchResponseModel: response is falsy");
        return [];
    }

    let arr = [];
    if (Array.isArray(res)) {
        arr = res;
    } else if (res.data && Array.isArray(res.data)) {
        arr = res.data;
    } else if (res.data && Array.isArray(res.data.items)) {
        arr = res.data.items;
    } else if (Array.isArray(res.items)) {
        arr = res.items;
    }

    console.log("MemberSearchResponseModel: parsing data array of length", arr.length);
    return arr.map(item => ({
        id: item.uniqueID || '',
        name: item.name || '',
        mobile: item.mobile || '',
        email: item.email || '',
        memberId: item.loginID || '',
        
        // Mapped values for UI & Redux compat
        shopName: item.shopName || '',
        shop: item.shopName || '',
        cityName: item.cityName || '',
        city: item.cityName || '',
        pan: item.pan || '',
        aadhar: item.aadhar || '',
        
        // Wallet balances
        mainWallet: parseFloat(item.mainWallet) || 0,
        mainBal: parseFloat(item.mainWallet) || 0,
        aepsWallet: parseFloat(item.aepsWallet) || 0,
        aepsBal: parseFloat(item.aepsWallet) || 0,
        holdAmount: parseFloat(item.holdAmount) || 0,
        holdAmt: parseFloat(item.holdAmount) || 0,
        
        // Status keys
        isKycApproved: item.isKycApproved === true,
        aepsStatus: item.isKycApproved === true ? 'Registered' : 'Not Registered',
        
        isEmailVerify: item.isEmailVerify === true,
        isMobileVerify: item.isMobileVerify === true,
        
        isActive: item.isActive === true,
        memberType: item.isActive === true ? 'Active' : 'DeActive',
        
        isOnHold: item.isOnHold === true,
        role: item.roleName || '',
        roleId: item.roleId || '',
        packageName: item.packageName || '',
        packageId: item.packageId || '',
        parent: item.parentStr || (item.parentDetails ? `${item.parentDetails.name} ${item.parentDetails.id || item.parentDetails.uniqueID || ''}` : ''),
        parentDetails: item.parentDetails ? {
            id: item.parentDetails.uniqueID || '',
            name: item.parentDetails.name || '',
            mobile: item.parentDetails.mobile || '',
            email: item.parentDetails.email || '',
            memberId: item.parentDetails.loginID || ''
        } : null
    }));
};
