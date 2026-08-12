const fs = require('fs');
function updateFile(path) {
  let c = fs.readFileSync(path, 'utf8');
  const startMarker = '{rightTab === \'device\' && (';
  const startIndex = c.indexOf(startMarker);
  if (startIndex === -1) { console.log('not found in', path); return; }
  
  const endMarker = '          {/* TAB CONTENT: Help (7 Q&As) */}';
  const endIndex = c.indexOf(endMarker);
  if (endIndex === -1) { console.log('end marker not found in', path); return; }
  
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    onClick={() => window.open(d.link, '_blank')}
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
  
  c = c.substring(0, startIndex) + replacement + c.substring(endIndex);
  fs.writeFileSync(path, c);
  console.log('updated', path);
}

updateFile('src/member/components/MemberPanel/Services/Aeps.jsx');
updateFile('src/member/components/MemberPanel/Services/AadharPay.jsx');
