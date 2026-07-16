// frontend/src/api/authApi.js
import api from './axios';

export const authApi = {
  login: (credentials) => {
    console.log('📝 Login credentials being sent:', credentials);
    return api.post('/auth/login', credentials);
  },
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
};