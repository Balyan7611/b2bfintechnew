import React, { useState, useRef, useLayoutEffect } from 'react';
import { SITE_CONFIG } from '../../../../config/siteConfig';
import { getSession } from '../../../../utils/authUtils';


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

// Same paired-cell AEPS info table as ReceiptModal.jsx's AepsReceiptBody —
// duplicated here (not imported) because this file lives under member/
// Services and is used from admin report pages too; keeping it self
// contained avoids a cross-tree import for one small helper. A field with
// no value is skipped entirely (identity fields fall back to 'N/A' so they
// always render).
function AepsInfoTable({ data, fs }) {
  const pairs = [
    ['Bank Name', data.aepsBankName],
    ['BC Code', data.aepsBcCode],
    ['BC Name', data.aepsBcName],
    ['Aadhar No', data.aepsAadhar],
    ['Customer Mobile', data.customerMobile],
    ['Balance', data.aepsBalance],
    ['Remark', data.aepsRemark],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');
  const rows = [];
  for (let i = 0; i < pairs.length; i += 2) rows.push(pairs.slice(i, i + 2));
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

// Same paired-cell style as AepsInfoTable above, generalized to take any
// [label, value] list — used for the DMT/generic receipt so it matches the
// same "only fields that have a value" presentation as the AEPS receipt.
function PairTable({ pairs, fs }) {
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
              <span style={lbl}>{data?.mode === 'AEPS' ? 'MEMBER NAME' : 'CUSTOMER'}</span>
              <span style={val}>{data?.customerName || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>{data?.mode === 'AEPS' ? 'MEMBER ID' : 'CUST. MOBILE'}</span>
              <span style={val}>{data?.customerMobile || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>{data?.mode === 'AEPS' ? 'AADHAR NUMBER' : 'BENEFICIARY'}</span>
              <span style={val}>{data?.beneficiary || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={lbl}>{data?.mode === 'AEPS' ? 'TXN TYPE / REF' : 'BANK & A/C'}</span>
              <span style={val}>{data?.bank} {data?.accountNo ? `(${maskAccount(data?.accountNo)})` : ''}</span>
            </div>
            {data?.mode === 'AEPS' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={lbl}>OP BAL</span>
                  <span style={val}>₹{Number(data.opBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={lbl}>CL BAL</span>
                  <span style={val}>₹{Number(data.clBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={lbl}>COMMISSION</span>
                  <span style={val}>₹{Number(data.commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={lbl}>TDS</span>
                  <span style={val}>₹{Number(data.tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={lbl}>REMARK</span>
                  <span style={{...val, fontSize: Math.max(fs - 2, 8), textAlign: 'right', maxWidth: '60%'}}>{data.remark || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={lbl}>STATUS</span>
                  <span style={{ ...val, background: (()=>{ const s=(data?.status||'').toLowerCase(); return s==='success'?'#DCFCE7':s==='pending'?'#FEF3C7':s==='processing'?'#DBEAFE':'#FEE2E2'; })(), color: (()=>{ const s=(data?.status||'').toLowerCase(); return s==='success'?'#15803D':s==='pending'?'#B45309':s==='processing'?'#1E40AF':'#B91C1C'; })(), padding: '1px 6px', borderRadius: 4, fontSize: Math.max(fs - 2, 8) }}>{data.status || 'N/A'}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={lbl}>MODE</span>
              <span style={{ ...val, background: 'rgba(23,86,170,0.08)', color: '#1756AA', padding: '1px 6px', borderRadius: 50, fontSize: 10 }}>{data?.mode}</span>
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
            <div style={lbl}>TRANSACTION CHUNKS (IDS)</div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(data?.chunks || []).map((c, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0',
                borderBottom: i < (data.chunks.length - 1) ? '1px dashed #EEF0F4' : 'none',
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
          const s = (data?.status || '').toLowerCase();
          const bg  = s==='success'?'#DCFCE7':s==='pending'?'#FEF3C7':s==='processing'?'#DBEAFE':'#FEE2E2';
          const bdr = s==='success'?'#BBF7D0':s==='pending'?'#FDE68A':s==='processing'?'#BFDBFE':'#FECACA';
          const dot = s==='success'?'#10B981':s==='pending'?'#F59E0B':s==='processing'?'#3B82F6':'#EF4444';
          const clr = s==='success'?'#065F46':s==='pending'?'#92400E':s==='processing'?'#1E3A8A':'#991B1B';
          const icon = s==='success'
            ? <polyline points="20 6 9 17 4 12" />
            : s==='pending'
            ? <circle cx="12" cy="12" r="4" />
            : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>;
          return (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:bg, border:`1px solid ${bdr}`, borderRadius:50, padding:'5px 14px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:dot, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </svg>
              </div>
              <span style={{ fontSize: fs - 3, fontWeight: 800, color: clr, letterSpacing: '0.6px' }}>{(data?.status || 'N/A').toUpperCase()}</span>
            </div>
          );
        })()}
      </div>

            {data?.isAeps ? (
        <AepsInfoTable data={data} fs={fs} />
      ) : data?.isUpi ? (
        <PairTable fs={fs} pairs={[
          ['Name', data?.upiName || 'N/A'],
          ['UPI ID', data?.upiId || 'N/A'],
          ['Txn ID', data?.upiTxnId || 'N/A'],
          ['Reference ID', data?.upiRefId || 'N/A'],
          ['Amount', `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
          ['UTR', data?.upiUtr || 'N/A'],
          ['Date', data?.date || ''],
        ]} />
      ) : data?.isRecharge ? (
        <PairTable fs={fs} pairs={[
          ['Number', data?.rgNumber || 'N/A'],
          ['Operator', data?.rgOperator || 'N/A'],
          ['Service', data?.rgService || 'N/A'],
          ['Total Amount', `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
          ['TXN ID', data?.rgTxnId || 'N/A'],
          ['Operator Ref Number', data?.rgOperatorRefNumber || 'N/A'],
          ['Date & Time', data?.date || ''],
        ]} />
      ) : data?.isCcBillPay ? (
        <PairTable fs={fs} pairs={[
          ['Credit Card No', data?.ccCardNo || 'N/A'],
          ['Name', data?.ccName || 'N/A'],
          ['Mobile No', data?.ccMobile || 'N/A'],
          ['Amount', `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
          ['TXN ID', data?.ccTxnId || 'N/A'],
          ['TXN Date', data?.date || ''],
        ]} />
      ) : data?.isBbps ? (
        <PairTable fs={fs} pairs={[
          ['Mobile/Consumer No', data?.bbpsConsumerNo || 'N/A'],
          ['Operator', data?.bbpsOperator || 'N/A'],
          ['TXN ID', data?.bbpsTxnId || 'N/A'],
          ['Operator Ref Number', data?.bbpsOperatorRefNumber || 'N/A'],
          ['Date and Time', data?.date || ''],
          ['Amount', `₹${Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
          ['Member Name', data?.bbpsMemberId || 'N/A'],
        ]} />
      ) : (
        <PairTable fs={fs} pairs={[
          ['Customer Name', data?.customerName || 'N/A'],
          ['Mobile Number', data?.customerMobile || 'N/A'],
          ['Beneficiary Name', data?.beneficiary || 'N/A'],
          ['Bank Name', data?.bank || 'N/A'],
          ['Account Number', data?.accountNo ? `${data.accountNo}${data?.ifsc ? ` (IFSC: ${data.ifsc})` : ''}` : 'N/A'],
          ['Date & Time', data?.date || ''],
        ]} />
      )}

            {!data?.isUpi && !data?.isRecharge && !data?.isCcBillPay && !data?.isBbps && (
            <>
            <div style={{ textAlign: 'center', marginBottom: 15 }}>
        <span style={{ fontSize: fs + 1.5, fontWeight: '800', color: '#1756AA', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Transaction Summary
        </span>
      </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: fs, tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: data?.isAeps ? '28%' : '40%' }}>{data?.isAeps ? 'TID' : 'TXN ID'}</th>
            {data?.isAeps && <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: '17%' }}>TXN DATE</th>}
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: data?.isAeps ? '18%' : '30%' }}>AMOUNT</th>
            <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'left', width: data?.isAeps ? '22%' : '30%' }}>{data?.isAeps ? 'RRN' : 'UTR NUMBER'}</th>
            {data?.isAeps && <th style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontWeight: '800', color: '#475569', textAlign: 'center', width: '15%' }}>STATUS</th>}
          </tr>
        </thead>
        <tbody>
          {(data?.isAeps
            ? [{ id: 'aeps_1', txnId: data?.bankTransId || 'N/A', amount: data?.amount || 0 }]
            : ((data?.chunks && data.chunks.length > 0) ? data.chunks : [{ id: 'chk_1', txnId: 'N/A', amount: data?.amount || 0 }])
          ).map((c, i) => (
            <tr key={c.id || i}>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{c.txnId || 'N/A'}</td>
              {data?.isAeps && <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{data?.date?.split(' ')[0]}</td>}
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#0F172A', fontWeight: '700' }}>₹{Number(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>{data?.isAeps ? (data?.rrn || 'N/A') : (c.txnId || 'N/A')}</td>
              {data?.isAeps && (
              <td style={{ padding: '10px 12px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
                {(() => {
                  const s = (data?.status || '').toLowerCase();
                  const bg  = s==='success'?'#DCFCE7':s==='pending'?'#FEF3C7':s==='processing'?'#DBEAFE':'#FEE2E2';
                  const clr = s==='success'?'#065F46':s==='pending'?'#92400E':s==='processing'?'#1E3A8A':'#991B1B';
                  const bdr = s==='success'?'#BBF7D0':s==='pending'?'#FDE68A':s==='processing'?'#BFDBFE':'#FECACA';
                  return <span style={{ background:bg, border:`1px solid ${bdr}`, color:clr, padding:'2px 8px', borderRadius:50, fontSize:9.5, fontWeight:'800' }}>{(data?.status||'N/A').toUpperCase()}</span>;
                })()}
              </td>
              )}
            </tr>
          ))}
          {data?.isAeps ? (
          <tr style={{ background: '#FFFFFF' }}>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>Total Amount:</td>
            <td style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA', wordBreak: 'break-word' }}>Rs. {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( {toWords(data?.amount || 0)} )</td>
          </tr>
          ) : (
          <tr style={{ background: '#FFFFFF' }}>
            <td style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA' }}>Total Amount:</td>
            <td colSpan="2" style={{ padding: '12px 12px', border: '1.5px solid #E2E8F0', fontWeight: '800', color: '#1756AA', wordBreak: 'break-word' }}>₹{Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} — Rs. {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( {toWords(data?.amount || 0)} )</td>
          </tr>
          )}
        </tbody>
      </table>
            </>
            )}

            {/* Force Action Details Box — shown only if force action was taken */}
            {(data?.forceAction || data?.forceReason || data?.forceUtr) && (
              <div style={{ margin: '18px 0 8px', borderRadius: 8, border: `1.5px solid ${data.forceAction === 'Force Success' ? '#BBF7D0' : '#FECACA'}`, background: data.forceAction === 'Force Success' ? '#F0FDF4' : '#FFF5F5', padding: '12px 16px' }}>
                <div style={{ fontSize: fs - 1, fontWeight: 800, color: data.forceAction === 'Force Success' ? '#15803D' : '#B91C1C', marginBottom: 8, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  {data.forceAction === 'Force Success' ? '✓ Force Success Details' : '✕ Force Fail Details'}
                </div>
                {data.forceUtr && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs - 2, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#64748B' }}>UTR Number:</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{data.forceUtr}</span>
                  </div>
                )}
                {data.forceReason && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs - 2 }}>
                    <span style={{ fontWeight: 700, color: '#64748B' }}>Reason:</span>
                    <span style={{ fontWeight: 700, color: '#0F172A', maxWidth: '65%', textAlign: 'right' }}>{data.forceReason}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 25 }}>
        <p style={{ color: '#64748B', fontSize: fs - 2, fontWeight: '500', margin: 0, letterSpacing: '0.2px' }}>
          This is a system generated receipt, so no seal or signature is required. All rights reserved @2026.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 15 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1756AA" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ color: '#1756AA', fontSize: fs - 3.5, fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            SECURED BY {SITE_CONFIG.shortName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
export default function TransactionReceipt({ data, onClose }) {
  const [size, setSize] = useState('A4');
  const previewWrapRef = useRef(null);
  const receiptRef = useRef(null);
  const [scale, setScale] = useState(1);

  const cfg = sizeConfig[size];
  const receiptPxWidth = SIZE_PX[size];

    // AEPS rows aren't always tagged with mode === 'AEPS' from the raw API
    // record — but every caller that opens an AEPS receipt (admin AEPSHistory,
    // AEPSReport) does set `_type: 'aeps'`. Trust that tag first so every AEPS
    // row renders the same way regardless of what the backend happened to put
    // in `mode`/`transactionType` for that particular row (this was the cause
    // of AEPS receipts looking different row-to-row).
    const isAeps = data?._type === 'aeps' || data?.mode === 'AEPS' || String(data?.transactionType || '').toUpperCase() === 'AEPS';
    const isUpi = data?._type === 'upi';
    const isRecharge = data?._type === 'recharge';
    const isCcBillPay = data?._type === 'ccbillpay';
    // Admin panel's BBPS receipt — its own dedicated field set (distinct
    // from Recharge and from member panel's BBPS receipt in ReceiptModal.jsx).
    const isBbps = data?._type === 'bbps';

    const mappedData = data ? {
    ...data,
    isAeps,
    isUpi,
    isRecharge,
    isCcBillPay,
    isBbps,
    date: data.date || (data.createdDate ? new Date(data.createdDate).toLocaleString('en-IN') : data.txnDate || data.transactionDate || 'N/A'),
    status: data.status || 'PENDING',
    // `memberName` deliberately dropped from this fallback chain — that's the
    // BC's own name, not the customer's, and it was causing the receipt to
    // silently show the BC as the "customer" whenever the transaction had no
    // real customer name. If there's genuinely no customer data, show N/A —
    // never fabricate a name.
    customerName: data.customerName || data.name || data.beneName || 'N/A',
    customerMobile: data.customerMobile || data.mobileNumber || data.mobile || data.number || data.senderMobile || 'N/A',
    beneficiary: data.beneficiary || data.beneficiaryName || data.beneName || data.beniName || data.beniVerifyName || data.memberName || 'N/A',
    bank: data.bank || data.bankName || data.beneBankName || 'N/A',
    accountNo: data.accountNo || data.accountNumber || data.accNo || data.aadhar || data.aadharNo || data.cardNo || 'N/A',
    ifsc: data.ifsc || data.ifscCode || '',
    mode: isAeps ? 'AEPS' : (data.mode || data.transactionType || data.fromChannel || 'IMPS'),
    bankTransId: data.bankTransId || data.txnId || data.transId || data.orderId || data.vendorId || data.refid || data.rrn || 'N/A',
    rrn: data.rrn || data.vendorId || data.bankTransId || data.txnId || data.refid || 'N/A',
    amount: Number(data.amount || 0),
    charge: Number(data.charge || data.surcharge || data.serviceCharge || 0),
    total: data.total || (Number(data.amount || 0) + Number(data.charge || data.surcharge || 0)),
    chunks: data.chunks || [{ txnId: data.bankTransId || data.txnId || data.orderId || data.refid || 'N/A', amount: Number(data.amount || 0) }],
    // AEPS-specific display fields (same set/labels as ReceiptModal.jsx's AepsReceiptBody)
    aepsBankName: data.bankName || data.bank || 'N/A',
    aepsAadhar: (() => {
      const a = String(data.aadhar || data.aadharNo || data.accountNo || data.accountNumber || '');
      return a.length >= 4 ? 'XXXX XXXX ' + a.slice(-4) : 'N/A';
    })(),
    aepsBcCode: data.memberId || data.loginId || 'N/A',
    aepsBcName: data.memberName || data.customerName || 'N/A',
    aepsBalance: (() => {
      const b = data.closing ?? data.closingBalance ?? data.clBal ?? data.balance ?? data.walletBalance;
      return (b !== undefined && b !== null && b !== '') ? `₹${Number(b).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '';
    })(),
    aepsRemark: data.remark || data.message || '',
    // UPI Transfer-specific display fields: Name, UPI ID, TXN ID, Reference
    // ID, Amount, UTR, Date — nothing else.
    upiName: data.name || data.beneficiary || data.customerName || 'N/A',
    upiId: data.upiId || data.accountNo || 'N/A',
    upiTxnId: data.txnId || data.bankTransId || data.orderId || 'N/A',
    upiRefId: data.refId || data.refid || data.referenceId || 'N/A',
    upiUtr: data.utr || data.rrn || 'N/A',
    // Recharge-specific display fields: Number, Operator, Service, Total
    // Amount, TXN ID, Operator Ref Number, Date & Time — nothing else.
    rgNumber: data.number || data.customerMobile || data.accountNo || data.mobileNumber || 'N/A',
    rgOperator: data.operatorName || data.operator || data.operatorId || 'N/A',
    rgService: data.serviceName || data.service || 'Recharge',
    rgTxnId: data.orderId || data.txnId || data.transId || data.bankTransId || 'N/A',
    rgOperatorRefNumber: data.refid || data.rrn || data.operatorRefNo || data.bankRefNo || data.vendorId || 'N/A',
    // Admin BBPS-specific display fields: Mobile/Consumer No, Operator, TXN
    // ID, Operator Ref Number, Date & Time, Amount, Member ID (their member
    // code, e.g. "RT100").
    bbpsConsumerNo: data.number || data.customerMobile || data.accountNo || data.mobileNumber || 'N/A',
    bbpsOperator: data.operatorName || data.operator || data.operatorId || 'N/A',
    bbpsTxnId: data.orderId || data.txnId || data.transId || data.bankTransId || 'N/A',
    bbpsOperatorRefNumber: data.refid || data.rrn || data.operatorRefNo || data.bankRefNo || data.vendorId || 'N/A',
    // `memberId` is often blank on these records — the actual member code
    // (e.g. "RT100") usually comes through as `userId` instead (same fields
    // CCBillPayHistory.jsx's table already falls back to). Show the name
    // together with whichever ID is actually populated, so this row isn't
    // blank just because one of the two field names happened to be empty.
    bbpsMemberId: (() => {
      const nm = data.memberName || data.customerName || '';
      // `memberCode` is the actual human-readable member code (e.g.
      // "RT100"), resolved by BBPSTransaction.jsx by looking the row's
      // numeric memberId up against the member master list — that's the
      // real ID, not the raw memberId/userId (which is just a DB primary
      // key and isn't what shows anywhere else in the app as "member ID").
      const id = data.memberCode || data.memberId || data.userId || data.loginId || '';
      if (nm && id) return `${nm} (${id})`;
      return nm || id || 'N/A';
    })(),
    // Credit Card Bill Pay-specific display fields: Credit Card No, Name,
    // Mobile No, Amount, TXN ID, TXN Date — nothing else.
    ccCardNo: data.cardNumber || data.accountNo || 'N/A',
    ccName: data.customerName || data.memberName || data.name || 'N/A',
    ccMobile: data.customerMobile || data.mobile || data.number || 'N/A',
    ccTxnId: data.orderId || data.txnId || data.refid || 'N/A',
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
  }, [size, receiptPxWidth]);

    const printReceipt = () => {
    const pw = window.open('', '_blank', 'width=900,height=700');
    if (!pw) {
      // This was the actual cause of "print karta hu print hi nahi hota":
      // window.open() returns null when the browser's popup blocker kicks
      // in, and the code below would then throw on pw.document.write with
      // no visible error — print silently never happened. Guard + tell the
      // user instead of failing silently.
      alert('Print window was blocked by your browser. Please allow pop-ups for this site and try again.');
      return;
    }
    const isTh = !cfg.twoCol;
    const fs = cfg.fontSize;

    const _session = getSession();
    const merchantName = _session?.name || _session?.fullName || _session?.ownerName || _session?.firmName || SITE_CONFIG.name || 'Merchant';
    const shopName = _session?.shopName || _session?.firmName || _session?.businessName || SITE_CONFIG.name || 'Shop';

    const chunksHtml = (mappedData.isAeps ? [{ txnId: mappedData.bankTransId, amount: mappedData.amount }] : (mappedData.chunks || [])).map((c, i, arr) => `
      <tr>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${c.txnId || 'N/A'}</td>
        ${mappedData.isAeps ? `<td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${mappedData.date ? mappedData.date.split(' ')[0] : ''}</td>` : ''}
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#0F172A;font-weight:700;">₹${Number(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${mappedData.isAeps ? (mappedData.rrn || 'N/A') : (c.txnId || 'N/A')}</td>
        ${mappedData.isAeps ? `<td style="padding:10px 12px;border:1.5px solid #E2E8F0;text-align:center;"><span style="background:${mappedData.status?.toLowerCase()==='success'?'#DCFCE7':mappedData.status?.toLowerCase()==='pending'?'#FEF3C7':mappedData.status?.toLowerCase()==='processing'?'#DBEAFE':'#FEE2E2'};border:1px solid ${mappedData.status?.toLowerCase()==='success'?'#BBF7D0':mappedData.status?.toLowerCase()==='pending'?'#FDE68A':mappedData.status?.toLowerCase()==='processing'?'#BFDBFE':'#FECACA'};color:${mappedData.status?.toLowerCase()==='success'?'#065F46':mappedData.status?.toLowerCase()==='pending'?'#92400E':'#991B1B'};padding:2px 8px;border-radius:50px;font-size:9.5px;font-weight:800;display:inline-block;">${(mappedData.status||'N/A').toUpperCase()}</span></td>` : ''}
      </tr>
    `).join('');

    const templateHtml = !isTh ? `
      <!-- Top Banner Row for Printing -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <img src="${SITE_CONFIG.logo}" style="height:${cfg.logoH}px;display:block;margin:0;"/>
        <div style="display:flex;align-items:center;gap:6px;background:${mappedData.status?.toLowerCase()==='success'?'#DCFCE7':mappedData.status?.toLowerCase()==='pending'?'#FEF3C7':mappedData.status?.toLowerCase()==='processing'?'#DBEAFE':'#FEE2E2'};border:1px solid ${mappedData.status?.toLowerCase()==='success'?'#BBF7D0':mappedData.status?.toLowerCase()==='pending'?'#FDE68A':mappedData.status?.toLowerCase()==='processing'?'#BFDBFE':'#FECACA'};border-radius:50px;padding:5px 14px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <div style="width:14px;height:14px;border-radius:50%;background:${mappedData.status?.toLowerCase()==='success'?'#10B981':mappedData.status?.toLowerCase()==='pending'?'#F59E0B':'#EF4444'};display:flex;align-items:center;justify-content:center;">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
              ${mappedData.status?.toLowerCase()==='success'?'<polyline points="20 6 9 17 4 12" />':mappedData.status?.toLowerCase()==='pending'?'<circle cx="12" cy="12" r="4"/>':'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}
            </svg>
          </div>
          <span style="font-size:${fs - 3}px;font-weight:800;color:${mappedData.status?.toLowerCase()==='success'?'#065F46':mappedData.status?.toLowerCase()==='pending'?'#92400E':'#991B1B'};letter-spacing:0.6px;">${(mappedData.status||'N/A').toUpperCase()}</span>
        </div>
      </div>

      <div style="height:1px;background:#E2E8F0;margin:15px 0 20px;"></div>

      <!-- Main Grid Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:25px;font-size:${fs}px;font-family:'DM Sans',sans-serif;">
        <tbody>
          ${mappedData.isAeps ? `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Bank Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.aepsBankName}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">BC Code:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.aepsBcCode}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">BC Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.aepsBcName}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Aadhar No:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.aepsAadhar}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Customer Mobile:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.customerMobile || 'N/A'}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Balance:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.aepsBalance || 'N/A'}</td>
          </tr>
          ${mappedData.aepsRemark ? `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Remark:</td>
            <td colspan="3" style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.aepsRemark}</td>
          </tr>
          ` : ''}
          ` : mappedData.isUpi ? `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.upiName}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">UPI ID:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.upiId}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Txn ID:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.upiTxnId}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Reference ID:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.upiRefId}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Amount:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">UTR:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.upiUtr}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Date:</td>
            <td colspan="3" style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.date}</td>
          </tr>
          ` : mappedData.isRecharge ? `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Number:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.rgNumber}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Operator:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.rgOperator}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Service:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.rgService}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Total Amount:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">TXN ID:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.rgTxnId}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Operator Ref Number:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.rgOperatorRefNumber}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Date & Time:</td>
            <td colspan="3" style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.date}</td>
          </tr>
          ` : mappedData.isCcBillPay ? `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Credit Card No:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.ccCardNo}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.ccName}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Mobile No:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.ccMobile}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Amount:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">TXN ID:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.ccTxnId}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">TXN Date:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.date}</td>
          </tr>
          ` : mappedData.isBbps ? `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Mobile/Consumer No:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.bbpsConsumerNo}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Operator:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.bbpsOperator}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">TXN ID:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.bbpsTxnId}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Operator Ref Number:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.bbpsOperatorRefNumber}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Date and Time:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.date}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Amount:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Member Name:</td>
            <td colspan="3" style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.bbpsMemberId}</td>
          </tr>
          ` : `
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Customer Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.customerName || 'N/A'}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;width:20%;">Mobile Number:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;width:30%;">${mappedData.customerMobile || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Beneficiary Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.beneficiary || 'N/A'}</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Bank Name:</td>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.bank || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Account Number:</td>
            <td colspan="3" style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.accountNo || 'N/A'} ${mappedData.ifsc ? `(IFSC: ${mappedData.ifsc})` : ''}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:800;color:#64748B;background:#F8FAFC;">Date & Time:</td>
            <td colspan="3" style="padding:10px 14px;border:1.5px solid #E2E8F0;font-weight:700;color:#0F172A;">${mappedData.date}</td>
          </tr>
          `}
        </tbody>
      </table>

      ${(mappedData.isUpi || mappedData.isRecharge || mappedData.isCcBillPay || mappedData.isBbps) ? '' : `
      <div style="text-align:center;margin-bottom:15px;">
        <span style="font-size:${fs + 1.5}px;font-weight:800;color:#1756AA;text-transform:uppercase;letter-spacing:1px;">Transaction Summary</span>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:${fs}px;font-family:'DM Sans',sans-serif;">
        <thead>
          <tr style="background:#F8FAFC;">
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">${mappedData.isAeps ? 'TID' : 'TXN ID'}</th>
            ${mappedData.isAeps ? `<th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">TXN DATE</th>` : ''}
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">AMOUNT</th>
            <th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">${mappedData.isAeps ? 'RRN' : 'UTR NUMBER'}</th>
            ${mappedData.isAeps ? `<th style="padding:10px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#475569;text-align:left;">STATUS</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${chunksHtml ? chunksHtml : (mappedData.isAeps ? `
            <tr>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">N/A</td>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">${mappedData.date ? mappedData.date.split(' ')[0] : ''}</td>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#0F172A;font-weight:700;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">N/A</td>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;"><span style="background:${mappedData.status?.toLowerCase()==='success'?'#DCFCE7':mappedData.status?.toLowerCase()==='pending'?'#FEF3C7':mappedData.status?.toLowerCase()==='processing'?'#DBEAFE':'#FEE2E2'};border:1px solid ${mappedData.status?.toLowerCase()==='success'?'#BBF7D0':mappedData.status?.toLowerCase()==='pending'?'#FDE68A':mappedData.status?.toLowerCase()==='processing'?'#BFDBFE':'#FECACA'};color:${mappedData.status?.toLowerCase()==='success'?'#065F46':mappedData.status?.toLowerCase()==='pending'?'#92400E':'#991B1B'};padding:2px 8px;border-radius:50px;font-size:9.5px;font-weight:800;">${(mappedData.status||'N/A').toUpperCase()}</span></td>
            </tr>
          ` : `
            <tr>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">N/A</td>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#0F172A;font-weight:700;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style="padding:10px 12px;border:1.5px solid #E2E8F0;color:#334155;font-weight:600;">N/A</td>
            </tr>
          `)}
          ${mappedData.isAeps ? `
          <tr style="background:#FFFFFF;">
            <td colSpan="2" style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">Total Amount:</td>
            <td style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td colSpan="2" style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">Rs. ${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( ${toWords(mappedData.amount || 0)} )</td>
          </tr>
          ` : `
          <tr style="background:#FFFFFF;">
            <td style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">Total Amount:</td>
            <td colSpan="2" style="padding:12px 12px;border:1.5px solid #E2E8F0;font-weight:800;color:#1756AA;">₹${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} — Rs. ${Number(mappedData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ( ${toWords(mappedData.amount || 0)} )</td>
          </tr>
          `}
        </tbody>
      </table>
      `}

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
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">${mappedData.mode === 'AEPS' ? 'MEMBER NAME' : 'CUSTOMER'}</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.customerName || 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">${mappedData.mode === 'AEPS' ? 'MEMBER ID' : 'CUST. MOBILE'}</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.customerMobile || 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">${mappedData.mode === 'AEPS' ? 'AADHAR NUMBER' : 'BENEFICIARY'}</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.beneficiary || 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">${mappedData.mode === 'AEPS' ? 'TXN TYPE / REF' : 'BANK & A/C'}</span>
            <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">${mappedData.bank} ${mappedData.accountNo ? `(${maskAccount(mappedData.accountNo)})` : ''}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">MODE</span>
            <span style="font-size:10px;color:#1756AA;background:rgba(23,86,170,0.08);padding:1px 6px;border-radius:50px;font-weight:700;">${mappedData.mode}</span>
          </div>
          ${mappedData.mode === 'AEPS' ? `
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">OP BAL</span>
              <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">₹${Number(mappedData.opBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">CL BAL</span>
              <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">₹${Number(mappedData.clBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">COMMISSION</span>
              <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">₹${Number(mappedData.commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">TDS</span>
              <span style="font-size:${fs}px;color:#0D1B3E;font-weight:700;">₹${Number(mappedData.tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">STATUS</span>
              <span style="font-size:${Math.max(fs - 2, 8)}px;color:${mappedData.status?.toLowerCase()==='success'?'#15803D':mappedData.status?.toLowerCase()==='pending'?'#B45309':mappedData.status?.toLowerCase()==='processing'?'#1E40AF':'#B91C1C'};font-weight:700;">${mappedData.status || 'N/A'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:${Math.max(fs - 3, 8)}px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">REMARK</span>
              <span style="font-size:${Math.max(fs - 2, 8)}px;color:#0D1B3E;font-weight:700;text-align:right;max-width:60%;">${mappedData.remark || 'N/A'}</span>
            </div>
          ` : ''}
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
            ${(mappedData.chunks || []).map((c, i, arr) => `
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
        width: '100%', maxWidth: 820, height: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0D1B3E' }}>Transaction Receipt</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2, fontFamily: '"DM Sans",sans-serif' }}>Select size & print</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)} style={{
                padding: '6px 14px', borderRadius: 8,
                border: `1.5px solid ${size === s ? '#1756AA' : '#E2E8F0'}`,
                background: size === s ? '#EFF6FF' : '#F8FAFC',
                color: size === s ? '#1756AA' : '#94A3B8',
                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                fontFamily: '"DM Sans",sans-serif', lineHeight: 1, transition: 'all 0.15s',
              }}>{s}</button>
            ))}
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid #E2E8F0', background: '#F8FAFC',
            cursor: 'pointer', color: '#94A3B8', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>

                <div ref={previewWrapRef} style={{
          flex: 1, background: '#EAEEF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, overflow: 'hidden',
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

                <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid #F1F5F9', background: '#fff', flexShrink: 0 }}>
          <button onClick={printReceipt} style={{
            flex: 1, padding: 13, borderRadius: 10,
            background: '#0D1B3E', color: '#fff', border: 'none',
            fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer',
            fontFamily: '"DM Sans",sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print {size}
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: 13, borderRadius: 10,
            background: '#F8FAFC', color: '#475569',
            border: '1.5px solid #E2E8F0',
            fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer',
            fontFamily: '"DM Sans",sans-serif',
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
