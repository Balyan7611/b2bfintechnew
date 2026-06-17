import React, { useState, useRef, useLayoutEffect } from 'react';
import { FiX, FiPrinter } from 'react-icons/fi';
import { SITE_CONFIG } from '../../../config/siteConfig';

const SIZES = ['A4', 'A5', '80mm', '58mm'];

// Pixel widths at 96dpi
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

function ReceiptBody({ data, cfg }) {
  const isThermal = !cfg.twoCol;
  const fs = cfg.fontSize;

  const sessionStr = localStorage.getItem('bss_current_session');
  let merchantName = 'Rabindra Kumar Kushwaha';
  let shopName = 'Sachin Digital Store';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session?.name) merchantName = session.name;
      if (session?.adminId) {
        const users = JSON.parse(localStorage.getItem('bss_registered_users')) || [];
        const user = users.find(u => u.adminId === session.adminId);
        if (user?.shopName) shopName = user.shopName;
      }
    } catch (e) {
      console.error(e);
    }
  }

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
        {/* Header Logo */}
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

  // --- A4/A5 Masterpiece Payment Confirmation design ---
  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      {/* Top Banner Row: Logo Left, Success Pill Right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 50,
          padding: '5px 14px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)',
        }}>
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={{ fontSize: fs - 3, fontWeight: 800, color: '#065F46', letterSpacing: '0.6px' }}>SUCCESS</span>
        </div>
      </div>

      {/* Main Grid Table exactly matching the user request */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 25, fontSize: fs }}>
        <tbody>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC', width: '20%' }}>Merchant:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', width: '30%' }}>{merchantName}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC', width: '20%' }}>Business Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A', width: '30%' }}>{shopName}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Customer Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A' }}>{data?.customerName || 'Guest'}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Customer Mobile:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A' }}>{data?.customerMobile || 'N/A'}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Beneficiary Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A' }}>{data?.beneficiary}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Bank Name:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A' }}>{data?.bank}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Account Number:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A' }}>{data?.accountNo} {data?.ifsc ? `(IFSC: ${data.ifsc})` : ''}</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#64748B', background: '#F8FAFC' }}>Date & Time:</td>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: '700', color: '#0F172A' }}>{data?.date}</td>
          </tr>
        </tbody>
      </table>

      {/* Transaction Summary header */}
      <div style={{ textAlign: 'center', marginBottom: 15 }}>
        <span style={{ fontSize: fs + 1.5, fontWeight: '800', color: '#1756AA', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Transaction Summary
        </span>
      </div>

      {/* Table grid for Chunks */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: fs }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left' }}>TID</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left' }}>TXN DATE</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left' }}>AMOUNT</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left' }}>UTR NO.</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {(data?.chunks || [{ id: 'c1', txnId: data?.bankTransId || data?.id || 'N/A', amount: data?.amount || 0 }]).map((c, i) => (
            <tr key={c.id || i}>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600' }}>{c.txnId}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600' }}>{data?.date?.split(' ')[0]}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#0F172A', fontWeight: '700' }}>₹{Number(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600' }}>{data?.rrn || c.txnId}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
                <span style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '2px 8px',
                  borderRadius: 50,
                  fontSize: 9.5,
                  fontWeight: '800',
                  display: 'inline-block'
                }}>Success</span>
              </td>
            </tr>
          ))}
          <tr style={{ background: '#FFFFFF' }}>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>Total Amount:</td>
            <td style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>Rs. {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( {toWords(data?.amount || 0)} )</td>
          </tr>
        </tbody>
      </table>

      {/* Footer System Gen Alert */}
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: '500', margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReceiptModal({ isOpen, onClose, data }) {
  const [size, setSize] = useState('A4');
  const previewWrapRef = useRef(null);
  const receiptRef = useRef(null);
  const [scale, setScale] = useState(1);

  const cfg = sizeConfig[size];
  const receiptPxWidth = SIZE_PX[size];

  // Map incoming data schema to DMT receipt schema
  const mappedData = data ? {
    ...data,
    customerName: data.customerName || data.memberName || 'Guest',
    customerMobile: data.customerMobile || data.mobileNumber || 'N/A',
    beneficiary: data.beneficiary || data.beneficiaryName || data.memberName || 'N/A',
    bank: data.bank || data.bankName || 'N/A',
    accountNo: data.accountNo || data.accountNumber || data.aadhar || 'N/A',
    ifsc: data.ifsc || 'N/A',
    total: data.total || (Number(data.amount || 0) + Number(data.charge || 0)),
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

  // ── Print ──────────────────────────────────────────────────────────────────
  const printReceipt = () => {
    const pw = window.open('', '_blank', 'width=900,height=700');
    if (!pw) return;

    const isTh = !cfg.twoCol;
    const fs = cfg.fontSize;

    const sessionStr = localStorage.getItem('bss_current_session');
    let merchantName = 'Rabindra Kumar Kushwaha';
    let shopName = 'Sachin Digital Store';
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.name) merchantName = session.name;
        if (session?.adminId) {
          const users = JSON.parse(localStorage.getItem('bss_registered_users')) || [];
          const user = users.find(u => u.adminId === session.adminId);
          if (user?.shopName) shopName = user.shopName;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const chunksHtml = (mappedData.chunks || [{ id: 'c1', txnId: mappedData.bankTransId || mappedData.id || 'N/A', amount: mappedData.amount || 0 }]).map((c, i, arr) => `
      <tr>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${c.txnId || 'N/A'}</td>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${mappedData.date ? mappedData.date.split(' ')[0] : ''}</td>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#0F172A;font-weight:700;">₹${Number(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${mappedData.rrn || c.txnId || 'N/A'}</td>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;text-align:center;"><span style="background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;padding:2px 8px;border-radius:50px;font-size:9.5px;font-weight:800;display:inline-block;">Success</span></td>
      </tr>
    `).join('');

    const templateHtml = !isTh ? `
      <!-- Top Banner Row for Printing -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <img src="${SITE_CONFIG.logo}" style="height:${cfg.logoH}px;display:block;margin:0;"/>
        <div style="display:flex;align-items:center;gap:6px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:50px;padding:5px 14px;box-shadow:0 2px 8px rgba(16,185,129,0.05);">
          <div style="width:14px;height:14px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style="font-size:${fs - 3}px;font-weight:800;color:#065F46;letter-spacing:0.6px;">SUCCESS</span>
        </div>
      </div>

      <div style="height:1px;background:#E2E8F0;margin:15px 0 20px;"></div>

      <!-- Main Grid Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:25px;font-size:${fs}px;font-family:'DM Sans',sans-serif;">
        <tbody>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Merchant:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${merchantName}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Business Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${shopName}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Customer Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.customerName}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Customer Mobile:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.customerMobile}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Beneficiary Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.beneficiary}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Bank Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.bank}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Account Number:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.accountNo} ${mappedData.ifsc ? `(IFSC: ${mappedData.ifsc})` : ''}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Date & Time:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.date}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align:center;margin-bottom:15px;">
        <span style="font-size:${fs + 1.5}px;font-weight:800;color:#1756AA;text-transform:uppercase;letter-spacing:1px;">Transaction Summary</span>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:${fs}px;font-family:'DM Sans',sans-serif;">
        <thead>
          <tr style="background:#F8FAFC;">
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">TID</th>
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">TXN DATE</th>
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">AMOUNT</th>
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">UTR NO.</th>
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">STATUS</th>
          </tr>
        </thead>
        <tbody>
          ${chunksHtml}
          <tr style="background:#FFFFFF;">
            <td colSpan="2" style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">Total Amount:</td>
            <td style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td colSpan="2" style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">Rs. ${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( ${toWords(mappedData.amount || 0)} )</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align:center;margin-top:25px;">
        <p style="color:#64748B;font-size:${fs - 2}px;font-weight:500;margin:0;letter-spacing:0.2px;">
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
      </div>
    ` : `
      <!-- Thermal Sleek design -->
      <div style="display:flex;justify-content:center;padding-bottom:${cfg.sepMar}px;">
        <img src="${SITE_CONFIG.logo}" style="height:${cfg.logoH}px;display:block;margin:0;"/>
      </div>
      <div style="height:1px;background:#E2E8F0;margin:${cfg.sepMar}px 0;"></div>

      <div style="display:flex;flex-direction:column;gap:8px;font-family:'DM Sans',sans-serif;">
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;text-align:center;">
          <div style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;margin-bottom:2px;">TOTAL TRANSFER AMOUNT</div>
          <div style="font-size:${cfg.amtSize}px;font-weight:800;color:#0D1B3E;margin:2px 0;">₹${(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:9px;color:#64748B;font-weight:600;">Surcharge: ₹${(mappedData.charge || 0).toFixed(2)}</div>
        </div>
        <div style="padding:4px 0;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">DATE</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.date}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">MERCHANT</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${merchantName}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">SHOP NAME</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${shopName}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">CUSTOMER</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.customerName}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">CUST. MOBILE</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.customerMobile}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">BENEFICIARY</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.beneficiary}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">BANK & A/C</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.bank} (${maskAccount(mappedData.accountNo)})</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">MODE</span>
            <span style="font-size:10px;color:#1756AA;background:rgba(23,86,170,0.08);padding:1px 6px;border-radius:50px;font-weight:700;">${mappedData.mode || 'IMPS'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;background:#F8FAFC;border-radius:6px;padding:6px 8px;margin-top:4px;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#64748B;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">TOTAL WALLET DEBIT</span>
            <span style="font-size:${fs}px;color:#1756AA;font-weight:700;">₹${(mappedData.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div style="height:1px;background:#E2E8F0;margin:${cfg.sepMar}px 0;"></div>
        <div style="background:#FFFFFF;border:1.5px solid #F1F5F9;border-radius:14px;padding:14px 18px;box-shadow:0 2px 4px rgba(0,0,0,0.01);">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <div style="width:3px;height:11px;background:#3B82F6;border-radius:2px;"></div>
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#64748B;text-transform:uppercase;letter-spacing:0.8px;font-weight:800;">TRANSACTION CHUNKS (UTR)</span>
          </div>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:4px;">
            ${(mappedData.chunks || [{ id: 'c1', txnId: mappedData.bankTransId || mappedData.id || 'N/A', amount: mappedData.amount || 0 }]).map((c, i, arr) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;${i < arr.length - 1 ? 'border-bottom:1px dashed #EEF0F4;' : ''}">
                <span style="font-family:monospace;font-size:${fs}px;color:#0F172A;font-weight:700;"><span style="color:#64748B;font-weight:600;font-size:${fs - 1}px;margin-right:4px;">UTR:</span>${c.txnId}</span>
                <span style="color:#1756AA;font-weight:700;font-size:${fs}px;">₹${c.amount.toLocaleString('en-IN')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    pw.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Receipt_${size}</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>
        @page { size:${isTh ? `${cfg.mmW} auto` : `${size} portrait`}; margin:${isTh ? '3mm' : '10mm'}; }
        * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; font-family:'DM Sans',sans-serif; }
        body { margin:0; padding:0; background:#fff; display:flex; justify-content:center; }
        .r { width:${cfg.mmW}; padding:${cfg.pad}px; background:#fff; border:1.5px solid #E2E8F0; border-radius:8px; page-break-inside:avoid; }
        .sep { height:1px; background:#E2E8F0; margin:${cfg.sepMar}px 0; }
      </style>
    </head><body><div class="r">
      ${templateHtml}
      
      <div style="display:flex;align-items:center;justify-content:center;gap:5px;font-family:'DM Sans',sans-serif;margin-top:15px;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1756AA" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style="color:#1756AA;font-size:${fs - 3.5}px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
          SECURED BY ${SITE_CONFIG.shortName}
        </span>
      </div>
    </div></body></html>`);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 700);
  };

  if (!isOpen || !data) return null;

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

        {/* Top bar */}
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

        {/* Scaled preview — zero scrollbars */}
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
              <ReceiptBody data={mappedData} cfg={cfg} />
            </div>
          </div>
        </div>

        {/* Action bar */}
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