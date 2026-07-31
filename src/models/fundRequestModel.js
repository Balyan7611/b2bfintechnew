// Maps between the UI's fund-request shape and the backend FundRequest table.
//
// Backend contract (confirmed):
//   POST /api/FundRequest/Create
//   GET  /api/FundRequest/GetFundRequest?PageNumber=&PageSize=
//   PUT  /api/FundRequest/Update
//   GET  /api/FundRequest/GetByID/{id}
//   DELETE /api/FundRequest/Delete/{id}

// Exact strings the backend expects on PUT /FundRequest/Update.
// Note the asymmetry — "Approve" but "Rejected".
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
        status: data.status || FUND_REQUEST_STATUS.PENDING,
        isApprove: data.isApprove === true,
        remark: data.remark || '',
        isDelete: data.isDelete === true
    };

    // Only sent on Update — Create lets the DB assign the identity.
    if (data.id) payload.id = parseInt(data.id);
    if (data.approveDate) payload.approveDate = data.approveDate;
    // Rejection reason is its own field, separate from the general remark.
    if (data.reason) payload.reason = data.reason;

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
        companyBankName: item.companyBankName || item.bankName || '',
        amount: parseFloat(item.amount) || 0,
        bankRefId: item.bankRefId || '',
        transactionId: item.transactionId || '',
        paymentMode: item.paymentMode || '',
        status: item.status || FUND_REQUEST_STATUS.PENDING,
        isApprove: item.isApprove === true,
        remark: item.remark || '',
        reason: item.reason || '',
        approveDate: item.approveDate || null,
        createdDate: item.createdDate || item.addDate || null,
        isDelete: item.isDelete === true
    }));
};

// The list uses lowercase status keys for its badges/filters.
export const normalizeStatus = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.startsWith('approve')) return 'approved';
    if (s.startsWith('reject') || s.startsWith('decline')) return 'rejected';
    return 'pending';
};
