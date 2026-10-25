'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAdminToken, getAdminStoredUser, api } from '@/lib/api-client';
import { UserProfile } from '@/lib/types';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    const user = getAdminStoredUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      api.adminLogout();
      router.replace('/admin/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router, isLoginPage, pathname]);

  const handleAdminLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari Portal Master Admin?')) {
      api.adminLogout();
      router.replace('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs font-mono font-medium">Verifikasi Sesi Platform Admin...</span>
        </div>
      </div>
    );
  }

  // If on login page, render raw children without the admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Master Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Master Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-900">CreatorTask</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase tracking-wider">
                  Master Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                SaaS Multi-Tenancy Management Portal
              </p>
            </div>
          </div>

          {/* Center: System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100/80 border border-slate-200 rounded-full text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Multi-Tenant DB Engine:</span>
            <span className="font-mono text-emerald-700 font-bold">Active & Isolated</span>
          </div>

          {/* Right: User Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Admin Badge */}
            <div className="flex items-center gap-2.5 pl-2 py-1 pr-3 bg-slate-100 hover:bg-slate-200/60 border border-slate-200 rounded-full transition-colors">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'Master Admin'}
                </div>
                <div className="text-[9px] text-indigo-600 font-mono font-bold uppercase tracking-wider">
                  Super Admin
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleAdminLogout}
              title="Keluar dari Master Portal"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CreatorTask Multi-Tenancy Architecture • Master Administration Console</span>
          <span className="font-mono text-[11px] text-slate-400">PostgreSQL Isolated Schema Scoping</span>
        </div>
      </footer>
    </div>
  );
}
