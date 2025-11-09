import axios from "axios";

// in production, there's no localhost so we have to make this dynamic
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Initialize with token if it exists
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Always get the latest token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if we've already tried once or if it's a login/signup request
    if (originalRequest._retry || 
        originalRequest.url.includes('/login') || 
        originalRequest.url.includes('/signup')) {
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      const errorCode = error.response?.data?.code;
      
      // Don't redirect for network errors
      if (errorCode === 'TOKEN_EXPIRED' || 
          errorCode === 'TOKEN_INVALID' || 
          errorCode === 'TOKEN_MISSING' || 
          errorCode === 'USER_NOT_FOUND') {
            
        // Clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Use relative path for better compatibility
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // For other 401s, try to refresh token or retry request
      try {
        const token = localStorage.getItem('token');
        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (retryError) {
        console.error('Error retrying request:', retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;