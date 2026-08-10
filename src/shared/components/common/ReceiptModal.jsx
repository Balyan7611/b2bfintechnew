import React, { useState, useRef, useLayoutEffect } from 'react';
import { FiX, FiPrinter } from 'react-icons/fi';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { getSession } from '../../../utils/authUtils';

const SIZES = ['A4', 'A5', '80mm', '58mm'];

const SIZE_PX = { A4: 794, A5: 559, '80mm': 304, '58mm': 220 };

const sizeConfig = {
  A4:     { mmW: '210mm', fontSize: 13, logoH: 48, pad: 32, twoCol: true,  border: true,  tagline: true,  sepMar: 14, amtSize: 28, totalSize: 20 },
  A5:     { mmW: '148mm', fontSize: 11, logoH: 36, pad: 20, twoCol: true,  border: true,  tagline: true,  sepMar: 10, amtSize: 24, totalSize: 17 },
  '80mm': { mmW: '76mm',  fontSize: 11, logoH: 34, pad: 10, twoCol: false, border: true,  tagline: false, sepMar:  8, amtSize: 20, totalSize: 15 },
  '58mm': { mmW: '54mm',  fontSize: 10, logoH: 26, pad:  7, twoCol: false, border: true,  tagline: false, sepMar:  6, amtSize: 17, totalSize: 13 },
};

function maskAccount(n) {
  const s = String(n || '');
  if (s.length <= 4) return s;
  return '•'.repeat(Math.max(0, s.length - 4)) + s.slice(-4);
}

function toWords(num) {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  
  const makeGroup = (n) => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str;
  };
  
  let n = Math.floor(num);
  if (n === 0) return 'Zero';
  
  let parts = [];
  if (n >= 10000000) {
    parts.push({ val: Math.floor(n / 10000000), unit: 'Crore' });
    n %= 10000000;
  }
  if (n >= 100000) {
    parts.push({ val: Math.floor(n / 100000), unit: 'Lakh' });
    n %= 100000;
  }
  if (n >= 1000) {
    parts.push({ val: Math.floor(n / 1000), unit: 'Thousand' });
    n %= 1000;
  }
  if (n > 0) {
    parts.push({ val: n, unit: '' });
  }
  
  let out = '';
  for (let p of parts) {
    out += makeGroup(p.val) + p.unit + ' ';
  }
  return out.trim() + ' Only';
}

// Generic receipt for Recharge, BBPS, MATM, Payout
function SimpleReceiptBody({ data, cfg, title, icon, sections }) {
  const isThermal = !cfg.twoCol;
  const fs = cfg.fontSize;
  const st = String(data?.status || 'PENDING').toUpperCase();
  const isFail = st === 'FAILED' || st === 'REJECTED';
  const isPending = st === 'PENDING';

  const lbl = { fontSize: Math.max(fs - 3, 8), color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, fontFamily: '"DM Sans",sans-serif' };
  const val = { fontSize: fs, color: '#0F172A', fontWeight: 700, fontFamily: '"DM Sans",sans-serif' };

  const StatusBadge = () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isFail ? '#FEF2F2' : isPending ? '#FFFBEB' : '#ECFDF5', border: `1px solid ${isFail ? '#FECACA' : isPending ? '#FDE68A' : '#A7F3D0'}`, borderRadius: 50, padding: '4px 12px' }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: isFail ? '#EF4444' : isPending ? '#F59E0B' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
        </svg>
      </div>
      <span style={{ fontSize: fs - 3, fontWeight: 800, color: isFail ? '#991B1B' : isPending ? '#92400E' : '#065F46', letterSpacing: '0.6px' }}>{st}</span>
    </div>
  );

  if (isThermal) {
    return (
      <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: cfg.sepMar }}>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: cfg.sepMar }}>
          <div style={{ fontSize: fs - 1, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: fs - 3, color: '#64748B' }}>{SITE_CONFIG.companyName || ''}</div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: cfg.amtSize || 20, fontWeight: 800, color: '#0D1B3E' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div style={{ marginTop: 4 }}><StatusBadge /></div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        {sections.flat().filter(Boolean).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #F1F5F9' }}>
            <span style={lbl}>{k}</span>
            <span style={{ ...val, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v || 'N/A'}</span>
          </div>
        ))}
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', fontSize: Math.max(fs - 3, 8), color: '#94A3B8', fontWeight: 700 }}>SECURED BY {SITE_CONFIG.shortName}</div>
      </div>
    );
  }

  // A4/A5
  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block' }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: fs + 2, fontWeight: 800, color: '#1756AA' }}>{title}</div>
          <div style={{ fontSize: fs - 2, color: '#64748B' }}>{SITE_CONFIG.companyName || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isFail ? '#FEF2F2' : isPending ? '#FFFBEB' : '#ECFDF5', border: `1px solid ${isFail ? '#FECACA' : isPending ? '#FDE68A' : '#A7F3D0'}`, borderRadius: 12, padding: '12px 20px', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: fs - 2, color: '#64748B', fontWeight: 700 }}>Total Amount</div>
          <div style={{ fontSize: fs + 10, fontWeight: 800, color: '#0D1B3E' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <StatusBadge />
      </div>

      {sections.map((rows, si) => (
        <table key={si} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: fs }}>
          <tbody>
            {rows.filter(Boolean).reduce((acc, pair, i, arr) => {
              if (i % 2 === 0) {
                const next = arr[i + 1];
                acc.push(
                  <tr key={i}>
                    <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '20%' }}>{pair[0]}</td>
                    <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A', width: '30%' }}>{pair[1] || 'N/A'}</td>
                    {next ? <>
                      <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '20%' }}>{next[0]}</td>
                      <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A', width: '30%' }}>{next[1] || 'N/A'}</td>
                    </> : <td colSpan="2" style={{ border: '1.5px solid #E2E8F0' }} />}
                  </tr>
                );
              }
              return acc;
            }, [])}
          </tbody>
        </table>
      ))}

      <div style={{ textAlign: 'center', color: '#64748B', fontSize: fs - 2, marginTop: 20 }}>
        This is a system generated receipt. No seal or signature is required.<br />
        © 2026 {SITE_CONFIG.companyName || ''}. All rights reserved.
      </div>
    </div>
  );
}

function AepsReceiptBody({ data, cfg }) {
  const fs = cfg.fontSize;
  const isThermal = !cfg.twoCol;

  const lbl = { fontSize: Math.max(fs - 3, 8), color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, fontFamily: '"DM Sans",sans-serif' };
  const val = { fontSize: fs, color: '#0F172A', fontWeight: 700, fontFamily: '"DM Sans",sans-serif' };

  const st = String(data?.status || 'PENDING').toUpperCase();
  const isFail = st === 'FAILED' || st === 'REJECTED';
  const isPending = st === 'PENDING';
  const txnLabel = data?.transactionType || data?.mode || data?.serviceName || 'Cash Withdrawal';
  const maskedAadhar = (() => {
    const a = String(data?.aadhar || data?.aadharNo || '');
    return a.length >= 4 ? 'XXXX XXXX ' + a.slice(-4) : (a || 'N/A');
  })();

  if (isThermal) {
    return (
      <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: cfg.sepMar }}>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: cfg.sepMar }}>
          <div style={{ fontSize: fs - 1, fontWeight: 800, color: '#0F172A' }}>AEPS Receipt</div>
          <div style={{ fontSize: fs - 3, color: '#64748B' }}>{SITE_CONFIG.companyName || ''}</div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: isFail ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
            </svg>
          </div>
          <div style={{ fontSize: fs - 1, fontWeight: 800, color: isFail ? '#991B1B' : '#065F46' }}>{txnLabel} {isFail ? 'Failed' : 'Successful'}</div>
          <div style={{ fontSize: cfg.amtSize || 20, fontWeight: 800, color: '#0D1B3E' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        {[
          ['BANK', data?.bankName || 'N/A'],
          ['AADHAAR NUMBER', maskedAadhar],
          ['MOBILE', data?.mobile || data?.mobileNumber || data?.customerMobile || 'N/A'],
          ['TRANSACTION ID', data?.bankTransId || data?.orderId || 'N/A'],
          ['BANK RRN', data?.rrn || data?.vendorId || 'N/A'],
          ['DATE & TIME', data?.date],
          ['REMARK', data?.remark || data?.message || 'N/A'],
          ['BC CODE', data?.memberId || data?.loginId || 'N/A'],
          ['BC NAME', data?.memberName || 'N/A'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F1F5F9' }}>
            <span style={lbl}>{k}</span>
            <span style={{ ...val, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
          </div>
        ))}
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', fontSize: Math.max(fs - 3, 8), color: '#94A3B8', fontWeight: 700 }}>
          SECURED BY {SITE_CONFIG.shortName}
        </div>
      </div>
    );
  }

  // A4/A5 layout
  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: fs + 2, fontWeight: 800, color: '#1756AA' }}>AEPS Receipt</div>
          <div style={{ fontSize: fs - 2, color: '#64748B' }}>{SITE_CONFIG.companyName || ''}</div>
        </div>
      </div>

      {/* Success banner */}
      <div style={{ textAlign: 'center', marginBottom: 20, padding: '14px', background: isFail ? '#FEF2F2' : isPending ? '#FFFBEB' : '#ECFDF5', borderRadius: 12, border: `1px solid ${isFail ? '#FECACA' : isPending ? '#FDE68A' : '#A7F3D0'}` }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: isFail ? '#EF4444' : isPending ? '#F59E0B' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
          </svg>
        </div>
        <div style={{ fontSize: fs + 1, fontWeight: 800, color: isFail ? '#991B1B' : isPending ? '#92400E' : '#065F46' }}>{txnLabel} {isFail ? 'Failed' : isPending ? 'Pending' : 'Successful'}</div>
        <div style={{ fontSize: fs + 8, fontWeight: 800, color: '#0D1B3E', margin: '4px 0' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>

      {/* CUSTOMER */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: fs - 2, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Customer</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '30%' }}>Bank</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.bankName || 'N/A'}</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '30%' }}>Aadhaar Number</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{maskedAadhar}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B' }}>Mobile</td>
              <td colSpan="3" style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.mobile || data?.mobileNumber || data?.customerMobile || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TRANSACTION */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: fs - 2, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Transaction</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '30%' }}>Transaction ID</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.bankTransId || data?.orderId || data?.transId || 'N/A'}</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '30%' }}>Bank RRN</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.rrn || data?.vendorId || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B' }}>Date & Time</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.date}</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B' }}>Remark</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.remark || data?.message || 'Transaction Successful, ' + st}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* BUSINESS CORRESPONDENT */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: fs - 2, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Business Correspondent</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '30%' }}>BC Code</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.memberId || data?.loginId || 'N/A'}</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', width: '30%' }}>BC Name</td>
              <td style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>{data?.memberName || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', color: '#64748B', fontSize: fs - 2, fontWeight: 500 }}>
        This is a system generated receipt. No seal or signature is required.
      </div>
      <div style={{ textAlign: 'center', color: '#64748B', fontSize: fs - 2, marginTop: 2 }}>
        © 2026 {SITE_CONFIG.companyName || ''}. All rights reserved.
      </div>
    </div>
  );
}

function ReceiptBody({ data, cfg }) {
  const isThermal = !cfg.twoCol;
  const fs = cfg.fontSize;

  const session = getSession();
  const merchantName = session?.name || session?.fullName || session?.ownerName || session?.firmName || SITE_CONFIG.name || 'Merchant';
  const shopName = session?.shopName || session?.firmName || session?.businessName || SITE_CONFIG.name || 'Shop';

  const lbl = {
    fontSize: Math.max(fs - 3, 8),
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: 800,
    marginBottom: 2,
    fontFamily: '"DM Sans",sans-serif',
  };
  const val = { fontSize: fs, color: '#0F172A', fontWeight: 700, fontFamily: '"DM Sans",sans-serif' };

  if (isThermal) {
    return (
      <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A' }}>
                <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: cfg.sepMar }}>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />

        {/* Single Column sleek design for Thermal view */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
            <div style={lbl}>TOTAL TRANSFER AMOUNT</div>
            <div style={{ fontSize: cfg.amtSize, fontWeight: 800, color: '#0D1B3E', margin: '2px 0' }}>
              ₹{(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600 }}>Surcharge: ₹{(data?.charge || 0).toFixed(2)}</div>
          </div>

          <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>DATE</span>
              <span style={val}>{data?.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>MERCHANT</span>
              <span style={val}>{merchantName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>SHOP NAME</span>
              <span style={val}>{shopName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>CUSTOMER</span>
              <span style={val}>{data?.customerName || 'Guest'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>CUST. MOBILE</span>
              <span style={val}>{data?.customerMobile || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>BENEFICIARY</span>
              <span style={val}>{data?.beneficiary}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>BANK & A/C</span>
              <span style={val}>{data?.bank} ({maskAccount(data?.accountNo)})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={lbl}>MODE</span>
              <span style={{ ...val, background: 'rgba(23,86,170,0.08)', color: '#1756AA', padding: '1px 6px', borderRadius: 50, fontSize: 10 }}>{data?.mode || 'IMPS'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: 6, padding: '6px 8px', marginTop: 4 }}>
              <span style={{ ...lbl, color: '#64748B' }}>TOTAL WALLET DEBIT</span>
              <span style={{ ...val, color: '#1756AA' }}>₹{(data?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />

        {/* Chunks Card Block */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 3, height: 11, background: '#3B82F6', borderRadius: 2 }} />
            <div style={lbl}>TRANSACTION DETAILS</div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(data?.chunks || [{ id: 'c1', txnId: data?.bankTransId || data?.id || 'N/A', amount: data?.amount || 0 }]).map((c, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0',
                borderBottom: i < ((data?.chunks?.length || 1) - 1) ? '1px dashed #EEF0F4' : 'none',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: fs, color: '#0F172A', fontWeight: 700 }}>
                  <span style={{ color: '#64748B', fontWeight: 600, fontSize: fs - 1, marginRight: 4 }}>UTR:</span>
                  {c.txnId}
                </span>
                <span style={{ color: '#1756AA', fontWeight: 700, fontSize: fs }}>
                  ₹{c.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8', fontSize: Math.max(fs - 2, 8.5), fontWeight: 700, letterSpacing: '0.3px' }}>
            SECURED BY {SITE_CONFIG.shortName}
          </div>
        </div>
      </div>
    );
  }

    return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        {(() => {
          const st = String(data?.status || 'PENDING').toUpperCase();
          const isFail = st === 'FAILED' || st === 'REJECTED';
          const isPending = st === 'PENDING';
          return (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: isFail ? '#FEF2F2' : isPending ? '#FFFBEB' : '#ECFDF5',
              border: `1px solid ${isFail ? '#FECACA' : isPending ? '#FDE68A' : '#A7F3D0'}`,
              borderRadius: 50, padding: '5px 14px',
            }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: isFail ? '#EF4444' : isPending ? '#F59E0B' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
                  {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12" />}
                </svg>
              </div>
              <span style={{ fontSize: fs - 3, fontWeight: 800, color: isFail ? '#991B1B' : isPending ? '#92400E' : '#065F46', letterSpacing: '0.6px' }}>{st}</span>
            </div>
          );
        })()}
      </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 25, fontSize: fs }}>
        <tbody>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC', width: '20%' }}>Merchant:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', width: '30%', wordBreak: 'break-all' }}>{merchantName}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC', width: '20%' }}>Business Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', width: '30%', wordBreak: 'break-all' }}>{shopName}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Customer Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', wordBreak: 'break-all' }}>{data?.customerName || 'Guest'}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Customer Mobile:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', wordBreak: 'break-all' }}>{data?.customerMobile || 'N/A'}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Beneficiary Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', wordBreak: 'break-all' }}>{data?.beneficiary}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Bank Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', wordBreak: 'break-all' }}>{data?.bank}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Account Number:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', wordBreak: 'break-all' }}>{data?.accountNo} {data?.ifsc ? `(IFSC: ${data.ifsc})` : ''}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Date & Time:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', wordBreak: 'break-all' }}>{data?.date}</td>
          </tr>
        </tbody>
      </table>

            <div style={{ textAlign: 'center', marginBottom: 15 }}>
        <span style={{ fontSize: fs + 1.5, fontWeight: '800', color: '#1756AA', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Transaction Summary
        </span>
      </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: fs, tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '28%' }}>TID</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '17%' }}>TXN DATE</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '18%' }}>AMOUNT</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '22%' }}>UTR NO.</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'center', width: '15%' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {(data?.chunks || [{ id: 'c1', txnId: data?.bankTransId || data?.id || 'N/A', amount: data?.amount || 0 }]).map((c, i) => (
            <tr key={c.id || i}>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{c.txnId}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{data?.date?.split(' ')[0]}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#0F172A', fontWeight: '700' }}>₹{Number(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{data?.rrn || c.txnId}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
                <span style={{
                  background: String(data?.status).toUpperCase() === 'FAILED' ? '#FEF2F2' : String(data?.status).toUpperCase() === 'PENDING' ? '#FFFBEB' : '#ECFDF5',
                  border: `1px solid ${String(data?.status).toUpperCase() === 'FAILED' ? '#FECACA' : String(data?.status).toUpperCase() === 'PENDING' ? '#FDE68A' : '#A7F3D0'}`,
                  color: String(data?.status).toUpperCase() === 'FAILED' ? '#991B1B' : String(data?.status).toUpperCase() === 'PENDING' ? '#92400E' : '#065F46',
                  padding: '2px 8px',
                  borderRadius: 50,
                  fontSize: 9.5,
                  fontWeight: '800',
                  display: 'inline-block'
                }}>{data?.status || 'PENDING'}</span>
              </td>
            </tr>
          ))}
          <tr style={{ background: '#FFFFFF' }}>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>Total Amount:</td>
            <td style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA', wordBreak: 'break-word' }}>Rs. {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( {toWords(data?.amount || 0)} )</td>
          </tr>
        </tbody>
      </table>

            <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: '500', margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
      </div>
    </div>
  );
}

export default function ReceiptModal({ isOpen, onClose, data }) {
  const [size, setSize] = useState('A4');
  const previewWrapRef = useRef(null);
  const receiptRef = useRef(null);
  const [scale, setScale] = useState(1);

  const cfg = sizeConfig[size];
  const receiptPxWidth = SIZE_PX[size];

    const receiptType = data?._type || (data?.aadhar || data?.aadharNo ? 'aeps' : 'dmt');
  const isAeps = receiptType === 'aeps';

  const mappedData = data ? {
    ...data,
    isAeps,
    date: data.createdDate || data.date || data.txnDate || data.transactionDate || data.created_at || 'N/A',
    status: data.status || 'PENDING',
    // AEPS fields
    aadhar: data.aadhar || data.aadharNo || '',
    bankName: data.bankName || data.bank || 'N/A',
    mobile: data.mobile || data.mobileNumber || data.customerMobile || data.number || 'N/A',
    bankTransId: data.bankTransId || data.txnId || data.transId || data.orderId || 'N/A',
    rrn: data.rrn || data.vendorId || 'N/A',
    memberId: data.memberId || data.loginId || '',
    memberName: data.memberName || data.bcName || '',
    transactionType: data.transactionType || data.mode || data.serviceName || 'Cash Withdrawal',
    remark: data.remark || data.message || '',
    // DMT fields
    customerName: data.customerName || data.memberName || data.name || data.beneName || 'Guest',
    customerMobile: data.customerMobile || data.mobileNumber || data.mobile || data.number || 'N/A',
    beneficiary: data.beneficiary || data.beneficiaryName || data.beneName || data.beniName || data.beniVerifyName || data.memberName || 'N/A',
    bank: data.bank || data.bankName || data.beneBankName || 'N/A',
    accountNo: data.accountNo || data.accountNumber || data.accNo || data.aadhar || data.aadharNo || data.cardNo || 'N/A',
    ifsc: data.ifsc || data.ifscCode || '',
    mode: data.mode || data.transactionType || data.fromChannel || 'IMPS',
    amount: Number(data.amount || 0),
    charge: Number(data.surcharge || data.charge || data.serviceCharge || 0),
    total: data.total || (Number(data.amount || 0) + Number(data.surcharge || data.charge || 0)),
  } : null;

  useLayoutEffect(() => {
    const compute = () => {
      if (!previewWrapRef.current || !receiptRef.current) return;
      const gapX = 48, gapY = 48;
      const wrapW = previewWrapRef.current.clientWidth - gapX;
      const wrapH = previewWrapRef.current.clientHeight - gapY;
      const receiptH = receiptRef.current.scrollHeight;
      const scaleW = wrapW / receiptPxWidth;
      const scaleH = wrapH / receiptH;
      setScale(Math.min(scaleW, scaleH, 1));
    };
    const timer = setTimeout(compute, 50);
    window.addEventListener('resize', compute);
    return () => { clearTimeout(timer); window.removeEventListener('resize', compute); };
  }, [size, receiptPxWidth, isOpen]);

    const printReceipt = () => {
    if (!receiptRef.current) return;
    const pw = window.open('', '_blank', 'width=900,height=700');
    if (!pw) return;
    const isTh = !cfg.twoCol;
    const html = receiptRef.current.innerHTML;
    pw.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Receipt_${size}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>
        @page { size:${isTh ? `${cfg.mmW} auto` : `${size} portrait`}; margin:${isTh ? '3mm' : '10mm'}; }
        * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; font-family:'DM Sans',sans-serif; }
        body { margin:0; padding:${cfg.pad}px; background:#fff; }
      </style>
    </head><body>${html}</body></html>`);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 700);
  };

  if (!isOpen || !data) return null;

  const txnStatus = String(mappedData?.status || 'PENDING').toUpperCase();
  const isPending = txnStatus === 'PENDING' || txnStatus === 'PROCESSING' || txnStatus === 'INPROCESS';
  const isFailed  = txnStatus === 'FAILED' || txnStatus === 'REJECTED' || txnStatus === 'FAILURE';
  const isSuccess = !isPending && !isFailed;

  // PENDING screen
  if (isPending) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,12,28,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 12 }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, padding: 40, textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFFBEB', border: '3px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'spin 2s linear infinite' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E', marginBottom: 8, fontFamily: '"DM Sans",sans-serif' }}>Receipt Preparing…</div>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.5 }}>
            Your transaction is being processed.<br/>Receipt will be available once confirmed.
          </div>
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#94A3B8', fontFamily: '"DM Sans",sans-serif' }}>
            Txn ID: <strong>{mappedData?.bankTransId || mappedData?.orderId || mappedData?.txnId || 'N/A'}</strong>
          </div>
          <button onClick={onClose} style={{ marginTop: 24, padding: '10px 32px', borderRadius: 10, background: '#F59E0B', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }}>Close</button>
        </div>
      </div>
    );
  }

  // FAILED screen
  if (isFailed) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,12,28,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 12 }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 40, textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FEF2F2', border: '3px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991B1B', marginBottom: 8, fontFamily: '"DM Sans",sans-serif' }}>Transaction Failed</div>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.5 }}>
            This transaction was not successful.<br/>No amount has been debited.
          </div>
          <div style={{ marginTop: 12, background: '#FEF2F2', borderRadius: 10, padding: '12px 16px', textAlign: 'left' }}>
            {[
              ['Amount', `₹${Number(mappedData?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
              ['Txn ID', mappedData?.bankTransId || mappedData?.orderId || mappedData?.txnId || 'N/A'],
              ['Date', mappedData?.date || 'N/A'],
              ['Remark', mappedData?.remark || mappedData?.message || 'Transaction Failed'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #FECACA', fontFamily: '"DM Sans",sans-serif' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>{k}</span>
                <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 700, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{ marginTop: 24, padding: '10px 32px', borderRadius: 10, background: '#EF4444', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }}>Close</button>
        </div>
      </div>
    );
  }

  const receiptH = receiptRef.current?.scrollHeight || 600;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,12,28,0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '12px',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 580, height: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#0D1B3E' }}>Transaction Receipt</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 1, fontFamily: '"DM Sans",sans-serif' }}>Select size & print</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)} style={{
                padding: '4px 10px', borderRadius: 8,
                border: `1.5px solid ${size === s ? '#1756AA' : '#E2E8F0'}`,
                background: size === s ? '#EFF6FF' : '#F8FAFC',
                color: size === s ? '#1756AA' : '#94A3B8',
                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                fontFamily: '"DM Sans",sans-serif', lineHeight: 1, transition: 'all 0.15s',
              }}>{s}</button>
            ))}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid #E2E8F0', background: '#F8FAFC',
            cursor: 'pointer', color: '#94A3B8', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>

                <div ref={previewWrapRef} style={{
          flex: 1, background: '#EAEEF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 8, overflow: 'hidden',
        }}>
          <div style={{
            width: receiptPxWidth * scale,
            height: receiptH * scale,
            position: 'relative', flexShrink: 0,
          }}>
            <div ref={receiptRef} style={{
              position: 'absolute', top: 0, left: 0,
              width: receiptPxWidth,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              background: '#fff',
              padding: cfg.pad,
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              boxSizing: 'border-box',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}>
              {(() => {
                const t = mappedData?._type || (mappedData?.isAeps ? 'aeps' : 'dmt');
                const merchant = getSession()?.name || getSession()?.fullName || SITE_CONFIG.name || 'Merchant';

                if (t === 'aeps') return <AepsReceiptBody data={mappedData} cfg={cfg} />;

                if (t === 'recharge') return (
                  <SimpleReceiptBody data={mappedData} cfg={cfg}
                    title="Recharge Receipt"
                    sections={[
                      [['Merchant', merchant], ['Date & Time', mappedData.date]],
                      [['Operator', mappedData.operatorName || mappedData.operatorId || 'N/A'], ['Number', mappedData.number || mappedData.customerMobile || 'N/A']],
                      [['Member', mappedData.memberName || 'N/A'], ['Member ID', mappedData.memberId || 'N/A']],
                      [['Txn ID', mappedData.orderId || mappedData.txnId || mappedData.transId || 'N/A'], ['Operator Ref', mappedData.operatorId || mappedData.refid || 'N/A']],
                      [['Remark', mappedData.message || mappedData.remark || 'N/A']],
                    ]}
                  />
                );

                if (t === 'bbps') return (
                  <SimpleReceiptBody data={mappedData} cfg={cfg}
                    title="Bill Payment Receipt"
                    sections={[
                      [['Merchant', merchant], ['Date & Time', mappedData.date]],
                      [['Operator / Biller', mappedData.operatorName || mappedData.operatorId || 'N/A'], ['Consumer No', mappedData.consumer || mappedData.number || mappedData.accountNo || 'N/A']],
                      [['Member', mappedData.memberName || 'N/A'], ['Member ID', mappedData.memberId || 'N/A']],
                      [['Txn ID', mappedData.orderId || mappedData.txnId || mappedData.transId || 'N/A'], ['Reference', mappedData.refid || mappedData.rrn || 'N/A']],
                      [['Remark', mappedData.remark || mappedData.message || 'N/A']],
                    ]}
                  />
                );

                if (t === 'matm') return (
                  <SimpleReceiptBody data={mappedData} cfg={cfg}
                    title="MATM Receipt"
                    sections={[
                      [['Merchant', merchant], ['Date & Time', mappedData.date]],
                      [['Card No', mappedData.accountNo || mappedData.cardNo || mappedData.cardNumber ? '•••• •••• •••• ' + String(mappedData.accountNo || mappedData.cardNo || mappedData.cardNumber || '').slice(-4) : 'N/A'], ['Operator', mappedData.operatorName || mappedData.operatorId || 'N/A']],
                      [['BC Code', mappedData.memberId || mappedData.loginId || 'N/A'], ['BC Name', mappedData.memberName || 'N/A']],
                      [['Txn ID', mappedData.orderId || mappedData.txnId || mappedData.transId || 'N/A'], ['Bank RRN', mappedData.rrn || mappedData.refid || 'N/A']],
                      [['Remark', mappedData.remark || mappedData.message || 'N/A']],
                    ]}
                  />
                );

                if (t === 'payout') return (
                  <SimpleReceiptBody data={mappedData} cfg={cfg}
                    title="Payout Receipt"
                    sections={[
                      [['Merchant', merchant], ['Date & Time', mappedData.date]],
                      [['Beneficiary', mappedData.beneficiary || mappedData.beniName || mappedData.beniVerifyName || 'N/A'], ['Bank', mappedData.bank || mappedData.bankName || 'N/A']],
                      [['Account No', mappedData.accountNo || mappedData.accNo || 'N/A'], ['IFSC', mappedData.ifsc || mappedData.ifscCode || 'N/A']],
                      [['Member', mappedData.memberName || 'N/A'], ['Sender Mobile', mappedData.customerMobile || mappedData.mobile || 'N/A']],
                      [['Txn ID', mappedData.orderId || mappedData.txnId || mappedData.transId || 'N/A'], ['UTR / Ref', mappedData.rrn || mappedData.refid || 'N/A']],
                      [['Mode', mappedData.mode || 'IMPS'], ['Remark', mappedData.remark || mappedData.message || 'N/A']],
                    ]}
                  />
                );

                return <ReceiptBody data={mappedData} cfg={cfg} />;
              })()}
            </div>
          </div>
        </div>

                <div style={{ display: 'flex', gap: 10, padding: '10px 20px', borderTop: '1px solid #F1F5F9', background: '#fff', flexShrink: 0 }}>
          <button onClick={printReceipt} style={{
            flex: 1, padding: '8px 16px', borderRadius: 8,
            background: '#0D1B3E', color: '#fff', border: 'none',
            fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
            fontFamily: '"DM Sans",sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print {size}
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: '8px 16px', borderRadius: 8,
            background: '#F8FAFC', color: '#475569',
            border: '1.5px solid #E2E8F0',
            fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
            fontFamily: '"DM Sans",sans-serif',
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
