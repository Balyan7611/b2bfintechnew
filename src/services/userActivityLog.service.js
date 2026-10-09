import { apiService } from '../api/httpClient';

export const UserActivityLogService = {
    // POST /UserActivityLog/log
    log: async (data = {}) => {
        return await apiService.post('/UserActivityLog/log', {
            area: data.area || '',
            page: data.page || '',
            referrer: data.referrer ?? null,
            userAgent: data.userAgent ?? null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            city: data.city ?? null,
            country: data.country ?? null,
        });
    },
};
