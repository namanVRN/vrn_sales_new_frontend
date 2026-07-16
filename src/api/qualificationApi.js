import api from './axios';

// Object-style (existing)
export const qualificationApi = {
  getLeads: (params = {}) => api.get('/qualification', { params }),
  getStats: (params = {}) => api.get('/qualification/stats', { params }),
  updateStatus: (leadId, data) => api.patch(`/qualification/${leadId}`, data),
};

// 🆕 Named exports
export const getQualificationLeads = (params = {}) => api.get('/qualification', { params });
export const getQualificationStats = (params = {}) => api.get('/qualification/stats', { params });
export const updateQualification = (leadId, data) => api.patch(`/qualification/${leadId}`, data);