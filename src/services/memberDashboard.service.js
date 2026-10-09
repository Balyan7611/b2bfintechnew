import { apiService } from '../api/httpClient';

export const MemberDashboardService = {
    // GET /MemberDashboard/Overview
    getOverview: async () => {
        return await apiService.get('/MemberDashboard/Overview');
    },

    // GET /MemberDashboard/Services
    getServices: async () => {
        return await apiService.get('/MemberDashboard/Services');
    },

    // GET /MemberDashboard/Analytics
    getAnalytics: async () => {
        return await apiService.get('/MemberDashboard/Analytics');
    },

    // GET /MemberDashboard/RecentTransactions?count=10
    getRecentTransactions: async (count = 10) => {
        return await apiService.get(`/MemberDashboard/RecentTransactions?count=${count}`);
    },
};
