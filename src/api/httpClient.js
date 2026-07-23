// src/api/httpClient.js
import axios from 'axios';
import { store } from '../store';
import { showLoader, hideLoader, setNotification } from '../store/slices/uiSlice';
import { checkMaliciousInput } from '../utils/securityUtils';

const httpClient = axios.create({
    baseURL: 'https://api.sahayatamoney.in/api',
    headers: { 'Content-Type': 'application/json' }
});

let activeRequests = 0;

const startLoading = () => {
    if (activeRequests === 0) {
        store.dispatch(showLoader());
    }
    activeRequests++;
};

const stopLoading = () => {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        store.dispatch(hideLoader());
    }
};

const scanObjectForMaliciousData = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') {
        const check = checkMaliciousInput(obj, 'Request Parameter', true);
        if (!check.isValid) return check.reason;
    } else if (typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const isPwdField = key.toLowerCase().includes('password') || key.toLowerCase().includes('pwd') || key.toLowerCase().includes('tpin') || key.toLowerCase().includes('pin');
                const isSystemField = ['browser', 'os', 'useragent', 'device', 'ip', 'token', 'sessionid'].includes(key.toLowerCase());
                const isDateField = key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('createdon') || key.toLowerCase().includes('updatedon') || key.toLowerCase().includes('createdat') || key.toLowerCase().includes('updatedat');
                const isLooseCheck = isPwdField || isSystemField || isDateField;
                
                const val = obj[key];
                if (typeof val === 'string') {
                    const check = checkMaliciousInput(val, key, isLooseCheck);
                    if (!check.isValid) return check.reason;
                } else if (typeof val === 'object' && val !== null) {
                    const error = scanObjectForMaliciousData(val);
                    if (error) return error;
                }
            }
        }
    }
    return null;
};

httpClient.interceptors.request.use((config) => {
    const isAuthRequest = config.url && (config.url.includes('/login') || config.url.includes('/register') || config.url.includes('/forgot') || config.url.includes('/otp'));

    // 1. Scan request body for potential SQLi/XSS/Malicious payloads ONLY on Auth requests
    if (isAuthRequest && config.data && !(config.data instanceof FormData)) {
        const securityAlert = scanObjectForMaliciousData(config.data);
        if (securityAlert) {
            const error = new Error(`Security Exception: ${securityAlert}`);
            return Promise.reject(error);
        }
    }

    // Check if system is frozen
    const isFrozen = localStorage.getItem('bss_system_frozen') === 'true';
    const method = (config.method || 'get').toLowerCase();
    const isWrite = ['post', 'put', 'delete', 'patch'].includes(method);

    if (isFrozen && isWrite && !isAuthRequest) {
        // If they are not logged in as Admin, block the transaction
        const isAdmin = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
        if (!isAdmin) {
            const error = new Error("System Freeze: All transactions are temporarily suspended by the Administrator for system security.");
            return Promise.reject(error);
        }
    }

    let token = null;
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
    // Check if the URL is a public endpoint (does not require authentication)
    const isPublicEndpoint = config.url && (
        config.url.includes('/UserAuth/LoginUser') || 
        config.url.includes('/Company/get-by-url') ||
        config.url.includes('/Company/get-all') ||
        config.url.includes('/login')
    );

    if (!isPublicEndpoint) {
        if (isAdminPath) {
            token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token') || sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
        } else {
            token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('member_token') || localStorage.getItem('member_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
        }
    }

    if (token === 'undefined' || token === 'null') {
        token = null;
    }
    if (token) {
        token = String(token).replace(/^"(.*)"$/, '$1').trim();
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
        if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${cleanToken}`);
        } else {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${cleanToken}`;
        }
    }
    
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        config.headers['Content-Type'] = undefined;
        config.headers['content-type'] = undefined;
    }
    
    // Start global loader if not hidden
    if (!config.hideLoader) {
        startLoading();
    }
    
    console.log("Outgoing API Request URL:", config.url, "Authorization Header:", config.headers?.Authorization || config.headers?.get?.('Authorization'));
    return config;
}, (error) => {
    if (!error.config || !error.config.hideLoader) {
        stopLoading();
    }
    return Promise.reject(error);
});

httpClient.interceptors.response.use((response) => {
    if (!response.config || !response.config.hideLoader) {
        stopLoading();
    }
    
    const resData = response.data;
    if (resData) {
        const method = response.config.method.toLowerCase();
        const isWrite = ['post', 'put', 'delete'].includes(method);
        
        const isSuccess = resData.status === true || resData.status === 'success' || resData.status === 1 || resData.code === 'TXN' || resData.code === 'SUCCESS';
        const isError = resData.status === false || resData.status === 'error' || resData.status === 0 || resData.code === 'ERR' || resData.code === 'ERROR';

        if (isSuccess) {
            if (isWrite) {
                const msg = resData.mess || resData.message || "Operation completed successfully!";
                store.dispatch(setNotification({ type: 'success', message: msg }));
            }
        } else if (isError) {
            const msg = resData.mess || resData.message || "Operation failed!";
            if (!response.config || (!response.config.hideLoader && !response.config.ignoreError)) {
                store.dispatch(setNotification({ type: 'error', message: msg }));
            }
            return Promise.reject(new Error(msg));
        }
    }
    
    return response;
}, (error) => {
    if (!error.config || !error.config.hideLoader) {
        stopLoading();
    }
    
    if (error.response && error.response.status === 401) {
        const isAuthRequest = error.config?.url && (error.config.url.includes('/login') || error.config.url.includes('/register') || error.config.url.includes('/forgot') || error.config.url.includes('/otp'));
        const isLoginPath = window.location.pathname.includes('/login');
        
        const isDashboardPath = window.location.pathname.startsWith('/member/dashboard') || window.location.pathname.startsWith('/admin/dashboard');
        
        const isPublicOrBgUrl = error.config?.url && (error.config.url.includes('/Company') || error.config.url.includes('/UserLoginHistory'));
        const shouldSkipLogout = isPublicOrBgUrl || error.config?.ignoreError || error.config?.hideLoader;

        if (isDashboardPath && !shouldSkipLogout) {
            const hasAdminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const hasAccessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const isAdmin = window.location.pathname.startsWith('/admin');
            
            // If this is a mock token (used for testing without a backend), ignore the 401 to prevent a logout loop
            const isMockToken = hasAccessToken && (
                !String(hasAccessToken).includes('.') || 
                String(hasAccessToken).includes('mock_signature')
            );
            if (isMockToken && !isAdmin) {
                return Promise.reject(error);
            }

            if (window.__isLoggingOut) return Promise.reject(error);
            window.__isLoggingOut = true;

            localStorage.removeItem('admin_token');
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('access_token');
            localStorage.removeItem('bss_current_session');
            
            window.location.href = isAdmin ? '/admin/login' : '/member/login';
            
            return Promise.reject(error);
        }
    }
    
    let errorMsg = '';
    if (error.response && error.response.data) {
        const data = error.response.data;
        errorMsg = data.mess || data.message || data.title || (typeof data === 'string' ? data : '');
        
        // Handle ASP.NET Core Validation Errors object
        if (data.errors && typeof data.errors === 'object') {
            const validationMsg = Object.entries(data.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' | ');
            if (validationMsg) {
                errorMsg = errorMsg ? `${errorMsg} (${validationMsg})` : validationMsg;
            }
        }
    }
    
    if (!errorMsg) {
        errorMsg = error.message || 'Network Error';
    }

    console.error("HTTP Request Failed. URL:", error.config?.url, "Status:", error.response?.status, "Error Details:", error.response?.data || error.message);

    if (!error.config || (!error.config.hideLoader && !error.config.ignoreError)) {
        store.dispatch(setNotification({
            type: 'error',
            message: errorMsg
        }));
    }
    
    return Promise.reject(error);
});

const getSecurityData = async (presetLocation) => {
    // NOTE: previously this did `.catch(() => ({ ip: '0.0.0.0' }))` and then
    // unconditionally called `ipRes.json()` on the result. When the ipify
    // fetch actually failed, ipRes became a plain object (no .json method),
    // so `.json()` threw and the WHOLE security payload (including
    // latitude/longitude) silently failed to build - that's why lat/long
    // sometimes never made it into the request at all.
    let ipData = { ip: '0.0.0.0' };
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        ipData = await ipRes.json();
    } catch (e) {
        // keep the 0.0.0.0 fallback, don't let an IP lookup failure block login
    }

    const getLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ 
                    latitude: 0, 
                    longitude: 0, 
                    accuracy: 0, 
                    allowed: false, 
                    error: 'Browser does not support geolocation' 
                });
            } else {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        allowed: true
                    }),
                    (error) => {
                        let errorMsg = '';
                        switch(error.code) {
                            case 1:
                                errorMsg = 'Location access denied. Please enable location to login.';
                                break;
                            case 2:
                                errorMsg = 'Location unavailable. Please check your device settings.';
                                break;
                            case 3:
                                errorMsg = 'Location request timeout. Please try again.';
                                break;
                            default:
                                errorMsg = error.message;
                        }
                        resolve({ 
                            latitude: 0, 
                            longitude: 0, 
                            accuracy: 0, 
                            allowed: false,
                            error: errorMsg
                        });
                    },
                    { timeout: 10000, enableHighAccuracy: true }
                );
            }
        });
    };

    // If the page already grabbed a real position (e.g. the login form asked
    // for location permission up front and showed it on screen), reuse that
    // instead of firing a second geolocation request here. Two separate
    // getCurrentPosition() calls back-to-back is what made lat/long flaky -
    // the second call would sometimes silently time out even though the
    // first one already had the real coordinates in hand.
    const loc = (presetLocation && presetLocation.allowed && typeof presetLocation.latitude === 'number' && typeof presetLocation.longitude === 'number')
        ? presetLocation
        : await getLocation();

    return {
        ip: ipData.ip || '0.0.0.0',
        deviceInfo: {
            browser: navigator.userAgent,
            os: navigator.platform,
            device: 'Web',
            userAgent: navigator.userAgent
        },
        location: loc
    };
};


export const apiService = {
    post: async (url, data, config = {}) => {
        const response = await httpClient.post(url, data, config);
        return response.data;
    },

    postWithSecurity: async (url, data, Mapper, config = {}) => {
        // Optional pre-fetched location (see LoginPage.jsx / AdminLoginPage.jsx)
        // so we don't ask the browser for geolocation twice in a row.
        const presetLocation = data && data.__presetLocation;
        const cleanData = presetLocation ? { ...data } : data;
        if (presetLocation) delete cleanData.__presetLocation;

        const securityData = await getSecurityData(presetLocation);
        const payload = Mapper ? Mapper(cleanData, securityData) : { ...cleanData, ...securityData };
        const response = await httpClient.post(url, payload, config);
        return response.data;
    },
    
    put: async (url, data, config = {}) => {
        const response = await httpClient.put(url, data, config);
        return response.data;
    },
    
    get: async (url, config = {}) => {
        const response = await httpClient.get(url, config);
        return response.data;
    },
    
    delete: async (url, config = {}) => {
        const response = await httpClient.delete(url, config);
        return response.data;
    },
    
    patch: async (url, data, config = {}) => {
        const response = await httpClient.patch(url, data, config);
        return response.data;
    },

    // multipart/form-data POST
    postForm: async (url, formData, config = {}) => {
        const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('member_token');
        const headers = { ...(config.headers || {}) };
        delete headers['Content-Type'];
        delete headers['content-type'];
        headers['Content-Type'] = undefined;
        headers['content-type'] = undefined;
        if (token) {
            let cleanToken = String(token).replace(/^"(.*)"$/, '$1').trim();
            cleanToken = cleanToken.replace(/^Bearer\s+/i, '').trim();
            headers['Authorization'] = `Bearer ${cleanToken}`;
        }
        const response = await httpClient.post(url, formData, {
            ...config,
            headers
        });
        return response.data;
    },

    // multipart/form-data PUT
    putForm: async (url, formData, config = {}) => {
        const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('member_token');
        const headers = { ...(config.headers || {}) };
        delete headers['Content-Type'];
        delete headers['content-type'];
        headers['Content-Type'] = undefined;
        headers['content-type'] = undefined;
        if (token) {
            let cleanToken = String(token).replace(/^"(.*)"$/, '$1').trim();
            cleanToken = cleanToken.replace(/^Bearer\s+/i, '').trim();
            headers['Authorization'] = `Bearer ${cleanToken}`;
        }
        const response = await httpClient.put(url, formData, {
            ...config,
            headers
        });
        return response.data;
    }
};

export default httpClient;