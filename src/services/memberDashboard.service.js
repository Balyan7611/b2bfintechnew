import { apiService } from '../api/httpClient';

export const MemberDashboardService = {
    getOverview: async () => {
        return await apiService.get('/MemberDashboard/Overview');
    },
    getServices: async () => {
        return await apiService.get('/MemberDashboard/Services');
    },
    getAnalytics: async () => {
        return await apiService.get('/MemberDashboard/Analytics');
    },
    getRecentTransactions: async (count = 10) => {
        return await apiService.get(`/MemberDashboard/RecentTransactions?count=${count}`);
    }
};
