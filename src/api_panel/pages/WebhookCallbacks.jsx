import React, { useState } from 'react';
import { 
  FiRefreshCw, FiSave, FiGlobe, FiLink
} from 'react-icons/fi';
import { 
  FaCheckCircle
} from 'react-icons/fa';
import AdminTable from '../../shared/components/common/AdminTable';

// Static services list (can be fetched from API later)
const DEFAULT_SERVICES = [
  { id: 1, name: 'AEPS' },
  { id: 2, name: 'AEPS Core' },
  { id: 3, name: 'Bill Payment' },
  { id: 4, name: 'Money Transfer' },
  { id: 5, name: 'Pan' },
  { id: 6, name: 'Pan Verification' },
  { id: 7, name: 'Recharge' },
  { id: 8, name: 'DTH' },
  { id: 9, name: 'UPI' },
  { id: 10, name: 'Credit Card Bill' },
  { id: 11, name: 'Payout' },
  { id: 12, name: 'MATM' },
  { id: 13, name: 'BBPS' },
  { id: 14, name: 'NSDL' },
  { id: 15, name: 'DMT PPI' },
];

const WebhookCallbacks = () => {
  const [webhooks, setWebhooks] = useState(() =>
    DEFAULT_SERVICES.map(s => ({
      id: s.id,
      serviceName: s.name,
      firstUrl: '',
      secondUrl: '',
      saved: false,
      editing: false
    }))
  );

  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUrlChange = (id, field, value) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id ? { ...w, [field]: value, editing: true } : w
    ));
  };

  const handleSave = (id) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id ? { ...w, saved: true, editing: false } : w
    ));
    showToast('Webhook URL saved successfully!', 'success');
  };

  const handleRefreshAll = () => {
    showToast('All webhook URLs refreshed!', 'info');
  };

  const filtered = webhooks.filter(w =>
    w.serviceName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const tableColumns = ['S.No', 'Service Name', 'First URL (Callback)', 'Second URL (Webhook)', 'Action'];

  const refreshAction = (
    <button
      onClick={handleRefreshAll}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'linear-gradient(135deg, #1756AA 0%, #0D1B3E 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s'
      }}
    >
      <FiRefreshCw style={{ fontSize: '0.85rem' }} /> Refresh All
    </button>
  );

  return (
    <div style={{ width: '100%', padding: '0' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          padding: '12px 22px',
          borderRadius: '10px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.85rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideInRight 0.3s ease'
        }}>
          <FaCheckCircle /> {toast.msg}
        </div>
      )}

      <AdminTable
        title="Webhook / Callback URLs"
        icon={<FiLink />}
        rightAction={refreshAction}
        columns={tableColumns}
        data={paginated}
        searchQuery={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(1); }}
        currentPage={page}
        totalPages={totalPages}
        totalEntries={filtered.length}
        onPageChange={(p) => setPage(p)}
        renderRow={(w, idx) => (
          <tr key={w.id}>
            <td style={{ fontWeight: 600, color: '#64748B' }}>{(page - 1) * rowsPerPage + idx + 1}</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, rgba(23,86,170,0.1), rgba(13,27,62,0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiGlobe style={{ color: '#1756AA', fontSize: '0.8rem' }} />
                </div>
                <span style={{ fontWeight: 700, color: '#0D1B3E', fontSize: '0.82rem' }}>{w.serviceName}</span>
              </div>
            </td>
            <td>
              <input
                type="text"
                placeholder="https://example.com/callback"
                value={w.firstUrl}
                onChange={(e) => handleUrlChange(w.id, 'firstUrl', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1.5px solid ${w.editing ? '#1756AA' : '#E2E8F0'}`,
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  color: '#1E293B',
                  fontWeight: 500,
                  background: w.firstUrl ? '#F8FAFC' : '#fff',
                  transition: 'border 0.2s'
                }}
              />
            </td>
            <td>
              <input
                type="text"
                placeholder="https://example.com/webhook"
                value={w.secondUrl}
                onChange={(e) => handleUrlChange(w.id, 'secondUrl', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1.5px solid ${w.editing ? '#1756AA' : '#E2E8F0'}`,
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  color: '#1E293B',
                  fontWeight: 500,
                  background: w.secondUrl ? '#F8FAFC' : '#fff',
                  transition: 'border 0.2s'
                }}
              />
            </td>
            <td style={{ textAlign: 'center' }}>
              <button
                onClick={() => handleSave(w.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 16px',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: w.saved
                    ? 'linear-gradient(135deg, #16A34A, #15803D)'
                    : 'linear-gradient(135deg, #22C55E, #16A34A)',
                  color: '#fff',
                  boxShadow: '0 4px 10px rgba(34, 197, 94, 0.25)'
                }}
              >
                {w.saved ? <><FaCheckCircle style={{ fontSize: '0.75rem' }} /> Saved</> : <><FiSave style={{ fontSize: '0.8rem' }} /> Update</>}
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default WebhookCallbacks;
