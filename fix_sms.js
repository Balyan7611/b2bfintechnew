const fs = require('fs');

const filesToProcess = [
  { path: 'src/admin/components/SMSSettings/SMSCategory.jsx', arrayName: 'categories' },
  { path: 'src/admin/components/SMSSettings/SMSTemplate.jsx', arrayName: 'templates' },
  { path: 'src/admin/components/SMSSettings/SMSIntegration.jsx', arrayName: 'integrations' },
  { path: 'src/admin/components/SMSSettings/ManageSmsTemplate.jsx', arrayName: 'managedTemplates' }
];

filesToProcess.forEach(({ path, arrayName }) => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  
  // Replace array with empty array
  const arrayRegex = new RegExp('const ' + arrayName + ' = \\[[\\s\\S]*?\\];');
  content = content.replace(arrayRegex, 'const ' + arrayName + ' = [];');
  
  // Replace tbody map
  const mapRegex = new RegExp('(<tbody>\\s*)\\{' + arrayName + '\\.map\\(', 'g');
  const replacement = `$1{${arrayName}.length === 0 ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>No data available</td>
                </tr>
              ) : ${arrayName}.map(`;
  content = content.replace(mapRegex, replacement);
              
  fs.writeFileSync(path, content);
  console.log('Fixed:', path);
});
