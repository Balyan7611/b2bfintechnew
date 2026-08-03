import React, { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiClock, FiRefreshCw } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import AdminTable from '../../../shared/components/common/AdminTable';
import { API } from '../../../api/endpoints';

// Admin page: shows every pending "Request Activation" a Member/API user has
// sent for a locked service (MemberService.AssignTypeId = 2), with buttons to
// Approve (-> AssignTypeId 3, IsActive true) or Reject with a reason
// (-> AssignTypeId 4, IsActive false). Backed live by:
//   GET  /MemberService/PendingRequests
//   POST /MemberService/Approve/{id}
//   POST /MemberService/Reject/{id}?reason=
const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rejectModal, setRejectModal] = useState({ show: false, request: null, reason: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = useCallback(async () => {
    try {
      const res = await API.service.getAll();
      let items = [];
      if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.data?.items)) items = res.data.items;
      else if (Array.isArray(res?.items)) items = res.items;
      setAllServices(items);
    } catch (err) {
      console.error('ServiceRequests: failed to load services list:', err);
    }
  }, []);

  // Normalises whatever shape the API returns into a plain array.
  const toArray = (res) => {
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  };

  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    let items = [];
    let primaryFailed = false;

    // 1. Preferred: dedicated PendingRequests endpoint.
    try {
      const res = await API.memberService.getPendingRequests({ pageNumber: 1, pageSize: 500 });
      items = toArray(res);
      console.log('ServiceRequests: /PendingRequests raw response =', res);
    } catch (err) {
      primaryFailed = true;
      console.error('ServiceRequests: /PendingRequests failed:', err);
    }

    // 2. Fallback: if that endpoint errored or came back empty, pull the whole
    //    MemberService table and filter AssignTypeId = 2 ourselves. This covers
    //    the case where the backend hasn't shipped /PendingRequests yet, or a
    //    request row was created through Swagger / the API panel directly.
    if (items.length === 0) {
      try {
        const res2 = await API.memberService.getAll({ PageNumber: 1, PageSize: 2000 });
        const all = toArray(res2);
        console.log('ServiceRequests: fallback GetMemberService rows =', all.length, all);
        items = all.filter(it =>
          Number(it.assignTypeId ?? it.AssignTypeId) === 2 &&
          (it.isActive ?? it.IsActive) !== true
        );
        if (items.length === 0 && primaryFailed) {
          setLoadError('Pending requests could not be loaded from the server. Check the browser console / Network tab for the /MemberService/PendingRequests response.');
        }
      } catch (err2) {
        console.error('ServiceRequests: fallback GetMemberService failed:', err2);
        setLoadError(err2?.message || 'Could not load service requests from the server.');
      }
    }

    setRequests(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
    fetchPendingRequests();
  }, [fetchServices, fetchPendingRequests]);

  const getServiceName = (req) => {
    const serviceId = req.serviceId ?? req.ServiceId;
    if (req.serviceName || req.ServiceName) return req.serviceName || req.ServiceName;
    const svc = allServices.find(s => s.id?.toString() === (serviceId ?? '').toString());
    return svc?.name || `Service #${serviceId}`;
  };

  const getMemberLabel = (req) => {
    return req.memberName || req.MemberName || req.loginId || req.LoginId
      || req.memberId || req.MemberId || `Member #${req.memberId ?? req.MemberId ?? ''}`;
  };

  const getRequestDate = (req) => {
    const d = req.startDate || req.createdDate || req.requestedDate || req.CreatedDate;
    if (!d) return '—';
    try { return new Date(d).toLocaleString('en-IN'); } catch { return d; }
  };

  const handleApprove = async (req) => {
    const id = req.id;
    setBusyId(id);
    try {
      const res = await API.memberService.approve(id);
      if (res && (res.status === true || res.code === 'TXN')) {
        showToast('Service request approved & activated!', 'success');
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        showToast(res?.message || res?.mess || 'Approve failed.', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast(err.message || 'Error approving request.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const openRejectModal = (req) => {
    setRejectModal({ show: true, request: req, reason: '' });
  };

  const handleReject = async () => {
    const req = rejectModal.request;
    if (!req) return;
    const id = req.id;
    setBusyId(id);
    try {
      const res = await API.memberService.reject(id, rejectModal.reason || 'Not applicable');
      if (res && (res.status === true || res.code === 'TXN')) {
        showToast('Service request rejected.', 'success');
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        showToast(res?.message || res?.mess || 'Reject failed.', 'error');
      }
    } catch (err) {
      console.error('Reject error:', err);
      showToast(err.message || 'Error rejecting request.', 'error');
    } finally {
      setBusyId(null);
      setRejectModal({ show: false, request: null, reason: '' });
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return getServiceName(r).toLowerCase().includes(q) || getMemberLabel(r).toString().toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const tableColumns = ['S.No', 'Member', 'Requested Service', 'Requested On', 'Status', 'Action'];

  const refreshAction = (
    <button
      onClick={fetchPendingRequests}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'linear-gradient(135deg, #1756AA 0%, #0D1B3E 100%)',
        color: '#fff', border: 'none', borderRadius: '8px',
        padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
      }}
    >
      <FiRefreshCw style={{ fontSize: '0.85rem' }} /> {isLoading ? 'Loading...' : 'Refresh'}
    </button>
  );

  return (
    <div style={{ width: '100%', padding: '24px 32px', boxSizing: 'border-box' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          padding: '12px 22px', borderRadius: '10px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <FaCheckCircle /> {toast.msg}
        </div>
      )}

      {loadError && (
        <div style={{
          margin: '0 0 14px 0', padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#B91C1C', fontSize: '0.82rem', fontWeight: 600
        }}>
          {loadError}
        </div>
      )}

      <AdminTable
        title="Service Activation Requests"
        subtitle="Pending requests from Members / API Users to activate a locked service"
        icon={<FiClock />}
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
        renderRow={(req, idx) => (
          <tr key={req.id}>
            <td style={{ fontWeight: 600, color: '#64748B' }}>{(page - 1) * rowsPerPage + idx + 1}</td>
            <td style={{ fontWeight: 700, color: '#0D1B3E' }}>{getMemberLabel(req)}</td>
            <td style={{ fontWeight: 700, color: '#1756AA' }}>{getServiceName(req)}</td>
            <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{getRequestDate(req)}</td>
            <td>
              <span style={{
                background: 'rgba(234,162,31,0.12)', color: '#B7791F',
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700
              }}>
                Pending
              </span>
            </td>
            <td style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  disabled={busyId === req.id}
                  onClick={() => handleApprove(req)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', border: 'none', borderRadius: '7px',
                    fontSize: '0.78rem', fontWeight: 700, cursor: busyId === req.id ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff'
                  }}
                >
                  <FiCheck /> Approve
                </button>
                <button
                  disabled={busyId === req.id}
                  onClick={() => openRejectModal(req)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', border: 'none', borderRadius: '7px',
                    fontSize: '0.78rem', fontWeight: 700, cursor: busyId === req.id ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff'
                  }}
                >
                  <FiX /> Reject
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Reject Reason Modal */}
      {rejectModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: '14px', width: '420px', maxWidth: '92%',
            padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)'
          }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0D1B3E' }}>
              Reject Service Request
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748B' }}>
              {getMemberLabel(rejectModal.request || {})} — {getServiceName(rejectModal.request || {})}
            </p>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4E6080', display: 'block', marginBottom: '6px' }}>
              Reason
            </label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Not applicable for this slab"
              rows={3}
              style={{
                width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1',
                padding: '10px 12px', fontSize: '0.85rem', outline: 'none', resize: 'none',
                boxSizing: 'border-box', marginBottom: '18px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRejectModal({ show: false, request: null, reason: '' })}
                style={{ padding: '9px 18px', background: '#F1F5F9', border: 'none', borderRadius: '8px', color: '#4E6080', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busyId === rejectModal.request?.id}
                style={{ padding: '9px 20px', background: '#DC2626', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
