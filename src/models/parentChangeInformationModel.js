export const ParentChangeInformationResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        msrno: item.msrno || 0,
        previousRoleId: item.previousRoleId || 0,
        currentRoleId: item.currentRoleId || 0,
        previousParentId: item.previousParentId || 0,
        currentParentId: item.currentParentId || 0,
        isDelete: item.isDelete === true || item.isDelete === 1
    }));
};

export const ParentChangeInformationRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        msrno: parseInt(data.msrno) || 0,
        previousRoleId: parseInt(data.previousRoleId) || 0,
        currentRoleId: parseInt(data.currentRoleId) || 0,
        previousParentId: parseInt(data.previousParentId) || 0,
        currentParentId: parseInt(data.currentParentId) || 0,
        isDelete: data.isDelete === true || data.isDelete === 1
    };
};
