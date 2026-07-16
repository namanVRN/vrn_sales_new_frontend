// frontend/src/api/leadApi.js
import api from './axios';

// ═══════════════════════════════════════════
// LEAD API — Object-style methods (existing)
// ═══════════════════════════════════════════
export const leadApi = {
  getAll: (params = {}) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  getHistory: (id) => api.get(`/leads/${id}/history`),
  create: (data) => api.post('/leads', data),
  reassign: (id, data) => api.patch(`/leads/${id}/reassign`, data),
  getStats: () => api.get('/leads/stats/overview'),
  getOverdue: (params = {}) => api.get('/leads/overdue', { params }),
  getToday: (params = {}) => api.get('/leads/today', { params }),
  getBDMWorkload: () => api.get('/leads/bdm/workload'),
};

// ═══════════════════════════════════════════
// Named exports for direct use in components
// ═══════════════════════════════════════════
export const getAllLeads = (params = {}) => api.get('/leads', { params });
export const getLeadById = (id) => api.get(`/leads/${id}`);
export const getLeadHistory = (id) => api.get(`/leads/${id}/history`);
export const createLead = (data) => api.post('/leads', data);
export const reassignLead = (id, data) => api.patch(`/leads/${id}/reassign`, data);
export const getLeadStats = () => api.get('/leads/stats/overview');
export const getOverdueLeads = (params = {}) => api.get('/leads/overdue', { params });
export const getTodaysFollowups = (params = {}) => api.get('/leads/today', { params });
export const getBDMWorkload = () => api.get('/leads/bdm/workload');

export default leadApi;