export const PackageResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id,
        roleId: item.roleId,
        code: item.code || "",
        name: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        billingType: item.billingType || "",
        isActive: item.isActive === true || item.isActive === 1,
        copySlabId: item.copySlabId || 0
    }));
};

export const PackageRequestModel = (data) => {
    return {
        id: data.id || 0,
        roleId: parseInt(data.roleId) || 0,
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        billingType: data.billingType || "",
        isActive: data.isActive === true || data.isActive === 1,
        copySlabId: parseInt(data.copySlabId) || 0
    };
};
