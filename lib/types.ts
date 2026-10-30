export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  logo_url?: string;
  phone?: string;
  company_address?: string;
  npwp?: string;
  no_ktp?: string;
  tax_rate: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  owner_id?: number;
  owner_name?: string;
  owner_email?: string;
  total_users?: number;
  total_tasks?: number;
  created_at: string;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
  phone?: string;
  company_address?: string;
  npwp?: string;
  no_ktp?: string;
  tax_rate?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
}

export interface UserProfile {
  id: number;
  tenant_id?: number;
  tenant_slug?: string;
  tenant_name?: string;
  is_owner?: boolean;
  tenant?: Tenant;
  name: string;
  email: string;
  avatar_url?: string;
  company?: string;
  phone?: string;
  company_address?: string;
  npwp?: string;
  no_ktp?: string;
  tax_rate: number;
  logo_url?: string;
  signature_url?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  role?: string;
  role_name?: string;
  allowed_menus?: string[];
  owner_id?: number | null;
  created_at?: string;
}

export interface RoleItem {
  id: number;
  code: string;
  name: string;
  description: string;
  menus: string[];
  is_system?: boolean;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  role_name?: string;
  allowed_menus: string[];
  owner_id?: number | null;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  task_id: number;
  text: string;
  completed: boolean;
}

export interface Task {
  id: number;
  user_id: number;
  type: 'endorse' | 'barter' | 'other';
  title: string;
  brand: string;
  fee_or_value: number;
  due_date: string;
  deliverable?: string;
  platform?: string;
  shipment_number?: string;
  pic_name?: string;
  pic_phone?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'waiting_payment' | 'paid' | 'posting' | 'completed';
  brief?: string;
  payment_proof_url?: string;
  payment_proof_name?: string;
  related_invoice_id?: number;
  checklist?: ChecklistItem[];
  created_at?: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: number;
  user_id: number;
  related_task_id?: number;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  include_tax: boolean;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  status: 'unpaid' | 'paid' | 'pending';
  payment_proof_url?: string;
  payment_proof_name?: string;
  items?: InvoiceItem[];
}

export interface Transaction {
  id: number;
  user_id: number;
  related_invoice_id?: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  attachment_url?: string;
  attachment_name?: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  actor: string;
  module: string;
  action: string;
  title: string;
  detail?: string;
  created_at: string;
}

export interface PageMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface MonthOption {
  month: number;
  year: number;
  label: string;
}

export interface DashboardData {
  estimated_total_value: number;
  real_cash_balance: number;
  active_tasks_count: number;
  unpaid_invoices_count: number;
  unpaid_invoices_total: number;
  cashflow_this_month: {
    total_income: number;
    total_expense: number;
    net_cashflow: number;
  };
  top_agenda_tasks: Task[];
  pending_invoices: Invoice[];
}

export interface ReportRow {
  index: number;
  task_id: number;
  project_brand: string;
  type: string;
  invoice_number: string;
  value: number;
  status: string;
  payment_proof_url?: string;
  payment_proof_name?: string;
  attachment_label: string;
  due_date: string;
}

export interface ReportExpenseItem {
  index: number;
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface ReportData {
  period_label: string;
  filter_type: string;
  total_projects: number;
  total_fee_revenue: number;
  total_paid: number;
  total_unpaid: number;
  barter_valuation: number;
  total_expense?: number;
  net_income?: number;
  expenses?: ReportExpenseItem[];
  projects: ReportRow[];
  pagination: PageMeta;
}
