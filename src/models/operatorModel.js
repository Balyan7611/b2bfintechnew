export const OperatorResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id,
        serviceId: item.serviceId,
        operatorCode: item.operatorCode || "",
        name: item.name || "",
        image: item.image || "",
        minVal: item.minVal || 0,
        maxVal: item.maxVal || 0,
        commission: item.commission || 0,
        isActive: item.isActive === true,
        isPending: item.isPending === true,
        isOffLine: item.isOffLine === true
    }));
};

export const OperatorRequestModel = (data) => {
    return {
        id: data.id || 0,
        serviceId: parseInt(data.serviceId) || 0,
        operatorCode: data.operatorCode || "",
        name: data.name || "",
        minVal: parseFloat(data.minVal) || 0,
        maxVal: parseFloat(data.maxVal) || 0,
        commission: parseFloat(data.commission) || 0,
        isActive: data.isActive === true,
        isPending: data.isPending === true,
        isOffLine: data.isOffLine === true
    };
};
