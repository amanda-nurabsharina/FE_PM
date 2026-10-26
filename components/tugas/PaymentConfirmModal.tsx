'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Task, Invoice } from '@/lib/types';
import { formatIDR } from '@/lib/formatters';
import { api, getStoredUser, setStoredUser } from '@/lib/api-client';

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTask?: Task | null;
  targetInvoice?: Invoice | null;
  onSuccess: () => void;
}

export default function PaymentConfirmModal({
  isOpen,
  onClose,
  targetTask,
  targetInvoice,
  onSuccess,
}: PaymentConfirmModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [linkedInvoice, setLinkedInvoice] = useState<Invoice | null>(targetInvoice || null);
  const [currentTaxRate, setCurrentTaxRate] = useState<number>(() => {
    const user = getStoredUser();
    return user?.tax_rate !== undefined ? Number(user.tax_rate) : 0;
  });

  useEffect(() => {
    if (isOpen) {
      api.getSettings().then((data) => {
        if (data && data.tax_rate !== undefined) {
          setCurrentTaxRate(Number(data.tax_rate));
          setStoredUser(data);
        }
      }).catch(console.error);

      if (targetInvoice) {
        setLinkedInvoice(targetInvoice);
      } else if (targetTask?.related_invoice_id) {
        api.getInvoiceById(targetTask.related_invoice_id)
          .then((inv) => setLinkedInvoice(inv))
          .catch(console.error);
      } else {
        setLinkedInvoice(null);
      }
    } else {
      setFile(null);
      setPreviewUrl('');
      setError('');
    }
  }, [isOpen, targetInvoice, targetTask]);

  if (!isOpen) return null;

  // Read values directly from invoice if available (PPN aktif/tidak, tarif, total - Poin 9 Revisi)
  const effectiveInvoice = targetInvoice || linkedInvoice;

  let subtotal = 0;
  let taxRate = currentTaxRate;
  let isTaxActive = false;
  let taxAmount = 0;
  let grandTotal = 0;

  if (effectiveInvoice) {
    subtotal = effectiveInvoice.subtotal;
    taxRate = effectiveInvoice.tax_rate !== undefined ? effectiveInvoice.tax_rate : currentTaxRate;
    isTaxActive = Boolean(effectiveInvoice.include_tax && effectiveInvoice.tax_rate > 0);
    taxAmount = isTaxActive ? (effectiveInvoice.tax_amount || 0) : 0;
    grandTotal = isTaxActive ? effectiveInvoice.grand_total : effectiveInvoice.subtotal;
  } else if (targetTask) {
    subtotal = targetTask.fee_or_value;
    taxRate = currentTaxRate;
    isTaxActive = currentTaxRate > 0;
    taxAmount = isTaxActive ? Math.round((subtotal * currentTaxRate) / 100) : 0;
    grandTotal = subtotal + taxAmount;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError('Ukuran berkas melebihi batas 2 MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleConfirmPaid = async () => {
    setSubmitting(true);
    setError('');

    try {
      let uploadedUrl = '';
      let uploadedName = '';

      if (file) {
        const uploadRes = await api.uploadFile(file);
        uploadedUrl = uploadRes.url;
        uploadedName = uploadRes.filename;
      } else {
        // Fallback default placeholder proof if no file chosen
        uploadedUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
        uploadedName = 'bukti_transfer.jpg';
      }

      if (targetTask) {
        const passTaxRate = isTaxActive ? taxRate : 0;
        await api.markTaskPaid(targetTask.id, uploadedUrl, uploadedName, passTaxRate);
      } else if (targetInvoice) {
        await api.markInvoicePaid(targetInvoice.id, uploadedUrl, uploadedName);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pelunasan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Konfirmasi Pelunasan</h3>
              <p className="text-[11px] text-slate-500">Memicu sinkronisasi 4 modul otomatis (BR-07)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* Target Info */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[11px] text-slate-500 font-semibold block">Target Tagihan / Kampanye:</span>
            <p className="text-xs font-bold text-slate-900">
              {targetTask ? `${targetTask.brand} - ${targetTask.title}` : targetInvoice?.client_name}
            </p>
            {effectiveInvoice && (
              <div className="flex items-center gap-2">
                <span className="inline-block text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {effectiveInvoice.invoice_number}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  • {isTaxActive ? `PPN ${taxRate}% Aktif` : 'Tanpa PPN'}
                </span>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal Fee</span>
              <span className="font-mono font-semibold">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>{isTaxActive ? `PPN (${taxRate}%)` : taxRate === 0 ? 'PPN (0%)' : 'Tanpa PPN'}</span>
              <span className="font-mono font-semibold">{formatIDR(taxAmount)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold text-emerald-400">
              <span>Total Pelunasan</span>
              <span className="font-mono text-base">{formatIDR(grandTotal)}</span>
            </div>
          </div>

          {/* Upload Proof */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Unggah Foto Bukti Transfer / Resi Pembayaran
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/60">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex items-center gap-3 text-left">
                  <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">{file?.name}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Berkas siap diunggah</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Pilih foto bukti transfer</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP (Maksimal 2 MB)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={submitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Memproses Cascade...' : 'Konfirmasi & Tandai Lunas'}
          </button>
        </div>
      </div>
    </div>
  );
}
