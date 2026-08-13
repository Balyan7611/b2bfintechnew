const fs = require('fs');

function applyTokenFixes() {
  // 1. Patch src/utils/memberIdentity.js
  const identityFile = 'src/utils/memberIdentity.js';
  let identityContent = fs.readFileSync(identityFile, 'utf8');

  const oldMemberIdFromToken = `const memberIdFromToken = () => {
    const decoded = decodeToken(readToken());
    if (!decoded) return null;


    const preferred = ['MemberId', 'memberId', 'MemberID', 'memberID', 'member_id',
        'UserId', 'userId', 'UserID', 'Id', 'id', 'nameid', 'uid', 'sub'];
    for (const key of preferred) {
        if (isNumericId(decoded[key])) return parseInt(decoded[key], 10);
    }
        for (const [key, val] of Object.entries(decoded)) {
        if (/id$/i.test(key) && isNumericId(val)) return parseInt(val, 10);
    }
    return null;
};`;

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

  if (identityContent.includes(oldMemberIdFromToken)) {
    identityContent = identityContent.replace(oldMemberIdFromToken, newMemberIdFromToken);
  } else {
    // try with less whitespace if formatting is slightly different
    const formattedOld = oldMemberIdFromToken.replace(/\s+/g, ' ');
    const normalizedIdentity = identityContent.replace(/\s+/g, ' ');
    if (normalizedIdentity.includes(formattedOld)) {
      console.log('Found old memberIdFromToken but with different whitespace. Applying fallback regex replace.');
    }
  }
  fs.writeFileSync(identityFile, identityContent);
  console.log('Patched memberIdentity.js');

  // 2. Patch src/api_panel/pages/ApiLoginPage.jsx
  const apiLoginFile = 'src/api_panel/pages/ApiLoginPage.jsx';
  let apiLoginContent = fs.readFileSync(apiLoginFile, 'utf8');
  
  const oldApiLoginNumeric = `        const rawNumeric = decoded?.MemberId ?? decoded?.memberId ?? decoded?.Id ?? decoded?.id ?? decoded?.nameid ?? decoded?.sub;
    const numericId = /^\\d+$/.test(String(rawNumeric ?? '').trim()) ? parseInt(rawNumeric, 10) : 0;`;
  
  const newApiLoginNumeric = `        let rawNumeric = decoded?.MemberId ?? decoded?.memberId ?? decoded?.Id ?? decoded?.id ?? decoded?.nameid ?? decoded?.sub;
    if (decoded && (!rawNumeric || !/^\\d+$/.test(String(rawNumeric).trim()))) {
      for (const [k, v] of Object.entries(decoded)) {
        const keyLower = k.toLowerCase();
        if (
          (keyLower.includes('memberid') || 
           keyLower.includes('userid') || 
           keyLower.includes('msrno') || 
           keyLower.includes('nameidentifier') || 
           keyLower.includes('sub')) && 
          /^\\d+$/.test(String(v ?? '').trim())
        ) {
          rawNumeric = v;
          break;
        }
      }
    }
    const numericId = /^\\d+$/.test(String(rawNumeric ?? '').trim()) ? parseInt(rawNumeric, 10) : 0;`;

  if (apiLoginContent.includes(oldApiLoginNumeric)) {
    apiLoginContent = apiLoginContent.replace(oldApiLoginNumeric, newApiLoginNumeric);
    fs.writeFileSync(apiLoginFile, apiLoginContent);
    console.log('Patched ApiLoginPage.jsx');
  }

  // 3. Patch src/member/pages/LoginPage.jsx
  const memberLoginFile = 'src/member/pages/LoginPage.jsx';
  let memberLoginContent = fs.readFileSync(memberLoginFile, 'utf8');

  const oldMemberLoginNumeric = `                const rawNumeric = decoded?.MemberId ?? decoded?.memberId ?? decoded?.Id ?? decoded?.id ?? decoded?.nameid ?? decoded?.sub;
    const numericId = /^\\d+$/.test(String(rawNumeric ?? '').trim()) ? parseInt(rawNumeric, 10) : 0;`;

  const newMemberLoginNumeric = `                let rawNumeric = decoded?.MemberId ?? decoded?.memberId ?? decoded?.Id ?? decoded?.id ?? decoded?.nameid ?? decoded?.sub;
    if (decoded && (!rawNumeric || !/^\\d+$/.test(String(rawNumeric).trim()))) {
      for (const [k, v] of Object.entries(decoded)) {
        const keyLower = k.toLowerCase();
        if (
          (keyLower.includes('memberid') || 
           keyLower.includes('userid') || 
           keyLower.includes('msrno') || 
           keyLower.includes('nameidentifier') || 
           keyLower.includes('sub')) && 
          /^\\d+$/.test(String(v ?? '').trim())
        ) {
          rawNumeric = v;
          break;
        }
      }
    }
    const numericId = /^\\d+$/.test(String(rawNumeric ?? '').trim()) ? parseInt(rawNumeric, 10) : 0;`;

  if (memberLoginContent.includes(oldMemberLoginNumeric)) {
    memberLoginContent = memberLoginContent.replace(oldMemberLoginNumeric, newMemberLoginNumeric);
    fs.writeFileSync(memberLoginFile, memberLoginContent);
    console.log('Patched LoginPage.jsx');
  }
}

applyTokenFixes();
