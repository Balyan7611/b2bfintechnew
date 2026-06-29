// src/api/endpoints.js
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
import { MemberBankDetailService } from '../services/memberBankDetail.service';
import { SmsCategoryService } from '../services/smsCategory.service';
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

// Re-exporting everything exactly as before to maintain backward compatibility
export const API = {
    login: AuthService.login,
    getRoles: RoleService.getRoles,
    getMasterRoles: RoleService.getMasterRoles,
    getCompanyDetails: CompanyService.getCompanyDetails,
    saveRole: RoleService.saveRole,
    deleteRole: RoleService.deleteRole,
    
    // New dynamic API configurations
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
    privacyPolicy: PrivacyPolicyService,
    refundPolicy: RefundPolicyService,
    termsCondition: TermsConditionService,
    pipeMaster: PipeMasterService,
    pipeModuleSetting: PipeModuleSettingService,
    companyBankDetail: CompanyBankDetailService,
    memberBankDetail: MemberBankDetailService,
    smsCategory: SmsCategoryService,
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
    MemberBankDetailService,
    SmsCategoryService,
    SmsSettingService,
    SmsTemplateService,
    MemberSecurityService,
    ParentChangeInformationService,
    UserLoginHistoryService,
    KycDocumentService,
    BbpsDataDownService,
    BannerTypeService,
    BannerImageService,
    UserWalletBalanceService
};