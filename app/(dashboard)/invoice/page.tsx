'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { api, getStoredUser, setStoredUser } from '@/lib/api-client';
import { Invoice, PageMeta, MonthOption, UserProfile } from '@/lib/types';
import InvoiceCard from '@/components/invoice/InvoiceCard';
import InvoiceCreateModal from '@/components/invoice/InvoiceCreateModal';
import InvoicePrintModal from '@/components/invoice/InvoicePrintModal';
import PaymentConfirmModal from '@/components/tugas/PaymentConfirmModal';
import LightboxModal from '@/components/common/LightboxModal';
import Pagination from '@/components/common/Pagination';

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('0-0');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PageMeta>({ current_page: 1, per_page: 4, total_items: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  // Counts
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payTargetInvoice, setPayTargetInvoice] = useState<Invoice | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string>('');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const user = getStoredUser();

  useEffect(() => {
    api.getSettings().then((data) => {
      if (data) {
        setCurrentUser(data);
        setStoredUser(data);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [selectedMonth, selectedStatus, page]);

  const loadMonths = async () => {
    try {
      const data = await api.getMonths();
      setMonths(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const [m, y] = selectedMonth.split('-').map(Number);
      const data = await api.getInvoices({
        month: m > 0 ? m : undefined,
        year: y > 0 ? y : undefined,
        status: selectedStatus,
        page,
        limit: 4, // BR-01
      });
      setInvoices(data.items || []);
      setMeta(data.pagination);

      // Count for status chips
      const allInvs: Invoice[] = data.items || [];
      const paid = allInvs.filter((i) => i.status === 'paid').length;
      const unpaid = allInvs.filter((i) => i.status !== 'paid').length;
      setPaidCount(paid);
      setUnpaidCount(unpaid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (inv: Invoice) => {
    setPrintInvoice(inv);
    setIsPrintOpen(true);
  };

  const handlePay = (inv: Invoice) => {
    setPayTargetInvoice(inv);
    setIsPayOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Generator Invoice & Tagihan</h2>
          <p className="text-xs text-slate-500 font-medium">
            Tagihan komisi affiliate & endorse dengan tarif PPN {user?.tax_rate !== undefined ? user.tax_rate : 11}%, PIC klien, dan status pembayaran.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tambah Invoice
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

      {/* 3. Tiga Chip Filter Status */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            setSelectedStatus('all');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
            selectedStatus === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua ({meta.total_items})
        </button>

        <button
          onClick={() => {
            setSelectedStatus('paid');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
            selectedStatus === 'paid'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Lunas (Paid)
        </button>

        <button
          onClick={() => {
            setSelectedStatus('unpaid');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
            selectedStatus === 'unpaid'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Pending
        </button>
      </div>

      {/* 4. Daftar Kartu Invoice (Maksimal 4 Kartu) */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Memuat data invoice...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">
            {selectedStatus === 'unpaid'
              ? 'Tidak ada invoice pending'
              : selectedStatus === 'paid'
              ? 'Tidak ada invoice lunas'
              : 'Tidak ada invoice ditemukan'}
          </h4>
          <p className="text-xs text-slate-400">Terbitkan invoice baru atau sesuaikan filter Anda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onPreview={handlePreview}
              onPay={handlePay}
              onViewProof={(url) => setLightboxUrl(url)}
              onRefresh={loadInvoices}
            />
          ))}

          {/* Paginasi 4 Item */}
          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Modals */}
      <InvoiceCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          loadInvoices();
          loadMonths();
        }}
      />

      <InvoicePrintModal
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintInvoice(null);
        }}
        invoice={printInvoice}
        owner={currentUser || user}
        onInvoiceUpdated={() => loadInvoices()}
      />

      <PaymentConfirmModal
        isOpen={isPayOpen}
        onClose={() => {
          setIsPayOpen(false);
          setPayTargetInvoice(null);
        }}
        targetInvoice={payTargetInvoice}
        onSuccess={() => {
          loadInvoices();
        }}
      />

      <LightboxModal
        isOpen={!!lightboxUrl}
        onClose={() => setLightboxUrl('')}
        imageUrl={lightboxUrl}
        title="Foto Bukti Pembayaran Invoice"
      />
    </div>
  );
}
