'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { api } from '@/lib/api-client';
import { RoleItem } from '@/lib/types';

const MENU_OPTIONS = [
  { slug: 'beranda', label: 'Beranda' },
  { slug: 'tugas', label: 'Tugas' },
  { slug: 'laporan', label: 'Laporan' },
  { slug: 'invoice', label: 'Invoice' },
  { slug: 'keuangan', label: 'Keuangan' },
  { slug: 'pengaturan', label: 'Pengaturan' },
];

export default function RoleManagementTab() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await api.getRoles();
      setRoles(data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat roles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setCode('');
    setName('');
    setDescription('');
    setSelectedMenus(['beranda', 'tugas']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setCode(role.code);
    setName(role.name);
    setDescription(role.description || '');
    setSelectedMenus(role.menus || []);
    setIsModalOpen(true);
  };

  const handleToggleMenu = (slug: string) => {
    if (editingRole && editingRole.code === 'SUPER_ADMIN') {
      return; // Super admin always has all
    }
    if (selectedMenus.includes(slug)) {
      setSelectedMenus(selectedMenus.filter((m) => m !== slug));
    } else {
      setSelectedMenus([...selectedMenus, slug]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!name.trim()) {
      setError('Nama role wajib diisi');
      setSubmitting(false);
      return;
    }

    if (!editingRole && !code.trim()) {
      setError('Kode role wajib diisi');
      setSubmitting(false);
      return;
    }

    if (selectedMenus.length === 0) {
      setError('Pilih minimal 1 hak akses menu');
      setSubmitting(false);
      return;
    }

    try {
      if (editingRole) {
        await api.updateRole(editingRole.id, {
          name,
          description,
          menus: selectedMenus,
        });
        setSuccess(`Role ${name} berhasil diperbarui!`);
      } else {
        await api.createRole({
          code,
          name,
          description,
          menus: selectedMenus,
        });
        setSuccess(`Role baru ${name} berhasil dibuat!`);
      }

      setIsModalOpen(false);
      loadRoles();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: RoleItem) => {
    if (role.is_system || role.code === 'SUPER_ADMIN') {
      alert('Role sistem bawaan tidak dapat dihapus.');
      return;
    }

    if (!confirm(`Hapus role "${role.name}"? Pengguna dengan role ini akan kehilangan akses bawaan.`)) {
      return;
    }

    try {
      await api.deleteRole(role.id);
      setSuccess(`Role ${role.name} berhasil dihapus!`);
      loadRoles();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus role');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Konfigurasi Peran (Role) & Akses Menu</h3>
          <p className="text-xs text-slate-500 font-medium">
            Tentukan hak akses modul untuk setiap peran tim (Super Admin, Finance, Staff, dll).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Role</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-bold shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Roles List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-xs text-slate-400">Memuat roles...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {roles.map((r) => {
              const isSuper = r.code === 'SUPER_ADMIN';

              return (
                <div
                  key={r.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center">
                        {r.code.substring(0, 2)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {r.code}
                      </span>
                      {r.is_system && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Sistem
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                        {r.description}
                      </p>
                    )}

                    {/* Menus Pill Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">Akses Menu:</span>
                      {isSuper ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Semua Menu (Akses Penuh Tanpa Batas)
                        </span>
                      ) : r.menus && r.menus.length > 0 ? (
                        r.menus.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 capitalize"
                          >
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tidak ada menu</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      title="Edit Hak Akses Menu"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {!r.is_system && !isSuper && (
                      <button
                        onClick={() => handleDelete(r)}
                        title="Hapus Role"
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Create / Edit Role */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingRole ? 'Edit Role & Hak Akses' : 'Tambah Role Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur izin menu yang dapat diakses peran ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Role (Huruf Besar) *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingRole}
                  placeholder="Contoh: TALENT_LEAD"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tampilan Role *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Talent & Content Creator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Tugas & cakupan akses peran ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Checkbox Menus */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-2">
                  Hak Akses Menu yang Diizinkan *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MENU_OPTIONS.map((opt) => {
                    const isChecked = selectedMenus.includes(opt.slug);
                    const isSuper = Boolean(editingRole && editingRole.code === 'SUPER_ADMIN');

                    return (
                      <label
                        key={opt.slug}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50/50 border-indigo-200 text-slate-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        } ${isSuper ? 'cursor-not-allowed opacity-90' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isSuper}
                          checked={isChecked}
                          onChange={() => handleToggleMenu(opt.slug)}
                          className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-xs">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
