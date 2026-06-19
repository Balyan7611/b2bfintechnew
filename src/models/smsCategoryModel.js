export const SmsCategoryResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        name: item.name || "",
        isActive: item.isActive === true || item.isActive === 1
    }));
};

export const SmsCategoryRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        name: data.name || "",
        isActive: data.isActive === true || data.isActive === 1
    };
};
