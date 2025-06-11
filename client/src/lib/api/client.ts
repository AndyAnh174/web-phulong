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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
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
  }) => api.get<Service[]>('/services', { params }),

  getById: (id: number) => api.get<Service>(`/services/${id}`),

  getSuggested: (currentId: number) => 
    api.get<Service[]>(`/services/suggested?current_id=${currentId}`),

  create: (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Service>('/services', service),

  update: (id: number, service: Partial<Service>) =>
    api.put<Service>(`/services/${id}`, service),

  delete: (id: number) => api.delete(`/services/${id}`),

  getReviews: (serviceId: number) =>
    api.get<Review[]>(`/services/${serviceId}/reviews`),

  createReview: (serviceId: number, review: Omit<Review, 'id' | 'service_id' | 'created_at'>) =>
    api.post<Review>(`/services/${serviceId}/reviews`, review),
};

// API Blogs
export const blogsApi = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    category?: string;
  }) => api.get<Blog[]>('/blogs', { params }),

  getById: (id: number) => api.get<Blog>(`/blogs/${id}`),

  create: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Blog>('/blogs', blog),

  update: (id: number, blog: Partial<Blog>) =>
    api.put<Blog>(`/blogs/${id}`, blog),

  delete: (id: number) => api.delete(`/blogs/${id}`),
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
  }) => api.get<PaginatedResponse<Order>>('/orders', { params }),

  getById: (id: number) => api.get<Order>(`/orders/${id}`),

  create: (formData: FormData) =>
    api.post<Order>('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStatus: (id: number, status: Order['status']) =>
    api.put<Order>(`/orders/${id}`, { status }),

  exportCSV: (params?: {
    customer_name?: string;
    service_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    token?: string;
  }) => api.get('/orders/export/csv', { params, responseType: 'blob' }),
};

// API Contact
export const contactApi = {
  submit: (contact: Omit<Contact, 'id' | 'created_at' | 'status'>) =>
    api.post<Contact>('/contact/submit', contact),

  getAll: (params?: { skip?: number; limit?: number; name?: string; status?: string }) =>
    api.get<PaginatedResponse<Contact>>('/contact/list', { params }),

  getById: (id: number) => api.get<Contact>(`/contact/${id}`),

  markAsRead: (id: number) => api.put(`/contact/${id}/mark-read`),

  delete: (id: number) => api.delete(`/contact/${id}`),

  exportCSV: (params?: {
    name?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get('/contact/export/csv', { params, responseType: 'blob' }),
};

// API Auth
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post<AuthResponse>('/auth/login-json', credentials),

  me: () => api.get('/users/me'),

  register: (user: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => api.post('/auth/register', user),

  getLoginHistory: () => api.get('/auth/login-history'),
};

// API Users
export const usersApi = {
  me: () => api.get('/users/me'),
  getAll: (params?: { skip?: number; limit?: number }) =>
    api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (user: unknown) => api.post('/users', user),
  update: (id: number, user: unknown) => api.put(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`),
  deleteByUsername: (username: string) => api.delete(`/users/by-username/${username}`),
};

// API Dashboard
export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
  getRevenueByDate: () => api.get<ChartData>('/dashboard/revenue-by-date'),
  getOrdersByService: () => api.get<ChartData>('/dashboard/orders-by-service'),
};

// API Config
export const configApi = {
  getPublicEnv: () => api.get<Config>('/config/env'),
  getAdminEnv: () => api.get<AdminConfig>('/config/admin-env'),
};

export default api; 