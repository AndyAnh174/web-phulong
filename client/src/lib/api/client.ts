import axios from 'axios';
import type {
  Service,
  Blog,
  Order,
  Contact,
  Config,
  AdminConfig,
  DashboardSummary,
  ChartData,
  AuthResponse,
  PaginatedResponse,
  Review
} from '../types';

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Services
export const servicesApi = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    featured?: boolean;
    category?: string;
  }) => api.get<Service[]>('/api/services', { params }),

  getById: (id: number) => api.get<Service>(`/api/services/${id}`),

  getSuggested: (currentId: number) => 
    api.get<Service[]>(`/api/services/suggested?current_id=${currentId}`),

  create: (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Service>('/api/services', service),

  update: (id: number, service: Partial<Service>) =>
    api.put<Service>(`/api/services/${id}`, service),

  delete: (id: number) => api.delete(`/api/services/${id}`),

  getReviews: (serviceId: number) =>
    api.get<Review[]>(`/api/services/${serviceId}/reviews`),

  createReview: (serviceId: number, review: Omit<Review, 'id' | 'service_id' | 'created_at'>) =>
    api.post<Review>(`/api/services/${serviceId}/reviews`, review),
};

// API Blogs
export const blogsApi = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    category?: string;
  }) => api.get<Blog[]>('/api/blogs', { params }),

  getById: (id: number) => api.get<Blog>(`/api/blogs/${id}`),

  create: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Blog>('/api/blogs', blog),

  update: (id: number, blog: Partial<Blog>) =>
    api.put<Blog>(`/api/blogs/${id}`, blog),

  delete: (id: number) => api.delete(`/api/blogs/${id}`),
};

// API Orders
export const ordersApi = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    customer_name?: string;
    service_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get<PaginatedResponse<Order>>('/api/orders', { params }),

  getById: (id: number) => api.get<Order>(`/api/orders/${id}`),

  create: (formData: FormData) =>
    api.post<Order>('/api/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStatus: (id: number, status: Order['status']) =>
    api.put<Order>(`/api/orders/${id}`, { status }),

  exportCSV: (params?: {
    customer_name?: string;
    service_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    token?: string;
  }) => api.get('/api/orders/export/csv', { params, responseType: 'blob' }),
};

// API Contact
export const contactApi = {
  submit: (contact: Omit<Contact, 'id' | 'created_at' | 'status'>) =>
    api.post<Contact>('/api/contact/submit', contact),

  getAll: (params?: { skip?: number; limit?: number; name?: string; status?: string }) =>
    api.get<PaginatedResponse<Contact>>('/api/contact/list', { params }),

  getById: (id: number) => api.get<Contact>(`/api/contact/${id}`),

  markAsRead: (id: number) => api.put(`/api/contact/${id}/mark-read`),

  delete: (id: number) => api.delete(`/api/contact/${id}`),

  exportCSV: (params?: {
    name?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get('/api/contact/export/csv', { params, responseType: 'blob' }),
};

// API Auth
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login-json', credentials),

  me: () => api.get('/api/users/me'),

  register: (user: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => api.post('/api/auth/register', user),

  getLoginHistory: () => api.get('/api/auth/login-history'),
};

// API Users
export const usersApi = {
  me: () => api.get('/api/users/me'),
  getAll: (params?: { skip?: number; limit?: number }) =>
    api.get('/api/users', { params }),
  getById: (id: number) => api.get(`/api/users/${id}`),
  create: (user: unknown) => api.post('/api/users', user),
  update: (id: number, user: unknown) => api.put(`/api/users/${id}`, user),
  delete: (id: number) => api.delete(`/api/users/${id}`),
  deleteByUsername: (username: string) => api.delete(`/api/users/by-username/${username}`),
};

// API Dashboard
export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/api/dashboard/summary'),
  getRevenueByDate: () => api.get<ChartData>('/api/dashboard/revenue-by-date'),
  getOrdersByService: () => api.get<ChartData>('/api/dashboard/orders-by-service'),
};

// API Config
export const configApi = {
  getPublicEnv: () => api.get<Config>('/api/config/env'),
  getAdminEnv: () => api.get<AdminConfig>('/api/config/admin-env'),
};

export default api; 