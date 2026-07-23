const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const srcDir = path.join(process.cwd(), 'src');
let files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(js|jsx)$/.test(f)) files.push(full);
  }
}
walk(srcDir);

let errors = [];
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'objectRestSpread', 'dynamicImport']
    });
  } catch (e) {
    errors.push(file + ' -- ' + e.message);
  }
}
console.log('Checked', files.length, 'files.');
console.log('Errors:', errors.length);
errors.forEach(e => console.log(e));
