import api from './axios';

// Object-style (existing)
export const dealApi = {
  getLeads: (params = {}) => api.get('/deal', { params }),
  getStats: (params = {}) => api.get('/deal/stats', { params }),
  updateStatus: (leadId, data) => api.patch(`/deal/${leadId}`, data),
};

// 🆕 Named exports
export const getDealLeads = (params = {}) => api.get('/deal', { params });
export const getDealStats = (params = {}) => api.get('/deal/stats', { params });
export const updateDeal = (leadId, data) => api.patch(`/deal/${leadId}`, data);