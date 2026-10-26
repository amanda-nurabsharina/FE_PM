'use client';

import React from 'react';
import { UserProfile, ReportRow } from '@/lib/types';
import { formatIDR, formatDateID } from '@/lib/formatters';

interface ReportSheetOneProps {
  owner: UserProfile;
  periodLabel: string;
  coopFilter: string;
  totalProjects: number;
  totalRevenue: number;
  totalPaid: number;
  totalUnpaid: number;
  rows: ReportRow[];
}

export default function ReportSheetOne({
  owner,
  periodLabel,
  coopFilter,
  totalProjects,
  totalRevenue,
  totalPaid,
  totalUnpaid,
  rows,
}: ReportSheetOneProps) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const safeRows = rows || [];
  const paidCount = safeRows.filter((r) => r.status === 'LUNAS').length;
  const pendingCount = safeRows.filter((r) => r.status !== 'LUNAS').length;

  return (
    <div className="bg-white text-slate-900 w-full max-w-[210mm] mx-auto p-8 sm:p-12 font-sans text-xs flex flex-col justify-between" style={{ minHeight: '297mm' }}>
      <div>
        {/* Kop Surat Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-5">
          <div className="flex items-start gap-3.5">
            {owner.logo_url ? (
              <img
                src={owner.logo_url}
                alt={owner.company}
                className="w-12 h-12 object-contain rounded-lg border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                {owner.company ? owner.company.substring(0, 2).toUpperCase() : 'CT'}
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {owner.company || 'Creator Studio'}
              </h2>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">Laporan Rekapitulasi Proyek & Keuangan</p>
              <p className="text-[10px] text-slate-500 max-w-sm">{owner.company_address || '-'}</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-slate-900 text-white rounded-md">
              Periode: {periodLabel}
            </span>
            {(owner.npwp || owner.no_ktp) && (
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 font-mono mt-0.5 justify-end">
                {owner.npwp && <span>NPWP: {owner.npwp}</span>}
                {owner.npwp && owner.no_ktp && <span>•</span>}
                {owner.no_ktp && <span>NIK: {owner.no_ktp}</span>}
              </div>
            )}
          </div>
        </div>

        {/* 4 Kotak KPI */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Proyek
            </span>
            <span className="text-sm font-black text-slate-900">{totalProjects} Agenda</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Nilai Fee
            </span>
            <span className="text-sm font-black text-indigo-700 font-mono">{formatIDR(totalRevenue)}</span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Sudah Dibayar
            </span>
            <span className="text-sm font-black text-emerald-600 font-mono">{formatIDR(totalPaid)}</span>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
              Belum Lunas
            </span>
            <span className="text-sm font-black text-amber-600 font-mono">{formatIDR(totalUnpaid)}</span>
          </div>
        </div>

        {/* Tabel Rekapitulasi 7 Kolom */}
        <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
          <table className="w-full text-left border-collapse table-fixed text-[11px]">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2 px-2 text-center w-[5%]">No</th>
                <th className="py-2 px-3 w-[31%]">Proyek / Brand</th>
                <th className="py-2 px-2 text-center w-[10%]">Tipe</th>
                <th className="py-2 px-2 text-left w-[18%]">No. Invoice</th>
                <th className="py-2 px-3 text-right w-[18%]">Nilai (IDR)</th>
                <th className="py-2 px-2 text-center w-[10%]">Status</th>
                <th className="py-2 px-2 text-center w-[8%]">Lmp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {safeRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Tidak ada data proyek pada periode ini
                  </td>
                </tr>
              ) : (
                safeRows.map((row, idx) => (
                  <tr key={row.task_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-500">{row.index}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 break-words">{row.project_brand}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-[10px] text-slate-600">{row.invoice_number}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatIDR(row.value)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                          row.status === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-indigo-700">{row.attachment_label}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td colSpan={4} className="py-2.5 px-3 text-right text-slate-700">
                  Total Nilai Keseluruhan:
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-900 text-xs">
                  {formatIDR(totalRevenue)}
                </td>
                <td colSpan={2} className="py-2.5 px-2 text-center text-[10px] text-slate-500">
                  {paidCount} Lunas • {pendingCount} Pending
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pengesahan & Tanda Tangan */}
      <div className="avoid-break pt-6 border-t-2 border-slate-200">
        <div className="grid grid-cols-2 gap-8 items-end">
          <div className="text-slate-500 text-[10px] leading-relaxed">
            <h5 className="font-bold text-slate-700 uppercase tracking-wider mb-1">Catatan Dokumen:</h5>
            <p>
              Laporan ini digenerate secara otomatis oleh sistem manajemen CreatorTask untuk keperluan arsip
              perpajakan, rekonsiliasi arus kas keuangan, dan lampiran resmi kerja sama brand.
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[11px] text-slate-600 font-medium">Jakarta, {currentDate}</span>
            <span className="text-xs font-bold text-slate-800 mt-1 mb-2">Pemilik / Affiliator Creator,</span>
            <div className="h-16 flex items-center justify-end">
              {owner.signature_url ? (
                <img src={owner.signature_url} alt="Signature" className="h-14 object-contain" />
              ) : (
                <div className="text-slate-300 italic text-[11px] border-b border-dashed border-slate-300 px-6 py-1">
                  ( Tanda Tangan Digital )
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-900 border-t border-slate-400 pt-1 px-4 mt-1">
              {owner.name}
            </span>
            <span className="text-[10px] text-slate-500">{owner.company || 'Creator Studio'}</span>
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-slate-400">
          Dokumen Resmi CreatorTask • Laporan Rekapitulasi Proyek • Halaman 1
        </div>
      </div>
    </div>
  );
}
