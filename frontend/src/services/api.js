import api from '../lib/axios';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
};

export const measurementsService = {
  getAll: () => api.get('/measurements'),
  getById: (id) => api.get(`/measurements/${id}`),
  create: (data) => api.post('/measurements', data),
  update: (id, data) => api.put(`/measurements/${id}`, data),
  delete: (id) => api.delete(`/measurements/${id}`),
  runSegmentation: (id) => api.post(`/measurements/${id}/run`),
};