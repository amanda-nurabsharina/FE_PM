'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ExternalLink, ShieldCheck, Edit3, Lock, Save, RotateCcw, AlertCircle } from 'lucide-react';
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

  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || []);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Mode state (BR-22, FR-TGS-12)
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    brand: task.brand,
    type: task.type,
    fee_or_value: task.fee_or_value,
    due_date: task.due_date ? task.due_date.substring(0, 10) : '',
    deliverable: task.deliverable || '',
    platform: task.platform || 'Instagram',
    shipment_number: task.shipment_number || '',
    pic_name: task.pic_name || '',
    pic_phone: task.pic_phone || '',
    priority: task.priority || 'medium',
    brief: task.brief || '',
  });

  useEffect(() => {
    setCurrentTask(task);
    setSelectedStatus(task.status);
    setChecklist(task.checklist || []);
    setEditForm({
      title: task.title,
      brand: task.brand,
      type: task.type,
      fee_or_value: task.fee_or_value,
      due_date: task.due_date ? task.due_date.substring(0, 10) : '',
      deliverable: task.deliverable || '',
      platform: task.platform || 'Instagram',
      shipment_number: task.shipment_number || '',
      pic_name: task.pic_name || '',
      pic_phone: task.pic_phone || '',
      priority: task.priority || 'medium',
      brief: task.brief || '',
    });
    setIsEditing(false);
    setError('');
    setSuccessMsg('');
  }, [task]);

  const isPaid = currentTask.status === 'paid';
  const isPosting = currentTask.status === 'posting';
  const isLocked = isPaid || isPosting; // Ref SRS: BR-22, FR-TGS-12

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
      const updated = await api.toggleChecklist(currentTask.id, itemId);
      setChecklist(checklist.map((it) => (it.id === itemId ? { ...it, completed: updated.completed } : it)));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveStatus = async () => {
    setError('');
    setSuccessMsg('');
    if (currentTask.type === 'endorse' && selectedStatus === 'paid') {
      // Trigger cascade payment confirmation modal
      onTriggerPayment(currentTask);
      return;
    }

    setSavingStatus(true);
    try {
      await api.updateTaskStatus(currentTask.id, selectedStatus);
      setCurrentTask({ ...currentTask, status: selectedStatus as any });
      setSuccessMsg('Status tugas berhasil diperbarui');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status tugas');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (isLocked) {
      setError(`Tugas sudah ${isPaid ? 'lunas' : 'posting'} dan terkunci dari pengeditan (Ref SRS: BR-22)`);
      return;
    }
    if (!editForm.title.trim() || !editForm.brand.trim()) {
      setError('Judul tugas dan nama brand wajib diisi');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await api.updateTask(currentTask.id, {
        title: editForm.title.trim(),
        brand: editForm.brand.trim(),
        type: editForm.type,
        fee_or_value: Number(editForm.fee_or_value),
        due_date: editForm.due_date,
        deliverable: editForm.deliverable.trim(),
        platform: editForm.platform,
        shipment_number: editForm.shipment_number.trim(),
        pic_name: editForm.pic_name.trim(),
        pic_phone: editForm.pic_phone.trim(),
        priority: editForm.priority,
        brief: editForm.brief.trim(),
      });
      if (res?.data) {
        setCurrentTask(res.data);
      }
      setSuccessMsg('Rincian tugas berhasil diperbarui (BR-22)');
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan tugas');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTask = async () => {
    if (isPaid) {
      alert('Tugas yang sudah lunas terkunci dan tidak dapat dihapus');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus tugas "${currentTask.title}"?`)) {
      try {
        await api.deleteTask(currentTask.id);
        onRefresh();
        onClose();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus tugas');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {currentTask.type.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-slate-500">• {currentTask.brand}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base line-clamp-1">{currentTask.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Block 1: Status Control & Trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Kontrol Status Tugas</span>
              {isPaid ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terkunci Lunas
                </span>
              ) : isPosting ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  <Lock className="w-3.5 h-3.5" /> Terkunci Posting (BR-22)
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                disabled={isPaid}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {getStatusOptions(currentTask.type).map((opt) => (
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
            {isPaid && currentTask.payment_proof_url && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">Pembayaran Telah Lunas Diterima</span>
                </div>
                <button
                  type="button"
                  onClick={() => onViewProof(currentTask.payment_proof_url!)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                >
                  Lihat Bukti Bayar <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Block 2: Information Details & Edit Mode (BR-22, FR-TGS-12) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700">Rincian Informasi</h4>
              {isLocked ? (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-400" /> Terkunci ({isPaid ? 'Lunas' : 'Posting'} - BR-22)
                </span>
              ) : !isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Tugas
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Batal Edit
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Form (FR-TGS-12, BR-22) */
              <form onSubmit={handleSaveEdit} className="p-4 rounded-2xl bg-slate-50 border border-indigo-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Judul Tugas / Kampanye *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Brand / Klien *</label>
                    <input
                      type="text"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Fee / Valuasi (IDR)</label>
                    <input
                      type="number"
                      value={editForm.fee_or_value}
                      onChange={(e) => setEditForm({ ...editForm, fee_or_value: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Tanggal Deadline</label>
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Deliverable Konten (BR-06)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Reels + 3 Story"
                      value={editForm.deliverable}
                      onChange={(e) => setEditForm({ ...editForm, deliverable: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Platform</label>
                    <select
                      value={editForm.platform}
                      onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Twitter/X">Twitter/X</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Prioritas</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="high">🔴 Tinggi (High)</option>
                      <option value="medium">🟡 Sedang (Medium)</option>
                      <option value="low">🟢 Rendah (Low)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama PIC Brand</label>
                    <input
                      type="text"
                      value={editForm.pic_name}
                      onChange={(e) => setEditForm({ ...editForm, pic_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">No. WhatsApp PIC</label>
                    <input
                      type="text"
                      value={editForm.pic_phone}
                      onChange={(e) => setEditForm({ ...editForm, pic_phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">No. Resi Pengiriman</label>
                    <input
                      type="text"
                      value={editForm.shipment_number}
                      onChange={(e) => setEditForm({ ...editForm, shipment_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Brief Pengerjaan</label>
                    <textarea
                      rows={3}
                      value={editForm.brief}
                      onChange={(e) => setEditForm({ ...editForm, brief: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Fee / Valuasi</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {currentTask.type === 'other' ? 'Internal Studio' : formatIDR(currentTask.fee_or_value)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Deadline</span>
                  <span className="font-bold text-slate-800">{formatDateID(currentTask.due_date)}</span>
                </div>
                {currentTask.deliverable && (
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Deliverable Konten</span>
                    <span className="font-semibold text-slate-800">{currentTask.deliverable}</span>
                  </div>
                )}
                {currentTask.platform && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Platform</span>
                    <span className="font-semibold text-slate-800">{currentTask.platform}</span>
                  </div>
                )}
                {currentTask.shipment_number && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">No. Resi Pengiriman</span>
                    <span className="font-mono font-bold text-slate-800">{currentTask.shipment_number}</span>
                  </div>
                )}
                {currentTask.pic_name && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Kontak PIC</span>
                    <span className="font-semibold text-slate-800">{currentTask.pic_name} ({currentTask.pic_phone || '-'})</span>
                  </div>
                )}

                {currentTask.brief && (
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-400 block text-[11px] mb-1">Brief Pengerjaan</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{currentTask.brief}</p>
                  </div>
                )}
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
