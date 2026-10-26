'use client';

import React from 'react';
import { Invoice, UserProfile } from '@/lib/types';
import { formatIDR, formatDateID } from '@/lib/formatters';

interface InvoiceSheetA4Props {
  invoice: Invoice;
  owner: UserProfile;
}

export default function InvoiceSheetA4({ invoice, owner }: InvoiceSheetA4Props) {
  const isPaid = invoice.status === 'paid';

  return (
    <div
      id="printable-invoice-modal"
      className="bg-white text-slate-900 w-full max-w-[210mm] mx-auto p-8 sm:p-12 font-sans text-xs flex flex-col justify-between"
      style={{ minHeight: '297mm' }}
    >
      <div>
        {/* Kop Surat Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-start gap-4">
            {owner.logo_url ? (
              <img
                src={owner.logo_url}
                alt={owner.company || 'Studio'}
                className="w-14 h-14 object-contain rounded-lg border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                {owner.company ? owner.company.substring(0, 2).toUpperCase() : 'CT'}
              </div>
            )}
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {owner.company || 'Creator Studio'}
              </h2>
              <p className="text-slate-600 font-medium text-[11px] mt-0.5">{owner.name} • {owner.phone || '-'}</p>
              {(owner.npwp || owner.no_ktp) && (
                <div className="flex items-center gap-2 flex-wrap text-slate-500 text-[10px] font-mono mt-0.5">
                  {owner.npwp && <span>NPWP: {owner.npwp}</span>}
                  {owner.npwp && owner.no_ktp && <span>•</span>}
                  {owner.no_ktp && <span>NIK/KTP: {owner.no_ktp}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-black text-indigo-900 tracking-wider">INVOICE</h1>
            <p className="font-mono font-bold text-xs text-slate-700 mt-1">{invoice.invoice_number}</p>
            <div className="mt-2">
              {isPaid ? (
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] tracking-wider uppercase border border-emerald-300">
                  LUNAS / PAID
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-md bg-amber-100 text-amber-800 font-black text-[10px] tracking-wider uppercase border border-amber-300">
                  MENUNGGU PEMBAYARAN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Client & Date Info */}
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ditagihkan Kepada:
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{invoice.client_name}</h4>
            {invoice.client_email && <p className="text-slate-600 text-xs mt-0.5">{invoice.client_email}</p>}
            {invoice.client_phone && <p className="text-slate-600 text-xs">{invoice.client_phone}</p>}
            {invoice.client_address && (
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{invoice.client_address}</p>
            )}
          </div>

          <div className="text-right space-y-1">
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-400 font-medium">Tanggal Terbit:</span>
              <span className="font-bold text-slate-800">{formatDateID(invoice.issue_date)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-400 font-medium">Jatuh Tempo:</span>
              <span className="font-bold text-slate-800">{formatDateID(invoice.due_date)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-400 font-medium">Status Pajak:</span>
              <span className="font-semibold text-slate-800">
                {invoice.include_tax ? `PPN ${invoice.tax_rate}%` : 'Tanpa PPN'}
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

        {/* Calculation Box */}
        <div className="flex justify-end mb-8">
          <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-800">{formatIDR(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PPN ({invoice.tax_rate}%):</span>
              <span className="font-mono font-bold text-slate-800">{formatIDR(invoice.tax_amount)}</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-black text-indigo-900">
              <span>TOTAL TAGIHAN:</span>
              <span className="font-mono text-base">{formatIDR(invoice.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Bank Instructions & Signature */}
      <div className="avoid-break pt-6 border-t-2 border-slate-200">
        <div className="grid grid-cols-2 gap-8 items-end">
          {/* Bank Instructions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Instruksi Pembayaran Transfer Bank:
            </h5>
            <p className="font-bold text-slate-800">{owner.bank_name || 'Bank Central Asia (BCA)'}</p>
            <p className="font-mono text-base font-black text-indigo-700 tracking-wider my-0.5">
              {owner.bank_account_number || '8830192831'}
            </p>
            <p className="text-slate-600 text-xs">a.n {owner.bank_account_holder || owner.name}</p>
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
