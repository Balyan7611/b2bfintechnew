import { apiService } from '../api/httpClient';

const getAuthConfig = (extra = {}) => {
    const raw = sessionStorage.getItem('access_token')
        || localStorage.getItem('access_token')
        || sessionStorage.getItem('api_token')
        || localStorage.getItem('api_token')
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
            Authorization: `Bearer ${token}`,
            'accept': '*/*'
        }
    };
};

export const ClientCredentialService = {
        sendOtp: async () => {
        return await apiService.post('/ClientCredential/SendOtp', {}, getAuthConfig());
    },

        createWithOtp: async ({ token, otp }) => {
        return await apiService.post('/ClientCredential/CreateWithOtp', { token, otp }, getAuthConfig());
    },

            revealSecretWithOtp: async ({ token, otp }) => {
        return await apiService.post('/ClientCredential/RevealSecretWithOtp', { token, otp }, getAuthConfig());
    },

                        getToken: async ({ clientId, clientSecret }) => {
        return await apiService.post('/auth/GetToken', { clientId, clientSecret });
    }
};
