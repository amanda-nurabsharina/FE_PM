'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { formatIDR } from '@/lib/formatters';

interface CashflowHeroProps {
  income: number;
  expense: number;
  net: number;
}

export default function CashflowHero({ income, expense, net }: CashflowHeroProps) {
  const isSurplus = net >= 0;

  return (
    <div className="space-y-3">
      {/* Hero Card: Net Cashflow */}
      <div
        className={`p-6 rounded-3xl border transition-all text-white shadow-xl ${
          isSurplus
            ? 'bg-linear-to-br from-emerald-950 via-slate-900 to-emerald-900 border-emerald-800/40 shadow-emerald-950/20'
            : 'bg-linear-to-br from-rose-950 via-slate-900 to-rose-900 border-rose-800/40 shadow-rose-950/20'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Arus Kas Bersih (Net Cashflow)
          </span>
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              isSurplus ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isSurplus ? 'Surplus Operasional' : 'Defisit Operasional'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white my-1">
          {formatIDR(net)}
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Total pemasukan dikurangi seluruh pengeluaran biaya periode terpilih
        </p>
      </div>

      {/* 2 Column Grid: Total Pemasukan vs Total Pengeluaran */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pemasukan */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Total Pemasukan</span>
          </div>
          <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 block">
            {formatIDR(income)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Uang masuk terverifikasi</span>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold mb-1">
            <ArrowDownRight className="w-4 h-4" />
            <span>Total Pengeluaran</span>
          </div>
          <span className="text-lg sm:text-xl font-black font-mono text-rose-600 block">
            {formatIDR(expense)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Biaya & operasional</span>
        </div>
      </div>
    </div>
  );
}
