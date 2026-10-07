import axios from 'axios';
import { store } from '../store';
import { showLoader, hideLoader, setNotification } from '../store/slices/uiSlice';
import { checkMaliciousInput } from '../utils/securityUtils';

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://api.bype.in/api',
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

        if (isAuthRequest && config.data && !(config.data instanceof FormData)) {
        const securityAlert = scanObjectForMaliciousData(config.data);
        if (securityAlert) {
            const error = new Error(`Security Exception: ${securityAlert}`);
            return Promise.reject(error);
        }
    }

        const isFrozen = localStorage.getItem('bss_system_frozen') === 'true';
    const method = (config.method || 'get').toLowerCase();
    const isWrite = ['post', 'put', 'delete', 'patch'].includes(method);

    if (isFrozen && isWrite && !isAuthRequest) {
                const isAdmin = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
        if (!isAdmin) {
            const error = new Error("System Freeze: All transactions are temporarily suspended by the Administrator for system security.");
            return Promise.reject(error);
        }
    }

    let token = null;
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
        const isPublicEndpoint = config.url && (
        config.url.includes('/UserAuth/LoginUser') ||
        config.url.includes('/Company/get-by-url') ||
        config.url.includes('/login')
    );

    if (!isPublicEndpoint) {
        const isApiPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/api-panel');
        if (isAdminPath) {
            token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token') || sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
        } else if (isApiPath) {
            token = sessionStorage.getItem('api_token') || localStorage.getItem('api_token') || sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
        } else {
            token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('member_token') || localStorage.getItem('member_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
        }
    }

        const lat = localStorage.getItem('user_latitude');
    const lng = localStorage.getItem('user_longitude');
    if (lat && lng) {
        config.headers = config.headers || {};
        config.headers['X-Latitude']  = lat;
        config.headers['X-Longitude'] = lng;
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
        // axios v1's config.headers is an AxiosHeaders instance, not a plain
        // object — bracket delete / assigning undefined doesn't reliably
        // remove the header on it (same reason Authorization above uses
        // .set() instead of bracket assignment). Leaving a stale
        // "Content-Type: application/json" (or literal "undefined") header
        // on a multipart FormData body makes the server reject the request
        // with 415 Unsupported Media Type — the browser never gets to set
        // its own "multipart/form-data; boundary=..." header.
        if (config.headers && typeof config.headers.delete === 'function') {
            config.headers.delete('Content-Type');
            config.headers.delete('content-type');
        } else if (config.headers) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
        }
    }
    
        if (!config.hideLoader) {
        startLoading();
    }
    
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
    
        if (error.response && error.response.status === 403) {
        const msg = error.response.data?.mess || error.response.data?.message || 'Access blocked due to unexpected location change. Please contact support.';
        store.dispatch(setNotification({ type: 'error', message: `🚨 Security Alert: ${msg}` }));
        return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
        const isAuthRequest = error.config?.url && (error.config.url.includes('/login') || error.config.url.includes('/register') || error.config.url.includes('/forgot') || error.config.url.includes('/otp'));
        const isLoginPath = window.location.pathname.includes('/login');
        
        const isDashboardPath = window.location.pathname.startsWith('/member/dashboard') || window.location.pathname.startsWith('/admin/dashboard') || window.location.pathname.startsWith('/api-panel/dashboard');

        const isPublicOrBgUrl = error.config?.url && (error.config.url.includes('/Company') || error.config.url.includes('/UserLoginHistory'));
        const shouldSkipLogout = isPublicOrBgUrl || error.config?.ignoreError || error.config?.hideLoader;

        if (isDashboardPath && !shouldSkipLogout) {
            const hasAdminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const hasAccessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const isAdmin = window.location.pathname.startsWith('/admin');
            const isApiPanel = window.location.pathname.startsWith('/api-panel');

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
            localStorage.removeItem('api_token');
            localStorage.removeItem('member_token');
            localStorage.removeItem('bss_current_session');
            localStorage.removeItem('bss_admin_session');
            localStorage.removeItem('bss_api_session');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('api_token');

            window.location.href = isAdmin ? '/admin/login' : isApiPanel ? '/api-panel/login' : '/member/login';
            
            return Promise.reject(error);
        }
    }
    
    let errorMsg = '';
    if (error.response && error.response.data) {
        const data = error.response.data;
        errorMsg = data.mess || data.message || data.title || (typeof data === 'string' ? data : '');
        
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

    // Calls made with `ignoreError: true` have already told us the caller
    // will handle the failure quietly (has its own fallback/retry) — don't
    // also blast a top-level console.error for those, just keep it at
    // debug level. Everything else still logs loudly as before.
    if (error.config?.ignoreError) {
        console.debug("HTTP Request Failed (ignored). URL:", error.config?.url, "Status:", error.response?.status, "Error Details:", error.response?.data || error.message);
    } else {
        console.error("HTTP Request Failed. URL:", error.config?.url, "Status:", error.response?.status, "Error Details:", error.response?.data || error.message);
    }

    if (!error.config || (!error.config.hideLoader && !error.config.ignoreError)) {
        store.dispatch(setNotification({
            type: 'error',
            message: errorMsg
        }));
    }
    
    return Promise.reject(error);
});

const fetchWithTimeout = (url, ms = 3000) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal })
        .then(r => { clearTimeout(timer); return r; })
        .catch(e => { clearTimeout(timer); throw e; });
};

const getSecurityData = async (presetLocation) => {
    let clientIp = '0.0.0.0';
    const ipEndpoints = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ipinfo.io/json'
    ];
    for (const endpoint of ipEndpoints) {
        try {
            const ipRes = await fetchWithTimeout(endpoint, 3000);
            if (ipRes.ok) {
                const data = await ipRes.json();
                if (data.ip && data.ip !== '0.0.0.0') {
                    clientIp = data.ip;
                    break;
                }
            }
        } catch (e) {
                    }
    }
    const ipData = { ip: clientIp };

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

                            const loc = (presetLocation && presetLocation.allowed && typeof presetLocation.latitude === 'number' && typeof presetLocation.longitude === 'number')
        ? presetLocation
        : await getLocation();

        let browserName = 'Unknown';
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) browserName = "Firefox";
    else if (ua.includes("SamsungBrowser")) browserName = "SamsungBrowser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browserName = "Opera";
    else if (ua.includes("Trident")) browserName = "Internet Explorer";
    else if (ua.includes("Edge")) browserName = "Edge";
    else if (ua.includes("Chrome")) browserName = "Chrome";
    else if (ua.includes("Safari")) browserName = "Safari";

    return {
        ip: ipData.ip || '0.0.0.0',
        deviceInfo: {
            browser: browserName.substring(0, 49),
            os: String(navigator.platform || 'Unknown').substring(0, 49),
            device: 'Web',
            userAgent: String(navigator.userAgent || 'Unknown').substring(0, 99)
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

        postForm: async (url, formData, config = {}) => {
        const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('member_token');
        // Plain object here (not AxiosHeaders), so bracket delete is fine —
        // just make sure we don't re-add the key at all (not even as
        // undefined) since axios still serializes an "undefined" string
        // Content-Type in some adapters, which breaks the multipart boundary.
        const headers = { ...(config.headers || {}) };
        delete headers['Content-Type'];
        delete headers['content-type'];
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

        putForm: async (url, formData, config = {}) => {
        const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('member_token');
        const headers = { ...(config.headers || {}) };
        delete headers['Content-Type'];
        delete headers['content-type'];
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
