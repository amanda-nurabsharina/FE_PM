'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatIDR, formatDateID } from '@/lib/formatters';

interface CashflowCardProps {
  tx: Transaction;
  onDelete: (id: number) => void;
  onViewProof: (url: string) => void;
}

export default function CashflowCard({ tx, onDelete, onViewProof }: CashflowCardProps) {
  const isIncome = tx.type === 'income';
  const isLinkedToInvoice = !!tx.related_invoice_id; // BR-09: Delete button hidden if linked to invoice

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between gap-3">
      {/* Icon & Details */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isIncome ? <ArrowUpRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded-md bg-slate-100">
              {tx.category}
            </span>
            {isLinkedToInvoice && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Pelunasan Invoice
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{tx.description}</h4>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
            {formatDateID(tx.date)}
          </span>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span
            className={`text-sm sm:text-base font-black font-mono block ${
              isIncome ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isIncome ? `+ ${formatIDR(tx.amount)}` : `- ${formatIDR(tx.amount)}`}
          </span>

          {tx.attachment_url && (
            <button
              onClick={() => onViewProof(tx.attachment_url!)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center justify-end gap-1 mt-0.5"
            >
              Lihat Bukti <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Delete Button (BR-09: Strictly hidden for invoice-linked income) */}
        {!isLinkedToInvoice ? (
          <button
            onClick={() => onDelete(tx.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus transaksi"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center" title="Terkunci: berasal dari invoice">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
        )}
      </div>
    </div>
  );
}
