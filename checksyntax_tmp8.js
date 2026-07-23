const parser = require('@babel/parser');
const fs = require('fs');
const files = [
  'src/services/userLoginHistory.service.js',
  'src/App.jsx',
  'src/admin/pages/DashboardPage.jsx',
  'src/member/components/MemberPanel/MemberHeader.jsx',
  'src/api_panel/components/ApiHeader.jsx',
  'src/admin/components/SettingsPages/EmployeeLoginList.jsx'
];
let ok = true;
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'objectRestSpread'] });
    console.log('OK:', f);
  } catch (e) {
    ok = false;
    console.log('ERROR in', f, ':', e.message);
  }
}
process.exit(ok ? 0 : 1);
