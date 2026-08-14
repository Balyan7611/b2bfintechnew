
const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const PipeMasterResponseModel = (res) => {
    let items = [];
    try {
        if (Array.isArray(res)) items = res;
        else if (res && Array.isArray(res.data)) items = res.data;
        else if (res && res.data && Array.isArray(res.data.items)) items = res.data.items;
        else if (res && Array.isArray(res.items)) items = res.items;
        else if (res && res.data) items = [res.data];
    } catch (e) {
        console.error("Error parsing PipeMasterResponseModel", e);
    }
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
        createdBy: data.createdBy || "",
        createdOn: data.createdOn || new Date().toISOString(),
        modifiedBy: data.modifiedBy || "",
        modifiedOn: data.modifiedOn || new Date().toISOString(),
        rowVersion: data.rowVersion || ""
    };
};
