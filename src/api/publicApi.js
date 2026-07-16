// frontend/src/api/publicApi.js
import axios from 'axios';

// Separate axios instance WITHOUT auth interceptor for public endpoints
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicLeadApi = {
  getProjects: () => publicApi.get('/public/projects'),
  checkDuplicate: (data) => publicApi.post('/public/leads/check-duplicate', data),
  createLead: (data) => publicApi.post('/public/leads', data),
};

export default publicLeadApi;