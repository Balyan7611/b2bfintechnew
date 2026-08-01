import React, { useState, useEffect, useCallback } from 'react';
import {
  FiRefreshCw, FiSave, FiGlobe, FiLink, FiCopy, FiTrash2, FiShield, FiX
} from 'react-icons/fi';
import {
  FaCheckCircle
} from 'react-icons/fa';
import AdminTable from '../../shared/components/common/AdminTable';
import { API } from '../../api/endpoints';
import { getSession } from '../../utils/authUtils';

const WebhookCallbacks = () => {
  // One row per service assigned to this API user. If a MemberWebhook record
  // already exists for that service (from GET /MemberWebhook/MyWebhooks),
  // the row is pre-filled with the saved URLs + secret key; otherwise it's
  // blank and "Update" acts as a first-time Configure.
  const [webhooks, setWebhooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = getSession();
      const memberId = session?.msrno || session?.userId || '';
      if (!memberId) {
        setWebhooks([]);
        return;
      }

      const [assignedRes, allServicesRes, myWebhooksRes] = await Promise.all([
        API.memberService.getAll({ MemberID: memberId }),
        API.service.getAll(),
        API.memberWebhook.myWebhooks()
      ]);

      let assignedItems = [];
      if (Array.isArray(assignedRes?.data?.items)) assignedItems = assignedRes.data.items;
      else if (Array.isArray(assignedRes?.data)) assignedItems = assignedRes.data;
      else if (Array.isArray(assignedRes?.items)) assignedItems = assignedRes.items;

      let allServices = [];
      if (Array.isArray(allServicesRes?.data)) allServices = allServicesRes.data;
      else if (Array.isArray(allServicesRes?.data?.items)) allServices = allServicesRes.data.items;
      else if (Array.isArray(allServicesRes?.items)) allServices = allServicesRes.items;

      let existingWebhooks = [];
      if (Array.isArray(myWebhooksRes?.data)) existingWebhooks = myWebhooksRes.data;
      else if (Array.isArray(myWebhooksRes?.data?.items)) existingWebhooks = myWebhooksRes.data.items;
      else if (Array.isArray(myWebhooksRes?.items)) existingWebhooks = myWebhooksRes.items;

      const rows = assignedItems
        .filter(it => it.isActive !== false)
        .map(it => {
          const serviceId = it.serviceId ?? it.ServiceId;
          const svc = allServices.find(s => s.id?.toString() === (serviceId ?? '').toString());
          const existing = existingWebhooks.find(w => (w.serviceId ?? w.ServiceId)?.toString() === (serviceId ?? '').toString());

          return {
            serviceId,
            serviceName: svc?.name || existing?.serviceName || `Service #${serviceId}`,
            firstUrl: existing?.webhookUrl1 || '',
            secondUrl: existing?.webhookUrl2 || '',
            secretKey: existing?.secretKey || '',
            configured: !!existing,
            editing: false
          };
        });

      setWebhooks(rows);
    } catch (err) {
      console.error('WebhookCallbacks: Failed to load webhook data:', err);
      setWebhooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUrlChange = (serviceId, field, value) => {
    setWebhooks(prev => prev.map(w =>
      w.serviceId === serviceId ? { ...w, [field]: value, editing: true } : w
    ));
  };

  // OTP-protected save flow: { show, row, token, otp, sending, verifying }
  const [otpModal, setOtpModal] = useState({ show: false, row: null, token: '', otp: '', sending: false, verifying: false });

  // Step 1: request an OTP for this webhook change and open the verification modal.
  const handleSave = async (row) => {
    setOtpModal({ show: true, row, token: '', otp: '', sending: true, verifying: false });
    try {
      const res = await API.memberWebhook.sendOtp();
      const token = res?.data?.token || res?.data?.verificationToken || res?.token || res?.data || '';

      if ((res?.status === true || res?.code === 'TXN') && token) {
        setOtpModal(prev => ({ ...prev, token, sending: false }));
        showToast('OTP sent to your registered mobile/email.', 'success');
      } else {
        showToast(res?.mess || 'Could not send OTP. Try again.', 'error');
        setOtpModal({ show: false, row: null, token: '', otp: '', sending: false, verifying: false });
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      showToast(err.message || 'Could not send OTP. Try again.', 'error');
      setOtpModal({ show: false, row: null, token: '', otp: '', sending: false, verifying: false });
    }
  };

  // Step 2: verify the OTP the user typed in and actually save the webhook.
  const handleVerifyAndSave = async () => {
    const { row, token, otp } = otpModal;
    if (!row || !otp) return;

    setOtpModal(prev => ({ ...prev, verifying: true }));
    setSavingId(row.serviceId);
    try {
      const res = await API.memberWebhook.configureWithOtp({
        otp,
        token,
        serviceId: row.serviceId,
        webhookUrl1: row.firstUrl,
        webhookUrl2: row.secondUrl
      });

      if (res && (res.status === true || res.code === 'TXN')) {
        showToast('Webhook verified & saved successfully!', 'success');
        setOtpModal({ show: false, row: null, token: '', otp: '', sending: false, verifying: false });
        await loadData();
      } else {
        showToast(res?.mess || 'Invalid OTP. Try again.', 'error');
        setOtpModal(prev => ({ ...prev, verifying: false }));
      }
    } catch (err) {
      console.error('Configure with OTP error:', err);
      showToast(err.message || 'Invalid OTP. Try again.', 'error');
      setOtpModal(prev => ({ ...prev, verifying: false }));
    } finally {
      setSavingId(null);
    }
  };

  const closeOtpModal = () => setOtpModal({ show: false, row: null, token: '', otp: '', sending: false, verifying: false });

  const handleDelete = async (row) => {
    setSavingId(row.serviceId);
    try {
      await API.memberWebhook.delete(row.serviceId);
      showToast('Webhook removed.', 'success');
      await loadData();
    } catch (err) {
      console.error('Delete webhook error:', err);
      showToast(err.message || 'Could not remove webhook.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleCopySecret = (secretKey) => {
    if (!secretKey) return;
    navigator.clipboard?.writeText(secretKey);
    showToast('Secret key copied!', 'success');
  };

  const filtered = webhooks.filter(w =>
    w.serviceName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const tableColumns = ['S.No', 'Service Name', 'First URL (Callback)', 'Second URL (Webhook)', 'Action'];

  const refreshAction = (
    <button
      onClick={loadData}
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
      <FiRefreshCw style={{ fontSize: '0.85rem' }} /> {isLoading ? 'Loading...' : 'Refresh All'}
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
          background: toast.type === 'success' ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
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
          <tr key={w.serviceId}>
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
                onChange={(e) => handleUrlChange(w.serviceId, 'firstUrl', e.target.value)}
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
                placeholder="https://example.com/webhook (optional)"
                value={w.secondUrl}
                onChange={(e) => handleUrlChange(w.serviceId, 'secondUrl', e.target.value)}
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
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <button
                  disabled={savingId === w.serviceId || !w.firstUrl}
                  onClick={() => handleSave(w)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: (savingId === w.serviceId || !w.firstUrl) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    background: w.configured
                      ? 'linear-gradient(135deg, #16A34A, #15803D)'
                      : 'linear-gradient(135deg, #22C55E, #16A34A)',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.25)',
                    opacity: !w.firstUrl ? 0.6 : 1
                  }}
                >
                  {savingId === w.serviceId
                    ? 'Saving...'
                    : w.configured
                      ? <><FaCheckCircle style={{ fontSize: '0.75rem' }} /> Update</>
                      : <><FiSave style={{ fontSize: '0.8rem' }} /> Configure</>}
                </button>
                {w.configured && (
                  <button
                    disabled={savingId === w.serviceId}
                    onClick={() => handleDelete(w)}
                    title="Remove webhook"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '6px 9px', border: 'none', borderRadius: '7px',
                      background: '#FEF2F2', color: '#DC2626', cursor: 'pointer'
                    }}
                  >
                    <FiTrash2 size={13} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      {/* OTP Verification Modal - required before any webhook Configure/Update goes live */}
      {otpModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '380px', maxWidth: '92%',
            padding: '26px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', position: 'relative'
          }}>
            <button
              onClick={closeOtpModal}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <FiX size={18} />
            </button>

            <div style={{
              width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(23,86,170,0.1)',
              color: '#1756AA', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', marginBottom: '14px'
            }}>
              <FiShield />
            </div>

            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E' }}>
              Verify OTP to Save Webhook
            </h4>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
              {otpModal.sending
                ? 'Sending a verification code to your registered mobile/email...'
                : `Enter the OTP sent to your registered mobile/email to confirm changes for "${otpModal.row?.serviceName || ''}".`}
            </p>

            {!otpModal.sending && (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpModal.otp}
                  onChange={(e) => setOtpModal(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #CBD5E1', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center',
                    fontWeight: 700, color: '#0D1B3E', outline: 'none', marginBottom: '18px'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={closeOtpModal}
                    style={{ padding: '9px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyAndSave}
                    disabled={otpModal.otp.length < 4 || otpModal.verifying}
                    style={{
                      padding: '9px 20px', background: (otpModal.otp.length < 4 || otpModal.verifying) ? '#94A3B8' : '#1756AA',
                      border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700,
                      cursor: (otpModal.otp.length < 4 || otpModal.verifying) ? 'not-allowed' : 'pointer', fontSize: '0.82rem'
                    }}
                  >
                    {otpModal.verifying ? 'Verifying...' : 'Verify & Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookCallbacks;
