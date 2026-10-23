'use client';

import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { api, getStoredUser } from '@/lib/api-client';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getStoredUser());

    const handleUpdate = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('creator_user_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('creator_user_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari CreatorTask?')) {
      api.logout();
    }
  };

  const roleLabel = user?.role_name || (user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role || 'Staff');

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
            CT
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-900 leading-tight">CreatorTask</h1>
            <p className="text-[11px] text-slate-500 font-medium">Workspace</p>
          </div>
        </div>

        {/* Center: Dynamic Page Title */}
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">{title}</h2>
        </div>

        {/* Right: User Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-indigo-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 max-w-[110px] truncate hidden md:inline leading-tight">
                {user?.name || 'Pengguna'}
              </span>
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider hidden md:inline leading-none">
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar"
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
