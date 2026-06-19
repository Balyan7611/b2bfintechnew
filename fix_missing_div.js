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
      // Syntax errors
      if (msg.message && (msg.message.includes('Expected corresponding JSX closing tag for <div>') || msg.message.includes('Adjacent JSX elements must be wrapped in an enclosing tag'))) {
        const lineIdx = msg.line - 1; // 0-indexed
        if (lineIdx < 0 || lineIdx >= lines.length) return;
        
        let lineStr = lines[lineIdx];
        
        // Usually the missing div is right before </td> or </tr>
        if (lineStr.includes('</td>')) {
          lines[lineIdx] = lineStr.replace('</td>', '</div></td>');
          modified = true;
        } else if (lineStr.includes('</tr>')) {
          // If the error points to </tr>, the td might be on the previous line
          const prevLine = lines[lineIdx - 1];
          if (prevLine && prevLine.includes('</td>')) {
             lines[lineIdx - 1] = prevLine.replace('</td>', '</div></td>');
             modified = true;
          }
        } else if (lineStr.includes('</p>')) {
          lines[lineIdx] = lineStr.replace('</p>', '</p></div>');
          modified = true;
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
