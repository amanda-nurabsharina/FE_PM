'use client';

import React from 'react';
import { ReportRow } from '@/lib/types';
import { formatIDR } from '@/lib/formatters';

interface ReportSheetTwoProps {
  periodLabel: string;
  rowsWithProof: ReportRow[];
}

export default function ReportSheetTwo({ periodLabel, rowsWithProof }: ReportSheetTwoProps) {
  const safeProof = rowsWithProof || [];
  if (safeProof.length === 0) return null;

  return (
    <div
      className="page-break bg-white text-slate-900 w-full max-w-[210mm] mx-auto p-8 sm:p-12 font-sans text-xs flex flex-col justify-between"
      style={{ minHeight: '297mm' }}
    >
      <div>
        {/* Header Lembar 2 */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              LAMPIRAN BUKTI PEMBAYARAN / TRANSFER RESMI
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Dokumentasi Bukti Transfer Terverifikasi • Periode: {periodLabel}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-md">
              Total {safeProof.length} Bukti Transfer
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">LEMBAR 2 (LAMPIRAN)</p>
          </div>
        </div>

        {/* 2-Column Grid for Proof Cards (SRS 6.3) */}
        <div className="grid grid-cols-2 gap-4">
          {safeProof.map((item) => (
            <div
              key={item.task_id}
              className="avoid-break p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Lampiran {item.attachment_label}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{item.project_brand}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">{formatIDR(item.value)}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Invoice: {item.invoice_number}</span>
                <span>Due: {item.due_date}</span>
              </div>

              {/* Photo Display */}
              <div className="h-52 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                {item.payment_proof_url ? (
                  <img
                    src={item.payment_proof_url}
                    alt={item.project_brand}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-xs italic">Tidak ada pratinjau gambar</div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200 text-slate-400 font-medium">
                <span className="truncate max-w-[140px]">{item.payment_proof_name || 'bukti_bayar.jpg'}</span>
                <span className="text-emerald-700 font-bold">✓ Terverifikasi Lunas</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="avoid-break pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
        Dokumen Resmi CreatorTask • Standar Dokumen A4 • Lembar 2 (Lampiran Bukti Pembayaran)
      </div>
    </div>
  );
}
