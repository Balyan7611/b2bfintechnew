import { apiService } from '../api/httpClient';

export const RoleService = {
    // GET /MasterRole?isActive=null
    getMasterRoles: async (isActive = null) => {
        return await apiService.get(`/MasterRole?isActive=${isActive}`);
    },

    // GET /MasterRole/1
    getRoles: async (id) => {
        return await apiService.get(`/MasterRole/${id}`);
    },

    // POST /MasterRole
    saveRole: async (data) => {
        return await apiService.post('/MasterRole', {
            id: data.id || 0,
            name: data.name || '',
            menustr: data.menustr || '',
            isActive: data.isActive === true,
        });
    },

    // PUT /MasterRole/UpdateMasterRole
    updateMasterRole: async (data) => {
        return await apiService.put('/MasterRole/UpdateMasterRole', {
            id: data.id || 0,
            name: data.name || '',
            menustr: data.menustr || '',
            isActive: data.isActive === true,
        });
    },

    // DELETE endpoint — used in endpoints.js as deleteRole
    // Path assumed as /MasterRole/{id}; update if backend uses a different route
    deleteRole: async (id) => {
        return await apiService.delete(`/MasterRole/${id}`);
    },

    // GET /Role?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAllRoles: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/Role?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /Role/1
    getRoleById: async (id) => {
        return await apiService.get(`/Role/${id}`);
    },

    // PUT /Role/UpdateRole
    updateRole: async (data) => {
        return await apiService.put('/Role/UpdateRole', {
            id: data.id || 0,
            prefix: data.prefix || '',
            name: data.name || '',
            startVal: data.startVal ?? null,
            roleCode: data.roleCode || '',
            description: data.description || '',
            service: data.service || '',
            menustr: data.menustr || '',
            packageID: data.packageID ?? null,
            isActive: data.isActive === true,
            outRole: data.outRole === true,
            typeRole: data.typeRole ?? null,
            defaultPackage: data.defaultPackage ?? null,
            price: data.price ?? null,
        });
    },
};
