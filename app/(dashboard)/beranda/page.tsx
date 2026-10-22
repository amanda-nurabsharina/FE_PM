'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, ArrowUpRight, ArrowDownRight, FileText, CheckSquare, Wallet, BarChart3, Sparkles } from 'lucide-react';
import { api, getStoredUser } from '@/lib/api-client';
import { DashboardData } from '@/lib/types';
import { formatIDR } from '@/lib/formatters';

export default function BerandaPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const user = getStoredUser();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Memuat ringkasan dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Hero Card (Dark Gradient matching Mockup) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] text-white shadow-xl border border-indigo-950/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-base flex items-center justify-center border-2 border-indigo-400">
                {user?.name ? user.name.charAt(0) : 'R'}
              </div>
            )}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Dashboard Creator & Affiliator
              </span>
              <h3 className="text-lg font-black text-white mt-1">{user?.name || 'Reza Winata'}</h3>
            </div>
          </div>

          <Link
            href="/pengaturan"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>

        {/* 2 Sub-metrics on Hero */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-indigo-900/40">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Total Kas Bersih</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatIDR(data.real_cash_balance)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Tugas Aktif</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {data.active_tasks_count} Agenda
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pintasan Aksi Cepat (3 Tombol Kotak) */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/tugas"
          className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 font-bold">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Tugas</h4>
            <span className="text-[10px] text-slate-400 font-medium">Endorse / Barter</span>
          </div>
        </Link>

        <Link
          href="/invoice"
          className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Invoice</h4>
            <span className="text-[10px] text-slate-400 font-medium">Buat tagihan</span>
          </div>
        </Link>

        <Link
          href="/keuangan"
          className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 font-bold">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Biaya</h4>
            <span className="text-[10px] text-slate-400 font-medium">Catat nota</span>
          </div>
        </Link>
      </div>

      {/* 3. Banner Laporan & Rekapitulasi Project Bulanan */}
      <Link
        href="/laporan"
        className="p-4 bg-linear-to-r from-indigo-50 via-purple-50/50 to-white rounded-2xl border border-indigo-100/90 shadow-2xs hover:shadow-md hover:border-indigo-200 flex items-center justify-between gap-3 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Laporan & Rekapitulasi Project Bulanan
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Lihat daftar project, invoice, total fee bulan ini & cetak/download PDF
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-indigo-400 shrink-0" />
      </Link>

      {/* 4. AGENDA TUGAS & ENDORSE */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              AGENDA TUGAS & ENDORSE
            </h4>
          </div>
          <Link href="/tugas" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
            Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {data.top_agenda_tasks && data.top_agenda_tasks.length > 0 ? (
            data.top_agenda_tasks.map((task) => (
              <Link
                key={task.id}
                href="/tugas"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors block"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 block mb-0.5">
                    {task.type.toUpperCase()} • {task.brand}
                  </span>
                  <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</h5>
                </div>
                {task.fee_or_value > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {formatIDR(task.fee_or_value)}
                  </span>
                )}
              </Link>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">Semua tugas telah diselesaikan!</div>
          )}
        </div>
      </div>

      {/* 5. CASHFLOW BULAN INI */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              CASHFLOW BULAN INI
            </h4>
          </div>
          <Link href="/keuangan" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
            Detail <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Pemasukan
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-600 block">
              {formatIDR(data.cashflow_this_month?.total_income || 0)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 mb-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Pengeluaran
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-rose-600 block">
              {formatIDR(data.cashflow_this_month?.total_expense || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. INVOICE BELUM LUNAS */}
      {data.pending_invoices && data.pending_invoices.length > 0 && (
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                INVOICE BELUM LUNAS
              </h4>
            </div>
            <Link href="/invoice" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {data.pending_invoices.map((inv) => (
              <Link
                key={inv.id}
                href="/invoice"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors block"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 block mb-0.5">
                    {inv.invoice_number}
                  </span>
                  <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{inv.client_name}</h5>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {formatIDR(inv.grand_total)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
