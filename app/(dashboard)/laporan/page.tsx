'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Calendar, FileText, ExternalLink, History, ChevronUp, X, CheckSquare } from 'lucide-react';
import { api, getStoredUser } from '@/lib/api-client';
import { ReportData, UserProfile } from '@/lib/types';
import { formatIDR } from '@/lib/formatters';
import LightboxModal from '@/components/common/LightboxModal';
import Pagination from '@/components/common/Pagination';
import AuditLogDrawer from '@/components/common/AuditLogDrawer';
import ReportSheetOne from '@/components/pdf/ReportSheetOne';
import ReportSheetTwo from '@/components/pdf/ReportSheetTwo';

export default function LaporanPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [coopType, setCoopType] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // PDF Preview & Print modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string>('');
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  const user = getStoredUser();

  const months = [
    { value: 0, label: 'Semua Bulan' },
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = [2025, 2026, 2027];

  useEffect(() => {
    loadReport();
  }, [selectedMonth, selectedYear, coopType, page]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReports({
        month: selectedMonth > 0 ? selectedMonth : undefined,
        year: selectedYear > 0 ? selectedYear : undefined,
        type: coopType,
        page,
        limit: 4, // BR-01
      });
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const rowsWithProof = report ? report.projects.filter((p) => p.payment_proof_url) : [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Banner Header (Dark Gradient with Cetak PDF button) */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] text-white shadow-xl border border-indigo-950/60 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
              Laporan & Rekapitulasi
            </span>
            <span className="text-xs text-slate-400 font-medium">• {report?.period_label || 'Oktober 2026'}</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Rekapitulasi Project & Keuangan</h2>
          <p className="text-xs text-slate-400 mt-0.5">Ringkasan fee endorse/barter & ekspor PDF resmi.</p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto shrink-0"
        >
          <Printer className="w-4 h-4" /> Cetak PDF
        </button>
      </div>

      {/* 2. Toolbar Filter */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Top bar: Dropdown Month, Year, and Project count badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setPage(1); // BR-02
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setPage(1); // BR-02
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            {report?.total_projects || 0} Proyek
          </span>
        </div>

        {/* Bottom bar: Chips Semua | Endorse | Barter | Endorse + Barter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'endorse', label: 'Endorse' },
            { key: 'barter', label: 'Barter' },
            { key: 'endorse+barter', label: 'Endorse + Barter' },
          ].map((chip) => {
            const isActive = coopType === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => {
                  setCoopType(chip.key);
                  setPage(1); // BR-02
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Grid 4 KPI (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* TOTAL PROYEK */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            TOTAL PROYEK
          </span>
          <span className="text-xl font-black text-slate-900">{report?.total_projects || 0}</span>
          <span className="text-[11px] text-slate-400 font-medium">Agenda</span>
        </div>

        {/* TOTAL NILAI FEE */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            TOTAL NILAI FEE
          </span>
          <span className="text-xl font-black font-mono text-indigo-600">
            {formatIDR(report?.total_fee_revenue || 0)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Termasuk PPN</span>
        </div>

        {/* SUDAH LUNAS */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              SUDAH LUNAS
            </span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
              {report?.projects.filter((p) => p.status === 'LUNAS').length || 0}
            </span>
          </div>
          <span className="text-xl font-black font-mono text-emerald-600">
            {formatIDR(report?.total_paid || 0)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Dana masuk kas</span>
        </div>

        {/* PENDING */}
        <div className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              PENDING
            </span>
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
              {report?.projects.filter((p) => p.status !== 'LUNAS').length || 0}
            </span>
          </div>
          <span className="text-xl font-black font-mono text-amber-600">
            {formatIDR(report?.total_unpaid || 0)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Tagihan menunggu</span>
        </div>
      </div>

      {/* 4. DAFTAR PROYEK & INVOICE */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            DAFTAR PROYEK & INVOICE
          </h4>
          <span className="text-xs text-slate-400 font-semibold">{report?.pagination.total_items || 0} Rincian</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Memuat rincian laporan...</div>
        ) : !report || report.projects.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">Tidak ada data proyek pada filter ini</div>
        ) : (
          <div className="space-y-3">
            {report.projects.map((proj) => {
              const isLunas = proj.status === 'LUNAS';

              return (
                <div
                  key={proj.task_id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">#{proj.index}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {proj.type.toUpperCase()}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        isLunas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">{proj.project_brand}</h5>

                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
                    <span>Inv: {proj.invoice_number}</span>
                    <span>•</span>
                    <span>{proj.due_date}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nilai Kerja Sama</span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        {formatIDR(proj.value)}
                      </span>
                    </div>

                    {proj.payment_proof_url ? (
                      <button
                        onClick={() => setLightboxUrl(proj.payment_proof_url!)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Bukti Bayar
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Tanpa lampiran</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination 4-item */}
            <Pagination meta={report.pagination} onPageChange={(p) => setPage(p)} />
          </div>
        )}
      </div>

      {/* 5. Pemicu Audit Log Bar di Bawah */}
      <div
        onClick={() => setIsAuditDrawerOpen(true)}
        className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Riwayat Aktivitas & Audit Log
            </h4>
            <p className="text-[11px] text-slate-400">Ketuk untuk membuka pop-up log riwayat sistem</p>
          </div>
        </div>

        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1">
          Buka <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Audit Log Bottom Sheet */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={!!lightboxUrl}
        onClose={() => setLightboxUrl('')}
        imageUrl={lightboxUrl}
        title="Foto Bukti Pembayaran Resmi"
      />

      {/* Fullscreen PDF Print & Preview Modal */}
      {isPrintModalOpen && user && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-100 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Toolbar (hidden on print) */}
            <div className="no-print px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Pratinjau Dokumen Laporan A4
                </h3>
                <p className="text-xs text-slate-500">Periode: {report.period_label}</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeAttachments}
                    onChange={(e) => setIncludeAttachments(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  Sertakan Lembar 2 (Lampiran Bukti Gambar)
                </label>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" /> Cetak / Simpan PDF
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50 flex flex-col items-center gap-6">
              <div id="printable-report-document" className="bg-white shadow-xl rounded-sm">
                <ReportSheetOne
                  owner={user}
                  periodLabel={report.period_label}
                  coopFilter={coopType}
                  totalProjects={report.total_projects}
                  totalRevenue={report.total_fee_revenue}
                  totalPaid={report.total_paid}
                  totalUnpaid={report.total_unpaid}
                  rows={report.projects}
                />

                {includeAttachments && rowsWithProof.length > 0 && (
                  <ReportSheetTwo
                    periodLabel={report.period_label}
                    rowsWithProof={rowsWithProof}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
