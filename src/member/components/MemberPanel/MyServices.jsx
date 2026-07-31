import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSmartphone, FiPhone, FiRadio, FiZap, FiDroplet, FiPackage, FiShield,
  FiPhoneCall, FiCreditCard, FiBook, FiTv, FiHome, FiWifi, FiFileText,
  FiHeart, FiActivity, FiDollarSign, FiMapPin, FiRepeat, FiGlobe, FiKey, FiBell,
  FiUserPlus, FiSearch, FiX, FiCreditCard as FiAccount, FiMonitor, FiLock, FiClock
} from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import { resolveMemberId, getLoginId } from '../../../utils/memberIdentity';
import styles from './MyServices.module.css';

const MyServicesModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Real service catalog + this member's own assignments, used to decide
  // which tiles above are unlocked (assigned) vs locked (need to be
  // requested from the admin first).
  const [serviceCatalog, setServiceCatalog] = useState([]); // [{id, name}]
  const [assignedServiceIds, setAssignedServiceIds] = useState(new Set());
  const [requestedServiceIds, setRequestedServiceIds] = useState(new Set());
  const [requestingId, setRequestingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const loadAccess = async () => {
      try {
        const memberId = await resolveMemberId();
        const loginId = getLoginId();

        const [servicesRes, assignedItems] = await Promise.all([
          API.service.getAll(),
          API.memberService.getMine({ memberId, loginId })
        ]);

        let services = [];
        if (Array.isArray(servicesRes?.data)) services = servicesRes.data;
        else if (Array.isArray(servicesRes?.data?.items)) services = servicesRes.data.items;
        else if (Array.isArray(servicesRes?.items)) services = servicesRes.items;
        setServiceCatalog(services);

        const rows = Array.isArray(assignedItems) ? assignedItems : [];
        console.log('[MyServicesModal] memberId:', memberId, 'loginId:', loginId, '| my rows:', rows.length, rows);

        const activeIds = new Set(
          rows
            .filter(it => (it.isActive ?? it.IsActive) === true || Number(it.assignTypeId ?? it.AssignTypeId) === 3)
            .map(it => (it.serviceId ?? it.ServiceId)?.toString())
        );
        const pendingIds = new Set(
          rows
            .filter(it => (it.isActive ?? it.IsActive) !== true && Number(it.assignTypeId ?? it.AssignTypeId) === 2)
            .map(it => (it.serviceId ?? it.ServiceId)?.toString())
        );
        setAssignedServiceIds(activeIds);
        setRequestedServiceIds(pendingIds);
      } catch (err) {
        console.error('MyServicesModal: failed to load service access:', err);
      }
    };
    loadAccess();
  }, []);

  // Matches a tile's display name against the real Service master list so we
  // know its serviceId (needed to check/request access). Not every tile here
  // has a real backend counterpart yet (some are placeholder '#' links) -
  // those just behave as before (always clickable).
  const matchService = (name) => {
    const n = name.toLowerCase().replace(/\s+/g, '');
    return serviceCatalog.find(s => (s.name || '').toLowerCase().replace(/\s+/g, '').includes(n) || n.includes((s.name || '').toLowerCase().replace(/\s+/g, '')));
  };

  const getTileStatus = (name) => {
    const svc = matchService(name);
    if (!svc) return { locked: false }; // no backend match -> treat as always available
    const id = svc.id?.toString();
    if (assignedServiceIds.has(id)) return { locked: false, serviceId: svc.id };
    if (requestedServiceIds.has(id)) return { locked: true, requested: true, serviceId: svc.id };
    return { locked: true, requested: false, serviceId: svc.id };
  };

  const handleRequestAccess = async (e, serviceId) => {
    e.stopPropagation();
    setRequestingId(serviceId);
    try {
      const memberId = await resolveMemberId();
      const res = await API.memberService.requestActivation(serviceId, memberId);
      if (res && (res.status === true || res.code === 'TXN')) {
        setRequestedServiceIds(prev => new Set(prev).add(serviceId.toString()));
        setToast('Request sent! Admin will review and activate it soon.');
      } else {
        setToast(res?.message || res?.mess || 'Could not send request. Try again.');
      }
    } catch (err) {
      console.error('Request activation error:', err);
      setToast(err.message || 'Could not send request. Try again.');
    } finally {
      setRequestingId(null);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate('/member/dashboard');
    }
  };

  const bbpsServices = [
    { name: 'RECHARGE', icon: <FiSmartphone color="#3498db" />, path: '/member/dashboard/service/mobile-recharge' },
    { name: 'MOBILE POSTPAID', icon: <FiPhone color="#9b59b6" />, path: '/member/dashboard/service/mobile-postpaid' },
    { name: 'DTH', icon: <FiRadio color="#1abc9c" />, path: '/member/dashboard/service/dth' },
    { name: 'ELECTRICITY', icon: <FiZap color="#f1c40f" />, path: '/member/dashboard/service/electricity' },
    { name: 'WATER', icon: <FiDroplet color="#3498db" />, path: '/member/dashboard/service/water' },
    { name: 'GAS', icon: <FiPackage color="#e67e22" />, path: '/member/dashboard/service/gas' },
    { name: 'LPG GAS', icon: <FiPackage color="#e91e63" />, path: '/member/dashboard/service/lpg' },
    { name: 'INSURANCE', icon: <FiShield color="#2ecc71" />, path: '/member/dashboard/service/insurance' },
    { name: 'LANDLINE POSTPAID', icon: <FiPhoneCall color="#3498db" />, path: '/member/dashboard/service/landline' },
    { name: 'FASTAG', icon: <FiCreditCard color="#1c3b72" />, path: '/member/dashboard/service/fastag' },
    { name: 'EDUCATION', icon: <FiBook color="#9b59b6" />, path: '#' },
    { name: 'CABLE TV', icon: <FiMonitor color="#e67e22" />, path: '/member/dashboard/service/cable-tv' },
    { name: 'MUNICIPAL TAX', icon: <FiHome color="#1abc9c" />, path: '/member/dashboard/service/municipal-tax' },
    { name: 'BROADBAND', icon: <FiWifi color="#3498db" />, path: '#' },
    { name: 'E-CHALLAN', icon: <FiFileText color="#e74c3c" />, path: '#' },
    { name: 'MOBILE PREPAID', icon: <FiSmartphone color="#2ecc71" />, path: '/member/dashboard/service/mobile-recharge' },
    { name: 'DONATION', icon: <FiHeart color="#e74c3c" />, path: '#' },
    { name: 'HEALTH INSURANCE', icon: <FiActivity color="#e91e63" />, path: '#' },
    { name: 'HOUSING SOCIETY', icon: <FiHome color="#1c3b72" />, path: '#' },
    { name: 'LIFE INSURANCE', icon: <FiShield color="#3498db" />, path: '#' },
    { name: 'LOAN REPAY', icon: <FiDollarSign color="#2ecc71" />, path: '#' },
    { name: 'MUNICIPAL SERVICE', icon: <FiMapPin color="#e67e22" />, path: '#' },
    { name: 'RECURRING DEPOSIT', icon: <FiRepeat color="#9b59b6" />, path: '#' },
    { name: 'CLUBS ASSOC.', icon: <FiGlobe color="#1c3b72" />, path: '#' },
    { name: 'RENTAL', icon: <FiKey color="#1abc9c" />, path: '#' },
    { name: 'SUBSCRIPTION', icon: <FiBell color="#f1c40f" />, path: '#' },
    { name: 'NPMC', icon: <FiCreditCard color="#3498db" />, path: '#' },
  ];

  const filteredServices = bbpsServices.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalCard} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div>
              <h2 className={styles.title}>All Services</h2>
              <p className={styles.subtitle}>Quick access to Bharat Connect</p>
            </div>
          </div>
          
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button 
            type="button"
            className={styles.closeBtn} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
          >
            <FiX />
          </button>
        </div>

        {toast && (
          <div style={{
            position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
            background: '#0D1B3E', color: '#fff', padding: '8px 16px', borderRadius: '8px',
            fontSize: '0.8rem', fontWeight: 600, zIndex: 20, boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
          }}>
            {toast}
          </div>
        )}

        <div className={styles.modalContent}>
          <div className={styles.bbpsGrid}>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                const status = getTileStatus(service.name);
                return (
                  <div
                    key={service.name}
                    className={styles.bbpsItem}
                    style={status.locked ? { position: 'relative', opacity: 0.85 } : undefined}
                    onClick={() => {
                      if (status.locked) return; // locked tiles only act via the Request button
                      navigate(service.path);
                      handleClose();
                    }}
                  >
                    <div className={styles.bbpsIconBox}>
                      {service.icon}
                    </div>
                    <span className={styles.bbpsName}>{service.name}</span>

                    {status.locked && (
                      status.requested ? (
                        <span style={{
                          marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.65rem', fontWeight: 700, color: '#B7791F'
                        }}>
                          <FiClock size={11} /> Requested
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={requestingId === status.serviceId}
                          onClick={(e) => handleRequestAccess(e, status.serviceId)}
                          style={{
                            marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                            background: '#1756AA', border: 'none', borderRadius: '6px',
                            padding: '3px 8px', cursor: requestingId === status.serviceId ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FiLock size={10} /> {requestingId === status.serviceId ? 'Sending...' : 'Request'}
                        </button>
                      )
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.noResults}>No matching services found.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyServicesModal;
