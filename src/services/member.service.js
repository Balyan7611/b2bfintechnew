import { apiService } from '../api/httpClient';

export const MemberService = {
    createMember: async (data) => {
        return await apiService.post('/Member/create-member', data);
    }
};
