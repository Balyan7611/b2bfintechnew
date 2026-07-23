const parser = require('@babel/parser');
const fs = require('fs');
const code = fs.readFileSync('src/firebase.js', 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('OK - firebase.js parses fine');
} catch (e) {
  console.log('ERROR:', e.message);
}
