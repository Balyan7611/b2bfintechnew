// src/config/siteConfig.js
export const SITE_CONFIG = {
  companyName: 'Loading...',
  brandName: 'Loading...',
  shortName: 'Loading...',
  ownerName: 'Loading...',
  phone: 'Loading...',
  email: 'Loading...',
  address: 'Loading...',
  logo: null,
  description: 'Loading...',
  alternateEmail: null,
  alternateMobile: null,
  bankName: null,
  acName: null,
  acNumber: null,
  acType: null,
  ifsc: null,
  micrCode: null,
  websiteUrl: null,
  androidUrl: null,
  signature: null,
  feviconIcon: null,
  headerColor: null,
  leftColor: null,
  bodyColor: null,
  copyright: null,
  faceBook: null,
  instagram: null,
  twiter: null,
  youtube: null,
  whastApp: null,
  profileAmount: 0,
  isActive: true,
  createdDate: null,
  memberId: null,
  memberName: null
};

export const updateSiteConfig = (apiData) => {
  const map = {
    name: 'companyName',
    ownerName: 'ownerName',
    email: 'email',
    mobile: 'phone',
    alternateEmail: 'alternateEmail',
    alternateMobile: 'alternateMobile',
    address: 'address',
    bankName: 'bankName',
    acname: 'acName',
    acnumber: 'acNumber',
    actype: 'acType',
    ifsc: 'ifsc',
    micrcode: 'micrCode',
    logo: 'logo',
    signature: 'signature',
    feviconicon: 'feviconIcon',
    headerColor: 'headerColor',
    leftColor: 'leftColor',
    bodyColor: 'bodyColor',
    copyright: 'copyright',
    websiteUrl: 'websiteUrl',
    androidUrl: 'androidUrl',
    faceBook: 'faceBook',
    instagram: 'instagram',
    twiter: 'twiter',
    youtube: 'youtube',
    whastApp: 'whastApp',
    profileAmount: 'profileAmount',
    isActive: 'isActive',
    createdDate: 'createdDate',
    memberId: 'memberId',
    memberName: 'memberName'
  };

  Object.keys(apiData).forEach(key => {
    if (map[key] !== undefined) {
      const val = apiData[key];
      // Only override if value is not null/undefined/empty
      if (val !== null && val !== undefined && val !== '') {
        SITE_CONFIG[map[key]] = val;
      }
    }
  });

  // Always sync name-derived fields
  if (apiData.name) {
    SITE_CONFIG.companyName = apiData.name;
    SITE_CONFIG.brandName   = apiData.name;
    SITE_CONFIG.shortName   = apiData.name;
  }

  // Description: prefer copyright text, else company name
  if (apiData.copyright) {
    SITE_CONFIG.description = apiData.copyright;
  } else if (apiData.name) {
    SITE_CONFIG.description = `${apiData.name} — Digital Fintech Platform`;
  }
};