// src/models/roleModel.js
export const RoleResponseModel = (res) => {
    console.log("RoleResponseModel raw response:", res);
    if (!res) {
        return [];
    }

    let arr = [];
    if (Array.isArray(res)) {
        arr = res;
    } else if (res.data && Array.isArray(res.data)) {
        arr = res.data;
    } else if (res.data && Array.isArray(res.data.items)) {
        arr = res.data.items;
    } else if (res.data && typeof res.data === 'object') {
        arr = [res.data];
    } else if (typeof res === 'object' && !res.status && !res.data) {
        // Fallback for object wrapper without data property
        arr = [res];
    }

    return arr.map(item => ({
        id: item.id,
        name: item.name,
        prefix: item.prefix,
        roleCode: item.roleCode,
        startId: item.startVal,
        price: item.price,
        status: item.isActive === true || item.isActive === 1,
        addDate: item.createdDate ? item.createdDate.split('T')[0] : '',
        regCount: item.startVal,
        menuStr: item.menustr,
        service: item.service,
        packageId: item.packageID,
        outside: item.outSide !== undefined ? item.outSide : item.outRole,
        typeRole: item.typeRole,
        packageList: item.packageList || [],
        serviceList: item.serviceList || []
    }));
};

export const RoleRequestModel = (data, security = null) => {
    const payload = {
        id: data.id || 0,
        prefix: data.prefix || "",
        name: data.name || "",
        roleCode: data.roleCode || "",
        startVal: parseInt(data.startId) || 0,
        description: data.description || "string",
        service: data.service || "string",
        menustr: data.menuStr || "1,2,3",
        packageID: parseInt(data.packageId) || 0,
        isActive: data.status === true || data.status === 1,
        outSide: data.outside === true || data.outside === 1,
        outRole: data.outside === true || data.outside === 1,
        typeRole: parseInt(data.typeRole) || 0,
        defaultPackage: data.defaultPackage || 0,
        price: parseFloat(data.price) || 0
    };
    
    if (security) {
        payload.ip = security.ip;
        payload.deviceInfo = security.deviceInfo;
        payload.location = security.location;
    }
    
    return payload;
};