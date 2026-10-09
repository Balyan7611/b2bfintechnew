import { apiService } from '../api/httpClient';
import { ServiceResponseModel } from '../models/serviceModel';

const getAuthConfig = (extra = {}) => {
  const raw = sessionStorage.getItem('access_token')
    || localStorage.getItem('access_token')
    || sessionStorage.getItem('admin_token')
    || localStorage.getItem('admin_token')
    || sessionStorage.getItem('member_token')
    || localStorage.getItem('member_token');

  if (!raw || raw === 'null' || raw === 'undefined') return extra;

  const token = raw.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      Authorization: `Bearer ${token}`
    }
  };
};

const buildServiceFormData = (data, fileObj = null) => {
  if (data instanceof FormData) return data;

  const fd = new FormData();
  const file = (fileObj instanceof File || fileObj instanceof Blob) ? fileObj
    : (data?.file instanceof File || data?.file instanceof Blob) ? data.file
    : (data?.File instanceof File || data?.File instanceof Blob) ? data.File
    : (data?.image instanceof File || data?.image instanceof Blob) ? data.image
    : (data?.Image instanceof File || data?.Image instanceof Blob) ? data.Image
    : null;

  const id          = data.id          ?? data.Id          ?? '';
  const name        = data.name        ?? data.Name        ?? '';
  const sectionType = data.sectionType ?? data.SectionType ?? data.sectiontype ?? '0';
  const apiId       = data.apiid       ?? data.apiId       ?? data.ApiId       ?? '1';
  const userId      = data.userId      ?? data.UserID      ?? data.userid      ?? '1';
  const url         = data.url         ?? data.URL         ?? '';
  const icon        = data.icon        ?? data.Icon        ?? '';
  const onTime      = data.onTime      ?? data.Ontime      ?? data.ontime      ?? '0';
  const offTime     = data.offTime     ?? data.Offtime     ?? data.offtime     ?? '0';
  const orderBy     = data.orderBy     ?? data.OrderBy     ?? data.orderby     ?? '0';
  const reason      = data.reason      ?? data.Reason      ?? '';
  const price       = data.price       ?? data.Price       ?? '0';
  const tds         = data.tds         ?? data.Tds         ?? '0';
  const isTds       = data.isTds       ?? data.IsTds       ?? false;
  const isGst       = data.isGst       ?? data.IsGst       ?? false;
  const gst         = data.gst         ?? data.Gst         ?? false;
  const isKyc       = data.isKyc       ?? data.IsKyc       ?? false;
  const isActive    = data.isActive    ?? data.IsActive    ?? true;
  const isNew       = data.isNew       ?? data.IsNew       ?? false;
  const isComming   = data.isComming   ?? data.IsComming   ?? false;
  const onoff       = data.onoff       ?? data.Onoff       ?? true;

  if (id) fd.append('Id', id);
  fd.append('Name', name);
  fd.append('SectionType', sectionType);
  fd.append('ApiId', apiId);
  fd.append('UserID', userId);
  fd.append('URL', url);
  fd.append('Icon', icon);
  fd.append('Ontime', onTime);
  fd.append('Offtime', offTime);
  fd.append('OrderBy', orderBy);
  fd.append('Reason', reason);
  fd.append('Price', price);
  fd.append('Tds', tds);
  fd.append('IsTds', isTds);
  fd.append('IsGst', isGst);
  fd.append('Gst', gst);
  fd.append('IsKyc', isKyc);
  fd.append('IsActive', isActive);
  fd.append('IsNew', isNew);
  fd.append('IsComming', isComming);
  fd.append('Onoff', onoff);

  // Only 'File' key — as per backend curl spec
  if (file) fd.append('File', file);

  return fd;
};

export const ServiceManagementService = {

    getAll: async () => {
    return await apiService.post('/Service/get-all-services', {});
  },

    getBySectionType: async (sectionType) => {
    return await apiService.get(`/Service/get-services-by-sectiontype/${sectionType}?isActive=true`);
  },

        getActiveServices: async () => {
    const res = await apiService.post('/Service/get-all-services', {}, getAuthConfig({ hideLoader: true, ignoreError: true }));
    const all = ServiceResponseModel(res);
    return all.filter(s => s.isActive && s.onoff);
  },

    create: async (data, fileObj = null) => {
    const fd = data instanceof FormData ? data : buildServiceFormData(data, fileObj);
    return await apiService.postForm('/Service/create-service', fd);
  },

    update: async (data, fileObj = null) => {
    if (data instanceof FormData) {
      const id = data.get('Id') || data.get('id') || '0';
      return await apiService.putForm(`/Service/update-service/${id}`, data);
    }
    const fd = buildServiceFormData(data, fileObj);
    const id = data.id ?? data.Id ?? '0';
    return await apiService.putForm(`/Service/update-service/${id}`, fd);
  },

    toggleActive: async (service) => {
    const updated = { ...service, isActive: !service.isActive };
    const fd = buildServiceFormData(updated, null);
    return await apiService.putForm(`/Service/update-service/${service.id}`, fd);
  },

    toggleOnOff: async (service) => {
    const updated = { ...service, onoff: !service.onoff };
    const fd = buildServiceFormData(updated, null);
    return await apiService.putForm(`/Service/update-service/${service.id}`, fd);
  },

    delete: async (id) => {
    return await apiService.post(`/Service/delete-service/${id}`, {});
  },

    // GET /Service/get-service-by-id/1
    getById: async (id) => {
    return await apiService.get(`/Service/get-service-by-id/${id}`);
  },
};
