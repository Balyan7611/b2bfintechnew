import React, { useState, useEffect } from 'react';
import { API } from '../../../api/endpoints';
import {
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight,
  FiX, FiCheck, FiMail, FiPhone, FiUser, FiArrowLeft, FiImage,
  FiDollarSign, FiGlobe, FiBriefcase, FiDatabase, FiLoader, FiAlertTriangle
} from 'react-icons/fi';
import { FaCopy } from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';
import { getLogoUrl, getSignatureUrl, getFaviconUrl } from '../../../config/siteConfig';


/* ─────────────────────────────────────────────
   Initial blank form
───────────────────────────────────────────── */
const INIT_FORM = {
  id: null,
  member: '1',
  companyName: '', ownerName: '', address: '',
  email: '', alternateEmail: '',
  mobile: '', alternateMobile: '',
  websiteUrl: '', androidUrl: '',
  facebook: '', whatsapp: '', instagram: '', twitter: '', youtube: '', copyright: '',
  bankName: '', acName: '', acType: 'Current', acNumber: '', ifsc: '', micrcode: '',
  profileAmount: '0',
  headerColor: '#1756AA', bodyColor: '#F8FAFC', leftColor: '#0F172A',
  // existing image paths (from API)
  logo: '', signature: '', favicon: '',
  // new file objects
  logoFile: null, signatureFile: null, faviconFile: null,
};

const ManageCompany = () => {
  const [viewState, setViewState]     = useState('table');
  const [localCompanies, setLocalCompanies] = useState([]);
  const [errorMsg, setErrorMsg]       = useState('');
  const [isLoading, setIsLoading]     = useState(true);
  const [isSaving, setIsSaving]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData]       = useState(INIT_FORM);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [successMsg, setSuccessMsg]   = useState('');

  // Pagination & Action Dropdown States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeActionRow, setActiveActionRow] = useState({ id: null, x: 0, y: 0, comp: null });

  // Close action dropdown on outside click and scroll
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, comp: null } : prev);
      }
    };
    const handleScroll = () => {
      setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, comp: null } : prev);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  /* ── Fetch all companies ── */
  const fetchCompanies = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await API.company.getAll();
      if (res && res.status === true && Array.isArray(res.data)) {
        setLocalCompanies(res.data.map(item => ({
          ...item,                                          // keep ALL raw fields
          name:    item.name    || item.companyName || '',
          owner:   item.ownerName || '',
          email:   item.email   || '',
          phone:   item.mobile  || '',
          status:  item.isActive ? 'ACTIVE' : 'INACTIVE',
          addDate: item.createdDate
            ? new Date(item.createdDate).toLocaleDateString('en-GB')
            : 'N/A',
        })));
      } else {
        setErrorMsg(res?.mess || 'Failed to load companies.');
      }
    } catch (err) {
      setErrorMsg('Could not reach the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  /* ── Input handlers ── */
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      // Create local object URL for instant preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [`${name}File`]:    file,
        [`${name}Preview`]: previewUrl, // local blob URL for new file preview
        [name]:             file.name,
      }));
    }
  };

  /* ── Open Edit form ── */
  const handleEdit = comp => {
    setFormData({
      id:             comp.id,
      member:         comp.memberId ? String(comp.memberId) : '1',
      companyName:    comp.name    || comp.companyName || '',
      ownerName:      comp.ownerName || '',
      address:        comp.address  || '',
      email:          comp.email    || '',
      alternateEmail: comp.alternateEmail || '',
      mobile:         comp.mobile   || '',
      alternateMobile:comp.alternateMobile || '',
      websiteUrl:     comp.websiteUrl  || '',
      androidUrl:     comp.androidUrl  || '',
      facebook:       comp.faceBook    || '',
      whatsapp:       comp.whastApp    || '',
      instagram:      comp.instagram   || '',
      twitter:        comp.twiter      || '',
      youtube:        comp.youtube     || '',
      copyright:      comp.copyright   || '',
      bankName:       comp.bankName    || '',
      acName:         comp.acname      || '',
      acType:         comp.actype      || 'Current',
      acNumber:       comp.acnumber    || '',
      ifsc:           comp.ifsc        || '',
      micrcode:       comp.micrcode    || '',
      profileAmount:  comp.profileAmount != null ? String(comp.profileAmount) : '0',
      headerColor:    comp.headerColor  || '#1756AA',
      bodyColor:      comp.bodyColor    || '#F8FAFC',
      leftColor:      comp.leftColor    || '#0F172A',
      // Store raw filename from API (e.g. "logo.png" or "/logo.png")
      logo:           comp.logo        || '',
      signature:      comp.signature   || '',
      favicon:        comp.feviconicon  || '',
      logoFile:       null,
      signatureFile:  null,
      faviconFile:    null,
      logoPreview:    null,
      signaturePreview: null,
      faviconPreview: null,
    });
    setViewState('add');
  };

  /* ── Build FormData payload — matches curl exactly ── */
  const buildFormData = () => {
    const fd = new FormData();

    // IDs
    fd.append('Id',       formData.id ? String(parseInt(formData.id)) : '0');
    fd.append('MemberId', String(parseInt(formData.member) || 1));

    // Basic info
    fd.append('Name',            formData.companyName    || '');
    fd.append('OwnerName',       formData.ownerName      || '');
    fd.append('Email',           formData.email          || '');
    fd.append('AlternateEmail',  formData.alternateEmail || '');
    fd.append('Mobile',          formData.mobile         || '');
    fd.append('AlternateMobile', formData.alternateMobile|| '');
    fd.append('Address',         formData.address        || '');
    fd.append('Copyright',       formData.copyright      || '');

    // Web & Social
    fd.append('WebsiteUrl', formData.websiteUrl || '');
    fd.append('AndroidUrl', formData.androidUrl || '');
    fd.append('FaceBook',   formData.facebook   || '');
    fd.append('WhastApp',   formData.whatsapp   || '');
    fd.append('Instagram',  formData.instagram  || '');
    fd.append('Twiter',     formData.twitter    || '');
    fd.append('Youtube',    formData.youtube    || '');

    // Banking
    fd.append('BankName', formData.bankName  || '');
    fd.append('Acname',   formData.acName    || '');
    fd.append('Actype',   formData.acType    || 'Current');
    fd.append('Acnumber', formData.acNumber  || '');
    fd.append('Ifsc',     formData.ifsc      || '');
    fd.append('Micrcode', formData.micrcode  || '');

    // Finance
    fd.append('ProfileAmount', String(parseFloat(formData.profileAmount) || 0));

    // Theme colors
    fd.append('HeaderColor', formData.headerColor || '#333333');
    fd.append('LeftColor',   formData.leftColor   || '#000000');
    fd.append('BodyColor',   formData.bodyColor   || '#ffffff');

    // Files — only append if user selected a new file
    if (formData.logoFile)      fd.append('FileLogo',    formData.logoFile);
    if (formData.signatureFile) fd.append('FileSign',    formData.signatureFile);
    if (formData.faviconFile)   fd.append('FileFevicon', formData.faviconFile);

    // Device info — exact keys from curl
    fd.append('ip',                    '127.0.0.1');
    fd.append('deviceInfo.deviceId',   'WEB001');
    fd.append('deviceInfo.deviceName', navigator.userAgent.substring(0, 50));
    fd.append('deviceInfo.platform',   'Web');

    // Location — exact keys from curl
    fd.append('location.lat',     '0.0');
    fd.append('location.lng',     '0.0');
    fd.append('location.city',    'City');
    fd.append('location.country', 'India');

    return fd;
  };


  /* ── Save (Add / Update) ── */
  const handleSave = async e => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      const fd  = buildFormData();
      const res = formData.id
        ? await API.company.update(fd)
        : await API.company.create(fd);

      if (res && res.status === true) {
        setSuccessMsg(formData.id ? 'Company updated successfully!' : 'Company added successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchCompanies();
        setViewState('table');
        setFormData(INIT_FORM);
      } else {
        setErrorMsg(res?.mess || 'Save failed. Please check the server response.');
      }
    } catch (err) {
      // Detect 404 — endpoint missing on backend
      const status = err?.response?.status || err?.status;
      if (status === 404) {
        setErrorMsg(
          formData.id
            ? '⚠️ Update API (PUT /api/Company) is not available on the server yet. Please ask your backend developer to add this endpoint.'
            : '⚠️ Create API (POST /api/Company) is not available on the server yet. Please ask your backend developer to add this endpoint.'
        );
      } else if (status === 500) {
        setErrorMsg('⚠️ Server Internal Error (500). The backend threw an exception. Check server logs.');
      } else {
        setErrorMsg(`⚠️ Request failed (${status || 'Network Error'}). Please try again or contact support.`);
      }
      console.error('Company save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null, name: '' });
    setIsLoading(true);
    try {
      const res = await API.company.delete(id);
      if (res && res.status === true) {
        setSuccessMsg('Company deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchCompanies();
      } else {
        // optimistic remove
        setLocalCompanies(prev => prev.filter(c => c.id !== id));
        setSuccessMsg('Company removed.');
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (err) {
      setLocalCompanies(prev => prev.filter(c => c.id !== id));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Toggle status ── */
  const handleToggleStatus = async id => {
    try {
      await API.company.toggleStatus(id);
      setLocalCompanies(prev =>
        prev.map(c => c.id === id
          ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', isActive: c.status !== 'ACTIVE' }
          : c
        )
      );
    } catch (err) { console.error(err); }
  };

  /* ── Filtered list ── */
  const filtered = localCompanies.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentEntries = filtered.slice(startIndex, startIndex + rowsPerPage);

  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage]);

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className={styles.container} style={{ padding: '15px 12px', maxWidth: '100%' }}>

      {/* ── Global success toast ── */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#10B981', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* ══════════════════════════════════
          TABLE VIEW
      ══════════════════════════════════ */}
      {viewState === 'table' && (
        <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: '16px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Manage Companies</h3>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg,#1756AA,#0D3F85)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(23,86,170,0.25)'
              }}
              onClick={() => { setFormData(INIT_FORM); setErrorMsg(''); setViewState('add'); }}
            >
              <FiPlus /> Add New Company
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ margin: '12px 20px 0', padding: '10px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FiAlertTriangle /> {errorMsg}
            </div>
          )}

          {/* Toolbar */}
          <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '10px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className={styles.pillRow} style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
              <select className={styles.selectEntries} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 8px', outline: 'none', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
            </div>

            <ExportButtons
              headers={['S.NO', 'NAME', 'OWNER', 'EMAIL', 'PHONE', 'STATUS', 'ADD DATE']}
              rows={filtered.map((c, i) => [i + 1, c.name, c.owner, c.email, c.phone, c.status, c.addDate])}
              fileNamePrefix="company_report"
              sheetName="Companies"
            />

            <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <FiSearch color="#A0AEC0" />
              <input 
                 type="text" 
                 placeholder="Search by name, email..." 
                 style={{ fontSize: '0.85rem', border: 'none', outline: 'none', background: 'transparent', width: '100%' }} 
                 value={searchQuery}
                 onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table} style={{ width: '100%', minWidth: '860px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg,#0D1B5E,#1a2f8a)' }}>
                  <th style={{ color: '#fff', width: '55px' }}>S.NO</th>
                  <th style={{ color: '#fff', width: '110px', textAlign: 'center' }}>ACTION</th>
                  <th style={{ color: '#fff' }}>COMPANY DETAILS</th>
                  <th style={{ color: '#fff', width: '130px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ color: '#fff', width: '120px', textAlign: 'left' }}>ADDED ON</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontWeight: 600 }}>Loading...</td></tr>
                ) : currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FiDatabase style={{ fontSize: '1.8rem', opacity: 0.3 }} />
                        <span style={{ fontWeight: 600 }}>No companies found</span>
                      </div>
                    </td>
                  </tr>
                ) : currentEntries.map((comp, idx) => (
                  <tr key={comp.id} className={styles.hoverRow}>
                    <td style={{ fontWeight: 700, color: '#94A3B8' }}>{startIndex + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-dropdown-wrapper" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <button
                          className="action-dropdown-wrapper"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeActionRow.id === comp.id) {
                              setActiveActionRow(prev => prev.id ? { id: null, x: 0, y: 0, comp: null } : prev);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownHeight = 120;
                              const isUpward = (window.innerHeight - rect.bottom) < dropdownHeight;
                              
                              setActiveActionRow({ 
                                id: comp.id, 
                                x: rect.right + 12, 
                                y: isUpward ? rect.bottom : rect.top, 
                                isUpward,
                                comp 
                              });
                            }
                          }}
                          style={{ padding: '0 12px', height: '32px', borderRadius: '8px', background: activeActionRow.id === comp.id ? '#D1FAE5' : '#10B981', color: activeActionRow.id === comp.id ? '#059669' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s', boxShadow: activeActionRow.id === comp.id ? 'none' : '0 2px 6px rgba(16,185,129,0.3)' }}
                          title="Actions"
                        >
                          Action <span style={{ fontSize: '1.1rem', marginTop: '-2px', fontWeight: 900 }}>⋮</span>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1D4ED8' }}>{comp.name}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.78rem', color: '#64748B' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><FiUser size={11} /> {comp.owner || 'N/A'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><FiMail size={11} /> {comp.email || 'N/A'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><FiPhone size={11} /> {comp.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span
                        onClick={() => handleToggleStatus(comp.id)}
                        style={{
                          background: comp.status === 'ACTIVE' ? '#ECFDF5' : '#FEF2F2',
                          color: comp.status === 'ACTIVE' ? '#059669' : '#EF4444',
                          padding: '5px 14px', borderRadius: '20px',
                          fontSize: '0.72rem', fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          cursor: 'pointer', border: `1px solid ${comp.status === 'ACTIVE' ? '#6EE7B7' : '#FECACA'}`
                        }}
                      >
                        ● {comp.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontWeight: 600, fontSize: '0.82rem' }}>{comp.addDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} entries
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className={styles.pageBtn} 
                style={{ width: '36px', height: '36px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              
              {/* Show only max 5 page numbers for better UI */}
              {[...Array(totalPages)].map((_, i) => {
                 if (i + 1 < currentPage - 2 || i + 1 > currentPage + 2) return null;
                 return (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? styles.pageActive : styles.pageBtn}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                      background: currentPage === i + 1 ? '#1756AA' : '#fff', 
                      color: currentPage === i + 1 ? '#fff' : '#475569',
                      border: currentPage === i + 1 ? 'none' : '1px solid #E2E8F0', cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                 )
              })}
              
              <button 
                className={styles.pageBtn} 
                style={{ width: '36px', height: '36px', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── ACTION DROPDOWN PORTAL (fixed position, never clipped) ── */}
      {viewState === 'table' && activeActionRow.id && (
        <>
          <style>{`
            @keyframes dropdownFadeInSideComp {
              from { opacity: 0; transform: translateX(-10px) ${activeActionRow.isUpward ? 'translateY(10px)' : 'translateY(-10px)'}; }
              to   { opacity: 1; transform: translateX(0) translateY(0); }
            }
          `}</style>
          <div
            className="action-dropdown-wrapper"
            style={{ 
              position: 'fixed', 
              top: activeActionRow.isUpward ? 'auto' : activeActionRow.y, 
              bottom: activeActionRow.isUpward ? (window.innerHeight - activeActionRow.y) : 'auto',
              left: activeActionRow.x, 
              background: '#fff', 
              borderRadius: '12px', 
              boxShadow: '0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)', 
              border: '1px solid #E2E8F0', 
              zIndex: 9999, 
              minWidth: '168px', 
              overflow: 'hidden', 
              animation: 'dropdownFadeInSideComp 0.15s ease-out' 
            }}
          >
            <button
              onClick={() => { handleEdit(activeActionRow.comp); setActiveActionRow({ id: null, x: 0, y: 0, comp: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiEdit size={12} /></span>
              Edit Company
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { handleToggleStatus(activeActionRow.comp.id); setActiveActionRow({ id: null, x: 0, y: 0, comp: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#334155', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <label className={styles.switch} style={{ transform: 'scale(0.8)', margin: 0 }}>
                  <input type="checkbox" checked={activeActionRow.comp.status === 'ACTIVE'} readOnly />
                  <span className={styles.slider}></span>
                </label>
              </div>
              Toggle Active
            </button>
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />
            <button
              onClick={() => { setDeleteModal({ isOpen: true, id: activeActionRow.comp.id, name: activeActionRow.comp.name }); setActiveActionRow({ id: null, x: 0, y: 0, comp: null }); }}
              style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#E53E3E', fontSize: '0.83rem', fontWeight: 600, textAlign: 'left' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FFF5F5', color: '#E53E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiTrash2 size={12} /></span>
              Delete Company
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════
          ADD / EDIT FORM VIEW
      ══════════════════════════════════ */}
      {viewState === 'add' && (
        <div className={styles.cardFullMobile} style={{ margin: '0 0 20px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderRadius: '16px' }}>

          {/* Form Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <button
              onClick={() => { setViewState('table'); setFormData(INIT_FORM); setErrorMsg(''); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer' }}
            ><FiArrowLeft size={14} /></button>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              {formData.id ? 'Edit Company' : 'Add New Company'}
            </h3>
          </div>

          {/* Error inside form */}
          {errorMsg && (
            <div style={{ margin: '12px 20px 0', padding: '10px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

              {/* ── Section 1: Basic Info ── */}
              <Section title="Basic Information">
                <Grid>
                  <Field label="Company Name *">
                    <input name="companyName" value={formData.companyName} onChange={handleInputChange} required placeholder="DPAY INDIA" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Owner Name *">
                    <input name="ownerName" value={formData.ownerName} onChange={handleInputChange} required placeholder="Owner Full Name" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Member ID">
                    <input name="member" value={formData.member} onChange={handleInputChange} type="number" placeholder="1" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Full Address">
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Address" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Copyright Text">
                    <input name="copyright" value={formData.copyright} onChange={handleInputChange} placeholder="© 2026 All Rights Reserved" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Profile Amount">
                    <input name="profileAmount" value={formData.profileAmount} onChange={handleInputChange} type="number" placeholder="0" className={styles.inputControl} style={inputStyle} />
                  </Field>
                </Grid>
              </Section>

              {/* ── Section 2: Contact ── */}
              <Section title="Contact Details">
                <Grid>
                  <Field label="Email *">
                    <input name="email" value={formData.email} onChange={handleInputChange} required type="email" placeholder="info@company.com" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Alternate Email">
                    <input name="alternateEmail" value={formData.alternateEmail} onChange={handleInputChange} type="email" placeholder="alt@company.com" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Mobile *">
                    <input name="mobile" value={formData.mobile} onChange={handleInputChange} required placeholder="10-digit mobile" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Alternate Mobile">
                    <input name="alternateMobile" value={formData.alternateMobile} onChange={handleInputChange} placeholder="Alternate no." className={styles.inputControl} style={inputStyle} />
                  </Field>
                </Grid>
              </Section>

              {/* ── Section 3: Web & Social ── */}
              <Section title="Online Presence & Social Media">
                <Grid>
                  <Field label="Website URL">
                    <input name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} type="url" placeholder="https://example.com" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Android App URL">
                    <input name="androidUrl" value={formData.androidUrl} onChange={handleInputChange} type="url" placeholder="Play Store link" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Facebook">
                    <input name="facebook" value={formData.facebook} onChange={handleInputChange} placeholder="fb.com/page" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="WhatsApp">
                    <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="9876543210" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Instagram">
                    <input name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="instagram.com/page" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Twitter / X">
                    <input name="twitter" value={formData.twitter} onChange={handleInputChange} placeholder="twitter.com/handle" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="YouTube">
                    <input name="youtube" value={formData.youtube} onChange={handleInputChange} placeholder="youtube.com/channel" className={styles.inputControl} style={inputStyle} />
                  </Field>
                </Grid>
              </Section>

              {/* ── Section 4: Banking ── */}
              <Section title="Banking Details">
                <Grid>
                  <Field label="Bank Name">
                    <input name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="HDFC Bank" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Account Name">
                    <input name="acName" value={formData.acName} onChange={handleInputChange} placeholder="Account Holder Name" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="Account Type">
                    <select name="acType" value={formData.acType} onChange={handleInputChange} className={styles.inputControl} style={inputStyle}>
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                    </select>
                  </Field>
                  <Field label="Account Number">
                    <input name="acNumber" value={formData.acNumber} onChange={handleInputChange} placeholder="Account No." className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="IFSC Code">
                    <input name="ifsc" value={formData.ifsc} onChange={handleInputChange} placeholder="HDFC0001234" className={styles.inputControl} style={inputStyle} />
                  </Field>
                  <Field label="MICR Code">
                    <input name="micrcode" value={formData.micrcode} onChange={handleInputChange} placeholder="123456789" className={styles.inputControl} style={inputStyle} />
                  </Field>
                </Grid>
              </Section>

              {/* ── Section 5: Media & Branding ── */}
              <Section title="Media & Branding">
                <Grid>
                  {/* ── Logo ── */}
                  <Field label="Logo">
                    <input
                      name="logo"
                      onChange={handleFileChange}
                      type="file"
                      accept="image/*"
                      className={styles.inputControl}
                      style={{ ...inputStyle, padding: '9px', border: '1px dashed #CBD5E1' }}
                    />
                    <ImagePreview
                      newPreview={formData.logoPreview}
                      existingPath={formData.logo}
                      folder="logo"
                      label="Logo"
                    />
                  </Field>

                  {/* ── Signature ── */}
                  <Field label="Signature">
                    <input
                      name="signature"
                      onChange={handleFileChange}
                      type="file"
                      accept="image/*"
                      className={styles.inputControl}
                      style={{ ...inputStyle, padding: '9px', border: '1px dashed #CBD5E1' }}
                    />
                    <ImagePreview
                      newPreview={formData.signaturePreview}
                      existingPath={formData.signature}
                      folder="logo"
                      label="Signature"
                    />
                  </Field>

                  {/* ── Favicon ── */}
                  <Field label="Favicon">
                    <input
                      name="favicon"
                      onChange={handleFileChange}
                      type="file"
                      accept="image/*"
                      className={styles.inputControl}
                      style={{ ...inputStyle, padding: '9px', border: '1px dashed #CBD5E1' }}
                    />
                    <ImagePreview
                      newPreview={formData.faviconPreview}
                      existingPath={formData.favicon}
                      folder="logo"
                      label="Favicon"
                    />
                  </Field>
                </Grid>

                {/* Theme Colors */}
                <div style={{ marginTop: '20px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>Theme Colors</label>
                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'headerColor', label: 'Header' },
                      { key: 'bodyColor',   label: 'Body' },
                      { key: 'leftColor',   label: 'Sidebar' },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #E2E8F0', overflow: 'hidden', position: 'relative', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                          <input
                            name={key}
                            type="color"
                            value={formData[key]}
                            onChange={handleInputChange}
                            style={{ position: 'absolute', top: '-8px', left: '-8px', width: '60px', height: '60px', border: 'none', cursor: 'pointer', padding: 0 }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{formData[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={() => { setViewState('table'); setFormData(INIT_FORM); setErrorMsg(''); }}
                style={{ padding: '11px 24px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
              <button
                type="submit"
                disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 28px', background: isSaving ? '#94A3B8' : 'linear-gradient(135deg,#10B981,#059669)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
              >
                {isSaving ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Saving...</> : <><FiCheck /> {formData.id ? 'Update Company' : 'Save Company'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════ */}
      {deleteModal.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px 28px',
            width: '380px', maxWidth: '92vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            textAlign: 'center', animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              width: '60px', height: '60px', background: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: '#EF4444', fontSize: '1.6rem'
            }}>
              <FiTrash2 />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>Delete Company?</h3>
            <p style={{ margin: '0 0 6px', color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5 }}>
              You are about to delete
            </p>
            <p style={{ margin: '0 0 24px', fontWeight: 800, color: '#1D4ED8', fontSize: '1rem' }}>
              "{deleteModal.name}"
            </p>
            <p style={{ margin: '0 0 24px', color: '#94A3B8', fontSize: '0.8rem' }}>
              This action <strong>cannot be undone</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >Cancel</button>
              <button
                onClick={handleDeleteConfirm}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Mini helper components ── */
const Section = ({ title, icon, color, children }) => (
  <div>
    <h4 style={{
      margin: '0 0 18px',
      fontSize: '0.95rem',
      fontWeight: 700,
      color: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      gap: icon ? '10px' : '0',
      paddingLeft: icon ? '0' : '12px',
      borderLeft: icon ? 'none' : '3px solid #1756AA',
    }}>
      {icon && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '34px', height: '34px', borderRadius: '10px',
          background: `${color}18`, color, flexShrink: 0
        }}>{icon}</span>
      )}
      {title}
    </h4>
    {children}
  </div>
);


const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '20px' }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  borderRadius: '10px', padding: '11px 14px',
  border: '1px solid #E2E8F0', background: '#F8FAFC',
  color: '#1E293B', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box'
};

/* ── Image Preview Component ── */
const ImagePreview = ({ newPreview, existingPath, folder, label }) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => { setImgFailed(false); }, [newPreview, existingPath]);

  /* ── Case 1: User selected a NEW file → blob URL (no CORS, always works) ── */
  if (newPreview) {
    return (
      <div style={{
        marginTop: '8px', borderRadius: '10px', border: '2px solid #10B981',
        background: '#F0FDF4', padding: '10px', display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative'
      }}>
        <span style={{
          position: 'absolute', top: '6px', right: '6px',
          background: '#10B981', color: '#fff', fontSize: '0.6rem',
          fontWeight: 800, padding: '2px 7px', borderRadius: '20px'
        }}>✓ NEW</span>
        <img
          src={newPreview}
          alt={`${label} preview`}
          style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
        />
        <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
          New {label} selected
        </span>
      </div>
    );
  }

  /* ── Case 2: Existing server image — build correct folder URL ── */
  if (!existingPath) return null;

  // Build: https://api.sahayatamoney.in/UploadedFiles/{folder}/{filename}
  const folderMap = { logo: getLogoUrl, signature: getSignatureUrl, favicon: getFaviconUrl };
  const urlBuilder = folderMap[folder] || getLogoUrl;
  const serverUrl  = urlBuilder(existingPath);
  const fileName   = existingPath.replace(/^\/+/, '').split('/').pop() || existingPath;

  return (
    <div style={{
      marginTop: '8px', borderRadius: '10px', border: '1px solid #E2E8F0',
      background: '#F8FAFC', padding: '10px', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: '6px'
    }}>
      {!imgFailed ? (
        <img
          src={serverUrl}
          alt={`${label} preview`}
          onError={() => setImgFailed(true)}
          style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
        />
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', padding: '10px 16px',
          background: '#EFF6FF', borderRadius: '8px', border: '1px dashed #93C5FD',
          width: '100%'
        }}>
          <span style={{ fontSize: '1.6rem' }}>
            {label === 'Logo' ? '🖼️' : label === 'Signature' ? '✍️' : '🌐'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 700, wordBreak: 'break-all', textAlign: 'center' }}>
            {fileName}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
            Existing {label} (upload new to change)
          </span>
        </div>
      )}
      {!imgFailed && (
        <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
          Current {label}: {fileName}
        </span>
      )}
    </div>
  );
};

export default ManageCompany;


