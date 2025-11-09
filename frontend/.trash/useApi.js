import { useState, useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { method = 'GET', body = null, immediate = true } = options;

  const execute = async (customBody = null) => {
    try {
      setLoading(true);
      const response = await api({
        method,
        url: endpoint,
        data: customBody || body,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      toast.error(err?.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    } else {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, error, loading, execute, setData };
};
