// src/models/serviceModel.js
export const ServiceResponseModel = (res) => {
    if (!res || !res.status) return [];

    // Backend paginated endpoints wrap the list as { data: { items: [...] } },
    // not a bare array in `data` - handle every shape defensively so the real
    // list is never silently swallowed into one broken fake item.
    let items = [];
    if (Array.isArray(res.data)) {
        items = res.data;
    } else if (res.data && Array.isArray(res.data.items)) {
        items = res.data.items;
    } else if (Array.isArray(res.items)) {
        items = res.items;
    } else if (res.data) {
        items = [res.data];
    }

    return items.map(item => ({
        id: item.id,
        name: item.name || "",
        sectionType: item.sectionType || 0,
        apiid: item.apiid || 0,
        userId: item.userId || null,
        url: item.url || "",
        image: item.imageUrl || item.image || "",
        icon: item.icon || "",
        onTime: item.onTime || 0,
        offTime: item.offTime || 0,
        orderBy: item.orderBy || 0,
        reason: item.reason || "",
        price: item.price || 0,
        tds: item.tds || 0,
        isGst: item.isGst === true,
        gst: item.gst === true,
        isTds: item.isTds === true,
        isKyc: item.isKyc === true,
        isActive: item.isActive === true,
        isNew: item.isNew === true,
        isComming: item.isComming === true,
        onoff: item.onoff === true,
        createdDate: item.createdDate,
        modifiedDate: item.modifiedDate
    }));
};

export const ServiceRequestModel = (data) => {
    return {
        id: data.id || 0,
        name: data.name || "",
        sectionType: parseInt(data.sectionType) || 0,
        apiid: parseInt(data.apiid) || 0,
        userId: parseInt(data.userId) || null,
        url: data.url || "",
        image: data.image || "",
        imageUrl: data.image || "",
        icon: data.icon || "",
        onTime: parseInt(data.onTime) || 0,
        offTime: parseInt(data.offTime) || 0,
        orderBy: parseInt(data.orderBy) || 0,
        reason: data.reason || "",
        price: parseFloat(data.price) || 0,
        tds: parseFloat(data.tds) || 0,
        isGst: data.isGst === true || data.gstApply === true,
        gst: data.gst === true || data.gstApply === true,
        isTds: data.isTds === true || data.tdsApply === true,
        isKyc: data.isKyc === true,
        isActive: data.isActive === true || data.status === true,
        isNew: data.isNew === true,
        isComming: data.isComming === true || data.commingSoon === true,
        onoff: data.onoff === true || data.onOff === true
    };
};
