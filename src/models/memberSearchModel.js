
export const MemberSearchResponseModel = (res) => {
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

    return arr.map(item => ({
        // Numeric database id must win over string fields. loginID/loginId
        // (e.g. "API100") and mobile are NOT valid ids — sending one of them
        // as `id` to update-profile-style endpoints fails backend validation
        // ("id: The value 'API100' is not valid"). The backend's raw response
        // uses plain `id` as the numeric primary key (confirmed by the
        // existing parentDetails.id usage a few lines below in this same
        // file), so it must be checked FIRST — uniqueID/MemberID are just
        // legacy fallback guesses that don't actually exist on this response.
        id: item.id || item.uniqueID || item.UniqueID || item.MemberID || item.memberID || item.loginID || item.loginId || item.mobile || '',
        name: item.name || '',
        mobile: item.mobile || '',
        email: item.email || '',
        memberId: item.loginID || item.loginId || '',
        loginId: item.loginID || item.loginId || '',
        createdDate: item.createdDate || item.doj || '',
        doj: item.createdDate || item.doj || '',
        alterNativeMobileNumber: item.alterNativeMobileNumber || item.whatsapp || '',
        videoKyc: item.videoKyc === true,
        isHold: item.isHold === true || item.isOnHold === true,
        
                shopName: item.shopName || '',
        shop: item.shopName || '',
        cityName: item.cityName || '',
        city: item.cityName || '',
        pan: item.pan || '',
        aadhar: item.aadhar || '',
        
                mainWallet: parseFloat(item.mainWallet) || 0,
        mainBal: parseFloat(item.mainWallet) || 0,
        aepsWallet: parseFloat(item.aepsWallet) || 0,
        aepsBal: parseFloat(item.aepsWallet) || 0,
        holdAmount: parseFloat(item.holdAmount) || 0,
        holdAmt: parseFloat(item.holdAmount) || 0,
        
                isKycApproved: item.isKycApproved === true,
        aepsStatus: item.isKycApproved === true ? 'Registered' : 'Not Registered',
        
        isEmailVerify: item.isEmailVerify === true,
        isMobileVerify: item.isMobileVerify === true,
        
        isActive: item.isActive === true,
        memberType: item.isActive === true ? 'Active' : 'DeActive',
        
        isOnHold: item.isOnHold === true,
        role: item.roleName || '',
        roleName: item.roleName || '',
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
