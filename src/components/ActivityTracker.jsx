
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import httpClient from '../api/httpClient';

const getArea = (pathname) => {
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/api-panel')) return 'ApiPartner';
  if (pathname.startsWith('/member')) return 'Member';
  return 'Website';
};

let cachedGeo = null;

const fetchGeoInfo = async () => {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      cachedGeo = {
        city: data.city || '',
        country: data.country_name || data.country || '',
        latitude: String(data.latitude || ''),
        longitude: String(data.longitude || '')
      };
      return cachedGeo;
    }
  } catch (_) { }
  return { city: '', country: '', latitude: '', longitude: '' };
};

const getBrowserGeo = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude)
        }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300000 }     );
  });

function ActivityTracker() {
  const location = useLocation();
  const lastLoggedPath = useRef('');

  const sendLog = useCallback(async (pathname) => {
        if (pathname === lastLoggedPath.current) return;
    lastLoggedPath.current = pathname;

    const area = getArea(pathname);

        let geoData = await getBrowserGeo();
    const ipGeo = await fetchGeoInfo();

    const latitude = geoData?.latitude || ipGeo.latitude;
    const longitude = geoData?.longitude || ipGeo.longitude;
    const city = ipGeo.city;
    const country = ipGeo.country;

    const logData = {
      area,
      page: pathname,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
      latitude,
      longitude,
      city,
      country
    };

    try {
                  await httpClient.post('/UserActivityLog/log', logData, {
        hideLoader: true,
        ignoreError: true
      });
    } catch (_) {
          }
  }, []);

  useEffect(() => {
    sendLog(location.pathname);
  }, [location.pathname, sendLog]);

    return null;
}

export default ActivityTracker;
