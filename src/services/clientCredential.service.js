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
    // GET /ClientCredential/GetByID/1
    getById: async (id) => {
        return await apiService.get(`/ClientCredential/GetByID/${id}`);
    },

    // POST /ClientCredential/Create
    create: async (data) => {
        return await apiService.post('/ClientCredential/Create', {
            id: data.id || 0,
            msrno: data.msrno || null,
            clientId: data.clientId || "",
            clientSecret: data.clientSecret || "",
            isActive: data.isActive === true,
            isRevoked: data.isRevoked === true,
        });
    },

    // PUT /ClientCredential/Update
    update: async (data) => {
        return await apiService.put('/ClientCredential/Update', {
            id: data.id || 0,
            msrno: data.msrno || null,
            clientId: data.clientId || "",
            clientSecret: data.clientSecret || "",
            isActive: data.isActive === true,
            isRevoked: data.isRevoked === true,
        });
    },

    // DELETE /ClientCredential/Delete/1
    delete: async (id) => {
        return await apiService.delete(`/ClientCredential/Delete/${id}`);
    },

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
