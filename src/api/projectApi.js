import api from './axios';

// Project API (Admin write, all auth read)
export const projectApi = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getActive: (params = {}) => api.get('/projects/active', { params }),
  getById: (id) => api.get(`/projects/${id}`),

  // Admin only
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  toggle: (id) => api.patch(`/projects/${id}/toggle`),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Optional named exports (if you use them elsewhere)
export const getProjects = (params = {}) => api.get('/projects', { params });
export const getActiveProjects = (params = {}) => api.get('/projects/active', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data);
export const toggleProject = (id) => api.patch(`/projects/${id}/toggle`);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export default projectApi;