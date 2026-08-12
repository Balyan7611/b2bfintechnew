const fs = require('fs');

function updateAadharPay() {
  let c = fs.readFileSync('src/member/components/MemberPanel/Services/AadharPay.jsx', 'utf8');

  const target = `                  {[
                    { title: 'UIDAI — Bank Seeding Status', desc: 'Aadhaar kis bank se link hai, online check kare', icon: '🏦' },
                    { title: '*99*99*1#', desc: 'Bina internet ke phone se seeding status', icon: '📞' },
                    { title: 'NPCI — APB FAQs', desc: 'Aadhaar mapper / seeding ki puri jaankari', icon: 'ℹ️' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#fff' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#0D1B5E' }}>{item.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{item.desc}</p>
                        </div>
                      </div>
                      <span style={{ color: '#94A3B8' }}>→</span>
                    </div>
                  ))}`;

  const replacement = `                  {[
                    { title: 'UIDAI — Bank Seeding Status', desc: 'Aadhaar kis bank se link hai, online check kare', icon: '🏦', link: 'https://myaadhaar.uidai.gov.in/bank-seeding-status' },
                    { title: '*99*99*1#', desc: 'Bina internet ke phone se seeding status', icon: '📞', link: '' },
                    { title: 'NPCI — APB FAQs', desc: 'Aadhaar mapper / seeding ki puri jaankari', icon: 'ℹ️', link: 'https://www.npci.org.in/what-we-do/nach/aadhaar-payment-bridge/faqs' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { if (item.link) window.open(item.link, '_blank'); }}
                      style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: item.link ? 'pointer' : 'default', background: '#fff', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { if(item.link) { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; } }}
                      onMouseOut={(e) => { if(item.link) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; } }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#0D1B5E' }}>{item.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{item.desc}</p>
                        </div>
                      </div>
                      {item.link ? <span style={{ color: '#94A3B8', fontSize: '1.2rem' }}>🌐</span> : <span style={{ color: '#94A3B8', fontSize: '1rem' }}>→</span>}
                    </div>
                  ))}`;

  if (c.includes(target)) {
    fs.writeFileSync('src/member/components/MemberPanel/Services/AadharPay.jsx', c.replace(target, replacement));
    console.log('updated AadharPay');
  } else {
    console.log('not found in AadharPay');
  }
}

updateAadharPay();
