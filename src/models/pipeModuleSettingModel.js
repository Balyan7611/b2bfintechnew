// src/models/pipeModuleSettingModel.js

const mapBoolean = (val) => val === true || val === 'true' || val === 1 || val === '1';

export const PipeModuleSettingResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
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
        createdBy: data.createdBy || null,
        createdDate: data.createdDate || new Date().toISOString(),
        modifiedBy: data.modifiedBy || null,
        modifiedDate: data.modifiedDate || new Date().toISOString(),
        rowVersion: data.rowVersion || ""
    };
};
