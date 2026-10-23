'use client';

import React, { useState } from 'react';
import { Upload, Trash2, Camera } from 'lucide-react';
import { api } from '@/lib/api-client';

interface AvatarUploaderProps {
  value?: string;
  name?: string;
  onChange: (url: string) => void;
  label?: string;
  sublabel?: string;
}

export default function AvatarUploader({
  value,
  name = 'User',
  onChange,
  label = 'Foto Profil (Avatar)',
  sublabel = 'Format JPG, PNG, atau WEBP (Maksimal 2 MB).',
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const res = await api.uploadFile(file);
        onChange(res.url);
      } catch (err: any) {
        alert(err.message || 'Gagal mengunggah foto profil');
      } finally {
        setUploading(false);
      }
    }
  };

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        {/* Avatar Circular Preview */}
        <div className="relative group shrink-0">
          {value ? (
            <img
              src={value}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-200">
              {initial}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={uploading}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Mengunggah...' : 'Unggah Foto Baru'}
              </button>
            </div>
          </div>
          <span className="block text-[11px] text-slate-400 mt-2 font-medium">
            {sublabel}
          </span>
        </div>
      </div>
    </div>
  );
}
