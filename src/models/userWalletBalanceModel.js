export const UserWalletBalanceRequestModel = (data = {}) => ({
    id: data.id || 0,
    msrno: data.msrno || 0,
    mainBalanceCr: parseFloat(data.mainBalanceCr) || 0,
    mainBalanceDr: parseFloat(data.mainBalanceDr) || 0,
    mainBalance: parseFloat(data.mainBalance) || 0,
    aepsBalanceCr: parseFloat(data.aepsBalanceCr) || 0,
    aepsBalanceDr: parseFloat(data.aepsBalanceDr) || 0,
    aepsBalance: parseFloat(data.aepsBalance) || 0,
    commissionBalanceCr: parseFloat(data.commissionBalanceCr) || 0,
    commissionBalanceDr: parseFloat(data.commissionBalanceDr) || 0,
    commissionBalance: parseFloat(data.commissionBalance) || 0,
    isActive: data.isActive !== undefined ? !!data.isActive : true,
    createdBy: parseInt(data.createdBy) || 0,
    modifiedBy: parseInt(data.modifiedBy) || 0
});

export const UserWalletBalanceResponseModel = (res) => {
    let dataArray = [];
    try {
        if (Array.isArray(res)) dataArray = res;
        else if (res && Array.isArray(res.data)) dataArray = res.data;
        else if (res && res.data && Array.isArray(res.data.items)) dataArray = res.data.items;
        else if (res && Array.isArray(res.items)) dataArray = res.items;
        else if (res && res.data && typeof res.data === 'string') {
            const parsed = JSON.parse(res.data);
            if (Array.isArray(parsed.items)) dataArray = parsed.items;
            else if (Array.isArray(parsed)) dataArray = parsed;
        }
    } catch (e) {
        console.error("Error parsing UserWalletBalanceResponseModel", e);
    }
    
    return dataArray.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        mainBalanceCr: item.mainBalanceCr || 0,
        mainBalanceDr: item.mainBalanceDr || 0,
        mainBalance: item.mainBalance || 0,
        aepsBalanceCr: item.aepsBalanceCr || 0,
        aepsBalanceDr: item.aepsBalanceDr || 0,
        aepsBalance: item.aepsBalance || 0,
        commissionBalanceCr: item.commissionBalanceCr || 0,
        commissionBalanceDr: item.commissionBalanceDr || 0,
        commissionBalance: item.commissionBalance || 0,
        isActive: !!item.isActive,
        createdBy: item.createdBy || 0,
        modifiedBy: item.modifiedBy || 0
    }));
};

export const UserWalletBalanceTransferRequestModel = (data = {}) => ({
    msrno: parseInt(data.msrno) || 0,
    byMsrno: parseInt(data.byMsrno) || 0,
    amount: parseFloat(data.amount) || 0,
    transactionType: data.transactionType || 'Credit',
    walletType: data.walletType || 'Main',
    description: data.description || ''
});
