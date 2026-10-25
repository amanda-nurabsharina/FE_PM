'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { api, getToken, getStoredUser, removeToken } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [showTenantInput, setShowTenantInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user && user.role !== 'SUPER_ADMIN') {
      router.replace('/beranda');
    } else {
      if (user?.role === 'SUPER_ADMIN') {
        removeToken();
      }
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tenant');
        if (t) {
          setTenantSlug(t);
          setShowTenantInput(true);
        }
      }
    }
  }, [router]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email.toLowerCase().includes('superadmin')) {
      setError('Akun Super Admin adalah akun pengelola platform SaaS. Silakan login melalui portal Master Admin (/admin/login).');
      return;
    }

    setLoading(true);

    try {
      await api.login(email, password, tenantSlug);
      router.replace('/beranda');
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6">
        {/* Branding Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            CT
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-4 tracking-tight">CreatorTask</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manajemen Kampanye Endorse, Invoice & Keuangan Kreator
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-3.5">
          {tenantSlug ? (
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-semibold">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Workspace: <span className="font-mono font-bold">{tenantSlug}</span>
              </span>
              <button
                type="button"
                onClick={() => setTenantSlug('')}
                className="text-slate-400 hover:text-slate-700 text-xs px-1"
                title="Hapus slug workspace"
              >
                ✕
              </button>
            </div>
          ) : showTenantInput ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Workspace / Slug Tenant (Opsional)</label>
                <button
                  type="button"
                  onClick={() => setShowTenantInput(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Sembunyikan
                </button>
              </div>
              <input
                type="text"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value.toLowerCase().trim())}
                placeholder="e.g. reza-studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-indigo-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowTenantInput(true)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Masuk ke workspace/tenant tertentu
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Pemilik / Studio *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reza@studio.id"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Memvalidasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400">
          <span>Dilindungi JWT & Enkripsi Hash Bcrypt (BE_PM)</span>
        </div>
      </div>
    </div>
  );
}
