import React, { useRef, useState, useEffect } from 'react';
import { FaDownload, FaMedal, FaEye, FaTimes, FaShieldAlt, FaStar } from 'react-icons/fa';
import { SITE_CONFIG } from '../../../../config/siteConfig';
import { getSession } from '../../../../utils/authUtils';
import { API } from '../../../../api/endpoints';
import styles from './MemberCertificate.module.css';

const MemberCertificate = () => {
  const certRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [profile, setProfile] = useState(null);

  const session = getSession() || {};
  const memberName = session.fullName || session.name || 'Member Name';
  const agentCode  = session.loginId || session.memberId || session.username || 'N/A';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.member.getProfile?.() || await API.member.getMyProfile?.();
        if (res?.data) setProfile(res.data);
        else if (res) setProfile(res);
      } catch { /* silent */ }
    };
    load();
  }, []);

  const city      = profile?.city || profile?.district || profile?.address || '';
  const validUpto = profile?.validTill || profile?.validUpto || profile?.membershipExpiry || '';
  const validStr  = validUpto
    ? new Date(validUpto).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    : '31 MARCH 2026';

  const surname   = memberName.split(' ').pop().toUpperCase();
  const initials  = memberName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      await document.fonts.ready;
      const images = certRef.current.querySelectorAll('img');
      await Promise.all([...images].map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      ));
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: '#ffffff', logging: false,
        onclone: async (d) => { await d.fonts.ready; await new Promise(r => setTimeout(r, 400)); }
      });
      const link = document.createElement('a');
      link.download = `Certificate_${memberName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error('Certificate download failed:', err); }
  };

  const Cert = React.forwardRef((_, ref) => (
    <div className={styles.certCard} ref={ref}>
      {/* Deep blue top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.brandName} className={styles.topBarLogo} crossOrigin="anonymous" />
          <div className={styles.topBarText}>
            <span className={styles.topBarBrand}>{SITE_CONFIG.companyName}</span>
            <span className={styles.topBarTagline}>Authorized Service Partner Network</span>
          </div>
          <div className={styles.topBarStars}>
            {[0,1,2].map(i => <FaStar key={i} className={styles.starIcon} />)}
          </div>
        </div>
      </div>

      {/* Gold ribbon strip */}
      <div className={styles.goldRibbon} />

      {/* Main body */}
      <div className={styles.certBody}>
        {/* Watermark */}
        <div className={styles.watermark}>
          <img src={SITE_CONFIG.logo} alt="" crossOrigin="anonymous" className={styles.watermarkImg} />
        </div>

        {/* Title */}
        <div className={styles.titleBlock}>
          <p className={styles.certOfText}>C E R T I F I C A T E &nbsp;&nbsp; O F</p>
          <h2 className={styles.certTitle}>Authorization</h2>
          <div className={styles.titleDivider}>
            <div className={styles.divLine} />
            <span className={styles.divDiamond}>◆</span>
            <div className={styles.divLine} />
          </div>
        </div>

        {/* Certify block */}
        <div className={styles.certifyBlock}>
          <p className={styles.certifyText}>This is to certify that</p>

          {/* Name panel */}
          <div className={styles.namePanel}>
            <div className={styles.nameAvatar}>{initials}</div>
            <div className={styles.nameDetails}>
              <span className={styles.nameTitle}>Mr / Ms</span>
              <span className={styles.nameBig}>{memberName}</span>
              {city && <span className={styles.nameCity}>📍 {city}</span>}
            </div>
          </div>

          <p className={styles.appointText}>
            has been duly appointed as an <em><strong>Authorized Customer Service Point (CSP)</strong></em>
          </p>
          <p className={styles.companyLine}>
            of <strong className={styles.companyNameSpan}>{SITE_CONFIG.companyName}</strong>
          </p>
          <p className={styles.descText}>
            and is authorized to provide financial and digital services on behalf of the company
            in accordance with the terms and conditions of the service agreement.
          </p>
        </div>

        {/* Three info boxes */}
        <div className={styles.infoBoxRow}>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>AGENT CODE</span>
            <span className={styles.infoValue}>{agentCode}</span>
          </div>
          <div className={`${styles.infoBox} ${styles.infoBoxCenter}`}>
            <FaShieldAlt className={styles.sealIcon} />
            <span className={styles.infoLabel} style={{ marginTop: 4 }}>VERIFIED</span>
          </div>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>VALID UPTO</span>
            <span className={styles.infoValue} style={{ fontSize: '0.72rem' }}>{validStr}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.certFooter}>
          <div className={styles.footerCol}>
            <div className={styles.signSpace} />
            <div className={styles.signLine} />
            <span className={styles.footerLabel}>AUTHORIZED SIGNATORY</span>
          </div>
          <div className={styles.footerCenter}>
            <img src={SITE_CONFIG.logo} alt="Logo" className={styles.footerLogo} crossOrigin="anonymous" />
          </div>
          <div className={styles.footerCol}>
            <div className={styles.signSpace} />
            <div className={styles.signLine} />
            <span className={styles.footerLabel}>MEMBER SIGNATURE</span>
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div className={styles.bottomBar} />
    </div>
  ));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeading}>
        <FaMedal className={styles.headingIcon} />
        <span>Certificate of Authorization</span>
        <button className={styles.previewBtn} onClick={() => setShowPreview(true)}>
          <FaEye /> Preview
        </button>
      </div>

      <div className={styles.certWrapper}>
        <Cert ref={certRef} />
        <button className={styles.downloadBtn} onClick={handleDownload}>
          <FaDownload /> Download Certificate
        </button>
      </div>

      {showPreview && (
        <div className={styles.modalOverlay} onClick={() => setShowPreview(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowPreview(false)}><FaTimes /></button>
            <p className={styles.modalTitle}><FaMedal /> Certificate Preview</p>
            <div className={styles.previewScaler}><Cert /></div>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <FaDownload /> Download Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberCertificate;
