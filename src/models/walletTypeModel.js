// src/models/walletTypeModel.js
export const WalletTypeResponseModel = (res) => {
    if (!res || !res.status) return [];

    // Backend actually returns: { data: { items: [...], totalItems, ... } }
    // (a paginated wrapper), not a bare array in `data`. Handle every shape
    // defensively so we never silently swallow the real list into one broken item.
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
        code: item.code || "",
        name: item.name || "",
        isActive: item.isActive === true
    }));
};

export const WalletTypeRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        name: data.name || "",
        isActive: data.isActive === true
    };
};
