// JWT/refresh + Encryption
export const requestInterceptor = async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    let ip = '0.0.0.0';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      if (ipData?.ip) ip = ipData.ip;
    } catch {
      // IP lookup failed — continue with fallback, don't block the request
    }
    
    config.headers['X-Device-Info'] = navigator.userAgent;
    config.headers['X-IP'] = ip;
    
    return config;
};

export const responseInterceptor = (response) => response;