
export const FUND_REQUEST_STATUS = {
    PENDING: 'Pending',
    APPROVE: 'Approve',
    REJECTED: 'Rejected'
};

export const FundRequestRequestModel = (data = {}) => {
    const payload = {
        msrno: parseInt(data.msrno) || 0,
        companyBankId: parseInt(data.companyBankId) || 0,
        amount: parseFloat(data.amount) || 0,
        bankRefId: data.bankRefId || '',
        transactionId: data.transactionId || '',
        paymentMode: data.paymentMode || '',
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        status: data.status || FUND_REQUEST_STATUS.PENDING,
        isApprove: data.isApprove === true,
        remark: data.remark || '',
        isDelete: data.isDelete === true
    };

        if (data.id) payload.id = parseInt(data.id);
    if (data.approveDate) payload.approveDate = data.approveDate;
    if (data.reason) payload.reason = data.reason;
    if (data.cashslip) payload.cashslip = data.cashslip;
    if (data.slipFile) payload.slipFile = data.slipFile;
    if (data.slipFileName) payload.slipFileName = data.slipFileName;
    if (data.slipFileType) payload.slipFileType = data.slipFileType;

    return payload;
};

export const FundRequestResponseModel = (res) => {
    let items = [];
    try {
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res?.data?.items)) items = res.data.items;
        else if (Array.isArray(res?.data)) items = res.data;
        else if (Array.isArray(res?.items)) items = res.items;
        else if (res?.data && typeof res.data === 'object' && res.data.id) items = [res.data];
    } catch (err) {
        console.error('FundRequestResponseModel: parse failed', err);
    }

    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno ?? item.MsrNo ?? 0,
        memberName: item.memberName || item.MemberName || '',
        loginId: item.loginId || item.LoginId || '',
        companyBankId: item.companyBankId ?? item.CompanyBankId ?? 0,
        companyBankName: item.companyBankName || item.bankName || item.CompanyBankName || item.BankName || '',
        amount: parseFloat(item.amount) || 0,
        bankRefId: item.bankRefId || item.BankRefId || '',
        transactionId: item.transactionId || '',
        paymentMode: item.paymentMode || item.PaymentMode || '',
        status: item.status || FUND_REQUEST_STATUS.PENDING,
        isApprove: item.isApprove === true,
        remark: item.remark || '',
        reason: item.reason || '',
        approveDate: item.approveDate || item.ApproveDate || null,
                createdDate: item.createdDate || item.CreatedDate || item.addDate || item.AddDate || item.created_date || null,
                paymentDate: item.paymentDate || item.PaymentDate || item.payment_date || item.depositDate || null,
        isDelete: item.isDelete === true,
                        cashslip: item.cashslip || item.CashSlip || item.cashSlip || item.slipFile || item.SlipFile || item.receipt || item.attachment || item.fileName || item.FileName || null,
        slipUrl: item.slipUrl || item.receiptUrl || item.attachmentUrl || item.slip || null
    }));
};

export const normalizeStatus = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.startsWith('approve')) return 'approved';
    if (s.startsWith('reject') || s.startsWith('decline')) return 'rejected';
    return 'pending';
};
