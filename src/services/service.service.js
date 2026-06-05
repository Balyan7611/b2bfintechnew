import { apiService } from '../api/httpClient';

/* ──────────────────────────────────────────────
   Helper: build FormData from service object
   Field names match exactly the API curl spec
────────────────────────────────────────────── */
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

  // GET all services (POST method per API convention)
  getAll: async () => {
    return await apiService.post('/Service/get-all-services', {});
  },

  // CREATE service — POST multipart/form-data
  create: async (data, fileObj = null) => {
    const fd = buildServiceFormData(data, fileObj);
    return await apiService.postForm('/Service/create-service', fd);
  },

  // UPDATE service — PUT multipart/form-data (Id in URL)
  update: async (data, fileObj = null) => {
    const fd = buildServiceFormData(data, fileObj);
    fd.append('Id', data.id);
    return await apiService.putForm(`/Service/update-service/${data.id}`, fd);
  },

  // TOGGLE isActive — uses update-service PUT with full existing data
  toggleActive: async (service) => {
    const updated = { ...service, isActive: !service.isActive };
    const fd = buildServiceFormData(updated, null);
    fd.append('Id', service.id);
    return await apiService.putForm(`/Service/update-service/${service.id}`, fd);
  },

  // TOGGLE onoff — uses update-service PUT with full existing data
  toggleOnOff: async (service) => {
    const updated = { ...service, onoff: !service.onoff };
    const fd = buildServiceFormData(updated, null);
    fd.append('Id', service.id);
    return await apiService.putForm(`/Service/update-service/${service.id}`, fd);
  },

  // DELETE service
  delete: async (id) => {
    return await apiService.post(`/Service/delete-service/${id}`, {});
  },
};
