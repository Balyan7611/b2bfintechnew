// src/models/stateModel.js
export const StateResponseModel = (res) => {
    if (!res || !res.status) return [];
    const data = res.data;
    let items = [];
    if (data && Array.isArray(data.items)) {
        items = data.items;
    } else if (Array.isArray(data)) {
        items = data;
    } else if (data && !data.items) {
        items = [data];
    }
    return items.map(item => ({
        id: item.id,
        name: (item.name || "").trim(),
        stateCode: item.stateCode || "",
        countryId: item.countryId,
        countryName: item.countryName || "",
        isActive: item.isActive
    }));
};
