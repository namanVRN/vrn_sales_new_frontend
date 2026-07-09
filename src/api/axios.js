import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════
// REQUEST INTERCEPTOR — Attach JWT token
// ═══════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vrn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════
// RESPONSE INTERCEPTOR — Handle errors globally
// ═══════════════════════════════════════════
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status;

    // Token expired or invalid — logout
    if (status === 401) {
      localStorage.removeItem('vrn_token');
      localStorage.removeItem('vrn_user');
      
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(message || 'Access denied');
    } else if (status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error.response?.data || { message });
  }
);

export default api;