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
                        const response = await API.service.getAll();
        
        if (isMounted) {
          const list = Array.isArray(response) 
            ? response 
            : Array.isArray(response?.data) 
              ? response.data 
              : [];
          
          
                    const filteredList = list.filter(s => {
            const serviceSection = String(s.sectionType || s.SectionType || '');
            return serviceSection === String(sectionType);
          });
          
          
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
