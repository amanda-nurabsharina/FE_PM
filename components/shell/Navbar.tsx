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
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md shadow-indigo-200 shrink-0">
            CT
          </div>
          <div className="hidden md:block">
            <h1 className="font-bold text-slate-900 leading-tight text-sm">CreatorTask</h1>
            <p className="text-[10px] text-slate-500 font-medium">Workspace</p>
          </div>
        </div>

        {/* Center: Dynamic Page Title */}
        <div className="text-center min-w-0 px-1">
          <h2 className="text-xs sm:text-base font-bold text-slate-800 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {title}
          </h2>
        </div>

        {/* Right: User Profile & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-indigo-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex flex-col text-left hidden sm:flex">
              <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate leading-tight">
                {user?.name || 'Pengguna'}
              </span>
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider leading-none">
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
