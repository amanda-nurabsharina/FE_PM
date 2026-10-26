'use client';

import React from 'react';
import { Invoice, UserProfile } from '@/lib/types';
import { formatIDR, formatDateID } from '@/lib/formatters';

interface InvoiceSheetA4Props {
  invoice: Invoice;
  owner: UserProfile;
  onToggleTax?: () => void;
  taxToggling?: boolean;
}

export default function InvoiceSheetA4({ invoice, owner, onToggleTax, taxToggling }: InvoiceSheetA4Props) {
  const isPaid = invoice.status === 'paid';
  const isTaxActive = Boolean(invoice.include_tax && invoice.tax_rate > 0 && (invoice.tax_amount > 0 || invoice.tax_rate > 0));
  const logoUrl = owner?.logo_url || owner?.tenant?.logo_url;
  const companyName = owner?.company || owner?.tenant?.name || 'Reza Studio';
  const companyAddress = owner?.company_address || owner?.tenant?.company_address || '';
  const phone = owner?.phone || owner?.tenant?.phone || '';
  const email = owner?.email || owner?.tenant?.owner_email || '';
  const effectiveNPWP = owner?.npwp || owner?.tenant?.npwp || '';
  const effectiveNIK = owner?.no_ktp || owner?.tenant?.no_ktp || '';

  return (
    <div
      id="printable-invoice-modal"
      className="bg-white text-slate-900 w-full max-w-[210mm] mx-auto p-8 sm:p-12 font-sans text-xs flex flex-col justify-between"
      style={{ minHeight: '297mm' }}
    >
      <div>
        {/* Kop Surat Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6 gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1 shrink-0 bg-white shadow-2xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
                {companyName ? companyName.substring(0, 2).toUpperCase() : 'CT'}
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {companyName}
              </h2>
              {companyAddress && (
                <p className="text-slate-600 text-[11px] leading-snug">
                  {companyAddress}
                </p>
              )}
              <div className="flex items-center gap-4 flex-wrap text-[11px] text-slate-600 pt-0.5">
                {phone && (
                  <span>
                    <strong className="text-slate-700">WA:</strong> {phone}
                  </span>
                )}
                {email && (
                  <span>
                    <strong className="text-slate-700">Email:</strong> {email}
                  </span>
                )}
              </div>
              {(effectiveNPWP || effectiveNIK) && (
                <div className="print:hidden flex items-center gap-4 flex-wrap text-[10px] font-mono text-slate-600 pt-0.5">
                  {effectiveNPWP && (
                    <span>
                      <strong className="font-sans text-slate-700">NPWP:</strong> {effectiveNPWP}
                    </span>
                  )}
                  {effectiveNIK && (
                    <span>
                      <strong className="font-sans text-slate-700">NIK:</strong> {effectiveNIK}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
              INVOICE TAGIHAN RESMI
            </span>
            <p className="font-mono font-bold text-sm text-slate-900 mt-0.5">{invoice.invoice_number}</p>
            <div className="text-[11px] text-slate-500 space-y-0.5 mt-1">
              <div>Tanggal Terbit: <span className="font-semibold text-slate-800">{formatDateID(invoice.issue_date)}</span></div>
              <div>Jatuh Tempo: <span className="font-semibold text-slate-800">{formatDateID(invoice.due_date)}</span></div>
            </div>
            <div className="mt-2.5">
              {isPaid ? (
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] tracking-wider uppercase border border-emerald-300">
                  LUNAS (PAID)
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-md bg-amber-100 text-amber-800 font-black text-[10px] tracking-wider uppercase border border-amber-300">
                  BELUM DIBAYAR (UNPAID)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Client & Date Info */}
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ditagihkan Kepada (Bill To):
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{invoice.client_name}</h4>
            {invoice.client_address && (
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{invoice.client_address}</p>
            )}
          </div>

          <div className="text-right space-y-1">
            {invoice.client_phone && (
              <p className="text-slate-700 text-xs font-medium">
                <span className="text-slate-400">PIC:</span> {invoice.client_phone}
              </p>
            )}
            {invoice.client_email && (
              <p className="text-slate-600 text-xs font-mono">{invoice.client_email}</p>
            )}
            <div className="flex justify-between sm:justify-end gap-4 pt-1">
              <span className="text-slate-400 font-medium">Status Pajak:</span>
              <span className="font-semibold text-slate-800">
                {isTaxActive ? `PPN ${invoice.tax_rate}%` : invoice.tax_rate === 0 ? 'PPN 0%' : 'Tanpa PPN'}
              </span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-400 font-medium">Mata Uang:</span>
              <span className="font-bold text-slate-800">IDR (Rupiah)</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4 w-[52%]">Deskripsi Pekerjaan / Layanan</th>
                <th className="py-2.5 px-3 text-center w-[10%]">Qty</th>
                <th className="py-2.5 px-4 text-right w-[19%]">Harga Satuan</th>
                <th className="py-2.5 px-4 text-right w-[19%]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((it, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{it.description}</td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">{it.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{formatIDR(it.unit_price)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatIDR(it.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    Tidak ada rincian item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Checkbox "Sertakan PPN (x%)" (Poin 9 Revisi - Review Dokumen Tagihan) */}
        {onToggleTax && (
          <div
            onClick={!isPaid && !taxToggling ? onToggleTax : undefined}
            className={`no-print p-3.5 mb-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between select-none transition-colors ${
              isPaid ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-100/70 cursor-pointer'
            }`}
          >
            <div>
              <span className="block text-xs font-bold text-slate-800">
                Sertakan PPN ({invoice.tax_rate !== undefined && invoice.tax_rate > 0 ? invoice.tax_rate : (owner?.tax_rate !== undefined ? owner.tax_rate : 11)}%):
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                Centang untuk menyertakan perhitungan pajak pada total tagihan
              </span>
            </div>
            <div className="flex items-center gap-2">
              {taxToggling && <span className="text-[10px] text-slate-400 animate-pulse">Menyimpan...</span>}
              <input
                type="checkbox"
                checked={isTaxActive}
                disabled={isPaid || taxToggling}
                onChange={onToggleTax}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Calculation Box */}
        <div className="flex justify-end mb-8">
          <div className="w-80 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal Tagihan:</span>
              <span className="font-mono font-bold text-slate-800">{formatIDR(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{isTaxActive ? `PPN (${invoice.tax_rate}%):` : invoice.tax_rate === 0 ? 'PPN (0%):' : 'Tanpa PPN:'}</span>
              <span className="font-mono font-bold text-slate-800">{formatIDR(isTaxActive ? (invoice.tax_amount || 0) : 0)}</span>
            </div>
            <div className="border-t border-slate-300 pt-2.5 flex justify-between text-sm font-black text-indigo-900">
              <span className="uppercase tracking-tight">TOTAL TAGIHAN (GRAND TOTAL):</span>
              <span className="font-mono text-base">{formatIDR(invoice.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Bank Instructions & Signature */}
      <div className="avoid-break pt-6 border-t-2 border-slate-200">
        <div className="grid grid-cols-2 gap-8 items-end">
          {/* Bank Instructions (SRS 6.4 Blok 5, BR-12, FR-PDF-10) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Instruksi Pembayaran Transfer Bank:
            </h5>
            <p className="font-bold text-slate-800">{owner.bank_name || 'Bank Central Asia (BCA)'}</p>
            <p className="font-mono text-base font-black text-indigo-700 tracking-wider my-0.5">
              {owner.bank_account_number || '8830192831'}
            </p>
            <p className="text-slate-600 text-xs">a.n {owner.bank_account_holder || owner.name}</p>

            {/* Legalitas Pajak (NPWP & NIK / KTP - BR-12, SRS 6.4 Blok 5, FR-PDF-10) */}
            {(effectiveNPWP || effectiveNIK) && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/90 text-[10px] text-slate-600 font-mono space-y-0.5">
                {effectiveNPWP && (
                  <div>
                    <span className="text-slate-500 font-sans">NPWP:</span> <span className="font-bold text-slate-800">{effectiveNPWP}</span>
                  </div>
                )}
                {effectiveNIK && (
                  <div>
                    <span className="text-slate-500 font-sans">NIK / KTP:</span> <span className="font-bold text-slate-800">{effectiveNIK}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-[10px] text-slate-400 italic mt-2">
              * Harap cantumkan nomor invoice <strong>{invoice.invoice_number}</strong> pada berita transfer.
            </p>
          </div>

          {/* Signature */}
          <div className="text-center flex flex-col items-center">
            <span className="text-[11px] text-slate-500 font-medium mb-1">Hormat Kami,</span>
            <span className="text-xs font-bold text-slate-800 mb-2">{owner.company || 'Creator Studio'}</span>
            <div className="h-20 flex items-center justify-center my-1">
              {owner.signature_url ? (
                <img src={owner.signature_url} alt="Signature" className="h-16 object-contain" />
              ) : (
                <div className="text-slate-300 italic text-xs border-b border-dashed border-slate-300 px-8 py-2">
                  ( Tanda Tangan Digital )
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-900 border-t border-slate-400 pt-1 px-4">
              {owner.name}
            </span>
            <span className="text-[10px] text-slate-500">Pemilik Studio / Affiliator</span>
          </div>
        </div>

        {/* Paid Verification Thumbnail */}
        {isPaid && invoice.payment_proof_url && (
          <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <img
                src={invoice.payment_proof_url}
                alt="Bukti Transfer"
                className="w-12 h-12 object-cover rounded-md border border-emerald-300"
              />
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                  Lampiran Bukti Pembayaran Terverifikasi
                </span>
                <p className="font-semibold text-slate-700">{invoice.payment_proof_name || 'bukti_transfer.jpg'}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700">✓ Lunas Terverifikasi</span>
          </div>
        )}

        <div className="mt-6 text-center text-[10px] text-slate-400">
          Dokumen Resmi CreatorTask • Standar Dokumen A4 • Halaman 1 dari 1
        </div>
      </div>
    </div>
  );
}
