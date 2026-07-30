// src/services/clientCredential.service.js
// Wires up the 3-step OTP-protected flow for generating/viewing API client
// credentials in the API Partner Panel:
//   1. SendOtp            -> sends an OTP, returns a short-lived `token`
//   2. CreateWithOtp       -> token + otp -> creates a new client credential
//   3. RevealSecretWithOtp -> token + otp -> reveals the existing secret
// Plus the separate, unauthenticated auth/GetToken exchange (clientId +
// clientSecret -> access token) used by external API consumers.
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
    // Step 1: request an OTP. Returns { status, mess, data: "<verification-token>" }
    sendOtp: async () => {
        return await apiService.post('/ClientCredential/SendOtp', {}, getAuthConfig());
    },

    // Step 2: create a brand new client credential using the OTP just received.
    createWithOtp: async ({ token, otp }) => {
        return await apiService.post('/ClientCredential/CreateWithOtp', { token, otp }, getAuthConfig());
    },

    // Step 2b (alternative to create): reveal the *existing* secret using a
    // fresh OTP, instead of generating a new credential.
    revealSecretWithOtp: async ({ token, otp }) => {
        return await apiService.post('/ClientCredential/RevealSecretWithOtp', { token, otp }, getAuthConfig());
    },

    // OAuth2-style client_credentials exchange. This one is unauthenticated
    // (no Bearer token) - it's meant to be called by the EXTERNAL system
    // integrating with the API using the clientId/clientSecret pair, not by
    // this admin/API-panel UI itself. Exposed here so it's available if a
    // "test my credentials" style feature is ever needed.
    getToken: async ({ clientId, clientSecret }) => {
        return await apiService.post('/auth/GetToken', { clientId, clientSecret });
    }
};
