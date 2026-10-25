'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building,
  Mail,
  Phone,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { api, getAdminStoredUser } from '@/lib/api-client';
import { Tenant, UserProfile } from '@/lib/types';

export default function MasterAdminTenantsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    phone: '',
    company_address: '',
    npwp: '',
    tax_rate: 11,
    bank_name: 'BCA',
    bank_account_number: '',
    bank_account_holder: '',
  });
  const [creating, setCreating] = useState(false);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const user = getAdminStoredUser();
    setCurrentUser(user);
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTenants();
      setTenants(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugify = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setCreateForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === handleSlugify(prev.name) || !prev.slug ? handleSlugify(val) : prev.slug,
    }));
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.slug) {
      setError('Nama studio dan slug wajib diisi');
      return;
    }
    if (!createForm.owner_name || !createForm.owner_email || !createForm.owner_password) {
      setError('Nama owner, email, dan password wajib diisi');
      return;
    }
    if (createForm.owner_password.length < 6) {
      setError('Password owner minimal 6 karakter');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await api.createTenant({
        ...createForm,
        tax_rate: Number(createForm.tax_rate) || 11,
      });
      setSuccessToast(`Tenant "${createForm.name}" dan Owner "${createForm.owner_name}" berhasil dibuat!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        slug: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        phone: '',
        company_address: '',
        npwp: '',
        tax_rate: 11,
        bank_name: 'BCA',
        bank_account_number: '',
        bank_account_holder: '',
      });
      loadTenants();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat tenant');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'active' ? 'mengaktifkan kembali' : 'menonaktifkan (suspend)';
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} tenant "${tenant.name}"? Pengguna di workspace ini ${nextStatus === 'suspended' ? 'tidak akan dapat login' : 'akan dapat login kembali'}.`)) {
      return;
    }

    try {
      await api.updateTenantStatus(tenant.id, nextStatus);
      setSuccessToast(`Status tenant "${tenant.name}" diubah menjadi ${nextStatus}.`);
      loadTenants();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setResetting(true);
    setError('');
    try {
      await api.resetTenantOwnerPassword(selectedTenant.id, newPassword);
      setSuccessToast(`Password owner untuk tenant "${selectedTenant.name}" berhasil direset!`);
      setIsResetModalOpen(false);
      setNewPassword('');
      setSelectedTenant(null);
    } catch (err: any) {
      setError(err.message || 'Gagal mereset password owner');
    } finally {
      setResetting(false);
    }
  };

  const copyLoginLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/login?tenant=${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.owner_email && t.owner_email.toLowerCase().includes(search.toLowerCase())) ||
      (t.owner_name && t.owner_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const totalUsers = tenants.reduce((acc, t) => acc + (t.total_users || 0), 0);
  const totalTasks = tenants.reduce((acc, t) => acc + (t.total_tasks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Banner - Light Enterprise Theme */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Portal Master Super Admin • Multi-Tenancy SaaS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Manajemen Tenant & Akun Awal Owner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Kanal khusus Master Administrator untuk membuat tenant studio/agency baru,
              menginisialisasi akun Owner (default user), dan memantau pemisahan data tiap tenant secara terpusat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={loadTenants}
              disabled={loading}
              className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 transition-all flex items-center justify-center shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setError('');
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Buat Tenant Baru
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats - Light Mode Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Tenant Terdaftar</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalTenants}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{activeTenants} Aktif</span> • {totalTenants - activeTenants} Suspended
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Pengguna Seluruh Studio</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalUsers}</div>
          <p className="text-[11px] text-slate-500 mt-1">Owner & staf kreatif aktif</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Proyek Kampanye</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalTasks}</div>
          <p className="text-[11px] text-slate-500 mt-1">Akumulasi seluruh tenant</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Isolasi Multi-Tenancy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            100% Terisolasi
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scoped TenantID & Atomic Locking</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tenant, slug, nama owner, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'active', 'suspended'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st === 'active' ? 'Aktif' : 'Suspended'}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table / Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-medium flex flex-col items-center gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
            <span>Memuat direktori tenant dari database...</span>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs space-y-2">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Tidak ada tenant ditemukan</p>
            <p className="text-slate-400">Sesuaikan filter pencarian atau buat tenant baru.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTenants.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-6 hover:bg-slate-50/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Studio & Owner info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 font-black text-xl shrink-0 shadow-xs">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {t.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-bold">
                        slug: {t.slug}
                      </span>
                      {t.status === 'active' ? (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          Suspended
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        Owner: <span className="font-bold text-slate-900">{t.owner_name || 'Reza Winata'}</span> ({t.owner_email || 'reza@studio.id'})
                      </span>
                      {t.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {t.phone}
                        </span>
                      )}
                      {t.npwp && (
                        <span>NPWP: {t.npwp}</span>
                      )}
                    </div>

                    {t.bank_name && t.bank_account_number && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {t.bank_name} {t.bank_account_number} a.n {t.bank_account_holder || t.owner_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Stats & Action buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2 text-center">
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-xs font-black text-slate-800">{t.total_users || 1}</div>
                      <div className="text-[10px] text-slate-400">Users</div>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-xs font-black text-indigo-600">{t.total_tasks || 0}</div>
                      <div className="text-[10px] text-slate-400">Tasks</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy Direct Link */}
                    <button
                      onClick={() => copyLoginLink(t.slug)}
                      title="Salin Link Login Workspace Tenant"
                      className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-200"
                    >
                      {copiedSlug === t.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Link Login</span>
                        </>
                      )}
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={() => {
                        setError('');
                        setSelectedTenant(t);
                        setNewPassword('');
                        setIsResetModalOpen(true);
                      }}
                      title="Reset Password Owner"
                      className="p-2 sm:px-3 sm:py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Reset Pass</span>
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(t)}
                      title={t.status === 'active' ? 'Suspend Tenant' : 'Aktifkan Tenant'}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        t.status === 'active'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {t.status === 'active' ? 'Suspend' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Buat Tenant Baru - Light Mode */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Buat Tenant & Akun Awal Owner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inisialisasi workspace terisolasi dan buat akun Super Admin (Owner) awal.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              {/* Bagian 1: Data Studio / Tenant */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80 space-y-3">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  1. Informasi Studio / Brand Tenant
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Studio / Agency *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Neon Creative Studio"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Slug Workspace ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.slug}
                      onChange={(e) => setCreateForm({ ...createForm, slug: handleSlugify(e.target.value) })}
                      placeholder="e.g. neon-creative"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-indigo-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+62 812-xxxx-xxxx"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tarif PPN Default (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={createForm.tax_rate}
                      onChange={(e) => setCreateForm({ ...createForm, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alamat Lengkap Perusahaan
                  </label>
                  <input
                    type="text"
                    value={createForm.company_address}
                    onChange={(e) => setCreateForm({ ...createForm, company_address: e.target.value })}
                    placeholder="Jl. Thamrin No. 10, Jakarta Pusat"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Bagian 2: Akun Owner Utama */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  2. Akun Owner Utama (Super Admin Tenant)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Lengkap Owner *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.owner_name}
                      onChange={(e) => setCreateForm({ ...createForm, owner_name: e.target.value })}
                      placeholder="e.g. Budi Santoso"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Login Owner *
                    </label>
                    <input
                      type="email"
                      required
                      value={createForm.owner_email}
                      onChange={(e) => setCreateForm({ ...createForm, owner_email: e.target.value })}
                      placeholder="owner@neon.id"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password Awal *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.owner_password}
                    onChange={(e) => setCreateForm({ ...createForm, owner_password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Owner dapat mengganti password ini kapan saja melalui menu Pengaturan workspace mereka.
                  </p>
                </div>
              </div>

              {/* Bagian 3: Rekening Pembayaran */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  3. Rekening Pencairan & Pembayaran
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Bank</label>
                    <input
                      type="text"
                      value={createForm.bank_name}
                      onChange={(e) => setCreateForm({ ...createForm, bank_name: e.target.value })}
                      placeholder="BCA / Mandiri"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={createForm.bank_account_number}
                      onChange={(e) => setCreateForm({ ...createForm, bank_account_number: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Atas Nama</label>
                    <input
                      type="text"
                      value={createForm.bank_account_holder}
                      onChange={(e) => setCreateForm({ ...createForm, bank_account_holder: e.target.value })}
                      placeholder="Nama pemilik rekening"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {creating ? 'Memproses...' : 'Buat Tenant & Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password Owner - Light Mode */}
      {isResetModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                Reset Password Owner
              </h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <p className="font-bold">Tenant: {selectedTenant.name}</p>
              <p className="text-[11px] text-amber-700">
                Owner Email: <span className="font-mono">{selectedTenant.owner_email || 'reza@studio.id'}</span>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Baru *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-200 transition-all disabled:opacity-50"
                >
                  {resetting ? 'Menyimpan...' : 'Perbarui Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
