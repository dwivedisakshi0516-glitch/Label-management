import axios from 'axios';
import {
  User,
  Category,
  Manufacturer,
  CustomerCare,
  Warranty,
  Product,
  LabelTemplate,
  SavedLabel,
  AppSettings,
  DashboardStats
} from '../types';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
const isBrowserOnLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isConfiguredForLocalhost =
  typeof configuredApiUrl === 'string' &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\/?$/i.test(configuredApiUrl);

const API_BASE_URL = isConfiguredForLocalhost && !isBrowserOnLocalhost
  ? '/api'
  : configuredApiUrl || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rit_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for token expiration / unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: handle auth expiration if needed
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Categories Services
export interface PaginatedCategoriesResponse {
  items: Category[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export const categoriesApi = {
  getAll: async (search?: string): Promise<Category[]> => {
    const res = await api.get('/categories', { params: { search } });
    return res.data;
  },
  getPage: async (params: {
    search?: string;
    page: number;
    page_size: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
  }): Promise<PaginatedCategoriesResponse> => {
    const res = await api.get('/categories', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        page_size: data.length || params.page_size,
        total_pages: 1,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      };
    }
    if (Array.isArray(data?.value)) {
      return {
        items: data.value,
        total: Number(data.Count ?? data.value.length),
        page: 1,
        page_size: data.value.length || params.page_size,
        total_pages: 1,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      };
    }
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      total: Number(data?.total ?? 0),
      page: Number(data?.page ?? params.page),
      page_size: Number(data?.page_size ?? params.page_size),
      total_pages: Number(data?.total_pages ?? 1),
      sort_by: data?.sort_by || params.sort_by,
      sort_order: data?.sort_order === 'desc' ? 'desc' : 'asc',
    };
  },
  create: async (data: Partial<Category>): Promise<Category> => {
    const res = await api.post('/categories', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

// Manufacturers Services
export const manufacturersApi = {
  getAll: async (search?: string): Promise<Manufacturer[]> => {
    const res = await api.get('/manufacturers', { params: { search } });
    return res.data;
  },
  create: async (data: Partial<Manufacturer>): Promise<Manufacturer> => {
    const res = await api.post('/manufacturers', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Manufacturer>): Promise<Manufacturer> => {
    const res = await api.put(`/manufacturers/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/manufacturers/${id}`);
    return res.data;
  },
};

// Customer Care Services
export const customerCareApi = {
  getAll: async (search?: string): Promise<CustomerCare[]> => {
    const res = await api.get('/customer-care', { params: { search } });
    return res.data;
  },
  create: async (data: Partial<CustomerCare>): Promise<CustomerCare> => {
    const res = await api.post('/customer-care', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CustomerCare>): Promise<CustomerCare> => {
    const res = await api.put(`/customer-care/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/customer-care/${id}`);
    return res.data;
  },
};

// Warranties Services
export const warrantiesApi = {
  getAll: async (search?: string): Promise<Warranty[]> => {
    const res = await api.get('/warranties', { params: { search } });
    return res.data;
  },
  create: async (data: Partial<Warranty>): Promise<Warranty> => {
    const res = await api.post('/warranties', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Warranty>): Promise<Warranty> => {
    const res = await api.put(`/warranties/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/warranties/${id}`);
    return res.data;
  },
};

// Products Services
export const productsApi = {
  getAll: async (params?: { search?: string; category_id?: string; category_name?: string }): Promise<Product[]> => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Product> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post('/products', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

// Templates Services
export const templatesApi = {
  getAll: async (categoryId?: string): Promise<LabelTemplate[]> => {
    const res = await api.get('/templates', { params: { category_id: categoryId } });
    return res.data;
  },
  create: async (data: Partial<LabelTemplate>): Promise<LabelTemplate> => {
    const res = await api.post('/templates', data);
    return res.data;
  },
  update: async (id: string, data: Partial<LabelTemplate>): Promise<LabelTemplate> => {
    const res = await api.put(`/templates/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/templates/${id}`);
    return res.data;
  },
};

// Saved Labels Services
export const labelsApi = {
  getAll: async (params?: { search?: string; category_id?: string }): Promise<SavedLabel[]> => {
    const res = await api.get('/labels', { params });
    return res.data;
  },
  getById: async (id: string): Promise<SavedLabel> => {
    const res = await api.get(`/labels/${id}`);
    return res.data;
  },
  create: async (data: Partial<SavedLabel>): Promise<SavedLabel> => {
    const res = await api.post('/labels', data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/labels/${id}`);
    return res.data;
  },
};

// Settings Services
export const settingsApi = {
  get: async (): Promise<AppSettings> => {
    const res = await api.get('/settings');
    return res.data;
  },
  update: async (data: Partial<AppSettings>): Promise<AppSettings> => {
    const res = await api.put('/settings', data);
    return res.data;
  },
};

// Dashboard Services
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};

export default api;
