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
  const fd = new FormData();
  fd.append('Name',      data.name      || '');
  fd.append('SectionType', data.sectionType || '0');
  fd.append('ApiId',     data.apiid     || '1');
  fd.append('UserID',    data.userId    || '1');
  fd.append('URL',       data.url       || '');
  fd.append('Icon',      data.icon      || '');
  fd.append('Ontime',    data.onTime    || '0');
  fd.append('Offtime',   data.offTime   || '0');
  fd.append('OrderBy',   data.orderBy   || '0');
  fd.append('Reason',    data.reason    || '');
  fd.append('Price',     data.price     || '0');
  fd.append('Tds',       data.tds       || '0');
  fd.append('IsTds',     data.isTds     ?? false);
  fd.append('IsGst',     data.isGst     ?? false);
  fd.append('Gst',       data.gst       ?? false);
  fd.append('IsKyc',     data.isKyc     ?? false);
  fd.append('IsActive',  data.isActive  ?? true);
  fd.append('IsNew',     data.isNew     ?? false);
  fd.append('IsComming', data.isComming ?? false);
  fd.append('Onoff',     data.onoff     ?? true);
  if (fileObj) fd.append('File', fileObj);
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
    const fd = buildServiceFormData(data, fileObj);
    return await apiService.postForm('/Service/create-service', fd);
  },

    update: async (data, fileObj = null) => {
    const fd = buildServiceFormData(data, fileObj);
    fd.append('Id', data.id);
    return await apiService.putForm(`/Service/update-service/${data.id}`, fd);
  },

    toggleActive: async (service) => {
    const updated = { ...service, isActive: !service.isActive };
    const fd = buildServiceFormData(updated, null);
    fd.append('Id', service.id);
    return await apiService.putForm(`/Service/update-service/${service.id}`, fd);
  },

    toggleOnOff: async (service) => {
    const updated = { ...service, onoff: !service.onoff };
    const fd = buildServiceFormData(updated, null);
    fd.append('Id', service.id);
    return await apiService.putForm(`/Service/update-service/${service.id}`, fd);
  },

    delete: async (id) => {
    return await apiService.post(`/Service/delete-service/${id}`, {});
  },
};
