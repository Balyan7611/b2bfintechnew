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
  
  const role = user?.role || 2;
  const isAdmin = Number(role) === 1;
  
  const sessionData = JSON.stringify({
    userId: user?.userId || user?.loginId || user?.memberId || user?.mobile || 'user',
    adminId: isAdmin ? (user?.adminId || user?.loginId || 'admin') : undefined,
    name: user?.fullName || user?.name || 'User',
    sessionId,
    role: role,
    msrno: user?.msrno || 0,
    // Coordinates captured on the login page (see AdminLoginPage.jsx /
    // member LoginPage.jsx) - carried through so App.jsx can send the real
    // location to /UserLoginHistory/Create instead of hardcoded 0,0.
    latitude: typeof user?.latitude === 'number' ? user.latitude : 0,
    longitude: typeof user?.longitude === 'number' ? user.longitude : 0,
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
  sessionStorage.clear();
};

export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // Handle mock test token safely without crashing
    if (!token.includes('.')) {
      try {
        let cleanToken = token.replace(/^"(.*)"$/, '$1');
        // Add padding if missing
        while (cleanToken.length % 4) {
          cleanToken += '=';
        }
        const decodedStr = atob(cleanToken);
        return JSON.parse(decodedStr);
      } catch (e) {
        return null;
      }
    }

    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Restore stripped padding
    while (base64.length % 4) {
      base64 += '=';
    }
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
  if (!decoded) return true;
  if (!decoded.exp) return false;
  
  // Relaxed expiration check to prevent client/server clock skew issues.
  // Standard API requests will naturally fail with 401 if the token is truly invalid.
  const expirationTime = decoded.exp * 1000;
  return Date.now() - (24 * 60 * 60 * 1000) >= expirationTime;
};