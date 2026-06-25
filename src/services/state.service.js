import { apiService } from '../api/httpClient';
import { StateResponseModel } from '../models/stateModel';

export const StateService = {
    getAll: async () => {
        const res = await apiService.get('/State?PageNumber=1&PageSize=10000');
        return StateResponseModel(res);
    }
};
