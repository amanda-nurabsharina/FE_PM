'use client';

import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';

interface LogoUploaderProps {
  logoUrl?: string;
  companyName?: string;
  onChange: (url: string) => void;
}

export default function LogoUploader({
  logoUrl,
  companyName,
  onChange,
}: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const res = await api.uploadFile(file);
        onChange(res.url);
      } catch (err: any) {
        alert(err.message || 'Gagal mengunggah logo');
      } finally {
        setUploading(false);
      }
    }
  };

  const initials = companyName
    ? companyName.substring(0, 2).toUpperCase()
    : 'CT';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">Logo Studio Resmi (Kop Dokumen)</label>
        {logoUrl && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Logo
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        {/* Preview / Initials Fallback (BR-18) */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo Studio"
            className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 shadow-2xs"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-200">
            {initials}
          </div>
        )}

        <div className="flex-1">
          <div className="relative inline-block">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              type="button"
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              {uploading ? 'Mengunggah...' : 'Pilih Logo Baru'}
            </button>
          </div>
          <span className="block text-[11px] text-slate-400 mt-1.5 font-medium">
            Format PNG, JPG, WEBP (Maksimal 2 MB). Bila kosong, dokumen cetak memakai inisial "{initials}".
          </span>
        </div>
      </div>
    </div>
  );
}
