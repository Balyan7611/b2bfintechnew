// src/models/pipeMasterModel.js

const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const PipeMasterResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        serviceId: item.serviceId || 0,
        pipeName: item.pipeName || "",
        aliasName: item.aliasName || "",
        isActive: mapBoolean(item.isActive),
        createdBy: item.createdBy || null,
        createdOn: item.createdOn || "",
        modifiedBy: item.modifiedBy || null,
        modifiedOn: item.modifiedOn || "",
        rowVersion: item.rowVersion || ""
    }));
};

export const PipeMasterRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        serviceId: parseInt(data.serviceId) || 0,
        pipeName: data.pipeName || "",
        aliasName: data.aliasName || "",
        isActive: mapBoolean(data.isActive),
        createdBy: data.createdBy || null,
        createdOn: data.createdOn || new Date().toISOString(),
        modifiedBy: data.modifiedBy || null,
        modifiedOn: data.modifiedOn || new Date().toISOString(),
        rowVersion: data.rowVersion || ""
    };
};
