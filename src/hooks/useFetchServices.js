import { useState, useEffect } from 'react';
import { API } from '../api/endpoints';

export const useFetchServices = (sectionType) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      try {
        setLoading(true);
        // Workaround for backend bug: getBySectionType returns all services or incorrect data.
        // We fetch ALL services and filter them strictly on the frontend.
        const response = await API.service.getAll();
        
        if (isMounted) {
          const list = Array.isArray(response) 
            ? response 
            : Array.isArray(response?.data) 
              ? response.data 
              : [];
          
          console.log(`[useFetchServices Debug] Fetched all ${list.length} services.`);
          
          // Strict frontend filter
          const filteredList = list.filter(s => {
            const serviceSection = String(s.sectionType || s.SectionType || '');
            return serviceSection === String(sectionType);
          });
          
          console.log(`[useFetchServices Debug] Filtered down to ${filteredList.length} services for sectionType = ${sectionType}`);
          
          setServices(filteredList);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch services');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [sectionType]);

  return { services, loading, error };
};
