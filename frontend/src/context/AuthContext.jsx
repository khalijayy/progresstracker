import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    
    try {
      // First try to get cached user data
      const cachedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!token || !cachedUser) {
        throw new Error('No auth data');
      }

      // Set up initial state from cache
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse cached user:', e);
        throw new Error('Invalid cache');
      }

      // Then verify with server
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (apiError) {
        console.error('API check failed:', apiError);
        const errorCode = apiError?.response?.data?.code;
        
        // Only force logout for specific auth errors
        if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_MISSING', 'USER_NOT_FOUND'].includes(errorCode)) {
          throw apiError;
        }
        
        // For other errors (network/server), keep using cached data
        console.warn('Using cached auth data due to API error');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Only navigate if not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        navigate('/login');
        
        // Show error message if it wasn't a simple missing token
        if (error.message !== 'No auth data') {
          toast.error('Session expired. Please log in again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update application state
      setUser(user);
      
      // Configure axios with new token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Welcome back!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message;

      switch (errorCode) {
        case 'USER_NOT_FOUND':
          toast.error(errorMessage || 'Account not found. Please sign up first.');
          break;
        case 'INVALID_PASSWORD':
          toast.error(errorMessage || 'Incorrect password. Please try again.');
          break;
        default:
          toast.error(errorMessage || 'Login failed. Please try again later.');
      }
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await api.post('/auth/signup', userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};