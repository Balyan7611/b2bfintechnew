import React, { useState } from 'react';
import { FiBarChart2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const StatsGrid = ({ stats, showStats }) => {
  if (!stats) return null;

  const {
    totalTxns = 0,
    totalAmount = 0,
    successTxns = 0,
    failedTxns = 0,
    pendingTxns = 0,
    totalCommission = 0,
    uplineCommission = 0,
    adminCommission = 0,
    totalTds = 0,
    adminProfit = 0,
    tdsPayable = 0,
    netPayable = 0
  } = stats;

  return (
    <div style={{ marginBottom: '20px' }}>
      {showStats && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Row 1 - 6 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '10px' }}>
            {[
              { label: 'Total Txn', val: totalTxns, grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', light: '#EFF6FF' },
              { label: 'Total Amount', val: '₹' + parseFloat(totalAmount).toFixed(2), grad: 'linear-gradient(135deg,#0EA5E9,#0284C7)', light: '#F0F9FF' },
              { label: 'Success Txn', val: successTxns, grad: 'linear-gradient(135deg,#10B981,#059669)', light: '#ECFDF5' },
              { label: 'Failed Txn', val: failedTxns, grad: 'linear-gradient(135deg,#EF4444,#DC2626)', light: '#FEF2F2' },
              { label: 'Pending Txn', val: pendingTxns, grad: 'linear-gradient(135deg,#F59E0B,#D97706)', light: '#FFFBEB' },
              { label: 'Total Commission', val: '₹' + parseFloat(totalCommission).toFixed(2), grad: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', light: '#F5F3FF' },
            ].map((card, idx) => (
              <div
                key={idx}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #F1F5F9',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
              >
                <div style={{ height: '4px', background: card.grad, borderRadius: '12px 12px 0 0' }} />
                <div style={{ padding: '10px 14px 12px', background: card.light }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{card.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 - 6 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
            {[
              { label: 'Upline Commission', val: '₹' + parseFloat(uplineCommission).toFixed(2), grad: 'linear-gradient(135deg,#A78BFA,#7C3AED)', light: '#F5F3FF' },
              { label: 'Admin Commission', val: '₹' + parseFloat(adminCommission).toFixed(2), grad: 'linear-gradient(135deg,#EC4899,#DB2777)', light: '#FDF2F8' },
              { label: 'TDS (0.50%)', val: '₹' + parseFloat(totalTds).toFixed(2), grad: 'linear-gradient(135deg,#F43F5E,#E11D48)', light: '#FFF1F2' },
              { label: 'Admin Profit', val: '₹' + parseFloat(adminProfit).toFixed(2), grad: 'linear-gradient(135deg,#06B6D4,#0891B2)', light: '#ECFEFF' },
              { label: 'TDS Payable', val: '₹' + parseFloat(tdsPayable).toFixed(2), grad: 'linear-gradient(135deg,#14B8A6,#0D9488)', light: '#F0FDFA' },
              { label: 'Net Payable', val: '₹' + parseFloat(netPayable).toFixed(2), grad: 'linear-gradient(135deg,#22C55E,#16A34A)', light: '#F0FDF4' },
            ].map((card, idx) => (
              <div
                key={idx}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #F1F5F9',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
              >
                <div style={{ height: '4px', background: card.grad, borderRadius: '12px 12px 0 0' }} />
                <div style={{ padding: '10px 14px 12px', background: card.light }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{card.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsGrid;
