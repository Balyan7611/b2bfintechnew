import React, { useState } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';

const LogModal = ({ show, txn, onClose }) => {
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  if (!show) return null;

  // Dynamic dummy data based on txn
  const dummyRequest = {
    method: "POST",
    url: "https://api.partner.com/v2/aeps/transaction",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer tok_a8f9c2d1b0e5"
    },
    body: {
      transactionId: txn?.id || "TXN" + Math.floor(Math.random() * 1000000),
      aadhaarNo: txn?.aadharNo || "XXXX-XXXX-1234",
      amount: txn?.amount || 1000,
      opBal: txn?.opBal || 5200,
      clBal: txn?.clBal || 6200,
      provider: txn?.providerName || "AEPS Gateway",
      timestamp: txn?.createdDate || new Date().toISOString()
    }
  };

  const dummyResponse = {
    status: 200,
    statusText: "OK",
    data: {
      status: txn?.status || "SUCCESS",
      transactionId: txn?.id || "TXN" + Math.floor(Math.random() * 1000000),
      operatorId: txn?.operatorId || "OP" + Math.floor(Math.random() * 900000),
      commission: txn?.commission || 10,
      tds: txn?.tds || 0.5,
      remark: txn?.remark || "Transaction processed successfully",
      api_response_code: "00",
      api_message: "Success"
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '580px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          background: '#F8FAFC'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>Transaction Logs</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              TXN ID: {txn?.id || txn?.operatorId || 'N/A'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          
          {/* Request section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Request API payload
              </span>
              <button
                onClick={() => copyToClipboard(dummyRequest, setCopiedReq)}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: '6px',
                  padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569',
                  display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                {copiedReq ? <FiCheck size={12} color="#10B981" /> : <FiCopy size={12} />}
                {copiedReq ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              background: '#0F172A', color: '#38BDF8', padding: '16px', borderRadius: '12px',
              fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto', margin: 0,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25)'
            }}>
              {JSON.stringify(dummyRequest, null, 2)}
            </pre>
          </div>

          {/* Response section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Response API response
              </span>
              <button
                onClick={() => copyToClipboard(dummyResponse, setCopiedRes)}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: '6px',
                  padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569',
                  display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                {copiedRes ? <FiCheck size={12} color="#10B981" /> : <FiCopy size={12} />}
                {copiedRes ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              background: '#0F172A', color: '#34D399', padding: '16px', borderRadius: '12px',
              fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto', margin: 0,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25)'
            }}>
              {JSON.stringify(dummyResponse, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', textAlign: 'right', background: '#F8FAFC' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#fff', border: 'none', borderRadius: '10px',
              padding: '10px 24px', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogModal;
