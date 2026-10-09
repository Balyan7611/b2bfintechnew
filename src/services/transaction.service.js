import { apiService } from '../api/httpClient';

export const normalizeTxnResponse = (res) => {
      const d = res?.data ?? res;

  let items = [];
  if (Array.isArray(d?.items))      items = d.items;
  else if (Array.isArray(d?.data?.items)) items = d.data.items;
  else if (Array.isArray(d?.data))  items = d.data;
  else if (Array.isArray(d))        items = d;

  return {
    items,
    totalItems:   d?.totalItems   ?? d?.data?.totalItems   ?? items.length,
    totalSuccess: d?.totalSuccess ?? d?.data?.totalSuccess ?? 0,
    totalPending: d?.totalPending ?? d?.data?.totalPending ?? 0,
    totalFailed:  d?.totalFailed  ?? d?.data?.totalFailed  ?? 0,
    isSuccess:    res?.isSuccess  ?? res?.status === true   ?? true,
  };
};

export const TransactionService = {
    getAll: async ({
    pageNumber = 1, pageSize = 10,
    fromDate = '', toDate = '',
    serviceId = '', serviceIds = [], sectionType = '',
    operatorId = '', apiId = '',
    memberId = '', status = '',
    keyword = ''
  } = {}) => {
    const p = new URLSearchParams({ PageNumber: pageNumber, PageSize: pageSize });
    if (fromDate)    p.append('FromDate',    fromDate);
    if (toDate)      p.append('ToDate',      toDate);
    // support single serviceId or array of serviceIds
    if (serviceId) {
      p.append('ServiceId', serviceId);
    } else if (Array.isArray(serviceIds) && serviceIds.length > 0) {
      serviceIds.forEach(id => p.append('ServiceId', id));
    }
    if (sectionType) p.append('SectionType', sectionType);
    if (operatorId)  p.append('OperatorId',  operatorId);
    if (apiId)       p.append('ApiId',       apiId);
    if (memberId)    p.append('MemberId',    memberId);
    if (status)      p.append('Status',      status);
    if (keyword)     p.append('Keyword',     keyword);
    const res = await apiService.get(`/Transaction/get-all?${p.toString()}`);
    return res;   },

    search: async ({ searchTerm = '', pageNumber = 1, pageSize = 10, fromDate = '', toDate = '', status = '', memberID = '', walletTypeId = '' } = {}) => {
    const p = new URLSearchParams({
      searchTerm: searchTerm,
      PageNumber:  pageNumber,
      PageSize:    pageSize,
    });
    if (fromDate)     p.append('FromDate',     fromDate);
    if (toDate)       p.append('ToDate',       toDate);
    if (status)       p.append('Status',       status);
    if (memberID)     p.append('MemberID',     memberID);
    if (walletTypeId) p.append('WalletTypeId', walletTypeId);
    const res = await apiService.get(`/Transaction/search?${p.toString()}`);
    return res;
  },

    // POST /Transaction/add-test-txn (no body)
    addTestTxn: async () => {
    return await apiService.post('/Transaction/add-test-txn');
  },
};
