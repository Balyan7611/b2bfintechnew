export const MemberSecurityResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        twoWay: item.twoWay === true || item.twoWay === 1,
        isOtp: item.isOtp === true || item.isOtp === 1,
        isTpin: item.isTpin === true || item.isTpin === 1,
        isPattern: item.isPattern === true || item.isPattern === 1,
        isGoogleAuth: item.isGoogleAuth === true || item.isGoogleAuth === 1,
        authKey: item.authKey || "",
        isSeparateProfitWallet: item.isSeparateProfitWallet === true || item.isSeparateProfitWallet === 1
    }));
};

export const MemberSecurityRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        twoWay: data.twoWay === true || data.twoWay === 1,
        isOtp: data.isOtp === true || data.isOtp === 1,
        isTpin: data.isTpin === true || data.isTpin === 1,
        isPattern: data.isPattern === true || data.isPattern === 1,
        isGoogleAuth: data.isGoogleAuth === true || data.isGoogleAuth === 1,
        authKey: data.authKey || "",
        isSeparateProfitWallet: data.isSeparateProfitWallet === true || data.isSeparateProfitWallet === 1
    };
};
