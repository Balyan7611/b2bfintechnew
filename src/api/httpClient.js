// src/api/httpClient.js
import axios from 'axios';
import { store } from '../store';
import { showLoader, hideLoader, setNotification } from '../store/slices/uiSlice';

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

httpClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
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