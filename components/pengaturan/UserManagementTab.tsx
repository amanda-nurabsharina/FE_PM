'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, Shield, Check, X, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';
import { UserItem, RoleItem } from '@/lib/types';
import AvatarUploader from './AvatarUploader';

const AVAILABLE_MENUS = [
  { slug: 'beranda', label: 'Beranda (Dashboard)' },
  { slug: 'tugas', label: 'Tugas & Deliverable' },
  { slug: 'laporan', label: 'Laporan & Rekap' },
  { slug: 'invoice', label: 'Invoice Penagihan' },
  { slug: 'keuangan', label: 'Pencatatan Keuangan' },
  { slug: 'pengaturan', label: 'Pengaturan & Profil' },
];

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedRole, setSelectedRole] = useState('STAFF');
  const [selectedMenus, setSelectedMenus] = useState<string[]>(['beranda', 'tugas']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setAvatarUrl('');
    setSelectedRole('STAFF');
    // Pre-select default menus for STAFF
    const staffRole = roles.find((r) => r.code === 'STAFF');
    setSelectedMenus(staffRole ? staffRole.menus : ['beranda', 'tugas']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave empty unless changing
    setAvatarUrl(user.avatar_url || '');
    setSelectedRole(user.role);
    setSelectedMenus(user.allowed_menus || []);
    setIsModalOpen(true);
  };

  const handleRoleChange = (roleCode: string) => {
    setSelectedRole(roleCode);
    if (roleCode === 'SUPER_ADMIN') {
      setSelectedMenus(['beranda', 'tugas', 'laporan', 'invoice', 'keuangan', 'pengaturan']);
    } else {
      const matched = roles.find((r) => r.code === roleCode);
      if (matched && matched.menus) {
        setSelectedMenus(matched.menus);
      }
    }
  };

  const handleToggleMenu = (slug: string) => {
    if (selectedRole === 'SUPER_ADMIN') {
      // Super admin always has all menus
      return;
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

    if (!name.trim() || !email.trim()) {
      setError('Nama dan email wajib diisi');
      setSubmitting(false);
      return;
    }

    if (!editingUser && !password.trim()) {
      setError('Password wajib diisi untuk pengguna baru');
      setSubmitting(false);
      return;
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name,
          email,
          password: password || undefined,
          avatar_url: avatarUrl,
          role: selectedRole,
          allowed_menus: selectedMenus,
        });
        setSuccess(`Pengguna ${name} berhasil diperbarui!`);
      } else {
        await api.createUser({
          name,
          email,
          password,
          avatar_url: avatarUrl,
          role: selectedRole,
          allowed_menus: selectedMenus,
        });
        setSuccess(`Pengguna baru ${name} berhasil ditambahkan!`);
      }

      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (user.role === 'SUPER_ADMIN' && !user.owner_id) {
      alert('Akun utama Super Admin tidak dapat dihapus.');
      return;
    }
    if (!confirm(`Hapus pengguna ${user.name} (${user.email})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      setSuccess(`Pengguna ${user.name} berhasil dihapus!`);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengguna');
    }
  };

  const getRoleBadgeClass = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FINANCE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'STAFF':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Manajemen Pengguna Studio</h3>
          <p className="text-xs text-slate-500 font-medium">
            Tambah anggota tim, atur foto profil, tentukan peran (role), dan batasi hak akses modul.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
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

      {/* Users Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-xs text-slate-400">Memuat daftar pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            Belum ada pengguna terdaftar.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((u) => {
              const isPrimaryOwner = u.role === 'SUPER_ADMIN' && !u.owner_id;
              const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-indigo-200 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{u.name}</h4>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getRoleBadgeClass(
                            u.role
                          )}`}
                        >
                          {u.role_name || u.role}
                        </span>
                        {isPrimaryOwner && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            Owner Utama
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {u.email}
                      </p>

                      {/* Allowed Menus Badges */}
                      <div className="flex items-center gap-1 flex-wrap mt-1.5">
                        <span className="text-[10px] text-slate-400 font-bold mr-0.5">Akses:</span>
                        {u.role === 'SUPER_ADMIN' ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Semua Menu (Akses Penuh)
                          </span>
                        ) : u.allowed_menus && u.allowed_menus.length > 0 ? (
                          u.allowed_menus.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200 capitalize"
                            >
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tidak ada menu</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      title="Edit Pengguna & Hak Akses"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {!isPrimaryOwner && (
                      <button
                        onClick={() => handleDelete(u)}
                        title="Hapus Pengguna"
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

      {/* Modal Create / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-10 flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingUser ? 'Edit Pengguna Studio' : 'Tambah Pengguna Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingUser ? 'Perbarui profil, password, dan hak akses menu' : 'Lengkapi data identitas & hak akses tim'}
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Photo Avatar Uploader */}
              <AvatarUploader
                value={avatarUrl}
                name={name || 'Pengguna'}
                onChange={(url) => setAvatarUrl(url)}
                label="Foto Profil Anggota Tim"
                sublabel="Format JPG/PNG/WEBP. Foto akan ditampilkan di header atas saat pengguna login."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sarah Anindita"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Pengguna *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@studio.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun *'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter...'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran / Role Pengguna</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.code;
                    return (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => handleRoleChange(r.code)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{r.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {r.description || 'Hak akses modular'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Menu Access Granular Checkboxes */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Hak Akses Modul / Menu</label>
                  {selectedRole === 'SUPER_ADMIN' && (
                    <span className="text-[10px] font-bold text-indigo-600">
                      Super Admin selalu memiliki akses semua menu
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_MENUS.map((menu) => {
                    const isChecked = selectedMenus.includes(menu.slug);
                    const isLocked = selectedRole === 'SUPER_ADMIN';

                    return (
                      <label
                        key={menu.slug}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50/50 border-indigo-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        } ${isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={isChecked}
                          onChange={() => handleToggleMenu(menu.slug)}
                          className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="font-bold text-xs">{menu.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
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
                  {submitting ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
