import { apiService } from '../api/httpClient';

export const ApiAnalysisService = {
    // GET /Admin/ApiAnalysis?startDate=2025-01-01&endDate=2025-01-31
    getAnalysis: async (params = {}) => {
        const { startDate = null, endDate = null } = params;
        let url = `/Admin/ApiAnalysis?startDate=${startDate}&endDate=${endDate}`;
        return await apiService.get(url);
    },

    // GET /Admin/ApiAnalysis/GetApiBalances
    getApiBalances: async () => {
        return await apiService.get('/Admin/ApiAnalysis/GetApiBalances');
    },
};
