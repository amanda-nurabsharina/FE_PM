'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, CheckSquare } from 'lucide-react';
import { api } from '@/lib/api-client';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskCreateModal({ isOpen, onClose, onSuccess }: TaskCreateModalProps) {
  const [taskType, setTaskType] = useState<'endorse' | 'barter' | 'other'>('endorse');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [feeOrValue, setFeeOrValue] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [deliverable, setDeliverable] = useState('');
  const [platform, setPlatform] = useState('');
  const [shipmentNumber, setShipmentNumber] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState('draft');
  const [brief, setBrief] = useState('');
  const [checklist, setChecklist] = useState<string[]>(['Terima Produk', 'Shooting Draft']);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddChecklist = () => {
    if (newChecklistText.trim()) {
      setChecklist([...checklist, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  const handleRemoveChecklist = (idx: number) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul tugas wajib diisi');
      return;
    }

    if (taskType !== 'other' && !brand.trim()) {
      setError('Nama brand wajib diisi untuk Endorse & Barter');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTask({
        type: taskType,
        title,
        brand: taskType === 'other' ? 'Internal Studio' : brand,
        fee_or_value: taskType === 'other' ? 0 : Number(feeOrValue) || 0,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        deliverable,
        platform,
        shipment_number: shipmentNumber,
        pic_name: picName,
        pic_phone: picPhone,
        priority,
        status,
        brief,
        checklist,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tugas baru');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Tambah Tugas Baru</h3>
            <p className="text-xs text-slate-500">Pilih tipe tugas untuk menyesuaikan formulir</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* Type Selector (3 Buttons) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Tipe Tugas / Kampanye</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaskType('endorse')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  taskType === 'endorse'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Endorse Campaign
              </button>
              <button
                type="button"
                onClick={() => setTaskType('barter')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  taskType === 'barter'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Barter Konten
              </button>
              <button
                type="button"
                onClick={() => setTaskType('other')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  taskType === 'other'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tugas Lainnya
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas / Kampanye *</label>
            <input
              type="text"
              required
              placeholder={taskType === 'endorse' ? 'Contoh: Endorse TikTok Serum Somethinc' : taskType === 'barter' ? 'Contoh: Review Erha Acne Spot Gel' : 'Contoh: Setup Lighting Studio & Rig'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Brand & Fee (Only Endorse & Barter) */}
          {taskType !== 'other' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Brand / Klien *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Somethinc Official"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {taskType === 'endorse' ? 'Fee Endorse (IDR)' : 'Valuasi Barang Barter (IDR)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="0"
                  value={feeOrValue || ''}
                  onChange={(e) => setFeeOrValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Deadline & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Prioritas</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="high">Tinggi (High Priority)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="low">Rendah (Low)</option>
              </select>
            </div>
          </div>

          {/* Conditional: Deliverable for Endorse */}
          {taskType === 'endorse' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deliverable Konten</label>
              <input
                type="text"
                placeholder="Contoh: 1x TikTok Video 60s + Keranjang Kuning"
                value={deliverable}
                onChange={(e) => setDeliverable(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Conditional: Platform & Resi for Barter */}
          {taskType === 'barter' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform Tayang</label>
                <input
                  type="text"
                  placeholder="Contoh: TikTok & IG Reels"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Resi Sample</label>
                <input
                  type="text"
                  placeholder="Contoh: JNT-882910221"
                  value={shipmentNumber}
                  onChange={(e) => setShipmentNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* PIC Contact */}
          {taskType !== 'other' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama PIC Brand</label>
                <input
                  type="text"
                  placeholder="Nama perwakilan brand"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp PIC</label>
                <input
                  type="text"
                  placeholder="+62 8..."
                  value={picPhone}
                  onChange={(e) => setPicPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Brief */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instruksi / Brief Pengerjaan</label>
            <textarea
              rows={2}
              placeholder="Catatan script, poin wajib, atau dos and don'ts..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Dynamic Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Checklist Tahapan Kerja</label>
            <div className="space-y-2 mb-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-700 font-medium truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah tahapan kerja..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3.5 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
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
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Tugas'}
          </button>
        </div>
      </div>
    </div>
  );
}
