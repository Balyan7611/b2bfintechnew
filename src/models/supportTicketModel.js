export const SupportTicketResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        ticketId: item.ticketId || "",
        memberId: item.memberId || "",
        memberName: item.memberName || "",
        contactNumber: item.contactNumber || "",
        category: item.category || "",
        transactionId: item.transactionId || "",
        priority: item.priority || "",
        userMessage: item.userMessage || "",
        apiRequestPayload: item.apiRequestPayload || "",
        apiResponsePayload: item.apiResponsePayload || "",
        status: item.status || "",
        adminReply: item.adminReply || "",
        attachmentPath: item.attachmentPath || "",
        createdBy: item.createdBy || 0,
        modifiedBy: item.modifiedBy || 0,
        createdDate: item.createdDate || "",
        modifiedDate: item.modifiedDate || ""
    }));
};

export const SupportTicketRequestModel = (data) => {
    return {
        id: parseInt(data.id) || 0,
        ticketId: data.ticketId || "",
        memberId: data.memberId || "",
        memberName: data.memberName || "",
        contactNumber: data.contactNumber || "",
        category: data.category || "",
        transactionId: data.transactionId || "",
        priority: data.priority || "",
        userMessage: data.userMessage || "",
        apiRequestPayload: data.apiRequestPayload || "",
        apiResponsePayload: data.apiResponsePayload || "",
        status: data.status || "",
        adminReply: data.adminReply || "",
        createdBy: parseInt(data.createdBy) || 0,
        modifiedBy: parseInt(data.modifiedBy) || 0
    };
};

export const TicketConversationResponseModel = (res) => {
    if (!res || !res.status) return [];
    const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    return items.map(item => ({
        id: item.id || 0,
        ticketId: item.ticketId || "",
        memberId: item.memberId || "",
        message: item.message || "",
        senderType: item.senderType || "",
        attachmentPath: item.attachmentPath || "",
        createdDate: item.createdDate || ""
    }));
};
