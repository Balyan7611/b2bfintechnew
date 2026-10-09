import { apiService } from '../api/httpClient';

const buildSmsTemplatePayload = (data) => ({
    id: data.id || 0,
    categoryId: data.categoryId ?? null,
    template: data.template ?? null,
    templateId: data.templateId ?? null,
    emailTemplate: data.emailTemplate ?? null,
    whatsAppTemplate: data.whatsAppTemplate ?? null,
    isActive: data.isActive === true,
    msrno: data.msrno ?? null,
    companyMemberId: data.companyMemberId ?? null,
    integrationType: data.integrationType ?? null,
    isSms: data.isSms === true,
    isEmail: data.isEmail === true,
    isWhatsApp: data.isWhatsApp === true,
});

export const SmsTemplateService = {
    // GET /Smstemplate/GetSmstemplate?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Smstemplate/GetSmstemplate?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Smstemplate/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/Smstemplate/GetByID/${id}`);
    },

    // POST /Smstemplate/Create
    create: async (data) => {
        return await apiService.post('/Smstemplate/Create', buildSmsTemplatePayload(data));
    },

    // PUT /Smstemplate/Update
    update: async (data) => {
        return await apiService.put('/Smstemplate/Update', buildSmsTemplatePayload(data));
    },

    // DELETE /Smstemplate/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/Smstemplate/Delete/${id}`);
    },
};
