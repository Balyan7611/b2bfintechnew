const fs = require('fs');

function fixTabs() {
  const aepsFile = 'src/member/components/MemberPanel/Services/Aeps.jsx';
  let aeps = fs.readFileSync(aepsFile, 'utf8');
  const aepsTabTarget = `className="aeps-portal-tabbar" style={{ display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '16px', gap: '6px', width: '100%', marginBottom: '16px' }}`;
  const aepsTabRes = `className="aeps-portal-tabbar" style={{ display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '16px', gap: '6px', width: '100%', marginBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}`;
  aeps = aeps.replace(aepsTabTarget, aepsTabRes);
  
  // also the inner map buttons need to flex shrink 0
  const aepsBtnTarget = `flex: 1,
                      display: 'flex',`;
  const aepsBtnRes = `flex: 1, minWidth: 'fit-content',
                      display: 'flex',`;
  aeps = aeps.replace(aepsBtnTarget, aepsBtnRes);
  
  fs.writeFileSync(aepsFile, aeps);

  const aadFile = 'src/member/components/MemberPanel/Services/AadharPay.jsx';
  let aad = fs.readFileSync(aadFile, 'utf8');
  // I applied flexWrap: 'wrap' earlier, let's change to overflowX: 'auto'
  const aadTabTarget = `<div style={{ display: 'flex', flexWrap: 'wrap', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                {[
                { id: 'AADHARPAY'`;
  const aadTabRes = `<div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {[
                { id: 'AADHARPAY'`;
  aad = aad.replace(aadTabTarget, aadTabRes);
  
  // button flex shrink fix
  const aadBtnTarget = `flex: 1,
                      display: 'flex',`;
  const aadBtnRes = `flex: 1, minWidth: 'fit-content',
                      display: 'flex',`;
  aad = aad.replace(aadBtnTarget, aadBtnRes);
  fs.writeFileSync(aadFile, aad);
}
fixTabs();
console.log('Fixed tabs scrolling on mobile');
