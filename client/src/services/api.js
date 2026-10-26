import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // If we're not already on login page, we can redirect or clear token
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export const parksAPI = {
  getAll: (params) => api.get('/parks', { params }),
  getById: (id) => api.get(`/parks/${id}`),
  create: (data) => api.post('/parks', data),
  update: (id, data) => api.put(`/parks/${id}`, data),
  delete: (id) => api.delete(`/parks/${id}`)
};

export const treesAPI = {
  getAll: (params) => api.get('/trees', { params }),
  getById: (id) => api.get(`/trees/${id}`),
  create: (data) => api.post('/trees', data),
  update: (id, data) => api.put(`/trees/${id}`, data),
  delete: (id) => api.delete(`/trees/${id}`)
};

export const urbanForestsAPI = {
  getAll: (params) => api.get('/urban-forests', { params }),
  getById: (id) => api.get(`/urban-forests/${id}`),
  create: (data) => api.post('/urban-forests', data),
  update: (id, data) => api.put(`/urban-forests/${id}`, data),
  delete: (id) => api.delete(`/urban-forests/${id}`)
};

export const greenBeltsAPI = {
  getAll: (params) => api.get('/green-belts', { params }),
  getById: (id) => api.get(`/green-belts/${id}`),
  create: (data) => api.post('/green-belts', data),
  update: (id, data) => api.put(`/green-belts/${id}`, data),
  delete: (id) => api.delete(`/green-belts/${id}`)
};

export const environmentalAPI = {
  getAll: (params) => api.get('/environmental-indicators', { params }),
  getLatest: () => api.get('/environmental-indicators/latest'),
  create: (data) => api.post('/environmental-indicators', data),
  update: (id, data) => api.put(`/environmental-indicators/${id}`, data),
  delete: (id) => api.delete(`/environmental-indicators/${id}`)
};

export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`)
};

export const reportsAPI = {
  getAll: () => api.get('/reports'),
  generate: (data) => api.post('/reports/generate', data),
  getById: (id) => api.get(`/reports/${id}`),
  delete: (id) => api.delete(`/reports/${id}`)
};

export default api;
