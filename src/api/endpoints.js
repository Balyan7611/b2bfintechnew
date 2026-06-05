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
    SectionTypeService
};