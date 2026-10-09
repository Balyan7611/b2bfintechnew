import { apiService } from '../api/httpClient';

export const BusinessAnalysisService = {
    // GET /Admin/BusinessAnalysis?memberId=1&scope=Downline&startDate=null&endDate=null
    getAnalysis: async (params = {}) => {
        const memberId = params.memberId ?? null;
        const scope = params.scope || 'Downline';
        const startDate = params.startDate ?? null;
        const endDate = params.endDate ?? null;
        return await apiService.get(
            `/Admin/BusinessAnalysis?memberId=${memberId}&scope=${encodeURIComponent(scope)}&startDate=${startDate}&endDate=${endDate}`
        );
    },
};
