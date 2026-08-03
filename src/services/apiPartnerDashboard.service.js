import { apiService } from '../api/httpClient';

export const ApiPartnerDashboardService = {
    getOverview: async () => {
        return await apiService.get('/ApiPartner/Dashboard/Overview');
    },
    getAssignedServices: async () => {
        return await apiService.get('/ApiPartner/Dashboard/AssignedServices');
    },
    getRecentTransactions: async (limit = 10) => {
        return await apiService.get(`/ApiPartner/Dashboard/RecentTransactions?limit=${limit}`);
    }
};
