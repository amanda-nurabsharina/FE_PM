'use client';

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '@/lib/api-client';

interface TransactionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: TransactionCreateModalProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Produksi Konten');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const expenseCategories = [
    'Produksi Konten',
    'Iklan & Boost (Ads)',
    'Peralatan & Gear',
    'Tim & Editor',
    'Pengiriman & Logistik',
    'Operasional Lainnya',
  ];

  const incomeCategories = [
    'Pembayaran Endorse',
    'Komisi Affiliate',
    'Pemasukan Lainnya',
  ];

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('Nominal transaksi harus lebih dari Rp 0');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi transaksi wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      let attachmentUrl = '';
      let attachmentName = '';

      if (file) {
        const uploadRes = await api.uploadFile(file);
        attachmentUrl = uploadRes.url;
        attachmentName = uploadRes.filename;
      }

      await api.createTransaction({
        type,
        amount: Number(amount),
        description,
        category,
        date,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Catat Transaksi Kas</h3>
            <p className="text-xs text-slate-500">Mencatat biaya operasional atau pemasukan kas mandiri</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* Type Toggle: Pengeluaran (Biaya) vs Pemasukan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(expenseCategories[0]);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pengeluaran (Biaya)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(incomeCategories[0]);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pemasukan Kas
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nominal (IDR) *</label>
            <input
              type="number"
              min="1000"
              step="10000"
              required
              placeholder="0"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Keperluan *</label>
            <input
              type="text"
              required
              placeholder={type === 'expense' ? 'Contoh: Sewa Kamera & Lighting' : 'Contoh: Bonus Komisi Brand'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Foto Bukti / Nota (Opsional)</label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-slate-50/60">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex items-center gap-3 text-left">
                  <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">{file?.name}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-1">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">Pilih berkas nota / kuitansi</span>
                </div>
              )}
            </div>
          </div>
        </form>

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
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
}
