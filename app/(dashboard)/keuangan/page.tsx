'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Wallet } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Transaction, PageMeta, MonthOption } from '@/lib/types';
import CashflowHero from '@/components/keuangan/CashflowHero';
import CashflowCard from '@/components/keuangan/CashflowCard';
import TransactionCreateModal from '@/components/keuangan/TransactionCreateModal';
import LightboxModal from '@/components/common/LightboxModal';
import Pagination from '@/components/common/Pagination';

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('0-0');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PageMeta>({ current_page: 1, per_page: 4, total_items: 0, total_pages: 1 });
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_cashflow: 0 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string>('');

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadCashflow();
  }, [selectedMonth, selectedType, page]);

  const loadMonths = async () => {
    try {
      const data = await api.getMonths();
      setMonths(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCashflow = async () => {
    setLoading(true);
    try {
      const [m, y] = selectedMonth.split('-').map(Number);
      const data = await api.getCashflow({
        month: m > 0 ? m : undefined,
        year: y > 0 ? y : undefined,
        type: selectedType,
        page,
        limit: 4, // BR-01
      });
      setTransactions(data.items || []);
      setMeta(data.pagination);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi biaya ini?')) {
      try {
        await api.deleteTransaction(id);
        loadCashflow();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus transaksi');
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Pencatatan Cashflow & Keuangan</h2>
          <p className="text-xs text-slate-500 font-medium">
            Buku besar arus kas studio memisahkan pemasukan otomatis dan pengeluaran biaya operasional.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Catat Biaya
        </button>
      </div>

      {/* 2. Bilah Filter Periode Bulan */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Filter Periode Bulan:</span>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
        >
          <option value="0-0">Semua Bulan</option>
          {months.map((m) => (
            <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Hero Card Arus Kas Bersih & Ringkasan */}
      <CashflowHero
        income={summary.total_income}
        expense={summary.total_expense}
        net={summary.net_cashflow}
      />

      {/* 4. Filter Tipe Transaksi Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            setSelectedType('all');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
            selectedType === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua ({meta.total_items})
        </button>

        <button
          onClick={() => {
            setSelectedType('income');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
            selectedType === 'income'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Masuk (Income)
        </button>

        <button
          onClick={() => {
            setSelectedType('expense');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
            selectedType === 'expense'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Keluar (Expense)
        </button>
      </div>

      {/* 5. Riwayat Transaksi Kas (Maksimal 4 per Halaman) */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Memuat mutasi kas...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada mutasi transaksi kas</h4>
          <p className="text-xs text-slate-400">Catat biaya baru atau sesuaikan filter periode Anda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <CashflowCard
              key={tx.id}
              tx={tx}
              onDelete={handleDelete}
              onViewProof={(url) => setLightboxUrl(url)}
            />
          ))}

          {/* Paginasi 4 Item */}
          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Modals */}
      <TransactionCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          loadCashflow();
          loadMonths();
        }}
      />

      <LightboxModal
        isOpen={!!lightboxUrl}
        onClose={() => setLightboxUrl('')}
        imageUrl={lightboxUrl}
        title="Foto Bukti Transaksi / Nota Kuitansi"
      />
    </div>
  );
}
