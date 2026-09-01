import { useState, useEffect } from 'react';
import api from '../api';

const useAnalytics = (timeRange = '30d') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/?range=${timeRange}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Optional: Set up an interval to refresh data every 5 minutes
    const interval = setInterval(fetchAnalytics, 300000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return { data, loading, error, refresh: fetchAnalytics };
};

export default useAnalytics;
