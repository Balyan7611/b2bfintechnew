const fs = require('fs');

try {
  let data = fs.readFileSync('eslint_errors.json', 'utf16le');
  if (data.charCodeAt(0) === 0xFEFF) data = data.slice(1);
  const errors = JSON.parse(data);
  let filesChanged = 0;

  errors.forEach(fileError => {
    if (!fileError.messages || fileError.messages.length === 0) return;
    
    const filePath = fileError.filePath;
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let lines = fileContent.split('\n');
    let modified = false;

    fileError.messages.forEach(msg => {
      const msgText = msg.message;
      const lineIdx = msg.line - 1; 
      if (lineIdx < 0 || lineIdx >= lines.length) return;
      
      let lineStr = lines[lineIdx];

      if (msgText.includes('Expected corresponding JSX closing tag for <td>')) {
        // This means there's an extra closing tag (usually </div>) that doesn't match <td>
        if (lineStr.includes('</div>')) {
          lines[lineIdx] = lineStr.replace('</div>', '');
          modified = true;
        } else if (lineStr.includes('</p>')) {
          lines[lineIdx] = lineStr.replace('</p>', '');
          modified = true;
        }
      } 
      else if (msgText.includes('Expected corresponding JSX closing tag for <div>')) {
        // This means a </div> is missing before a </td> or </tr>
        if (lineStr.includes('</td>')) {
          lines[lineIdx] = lineStr.replace('</td>', '</div></td>');
          modified = true;
        } else if (lineStr.includes('</tr>')) {
          const prevLine = lines[lineIdx - 1];
          if (prevLine && prevLine.includes('</td>')) {
             lines[lineIdx - 1] = prevLine.replace('</td>', '</div></td>');
             modified = true;
          }
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      filesChanged++;
    }
  });

  console.log('Fixed ' + filesChanged + ' files from ESLint JSON');
} catch (err) {
  console.error("Error running fix script:", err);
}
