// frontend/src/api/axios.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🌐 API_URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vrn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Prevent browser/proxy cache issues on GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), _ts: Date.now() };
    }

    console.log('🚀 REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      data: config.data,
      headers: config.headers,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ RESPONSE ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('vrn_token');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;