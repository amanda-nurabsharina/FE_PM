'use client';

import React, { useState } from 'react';
import { Printer, CheckCircle2, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatIDR, formatShortDate } from '@/lib/formatters';
import { api } from '@/lib/api-client';

interface InvoiceCardProps {
  invoice: Invoice;
  onPreview: (inv: Invoice) => void;
  onPay: (inv: Invoice) => void;
  onViewProof: (url: string) => void;
  onRefresh: () => void;
}

export default function InvoiceCard({
  invoice,
  onPreview,
  onPay,
  onViewProof,
  onRefresh,
}: InvoiceCardProps) {
  const [toggling, setToggling] = useState(false);

  const isPaid = invoice.status === 'paid';

  const handleToggleTax = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPaid) return;

    setToggling(true);
    try {
      await api.toggleInvoiceTax(invoice.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status PPN');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col gap-3.5">
      {/* Top Header: Invoice Number & Status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {invoice.invoice_number}
            </span>
            <span className="text-xs text-slate-400 font-medium">• Due: {formatShortDate(invoice.due_date)}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-1.5">{invoice.client_name}</h4>
          {invoice.client_phone && (
            <p className="text-[11px] text-slate-500 font-medium">📞 PIC Klien: {invoice.client_phone}</p>
          )}
        </div>

        <div className="shrink-0">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> LUNAS (PAID)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> TERKIRIM
            </span>
          )}
        </div>
      </div>

      {/* Middle Row: PPN Quick Toggle & Grand Total */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">
            {invoice.include_tax && invoice.tax_rate > 0 ? `Total (Termasuk PPN ${invoice.tax_rate}%)` : 'Total (Tanpa PPN)'}
          </span>
          <span className="text-sm font-black font-mono text-slate-900">
            {formatIDR(invoice.grand_total)}
          </span>
        </div>

        {/* Quick Tax Toggle (BR-03, locked if paid) */}
        {!isPaid ? (
          <button
            type="button"
            onClick={handleToggleTax}
            disabled={toggling}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              invoice.include_tax && invoice.tax_rate > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {toggling ? '...' : invoice.include_tax && invoice.tax_rate > 0 ? `PPN ${invoice.tax_rate}% Aktif` : 'Tanpa PPN (0%)'}
          </button>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pajak Terkunci
          </span>
        )}
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div>
          {isPaid && invoice.payment_proof_url && (
            <button
              onClick={() => onViewProof(invoice.payment_proof_url!)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
            >
              Lihat Bukti Bayar <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(invoice)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Pratinjau
          </button>

          {!isPaid && (
            <button
              onClick={() => onPay(invoice)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shadow-emerald-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Lunas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
