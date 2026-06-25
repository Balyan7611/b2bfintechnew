import os

replacements = {
    "'/Company/get-all'": "'/Company/get-all?PageNumber=1&PageSize=10000'",
    "'/CompanyBankDetail/GetCompanyBankDetail'": "'/CompanyBankDetail/GetCompanyBankDetail?PageNumber=1&PageSize=10000'",
    "'/Gender'": "'/Gender?PageNumber=1&PageSize=10000'",
    "'/MemberBankDetail/GetMemberBankDetail'": "'/MemberBankDetail/GetMemberBankDetail?PageNumber=1&PageSize=10000'",
    "'/MemberSecurity/GetMemberSecurity'": "'/MemberSecurity/GetMemberSecurity?PageNumber=1&PageSize=10000'",
    "'/Package'": "'/Package?PageNumber=1&PageSize=10000'",
    "'/ParentChangeInformation/GetParentChangeInformation'": "'/ParentChangeInformation/GetParentChangeInformation?PageNumber=1&PageSize=10000'",
    "'/PipeMaster/GetPipeMaster'": "'/PipeMaster/GetPipeMaster?PageNumber=1&PageSize=10000'",
    "'/PipeModuleSetting/GetPipeModuleSetting'": "'/PipeModuleSetting/GetPipeModuleSetting?PageNumber=1&PageSize=10000'",
    "'/PrivacyPolicy/GetPrivacyPolicy'": "'/PrivacyPolicy/GetPrivacyPolicy?PageNumber=1&PageSize=10000'",
    "'/RefundPolicy/GetRefundPolicy'": "'/RefundPolicy/GetRefundPolicy?PageNumber=1&PageSize=10000'",
    "'/Role'": "'/Role?PageNumber=1&PageSize=10000'",
    "'/Smscategory/GetSmscategory'": "'/Smscategory/GetSmscategory?PageNumber=1&PageSize=10000'",
    "'/Smssetting/GetSmssetting'": "'/Smssetting/GetSmssetting?PageNumber=1&PageSize=10000'",
    "'/Smstemplate/GetSmstemplate'": "'/Smstemplate/GetSmstemplate?PageNumber=1&PageSize=10000'",
    "'/State'": "'/State?PageNumber=1&PageSize=10000'",
    "'/TermsCondition/GetTermsCondition'": "'/TermsCondition/GetTermsCondition?PageNumber=1&PageSize=10000'",
    "'/UserLoginHistory/GetUserLoginHistory'": "'/UserLoginHistory/GetUserLoginHistory?PageNumber=1&PageSize=10000'",
    "'/WalletType'": "'/WalletType?PageNumber=1&PageSize=10000'"
}

count = 0
for root, dirs, files in os.walk('src/services'):
    for file in files:
        if file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for old, new in replacements.items():
                content = content.replace(f"apiService.get({old})", f"apiService.get({new})")
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
                count += 1

print(f"Updated {count} files.")
