'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Check, Trash2, Feather, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api-client';

interface SignatureCanvasProps {
  value: string;
  onChange: (val: string) => void;
  ownerName?: string;
}

export default function SignatureCanvas({ value, onChange, ownerName = 'Reza Winata' }: SignatureCanvasProps) {
  const [mode, setMode] = useState<'upload' | 'draw'>('upload');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const applyCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const res = await api.uploadFile(file);
        onChange(res.url);
      } catch (err: any) {
        alert(err.message || 'Gagal mengunggah tanda tangan');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-indigo-600 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            TANDA TANGAN DIGITAL RESMI (KOLOM KANAN BAWAH INVOICE)
          </h3>
        </div>
        {value ? (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
            <Check className="w-3 h-3 text-emerald-600" /> TTD Aktif
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
            Belum Diatur
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Tanda tangan digital ini akan disematkan di kolom <strong className="text-slate-700">kanan bawah</strong> invoice resmi sebagai pengesahan dokumen tagihan profesional.
      </p>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Unggah File Gambar
        </button>
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            mode === 'draw'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" /> Coret Langsung di Layar (Canvas)
        </button>
      </div>

      {/* Mode: Upload */}
      {mode === 'upload' && (
        <div className="p-3 sm:p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative inline-block shrink-0">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={uploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Mengunggah...' : 'Pilih Berkas Tanda Tangan (PNG/JPG)'}
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Dianjurkan menggunakan gambar PNG berlatar transparan.
          </span>
        </div>
      )}

      {/* Mode: Draw on Touch Canvas */}
      {mode === 'draw' && (
        <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3">
          <div className="border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner flex justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="touch-none cursor-crosshair max-w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Bersihkan
            </button>
            <button
              type="button"
              onClick={applyCanvas}
              disabled={!hasDrawn}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Terapkan Goresan
            </button>
          </div>
        </div>
      )}

      {/* Active Signature Preview matching screenshot */}
      {value && (
        <div className="p-3 sm:p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-28 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0">
              <img src={value} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">
                {ownerName}
              </span>
              <span className="text-[11px] font-medium text-indigo-600 block mt-0.5">
                Tanda Tangan Terverifikasi untuk Invoice
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="self-end sm:self-auto px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus TTD
          </button>
        </div>
      )}
    </div>
  );
}
