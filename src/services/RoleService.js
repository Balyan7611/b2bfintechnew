import { RoleRequestModel, RoleResponseModel } from '../models/roleModel';
import { apiService } from '../api/httpClient';

export const RoleService = {
    getRoles: async () => {
        const res = await apiService.get('/Role?PageNumber=1&PageSize=10000');
        return RoleResponseModel(res);
    },
    
    saveRole: async (data) => {
        const method = (data.id && data.id > 0) ? 'put' : 'post';
        const url = (method === 'put') ? '/Role/UpdateRole' : '/Role';
        const payload = RoleRequestModel(data, null);
        return await apiService[method](url, payload);
    },
    
    deleteRole: async (id) => {
        return await apiService.post(`/Role/DeleteRole/${id}`, {});
    },

    // Standard CRUD placeholders for future scaling
    getRoleById: async (id) => {},
    
    getMasterRoles: async () => {
        const res = await apiService.get('/MasterRole?isActive=true');
        return res;
    }
};
