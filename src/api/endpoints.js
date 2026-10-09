import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/RoleService';
import { CompanyService } from '../services/company.service';
import { PackageService } from '../services/package.service';
import { ServiceManagementService } from '../services/service.service';
import { OperatorService } from '../services/operator.service';
import { BankService } from '../services/bank.service';
import { GenderService } from '../services/gender.service';
import { WalletTypeService } from '../services/walletType.service';
import { SectionTypeService } from '../services/sectionType.service';
import { StateService } from '../services/state.service';
import { MemberService } from '../services/member.service';
import { PrivacyPolicyService } from '../services/privacyPolicy.service';
import { RefundPolicyService } from '../services/refundPolicy.service';
import { TermsConditionService } from '../services/termsCondition.service';
import { PipeMasterService } from '../services/pipeMaster.service';
import { PipeModuleSettingService } from '../services/pipeModuleSetting.service';
import { CompanyBankDetailService } from '../services/companyBankDetail.service';
import { FundRequestService } from '../services/fundRequest.service';
import { MemberBankDetailService } from '../services/memberBankDetail.service';
import { SmsCategoryService } from '../services/smsCategory.service';
import { SmsLogService } from '../services/smsLog.service';
import { SmsSettingService } from '../services/smsSetting.service';
import { SmsTemplateService } from '../services/smsTemplate.service';
import { MemberSecurityService } from '../services/memberSecurity.service';
import { ParentChangeInformationService } from '../services/parentChangeInformation.service';
import { UserLoginHistoryService } from '../services/userLoginHistory.service';
import { KycDocumentService } from '../services/kycDocument.service';
import { BbpsDataDownService } from '../services/bbpsDataDown.service';
import { BannerTypeService } from './../services/bannerType.service';
import { BannerImageService } from './../services/bannerImage.service';
import { UserWalletBalanceService } from '../services/userWalletBalance.service';
import { WalletLedgerService } from '../services/walletLedger.service';
import { TransactionService } from '../services/transaction.service';
import { SupportTicketService } from '../services/supportTicket.service';
import { TicketConversationService } from '../services/ticketConversation.service';
import { MasterApiService } from '../services/masterApi.service';
import { LogsServiceDatumService } from '../services/logsServiceDatum.service';
import { MemberServiceService } from '../services/memberService.service';
import { IpAuthanticateService } from '../services/ipAuthanticate.service';
import { ClientCredentialService } from '../services/clientCredential.service';
import { ApiSwitchingConceptService } from '../services/apiSwitchingConcept.service';
import { MemberWebhookService } from '../services/memberWebhook.service';
import { AdminDashboardService } from '../services/adminDashboard.service';
import { MemberDashboardService } from '../services/memberDashboard.service';
import { AepsBankMasterService } from '../services/aepsBankMaster.service';
import { ApiAnalysisService } from '../services/apiAnalysis.service';
import { BusinessAnalysisService } from '../services/businessAnalysis.service';
import { CommissionService } from '../services/commission.service';
import { CommissionLedgerService } from '../services/commissionLedger.service';
import { CountryService } from '../services/country.service';
import { DeviceListService } from '../services/deviceList.service';
import { MemberKYCDocumentsService } from '../services/memberKYCDocuments.service';
import { MenuService } from '../services/menu.service';
import { NotificationService } from '../services/notification.service';
import { PageListService } from '../services/pageList.service';
import { PermissionPageService } from '../services/permissionPage.service';
import { UserActivityLogService } from '../services/userActivityLog.service';
import { UserCredentialHistoryService } from '../services/userCredentialHistory.service';
import { VerificationService } from '../services/verification.service';

export const API = {
    login: AuthService.login,
    verifyLoginOtp: AuthService.verifyLoginOtp,
    verifyLoginTpin: AuthService.verifyLoginTpin,
    forgetPassword: AuthService.forgetPassword,
    verifyForgetPassword: AuthService.verifyForgetPassword,
    forgetTpin: AuthService.forgetTpin,
    verifyForgetPin: AuthService.verifyForgetPin,
    getRoles: RoleService.getRoles,
    getMasterRoles: RoleService.getMasterRoles,
    getCompanyDetails: CompanyService.getCompanyDetails,
    saveRole: RoleService.saveRole,
    deleteRole: RoleService.deleteRole,

        company: CompanyService,
    package: PackageService,
    service: ServiceManagementService,
    operator: OperatorService,
    bank: BankService,
    gender: GenderService,
    walletType: WalletTypeService,
    sectionType: SectionTypeService,
    state: StateService,
    member: MemberService,
    memberService: MemberServiceService,
    memberWebhook: MemberWebhookService,
    privacyPolicy: PrivacyPolicyService,
    refundPolicy: RefundPolicyService,
    termsCondition: TermsConditionService,
    pipeMaster: PipeMasterService,
    pipeModuleSetting: PipeModuleSettingService,
    companyBankDetail: CompanyBankDetailService,
    fundRequest: FundRequestService,
    memberBankDetail: MemberBankDetailService,
    smsCategory: SmsCategoryService,
    smsLog: SmsLogService,
    smsSetting: SmsSettingService,
    smsTemplate: SmsTemplateService,
    memberSecurity: MemberSecurityService,
    parentChangeInformation: ParentChangeInformationService,
    userLoginHistory: UserLoginHistoryService,
    kycDocument: KycDocumentService,
    bbpsDataDown: BbpsDataDownService,
    bannerType: BannerTypeService,
    bannerImage: BannerImageService,
    userWalletBalance: UserWalletBalanceService,
    walletLedger: WalletLedgerService,
    transaction: TransactionService,
    supportTicket: SupportTicketService,
    ticketConversation: TicketConversationService,
    masterApi: MasterApiService,
    logsServiceDatum: LogsServiceDatumService,
    ipAuthanticate: IpAuthanticateService,
    clientCredential: ClientCredentialService,
    apiSwitchingConcept: ApiSwitchingConceptService,
    adminDashboard: AdminDashboardService,
    memberDashboard: MemberDashboardService,
    aepsBankMaster: AepsBankMasterService,
    apiAnalysis: ApiAnalysisService,
    businessAnalysis: BusinessAnalysisService,
    commission: CommissionService,
    commissionLedger: CommissionLedgerService,
    country: CountryService,
    deviceList: DeviceListService,
    memberKYCDocuments: MemberKYCDocumentsService,
    menu: MenuService,
    notification: NotificationService,
    pageList: PageListService,
    permissionPage: PermissionPageService,
    userActivityLog: UserActivityLogService,
    userCredentialHistory: UserCredentialHistoryService,
    verification: VerificationService,
    apiPartnerDashboard: require('../services/apiPartnerDashboard.service').ApiPartnerDashboardService,
};

export const fetchCompanyData = CompanyService.fetchCompanyData;
export {
    CompanyService,
    PackageService,
    ServiceManagementService,
    OperatorService,
    BankService,
    GenderService,
    WalletTypeService,
    SectionTypeService,
    StateService,
    PrivacyPolicyService,
    RefundPolicyService,
    TermsConditionService,
    PipeMasterService,
    PipeModuleSettingService,
    CompanyBankDetailService,
    FundRequestService,
    MemberBankDetailService,
    SmsCategoryService,
    SmsLogService,
    SmsSettingService,
    SmsTemplateService,
    MemberSecurityService,
    ParentChangeInformationService,
    UserLoginHistoryService,
    KycDocumentService,
    BbpsDataDownService,
    BannerTypeService,
    BannerImageService,
    UserWalletBalanceService,
    WalletLedgerService,
    SupportTicketService,
    TicketConversationService,
    MasterApiService,
    LogsServiceDatumService,
    AepsBankMasterService,
    ApiAnalysisService,
    BusinessAnalysisService,
    CommissionService,
    CommissionLedgerService,
    CountryService,
    DeviceListService,
    MemberKYCDocumentsService,
    MenuService,
    NotificationService,
    PageListService,
    PermissionPageService,
    UserActivityLogService,
    UserCredentialHistoryService,
    VerificationService,
};
