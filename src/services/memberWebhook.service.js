import { apiService } from '../api/httpClient';

export const MemberWebhookService = {
    // POST /MemberWebhook/SendOtp
    sendOtp: async () => {
        return await apiService.post('/MemberWebhook/SendOtp');
    },

    // POST /MemberWebhook/ConfigureWithOtp?otp=&token=
    configureWithOtp: async (params = {}, data = {}) => {
        const otp = params.otp ?? '';
        const token = params.token ?? '';
        return await apiService.post(
            `/MemberWebhook/ConfigureWithOtp?otp=${encodeURIComponent(otp)}&token=${encodeURIComponent(token)}`,
            {
                serviceId: data.serviceId ?? null,
                webhookUrl1: data.webhookUrl1 || '',
                webhookUrl2: data.webhookUrl2 ?? null,
            }
        );
    },

    // POST /MemberWebhook/Configure
    configure: async (data) => {
        return await apiService.post('/MemberWebhook/Configure', {
            serviceId: data.serviceId ?? null,
            webhookUrl1: data.webhookUrl1 || '',
            webhookUrl2: data.webhookUrl2 ?? null,
        });
    },

    // GET /MemberWebhook/MyWebhooks
    getMyWebhooks: async () => {
        return await apiService.get('/MemberWebhook/MyWebhooks');
    },

    // GET /MemberWebhook/GetByMember/1
    getByMember: async (id) => {
        return await apiService.get(`/MemberWebhook/GetByMember/${id}`);
    },

    // DELETE /MemberWebhook/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/MemberWebhook/Delete/${id}`);
    },
};
