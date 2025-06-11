export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "root";
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: number;
  service?: Service;
  quantity: number;
  size?: string;
  material?: string;
  notes?: string;
  design_file_url?: string;
  total_price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  service_id: number;
  rating: number;
  content: string;
  author_name: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read";
  created_at: string;
}

export interface Config {
  API_URL: string;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  CONTACT_EMAIL: string;
  CONTACT_PHONE: string;
  CONTACT_ADDRESS: string;
  ITEMS_PER_PAGE: number;
  ENABLE_ANALYTICS: boolean;
}

export interface AdminConfig extends Config {
  ADMIN_DASHBOARD_TITLE: string;
  LOG_RETENTION_DAYS: number;
  MAX_UPLOAD_SIZE_MB: number;
}

export interface DashboardSummary {
  new_orders: number;
  services: number;
  customers: number;
  revenue: number;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: number;
  quantity: number;
  size?: string;
  material?: string;
  notes?: string;
  design_file?: File;
} 