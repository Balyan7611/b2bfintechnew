
export const FUND_REQUEST_STATUS = {
    PENDING: 'Pending',
    APPROVE: 'Approved',
    REJECTED: 'Rejected'
};

export const FundRequestRequestModel = (data = {}) => {
    const payload = {
        msrno: parseInt(data.msrno ?? data.Msrno) || 0,
        companyBankId: parseInt(data.companyBankId ?? data.CompanyBankId) || 0,
        amount: parseFloat(data.amount ?? data.Amount) || 0,
        bankRefId: data.bankRefId ?? data.BankRefId ?? '',
        transactionId: data.transactionId ?? data.TransactionId ?? '',
        paymentMode: data.paymentMode ?? data.PaymentMode ?? '',
        paymentDate: data.paymentDate ?? data.PaymentDate ?? new Date().toISOString().split('T')[0],
        status: data.status ?? data.Status ?? FUND_REQUEST_STATUS.PENDING,
        isApprove: data.isApprove === true || data.IsApprove === true || String(data.isApprove).toLowerCase() === 'true' || String(data.IsApprove).toLowerCase() === 'true',
        remark: data.remark ?? data.Remark ?? '',
        isDelete: data.isDelete === true || data.IsDelete === true
    };

    if (data.id || data.Id) payload.id = parseInt(data.id || data.Id);
    if (data.companyMemberId || data.CompanyMemberId) payload.companyMemberId = parseInt(data.companyMemberId || data.CompanyMemberId);
    if (data.approveDate || data.ApproveDate) payload.approveDate = data.approveDate || data.ApproveDate;
    if (data.reason || data.Reason) payload.reason = data.reason || data.Reason;
    if (data.cashslip || data.Cashslip) payload.cashslip = data.cashslip || data.Cashslip;
    if (data.slipFile || data.SlipFile) payload.slipFile = data.slipFile || data.SlipFile;
    if (data.slipFileName || data.SlipFileName) payload.slipFileName = data.slipFileName || data.SlipFileName;
    if (data.slipFileType || data.SlipFileType) payload.slipFileType = data.slipFileType || data.SlipFileType;

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
        gst: parseFloat(item.gst || item.GST || item.gstAmount || item.GstAmount || 0) || 0,
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
