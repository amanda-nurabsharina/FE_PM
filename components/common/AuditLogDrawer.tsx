'use client';

import React, { useState, useEffect } from 'react';
import { X, History, Search, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AuditLog } from '@/lib/types';
import { formatDateID } from '@/lib/formatters';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditLogDrawer({ isOpen, onClose }: AuditLogDrawerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState('all');
  const [loading, setLoading] = useState(false);

  const modules = ['all', 'Tugas', 'Invoice', 'Keuangan', 'Setting'];

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, activeModule, search]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        module: activeModule,
        search,
        limit: 30,
      });
      setLogs(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border-t border-slate-200">
        {/* Top Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Riwayat Aktivitas & Audit Log</h3>
              <p className="text-xs text-slate-500">Jejak kronologis perubahan data sistem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Module Filters */}
        <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aktivitas, detail, atau nama aktor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {modules.map((m) => (
              <button
                key={m}
                onClick={() => setActiveModule(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeModule === m
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m === 'all' ? 'Semua Modul' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Memuat riwayat log...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">Tidak ada riwayat aktivitas ditemukan</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {log.module}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{log.title}</span>
                    </div>
                    {log.detail && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.detail}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                      <span>Oleh: <strong className="text-slate-600">{log.actor}</strong></span>
                      <span>•</span>
                      <span>{formatDateID(log.created_at)}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold text-slate-400 px-2 py-1 bg-slate-50 rounded-md border border-slate-100 shrink-0">
                  {log.action}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
