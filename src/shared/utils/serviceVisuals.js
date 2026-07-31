// src/shared/utils/serviceVisuals.js
//
// Shared keyword -> {icon, color} lookup used to render the dynamic service
// tiles (Member / Admin / API-panel dashboards) once the actual service list
// comes from the backend (Service master table) instead of a hardcoded array.
// Matching is done by keyword against the service's `name` field so any
// service already known to the UI gets its familiar icon/color, and anything
// new/unrecognized still renders sensibly with a default.
import React from 'react';
import {
  FaMoneyBillWave, FaMobileAlt, FaFingerprint, FaWallet, FaExchangeAlt,
  FaIdCard, FaQrcode, FaShoppingBag, FaFileInvoice, FaTv, FaBolt, FaTint,
  FaFire, FaShieldAlt, FaRoad, FaLandmark, FaCreditCard, FaHandHoldingUsd,
  FaAddressCard, FaUniversity, FaPhoneAlt
} from 'react-icons/fa';
import { FiDroplet } from 'react-icons/fi';

const SERVICE_VISUAL_MAP = [
  { match: 'dmt', icon: FaMoneyBillWave, color: '#8E24AA' },
  { match: 'aeps', icon: FaFingerprint, color: '#43A047' },
  { match: 'payout', icon: FaWallet, color: '#E53935' },
  { match: 'wallet 2 wallet', icon: FaExchangeAlt, color: '#FB8C00' },
  { match: 'w2w', icon: FaExchangeAlt, color: '#FB8C00' },
  { match: 'aadhar', icon: FaIdCard, color: '#00897B' },
  { match: 'upi cash', icon: FaQrcode, color: '#1A237E' },
  { match: 'upi', icon: FaQrcode, color: '#4CAF50' },
  { match: 'pan', icon: FaAddressCard, color: '#D81B60' },
  { match: 'virtual account', icon: FaUniversity, color: '#5E35B1' },
  { match: 'fund', icon: FaHandHoldingUsd, color: '#F4511E' },
  { match: 'shopping', icon: FaShoppingBag, color: '#7CB342' },
  { match: 'dth', icon: FaTv, color: '#1abc9c' },
  { match: 'electric', icon: FaBolt, color: '#f1c40f' },
  { match: 'water', icon: FiDroplet, color: '#3498db' },
  { match: 'gas', icon: FaFire, color: '#e67e22' },
  { match: 'insurance', icon: FaShieldAlt, color: '#2ecc71' },
  { match: 'fastag', icon: FaRoad, color: '#1c3b72' },
  { match: 'cable', icon: FaTv, color: '#e67e22' },
  { match: 'municipal', icon: FaLandmark, color: '#1abc9c' },
  { match: 'bbps', icon: FaFileInvoice, color: '#0288D1' },
  { match: 'credit card', icon: FaCreditCard, color: '#6D4C41' },
  { match: 'landline', icon: FaPhoneAlt, color: '#455A64' },
  { match: 'recharge', icon: FaMobileAlt, color: '#1E88E5' },
];

const DEFAULT_VISUAL = { icon: FaMobileAlt, color: '#64748b' };

export const getServiceVisual = (name = '') => {
  const n = String(name || '').toLowerCase();
  const found = SERVICE_VISUAL_MAP.find(v => n.includes(v.match));
  return found || DEFAULT_VISUAL;
};

export const getServiceColor = (name = '') => getServiceVisual(name).color;

// Some dashboards (e.g. the admin Services Overview list) only support a
// fixed 4-color CSS palette (green/red/blue/yellow) rather than arbitrary hex
// values. Deterministically bucket each service name into one of those so
// the same service always gets the same palette color across renders.
const PALETTE = ['green', 'blue', 'red', 'yellow'];
export const getServicePaletteColor = (name = '') => {
  const n = String(name || '');
  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
};

export const renderServiceIcon = (name = '', props = {}) => {
  const Icon = getServiceVisual(name).icon;
  return React.createElement(Icon, props);
};
