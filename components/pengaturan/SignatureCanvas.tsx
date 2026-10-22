'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Check, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';

interface SignatureCanvasProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SignatureCanvas({ value, onChange }: SignatureCanvasProps) {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">Tanda Tangan Digital Resmi</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus TTD
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'draw'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" /> Gores di Kanvas
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File TTD
        </button>
      </div>

      {/* Mode: Draw on Touch Canvas */}
      {mode === 'draw' && (
        <div className="space-y-2">
          <div className="border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner flex justify-center">
            <canvas
              ref={canvasRef}
              width={380}
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
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Bersihkan
            </button>
            <button
              type="button"
              onClick={applyCanvas}
              disabled={!hasDrawn}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Terapkan Goresan
            </button>
          </div>
        </div>
      )}

      {/* Mode: Upload */}
      {mode === 'upload' && (
        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer relative bg-slate-50/60">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center py-2">
            <Upload className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-slate-700">
              {uploading ? 'Mengunggah...' : 'Pilih gambar tanda tangan (transparan disarankan)'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">PNG / JPG (Maks. 2 MB)</span>
          </div>
        </div>
      )}

      {/* Active Signature Preview */}
      {value && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pratinjau Tanda Tangan Aktif:
            </span>
            <img src={value} alt="Signature Preview" className="h-12 object-contain mt-1" />
          </div>
          <span className="text-xs font-bold text-emerald-600">✓ Siap Dicetak</span>
        </div>
      )}
    </div>
  );
}
