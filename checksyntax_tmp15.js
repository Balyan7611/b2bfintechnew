const parser = require('@babel/parser');
const fs = require('fs');
const f = 'src/App.jsx';
const code = fs.readFileSync(f, 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'objectRestSpread'] });
  console.log('OK:', f);
} catch (e) {
  console.log('ERROR:', e.message);
  process.exit(1);
}
