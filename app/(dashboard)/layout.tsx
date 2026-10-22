'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/shell/Navbar';
import BottomTabBar from '@/components/shell/BottomTabBar';
import { getToken, api } from '@/lib/api-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [unpaidCount, setUnpaidCount] = useState<number>(0);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
    } else {
      setAuthChecked(true);
      fetchBadgeCount();
    }
  }, [router, pathname]);

  const fetchBadgeCount = async () => {
    try {
      const data = await api.getInvoices({ status: 'unpaid', limit: 1 });
      setUnpaidCount(data.unpaid_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const getPageTitle = (path: string) => {
    if (path.startsWith('/beranda')) return 'Dashboard Utama';
    if (path.startsWith('/tugas')) return 'Pusat Tugas';
    if (path.startsWith('/laporan')) return 'Laporan & Rekapitulasi';
    if (path.startsWith('/invoice')) return 'Generator Invoice';
    if (path.startsWith('/keuangan')) return 'Pencatatan Keuangan';
    if (path.startsWith('/pengaturan')) return 'Pengaturan & Profil';
    return 'Dashboard Utama';
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-28">
      {/* Sticky Top Header */}
      <Navbar title={getPageTitle(pathname)} />

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 py-5 flex-1">
        {children}
      </main>

      {/* Floating Pill Dock */}
      <BottomTabBar unpaidCount={unpaidCount} />
    </div>
  );
}
