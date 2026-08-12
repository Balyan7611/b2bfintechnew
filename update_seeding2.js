const fs = require('fs');
const file = 'src/member/components/MemberPanel/Services/AadharPay.jsx';
let c = fs.readFileSync(file, 'utf8');
const lines = c.split(/\r?\n/);
const startIdx = lines.findIndex(l => l.includes("{ title: 'UIDAI — Bank Seeding Status', desc: 'Aadhaar kis bank se link hai, online check kare', icon: '🏦' }"));
if(startIdx !== -1) {
  lines[startIdx] = `                    { title: 'UIDAI — Bank Seeding Status', desc: 'Aadhaar kis bank se link hai, online check kare', icon: '🏦', link: 'https://myaadhaar.uidai.gov.in/bank-seeding-status' },`;
  lines[startIdx+1] = `                    { title: '*99*99*1#', desc: 'Bina internet ke phone se seeding status', icon: '📞', link: '' },`;
  lines[startIdx+2] = `                    { title: 'NPCI — APB FAQs', desc: 'Aadhaar mapper / seeding ki puri jaankari', icon: 'ℹ️', link: 'https://www.npci.org.in/what-we-do/nach/aadhaar-payment-bridge/faqs' }`;
  
  const mapStart = startIdx + 3;
  const divStart = lines.findIndex((l, i) => i >= mapStart && l.includes('<div key={idx}'));
  
  lines[divStart] = `                    <div 
                      key={idx} 
                      onClick={() => { if (item.link) window.open(item.link, '_blank'); }}
                      style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: item.link ? 'pointer' : 'default', background: '#fff', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { if(item.link) { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; } }}
                      onMouseOut={(e) => { if(item.link) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; } }}
                    >`;

  const arrowLine = lines.findIndex((l, i) => i > divStart && l.includes("<span style={{ color: '#94A3B8' }}>→</span>"));
  if (arrowLine !== -1) {
    lines[arrowLine] = `                      {item.link ? <span style={{ color: '#94A3B8', fontSize: '1.2rem' }}>🌐</span> : <span style={{ color: '#94A3B8', fontSize: '1rem' }}>→</span>}`;
  }
  
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully updated AadharPay.jsx');
} else {
  console.log('Failed to find start line');
}
