
const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const PipeModuleSettingResponseModel = (res) => {
    let items = [];
    try {
        if (Array.isArray(res)) items = res;
        else if (res && Array.isArray(res.data)) items = res.data;
        else if (res && res.data && Array.isArray(res.data.items)) items = res.data.items;
        else if (res && Array.isArray(res.items)) items = res.items;
        else if (res && res.data) items = [res.data];
    } catch (e) {
        console.error("Error parsing PipeModuleSettingResponseModel", e);
    }
    return items.map(item => ({
        id: item.id || 0,
        serviceId: item.serviceId || 0,
        pipe: item.pipe || "",
        moduleName: item.moduleName || "",
        isRequired: mapBoolean(item.isRequired),
        isface: mapBoolean(item.isface),
        isfinger: mapBoolean(item.isfinger),
        isIris: mapBoolean(item.isIris),
        isOtp: mapBoolean(item.isOtp),
        isTpin: mapBoolean(item.isTpin),
        wadhFace: item.wadhFace || "",
        wadhFinger: item.wadhFinger || "",
        wadhIris: item.wadhIris || "",
        createdBy: item.createdBy || null,
        createdDate: item.createdDate || "",
        modifiedBy: item.modifiedBy || null,
        modifiedDate: item.modifiedDate || "",
        rowVersion: item.rowVersion || ""
    }));
};

export const PipeModuleSettingRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        serviceId: parseInt(data.serviceId) || 0,
        pipe: data.pipe || "",
        moduleName: data.moduleName || "",
        isRequired: mapBoolean(data.isRequired),
        isface: mapBoolean(data.isface),
        isfinger: mapBoolean(data.isfinger),
        isIris: mapBoolean(data.isIris),
        isOtp: mapBoolean(data.isOtp),
        isTpin: mapBoolean(data.isTpin),
        wadhFace: data.wadhFace || "",
        wadhFinger: data.wadhFinger || "",
        wadhIris: data.wadhIris || "",
        createdBy: data.createdBy || "",
        createdDate: data.createdDate || new Date().toISOString(),
        modifiedBy: data.modifiedBy || "",
        modifiedDate: data.modifiedDate || new Date().toISOString(),
        rowVersion: data.rowVersion || ""
    };
};
