import api from './axios';

export const activityApi = {
  // GET /api/activities
  getAll: (params = {}) => api.get('/activities', { params }),

  // GET /api/activities/export/csv  (Admin only)
  exportCsv: (params = {}) =>
    api.get('/activities/export/csv', { params, responseType: 'blob' }),
};

export default activityApi;