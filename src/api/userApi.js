// frontend/src/api/userApi.js
import api from './axios';

// ═══════════════════════════════════════════
// USER API — Object-style methods (existing)
// ═══════════════════════════════════════════
export const userApi = {
  getAll: (params = {}) => api.get('/users', { params }),
  getByRole: (role) => api.get(`/users/role/${role}`),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  resetPassword: (id, data) => api.patch(`/users/${id}/reset-password`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
};

// ═══════════════════════════════════════════
// Named exports for direct use in components
// ═══════════════════════════════════════════
export const getUsers = (params = {}) => api.get('/users', { params });
export const getUsersByRole = (role) => api.get(`/users/role/${role}`);
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const resetUserPassword = (id, data) => api.patch(`/users/${id}/reset-password`, data);
export const toggleUserStatus = (id) => api.patch(`/users/${id}/toggle-status`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default userApi;