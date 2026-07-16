import api from './axios';

// Object-style (existing)
export const siteVisitSchedulingApi = {
  getLeads: (params = {}) => api.get('/site-visit-scheduling', { params }),
  getStats: (params = {}) => api.get('/site-visit-scheduling/stats', { params }),
  updateStatus: (leadId, data) => api.patch(`/site-visit-scheduling/${leadId}`, data),
};

export const siteVisitExecutionApi = {
  getScheduled: (params = {}) => api.get('/site-visit-execution/scheduled', { params }),
  getCNP: (params = {}) => api.get('/site-visit-execution/cnp', { params }),
  getStats: () => api.get('/site-visit-execution/stats'),
  updateStatus: (leadId, data) => api.patch(`/site-visit-execution/${leadId}`, data),
};

// 🆕 Named exports for Site Visit Scheduling
export const getSiteVisitSchedulingLeads = (params = {}) => api.get('/site-visit-scheduling', { params });
export const getSiteVisitSchedulingStats = (params = {}) => api.get('/site-visit-scheduling/stats', { params });
export const updateSiteVisitScheduling = (leadId, data) => api.patch(`/site-visit-scheduling/${leadId}`, data);

// 🆕 Named exports for Site Visit Execution
export const getScheduledVisits = (params = {}) => api.get('/site-visit-execution/scheduled', { params });
export const getCNPLeads = (params = {}) => api.get('/site-visit-execution/cnp', { params });
export const getSiteVisitExecutionStats = (params = {}) => api.get('/site-visit-execution/stats', { params });
export const updateSiteVisitExecution = (leadId, data) => api.patch(`/site-visit-execution/${leadId}`, data);