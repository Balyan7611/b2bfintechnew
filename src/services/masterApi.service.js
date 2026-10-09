import { apiService } from '../api/httpClient';

const buildMasterApiPayload = (data) => ({
    id: data.id || 0,
    apiid: data.apiid || null,
    apiname: data.apiname ?? null,
    url: data.url ?? null,
    prm1: data.prm1 ?? null,
    prm1val: data.prm1val ?? null,
    prm2: data.prm2 ?? null,
    prm2val: data.prm2val ?? null,
    prm3: data.prm3 ?? null,
    prm4: data.prm4 ?? null,
    prm5: data.prm5 ?? null,
    prm6: data.prm6 ?? null,
    prm7: data.prm7 ?? null,
    prm8: data.prm8 ?? null,
    prm9: data.prm9 ?? null,
    prm9val: data.prm9val ?? null,
    prm10: data.prm10 ?? null,
    prm10val: data.prm10val ?? null,
    txIdposition: data.txIdposition ?? null,
    statusPosition: data.statusPosition ?? null,
    success: data.success ?? null,
    failed: data.failed ?? null,
    pending: data.pending ?? null,
    operatorRefPosition: data.operatorRefPosition ?? null,
    errorCodePosition: data.errorCodePosition ?? null,
    balanceUrl: data.balanceUrl ?? null,
    bPrm1: data.bPrm1 ?? null,
    bPrm1val: data.bPrm1val ?? null,
    bPrm2: data.bPrm2 ?? null,
    bPrm2val: data.bPrm2val ?? null,
    bPrm3: data.bPrm3 ?? null,
    bPrm3val: data.bPrm3val ?? null,
    bPrm4: data.bPrm4 ?? null,
    bPrm4val: data.bPrm4val ?? null,
    bBalancePosition: data.bBalancePosition ?? null,
    statusUrl: data.statusUrl ?? null,
    sPrm1: data.sPrm1 ?? null,
    sPrm1val: data.sPrm1val ?? null,
    sPrm2: data.sPrm2 ?? null,
    sPrm2val: data.sPrm2val ?? null,
    sPrm3: data.sPrm3 ?? null,
    sPrm4: data.sPrm4 ?? null,
    sStatusPosition: data.sStatusPosition ?? null,
    sOpraterRefPosition: data.sOpraterRefPosition ?? null,
    sApiTransPosition: data.sApiTransPosition ?? null,
    orderIdcallBack: data.orderIdcallBack ?? null,
    statusCallBack: data.statusCallBack ?? null,
    transIdcallBack: data.transIdcallBack ?? null,
    requestIdcallBack: data.requestIdcallBack ?? null,
    opeRefNoCallBack: data.opeRefNoCallBack ?? null,
    callBackUrl: data.callBackUrl ?? null,
    splitter: data.splitter ?? null,
    combineParam: data.combineParam ?? null,
    combineKey: data.combineKey ?? null,
    combineKeyParam: data.combineKeyParam ?? null,
    combineKeyParamB: data.combineKeyParamB ?? null,
    combineKeyParamS: data.combineKeyParamS ?? null,
    xmlKeyRecharge: data.xmlKeyRecharge ?? null,
    xmlKeyStatus: data.xmlKeyStatus ?? null,
    xmlKeyBalance: data.xmlKeyBalance ?? null,
    statusBalance: data.statusBalance ?? null,
    descriptionBalance: data.descriptionBalance ?? null,
    alogorithmName: data.alogorithmName ?? null,
    backUrlKey: data.backUrlKey ?? null,
    apitypeId: data.apitypeId ?? null,
    isDelete: data.isDelete ?? null,
    isActive: data.isActive ?? null,
    createdBy: data.createdBy || null,
    modifiedBy: data.modifiedBy ?? null,
});

export const MasterApiService = {
    // GET /MasterApi/get-all?PageNumber=1&PageSize=1&FromDate=&ToDate=&Status=&MemberID=1&WalletTypeId=1
    getAll: async (params = {}) => {
        const pageNumber = params.pageNumber ?? 1;
        const pageSize = params.pageSize ?? 100;
        const fromDate = params.fromDate ?? '';
        const toDate = params.toDate ?? '';
        const status = params.status ?? '';
        const memberID = params.memberID ?? '';
        const walletTypeId = params.walletTypeId ?? '';
        return await apiService.get(
            `/MasterApi/get-all?PageNumber=${pageNumber}&PageSize=${pageSize}&FromDate=${fromDate}&ToDate=${toDate}&Status=${status}&MemberID=${memberID}&WalletTypeId=${walletTypeId}`
        );
    },

    // GET /MasterApi/get-by-id/1
    getById: async (id) => {
        return await apiService.get(`/MasterApi/get-by-id/${id}`);
    },

    // POST /MasterApi/create
    create: async (data) => {
        return await apiService.post('/MasterApi/create', buildMasterApiPayload(data));
    },

    // POST /MasterApi/update  (API uses POST per curl spec)
    update: async (data) => {
        return await apiService.post('/MasterApi/update', buildMasterApiPayload(data));
    },

    // DELETE /MasterApi/delete/1
    delete: async (id) => {
        return await apiService.delete(`/MasterApi/delete/${id}`);
    },
};
