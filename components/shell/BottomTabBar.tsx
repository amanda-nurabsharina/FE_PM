'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, CheckSquare, BarChart3, FileText, Wallet, Settings } from 'lucide-react';

interface BottomTabBarProps {
  unpaidCount?: number;
}

export default function BottomTabBar({ unpaidCount = 0 }: BottomTabBarProps) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Beranda', href: '/beranda', icon: LayoutGrid },
    { label: 'Tugas', href: '/tugas', icon: CheckSquare },
    { label: 'Laporan', href: '/laporan', icon: BarChart3 },
    { label: 'Invoice', href: '/invoice', icon: FileText, badge: unpaidCount },
    { label: 'Keuangan', href: '/keuangan', icon: Wallet },
    { label: 'Setting', href: '/pengaturan', icon: Settings },
  ];

  return (
    <nav
      id="floating-dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-full flex items-center gap-1 sm:gap-3 transition-all"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-col items-center justify-center min-w-[52px] sm:min-w-[62px] py-1.5 px-1 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-0.5 shadow-xs" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
