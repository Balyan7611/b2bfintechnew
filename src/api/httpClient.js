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

    let token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
    if (token === 'undefined' || token === 'null') {
        token = null;
    }
    if (token) {
        token = token.replace(/^"(.*)"$/, '$1');
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // Start global loader
    startLoading();
    
    return config;
}, (error) => {
    stopLoading();
    return Promise.reject(error);
});

httpClient.interceptors.response.use((response) => {
    stopLoading();
    
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
            store.dispatch(setNotification({ type: 'error', message: msg }));
        }
    }
    
    return response;
}, (error) => {
    stopLoading();
    
    if (error.response && error.response.status === 401) {
        const isAuthRequest = error.config?.url && (error.config.url.includes('/login') || error.config.url.includes('/register') || error.config.url.includes('/forgot') || error.config.url.includes('/otp'));
        const isLoginPath = window.location.pathname.includes('/login');
        
        const isDashboardPath = window.location.pathname.startsWith('/member/dashboard') || window.location.pathname.startsWith('/admin/dashboard');
        
        if (isDashboardPath) {
            const hasAdminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const hasAccessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            
            if (window.__isLoggingOut) return Promise.reject(error);
            window.__isLoggingOut = true;

            localStorage.removeItem('admin_token');
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('access_token');
            localStorage.removeItem('bss_current_session');
            
            if (hasAdminToken || hasAccessToken) {
                alert("Session Expired: Your session has expired or is invalid. Please log in again.");
            }
            
            const isAdmin = window.location.pathname.startsWith('/admin');
            window.location.href = isAdmin ? '/admin/login' : '/member/login';
            
            return Promise.reject(error);
        }
    }
    
    const errorMsg = error.response?.data?.mess || error.response?.data?.message || error.message || "Network error. Please try again.";
    store.dispatch(setNotification({ type: 'error', message: errorMsg }));
    
    return Promise.reject(error);
});

const getSecurityData = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => ({ ip: '0.0.0.0' }));
    const ipData = await ipRes.json();
    
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

    const loc = await getLocation();

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
    post: async (url, data) => {
        const response = await httpClient.post(url, data);
        return response.data;
    },
    
    postWithSecurity: async (url, data, Mapper) => {
        const securityData = await getSecurityData();
        const payload = Mapper ? Mapper(data, securityData) : { ...data, ...securityData };
        const response = await httpClient.post(url, payload);
        return response.data;
    },
    
    put: async (url, data) => {
        const response = await httpClient.put(url, data);
        return response.data;
    },
    
    get: async (url) => {
        const response = await httpClient.get(url);
        return response.data;
    },
    
    delete: async (url) => {
        const response = await httpClient.delete(url);
        return response.data;
    },
    
    patch: async (url, data) => {
        const response = await httpClient.patch(url, data);
        return response.data;
    },

    // multipart/form-data POST
    postForm: async (url, formData) => {
        const response = await httpClient.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // multipart/form-data PUT
    putForm: async (url, formData) => {
        const response = await httpClient.put(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default httpClient;