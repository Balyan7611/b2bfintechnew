const fs = require('fs');

function applyFixes() {
  const file = 'src/member/components/MemberPanel/Services/Aeps.jsx';
  let c = fs.readFileSync(file, 'utf8');

  // 1. Add Guidelines to Provider step
  const providerTarget = `                  <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Accepted
                  </span>
                </div>
              </div>
            </div>
          )}`;
  
  const providerReplacement = `                  <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                    Accepted
                  </span>
                </div>
              </div>

              {/* Guidelines Section */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <span style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                    RBI / NPCI Guidelines
                  </span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '850', color: '#0D1B5E' }}>AEPS Guidelines</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#64748B' }}>Compliance rules for every AEPS transaction</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                  {[
                    "Merchant Authentication Txn ID is generated for every Cash Withdrawal.",
                    "Daily Authentication is mandatory for secure transactions.",
                    "Complete EKYC before using AEPS services.",
                    "Keep biometric device connected properly (RD Service registered).",
                    "Aadhaar & Mobile Number should belong to the customer only.",
                    "Cash Withdrawal above ₹5,000 requires OTP verification."
                  ].map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ color: '#22C55E', fontSize: '1.1rem', marginTop: '-2px' }}>✓</span>
                      <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '500' }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}`;
          
  if (c.includes(providerTarget)) {
    c = c.replace(providerTarget, providerReplacement);
  }

  // 2. Fix Imports
  const importTarget = `  FaMoneyBillWave, FaWallet, FaFileInvoice
} from 'react-icons/fa';`;
  const importReplacement = `  FaMoneyBillWave, FaWallet, FaFileInvoice, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';`;
  if (c.includes(importTarget)) {
    c = c.replace(importTarget, importReplacement);
  }

  // 3. Update Seeding URLs
  const seedingTarget = `                {[
                  { title: 'UIDAI — Bank Seeding Status', desc: 'Aadhaar kis bank se link hai, online check kare', icon: '🏦' },
                  { title: '*99*99*1#', desc: 'Bina internet ke phone se seeding status', icon: '📞' },
                  { title: 'NPCI — APB FAQs', desc: 'Aadhaar mapper / seeding ki puri jaankari', icon: 'ℹ️' }
                ].map((item, idx) => (
                  <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#fff' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0D1B5E' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    </div>
                    <span style={{ color: '#94A3B8', fontSize: '1rem' }}>›</span>
                  </div>
                ))}`;
  const seedingReplacement = `                {[
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
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0D1B5E' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    </div>
                    {item.link ? <span style={{ color: '#94A3B8', fontSize: '1.2rem' }}>🌐</span> : <span style={{ color: '#94A3B8', fontSize: '1rem' }}>›</span>}
                  </div>
                ))}`;
  if (c.includes(seedingTarget)) {
    c = c.replace(seedingTarget, seedingReplacement);
  }

  // 4. Update Device tab
  const deviceStart = `{rightTab === 'device' && (`;
  const deviceEnd = `          {/* TAB CONTENT: Help (7 Q&As) */}`;
  if (c.includes(deviceStart) && c.includes(deviceEnd)) {
    const replacement = `{rightTab === 'device' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0D1B5E', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaFingerprint /> Device & RD Service
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  Apna device chune — RD Service download / renew ka page khulega.
                </p>
              </div>

              <div style={{ background: '#F8FAFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', border: deviceStatus === 'Ready' ? '2.5px solid #22C55E' : '2.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaFingerprint style={{ fontSize: '1.8rem', color: deviceStatus === 'Ready' ? '#22C55E' : '#94A3B8' }} />
                </div>
                <button
                  type="button"
                  onClick={handleCheckDevice}
                  disabled={loading || isScanning}
                  style={{ background: '#1756AA', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                >
                  {deviceStatus === 'Connecting' ? 'Testing...' : 'Test / Capture Biometric Device'}
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: deviceStatus === 'Ready' ? '#22C55E' : '#EF4444' }}>
                  Status: {deviceStatus === 'Ready' ? \`Ready (\${deviceName || 'Mantra MFS100'})\` : 'Disconnected'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '5px' }}>
                {[
                  { name: 'Mantra', desc: 'MFS100 / MFS110 L1 / MIS100', link: 'https://www.rdservice.in' },
                  { name: 'Morpho / IDEMIA', desc: 'MSO 1300 E2 / E3 L1', link: 'https://rdservicesonline.com' },
                  { name: 'Startek', desc: 'FM220U / FM220U-L1', link: 'https://www.startek.com' },
                  { name: 'SecuGen', desc: 'Hamster Pro 20 / HU20', link: 'https://secugenindia.com' },
                  { name: 'Precision', desc: 'PB510 / PB1000', link: 'https://www.precisionbiometric.co.in' },
                  { name: 'Evolute', desc: 'Fingerprint L1 RD', link: 'https://www.evolute.in' },
                  { name: 'Aratek', desc: 'A600 L1', link: 'https://www.aratek.co' },
                  { name: 'Next Biometrics', desc: 'NB-3023-U / L1', link: 'https://www.nextbiometrics.com' },
                  { name: 'Iris (Mantra MIS100V2)', desc: 'Iris scanner RD', link: 'https://www.rdservice.in' },
                  { name: 'UIDAI - certified device list', desc: 'Registered device ki official jaankari', link: 'https://uidai.gov.in' }
                ].map((d, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => window.open(\`https://www.google.com/search?q=\${encodeURIComponent(d.name + ' RD Service official download ' + d.desc)}\`, '_blank')}
                    style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#fff', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1756AA'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F0F5FF', color: '#1756AA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <FaFingerprint />
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0D1B5E' }}>{d.name}</h5>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{d.desc}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: '#94A3B8' }}>📥</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#F0F5FF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaInfoCircle color="#475569" /> RD Service ke rules:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '15px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                  <li>RD Service sirf <strong>device banane wali company</strong> ki official site se hi le — third party / cracked RD se transaction fail aur account block ho sakta hai.</li>
                  <li>RD license aam taur par <strong>1 saal</strong> chalta hai, uske baad renew karna padta hai.</li>
                  <li>Windows par RD Service <strong>background me chalu</strong> rehna chahiye, warna "Device not found" aata hai.</li>
                  <li>Ek PC par <strong>ek hi company</strong> ka RD Service rakhe — do alag RD aapas me takrate hai.</li>
                </ol>
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px' }}>
                <FaExclamationTriangle color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400E', lineHeight: '1.5' }}>
                  Device kaam na kare to: RD Service app kholein → device USB nikaal kar dobara lagaye → browser refresh kare → phir bhi na ho to RD license expiry check kare.
                </p>
              </div>

            </div>
          )}

`;
    c = c.substring(0, c.indexOf(deviceStart)) + replacement + c.substring(c.indexOf(deviceEnd));
  }
  
  fs.writeFileSync(file, c);
  console.log('Fixed Aeps.jsx');
}
applyFixes();
