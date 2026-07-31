import { apiService } from '../api/httpClient';

// Explicitly attach whatever auth token is available (access_token / admin_token /
// member_token) so a request never goes out without an Authorization header.
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
    // Step 1 of the OTP-protected save flow: triggers an OTP to the
    // reseller's registered mobile/email (SmsCategory "CallbackChangeOtp")
    // and returns a verification token that must be sent back with
    // configureWithOtp().
    sendOtp: async () => {
        return await apiService.post('/MemberWebhook/SendOtp', {}, getAuthConfig());
    },

    // Step 2: confirms the OTP + token and actually saves the webhook.
    // Backend fires CallbackAdded/CallbackUpdated SMS on success.
    configureWithOtp: async ({ otp, token, serviceId, webhookUrl1, webhookUrl2 = '' }) => {
        const payload = {
            serviceId: parseInt(serviceId) || 0,
            webhookUrl1: webhookUrl1 || '',
            webhookUrl2: webhookUrl2 || ''
        };
        const query = `?otp=${encodeURIComponent(otp)}&token=${encodeURIComponent(token)}`;
        return await apiService.post(`/MemberWebhook/ConfigureWithOtp${query}`, payload, getAuthConfig());
    },

    // Lists every webhook this reseller/API-user has configured, joined with
    // service name + their secret signing key.
    myWebhooks: async () => {
        return await apiService.get('/MemberWebhook/MyWebhooks', getAuthConfig({ hideLoader: true, ignoreError: true }));
    },

    // Removes a configured webhook (takes serviceId, not an internal record
    // id - backend resolves the row via MemberId(from token) + ServiceId,
    // and fires a CallbackRemoved SMS on success).
    delete: async (serviceId) => {
        return await apiService.delete(`/MemberWebhook/Delete/${serviceId}`, getAuthConfig());
    }
};
