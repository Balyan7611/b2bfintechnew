// src/config/siteConfig.js

// ─── Image URL Base ───────────────────────────────────────────────────────────
const API_BASE = 'https://api.sahayatamoney.in';

/**
 * Build full image URL from filename returned by API.
 * API returns just the filename e.g. "logo.png" or "/logo.png"
 * Actual URL = https://api.sahayatamoney.in/UploadedFiles/{folder}/{filename}
 */
export const getImageUrl = (filename, folder) => {
  if (!filename) return null;
  // Already a full URL — return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  // Strip any leading slashes
  const clean = filename.replace(/^\/+/, '');
  if (!clean) return null;
  return `${API_BASE}/UploadedFiles/${folder}/${clean}`;
};

// Convenience helpers
export const getLogoUrl      = (f) => getImageUrl(f, 'logo');
export const getSignatureUrl = (f) => getImageUrl(f, 'signature');
export const getFaviconUrl   = (f) => getImageUrl(f, 'favicon');

// ─── Site Config Object ───────────────────────────────────────────────────────
export const SITE_CONFIG = {
  companyName: 'Loading...',
  brandName:   'Loading...',
  shortName:   'Loading...',
  ownerName:   'Loading...',
  phone:       'Loading...',
  email:       'Loading...',
  address:     'Loading...',
  description: 'Loading...',
  logo:        '/images/header_logo.png',   // ← Default logo or full URL will be stored here
  signature:   null,   // ← Full URL
  feviconIcon: null,   // ← Full URL
  alternateEmail:  null,
  alternateMobile: null,
  bankName:    null,
  acName:      null,
  acNumber:    null,
  acType:      null,
  ifsc:        null,
  micrCode:    null,
  websiteUrl:  null,
  androidUrl:  null,
  headerColor: null,
  leftColor:   null,
  bodyColor:   null,
  copyright:   null,
  faceBook:    null,
  instagram:   null,
  twiter:      null,
  youtube:     null,
  whastApp:    null,
  profileAmount: 0,
  isActive:    true,
  createdDate: null,
  memberId:    null,
  memberName:  null,
  
  // ── Dynamic Arrays ──
  liveStats: [
    { value: 500, suffix: '+', label: 'API Users', decimals: 0 },
    { value: 150, suffix: 'M+', label: 'Monthly Volume', decimals: 0 },
    { value: 99.9, suffix: '%', label: 'API Uptime', decimals: 1 }
  ],
  services: [
    {
      iconName: 'FaMobileAlt',
      title: 'Recharge',
      description: 'We provide fast and secure mobile & DTH recharge services for all major operators like Airtel, Jio, VI, and BSNL with instant processing.',
      color: 'var(--color-secondary)',
    },
    {
      iconName: 'FaBolt',
      title: 'BBPS',
      description: 'Pay electricity, water, gas, and other utility bills easily through BBPS with secure transactions and instant confirmation.',
      color: 'var(--color-accent)',
    },
    {
      iconName: 'FaCreditCard',
      title: 'CC Bill Payment',
      description: 'Pay your credit card bills quickly and securely with our platform and avoid late payment charges with instant processing.',
      color: 'var(--color-success)',
    },
    {
      iconName: 'FaLock',
      title: 'Payment Gateway',
      description: 'Accept online payments seamlessly with our secure payment gateway supporting multiple payment modes like UPI, cards, and net banking.',
      color: 'var(--color-primary)',
    },
    {
      iconName: 'FaMoneyBillWave',
      title: 'Payout',
      description: 'Send money instantly to any bank account using our payout service with secure and reliable transactions.',
      color: 'var(--color-secondary)',
    },
    {
      iconName: 'FaUniversity',
      title: 'MATM',
      description: 'Micro ATM service allows customers to withdraw cash, check balance, and perform banking transactions using debit cards.',
      color: 'var(--color-accent)',
    },
    {
      iconName: 'FaExchangeAlt',
      title: 'DMT',
      description: 'Domestic Money Transfer allows instant remittance to any bank account across India. Fast, secure, and available 24x7 for your convenience.',
      color: '#8B5CF6',
    },
    {
      iconName: 'FaFingerprint',
      title: 'AePS',
      description: 'Aadhaar enabled Payment System lets customers perform secure banking transactions using only their Aadhaar number and fingerprint.',
      color: '#EC4899',
    },
  ]
};

// ─── Update from API response ─────────────────────────────────────────────────
export const updateSiteConfig = (apiData) => {
  if (!apiData) return;

  const map = {
    name:           'companyName',
    ownerName:      'ownerName',
    email:          'email',
    mobile:         'phone',
    alternateEmail: 'alternateEmail',
    alternateMobile:'alternateMobile',
    address:        'address',
    bankName:       'bankName',
    acname:         'acName',
    acnumber:       'acNumber',
    actype:         'acType',
    ifsc:           'ifsc',
    micrcode:       'micrCode',
    headerColor:    'headerColor',
    leftColor:      'leftColor',
    bodyColor:      'bodyColor',
    copyright:      'copyright',
    websiteUrl:     'websiteUrl',
    androidUrl:     'androidUrl',
    faceBook:       'faceBook',
    instagram:      'instagram',
    twiter:         'twiter',
    youtube:        'youtube',
    whastApp:       'whastApp',
    profileAmount:  'profileAmount',
    isActive:       'isActive',
    createdDate:    'createdDate',
    memberId:       'memberId',
    memberName:     'memberName',
  };

  // Map all regular text fields
  Object.keys(apiData).forEach(key => {
    if (map[key] !== undefined) {
      const val = apiData[key];
      if (val !== null && val !== undefined && val !== '') {
        SITE_CONFIG[map[key]] = val;
      }
    }
  });

  // ── Image fields: build full URL with correct folder ──
  // Forcefully use the new local header_logo.png regardless of what API returns
  if (apiData.logo !== undefined) {
    SITE_CONFIG.logo = '/images/header_logo.png';
  }
  if (apiData.signature)  SITE_CONFIG.signature  = getSignatureUrl(apiData.signature);
  if (apiData.feviconicon)SITE_CONFIG.feviconIcon = getFaviconUrl(apiData.feviconicon);

  // ── Name-derived fields ──
  if (apiData.name) {
    SITE_CONFIG.companyName = apiData.name;
    SITE_CONFIG.brandName   = apiData.name;
    SITE_CONFIG.shortName   = apiData.name;
  }

  // ── Description ──
  if (apiData.copyright) {
    SITE_CONFIG.description = apiData.copyright;
  } else if (apiData.name) {
    SITE_CONFIG.description = `${apiData.name} — Digital Fintech Platform`;
  }

  // ── Dynamic Arrays ──
  if (apiData.liveStats && Array.isArray(apiData.liveStats)) {
    SITE_CONFIG.liveStats = apiData.liveStats;
  }
  if (apiData.services && Array.isArray(apiData.services)) {
    SITE_CONFIG.services = apiData.services;
  }
};