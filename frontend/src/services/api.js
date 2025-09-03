import axios from 'axios';

// Determine API base URL. Prefer explicit env var, fall back to current origin + /api, then hardcoded 5001.
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5001/api` : 'http://localhost:5001/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug log once (helpful during current troubleshooting)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[API] Using base URL:', API_BASE_URL);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  updatePassword: (passwordData) => api.put('/auth/update-password', passwordData),
};

// Store API
export const storeAPI = {
  getAll: (params) => api.get('/stores', { params }),
  getById: (id) => api.get(`/stores/${id}`),
  create: (storeData) => api.post('/stores', storeData),
  update: (id, storeData) => api.put(`/stores/${id}`, storeData),
  delete: (id) => api.delete(`/stores/${id}`),
  getMyStore: () => api.get('/stores/my-store'),
  getStats: (id) => api.get(`/stores/${id}/stats`),
};

// Rating API
export const ratingAPI = {
  create: (ratingData) => api.post('/ratings', ratingData),
  getUserStats: () => api.get('/ratings/user/stats'),
  getByStore: (storeId) => api.get(`/ratings/store/${storeId}`),
  update: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  delete: (id) => api.delete(`/ratings/${id}`),
};

// Admin API
export const adminAPI = {
  // Corrected endpoint path: backend exposes GET /api/admin/stats
  getDashboard: () => api.get('/admin/stats'),
  createUser: (userData) => api.post('/admin/users', userData),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  createStore: (storeData) => api.post('/admin/stores', storeData),
  getStores: (params) => api.get('/admin/stores', { params }),
  getAllRatings: () => api.get('/admin/ratings'),
  deleteRating: (id) => api.delete(`/admin/ratings/${id}`),
};

// User API (legacy - keeping for compatibility)
export const userAPI = {
  getStores: (params) => api.get('/user/stores', { params }),
  submitRating: (ratingData) => api.post('/user/ratings', ratingData),
};

// Store Owner API
export const storeOwnerAPI = {
  getDashboard: (params) => api.get('/store-owner/dashboard', { params }),
  createStore: (data) => api.post('/store-owner/stores', data),
  listStores: () => api.get('/store-owner/stores'),
};

export default api;
