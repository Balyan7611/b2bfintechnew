const parser = require('@babel/parser');
const fs = require('fs');
const files = [
  'src/utils/authUtils.js',
  'src/App.jsx',
  'src/member/pages/LoginPage.jsx',
  'src/admin/pages/AdminLoginPage.jsx'
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
