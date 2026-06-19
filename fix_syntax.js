const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/admin/components');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix various combinations of '20px 0' missing the "padding: " key
  content = content.replace(/style={{\s*'20px 0'\s*}}/g, "style={{ padding: '20px 0' }}");
  content = content.replace(/,\s*'20px 0'\s*,/g, ", padding: '20px 0',");
  content = content.replace(/,\s*'20px 0'\s*}/g, ", padding: '20px 0' }");
  content = content.replace(/style={{\s*'20px 0'\s*,/g, "style={{ padding: '20px 0',");
  content = content.replace(/textAlign:\s*'center',\s*'20px 0'/g, "textAlign: 'center', padding: '20px 0'");

  // some files had a global replace `style={{ '20px 0', color: ... }}`
  // Let's just do a blind replace of `'20px 0'` inside style if it's preceded by `{` or `,` and not `padding:`
  // Actually the above 5 replacements cover almost everything perfectly.
  
  // also check for: style={{ '20px 0' }}
  // also check for: style={{ textAlign: 'center', '20px 0', color: '#A0AEC0' }}

  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
  }
});

console.log('Fixed invalid padding syntax in ' + changed + ' files.');
