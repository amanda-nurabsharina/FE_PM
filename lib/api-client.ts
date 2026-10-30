import { UserProfile } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- CREATOR TASK WORKSPACE AUTH STORAGE ---
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('creator_token');
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('creator_token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('creator_token');
    localStorage.removeItem('creator_user');
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('creator_user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('creator_user', JSON.stringify(user));
    window.dispatchEvent(new Event('creator_user_updated'));
  }
}

// --- MASTER ADMIN SAAS PLATFORM AUTH STORAGE (COMPLETELY ISOLATED) ---
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('platform_admin_token');
}

export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('platform_admin_token', token);
  }
}

export function removeAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('platform_admin_token');
    localStorage.removeItem('platform_admin_user');
  }
}

export function getAdminStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('platform_admin_user');
  return user ? JSON.parse(user) : null;
}

export function setAdminStoredUser(user: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('platform_admin_user', JSON.stringify(user));
    window.dispatchEvent(new Event('platform_admin_user_updated'));
  }
}

// Request helper for CreatorTask workspace
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login?expired=true';
      }
    }
    throw new Error(json.message || 'Terjadi kesalahan sistem');
  }
  return json.data;
}

// Request helper for Master Admin Platform (uses isolated admin token)
async function adminRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      removeAdminToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login?expired=true';
      }
    }
    throw new Error(json.message || 'Terjadi kesalahan sistem');
  }
  return json.data;
}

export const api = {
  // Creator Workspace Auth (Scoped to creator_token)
  login: async (email: string, password: string, tenant_slug?: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenant_slug: tenant_slug || undefined }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login gagal');
    if (json.data?.user?.role === 'SUPER_ADMIN') {
      throw new Error('Akun Super Admin adalah akun pengelola SaaS. Silakan login melalui portal Master Admin (/admin/login).');
    }
    setToken(json.data.token);
    setStoredUser(json.data.user);
    return json.data;
  },


  // Master Admin Auth (Scoped to platform_admin_token - 100% ISOLATED)
  adminLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/platform/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Admin login gagal');
    if (json.data?.user?.role !== 'SUPER_ADMIN') {
      throw new Error('Akses ditolak: Hanya Master Platform Administrator yang dapat login ke portal ini.');
    }
    setAdminToken(json.data.token);
    setAdminStoredUser(json.data.user);
    return json.data;
  },

  adminLogout: () => {
    removeAdminToken();
  },


  logout: () => {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Dashboard
  getDashboard: () => request('/creator/dashboard'),
  getMonths: () => request('/creator/months'),

  // Tasks
  getTasks: (params: { month?: number; year?: number; type?: string; status?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.month) q.set('month', String(params.month));
    if (params.year) q.set('year', String(params.year));
    if (params.type && params.type !== 'semua' && params.type !== 'all') q.set('type', params.type);
    if (params.status && params.status !== 'semua' && params.status !== 'all') q.set('status', params.status);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request(`/creator/tasks?${q.toString()}`);
  },

  getTaskById: (id: number) => request(`/creator/tasks/${id}`),

  createTask: (data: any) => request('/creator/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateTask: (id: number, data: any) => request(`/creator/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateTaskStatus: (id: number, status: string) => request(`/creator/tasks/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  toggleChecklist: (taskId: number, itemId: number) => request(`/creator/tasks/${taskId}/checklist/${itemId}/toggle`, {
    method: 'POST',
  }),

  markTaskPaid: (taskId: number, payment_proof_url: string, payment_proof_name: string, tax_rate?: number) => request(`/creator/tasks/${taskId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ payment_proof_url, payment_proof_name, tax_rate }),
  }),

  deleteTask: (id: number) => request(`/creator/tasks/${id}`, {
    method: 'DELETE',
  }),

  // Invoices
  getInvoices: (params: { month?: number; year?: number; status?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.month) q.set('month', String(params.month));
    if (params.year) q.set('year', String(params.year));
    if (params.status && params.status !== 'semua' && params.status !== 'all') q.set('status', params.status);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request(`/creator/invoices?${q.toString()}`);
  },

  getInvoiceById: (id: number) => request(`/creator/invoices/${id}`),

  createInvoice: (data: any) => request('/creator/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  toggleInvoiceTax: (id: number) => request(`/creator/invoices/${id}/toggle-tax`, {
    method: 'PATCH',
  }),

  markInvoicePaid: (id: number, payment_proof_url: string, payment_proof_name: string) => request(`/creator/invoices/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ payment_proof_url, payment_proof_name }),
  }),

  // Cashflow
  getCashflow: (params: { month?: number; year?: number; type?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.month) q.set('month', String(params.month));
    if (params.year) q.set('year', String(params.year));
    if (params.type && params.type !== 'semua' && params.type !== 'all') q.set('type', params.type);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request(`/creator/cashflow?${q.toString()}`);
  },

  createTransaction: (data: any) => request('/creator/cashflow', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  deleteTransaction: (id: number) => request(`/creator/cashflow/${id}`, {
    method: 'DELETE',
  }),

  // Reports
  getReports: (params: { month?: number; year?: number; type?: string; page?: number; limit?: number; all?: boolean } = {}) => {
    const q = new URLSearchParams();
    if (params.month !== undefined && params.month > 0) q.set('month', String(params.month));
    if (params.year !== undefined && params.year > 0) q.set('year', String(params.year));
    if (params.type && params.type !== 'semua' && params.type !== 'all') q.set('type', params.type);
    if (params.page !== undefined && params.page > 0) q.set('page', String(params.page));
    if (params.limit !== undefined && params.limit !== null) q.set('limit', String(params.limit));
    if (params.all) q.set('all', 'true');
    return request(`/creator/reports?${q.toString()}`);
  },

  // Settings
  getSettings: () => request('/creator/settings'),
  updateSettings: (data: any) => request('/creator/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  changePassword: (data: { old_password?: string; new_password: string }) => request('/creator/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // User Management (Super Admin)
  getUsers: () => request('/creator/users'),
  createUser: (data: any) => request('/creator/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id: number, data: any) => request(`/creator/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id: number) => request(`/creator/users/${id}`, {
    method: 'DELETE',
  }),

  // Role Management
  getRoles: () => request('/creator/roles'),
  createRole: (data: any) => request('/creator/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRole: (id: number, data: any) => request(`/creator/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRole: (id: number) => request(`/creator/roles/${id}`, {
    method: 'DELETE',
  }),

  // Audit Logs
  getAuditLogs: (params: { module?: string; search?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.module && params.module !== 'semua' && params.module !== 'all') q.set('module', params.module);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request(`/creator/audit-logs?${q.toString()}`);
  },

  // Media Upload
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/creator/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Platform & Multi-Tenant Management (Authenticated with platform_admin_token)
  getTenants: () => adminRequest('/platform/tenants'),
  getTenantById: (id: number) => adminRequest(`/platform/tenants/${id}`),
  createTenant: (data: any) => adminRequest('/platform/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTenantStatus: (id: number, status: 'active' | 'suspended') => adminRequest(`/platform/tenants/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  resetTenantOwnerPassword: (id: number, new_password: string) => adminRequest(`/platform/tenants/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ new_password }),
  }),
};
