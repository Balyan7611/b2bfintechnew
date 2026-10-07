const { transformFileSync } = require('@babel/core');
const files = [
  'src/admin/components/KYCPages/KYCDocuments.jsx',
  'src/admin/components/KYCPages/UploadKYC.jsx',
  'src/admin/components/KYCPages/KYCDetails.jsx',
];
let failed = 0;
for (const f of files) {
  try { transformFileSync(f, { presets: ['@babel/preset-react', '@babel/preset-env'] }); console.log('OK: ' + f); }
  catch (e) { failed++; console.log('FAIL: ' + f + ' -- ' + e.message.split('\n')[0]); }
}
process.exit(failed ? 1 : 0);
