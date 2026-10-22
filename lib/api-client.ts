import { UserProfile } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
  }
}

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
    throw new Error(json.message || 'Terjadi kesalahan sistem');
  }
  return json.data;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login gagal');
    setToken(json.data.token);
    setStoredUser(json.data.user);
    return json.data;
  },

  quickLogin: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/quick-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Quick login gagal');
    setToken(json.data.token);
    setStoredUser(json.data.user);
    return json.data;
  },

  getQuickUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/quick-users`);
    const json = await res.json();
    return json.data || [];
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

  updateTaskStatus: (id: number, status: string) => request(`/creator/tasks/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  toggleChecklist: (taskId: number, itemId: number) => request(`/creator/tasks/${taskId}/checklist/${itemId}/toggle`, {
    method: 'POST',
  }),

  markTaskPaid: (taskId: number, payment_proof_url: string, payment_proof_name: string) => request(`/creator/tasks/${taskId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ payment_proof_url, payment_proof_name }),
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
  getReports: (params: { month?: number; year?: number; type?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.month) q.set('month', String(params.month));
    if (params.year) q.set('year', String(params.year));
    if (params.type && params.type !== 'semua') q.set('type', params.type);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request(`/creator/reports?${q.toString()}`);
  },

  // Settings
  getSettings: () => request('/creator/settings'),
  updateSettings: (data: any) => request('/creator/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
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
};
