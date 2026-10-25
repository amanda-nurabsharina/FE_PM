'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, Lock, Mail, ArrowLeft, KeyRound, AlertCircle, Shield } from 'lucide-react';
import { api, getAdminToken, getAdminStoredUser } from '@/lib/api-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@creatortask.id');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAdminToken();
    const user = getAdminStoredUser();
    if (token && user?.role === 'SUPER_ADMIN') {
      router.replace('/admin/tenants');
    }
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.adminLogin(email, password);
      router.replace('/admin/tenants');
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      {/* Master Login Card - Clean Light Mode */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Portal Master Admin SaaS
          </h1>
          <p className="text-xs text-slate-500">
            Kanal khusus pengelola platform untuk inisialisasi tenant baru, pengelolaan akun owner, dan pengawasan multi-tenancy.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Master Admin *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@creatortask.id"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Master Admin *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Mengautentikasi Master Admin...' : 'Masuk ke Portal Admin'}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Kredensial Super Admin Platform:</span>
          </div>
          <p className="font-mono text-slate-800">
            Email: <span className="font-bold text-indigo-700">superadmin@creatortask.id</span> • Pass: <span className="font-bold text-indigo-700">password123</span>
          </p>
          <p className="text-[10px] text-slate-400">
            * Reza Winata (<span className="font-mono">reza@studio.id</span>) adalah akun user owner di aplikasi kreator.
          </p>
        </div>

        {/* Security watermark */}
        <div className="text-center text-[10px] text-slate-400 font-mono">
          <span>Protected by AES-256 JWT & PostgreSQL Isolated Schema</span>
        </div>
      </div>
    </div>
  );
}
