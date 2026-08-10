export const GenderResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id,
        name: item.name || ""
    }));
};

export const GenderRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        name: data.name || ""
    };
};
