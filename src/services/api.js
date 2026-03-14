import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL ||"https://tt-project-backend.onrender.com/api/users";
//https://problem-reporting-tracking.onrender.com
//const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach userId from session on every request
api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('cms_session') || 'null');
    if (session?.id) config.headers['X-User-Id'] = session.id;
    if (session?.email) config.headers['X-User-Email'] = session.email;
  } catch {}
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Complaint endpoints ──────────────────────────────────────────────────────
export const complaintAPI = {
  getAll:    (params = {})       => api.get('/complaints', { params }),
  getById:   (id)                => api.get(`/complaints/${id}`),
  create:    (data)              => api.post('/complaints', data),
  update:    (id, data)          => api.put(`/complaints/${id}`, data),
  delete:    (id)                => api.delete(`/complaints/${id}`),

  getByStatus:   (status, params = {}) => api.get(`/complaints/status/${status}`, { params }),
  getByCategory: (cat, params = {})    => api.get(`/complaints/category/${cat}`, { params }),
  getByPriority: (p, params = {})      => api.get(`/complaints/priority/${p}`, { params }),
  search:        (keyword, params = {})=> api.get('/complaints/search', { params: { keyword, ...params } }),

  updateStatus:   (id, status, resolutionNote) =>
    api.patch(`/complaints/${id}/status`, null, { params: { status, resolutionNote } }),
  updatePriority: (id, priority) =>
    api.patch(`/complaints/${id}/priority`, null, { params: { priority } }),
  assign:         (id, assignedTo) =>
    api.patch(`/complaints/${id}/assign`, null, { params: { assignedTo } }),

  getStats:      ()        => api.get('/complaints/stats'),
  getUrgent:     ()        => api.get('/complaints/urgent'),
  getRecent:     (limit=5) => api.get('/complaints/recent', { params: { limit } }),
  getUnassigned: ()        => api.get('/complaints/unassigned'),
  getByEmail:    (email)   => api.get(`/complaints/email/${encodeURIComponent(email)}`),
};

// ─── Mock data ────────────────────────────────────────────────────────────────
export const MOCK_STATS = {
  total: 248, open: 64, inProgress: 47, onHold: 12,
  resolved: 98, closed: 21, rejected: 6,
  urgentCount: 18, unassignedCount: 29,
  byCategory: { PRODUCT: 72, SERVICE: 58, BILLING: 43, TECHNICAL: 39, DELIVERY: 24, OTHER: 12 },
  byPriority: { LOW: 45, MEDIUM: 110, HIGH: 68, CRITICAL: 25 },
};

export const MOCK_COMPLAINTS = [
  { id: 1, title: 'Product arrived damaged', complainantName: 'Arjun Mehta', email: 'arjun@example.com', category: 'PRODUCT', status: 'OPEN', priority: 'HIGH', createdAt: new Date(Date.now() - 3600000).toISOString(), description: 'The product arrived with visible damage. Packaging was torn and item is broken.' },
  { id: 2, title: 'Incorrect billing amount charged', complainantName: 'Priya Singh', email: 'priya@example.com', category: 'BILLING', status: 'IN_PROGRESS', priority: 'CRITICAL', createdAt: new Date(Date.now() - 7200000).toISOString(), description: 'I was charged twice for my subscription this month. Please refund the extra payment.' },
  { id: 3, title: 'App crashing on login', complainantName: 'Ravi Kumar', email: 'ravi@example.com', category: 'TECHNICAL', status: 'OPEN', priority: 'HIGH', createdAt: new Date(Date.now() - 86400000).toISOString(), description: 'The mobile app crashes every time I try to log in from iOS 17.' },
  { id: 4, title: 'Delivery delayed by 2 weeks', complainantName: 'Sneha Patel', email: 'sneha@example.com', category: 'DELIVERY', status: 'RESOLVED', priority: 'MEDIUM', createdAt: new Date(Date.now() - 172800000).toISOString(), description: 'My order was supposed to arrive on the 1st but its still not here.', resolutionNote: 'Contacted courier. Item delivered.' },
  { id: 5, title: 'Poor customer support experience', complainantName: 'Vikram Nair', email: 'vikram@example.com', category: 'SERVICE', status: 'CLOSED', priority: 'LOW', createdAt: new Date(Date.now() - 259200000).toISOString(), description: 'Support agent was rude and unhelpful.' },
  { id: 6, title: 'Wrong item shipped', complainantName: 'Anjali Desai', email: 'anjali@example.com', category: 'PRODUCT', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: new Date(Date.now() - 43200000).toISOString(), description: 'I ordered a blue shirt size L but received a red shirt size S.' },
];

export default api;
