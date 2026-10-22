'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserCheck, ShieldCheck } from 'lucide-react';
import { api, getToken } from '@/lib/api-client';
import { UserProfile } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('reza@studio.id');
  const [password, setPassword] = useState('password123');
  const [quickUsers, setQuickUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getToken()) {
      router.replace('/beranda');
    } else {
      api.getQuickUsers().then(setQuickUsers).catch(console.error);
    }
  }, [router]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(email, password);
      router.replace('/beranda');
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setError('');
    setLoading(true);
    try {
      await api.quickLogin(userEmail);
      router.replace('/beranda');
    } catch (err: any) {
      setError(err.message || 'Quick login gagal');
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

        {/* Quick Profile Switcher (SRS 5.1 FR-LGN-02) */}
        {quickUsers.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 block">
              Pilih Akun Cepat (Quick Login Demo):
            </label>
            <div className="space-y-2">
              {quickUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleQuickLogin(u.email)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {u.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{u.company || u.email}</p>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            atau login manual
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-3.5">
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
