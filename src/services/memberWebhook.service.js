import { apiService } from '../api/httpClient';

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

export const MemberWebhookService = {
                    sendOtp: async () => {
        return await apiService.post('/MemberWebhook/SendOtp', {}, getAuthConfig());
    },

            configureWithOtp: async ({ otp, token, serviceId, webhookUrl1, webhookUrl2 = '' }) => {
        const payload = {
            serviceId: parseInt(serviceId) || 0,
            webhookUrl1: webhookUrl1 || '',
            webhookUrl2: webhookUrl2 || ''
        };
        const query = `?otp=${encodeURIComponent(otp)}&token=${encodeURIComponent(token)}`;
        return await apiService.post(`/MemberWebhook/ConfigureWithOtp${query}`, payload, getAuthConfig());
    },

            myWebhooks: async () => {
        return await apiService.get('/MemberWebhook/MyWebhooks', getAuthConfig({ hideLoader: true, ignoreError: true }));
    },

                delete: async (serviceId) => {
        return await apiService.delete(`/MemberWebhook/Delete/${serviceId}`, getAuthConfig());
    }
};
