
export const WALLET_TYPE_ID = {
    MAIN: 1,
    AEPS: 2
};

export const isCreditFactor = (factor) =>
    String(factor || '').trim().toLowerCase().startsWith('cr');

export const WalletLedgerResponseModel = (res) => {
    let items = [];
    try {
                        if (Array.isArray(res))                           items = res;
        else if (Array.isArray(res?.data?.items))         items = res.data.items;
        else if (Array.isArray(res?.data?.data?.items))   items = res.data.data.items;
        else if (Array.isArray(res?.data?.data))          items = res.data.data;
        else if (Array.isArray(res?.data))                items = res.data;
        else if (Array.isArray(res?.items))               items = res.items;
        else if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            const inner = Object.values(res.data);
            const arr = inner.find(v => Array.isArray(v) && v.length > 0);
            if (arr) items = arr;
        }
        console.log('[WalletLedger] raw res:', JSON.stringify(res)?.slice(0, 300), '→ items:', items.length);
    } catch (err) {
        console.error('WalletLedgerResponseModel: parse failed', err, res);
    }

    return items.map(item => ({
        id: item.id || 0,
        transactionId: item.transactionId || '',
        msrno: item.msrno ?? item.memberId ?? 0,
        memberName: item.memberName || item.name || '',
        loginId: item.loginId || item.loginID || '',
        openingBalance: parseFloat(item.openingBalance) || 0,
        amount: parseFloat(item.amount) || 0,
                finalAmount: parseFloat(item.finalAmount) || 0,
        balance: parseFloat(item.balance) || 0,
        factor: item.factor || '',
        isCredit: isCreditFactor(item.factor),
        narration: item.narration || '',
        description: item.description || '',
        surcharge: parseFloat(item.surcharge) || 0,
        gst: parseFloat(item.gst) || 0,
        tds: parseFloat(item.tds) || 0,
        commission: parseFloat(item.commission) || 0,
        charge: parseFloat(item.charge) || 0,
        walletTypeId: item.walletTypeId ?? item.walletTypeID ?? 0,
        status: item.status || 'SUCCESS',
        createdDate: item.createdDate || item.transactionDate || item.date || null
    }));
};

export const WalletLedgerTotalCount = (res) =>
    res?.data?.totalItems ?? res?.totalItems ?? res?.data?.totalCount ?? 0;

export const formatLedgerDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value).replace('T', ' ').slice(0, 16);
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};
