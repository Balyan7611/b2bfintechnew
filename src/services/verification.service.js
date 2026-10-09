import { apiService } from '../api/httpClient';

export const VerificationService = {
    // POST /Verification/VerifyPan
    verifyPan: async (data) => {
        return await apiService.post('/Verification/VerifyPan', {
            pan: data.pan || '',
            name: data.name ?? null,
            nameMatchMethod: data.nameMatchMethod ?? null,
            authMode: data.authMode || '',
            authCode: data.authCode || '',
            securityToken: data.securityToken ?? null,
        });
    },

    // POST /Verification/VerifyBankAccount
    verifyBankAccount: async (data) => {
        return await apiService.post('/Verification/VerifyBankAccount', {
            ifsc: data.ifsc || '',
            accNo: data.accNo || '',
            beneficiaryName: data.beneficiaryName ?? null,
            authMode: data.authMode || '',
            authCode: data.authCode || '',
            securityToken: data.securityToken ?? null,
        });
    },

    // POST /Verification/SeedConfig
    seedConfig: async () => {
        return await apiService.post('/Verification/SeedConfig');
    },

    // GET /Verification/SeedConfig
    getSeedConfig: async () => {
        return await apiService.get('/Verification/SeedConfig');
    },
};
