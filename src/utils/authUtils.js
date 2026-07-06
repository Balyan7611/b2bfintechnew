// ── Credential Generation ──────────────────────────────
export const generateAdminId = (mobile) => {
  const suffix = mobile?.slice(-4) || Math.floor(1000 + Math.random() * 9000);
  const prefix = 'BSS';
  return `${prefix}${suffix}`;
};

export const generatePassword = (fullName) => {
  const namePart = (fullName || 'User').replace(/\s/g, '').slice(0, 3).toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  const special = ['@', '#', '$'][Math.floor(Math.random() * 3)];
  return `${namePart}${special}${digits}`;
};

// ── localStorage Helpers ───────────────────────────────
const USERS_KEY = 'bss_registered_users';
const SESSION_KEY = 'bss_current_session';

export const saveUser = (userData) => {
  const existing = getAllUsers();
  // Avoid duplicate by mobile
  const filtered = existing.filter((u) => u.mobile !== userData.mobile);
  filtered.push({ ...userData, registeredAt: new Date().toISOString() });
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
};

export const getAllUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

export const findUserByCredentials = (adminId, password) => {
  // Hardcoded default user
  if (adminId.toLowerCase().trim() === 'admin@gmail.com' && password === 'surender@001') {
    return { adminId: 'admin@gmail.com', fullName: 'Super Admin', mobile: '9999999999' };
  }

  const users = getAllUsers();
  return users.find(
    (u) =>
      u.adminId.toLowerCase() === adminId.toLowerCase().trim() &&
      u.password === password.trim()
  ) || null;
};

export const saveSession = (user) => {
  let sessionId = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    sessionId = Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('-');
  } else {
    sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
  const sessionData = JSON.stringify({
    adminId: user?.adminId || user?.email || user?.mobile || 'user',
    name: user?.fullName || user?.name || 'User',
    sessionId,
    loggedInAt: new Date().toISOString()
  });
  localStorage.setItem(SESSION_KEY, sessionData);
  sessionStorage.setItem(SESSION_KEY, sessionData);
};

export const getSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('admin_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('member_token');
  localStorage.removeItem('user_data');
  sessionStorage.clear();
};

export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true; // If no expiration, assume expired or invalid
  
  // exp is in seconds, convert to milliseconds
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
};