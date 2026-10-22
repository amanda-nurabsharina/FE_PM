'use client';

import React, { useState } from 'react';
import { X, Check, Trash2, ExternalLink, ShieldCheck, Upload, AlertCircle } from 'lucide-react';
import { Task, ChecklistItem } from '@/lib/types';
import { formatIDR, formatDateID } from '@/lib/formatters';
import { api } from '@/lib/api-client';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onRefresh: () => void;
  onTriggerPayment: (task: Task) => void;
  onViewProof: (url: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onRefresh,
  onTriggerPayment,
  onViewProof,
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || []);
  const [error, setError] = useState('');

  const getStatusOptions = (type: string) => {
    switch (type) {
      case 'endorse':
        return [
          { value: 'draft', label: '📝 Draft (Brief & Pengerjaan)' },
          { value: 'waiting_payment', label: '⏳ Menunggu Pembayaran' },
          { value: 'paid', label: '✅ Sudah Dibayar (Lunas)' },
        ];
      case 'barter':
        return [
          { value: 'draft', label: '📝 Draft (Persiapan / Sample)' },
          { value: 'posting', label: '🚀 Posting (Konten Sudah Tayang)' },
        ];
      default:
        return [
          { value: 'draft', label: '📝 Draft (Dalam Pengerjaan)' },
          { value: 'completed', label: '✅ Selesai (Tugas Rampung)' },
        ];
    }
  };

  const handleToggleChecklist = async (itemId: number) => {
    try {
      const updated = await api.toggleChecklist(task.id, itemId);
      setChecklist(checklist.map((it) => (it.id === itemId ? { ...it, completed: updated.completed } : it)));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveStatus = async () => {
    setError('');
    if (task.type === 'endorse' && selectedStatus === 'paid') {
      // Trigger cascade payment confirmation modal
      onTriggerPayment(task);
      return;
    }

    setSavingStatus(true);
    try {
      await api.updateTaskStatus(task.id, selectedStatus);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status tugas');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    if (task.status === 'paid') {
      alert('Tugas yang sudah lunas terkunci dan tidak dapat dihapus');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus tugas "${task.title}"?`)) {
      try {
        await api.deleteTask(task.id);
        onRefresh();
        onClose();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus tugas');
      }
    }
  };

  const isPaid = task.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {task.type.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-slate-500">• {task.brand}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base line-clamp-1">{task.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* Block 1: Status Control & Trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Kontrol Status Tugas</span>
              {isPaid && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terkunci Lunas
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                disabled={isPaid}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {getStatusOptions(task.type).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {!isPaid && (
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {savingStatus ? '...' : 'Simpan Status'}
                </button>
              )}
            </div>

            {/* Paid Box Notification */}
            {isPaid && task.payment_proof_url && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">Pembayaran Telah Lunas Diterima</span>
                </div>
                <button
                  type="button"
                  onClick={() => onViewProof(task.payment_proof_url!)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                >
                  Lihat Bukti Bayar <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Block 2: Information Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Rincian Informasi</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Fee / Valuasi</span>
                <span className="font-bold text-slate-800 font-mono text-sm">
                  {task.type === 'other' ? 'Internal Studio' : formatIDR(task.fee_or_value)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Deadline</span>
                <span className="font-bold text-slate-800">{formatDateID(task.due_date)}</span>
              </div>
              {task.deliverable && (
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Deliverable Konten</span>
                  <span className="font-semibold text-slate-800">{task.deliverable}</span>
                </div>
              )}
              {task.platform && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Platform</span>
                  <span className="font-semibold text-slate-800">{task.platform}</span>
                </div>
              )}
              {task.shipment_number && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">No. Resi Pengiriman</span>
                  <span className="font-mono font-bold text-slate-800">{task.shipment_number}</span>
                </div>
              )}
              {task.pic_name && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Kontak PIC</span>
                  <span className="font-semibold text-slate-800">{task.pic_name} ({task.pic_phone || '-'})</span>
                </div>
              )}
            </div>

            {task.brief && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[11px] mb-1">Brief Pengerjaan</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{task.brief}</p>
              </div>
            )}
          </div>

          {/* Block 3: Interactive Checklist */}
          {checklist.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Checklist Pengerjaan Konten</h4>
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-indigo-300 bg-white flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-slate-300'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs font-medium flex-1 ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {!isPaid ? (
            <button
              type="button"
              onClick={handleDeleteTask}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Hapus Tugas
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Tugas terlindungi (Paid Lock)</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
