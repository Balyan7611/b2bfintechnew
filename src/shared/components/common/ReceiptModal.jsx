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
        {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
          <div style={{ margin: '8px 0 4px', borderRadius: 6, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '8px 10px' }}>
            <div style={{ fontWeight: 800, fontSize: Math.max(fs - 2, 8), color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 3 }}>
              {data.forceAction === 'Force Success' ? '✓ Force Success' : '✕ Force Fail'}
            </div>
            {data.forceUtr && <div style={{ fontSize: Math.max(fs - 2, 8), color: '#0F172A', fontWeight: 600 }}>UTR: {data.forceUtr}</div>}
            {data.forceReason && <div style={{ fontSize: Math.max(fs - 2, 8), color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
          </div>
        )}
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

      {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
        <div style={{ margin: '12px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: fs - 1, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 4 }}>
            {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
          </div>
          {data.forceUtr && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>UTR Number: {data.forceUtr}</div>}
          {data.forceReason && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
        </div>
      )}
      <div style={{ textAlign: 'center', color: '#64748B', fontSize: fs - 2, marginTop: 20 }}>
        This is a system generated receipt. No seal or signature is required.<br />
        © 2026 {SITE_CONFIG.companyName || ''}. All rights reserved.
      </div>
    </div>
  );
}

// Renders [label, value] pairs two-per-row in the same bordered-table style
// used across this receipt, but only for pairs that actually have a value —
// "jo field mein data hai wahi dikhega, jo khaali hai wo row se hi hat
// jayega" per the AEPS receipt content fix.
function AepsPairTable({ pairs, fs }) {
  // Fields whose value is a literal '' are optional (e.g. Balance, Remark)
  // and get dropped entirely when there's nothing to show. A value of
  // 'N/A' is intentional (identity fields like Bank/Aadhaar/Mobile/BC Code/
  // BC Name should always render, even when the source data is missing it).
  const present = pairs.filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (present.length === 0) return null;
  const rows = [];
  for (let i = 0; i < present.length; i += 2) rows.push(present.slice(i, i + 2));
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 25, fontSize: fs }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: 800, color: '#64748B', background: '#F8FAFC', width: '20%' }}>{row[0][0]}:</td>
            {row.length === 2 ? (
              <>
                <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A', width: '30%', wordBreak: 'break-all' }}>{row[0][1]}</td>
                <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: 800, color: '#64748B', background: '#F8FAFC', width: '20%' }}>{row[1][0]}:</td>
                <td style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A', width: '30%', wordBreak: 'break-all' }}>{row[1][1]}</td>
              </>
            ) : (
              <td colSpan="3" style={{ padding: '10px 14px', border: '1.5px solid #E2E8F0', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>{row[0][1]}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
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
    return a.length >= 4 ? 'XXXX XXXX ' + a.slice(-4) : (a || '');
  })();
  const balanceStr = data?.balance !== '' && data?.balance !== undefined && data?.balance !== null
    ? `₹${Number(data.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '';
  const amountStr = `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

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
          ['BANK', data?.bankName || ''],
          ['AADHAAR NUMBER', maskedAadhar],
          ['MOBILE', data?.mobile || data?.mobileNumber || data?.customerMobile || ''],
          ['BALANCE', balanceStr],
          ['AMOUNT', amountStr],
          ['TRANSACTION ID', data?.bankTransId || data?.orderId || ''],
          ['BANK RRN', data?.rrn || data?.vendorId || ''],
          ['DATE & TIME', data?.date || ''],
          ['REMARK', data?.remark || data?.message || ''],
          ['BC CODE', data?.memberId || data?.loginId || ''],
          ['BC NAME', data?.memberName || ''],
        ].filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'N/A').map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F1F5F9' }}>
            <span style={lbl}>{k}</span>
            <span style={{ ...val, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
          </div>
        ))}
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
          <div style={{ margin: '8px 0 4px', borderRadius: 6, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '8px 10px' }}>
            <div style={{ fontWeight: 800, fontSize: Math.max(fs - 2, 8), color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 3 }}>
              {data.forceAction === 'Force Success' ? '✓ Force Success' : '✕ Force Fail'}
            </div>
            {data.forceUtr && <div style={{ fontSize: Math.max(fs - 2, 8), color: '#0F172A', fontWeight: 600 }}>UTR: {data.forceUtr}</div>}
            {data.forceReason && <div style={{ fontSize: Math.max(fs - 2, 8), color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
          </div>
        )}
        <div style={{ textAlign: 'center', fontSize: Math.max(fs - 3, 8), color: '#94A3B8', fontWeight: 700 }}>
          SECURED BY {SITE_CONFIG.shortName}
        </div>
      </div>
    );
  }

  // A4/A5 layout
  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      {/* Header: logo + status pill, same layout as the DMT/generic receipt */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
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
      </div>

      {/* Info table — same 4-column paired-cell style as the generic receipt,
          just AEPS field names; a field with no value is skipped entirely. */}
      <AepsPairTable fs={fs} pairs={[
        ['Bank Name', data?.bankName || 'N/A'],
        ['BC Code', data?.memberId || data?.loginId || 'N/A'],
        ['BC Name', data?.memberName || 'N/A'],
        ['Aadhar No', maskedAadhar || 'N/A'],
        ['Customer Mobile', data?.mobile || data?.mobileNumber || data?.customerMobile || 'N/A'],
        ['Balance', balanceStr],
        ['Remark', data?.remark || data?.message || ''],
      ]} />

      <div style={{ textAlign: 'center', margin: '20px 0 15px' }}>
        <span style={{ fontSize: fs + 1.5, fontWeight: 800, color: '#1756AA', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Transaction Summary
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: fs, tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#475569', textAlign: 'left', width: '26%' }}>TID</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#475569', textAlign: 'left', width: '17%' }}>TXN DATE</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#475569', textAlign: 'left', width: '17%' }}>AMOUNT</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#475569', textAlign: 'left', width: '20%' }}>RRN</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#475569', textAlign: 'center', width: '20%' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: 600, wordBreak: 'break-all' }}>{data?.bankTransId || data?.orderId || data?.transId || 'N/A'}</td>
            <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: 600, wordBreak: 'break-all' }}>{String(data?.date || '').split(' ')[0] || 'N/A'}</td>
            <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#0F172A', fontWeight: 700 }}>{amountStr}</td>
            <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: 600, wordBreak: 'break-all' }}>{data?.rrn || data?.vendorId || 'N/A'}</td>
            <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
              <span style={{
                background: isFail ? '#FEF2F2' : isPending ? '#FFFBEB' : '#ECFDF5',
                border: `1px solid ${isFail ? '#FECACA' : isPending ? '#FDE68A' : '#A7F3D0'}`,
                color: isFail ? '#991B1B' : isPending ? '#92400E' : '#065F46',
                padding: '2px 8px', borderRadius: 50, fontSize: 9.5, fontWeight: 800, display: 'inline-block'
              }}>{st}</span>
            </td>
          </tr>
          <tr style={{ background: '#FFFFFF' }}>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: 800, color: '#1756AA' }}>Total Amount:</td>
            <td style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: 800, color: '#1756AA' }}>{amountStr}</td>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: 800, color: '#1756AA', wordBreak: 'break-word' }}>Rs. {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( {toWords(data?.amount || 0)} )</td>
          </tr>
        </tbody>
      </table>

      {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
        <div style={{ margin: '12px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: fs - 1, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 4 }}>
            {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
          </div>
          {data.forceUtr && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>UTR Number: {data.forceUtr}</div>}
          {data.forceReason && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: 500, margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
      </div>
    </div>
  );
}

// Recharge & BBPS share this exact layout (per explicit request: "recharge
// ki or bbps ki recpit sam hi hgoa") — just these 7 fields, no separate
// Transaction Summary table (same single-table pattern as UPI).
function RechargeReceiptBody({ data, cfg }) {
  const fs = cfg.fontSize;
  const isThermal = !cfg.twoCol;

  const st = String(data?.status || 'PENDING').toUpperCase();
  const isFail = st === 'FAILED' || st === 'REJECTED';
  const isPending = st === 'PENDING';
  const amountStr = `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const number = data?.number || data?.customerMobile || data?.accountNo || data?.mobileNumber || 'N/A';
  const operator = data?.operatorName || data?.operator || data?.operatorId || 'N/A';
  const service = data?.serviceName || data?.service || (data?._type === 'bbps' ? 'BBPS' : 'Recharge');
  const txnId = data?.orderId || data?.txnId || data?.transId || data?.bankTransId || 'N/A';
  const operatorRefNumber = data?.refid || data?.rrn || data?.operatorRefNo || data?.bankRefNo || data?.vendorId || 'N/A';

  if (isThermal) {
    const lbl = { fontSize: Math.max(fs - 3, 8), color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, fontFamily: '"DM Sans",sans-serif' };
    const val = { fontSize: fs, color: '#0F172A', fontWeight: 700, fontFamily: '"DM Sans",sans-serif' };
    return (
      <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: cfg.sepMar }}>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: isFail ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
            </svg>
          </div>
          <div style={{ fontSize: cfg.amtSize || 20, fontWeight: 800, color: '#0D1B3E' }}>{amountStr}</div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        {[
          ['NUMBER', number],
          ['OPERATOR', operator],
          ['SERVICE', service],
          ['TOTAL AMOUNT', amountStr],
          ['TXN ID', txnId],
          ['OPERATOR REF NUMBER', operatorRefNumber],
          ['DATE & TIME', data?.date || ''],
        ].filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'N/A').map(([k, v]) => (
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

  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
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
      </div>

      <AepsPairTable fs={fs} pairs={[
        ['Number', number],
        ['Operator', operator],
        ['Service', service],
        ['Total Amount', amountStr],
        ['TXN ID', txnId],
        ['Operator Ref Number', operatorRefNumber],
        ['Date & Time', data?.date || ''],
      ]} />

      {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
        <div style={{ margin: '12px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: fs - 1, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 4 }}>
            {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
          </div>
          {data.forceUtr && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>UTR Number: {data.forceUtr}</div>}
          {data.forceReason && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: 500, margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
      </div>
    </div>
  );
}

// BBPS receipt — MEMBER PANEL ONLY (this component, ReceiptModal.jsx, is
// only used by the member/API panel report pages; admin's BBPS receipt
// stays on TransactionReceipt.jsx, untouched). Fields: Agent Detail, TXN ID,
// Category, Biller Name, Biller ID, Operator ID, Consumer Name, Consumer
// Number, Due Date, Bill Date, Bill Amount.
function BbpsReceiptBody({ data, cfg }) {
  const fs = cfg.fontSize;
  const isThermal = !cfg.twoCol;

  const st = String(data?.status || 'PENDING').toUpperCase();
  const isFail = st === 'FAILED' || st === 'REJECTED';
  const isPending = st === 'PENDING';
  const amountStr = `₹${Number(data?.amount || data?.billAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const agentDetail = `${data?.memberName || 'N/A'} (${data?.memberId || 'N/A'})`;
  const txnId = data?.orderId || data?.txnId || data?.transId || 'N/A';
  const category = data?.category || data?.serviceName || data?.service || 'N/A';
  const billerName = data?.billerName || data?.operatorName || data?.operator || 'N/A';
  const billerId = data?.billerId || data?.operatorId || 'N/A';
  const operatorId = data?.operatorId || 'N/A';
  const consumerName = data?.consumerName || data?.customerName || data?.name || 'N/A';
  const consumerNumber = data?.consumerNumber || data?.number || data?.customerMobile || data?.accountNo || 'N/A';

  const pairs = [
    ['Agent Detail', agentDetail],
    ['TXN ID', txnId],
    ['Category', category],
    ['Biller Name', billerName],
    ['Biller ID', billerId],
    ['Operator ID', operatorId],
    ['Consumer Name', consumerName],
    ['Consumer Number', consumerNumber],
    ['Due Date', data?.dueDate || ''],
    ['Bill Date', data?.billDate || data?.date || ''],
    ['Bill Amount', amountStr],
  ];

  if (isThermal) {
    const lbl = { fontSize: Math.max(fs - 3, 8), color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, fontFamily: '"DM Sans",sans-serif' };
    const val = { fontSize: fs, color: '#0F172A', fontWeight: 700, fontFamily: '"DM Sans",sans-serif' };
    return (
      <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: cfg.sepMar }}>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: isFail ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
            </svg>
          </div>
          <div style={{ fontSize: cfg.amtSize || 20, fontWeight: 800, color: '#0D1B3E' }}>{amountStr}</div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        {pairs.map(([k, v]) => [k.toUpperCase(), v]).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'N/A').map(([k, v]) => (
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

  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
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
      </div>

      <AepsPairTable fs={fs} pairs={pairs} />

      {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
        <div style={{ margin: '12px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: fs - 1, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 4 }}>
            {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
          </div>
          {data.forceUtr && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>UTR Number: {data.forceUtr}</div>}
          {data.forceReason && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: 500, margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
      </div>
    </div>
  );
}

// Credit Card Bill Pay — its own dedicated layout: Credit Card No, Name,
// Mobile No, Amount, TXN ID, TXN Date only, no summary table (same
// single-table pattern as UPI/Recharge).
function CcBillPayReceiptBody({ data, cfg }) {
  const fs = cfg.fontSize;
  const isThermal = !cfg.twoCol;

  const st = String(data?.status || 'PENDING').toUpperCase();
  const isFail = st === 'FAILED' || st === 'REJECTED';
  const isPending = st === 'PENDING';
  const amountStr = `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const cardNo = data?.cardNumber || data?.accountNo || 'N/A';
  const name = data?.customerName || data?.memberName || data?.name || 'N/A';
  const mobile = data?.customerMobile || data?.mobile || data?.number || 'N/A';
  const txnId = data?.orderId || data?.txnId || data?.refid || 'N/A';

  if (isThermal) {
    const lbl = { fontSize: Math.max(fs - 3, 8), color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, fontFamily: '"DM Sans",sans-serif' };
    const val = { fontSize: fs, color: '#0F172A', fontWeight: 700, fontFamily: '"DM Sans",sans-serif' };
    return (
      <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: cfg.sepMar }}>
          <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: isFail ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {isFail ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
            </svg>
          </div>
          <div style={{ fontSize: cfg.amtSize || 20, fontWeight: 800, color: '#0D1B3E' }}>{amountStr}</div>
        </div>
        <div style={{ height: 1, background: '#E2E8F0', margin: `${cfg.sepMar}px 0` }} />
        {[
          ['CREDIT CARD NO', cardNo],
          ['NAME', name],
          ['MOBILE NO', mobile],
          ['AMOUNT', amountStr],
          ['TXN ID', txnId],
          ['TXN DATE', data?.date || ''],
        ].filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'N/A').map(([k, v]) => (
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

  return (
    <div style={{ fontFamily: '"DM Sans",sans-serif', color: '#0F172A', padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <img src={SITE_CONFIG.logo} alt="Logo" style={{ height: cfg.logoH, display: 'block', margin: 0 }} />
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
      </div>

      <AepsPairTable fs={fs} pairs={[
        ['Credit Card No', cardNo],
        ['Name', name],
        ['Mobile No', mobile],
        ['Amount', amountStr],
        ['TXN ID', txnId],
        ['TXN Date', data?.date || ''],
      ]} />

      {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
        <div style={{ margin: '12px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: fs - 1, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 4 }}>
            {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
          </div>
          {data.forceUtr && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>UTR Number: {data.forceUtr}</div>}
          {data.forceReason && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: 500, margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
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
              <span style={val}>{data?.customerName || 'N/A'}</span>
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
        
        {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
          <div style={{ margin: '8px 0 4px', borderRadius: 6, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '8px 10px' }}>
            <div style={{ fontWeight: 800, fontSize: Math.max(fs - 2, 8), color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 3 }}>
              {data.forceAction === 'Force Success' ? '✓ Force Success' : '✕ Force Fail'}
            </div>
            {data.forceUtr && <div style={{ fontSize: Math.max(fs - 2, 8), color: '#0F172A', fontWeight: 600 }}>UTR: {data.forceUtr}</div>}
            {data.forceReason && <div style={{ fontSize: Math.max(fs - 2, 8), color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
          </div>
        )}
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

            {/* Info table — same filtered paired-cell style as the AEPS
          receipt; a field with no value is skipped, identity fields fall
          back to 'N/A' so they always render. */}
      <AepsPairTable fs={fs} pairs={[
        ['Customer Name', data?.customerName || 'N/A'],
        ['Mobile Number', data?.customerMobile || 'N/A'],
        ['Beneficiary Name', data?.beneficiary || 'N/A'],
        ['Bank Name', data?.bank || 'N/A'],
        ['Account Number', data?.accountNo ? `${data.accountNo}${data?.ifsc ? ` (IFSC: ${data.ifsc})` : ''}` : 'N/A'],
        ['Date & Time', data?.date || ''],
      ]} />

            <div style={{ textAlign: 'center', marginBottom: 15 }}>
        <span style={{ fontSize: fs + 1.5, fontWeight: '800', color: '#1756AA', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Transaction Summary
        </span>
      </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: fs, tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '40%' }}>TXN ID</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '30%' }}>AMOUNT</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '30%' }}>UTR NUMBER</th>
          </tr>
        </thead>
        <tbody>
          {(data?.chunks || [{ id: 'c1', txnId: data?.bankTransId || data?.id || 'N/A', amount: data?.amount || 0 }]).map((c, i) => (
            <tr key={c.id || i}>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{c.txnId}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#0F172A', fontWeight: '700' }}>₹{Number(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{data?.rrn || c.txnId}</td>
            </tr>
          ))}
          <tr style={{ background: '#FFFFFF' }}>
            <td style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>Total Amount:</td>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA', wordBreak: 'break-word' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} — Rs. {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( {toWords(data?.amount || 0)} )</td>
          </tr>
        </tbody>
      </table>

      {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
        <div style={{ margin: '12px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: fs - 1, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 4 }}>
            {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
          </div>
          {data.forceUtr && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>UTR Number: {data.forceUtr}</div>}
          {data.forceReason && <div style={{ fontSize: fs - 1, color: '#0F172A', fontWeight: 600 }}>Reason: {data.forceReason}</div>}
        </div>
      )}
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

  // Some entry points (e.g. the floating "search by TXN ID" widget, which
  // pulls a raw record straight from /Transaction/search) don't set `_type`
  // and can carry the Aadhaar field under a name/shape this component wasn't
  // checking, or blank — so an AEPS transaction was silently falling through
  // to the generic DMT-style receipt (wrong fields: Merchant/Beneficiary/
  // Account Number instead of Bank/Aadhaar/BC Code). Widen detection to also
  // key off sectionType ('9'/'10' — the AEPS section codes used elsewhere in
  // this app, e.g. AEPSReport.jsx) and common AEPS service-name keywords, so
  // every AEPS transaction consistently renders via AepsReceiptBody no
  // matter which screen opened this modal.
  const sectionTypeStr = String(data?.sectionType ?? data?.SectionType ?? '');
  const aepsKeywordHit = /aeps|cash\s*withdraw|balance\s*enquiry|mini\s*statement|aadhar\s*pay/i.test(
    String(data?.serviceName || data?.type || data?.transactionType || data?.mode || '')
  );
  const receiptType = data?._type
    || (data?.aadhar || data?.aadharNo || data?.aadharNumber || data?.AadharNo ? 'aeps' : null)
    || (sectionTypeStr === '9' || sectionTypeStr === '10' ? 'aeps' : null)
    || (aepsKeywordHit ? 'aeps' : null)
    || 'dmt';
  const isAeps = receiptType === 'aeps';

  const mappedData = data ? {
    ...data,
    isAeps,
    date: data.createdDate || data.date || data.txnDate || data.transactionDate || data.created_at || 'N/A',
    status: data.status || 'PENDING',
    // AEPS fields
    aadhar: data.aadhar || data.aadharNo || data.aadharNumber || data.AadharNo || data.accountNo || data.accountNumber || '',
    bankName: data.bankName || data.bank || 'N/A',
    mobile: data.mobile || data.mobileNumber || data.customerMobile || data.number || 'N/A',
    bankTransId: data.bankTransId || data.txnId || data.transId || data.orderId || 'N/A',
    rrn: data.rrn || data.vendorId || 'N/A',
    memberId: data.memberId || data.loginId || '',
    memberName: data.memberName || data.bcName || '',
    transactionType: data.transactionType || data.mode || data.serviceName || 'Cash Withdrawal',
    remark: data.remark || data.message || '',
    balance: data.closing ?? data.closingBalance ?? data.balance ?? data.walletBalance ?? '',
    // DMT fields
    // `memberName` deliberately dropped from this fallback chain — that's the
    // BC's own name, not the customer's, and it was causing the receipt to
    // silently show the BC as the "customer" whenever the transaction had no
    // real customer name. If there's genuinely no customer data, show N/A —
    // never fabricate a name.
    customerName: data.customerName || data.name || data.beneName || 'N/A',
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
    if (!pw) {
      // Most common reason "print button does nothing": the browser's popup
      // blocker silently killed window.open(). Tell the user instead of
      // failing silently.
      alert('Print window was blocked by your browser. Please allow pop-ups for this site and try again.');
      return;
    }
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
    setTimeout(() => {
      // NOTE: deliberately NOT auto-closing this window on 'afterprint'.
      // That event is unreliable for popup windows opened via window.open()
      // — depending on the browser it can fire before the print/Save-as-PDF
      // dialog even opens (closing the window mid-print, so nothing gets
      // printed/saved) or never fire at all (window stays open forever).
      // Just print and leave the tab open — the user closes it themselves,
      // same as any normal browser print/PDF-save tab. This is the only
      // approach that doesn't race the actual print job.
      pw.print();
    }, 700);
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

                // AEPS keeps its own dedicated layout (Bank Name/BC Code/BC
                // Name/Aadhar No/Customer Mobile/Balance/Remark). Every other
                // transaction type — DMT, Recharge, BBPS, MATM, Payout, and
                // anything unclassified — now renders through the same
                // ReceiptBody so the receipt looks identical everywhere in
                // the app, per explicit request: one consistent non-AEPS
                // format site-wide instead of a different layout per type.
                if (t === 'aeps') return <AepsReceiptBody data={mappedData} cfg={cfg} />;
                // Recharge & BBPS: identical dedicated layout, per explicit
                // request — Number/Operator/Service/Total Amount/TXN ID/
                // Operator Ref Number/Date & Time only, no summary table.
                if (t === 'recharge') return <RechargeReceiptBody data={mappedData} cfg={cfg} />;
                // BBPS — member panel only (this file). Its own dedicated
                // layout per explicit request: Agent Detail/TXN ID/Category/
                // Biller Name/Biller ID/Operator ID/Consumer Name/Consumer
                // Number/Due Date/Bill Date/Bill Amount.
                if (t === 'bbps') return <BbpsReceiptBody data={mappedData} cfg={cfg} />;
                // Credit Card Bill Pay: its own dedicated layout.
                if (t === 'ccbillpay') return <CcBillPayReceiptBody data={mappedData} cfg={cfg} />;
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
