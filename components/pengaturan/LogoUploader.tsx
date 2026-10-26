'use client';

import React, { useState } from 'react';
import { Upload, Trash2, Check, Image as ImageIcon } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            LOGO USAHA / CREATOR STUDIO (KOP KIRI ATAS INVOICE)
          </h3>
        </div>
        {logoUrl ? (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
            <Check className="w-3 h-3 text-emerald-600" /> Logo Aktif
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
            Belum Diatur
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Logo ini akan dicantumkan secara otomatis pada sudut <strong className="text-slate-700">kiri atas</strong> kop dokumen Invoice Tagihan dan format cetak PDF resmi.
      </p>

      {/* Main Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
        {/* Logo Preview Box */}
        <div className="w-36 h-20 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2 shrink-0 overflow-hidden">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Studio"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {initials}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative inline-block">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={uploading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Mengunggah...' : logoUrl ? 'Ganti Logo Brand' : 'Unggah Logo Brand'}
              </button>
            </div>

            {logoUrl && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3.5 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Logo
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            Direkomendasikan format PNG transparan atau SVG dengan rasio horizontal (2:1 atau 3:1).
          </p>
        </div>
      </div>
    </div>
  );
}
