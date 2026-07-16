// frontend/src/api/projectApi.js
import api from './axios';

// ═══════════════════════════════════════════
// PROJECT API — Object-style methods (existing)
// ═══════════════════════════════════════════
export const projectApi = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getActive: () => api.get('/projects/active'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  toggle: (id) => api.patch(`/projects/${id}/toggle`),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ═══════════════════════════════════════════
// Named exports for direct use in components
// ═══════════════════════════════════════════
export const getAllProjects = (params = {}) => api.get('/projects', { params });
export const getActiveProjects = () => api.get('/projects/active');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data);
export const toggleProject = (id) => api.patch(`/projects/${id}/toggle`);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export default projectApi;