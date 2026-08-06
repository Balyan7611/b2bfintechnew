import { apiService } from '../api/httpClient';

/* ── Normalize any response shape into { items, totalItems, totalSuccess, totalPending, totalFailed } ── */
export const normalizeTxnResponse = (res) => {
  // New API: { isSuccess, data: { items, totalItems, totalSuccess, totalPending, totalFailed } }
  // Old API: { status: true, data: [...] } or { status: true, data: { items: [...] } }
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
  /* Get all / filtered transactions */
  getAll: async ({
    pageNumber = 1, pageSize = 10,
    fromDate = '', toDate = '',
    serviceId = '', sectionType = '',
    operatorId = '', apiId = '',
    memberId = '', status = '',
    keyword = ''
  } = {}) => {
    const p = new URLSearchParams({ PageNumber: pageNumber, PageSize: pageSize });
    if (fromDate)    p.append('FromDate',    fromDate);
    if (toDate)      p.append('ToDate',      toDate);
    if (serviceId)   p.append('ServiceId',   serviceId);
    if (sectionType) p.append('SectionType', sectionType);
    if (operatorId)  p.append('OperatorId',  operatorId);
    if (apiId)       p.append('ApiId',       apiId);
    if (memberId)    p.append('MemberId',    memberId);
    if (status)      p.append('Status',      status);
    if (keyword)     p.append('Keyword',     keyword);
    const res = await apiService.get(`/Transaction/get-all?${p.toString()}`);
    return res; // raw — callers can use normalizeTxnResponse(res) or the old shape checks
  },

  /* Global keyword search */
  search: async ({ searchTerm = '', pageNumber = 1, pageSize = 10 } = {}) => {
    const p = new URLSearchParams({
      searchTerm: searchTerm,
      PageNumber:  pageNumber,
      PageSize:    pageSize,
    });
    const res = await apiService.get(`/Transaction/search?${p.toString()}`);
    return res;
  },
};
