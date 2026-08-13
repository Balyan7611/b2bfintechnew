const fs = require('fs');

function applyTokenFixesRegex() {
  const identityFile = 'src/utils/memberIdentity.js';
  let identityContent = fs.readFileSync(identityFile, 'utf8');

  // Regex replacement for memberIdFromToken
  const regex = /const memberIdFromToken = \(\) => \{[\s\S]+?return null;\s*\};/;
  
  const newMemberIdFromToken = `const memberIdFromToken = () => {
    const decoded = decodeToken(readToken());
    if (!decoded) return null;

    const preferred = ['MemberId', 'memberId', 'MemberID', 'memberID', 'member_id',
        'UserId', 'userId', 'UserID', 'Id', 'id', 'nameid', 'uid', 'sub'];
    for (const key of preferred) {
        if (isNumericId(decoded[key])) return parseInt(decoded[key], 10);
    }
    for (const [key, val] of Object.entries(decoded)) {
        const keyLower = key.toLowerCase();
        if (
            (keyLower.includes('memberid') || 
             keyLower.includes('userid') || 
             keyLower.includes('msrno') || 
             keyLower.includes('nameidentifier') || 
             keyLower.includes('sub')) && 
            isNumericId(val)
        ) {
            return parseInt(val, 10);
        }
    }
    for (const [key, val] of Object.entries(decoded)) {
        if (/id$/i.test(key) && isNumericId(val)) return parseInt(val, 10);
    }
    return null;
};`;

  if (regex.test(identityContent)) {
    identityContent = identityContent.replace(regex, newMemberIdFromToken);
    fs.writeFileSync(identityFile, identityContent);
    console.log('Successfully patched memberIdentity.js with regex');
  } else {
    console.log('Regex did not match memberIdFromToken in memberIdentity.js');
  }
}
applyTokenFixesRegex();
