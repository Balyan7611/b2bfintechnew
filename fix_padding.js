const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
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
  const initialContent = content;
  
  // Replace large paddings inside colSpan cells
  // looking for padding: '50px 0', padding: '60px', padding: '80px' etc inside style
  content = content.replace(/padding:\s*['"](?:50|60|70|80|100)px\s*(?:0|)['"]/g, "'20px 0'");
  // Actually wait, some are padding: '50px', some are padding: '50px 0'
  content = content.replace(/padding:\s*['"](?:50|60|70|80|100)px['"]/g, "padding: '20px 0'");
  content = content.replace(/padding:\s*['"](?:50|60|70|80|100)px\s+0['"]/g, "padding: '20px 0'");

  // Remove the big FiDatabase/FaDatabase icon divs if they have big margins/fonts like fontSize: '2rem' inside the empty states to make it slim
  content = content.replace(/<div[^>]*>\s*<(?:Fi|Fa)Database[^>]*\/?>(?:<\/div>|)/g, '');
  content = content.replace(/<(?:Fi|Fa)Database[^>]*style={{[^}]*fontSize:\s*['"][2-3]rem['"][^}]*}}[^>]*\/>/g, '');

  if (content !== initialContent) {
    fs.writeFileSync(file, content);
    changed++;
  }
});
console.log('Fixed padding in ' + changed + ' files.');
