import { apiService } from '../api/httpClient';

export const AdminDashboardService = {
    getOverview: async () => {
        return await apiService.get('/Admin/AdminDashboard/Overview');
    },
    getRecentTransactions: async (count = 10) => {
        return await apiService.get(`/Admin/AdminDashboard/RecentTransactions?count=${count}`);
    }
};
