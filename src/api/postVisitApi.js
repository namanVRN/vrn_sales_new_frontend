import api from './axios';

// Object-style (existing)
export const postVisitApi = {
  getLeads: (params = {}) => api.get('/post-visit', { params }),
  getStats: (params = {}) => api.get('/post-visit/stats', { params }),
  updateStatus: (leadId, data) => api.patch(`/post-visit/${leadId}`, data),
};

// 🆕 Named exports
export const getPostVisitLeads = (params = {}) => api.get('/post-visit', { params });
export const getPostVisitStats = (params = {}) => api.get('/post-visit/stats', { params });
export const updatePostVisit = (leadId, data) => api.patch(`/post-visit/${leadId}`, data);